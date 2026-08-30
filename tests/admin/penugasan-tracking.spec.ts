import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Penugasan Tracking — peran Administrator (project "admin",
 * storageState .auth/admin.json via project setup). Read-only: halaman
 * Tracking Pengiriman hanya DIBUKA, tidak ada penugasan yang disimpan.
 * Rule: docs/rules/administrator/08-penugasan-tracking.md.
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - /home/penugasantracking: tabel #tabel_daftar_order, header berpasangan
 *   "ID Order Tgl Permintaan Muat", "Nama Kapal Jumlah Unit", "Pelabuhan Asal
 *   ETD", "Pelabuhan Tujuan ETA", "Shipper", "Transporter", "Action" (admin
 *   punya Shipper DAN Transporter). Pola dua-baris per order + sub-baris Info
 *   Tracking (teks status kontainer "Menunggu Proses" ikut di sana → baris
 *   data disaring via kontrol aksi, :text-is bukan :has-text, sama dgn spec
 *   bidder). Link "Download APK Tracking" → /assets/apk_baru/….apk. Tombol
 *   filter "Filter 0" #btn_filter_ (ID Order, Shipper, Transporter, Tanggal
 *   Permintaan Muat, Pelabuhan, ETD/ETA, Status Tracking, Nama Kapal, Jenis/
 *   Nomor Kontainer, Jumlah).
 * - PROSES PENUGASAN → link "Tracking" (href RELATIF order/posisitracking/
 *   <hash>); MENUNGGU PROSES → "Action Menu": Edit Penugasan (posisitracking)
 *   + Lihat Data Tracking (/home/lihatdatatracking/<hash>); tracking selesai
 *   (mis. SJ DITERIMA AGEN) → Penugasan Selesai + Lihat Data Tracking.
 * - Tracking Pengiriman /order/posisitracking/<hash>: breadcrumb "Beranda /
 *   Penugasan Tracking / Tracking Pengiriman", "DETAIL ORDER" (Nomor Order,
 *   Nomor Lelang, Shipper, Rute, Transporter, Pelayaran, Kapal / Voy., ETD -
 *   ETA, Closing Time, Jenis Kontainer, Permintaan Muat, Jumlah Dipesan),
 *   seksi per tahap (STUFFING, KAPAL BERLAYAR, KAPAL SANDAR, RENCANA DOORING,
 *   DOORING, SJ DITERIMA AGEN — AMBIL KONTAINER tidak ada pada order uji)
 *   masing-masing select petugas #ptg<tahap> ("Pilih Petugas", opsi "Nama -
 *   WA" dari master petugas APK bidder), input WA #wa<tahap> (placeholder
 *   08xxxxxx), tombol Tugaskan #tgs<tahap>; "Lewati" (.lewati) HANYA di SJ
 *   DITERIMA AGEN; tombol Selesai #submitSelesaiPenugasan.
 * - Lihat Data Tracking: "DETAIL ORDER" + "DATA TRACKING"; belum dikerjakan →
 *   teks "Belum update tracking" (rule: "Tidak ada data tersedia" →
 *   test.fail); sudah → "<Tahap> (n/m) - dd/mm/yyyy" + link "DATA DETAIL".
 *
 * TIDAK dicakup (mutasi/APK): tugaskan/edit petugas, isi/edit data tracking,
 * urutan tahap & alert "Harap Selesaikan Tracking Sebelumnya", pembatasan
 * nomor kontainer, spreadsheet penarikan data, popup kapal connecting
 * (tidak ada label connecting di halaman pertama saat kalibrasi).
 */

const listUrl = '/home/penugasantracking';

const listPage = {
  barisStatus: (page: Page, status: RegExp) =>
    page
      .locator('#tabel_daftar_order tbody tr')
      .filter({ hasText: status })
      .filter({ has: page.locator('button:has-text("Action Menu"), a:text-is("Tracking")') }),
};

async function bukaHalaman(page: Page): Promise<void> {
  await page.goto(listUrl);
  await page
    .locator('#tabel_daftar_order tbody tr')
    .filter({ hasText: /PROSES|KONTAINER|STUFFING|BERLAYAR|SANDAR|DOORING|AGEN|DIKIRIM/i })
    .first()
    .waitFor({ timeout: 20_000 })
    .catch(() => {});
}

