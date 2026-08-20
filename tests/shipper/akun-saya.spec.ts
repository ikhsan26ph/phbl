import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Akun Saya — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/04-akun-saya.md
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - Breadcrumb "Beranda" di halaman Akun Saya adalah link aktif (berbeda
 *   dengan Cari Penawaran, halaman default bid owner, di mana Beranda
 *   disable) — mengarah ke /lelang/carirute sesuai rule "Beranda diarahkan
 *   ke halaman cari penawaran".
 * - Identitas (KTP/SIM) dan Logo Perusahaan: sel tabel berisi <a href="...">
 *   yang membungkus tombol "Download Gambar" — link diambil via
 *   cell.locator('a'), BUKAN getByRole('link').filter({has}), karena link
 *   tanpa accessible name tak lolos filter has-scoping ke ancestor
 *   (terverifikasi gagal 2026-08-14). NPWP & SIUP punya link teks biasa
 *   (nama file) tanpa tombol pembungkus.
 * - Halaman Edit Akun Saya (/home/editakunsaya) prefilled dari data akun;
 *   field Email selalu disabled (tidak ada di rule eksplisit, tapi konsisten
 *   dengan "email tidak bisa diubah" pada modul lain).
 *
 * Rule yang TIDAK dicakup di sini (butuh kondisi/mutasi data spesifik):
 * - Notif "Selamat datang di PHBID" (hanya muncul di first-login akun baru).
 * - Notif "Akun anda dinonaktifkan" + pembatasan akses (butuh akun nonaktif).
 * - Alert "Nomor whatsapp sudah terdaftar di sistem" (butuh submit edit
 *   dengan WA milik akun lain — mutasi data akun demo, berisiko).
 * - Alur konfirmasi admin (terima/tolak perubahan data) — lintas peran,
 *   butuh aksi dari akun admin.
 */

const akunSayaPage = {
  breadcrumbBeranda: (page: Page) => page.getByRole('link', { name: 'Beranda' }),
  editAkunSaya: (page: Page) => page.getByRole('link', { name: ' Edit Akun Saya' }),
  identitasCell: (page: Page) => page.getByRole('cell', { name: /Identitas \(KTP \/ SIM\)/ }),
  logoCell: (page: Page) => page.getByRole('cell', { name: /Logo Perusahaan/ }),
  linkNpwp: (page: Page) => page.getByRole('link', { name: 'npwp-v4.jpg' }),
  linkSiup: (page: Page) => page.getByRole('link', { name: 'SIUP-v4.png' }),
};

test.beforeEach(async ({ page }) => {
  await page.goto('/home/akunsaya');
});

test('breadcrumb Beranda pada Akun Saya mengarah ke halaman Cari Penawaran', async ({ page }) => {
  await expect(akunSayaPage.breadcrumbBeranda(page)).toBeVisible();
  await expect(akunSayaPage.breadcrumbBeranda(page)).toHaveAttribute('href', /\/lelang\/carirute$/);
});

test('identitas, logo perusahaan, NPWP, dan SIUP masing-masing punya link download ke file asli', async ({
  page,
}) => {
  const linkIdentitas = akunSayaPage.identitasCell(page).locator('a');
  await expect(linkIdentitas.getByRole('button', { name: 'Download Gambar' })).toBeVisible();
  await expect(linkIdentitas).toHaveAttribute('href', /\/assets\/ktp\/.+/);

  const linkLogo = akunSayaPage.logoCell(page).locator('a');
  await expect(linkLogo.getByRole('button', { name: 'Download Gambar' })).toBeVisible();
  await expect(linkLogo).toHaveAttribute('href', /\/assets\/photo\/.+/);

  await expect(akunSayaPage.linkNpwp(page)).toHaveAttribute('href', /\/assets\/npwp\/.+/);
  await expect(akunSayaPage.linkSiup(page)).toHaveAttribute('href', /\/assets\/siup\/.+/);
});

test('Edit Akun Saya membuka form terisi data akun dengan Email disabled', async ({ page }) => {
  await akunSayaPage.editAkunSaya(page).click();
  await expect(page).toHaveURL(/\/home\/editakunsaya$/);

  const email = page.getByRole('textbox', { name: 'Email Perusahaan' });
  await expect(email).toBeDisabled();
  await expect(email).not.toHaveValue('');

  await expect(page.getByRole('textbox', { name: 'Masukkan Nama Anda' })).not.toHaveValue('');
  await expect(page.getByRole('textbox', { name: 'Masukkan Nama Perusahaan' })).not.toHaveValue('');
  await expect(page.getByRole('button', { name: 'Batal' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' Simpan' })).toBeVisible();
});
