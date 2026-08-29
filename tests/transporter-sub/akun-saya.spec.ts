import { expect, test } from '@playwright/test';

/**
 * Modul: Akun Saya & pembatasan akses SUB USER bidder — project
 * "transporter-sub" (storageState .auth/transporter-sub.json via setup).
 * Rule: docs/rules/bidder/04-akun-saya.md (bagian sub user),
 * 11-profil.md (akses sub user), 12-preference-notifikasi.md (hanya akun
 * utama yang bisa setting preference).
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login form, akun
 * sub user "Sub User Bidder" dengan hak akses menu operasional penuh):
 * - Login mendarat di /home/akunsaya. Halaman memuat HANYA Nama, Email,
 *   Nomor Whatsapp ("-" bila kosong), Bagian Staff — label div.am-flex-inline
 *   "<Label> :" + nilai di elemen sebelahnya; TANPA tombol Edit Akun Saya
 *   dan tanpa data perusahaan/NPWP/SIUP/rekening (beda dari akun utama).
 *   Tabel kendaraan tetap dirender (tidak diassert).
 * - Menu: Pengajuan Lelang, Harga & Jadwal, Pengajuan Nego, Daftar Order,
 *   Penugasan Tracking, Profil, Pengaturan Akun, Akun Saya — TANPA
 *   Preference Notif.
 * - Akses URL langsung: /home/editakunsaya → redirect /home/akunsaya;
 *   /home/preferencenotifbidder & /home/settingpreferencenotifbidder →
 *   redirect /lelang/listlelang; semuanya disertai alert DOM (role=alert,
 *   .alert_negatif) "× Anda Tidak Memiliki Akses Ke Halaman Tersebut"
 *   (flash session — tampil sekali). /home/myprofile TERBUKA (rule: sub user
 *   custom akses Daftar Pesanan/Nego/Harga & Jadwal mendapat halaman profil).
 *
 * Rule yang TIDAK dicakup: sub user yang HANYA punya akses notif email
 * (tidak ada akun demo dengan konfigurasi itu).
 */

const FIELD_SUB_USER = ['Nama', 'Email', 'Nomor Whatsapp', 'Bagian Staff'];

const alertAksesDitolak = (page: import('@playwright/test').Page) =>
  page.getByRole('alert').filter({ hasText: 'Anda Tidak Memiliki Akses Ke Halaman Tersebut' });

test('Akun Saya sub user hanya menampilkan Nama, Email, Nomor Whatsapp, Bagian Staff tanpa tombol edit', async ({
  page,
}) => {
  await page.goto('/home/akunsaya');

  for (const label of FIELD_SUB_USER) {
    const baris = page.getByText(`${label} :`, { exact: true }).first().locator('..');
    await expect(baris).toHaveText(new RegExp(`${label}\\s*:\\s*\\S`));
  }
  await expect(
    page.getByText('Email :', { exact: true }).first().locator('..'),
  ).toContainText(process.env.TRANSPORTER_SUB_EMAIL!);

  // Data akun utama tidak ditampilkan untuk sub user.
  for (const label of ['Nama Perusahaan', 'NPWP', 'SIUP', 'Nama Bank 1']) {
    await expect(page.getByText(new RegExp(`^\\s*${label}\\s*:`)).filter({ visible: true })).toHaveCount(0);
  }
  await expect(page.getByRole('link', { name: /Edit Akun Saya/ })).toHaveCount(0);
});

test('menu sub user tidak memuat Preference Notif', async ({ page }) => {
  await page.goto('/home/akunsaya');
  await expect(page.getByRole('link', { name: /akun saya/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /profil/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /preference notif/i })).toHaveCount(0);
});

test('akses langsung Edit Akun Saya ditolak dan dikembalikan ke Akun Saya', async ({ page }) => {
  await page.goto('/home/editakunsaya');
  await expect(page).toHaveURL(/\/home\/akunsaya$/);
  await expect(alertAksesDitolak(page)).toBeVisible();
});

for (const url of ['/home/preferencenotifbidder', '/home/settingpreferencenotifbidder']) {
  test(`akses langsung ${url} ditolak (preference notif hanya akun utama)`, async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveURL(/\/lelang\/listlelang/);
    await expect(alertAksesDitolak(page)).toBeVisible();
  });
}

test('halaman Profil terbuka untuk sub user berakses operasional', async ({ page }) => {
  await page.goto('/home/myprofile');
  await expect(page).toHaveURL(/\/home\/myprofile$/);
  await expect(alertAksesDitolak(page)).toHaveCount(0);
  await expect(page.getByText(/Bergabung Sejak\s+\d{2}\/\d{2}\/\d{4}/).first()).toBeVisible();
});
