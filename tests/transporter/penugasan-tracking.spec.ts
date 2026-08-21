import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Penugasan Tracking — peran Bidder/Transporter (project "transporter")
 * Rule: docs/rules/bidder/09-penugasan-tracking.md (daftar + lihat data
 * tracking; read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-20 via playwright-cli (login form):
 * - URL /home/penugasantracking. Pola dua-baris per order seperti Daftar
 *   Order. Pasangan kolom: "ID Order/Tgl Permintaan Muat", "Nama Kapal/
 *   Jumlah Unit", "Pelabuhan Asal/ETD", "Pelabuhan Tujuan/ETA", "Shipper",
 *   "Action".
 * - Link "Download APK Tracking" → /assets/apk_baru/….apk.
 * - Status di baris tampil campuran huruf (badge Title Case + teks kapital)
 *   → filter pakai regex /…/i.
 * - Baris PROSES PENUGASAN (belum ditugaskan): satu link "Tracking" →
 *   /order/posisitracking/<hash>; TANPA menu Lihat Data Tracking (rule).
 * - Baris MENUNGGU PROSES (ditugaskan, belum dikerjakan): "Action Menu" →
 *   "Edit Penugasan" (→ posisitracking) + "Lihat Data Tracking"
 *   (→ /home/lihatdatatracking/<hash>).
 * - Baris tracking selesai (mis. DOKUMEN DIKIRIM): "Action Menu" →
 *   "Penugasan Selesai" (→ posisitracking) + "Lihat Data Tracking".
 * - Label "Kapal Connecting" tampil pada order berjadwal connecting
 *   (7 kemunculan saat kalibrasi).
 * - Halaman Lihat Data Tracking: breadcrumb "Beranda / Penugasan Tracking /
 *   Lihat Data Tracking", section DETAIL ORDER (Nomor Order, Nomor Lelang,
 *   Shipper); label bisa duplikat desktop/mobile → filter visible.
 *
 * Rule yang TIDAK dicakup (mutasi / butuh kondisi data / APK):
 * - Seluruh alur menugaskan/edit petugas & isi data tracking (mutasi +
 *   notifikasi WA), validasi field di form tracking.
 * - Keterangan "Tidak ada data tersedia" (butuh order MENUNGGU PROSES yang
 *   pasti; halaman yang terkalibrasi sudah punya data tracking).
 * - Popup detail kapal connecting, urutan data penugasan terbaru di atas,
 *   agregasi status multi-kontainer (butuh kontrol data).
 */

const listUrl = '/home/penugasantracking';

const listPage = {
  /**
   * Baris DATA berstatus tsb. Teks status (mis. "Menunggu Proses") juga
   * muncul sebagai status kontainer di sub-baris Info Tracking — wajib
   * disaring ke baris yang punya kontrol aksi agar tidak salah sasaran.
   */
  barisStatus: (page: Page, status: RegExp) =>
    page
      .locator('table tbody tr')
      .filter({ hasText: status })
      // :text-is (exact) — :has-text("Tracking") ikut mencocokkan link
      // "Info Tracking" di sub-baris sehingga salah baris.
      .filter({ has: page.locator('button:has-text("Action Menu"), a:text-is("Tracking")') }),
};

async function bukaHalaman(page: Page): Promise<void> {
  await page.goto(listUrl);
  await page
    .locator('table tbody tr')
    .filter({ hasText: /PROSES|KONTAINER|STUFFING|BERLAYAR|SANDAR|DOORING|AGEN|DIKIRIM/i })
    .first()
    .waitFor({ timeout: 15_000 })
    .catch(() => {});
}

