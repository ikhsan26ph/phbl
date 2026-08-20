import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Laporan — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/12-laporan.md (Daftar History Lelang +
 * Laporan Logistik; scope read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - Daftar History Lelang = /home/history_lelang; Laporan Logistik =
 *   /home/laporanlogistik. Keduanya submenu nav "LAPORAN".
 * - Kedua halaman punya form tanggal #tglawal/#tglakhir (jQuery UI
 *   datepicker + mask — isi via click + keyboard.type, sama seperti
 *   dashboard) + tombol "Cari". Hint range: history lelang "Maksimal range
 *   90 hari", laporan logistik "Maksimal range 31 hari" (sesuai rule).
 * - Hasil history lelang (dikalibrasi dengan range 01/06-01/07/2026, ada
 *   3 lelang demo): kolom Nomor Lelang / Tanggal Buka Lelang / Rute,
 *   tombol "Export Excel", label "Multidrop" untuk rute multidrop.
 * - Hasil laporan logistik (range 01/08-31/08/2026, 4 order demo): baris
 *   ringkasan "Total : N Lelang, N Order, N Unit", kolom berpasangan
 *   (Nomor Lelang/Nomer Order, Transporter, Rute ETD - ETA, Nama
 *   Kapal/Voyage, Jumlah Unit/Total Harga, Permintaan Muat/Tanggal Order),
 *   Export Excel, link "Detail" → /home/detaillaporanlogistik/<hash>.
 * - Detail laporan logistik: tahapan tracking (Stuffing, Kapal Berlayar,
 *   Kapal Sandar, Rencana Dooring, Dooring, SJ Diterima Agen) + data
 *   Nomor Kontainer & Nomor Seal.
 * - Test memakai RANGE DINAMIS (hari ini mundur 30/90 hari) supaya tidak
 *   bergantung tanggal demo tertentu; test hasil di-skip bila range itu
 *   kebetulan kosong.
 *
 * Rule yang TIDAK dicakup di sini:
 * - Isi file excel hasil export (perlu parsing xlsx; hanya keberadaan
 *   tombol yang dicek).
 * - Lelang dibatalkan tidak muncul / perhitungan total & saving cost
 *   (butuh kontrol penuh atas data).
 * - Pembatasan akses sub user IMP/TCI (butuh akun custom tersebut).
 */

function formatTanggal(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Isi field tanggal ber-mask via keyboard (fill() ditolak mask). */
async function ketikTanggal(page: Page, selector: string, tanggal: string) {
  await page.locator(selector).click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(tanggal);
  await page.keyboard.press('Escape');
}

async function cariDenganRange(page: Page, mundurHari: number) {
  const akhir = new Date();
  const awal = new Date();
  awal.setDate(awal.getDate() - mundurHari);
  await ketikTanggal(page, '#tglawal', formatTanggal(awal));
  await ketikTanggal(page, '#tglakhir', formatTanggal(akhir));
  await page.getByRole('button', { name: 'Cari' }).click();
}

test.describe('Daftar History Lelang', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home/history_lelang');
  });

  test('form pencarian menampilkan batas range 90 hari', async ({ page }) => {
    // Tampilan uppercase heading hanya CSS; teks DOM "Daftar History
    // Lelang" juga ada di nav & breadcrumb — scope ke elemen heading.
    await expect(page.locator('.heading_1', { hasText: 'Daftar History Lelang' })).toBeVisible();
    await expect(page.getByText('Masukkan tanggal lelang (Maksimal range 90 hari)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cari' })).toBeVisible();
  });

  test('hasil pencarian menampilkan kolom lelang dan tombol Export Excel', async ({ page }) => {
    await cariDenganRange(page, 89);

    const barisData = page.locator('table tbody tr').filter({ hasText: /./ });
    await barisData.first().waitFor({ timeout: 15_000 }).catch(() => {});
    test.skip((await barisData.count()) === 0, 'Tidak ada history lelang pada range 90 hari terakhir');

    await expect(page.getByRole('columnheader', { name: 'Nomor Lelang' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Tanggal Buka Lelang' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Rute' })).toBeVisible();
    await expect(page.getByText('Export Excel')).toBeVisible();
  });
});

test.describe('Laporan Logistik', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home/laporanlogistik');
  });

  test('form pencarian menampilkan batas range 31 hari', async ({ page }) => {
    await expect(page.locator('.heading_1', { hasText: 'Laporan Logistik' })).toBeVisible();
    await expect(
      page.getByText('Masukkan tanggal permintaan muat (Maksimal range 31 hari)'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cari' })).toBeVisible();
  });

  test('hasil pencarian menampilkan ringkasan total, kolom order, dan Export Excel', async ({ page }) => {
    await cariDenganRange(page, 30);

    const ringkasanTotal = page.getByText(/Total : \d+ Lelang, \d+ Order, \d+ Unit/);
    await ringkasanTotal.waitFor({ timeout: 15_000 }).catch(() => {});
    test.skip(
      (await ringkasanTotal.count()) === 0,
      'Tidak ada order tervalidasi pada range 31 hari terakhir',
    );

    // Rule: total lelang/order/unit dihitung dari data yang muncul.
    await expect(ringkasanTotal).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Nomor Lelang Nomer Order' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Transporter' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Rute ETD - ETA' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Nama Kapal Voyage' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Jumlah Unit Total Harga' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Permintaan Muat Tanggal Order' })).toBeVisible();
    await expect(page.getByText('Export Excel').first()).toBeVisible();
  });

  test('detail laporan logistik menampilkan tahapan tracking dan data kontainer', async ({ page }) => {
    await cariDenganRange(page, 30);

    const detail = page.getByRole('link', { name: 'Detail', exact: true });
    await detail.first().waitFor({ timeout: 15_000 }).catch(() => {});
    test.skip((await detail.count()) === 0, 'Tidak ada order tervalidasi pada range 31 hari terakhir');

    await detail.first().click();
    await expect(page).toHaveURL(/\/home\/detaillaporanlogistik\/.+/);

    // Rule: tahapan tracking pada detail; subset stabil yang terverifikasi
    // ada di halaman (nama tahap tampil meski tanggalnya strip).
    for (const tahap of ['Stuffing', 'Kapal Berlayar', 'Kapal Sandar', 'Rencana Dooring', 'Dooring', 'SJ Diterima Agen']) {
      await expect(page.getByText(tahap).first()).toBeVisible();
    }
    await expect(page.getByText('Nomor Kontainer').first()).toBeVisible();
    await expect(page.getByText(/Nomor Seal/).first()).toBeVisible();
  });
});
