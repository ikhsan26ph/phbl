import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Registrasi (anon — tanpa storageState)
 * Rule: docs/rules/bid-owner/02-registrasi.md, docs/rules/bidder/02-registrasi.md
 *
 * Kalibrasi ke halaman asli 2026-08-13 via playwright-cli (rekalibrasi setelah
 * reCAPTCHA DIHILANGKAN dari form oleh tim developer — rule "captcha wajib
 * diisi" tidak berlaku lagi untuk lingkungan demo ini):
 * - Registrasi data valid bekerja end-to-end: redirect ke
 *   /user/registerconfirmemail/<id>, email aktivasi "[PH Bid Laut DEV]
 *   Registrasi Shipper" terkirim, klik "Aktifkan Akun" dari email →
 *   /user/registersuccess/<token> ("Registrasi Berhasil."), login akun baru →
 *   /home/continue_registration (Kelengkapan Registrasi).
 * - DEFECT: semua alert validasi TIDAK muncul (submit diam tanpa feedback):
 *   kata sandi hanya huruf, kata sandi <6 karakter, nomor WA duplikat.
 *   Didokumentasikan dengan test.fail() di bawah. Kandidat akar masalah:
 *   console error "ReferenceError: dete is not defined" (register:3098) yang
 *   mematahkan rantai JS client-side; form POST biasa tetap jalan.
 * - DEFECT: radio peran menampilkan "Shipper"/"Transporter", rule menuntut
 *   "Pemilik Barang"/"Ekspedisi" (test.fail() di bawah).
 * - Typo UI: tombol kirim ulang bertuliskan "Kirim Ulang Email Konfigurasi
 *   Registrasi" (harusnya "Konfirmasi"; rule menyebut "Kirim Ulang Notifikasi
 *   Registrasi").
 * - Field No. Telepon menyaring non-angka per karakter.
 */

const regPage = {
  radioShipper: (page: Page) => page.getByRole('radio', { name: 'Shipper' }),
  radioTransporter: (page: Page) => page.getByRole('radio', { name: 'Transporter' }),
  nama: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Nama Lengkap Anda' }),
  telp: (page: Page) => page.getByRole('textbox', { name: '08xxxxxxxxxx' }),
  perusahaan: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Nama Perusahaan Anda' }),
  email: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Email Anda' }),
  sandi: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Kata Sandi Anda' }),
  ulangSandi: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Ulang Kata Sandi Anda' }),
  submit: (page: Page) => page.getByRole('button', { name: 'Registrasi' }),
};

/** Nomor WA milik akun permanen qa-tms-reg1@yopmail.com (dibuat saat kalibrasi). */
const WA_SUDAH_TERDAFTAR = '089911224455';

async function isiFormShipper(
  page: Page,
  data: { nama: string; telp: string; email: string; sandi: string },
): Promise<void> {
  await regPage.radioShipper(page).check();
  await regPage.nama(page).fill(data.nama);
  await regPage.telp(page).fill(data.telp);
  await regPage.perusahaan(page).fill(`PT ${data.nama}`);
  await regPage.email(page).fill(data.email);
  await regPage.sandi(page).fill(data.sandi);
  await regPage.ulangSandi(page).fill(data.sandi);
}

/** Klik Registrasi dan tunggu window.alert; gagal (timeout) bila alert tidak muncul. */
async function submitDanTangkapAlert(page: Page): Promise<string> {
  const dialogPromise = page.waitForEvent('dialog', { timeout: 7_000 });
  await regPage.submit(page).click();
  const dialog = await dialogPromise;
  const message = dialog.message();
  await dialog.dismiss();
  return message;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/user/register');
});