test.describe('Daftar Penugasan Tracking (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await bukaHalaman(page);
  });

  test('tombol Download APK Tracking tersedia dengan tautan berkas APK', async ({ page }) => {
    await expect(page.getByText(/Beranda\s*\/\s*Penugasan Tracking/)).toBeVisible();
    const tombol = page.getByRole('link', { name: 'Download APK Tracking' });
    await expect(tombol).toBeVisible();
    await expect(tombol).toHaveAttribute('href', /\/assets\/apk.*\.apk$/);
  });

  test('tabel menampilkan pasangan kolom termasuk Shipper dan Transporter, serta tombol filter', async ({ page }) => {
    for (const pasangan of [
      /^ID Order\s+Tgl Permintaan Muat/,
      /^Nama Kapal\s+Jumlah Unit/,
      /^Pelabuhan Asal\s+ETD/,
      /^Pelabuhan Tujuan\s+ETA/,
      /^Shipper/,
      /^Transporter/,
      /^Action/,
    ]) {
      await expect(page.getByRole('columnheader', { name: pasangan }).first()).toBeVisible();
    }
    await expect(page.locator('#btn_filter_')).toBeVisible();
  });

  test('order belum ditugaskan berstatus Proses Penugasan dengan tombol Tracking ke halaman tracking pengiriman', async ({ page }) => {
    const baris = listPage.barisStatus(page, /PROSES PENUGASAN/i);
    test.skip((await baris.count()) === 0, 'Tidak ada order Proses Penugasan pada demo');
    const tracking = baris.first().getByRole('link', { name: 'Tracking', exact: true });
    await expect(tracking).toBeVisible();
    await expect(tracking).toHaveAttribute('href', /(^|\/)order\/posisitracking\/.+$/);
    // Rule: belum ditugaskan → pilihan Lihat Data Tracking tidak muncul.
    await expect(baris.first().getByRole('link', { name: 'Lihat Data Tracking' })).toHaveCount(0);
  });

  test('order Menunggu Proses memiliki menu Edit Penugasan dan Lihat Data Tracking', async ({ page }) => {
    const baris = listPage.barisStatus(page, /MENUNGGU PROSES/i);
    test.skip((await baris.count()) === 0, 'Tidak ada order Menunggu Proses pada demo');
    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    const edit = baris.first().getByRole('link', { name: 'Edit Penugasan' });
    const lihat = baris.first().getByRole('link', { name: 'Lihat Data Tracking' });
    await expect(edit).toBeVisible();
    await expect(edit).toHaveAttribute('href', /(^|\/)order\/posisitracking\/.+$/);
    await expect(lihat).toBeVisible();
    await expect(lihat).toHaveAttribute('href', /(^|\/)home\/lihatdatatracking\/.+$/);
  });

  test('order yang sudah dikerjakan trackingnya berstatus tahap tracking dengan menu Penugasan Selesai', async ({ page }) => {
    const baris = listPage.barisStatus(page, /AMBIL KONTAINER|STUFFING|KAPAL BERLAYAR|KAPAL SANDAR|RENCANA DOORING|DOORING|SJ DITERIMA AGEN|DOKUMEN DIKIRIM/i)
      .filter({ has: page.getByRole('link', { name: 'Penugasan Selesai' }) });
    test.skip((await baris.count()) === 0, 'Tidak ada order yang sudah selesai ditugaskan pada demo');
    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    await expect(baris.first().getByRole('link', { name: 'Penugasan Selesai' })).toBeVisible();
    await expect(baris.first().getByRole('link', { name: 'Lihat Data Tracking' })).toBeVisible();
  });
});

