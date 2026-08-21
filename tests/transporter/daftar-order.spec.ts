import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Daftar Order — peran Bidder/Transporter (project "transporter")
 * Rule: docs/rules/bidder/08-daftar-order.md (daftar + detail; read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-20 via playwright-cli (login form):
 * - URL /order/OrderList. Tiap order dirender DUA baris: baris header info
 *   (link teks "Info Order", "Info Tracking" [a.tombol_info_tracking],
 *   "Detail Order", "Dokumen Aanwijzing", "Order by : ...") + baris data
 *   dengan pasangan kolom: "Lelang/Status", "Nama Kapal/Tgl Permintaan
 *   Muat", "Pelabuhan Asal/ETD", "Pelabuhan Tujuan/ETA", "Shipper",
 *   "Harga/Jumlah Order", "Action". (Kolom "Nama Invoice/Tanggal Upload/
 *   Aksi" milik tabel popup invoice, bukan tabel utama.)
 * - Status order demo saat kalibrasi: KONFIRMASI UNIT, PROSES PENUGASAN,
 *   STUFFING, RENCANA DOORING, ORDER SELESAI.
 * - Baris KONFIRMASI UNIT: link "Input Unit" + tombol "Action Menu" berisi
 *   Dokumen Aanwijzing, Upload Dokumen, Biaya Tambahan (kondisional), dan
 *   "Lihat QR Code" (khusus order PNP).
 * - Baris PROSES PENUGASAN: "Action Menu" berisi Dokumen Aanwijzing,
 *   Proses Invoice, Lihat Data Unit, Upload Dokumen. Catatan rule:
 *   internal-nya kontradiktif soal kapan submenu Proses Invoice tampil
 *   (baris 70 vs 74 dokumen) — UI menampilkannya sejak PROSES PENUGASAN;
 *   link-nya GET biasa ke /order/uploadinvoice/<id> tanpa onclick, alert
 *   "Tidak Bisa!..." tidak terpicu dari klik terprogram saat kalibrasi →
 *   TIDAK diassert di sini (butuh kalibrasi lanjutan).
 * - "Info Tracking" di-expand menampilkan status per kontainer; kontainer
 *   yang belum ditracking menampilkan "Menunggu Proses".
 * - Panel Filter (tombol " Filter"): input[name=nomor_kontainer]
 *   (placeholder "Masukkan No. Kontainer"), checkbox
 *   input[name=kapal_connecting], tombol "Reset". Perilaku input nomor
 *   kontainer (terverifikasi): spasi & karakter khusus TERTOLAK, panjang
 *   maks 11; kapital tampilan via CSS text-transform:uppercase (nilai
 *   tersimpan bisa campur huruf besar-kecil).
 * - DEFECT (dilaporkan, lihat CLAUDE.md #7): label "Nomor Kontainer" di
 *   panel filter ber-htmlFor="jumlah" (field Jumlah Order); input
 *   #nomor_kontainer tanpa label terasosiasi.
 * - Detail order: /order/orderdetail/<hash>; breadcrumb "Beranda / Daftar
 *   Order / Detail Order : <id>", "ID ORDER : <id>", section DETAIL
 *   PEMESAN, DETAIL ORDER (label Dokumen Aanwijzing, Nomor Order, Tanggal
 *   Buat Order), plus section status (PERJANJIAN PENGIRIMAN / STATUS
 *   PENGIRIMAN / PENILAIAN ORDER — heading section tampil kapital via CSS).
 *
 * Rule yang TIDAK dicakup (mutasi / butuh kondisi data / alur lanjutan):
 * - Input/edit unit, upload dokumen, biaya tambahan, seluruh alur invoice.
 * - Alert pembatasan Proses Invoice (lihat catatan kalibrasi di atas).
 * - Perpindahan status order oleh tracking (butuh mutasi dari akun lain).
 * - Label "By PNP" & QR Code (butuh order PNP yang pasti; Lihat QR Code
 *   teramati tapi kondisional per order).
 * - Efek filter terhadap hasil (butuh data kontainer yang diketahui pasti).
 */

const listUrl = '/order/OrderList';

const STATUS_DIKENAL =
  /KONFIRMASI UNIT|PROSES PENUGASAN|AMBIL KONTAINER|STUFFING|KAPAL BERLAYAR|KAPAL SANDAR|RENCANA DOORING|DOORING|SJ Diterima Agen|DOKUMEN DIKIRIM|ORDER SELESAI/;

const listPage = {
  /** Baris data order = tr dengan sel berjumlah banyak dan memuat status. */
  barisStatus: (page: Page, status: RegExp) =>
    page.locator('table tbody tr').filter({ hasText: status }),
  infoTracking: (page: Page) => page.locator('a.tombol_info_tracking'),
};

async function bukaHalaman(page: Page): Promise<number> {
  await page.goto(listUrl);
  await listPage.barisStatus(page, STATUS_DIKENAL).first().waitFor({ timeout: 15_000 }).catch(() => {});
  return listPage.barisStatus(page, STATUS_DIKENAL).count();
}

test.describe('Daftar Order (Bidder)', () => {
  test('tabel menampilkan pasangan kolom daftar order', async ({ page }) => {
    await bukaHalaman(page);
    for (const pasangan of [
      /^Lelang\s+Status/,
      /^Nama Kapal\s+Tgl Permintaan Muat/,
      /^Pelabuhan Asal\s+ETD/,
      /^Pelabuhan Tujuan\s+ETA/,
      /^Shipper/,
      /^Harga\s+Jumlah Order/,
      /^Action/,
    ]) {
      await expect(page.getByRole('columnheader', { name: pasangan }).first()).toBeVisible();
    }
  });

  test('setiap order menampilkan baris info dengan link Info Order, Info Tracking, dan Detail Order', async ({
    page,
  }) => {
    const jumlah = await bukaHalaman(page);
    test.skip(jumlah === 0, 'Tidak ada data order pada akun demo');

    await expect(page.getByText('Info Order', { exact: true }).first()).toBeVisible();
    await expect(listPage.infoTracking(page).first()).toBeVisible();
    await expect(page.getByText('Detail Order', { exact: true }).first()).toBeVisible();
  });

  test('order berstatus Konfirmasi Unit memiliki tombol Input Unit dan menu Upload Dokumen', async ({ page }) => {
    await bukaHalaman(page);
    const baris = listPage.barisStatus(page, /KONFIRMASI UNIT/);
    test.skip((await baris.count()) === 0, 'Tidak ada order berstatus Konfirmasi Unit pada akun demo');

    await expect(baris.first().getByText('Input Unit', { exact: true })).toBeVisible();
    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    await expect(baris.first().getByText('Upload Dokumen')).toBeVisible();
  });

  test('order berstatus Proses Penugasan memiliki menu Lihat Data Unit dan Upload Dokumen', async ({ page }) => {
    await bukaHalaman(page);
    const baris = listPage.barisStatus(page, /PROSES PENUGASAN/);
    test.skip((await baris.count()) === 0, 'Tidak ada order berstatus Proses Penugasan pada akun demo');

    await baris.first().getByRole('button', { name: 'Action Menu' }).click();
    await expect(baris.first().getByText('Lihat Data Unit')).toBeVisible();
    await expect(baris.first().getByText('Upload Dokumen')).toBeVisible();
  });

  test('Info Tracking dapat di-expand dan kontainer belum tracking berketerangan Menunggu Proses', async ({
    page,
  }) => {
    const jumlah = await bukaHalaman(page);
    test.skip(jumlah === 0, 'Tidak ada data order pada akun demo');

    await listPage.infoTracking(page).first().click();
    await expect(page.getByText('Menunggu Proses').first()).toBeVisible({ timeout: 10_000 });
  });

  test('filter menyediakan field Nomor Kontainer, checkbox Kapal Connecting, dan tombol Reset', async ({
    page,
  }) => {
    await bukaHalaman(page);
    await page.getByRole('button', { name: /Filter/ }).first().click();

    await expect(page.getByPlaceholder('Masukkan No. Kontainer')).toBeVisible();
    await expect(page.locator('input[name="kapal_connecting"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  });

  test('input filter Nomor Kontainer menolak spasi dan karakter khusus serta maksimal 11 karakter', async ({
    page,
  }) => {
    await bukaHalaman(page);
    await page.getByRole('button', { name: /Filter/ }).first().click();

    const input = page.getByPlaceholder('Masukkan No. Kontainer');
    await input.click();
    // 16 karakter dengan spasi & simbol; hanya huruf+angka yang lolos, maks 11.
    await input.pressSequentially('abc12 3!@xyz9999', { delay: 20 });
    await expect(input).toHaveValue(/^[A-Za-z0-9]{11}$/);
    // "Auto kapital" (rule) diterapkan sebagai tampilan CSS uppercase.
    await expect(input).toHaveCSS('text-transform', 'uppercase');
  });
});

test.describe('Detail Order (Bidder)', () => {
  test('menampilkan ID order, detail pemesan, detail order, dan section sesuai status', async ({ page }) => {
    await page.goto(listUrl);
    const detail = page.getByText('Detail Order', { exact: true }).first();
    await detail.waitFor({ timeout: 15_000 }).catch(() => {});
    test.skip(!(await detail.isVisible().catch(() => false)), 'Tidak ada data order pada akun demo');

    await detail.click();
    await expect(page).toHaveURL(/\/order\/orderdetail\/.+$/);

    await expect(page.getByText(/Beranda\s*\/\s*Daftar Order\s*\/\s*Detail Order/)).toBeVisible();
    await expect(page.getByText(/ID ORDER : \S+/).first()).toBeVisible();
    // Heading section kapital via CSS — DOM-nya juga kapital untuk section
    // ini (terverifikasi di innerText saat kalibrasi).
    // Label detail terduplikasi (layout desktop+mobile, salah satunya
    // hidden) → saring yang visible sebelum .first().
    await expect(page.getByText('Detail Pemesan').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('Nomor Order').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('Tanggal Buat Order').filter({ visible: true }).first()).toBeVisible();
    // Salah satu section status terbuka sesuai rule.
    await expect(
      page
        .getByText(/PERJANJIAN PENGIRIMAN|STATUS PENGIRIMAN|PENILAIAN ORDER/i)
        .first(),
    ).toBeVisible();
  });
});