test('radio peran menampilkan istilah "Pemilik Barang" dan "Ekspedisi"', async ({ page }) => {
  // DEFECT terdokumentasi: UI saat ini menampilkan "Shipper"/"Transporter".
  test.fail();
  await expect(page.getByRole('radio', { name: 'Pemilik Barang' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Ekspedisi' })).toBeVisible();
});

test('default radio peran tidak terpilih', async ({ page }) => {
  await expect(regPage.radioShipper(page)).not.toBeChecked();
  await expect(regPage.radioTransporter(page)).not.toBeChecked();
});

test('semua field registrasi dan tombol tampil', async ({ page }) => {
  await expect(regPage.nama(page)).toBeVisible();
  await expect(regPage.telp(page)).toBeVisible();
  await expect(regPage.perusahaan(page)).toBeVisible();
  await expect(regPage.email(page)).toBeVisible();
  await expect(regPage.sandi(page)).toBeVisible();
  await expect(regPage.ulangSandi(page)).toBeVisible();
  await expect(regPage.submit(page)).toBeVisible();
});

test('field no. telepon hanya menerima angka', async ({ page }) => {
  await regPage.telp(page).fill('08a9b9c112233');
  await expect(regPage.telp(page)).toHaveValue('0899112233');
  await regPage.telp(page).fill('');
  await regPage.telp(page).fill('abc-!@#xyz');
  await expect(regPage.telp(page)).toHaveValue('');
});

// ---------------------------------------------------------------------------
// DEFECT terdokumentasi (test.fail): rule menuntut alert validasi muncul saat
// klik Registrasi, tapi aplikasi diam tanpa feedback apa pun (kalibrasi
// 2026-08-13, setelah captcha dihilangkan). Bila developer memperbaikinya,
// runner menandai "passed unexpectedly" — sinyal menghapus marker test.fail.
// ---------------------------------------------------------------------------

test('kata sandi hanya huruf memunculkan alert "Kombinasi Hanya Boleh Huruf dan Angka"', async ({ page }) => {
  test.fail();
  await isiFormShipper(page, {
    nama: 'QA TMS Validasi',
    telp: '089900000001',
    email: 'qa-tms-validasi@yopmail.com',
    sandi: 'hanyahuruf',
  });
  const message = await submitDanTangkapAlert(page);
  expect(message).toBe('Kombinasi Hanya Boleh Huruf dan Angka');
});

test('kata sandi kurang dari 6 digit memunculkan alert "Kata Sandi Minimal 6 Digit"', async ({ page }) => {
  test.fail();
  await isiFormShipper(page, {
    nama: 'QA TMS Validasi',
    telp: '089900000002',
    email: 'qa-tms-validasi@yopmail.com',
    sandi: 'ab1',
  });
  const message = await submitDanTangkapAlert(page);
  expect(message).toBe('Kata Sandi Minimal 6 Digit');
});

test('nomor whatsapp yang sudah terdaftar memunculkan alert "Nomor whatsapp sudah terdaftar di sistem"', async ({ page }) => {
  test.fail();
  await isiFormShipper(page, {
    nama: 'QA TMS Duplikat',
    telp: WA_SUDAH_TERDAFTAR,
    email: 'qa-tms-dup@yopmail.com',
    sandi: 'ValidSandi123',
  });
  const message = await submitDanTangkapAlert(page);
  expect(message).toBe('Nomor whatsapp sudah terdaftar di sistem');
});

test('registrasi sukses: email aktivasi diterima, akun aktif, login lanjut ke kelengkapan registrasi', async ({ page, context }) => {
  test.setTimeout(180_000);
  // Identitas unik per run agar email & WA tidak bentrok dengan run sebelumnya.
  const stamp = Date.now().toString().slice(-9);
  const inboxName = `qa-tms-reg-${stamp}`;
  const email = `${inboxName}@yopmail.com`;
  const sandi = 'ValidSandi123';

  await isiFormShipper(page, { nama: 'QA TMS Registrasi', telp: `0899${stamp}`, email, sandi });
  await regPage.submit(page).click();

  // Rule: setelah klik Registrasi, diarahkan ke konfirmasi email + tombol kirim ulang.
  await page.waitForURL(/\/user\/registerconfirmemail\//, { timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'KONFIRMASI EMAIL' })).toBeVisible();
  // Teks aktual tombol (typo "Konfigurasi" — sudah dilaporkan sebagai defect).
  await expect(page.getByRole('button', { name: 'Kirim Ulang Email Konfigurasi Registrasi' })).toBeVisible();

  // Buka inbox yopmail, tunggu email aktivasi "[PH Bid Laut DEV] Registrasi Shipper".
  const mailPage = await context.newPage();
  await mailPage.goto('https://yopmail.com/en/');
  await mailPage.locator('#login').fill(inboxName);
  await mailPage.keyboard.press('Enter');
  await mailPage.waitForURL(/\/wm/);
  const barisEmail = mailPage
    .frameLocator('#ifinbox')
    .locator('button.lm')
    .filter({ hasText: 'Registrasi Shipper' })
    .first();
  await expect(async () => {
    await mailPage.locator('#refresh').click();
    await expect(barisEmail).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 90_000, intervals: [4_000] });
  await barisEmail.click();

  // Klik "Aktifkan Akun" DARI DALAM email (link tracking Mailjet menolak akses
  // langsung tanpa konteks email — terverifikasi saat kalibrasi). Membuka tab baru.
  const [halamanAktivasi] = await Promise.all([
    context.waitForEvent('page'),
    mailPage.frameLocator('#ifmail').getByRole('link', { name: 'Aktifkan Akun' }).click(),
  ]);
  await halamanAktivasi.waitForURL(/\/user\/registersuccess\//, { timeout: 30_000 });
  await expect(halamanAktivasi.getByRole('heading', { name: 'Registrasi Berhasil.' })).toBeVisible();
  await mailPage.close();

  // Rule: setelah aktivasi, login akun baru lanjut mengisi kelengkapan registrasi.
  await halamanAktivasi.getByRole('button', { name: 'Menuju Halaman Login' }).click();
  await halamanAktivasi.getByRole('textbox', { name: 'Masukkan Email / No. Whatsapp' }).fill(email);
  await halamanAktivasi.getByRole('textbox', { name: 'Masukkan Kata Sandi Anda' }).fill(sandi);
  await halamanAktivasi.getByRole('button', { name: 'Masuk' }).click();
  await halamanAktivasi.waitForURL(/\/home\/continue_registration/, { timeout: 20_000 });
});
