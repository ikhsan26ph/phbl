import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Login (anon — tanpa storageState)
 * Rule: docs/rules/bid-owner/01-login.md, docs/rules/bidder/01-login.md,
 *       docs/rules/administrator/01-login.md
 *
 * Kalibrasi ke halaman asli 2026-08-12 via playwright-cli:
 * - Alert berupa NATIVE browser dialog (window.alert), bukan elemen DOM —
 *   ditangani lewat event 'dialog', bukan locator.
 * - Pesan aktual memakai Title Case ("Akun Belum Terdaftar",
 *   "Masukkan Kata Sandi Dengan Benar"); rule menulis sentence case.
 * - Bukti login: link "KELUAR" hanya dirender setelah autentikasi.
 *
 * Rule yang TIDAK dicakup di sini (butuh data/akses yang belum tersedia):
 * - Login via nomor WhatsApp (nomor WA akun tidak ada di .env)
 * - Data footer diambil dari setting general admin (verifikasi sumber data
 *   butuh akses halaman setting admin — modul lain)
 */

const loginPage = {
  email: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Email / No. Whatsapp' }),
  password: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Kata Sandi Anda' }),
  submit: (page: Page) => page.getByRole('button', { name: 'Masuk' }),
  /** Elemen yang hanya ada setelah autentikasi. */
  logoutLink: (page: Page) => page.getByRole('link', { name: 'KELUAR' }),
};

/** Klik Masuk sambil menangkap window.alert yang muncul; kembalikan pesannya. */
async function submitAndCaptureAlert(page: Page): Promise<string> {
  const dialogPromise = page.waitForEvent('dialog');
  await loginPage.submit(page).click();
  const dialog = await dialogPromise;
  const message = dialog.message();
  await dialog.dismiss();
  return message;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('email belum terdaftar memunculkan alert "Akun Belum Terdaftar"', async ({ page }) => {
  await loginPage.email(page).fill('tidakterdaftar.qa.tms@example.com');
  await loginPage.password(page).fill('sembarang123');
  const message = await submitAndCaptureAlert(page);
  expect(message).toBe('Akun Belum Terdaftar');
});

test('email terdaftar dengan kata sandi salah memunculkan alert "Masukkan Kata Sandi Dengan Benar"', async ({ page }) => {
  test.skip(!process.env.SHIPPER_EMAIL, 'SHIPPER_EMAIL kosong di .env');
  await loginPage.email(page).fill(process.env.SHIPPER_EMAIL!);
  await loginPage.password(page).fill('password-salah-000');
  const message = await submitAndCaptureAlert(page);
  expect(message).toBe('Masukkan Kata Sandi Dengan Benar');
});

test('shipper (Pemilik Barang) login sukses dan diarahkan ke Cari Penawaran', async ({ page }) => {
  test.skip(!process.env.SHIPPER_EMAIL || !process.env.SHIPPER_PASSWORD, 'Kredensial shipper kosong di .env');
  await loginPage.email(page).fill(process.env.SHIPPER_EMAIL!);
  await loginPage.password(page).fill(process.env.SHIPPER_PASSWORD!);
  await loginPage.submit(page).click();
  // Rule bid-owner/07: halaman cari penawaran ialah halaman default bid owner.
  await expect(page).toHaveURL(/\/lelang\/carirute/, { timeout: 15_000 });
  await expect(loginPage.logoutLink(page)).toBeVisible();
});

test('transporter (Ekspedisi) login sukses', async ({ page }) => {
  test.skip(!process.env.TRANSPORTER_EMAIL || !process.env.TRANSPORTER_PASSWORD, 'Kredensial transporter kosong di .env');
  await loginPage.email(page).fill(process.env.TRANSPORTER_EMAIL!);
  await loginPage.password(page).fill(process.env.TRANSPORTER_PASSWORD!);
  await loginPage.submit(page).click();
  await expect(loginPage.logoutLink(page)).toBeVisible({ timeout: 15_000 });
});

test('admin login sukses dan diarahkan ke halaman daftar pengajuan lelang', async ({ page }) => {
  test.skip(!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD, 'Kredensial admin kosong di .env');
  await loginPage.email(page).fill(process.env.ADMIN_EMAIL!);
  await loginPage.password(page).fill(process.env.ADMIN_PASSWORD!);
  await loginPage.submit(page).click();
  // Rule administrator/01: setelah login diarahkan menuju halaman daftar pengajuan lelang.
  await expect(page).toHaveURL(/\/lelang\/listlelang/, { timeout: 15_000 });
  await expect(loginPage.logoutLink(page)).toBeVisible();
});
