import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Pengajuan Nego — peran Bidder/Transporter (project "transporter")
 * Rule: docs/rules/bidder/07-pengajuan-nego.md (daftar + detail; read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-20 via playwright-cli (login form):
 * - URL /lelang/pengajuannego. Header kolom BERPASANGAN dua baris:
 *   "Shipper/Status Nego", "Pelayaran/Jenis", "Pelabuhan Asal/ETD",
 *   "Pelabuhan Tujuan/ETA", "Nego Harga/Harga Awal", "Harga Baru/Jumlah
 *   Nego", "Aksi".
 * - Status nego tampil sebagai badge: WAITING / DITERIMA / DITOLAK /
 *   NEGOSIASI (rule menulis 'Waiting' — tampilan kapital).
 * - Baris WAITING: tombol dropdown "Aksi Nego" (button) + link "Detail"
 *   (title "Lihat Detail", href /lelang/detailnego/<hash>). Item dropdown:
 *   "Terima Nego" / "Tolak Nego" / "Negosiasi" — ketiganya link ke
 *   /lelang/terimaNego/<hash> dibedakan query ?status=terima|tolak|nego.
 * - Baris non-WAITING: hanya link "Detail" (tanpa tombol Aksi Nego).
 * - Baris DITOLAK: sel "Harga Baru/Jumlah Nego" menampilkan strip "-"
 *   (harga baru tidak ter-create) diikuti "Nego Ke n".
 * - Detail nego (/lelang/detailnego/<hash>): breadcrumb "Beranda /
 *   Pengajuan Nego / Detail Nego"; label berpola <div>Label <span>:</span>
 *   </div> (pakai substring, JANGAN exact — lihat fakta kalibrasi
 *   CLAUDE.md); memuat label PPN & PPh (nilai atau strip "-" untuk data
 *   lama), section DATA NEGO (Shipper, Nomor Lelang, Tanggal Nego
 *   Diajukan, Nego Harga, Jumlah Nego + "( Lihat Riwayat )", Status Nego).
 *
 * Rule yang TIDAK dicakup (mutasi / butuh kondisi data spesifik):
 * - Eksekusi Terima/Tolak/Negosiasi nego + halaman responnya (mutasi
 *   permanen + notifikasi WA ke bid owner).
 * - Validasi rentang harga penawaran negosiasi (butuh submit form).
 * - PPN/PPh strip "-" pada data lama tanpa nilai (semua data demo saat
 *   kalibrasi memiliki nilai PPN/PPh).
 */

const listUrl = '/lelang/pengajuannego';

const listPage = {
  barisData: (page: Page) =>
    page.locator('table tbody tr').filter({ has: page.locator('a[href*="/lelang/detailnego/"]') }),
  barisStatus: (page: Page, status: RegExp) => listPage.barisData(page).filter({ hasText: status }),
  tombolDetail: (baris: Locator) => baris.locator('a[href*="/lelang/detailnego/"]'),
  tombolAksiNego: (baris: Locator) => baris.getByRole('button', { name: 'Aksi Nego' }),
};

/** Baris dimuat async — tunggu baris data pertama; 0 = daftar kosong. */
async function tungguBarisData(page: Page): Promise<number> {
  await listPage.barisData(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  return listPage.barisData(page).count();
}

test.describe('Daftar Pengajuan Nego (Bidder)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(listUrl);
  });

  test('tabel menampilkan pasangan kolom daftar nego', async ({ page }) => {
    for (const pasangan of [
      /^Shipper\s+Status Nego/,
      /^Pelayaran\s+Jenis/,
      /^Pelabuhan Asal\s+ETD/,
      /^Pelabuhan Tujuan\s+ETA/,
      /^Nego Harga\s+Harga Awal/,
      /^Harga Baru\s+Jumlah Nego/,
      /^Aksi/,
    ]) {
      await expect(page.getByRole('columnheader', { name: pasangan }).first()).toBeVisible();
    }
  });

  test('setiap baris menampilkan salah satu status nego yang dikenal', async ({ page }) => {
    const jumlah = await tungguBarisData(page);
    test.skip(jumlah === 0, 'Tidak ada data nego pada akun demo');

    await expect(
      listPage.barisData(page).first().getByText(/^(WAITING|DITERIMA|DITOLAK|NEGOSIASI)$/i),
    ).toBeVisible();
  });

  test('nego berstatus Waiting memiliki tombol Detail dan Aksi Nego', async ({ page }) => {
    test.skip((await tungguBarisData(page)) === 0, 'Tidak ada data nego pada akun demo');
    const waiting = listPage.barisStatus(page, /WAITING/i);
    test.skip((await waiting.count()) === 0, 'Tidak ada nego berstatus Waiting pada akun demo');

    const baris = waiting.first();
    await expect(listPage.tombolDetail(baris)).toBeVisible();
    await expect(listPage.tombolAksiNego(baris)).toBeVisible();
  });

  test('tombol Aksi Nego membuka pilihan Terima Nego, Tolak Nego, dan Negosiasi', async ({ page }) => {
    test.skip((await tungguBarisData(page)) === 0, 'Tidak ada data nego pada akun demo');
    const waiting = listPage.barisStatus(page, /WAITING/i);
    test.skip((await waiting.count()) === 0, 'Tidak ada nego berstatus Waiting pada akun demo');

    const baris = waiting.first();
    await listPage.tombolAksiNego(baris).click();
    // Ketiga pilihan = link ke halaman respon yang sama, dibedakan ?status=.
    for (const pilihan of [
      { nama: 'Terima Nego', status: 'terima' },
      { nama: 'Tolak Nego', status: 'tolak' },
      { nama: 'Negosiasi', status: 'nego' },
    ]) {
      const item = baris.getByRole('link', { name: pilihan.nama });
      await expect(item).toBeVisible();
      await expect(item).toHaveAttribute(
        'href',
        new RegExp(`/lelang/terimaNego/.+\\?status=${pilihan.status}$`),
      );
    }
  });

  test('nego yang sudah direspon hanya memiliki tombol Detail tanpa Aksi Nego', async ({ page }) => {
    test.skip((await tungguBarisData(page)) === 0, 'Tidak ada data nego pada akun demo');
    const selesai = listPage.barisStatus(page, /DITERIMA|DITOLAK|NEGOSIASI/i);
    test.skip((await selesai.count()) === 0, 'Tidak ada nego yang sudah direspon pada akun demo');

    const baris = selesai.first();
    await expect(listPage.tombolDetail(baris)).toBeVisible();
    await expect(listPage.tombolAksiNego(baris)).toHaveCount(0);
  });

  test('nego ditolak menampilkan strip pada kolom Harga Baru', async ({ page }) => {
    test.skip((await tungguBarisData(page)) === 0, 'Tidak ada data nego pada akun demo');
    const ditolak = listPage.barisStatus(page, /DITOLAK/i);
    test.skip((await ditolak.count()) === 0, 'Tidak ada nego berstatus Ditolak pada akun demo');

    // Sel ke-6 = pasangan "Harga Baru / Jumlah Nego"; harga baru strip "-"
    // karena tolak nego tidak membuat harga baru (rule).
    // Regex = teks mentah (tanpa normalisasi whitespace) → awali \s*.
    await expect(ditolak.first().locator('td').nth(5)).toHaveText(/^\s*-\s*Nego Ke \d+/);
  });
});

test.describe('Detail Nego (Bidder)', () => {
  test('menampilkan informasi harga, PPN/PPh, dan section Data Nego', async ({ page }) => {
    await page.goto(listUrl);
    test.skip((await tungguBarisData(page)) === 0, 'Tidak ada data nego pada akun demo');

    await listPage.tombolDetail(listPage.barisData(page).first()).click();
    await expect(page).toHaveURL(/\/lelang\/detailnego\/.+$/);

    await expect(page.getByText(/Beranda\s*\/\s*Pengajuan Nego\s*\/\s*Detail Nego/)).toBeVisible();
    for (const label of [
      'Pelayaran',
      'Harga Awal (Sebelum PPN)',
      'PPN',
      'PPh',
      'Biaya Termasuk',
      'Nomor Lelang',
      'Tanggal Nego Diajukan',
      'Nego Harga',
      'Jumlah Nego',
      'Status Nego',
    ]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
    await expect(
      page.getByText(/^(WAITING|DITERIMA|DITOLAK|NEGOSIASI)$/i).first(),
    ).toBeVisible();
  });
});
