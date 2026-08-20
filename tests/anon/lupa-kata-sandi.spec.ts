import { expect, test, type BrowserContext, type Page } from '@playwright/test';

/**
 * Modul: Lupa Kata Sandi (anon — tanpa storageState)
 * Rule: docs/rules/bid-owner/03-lupa-kata-sandi.md, docs/rules/bidder/03-lupa-kata-sandi.md
 *
 * Kalibrasi ke halaman asli 2026-08-13 via playwright-cli:
 * - Tidak ada captcha di halaman ini — alur kode verifikasi bisa diotomasi penuh.
 * - Alert berupa native window.alert (event 'dialog').
 * - Tombol Konfirmasi kode HANYA aktif jika kode diketik per karakter
 *   (pressSequentially) — fill() tidak memicu enable.
 * - Alur penuh memakai akun sub berdomain yopmail (inbox dibaca via yopmail.com,
 *   selector pihak-ketiga: #login, #refresh, iframe #ifinbox, #ifmail, baris
 *   email button.lm). Kata sandi baru diisi SAMA dengan kata sandi lama agar
 *   kredensial .env tetap valid.
 * - Terverifikasi manual saat kalibrasi (tidak diotomasi karena butuh tunggu
 *   >5 menit): kode kadaluarsa memunculkan alert "Kode verifikasi kadaluarsa"
 *   (persis sesuai rule) dan countdown "Kirim ulang kode" dimulai dari 5 menit.
 * - DEFECT (kalibrasi): di halaman kata sandi baru, submit kata sandi hanya-huruf
 *   ataupun <6 karakter TIDAK memunculkan alert/feedback apa pun — melanggar rule
 *   "minimal 6 digit kombinasi huruf dan angka". Tidak dibuat failing-test karena
 *   tiap percobaan menghabiskan satu siklus kode verifikasi.
 */

const fpPage = {
  input: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Email / No. Whatsapp' }),
  kirim: (page: Page) => page.getByRole('button', { name: 'Kirimkan' }),
  kodeInput: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Kode Verifikasi' }),
  konfirmasi: (page: Page) => page.getByRole('button', { name: 'Konfirmasi' }),
  sandiBaru: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Kata Sandi Baru' }),
  ulangSandiBaru: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Ulang Kata Sandi Baru' }),
};

/** Baca kode 6 digit dari email teratas inbox yopmail; null jika inbox kosong. */
async function readTopYopmailCode(mailPage: Page, inboxName: string): Promise<string | null> {
  await mailPage.goto('https://yopmail.com/en/');
  await mailPage.locator('#login').fill(inboxName);
  await mailPage.keyboard.press('Enter');
  await mailPage.waitForURL(/\/wm/);
  const firstRow = mailPage.frameLocator('#ifinbox').locator('button.lm').first();
  if ((await firstRow.count()) === 0) return null;
  await firstRow.click();
  const body = await mailPage.frameLocator('#ifmail').locator('body').innerText();
  return body.match(/\b(\d{6})\b/)?.[1] ?? null;
}

/** Refresh inbox sampai muncul kode BARU (berbeda dari kode sebelumnya). */
async function waitForNewCode(mailPage: Page, inboxName: string, previousCode: string | null): Promise<string> {
  let code: string | null = null;
  await expect
    .poll(async () => {
      await mailPage.locator('#refresh').click();
      const firstRow = mailPage.frameLocator('#ifinbox').locator('button.lm').first();
      if ((await firstRow.count()) === 0) return null;
      await firstRow.click();
      const body = await mailPage.frameLocator('#ifmail').locator('body').innerText();
      code = body.match(/\b(\d{6})\b/)?.[1] ?? null;
      return code && code !== previousCode ? code : null;
    }, { timeout: 60_000, intervals: [3_000] })
    .not.toBeNull();
  return code!;
}

test('email belum terdaftar memunculkan alert "Akun Belum Terdaftar"', async ({ page }) => {
  await page.goto('/user/forgotpassword');
  await fpPage.input(page).fill('tidakterdaftar.qa.tms@example.com');
  const dialogPromise = page.waitForEvent('dialog');
  await fpPage.kirim(page).click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toBe('Akun Belum Terdaftar');
  await dialog.dismiss();
});

test('alur penuh: kode via email valid, diarahkan ke kata sandi baru, sandi berhasil diubah', async ({ page, context }) => {
  const email = process.env.SHIPPER_SUB_EMAIL;
  const password = process.env.SHIPPER_SUB_PASSWORD;
  test.skip(!email || !password, 'Kredensial shipper-sub kosong di .env');
  test.skip(!email!.endsWith('@yopmail.com'), 'Alur penuh butuh akun berdomain yopmail agar inbox bisa dibaca');
  test.setTimeout(180_000);
  const inboxName = email!.split('@')[0];

  // Kode lama di inbox (bila ada) — pembanding agar tidak memakai kode basi.
  const mailPage = await context.newPage();
  const previousCode = await readTopYopmailCode(mailPage, inboxName);

  await page.goto('/user/forgotpassword');
  await fpPage.input(page).fill(email!);
  await fpPage.kirim(page).click();

  // Rule: notifikasi dikirim ke email yang diinputkan.
  await expect(page.getByRole('heading', { name: 'Verifikasi Kepemilikan Akun' })).toBeVisible();
  await expect(page.getByText(email!)).toBeVisible();
  await expect(fpPage.konfirmasi(page)).toBeDisabled();

  const code = await waitForNewCode(mailPage, inboxName, previousCode);
  await mailPage.close();

  // Kalibrasi: tombol Konfirmasi hanya aktif lewat ketikan per karakter.
  await fpPage.kodeInput(page).pressSequentially(code);
  await expect(fpPage.konfirmasi(page)).toBeEnabled();
  await fpPage.konfirmasi(page).click();

  // Rule: kode valid -> diarahkan ke halaman input kata sandi baru.
  await expect(page.getByText('Buat kata sandi barumu.')).toBeVisible();

  // Sandi baru = sandi lama, agar kredensial .env tetap valid.
  await fpPage.sandiBaru(page).click();
  await fpPage.sandiBaru(page).pressSequentially(password!);
  await fpPage.ulangSandiBaru(page).click();
  await fpPage.ulangSandiBaru(page).pressSequentially(password!);

  const dialogPromise = page.waitForEvent('dialog');
  await fpPage.konfirmasi(page).click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toBe('Password Berhasil Dirubah');
  await dialog.accept();

  // Setelah sukses diarahkan kembali ke halaman login.
  await page.waitForURL(/\/user\/login/, { timeout: 15_000 });
});

// Butuh menunggu >5 menit per kasus — tidak praktis untuk CI. Perilaku sudah
// diverifikasi manual saat kalibrasi (lihat header file).
test.fixme('kode kadaluarsa memunculkan alert "Kode verifikasi kadaluarsa"', async () => {});
test.fixme('kirim ulang kode baru bisa diklik setelah 5 menit', async () => {});
