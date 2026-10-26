import { expect, test } from '@playwright/test';

/**
 * PLACEHOLDER — project "admin-sub-read" (sub admin dengan hak akses
 * baca-saja; storageState .auth/<target>/admin-sub-read.json via setup).
 * Akun ini hanya ada di target local; spec lengkap menyusul setelah
 * kalibrasi ke halaman asli.
 *
 * Satu-satunya assertion: sesi login valid — link "KELUAR" (bukti login
 * pasca-autentikasi, sama dgn auth.setup) tampil di /home/akunsaya, halaman
 * pendaratan sub user admin.
 */

// Di-skip di level file (sebelum fixture context dibuat) bila kredensial
// kosong: login setup ikut di-skip sehingga file storageState tidak ada.
test.skip(
  !process.env.ADMIN_SUB_READ_EMAIL || !process.env.ADMIN_SUB_READ_PASSWORD,
  `Kredensial admin-sub-read kosong di .env — dilewati`,
);

test('sesi admin-sub-read valid — link KELUAR tampil', async ({ page }) => {
  await page.goto('/home/akunsaya');
  await expect(page.getByRole('link', { name: 'KELUAR' })).toBeVisible();
});
