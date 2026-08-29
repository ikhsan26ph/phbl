import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Preference Notifikasi — peran Bidder/Transporter akun utama
 * (project "transporter", storageState .auth/transporter.json).
 * Rule: docs/rules/bidder/12-preference-notifikasi.md (sub user: lihat
 * tests/transporter-sub/akun-saya.spec.ts — akses ditolak).
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login form):
 * - /home/preferencenotifbidder (menu PREFERENCE NOTIF) = ringkasan read-only:
 *   Nama Perusahaan, Tanggal Register, Tanggal Setting Terakhir, catatan
 *   "*) Preference notif digunakan hanya untuk akun utama", seksi NOTIFIKASI
 *   SISTEM ("*) Notif terkirim melalui push notifikasi") dan NOTIFIKASI EMAIL
 *   berisi daftar nama notif TANPA checkbox; link "Setting" (dobel
 *   desktop/mobile: href .../settingpreferencenotifbidder/66 dan tanpa id).
 * - /home/settingpreferencenotifbidder = halaman edit: dua .tab-pane
 *   (keduanya "show active" — bukan tab yang perlu diklik) berisi checkbox
 *   name="checkbox_preference_notif[]" berlabel; nama checkbox sama di kedua
 *   seksi → WAJIB scope ke pane (pola sama dgn spec shipper). Tombol
 *   Kembali, link Batal (/lelang/listlelang), tombol Simpan. Toggle murni
 *   client-side sampai Simpan — test TIDAK klik Simpan.
 * - Istilah UI: "Shipper"/"Transporter" untuk "Bid Owner"/"Bidder" di rule
 *   (Notif Validasi Perjanjian Shipper Diterima, Notif Shipper Request
 *   Jadwal, Notif Transporter Kalah Lelang) — pemetaan istilah proyek.
 *
 * Rule yang TIDAK dicakup: label "Tidak Aktif" pasca-simpan (mutasi
 * permanen preferensi akun demo), notifikasi nyata & nomor referensi
 * (butuh event lintas modul), default "Aktif" (state akun demo bisa
 * berubah — saat kalibrasi semua tercentang).
 */

const ringkasanUrl = '/home/preferencenotifbidder';
const settingUrl = '/home/settingpreferencenotifbidder';

/** Push notifikasi (rule: 8 item; "Bid Owner" → "Shipper" di UI). */
const NOTIF_SISTEM = [
  'Notif Perubahan Data Diterima',
  'Notif Perubahan Data Ditolak',
  'Notif Pengajuan Lelang',
  'Notif Lelang Dibatalkan',
  'Notif Pengajuan Nego',
  'Notif Request Update Harga',
  'Notif Validasi Perjanjian Shipper Diterima',
  'Notif Shipper Request Jadwal',
];

/** Email (rule: 8 item; "bidder kalah lelang" → "Transporter Kalah Lelang"). */
const NOTIF_EMAIL = [
  'Notif Perubahan Data Diterima',
  'Notif Perubahan Data Ditolak',
  'Notif Pengajuan Lelang',
  'Notif Lelang Dibatalkan',
  'Notif Pengajuan Nego',
  'Notif Request Update Harga',
  'Notif Transporter Kalah Lelang',
  'Notif Validasi Perjanjian Shipper Diterima',
];

const settingPage = {
  paneSistem: (page: Page) => page.locator('.tab-pane').filter({ hasText: 'NOTIFIKASI SISTEM' }),
  paneEmail: (page: Page) => page.locator('.tab-pane').filter({ hasText: 'NOTIFIKASI EMAIL' }),
  batal: (page: Page) => page.getByRole('link', { name: 'Batal' }),
  simpan: (page: Page) => page.getByRole('button', { name: /Simpan/ }),
};

test.describe('Ringkasan Preference Notif', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ringkasanUrl);
  });

  test('menampilkan info akun, catatan akun utama, dan link Setting', async ({ page }) => {
    await expect(page.getByText('Nama Perusahaan').first()).toBeVisible();
    await expect(page.getByText('Tanggal Register').first()).toBeVisible();
    await expect(page.getByText('Tanggal Setting Terakhir').first()).toBeVisible();
    await expect(page.getByText('*) Preference notif digunakan hanya untuk akun utama')).toBeVisible();

    const setting = page.getByRole('link', { name: /Setting/ });
    expect(await setting.count()).toBeGreaterThan(0);
    for (let i = 0; i < (await setting.count()); i++) {
      await expect(setting.nth(i)).toHaveAttribute('href', /\/home\/settingpreferencenotifbidder(\/\d+)?$/);
    }
  });

  test('daftar notifikasi sistem (push) dan email sesuai rule, tanpa checkbox', async ({ page }) => {
    await expect(page.getByText('*) Notif terkirim melalui push notifikasi')).toBeVisible();
    for (const nama of new Set([...NOTIF_SISTEM, ...NOTIF_EMAIL])) {
      await expect(page.getByText(nama, { exact: true }).first()).toBeVisible();
    }
    // Item khas tiap seksi tampil tepat sekali (bukan di kedua seksi).
    await expect(page.getByText('Notif Shipper Request Jadwal', { exact: true })).toHaveCount(1);
    await expect(page.getByText('Notif Transporter Kalah Lelang', { exact: true })).toHaveCount(1);
    await expect(page.getByRole('checkbox')).toHaveCount(0);
  });
});

test.describe('Setting Preference Notif', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(settingUrl);
  });

  test('seksi Notifikasi Sistem menampilkan 8 checkbox push notif sesuai rule', async ({ page }) => {
    const pane = settingPage.paneSistem(page);
    for (const label of NOTIF_SISTEM) {
      await expect(pane.getByRole('checkbox', { name: label })).toBeVisible();
    }
    await expect(pane.getByRole('checkbox')).toHaveCount(NOTIF_SISTEM.length);
  });

  test('seksi Notifikasi Email menampilkan 8 checkbox notif email sesuai rule', async ({ page }) => {
    const pane = settingPage.paneEmail(page);
    for (const label of NOTIF_EMAIL) {
      await expect(pane.getByRole('checkbox', { name: label })).toBeVisible();
    }
    await expect(pane.getByRole('checkbox')).toHaveCount(NOTIF_EMAIL.length);
  });

  test('checklist/uncheklist notif berubah murni di sisi klien (belum tersimpan)', async ({ page }) => {
    const checkbox = settingPage.paneSistem(page).getByRole('checkbox', { name: 'Notif Pengajuan Lelang' });
    const semulaChecked = await checkbox.isChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: !semulaChecked });

    // Kembalikan ke state semula — test ini tidak klik Simpan.
    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: semulaChecked });
  });

  test('tombol Batal kembali ke daftar pengajuan lelang tanpa menyimpan; Simpan tersedia', async ({ page }) => {
    await expect(settingPage.batal(page)).toHaveAttribute('href', /\/lelang\/listlelang$/);
    await expect(settingPage.simpan(page)).toBeVisible();
  });
});
