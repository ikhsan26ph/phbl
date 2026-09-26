import { expect, test } from '@playwright/test';

/**
 * Modul: Akun Saya & pembatasan akses SUB USER admin — project "admin-sub"
 * (storageState .auth/admin-sub.json via setup).
 * Rule: docs/rules/administrator/15-akun-saya.md ("akun pusat ... hanya nama
 * dan email saja" — berlaku untuk admin utama, bukan sub user), 14-pengaturan-akun.md
 * (§ Sub User Admin).
 *
 * Kalibrasi ke halaman asli 2026-09-26 via playwright-cli (login form, akun
 * sub user admin "IK Sub Admin" / grup akses "Software QC - Training"):
 * - Login mendarat di /home/akunsaya, sama seperti admin utama. Halaman
 *   memuat Nama, Email, Nomor Whatsapp, Bagian Staff (label
 *   `<div>Label <span>:</span></div>` + nilai di div sebelahnya) — BEDA dari
 *   admin utama (yang Nomor Whatsapp & Bagian Staff-nya selalu "-" karena
 *   "akun pusat dari backend"): sub user admin punya Bagian Staff terisi
 *   ("Software QC - Training") karena memang bukan akun pusat. TANPA tombol
 *   Edit Akun Saya / Ubah Kata Sandi (sama dgn admin utama & sub user peran lain).
 * - Breadcrumb Beranda = link ke /lelang/listLelang (sama dengan admin utama;
 *   beda dari shipper-sub/transporter-sub yang ke carirute/listlelang).
 * - Akun ini punya HAK AKSES SANGAT LUAS (dipakai juga di
 *   tests/admin/pengaturan-akun-user.spec.ts sbg akun verifikasi defect #9):
 *   sidebar memuat hampir semua modul admin (Dashboard, Analitik, Pengajuan
 *   Lelang, Pengajuan Nego, Daftar Order, Penugasan Tracking, Cek Jadwal,
 *   Laporan, Validasi Akun, Setting, Master, Pengaturan Akun) DITAMBAH
 *   "Cari Penawaran" & seksi "MENU TRANSPORTER" > "Harga & Jadwal" — akses
 *   lintas-modul yang tidak dimiliki admin utama secara default. Test di
 *   bawah mendokumentasikan kondisi akun ini apa adanya (bukan menguji
 *   gating hak akses granular — itu domain tests/admin/pengaturan-akun*.spec.ts).
 * - Akses langsung /home/editakunsaya tetap DITOLAK meski hak akses menu
 *   sangat luas → redirect /home/akunsaya + alert DOM (role=alert)
 *   "Anda Tidak Memiliki Akses Ke Halaman Tersebut" (flash session, tampil
 *   sekali) — pola sama persis dengan shipper-sub & transporter-sub:
 *   self-edit akun selalu tertutup untuk SEMUA sub user, terlepas hak akses.
 */

const FIELD_SUB_USER = ['Nama', 'Email', 'Nomor Whatsapp', 'Bagian Staff'];

const alertAksesDitolak = (page: import('@playwright/test').Page) =>
  page.getByRole('alert').filter({ hasText: 'Anda Tidak Memiliki Akses Ke Halaman Tersebut' });

test('Akun Saya sub user admin menampilkan Nama, Email, Nomor Whatsapp, Bagian Staff tanpa tombol edit', async ({
  page,
}) => {
  await page.goto('/home/akunsaya');

  for (const label of FIELD_SUB_USER) {
    const baris = page.getByText(`${label} :`, { exact: true }).first().locator('..');
    await expect(baris).toHaveText(new RegExp(`${label}\\s*:\\s*\\S`));
  }
  await expect(
    page.getByText('Email :', { exact: true }).first().locator('..'),
  ).toContainText(process.env.ADMIN_SUB_EMAIL!);

  await expect(page.getByRole('link', { name: /Edit Akun Saya/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Ubah Kata Sandi/ })).toHaveCount(0);
});

test('breadcrumb Beranda mengarah ke listLelang (sama dengan admin utama)', async ({ page }) => {
  await page.goto('/home/akunsaya');
  await expect(page.getByRole('link', { name: 'Beranda' }).first()).toHaveAttribute(
    'href',
    /\/lelang\/listLelang$/i,
  );
});

test('menu sidebar mencakup modul admin luas milik akun ini (Cari Penawaran & Harga Jadwal lintas-modul)', async ({
  page,
}) => {
  await page.goto('/home/akunsaya');

  for (const nama of ['CARI PENAWARAN', 'PENGAJUAN LELANG', 'PENGAJUAN NEGO', 'DAFTAR ORDER', 'PENUGASAN TRACKING', 'CEK JADWAL', 'AKUN SAYA']) {
    await expect(page.getByRole('link', { name: nama }).first()).toBeVisible();
  }
  for (const teks of ['DASHBOARD', 'LAPORAN', 'VALIDASI AKUN', 'SETTING', 'MASTER', 'PENGATURAN AKUN', 'MENU TRANSPORTER']) {
    await expect(page.getByText(teks, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'HARGA & JADWAL' })).toBeVisible();
});

test('akses langsung Edit Akun Saya ditolak dan dikembalikan ke Akun Saya', async ({ page }) => {
  await page.goto('/home/editakunsaya');
  await expect(page).toHaveURL(/\/home\/akunsaya$/);
  await expect(alertAksesDitolak(page)).toBeVisible();
});
