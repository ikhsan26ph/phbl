import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Cari Penawaran — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/07-cari-penawaran.md (bagian utama + Pop Up
 * Daftar Lelang Yang Ada)
 *
 * Kalibrasi ke halaman asli 2026-08-13 via playwright-cli:
 * - /lelang/carirute adalah halaman default shipper setelah login.
 * - "Beranda" pada breadcrumb dirender sebagai teks polos (bukan <a>) —
 *   itulah wujud "disable" pada rule.
 * - Pesan nomor tidak ditemukan berupa elemen DOM role=alert dengan teks
 *   "Nomor Lelang Tidak Ditemukan" (Title Case; rule menulis sentence case —
 *   konsisten dengan pola alert lain di aplikasi ini).
 * - Ikon pembuka popup daftar lelang tidak punya accessible name; satu-satunya
 *   locator stabil adalah CSS id #list_lelang (sudah dilaporkan sebagai usulan
 *   aria-label/data-testid ke tim developer).
 *
 * Rule yang TIDAK dicakup di sini (butuh kondisi data spesifik / aksi mutasi):
 * - Lelang dibatalkan tidak muncul di popup (butuh membatalkan lelang = mutasi)
 * - Sub-modul Harga Penawaran, Nego, Request Jadwal, Isi Data Pesanan, dst.
 *
 * Catatan 2026-08-14: popup mengurutkan lelang terbaru di atas. Lelang hasil
 * tests/shipper/buat-lelang.spec.ts (prefix nomor "AUTOTEST/...", tanggal
 * buka lelang sengaja di masa depan demi keamanan) jadi baris teratas dan
 * belum "dibuka" — memilihnya menampilkan pesan "belum melewati batas tutup
 * lelang", bukan ringkasan lengkap. "Pilih lelang pertama" karenanya
 * MENGECUALIKAN baris berprefix AUTOTEST agar tetap memilih lelang demo asli
 * yang sudah aktif.
 */

const cariPage = {
  nomorLelang: (page: Page) => page.getByRole('textbox', { name: 'Nomor Lelang *' }),
  ikonDaftarLelang: (page: Page) => page.locator('#list_lelang'),
  tombolPilih: (page: Page) => page.getByRole('button', { name: 'Pilih' }),
  cariButton: (page: Page) => page.getByRole('button', { name: 'Cari Harga Penawaran' }),
  alertTidakDitemukan: (page: Page) => page.getByText('× Nomor Lelang Tidak Ditemukan'),
  popupHeading: (page: Page) => page.getByRole('heading', { name: 'DAFTAR LELANG YANG ADA' }),
  barisLelangAktif: (page: Page) =>
    page
      .getByRole('dialog')
      .getByRole('row')
      .filter({ has: page.getByRole('button', { name: 'Pilih' }) })
      .filter({ hasNotText: 'AUTOTEST' }),
  pilihPertama: (page: Page) =>
    cariPage
      .barisLelangAktif(page)
      .first()
      .getByRole('button', { name: 'Pilih' }),
};

test.beforeEach(async ({ page }) => {
  await page.goto('/lelang/carirute');
});

test('breadcrumb Beranda disable (bukan link) karena halaman default bid owner', async ({ page }) => {
  await expect(page.getByText('Beranda / Cari Penawaran Lelang')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Beranda' })).toHaveCount(0);
});

test('tombol Cari Harga Penawaran default disable, aktif setelah nomor lelang diisi', async ({ page }) => {
  await expect(cariPage.cariButton(page)).toBeDisabled();
  await cariPage.nomorLelang(page).fill('NOMOR-APAPUN');
  await expect(cariPage.cariButton(page)).toBeEnabled();
});

test('nomor lelang tidak dikenal memunculkan alert "Nomor Lelang Tidak Ditemukan"', async ({ page }) => {
  await cariPage.nomorLelang(page).fill('NOMORTIDAKADA123');
  await cariPage.cariButton(page).click();
  await expect(cariPage.alertTidakDitemukan(page)).toBeVisible();
});

test('popup daftar lelang menampilkan tabel lelang dengan rute pelabuhan asal - tujuan', async ({ page }) => {
  await cariPage.ikonDaftarLelang(page).click();
  await expect(cariPage.popupHeading(page)).toBeVisible();
  for (const kolom of ['Nomor Lelang', 'Rute', 'Buka Lelang', 'Tutup Lelang', 'Aksi']) {
    await expect(page.getByRole('columnheader', { name: kolom })).toBeVisible();
  }
  // Baris tabel dimuat async — tunggu baris pertama sebelum menghitung.
  await cariPage.tombolPilih(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  const jumlahLelang = await cariPage.tombolPilih(page).count();
  test.skip(jumlahLelang === 0, 'Tidak ada data lelang di akun demo — isi popup tidak bisa diverifikasi');
  // Rule: rute yang tampil ialah pelabuhan asal – pelabuhan tujuan.
  // Scope ke dialog (ada tabel lain di halaman) dan filter baris yang punya
  // tombol Pilih — tbody menyisipkan satu baris kosong sebelum baris data.
  const barisPertama = page
    .getByRole('dialog')
    .getByRole('row')
    .filter({ has: page.getByRole('button', { name: 'Pilih' }) })
    .first();
  await expect(barisPertama.getByRole('cell').nth(2)).toHaveText(/.+ - .+/);
});

test('pilih lelang dari popup mengisi nomor otomatis dan pencarian menampilkan ringkasan lengkap', async ({ page }) => {
  await cariPage.ikonDaftarLelang(page).click();
  await expect(cariPage.popupHeading(page)).toBeVisible();
  await cariPage.tombolPilih(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  const jumlahLelangAktif = await cariPage.barisLelangAktif(page).count();
  test.skip(
    jumlahLelangAktif === 0,
    'Tidak ada data lelang aktif (non-AUTOTEST) di akun demo — alur pilih & cari tidak bisa diverifikasi',
  );

  await cariPage.pilihPertama(page).click();
  await expect(cariPage.nomorLelang(page)).not.toHaveValue('');
  await cariPage.cariButton(page).click();

  // Rule: ringkasan lelang berisi informasi data lelang, syarat & ketentuan,
  // informasi rute pengiriman, informasi kontainer & harga penawaran.
  await expect(page.getByText('RINGKASAN LELANG')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'SYARAT & KETENTUAN' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'RUTE PENGIRIMAN' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'INFORMASI KONTAINER' })).toBeVisible();
  await expect(page.locator('#panel_hasil_penawaran')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request Jadwal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request Harga' })).toBeVisible();
});
