import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Preference Notif — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/13-preference-notif.md
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - /home/preferenceNotifBidowner adalah halaman ringkasan (read-only):
 *   info perusahaan, tanggal register, tanggal setting terakhir, dan daftar
 *   nama notif TANPA checkbox — tombol "Setting" membuka halaman edit.
 * - /home/settingPreferenceNotifBidowner adalah halaman edit: dua seksi
 *   "NOTIFIKASI SISTEM" dan "NOTIFIKASI EMAIL", masing-masing daftar
 *   checkbox. Kedua seksi dirender bersamaan di DOM (class .tab-pane
 *   "show active" pada keduanya — bukan tab yang perlu diklik), TAPI nama
 *   checkbox ada yang sama persis di kedua seksi (mis. "Notif Perubahan
 *   Data Diterima") — WAJIB scope ke .tab-pane yang tepat via filter
 *   hasText, karena getByRole('checkbox', {name}) tanpa scope akan
 *   ambigu (strict mode violation).
 * - Toggle checkbox murni client-side (tidak auto-save); baru tersimpan
 *   setelah klik "Simpan". Test di bawah SENGAJA tidak klik Simpan untuk
 *   menghindari mengubah preferensi akun demo secara permanen — checkbox
 *   yang di-uncheck untuk uji toggle dicentang kembali sebelum test selesai.
 *
 * Rule yang TIDAK dicakup di sini (butuh mutasi tersimpan / event nyata):
 * - Label "Tidak Aktif" pada halaman ringkasan setelah preferensi
 *   dinonaktifkan & disimpan (butuh submit Simpan yang mengubah data akun
 *   demo secara permanen).
 * - Isi & pemicu push notifikasi sungguhan (Nego Diterima, Update Stuffing,
 *   dst.) — butuh aksi lintas modul/peran yang memicu notifikasi nyata.
 * - Nomor referensi pada notifikasi email — butuh notifikasi nyata terkirim.
 */

const ringkasanUrl = '/home/preferenceNotifBidowner';
const settingUrl = '/home/settingPreferenceNotifBidowner';

const NOTIF_SISTEM = [
  'Notif Perubahan Data Diterima',
  'Notif Perubahan Data Ditolak',
  'Notif Nego Diterima',
  'Notif Nego Ditolak',
  'Notif Nego Dicounter',
  'Notif Perjanjian Pengiriman Diterima',
  'Notif Perjanjian Pengiriman Ditolak',
  'Notif Kelengkapan Data Unit',
  'Notif Perubahan Jadwal',
  'Notif Stuffing',
  'Notif Kapal Berlayar',
  'Notif Kapal Sandar',
  'Notif Rencana Dooring',
  'Notif Dooring',
  'Notif SJ Diterima Agen',
  'Notif Jadwal Tersedia',
];

const NOTIF_EMAIL = [
  'Notif Perubahan Data Diterima',
  'Notif Perubahan Data Ditolak',
  'Notif Perjanjian Pengiriman Diterima',
  'Notif Perjanjian Pengiriman Ditolak',
  'Notif Kelengkapan Data Unit',
  'Notif Perubahan Jadwal',
  'Notif Stuffing',
  'Notif Kapal Berlayar',
  'Notif Kapal Sandar',
  'Notif Rencana Dooring',
  'Notif Dooring',
  'Notif SJ Diterima Agen',
];

const settingPage = {
  paneSistem: (page: Page) => page.locator('.tab-pane').filter({ hasText: 'NOTIFIKASI SISTEM' }),
  paneEmail: (page: Page) => page.locator('.tab-pane').filter({ hasText: 'NOTIFIKASI EMAIL' }),
  batal: (page: Page) => page.getByRole('link', { name: 'Batal' }),
  simpan: (page: Page) => page.getByRole('button', { name: ' Simpan' }),
};

test('halaman ringkasan menampilkan info akun dan tombol Setting', async ({ page }) => {
  await page.goto(ringkasanUrl);
  // Label & value dirender via dua elemen bertumpuk (label + span) dengan
  // teks yang sama persis — .first() cukup untuk cek visibilitas.
  await expect(page.getByText('Nama Perusahaan').first()).toBeVisible();
  await expect(page.getByText('Tanggal Register').first()).toBeVisible();
  await expect(page.getByText('Tanggal Setting Terakhir').first()).toBeVisible();
  const setting = page.getByRole('link', { name: ' Setting' });
  await expect(setting).toHaveAttribute('href', /\/home\/settingPreferenceNotifBidowner$/);
});

test.describe('Setting Preference Notif', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(settingUrl);
  });

  test('seksi Notifikasi Sistem menampilkan seluruh daftar notif sesuai rule', async ({ page }) => {
    const pane = settingPage.paneSistem(page);
    for (const label of NOTIF_SISTEM) {
      await expect(pane.getByRole('checkbox', { name: label })).toBeVisible();
    }
  });

  test('seksi Notifikasi Email menampilkan seluruh daftar notif sesuai rule', async ({ page }) => {
    const pane = settingPage.paneEmail(page);
    for (const label of NOTIF_EMAIL) {
      await expect(pane.getByRole('checkbox', { name: label })).toBeVisible();
    }
  });

  test('checklist/uncheklist notif berubah murni di sisi klien (belum tersimpan)', async ({ page }) => {
    const checkbox = settingPage.paneSistem(page).getByRole('checkbox', { name: 'Notif Nego Diterima' });
    const semulaChecked = await checkbox.isChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: !semulaChecked });

    // Kembalikan ke state semula — test ini tidak klik Simpan, jadi
    // perubahan hanya perlu direset di DOM sebelum halaman ditinggalkan.
    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: semulaChecked });
  });

  test('tombol Batal kembali ke Daftar Order tanpa menyimpan perubahan', async ({ page }) => {
    await expect(settingPage.batal(page)).toHaveAttribute('href', /\/lelang\/listlelang$/);
    await expect(settingPage.simpan(page)).toBeVisible();
  });
});
