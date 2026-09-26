import { expect, test } from '@playwright/test';

/**
 * Modul: Akun Saya & pembatasan akses SUB USER bid owner — project
 * "shipper-sub" (storageState .auth/shipper-sub.json via setup).
 * Rule: docs/rules/bid-owner/04-akun-saya.md, 13-preference-notif.md (hanya
 * akun utama yang bisa setting preference), 14-pengaturan-akun.md
 * (§ Sub User Bid Owner, administrator).
 *
 * Kalibrasi ke halaman asli 2026-09-26 via playwright-cli (login form, akun
 * sub user bid owner "Jumadi" / Bagian Staff "Penjualan"):
 * - Login mendarat di /home/akunsaya. Halaman memuat HANYA Nama, Email,
 *   Nomor Whatsapp ("-" bila kosong), Bagian Staff — label
 *   `<div>Label <span>:</span></div>` + nilai di div sebelahnya; TANPA tombol
 *   Edit Akun Saya dan tanpa data perusahaan/NPWP/SIUP (beda dari akun utama
 *   shipper — sama persis dgn pola sub user bidder).
 * - Menu: Cari Penawaran, Dashboard, Pengajuan Lelang, Pengajuan Nego,
 *   Daftar Order, Master, Cek Jadwal, Laporan, Pengaturan Akun, Akun Saya —
 *   TANPA Preference Notif (rule bid-owner tidak punya modul "Profil"
 *   terpisah seperti bidder, jadi tidak ada menu itu di kedua akun).
 * - Breadcrumb Beranda = link ke /lelang/carirute (sesuai rule 04-akun-saya:
 *   "Di sisi bid owner, Beranda pada breadcrumb diarahkan ke halaman cari
 *   penawaran" — beda dari admin/admin-sub yang ke listLelang).
 * - Akses URL langsung: /home/editakunsaya → redirect /home/akunsaya;
 *   /home/preferenceNotifBidowner & /home/settingPreferenceNotifBidowner →
 *   redirect /lelang/carirute; semuanya disertai alert DOM (role=alert)
 *   "Anda Tidak Memiliki Akses Ke Halaman Tersebut" (flash session, tampil
 *   sekali) — pola identik dengan transporter-sub.
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
  ).toContainText(process.env.SHIPPER_SUB_EMAIL!);

  for (const label of ['Nama Perusahaan', 'NPWP', 'SIUP', 'Nama Bank 1']) {
    await expect(page.getByText(new RegExp(`^\\s*${label}\\s*:`)).filter({ visible: true })).toHaveCount(0);
  }
  await expect(page.getByRole('link', { name: /Edit Akun Saya/ })).toHaveCount(0);
});

test('breadcrumb Beranda mengarah ke Cari Penawaran (khusus sisi bid owner)', async ({ page }) => {
  await page.goto('/home/akunsaya');
  await expect(page.getByRole('link', { name: 'Beranda' }).first()).toHaveAttribute(
    'href',
    /\/lelang\/carirute$/i,
  );
});

test('menu sub user tidak memuat Preference Notif', async ({ page }) => {
  await page.goto('/home/akunsaya');
  await expect(page.getByRole('link', { name: /akun saya/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /pengajuan lelang/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /preference notif/i })).toHaveCount(0);
});

test('akses langsung Edit Akun Saya ditolak dan dikembalikan ke Akun Saya', async ({ page }) => {
  await page.goto('/home/editakunsaya');
  await expect(page).toHaveURL(/\/home\/akunsaya$/);
  await expect(alertAksesDitolak(page)).toBeVisible();
});

for (const url of ['/home/preferenceNotifBidowner', '/home/settingPreferenceNotifBidowner']) {
  test(`akses langsung ${url} ditolak (preference notif hanya akun utama)`, async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveURL(/\/lelang\/carirute/);
    await expect(alertAksesDitolak(page)).toBeVisible();
  });
}