test.describe('Daftar Penugasan Tracking (Bidder)', () => {
  test.beforeEach(async ({ page }) => {
    await bukaHalaman(page);
  });

  test('tombol Download APK Tracking tersedia dengan tautan berkas APK', async ({ page }) => {
    const tombol = page.getByRole('link', { name: 'Download APK Tracking' });
    await expect(tombol).toBeVisible();
    await expect(tombol).toHaveAttribute('href', /\/assets\/apk/);
  });

  test('tabel menampilkan pasangan kolom daftar penugasan', async ({ page }) => {
    for (const pasangan of [
      /^ID Order\s+Tgl Permintaan Muat/,
      /^Nama Kapal\s+Jumlah Unit/,
      /^Pelabuhan Asal\s+ETD/,
      /^Pelabuhan Tujuan\s+ETA/,
      /^Shipper/,
      /^Action/,
    ]) {
      await expect(page.getByRole('columnheader', { name: pasangan }).first()).toBeVisible();
    }
  });

  test('order belum ditugaskan berstatus Proses Penugasan dengan tombol Tracking', async ({ page }) => {
    const baris = listPage.barisStatus(page, /PROSES PENUGASAN/i);
    test.skip((await baris.count()) === 0, 'Tidak ada order berstatus Proses Penugasan pada akun demo');

    const tracking = baris.first().getByRole('link', { name: 'Tracking', exact: true });
    await expect(tracking).toBeVisible();
    // Atribut href RELATIF tanpa "/" (resolve benar berkat <base> halaman).
    await expect(tracking).toHaveAttribute('href', /(^|\/)order\/posisitracking\/.+$/);
  });

  test('order Menunggu Proses memiliki menu Edit Penugasan dan Lihat Data Tracking', async ({ page }) => {
    const baris = listPage.barisStatus(page, /MENUNGGU PROSES/i);
    test.skip((await baris.count()) === 0, 'Tidak ada order berstatus Menunggu Proses pada akun demo');

    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    const edit = baris.first().getByRole('link', { name: 'Edit Penugasan' });
    const lihat = baris.first().getByRole('link', { name: 'Lihat Data Tracking' });
    await expect(edit).toBeVisible();
    await expect(edit).toHaveAttribute('href', /(^|\/)order\/posisitracking\/.+$/);
    await expect(lihat).toBeVisible();
    await expect(lihat).toHaveAttribute('href', /(^|\/)home\/lihatdatatracking\/.+$/);
  });

  test('order selesai tracking memiliki menu Penugasan Selesai dan Lihat Data Tracking', async ({ page }) => {
    const baris = listPage.barisStatus(page, /DOKUMEN DIKIRIM/i);
    test.skip((await baris.count()) === 0, 'Tidak ada order berstatus Dokumen Dikirim pada akun demo');

    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    await expect(baris.first().getByRole('link', { name: 'Penugasan Selesai' })).toBeVisible();
    await expect(baris.first().getByRole('link', { name: 'Lihat Data Tracking' })).toBeVisible();
  });

  test('order berjadwal kapal connecting menampilkan label Kapal Connecting', async ({ page }) => {
    // Sebagian kemunculan label berada di elemen tersembunyi (popup/duplikat).
    const label = page.getByText(/Kapal Connecting/i).filter({ visible: true });
    test.skip((await label.count()) === 0, 'Tidak ada order berjadwal kapal connecting pada akun demo');
    await expect(label.first()).toBeVisible();
  });
});

test.describe('Lihat Data Tracking (Bidder)', () => {
  test('menampilkan breadcrumb dan detail order terkait', async ({ page }) => {
    await bukaHalaman(page);
    const baris = listPage.barisStatus(page, /MENUNGGU PROSES|DOKUMEN DIKIRIM/i);
    test.skip((await baris.count()) === 0, 'Tidak ada order yang sudah ditugaskan pada akun demo');

    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    await baris.first().getByRole('link', { name: 'Lihat Data Tracking' }).click();
    await expect(page).toHaveURL(/\/home\/lihatdatatracking\/.+$/);

    await expect(
      page.getByText(/Beranda\s*\/\s*Penugasan Tracking\s*\/\s*Lihat Data Tracking/),
    ).toBeVisible();
    await expect(page.getByText('Nomor Order').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('Nomor Lelang').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('Shipper').filter({ visible: true }).first()).toBeVisible();
  });
});