test.describe('Tracking Pengiriman (Admin, dibuka tanpa menugaskan)', () => {
  test('halaman memuat detail order dan form petugas per tahap; Lewati tidak tersedia untuk kapal berlayar/sandar', async ({ page }) => {
    await bukaHalaman(page);
    const baris = listPage.barisStatus(page, /PROSES PENUGASAN/i);
    test.skip((await baris.count()) === 0, 'Tidak ada order Proses Penugasan pada demo');
    await baris.first().getByRole('link', { name: 'Tracking', exact: true }).click();
    await expect(page).toHaveURL(/\/order\/posisitracking\/.+$/);

    await expect(page.getByText(/Beranda\s*\/\s*Penugasan Tracking\s*\/\s*Tracking Pengiriman/)).toBeVisible();
    await expect(page.getByText('DETAIL ORDER')).toBeVisible();
    for (const label of ['Nomor Order', 'Nomor Lelang', 'Shipper', 'Rute', 'Transporter', 'Pelayaran', 'Kapal / Voy.', 'ETD - ETA', 'Closing Time', 'Jenis Kontainer', 'Permintaan Muat', 'Jumlah Dipesan']) {
      await expect(page.getByText(new RegExp(`^${label.replace(/[./]/g, '\\$&')}\\s*:?$`)).filter({ visible: true }).first()).toBeVisible();
    }
    // Rule: petugas dari master petugas APK bidder; kapal berlayar & sandar
    // wajib dikerjakan (tidak bisa dilewati).
    for (const tahap of ['berlayar', 'tiba']) {
      await expect(page.locator(`#ptg${tahap}`)).toBeVisible();
      await expect(page.locator(`#ptg${tahap} option`).first()).toHaveText('Pilih Petugas');
      await expect(page.locator(`#wa${tahap}`)).toHaveAttribute('placeholder', '08xxxxxx');
      await expect(page.locator(`#tgs${tahap}`)).toHaveText(/Tugaskan/);
      await expect(page.locator(`#tgs${tahap}`).locator('xpath=ancestor::div[contains(@class,"card") or contains(@class,"row")][1]').locator('.lewati')).toHaveCount(0);
    }
    // Judul seksi ditulis HURUF KECIL di DOM ("kapal berlayar") dan tampil
    // kapital lewat CSS text-transform (jebakan yang sama dgn heading lain,
    // lihat CLAUDE.md) — plus jadi "DETAIL <tahap>" bila tahapnya sudah
    // punya data tracking. Cocokkan case-insensitive.
    await expect(page.getByText(/kapal berlayar/i).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/kapal sandar/i).filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator('.lewati').filter({ visible: true }).first()).toHaveText(/Lewati/);
    await expect(page.locator('#submitSelesaiPenugasan')).toHaveText(/Selesai/);
    await expect(page.getByRole('button', { name: 'Kembali' })).toBeVisible();
  });
});

test.describe('Lihat Data Tracking (Admin)', () => {
  async function bukaLihatData(page: Page, status: RegExp): Promise<boolean> {
    await bukaHalaman(page);
    const baris = listPage.barisStatus(page, status).filter({ has: page.getByRole('link', { name: 'Lihat Data Tracking' }) });
    if ((await baris.count()) === 0) return false;
    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    await baris.first().getByRole('link', { name: 'Lihat Data Tracking' }).click();
    await expect(page).toHaveURL(/\/home\/lihatdatatracking\/.+$/);
    return true;
  }

  test('menampilkan breadcrumb, detail order, dan bagian data tracking', async ({ page }) => {
    test.skip(!(await bukaLihatData(page, /MENUNGGU PROSES|KONTAINER|STUFFING|BERLAYAR|SANDAR|DOORING|AGEN|DIKIRIM/i)), 'Tidak ada order yang sudah ditugaskan pada demo');
    await expect(page.getByText(/Beranda\s*\/\s*Penugasan Tracking\s*\/\s*Lihat Data Tracking/)).toBeVisible();
    await expect(page.getByText('DETAIL ORDER')).toBeVisible();
    await expect(page.getByText('DATA TRACKING')).toBeVisible();
    for (const label of ['Nomor Order', 'Nomor Lelang', 'Shipper', 'Transporter']) {
      await expect(page.getByText(new RegExp(`^${label}\\s*:?$`)).filter({ visible: true }).first()).toBeVisible();
    }
  });

  test('order yang sudah dikerjakan menampilkan tahapan tracking dengan tautan Data Detail', async ({ page }) => {
    test.skip(!(await bukaLihatData(page, /KONTAINER|STUFFING|BERLAYAR|SANDAR|DOORING|AGEN|DIKIRIM/i)), 'Tidak ada order yang sudah dikerjakan trackingnya pada demo');
    await expect(page.getByText(/(Stuffing|Kapal Berlayar|Kapal Sandar|Rencana Dooring|Dooring|SJ Diterima Agen|Dokumen Dikirim)( \(\d+\/\d+\))? - \d{2}\/\d{2}\/\d{4}/).first()).toBeVisible();
    await expect(page.getByText('DATA DETAIL').first()).toBeVisible();
  });

  test('DISKREPANSI: order ditugaskan tapi belum dikerjakan seharusnya berketerangan "Tidak ada data tersedia"', async ({ page }) => {
    // UI menampilkan "Belum update tracking" (didokumentasikan via test.fail).
    test.fail();
    test.skip(!(await bukaLihatData(page, /MENUNGGU PROSES/i)), 'Tidak ada order Menunggu Proses pada demo');
    await expect(page.getByText('Belum update tracking')).toBeVisible();
    await expect(page.getByText('Tidak ada data tersedia')).toBeVisible();
  });
});
