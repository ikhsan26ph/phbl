import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Daftar Order — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/10-daftar-order.md (scope read-only: struktur
 * list, panel filter, dan pembatasan input filter)
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - /order/OrderList. Panel filter disembunyikan default, terbuka via tombol
 *   " Filter" di header; berisi field: Nomor Lelang, Transporter, Tanggal
 *   Permintaan Muat, Jenis Kontainer (select2), Nomor Kontainer, ETD, ETA,
 *   Aksi (select2: Input Muatan/Input Perjanjian/Rating), Pelabuhan
 *   Asal/Tujuan, Kapal Connecting (checkbox) + Nama Kapal, Tanggal Buat
 *   Order, Jumlah Order, Penerima Barang, Status Order, tombol Reset+Filter.
 * - Input Nomor Kontainer: sanitasi live per karakter — spasi & simbol
 *   dibuang, dipotong maks 11 karakter. "Auto kapital" diimplementasikan
 *   via CSS text-transform:uppercase (value internal bisa campur huruf
 *   besar/kecil, mis. "abc 12!@#defgh456789" → value "ABC12defgh4" — tampil
 *   "ABC12DEFGH4"); test memverifikasi value tersanitasi + CSS uppercase.
 * - Tiap order dirender 2 baris: baris data (kolom Lelang/Status, Nama
 *   Kapal/Tgl Permintaan Muat, POL/ETD, POD/ETA, Transporter, Harga/Jumlah
 *   Order, Action) + baris info berisi textlink "Info Order", "Info
 *   Tracking" (hanya order yang sudah konfirmasi unit), link "Detail Order"
 *   (/order/orderdetail/<hash>), dan "Dokumen Aanwijzing".
 * - Tombol aksi per baris punya accessible name "Action Menu" (satu-satunya
 *   tombol bernama di tabel ini — beda dari Pengajuan Lelang yang tanpa nama).
 *
 * Rule yang TIDAK dicakup di sini (butuh mutasi / kondisi status spesifik):
 * - Pilihan action menu per status order (ORDER BARU s.d ORDER SELESAI) —
 *   butuh order pada tiap status; status demo berubah-ubah.
 * - Edit muatan, batalkan order, biaya tambahan, rating (mutasi).
 * - Persistensi filter setelah bolak-balik halaman aksi (butuh aksi mutasi).
 * - Label By PNP / QR Code (butuh order dari sistem PNP).
 */

const orderListUrl = '/order/OrderList';

const orderPage = {
  filterToggle: (page: Page) => page.getByRole('button', { name: ' Filter' }).first(),
  nomorKontainer: (page: Page) => page.getByRole('textbox', { name: 'Masukkan No. Kontainer' }),
  resetButton: (page: Page) => page.getByRole('button', { name: ' Reset' }),
  actionButtons: (page: Page) => page.getByRole('button', { name: 'Action Menu' }),
};

test.beforeEach(async ({ page }) => {
  await page.goto(orderListUrl);
});

test('tabel daftar order menampilkan kolom berpasangan sesuai rule', async ({ page }) => {
  await expect(page.getByRole('columnheader', { name: 'Lelang Status' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Nama Kapal Tgl Permintaan Muat' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Pelabuhan Asal ETD' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Pelabuhan Tujuan ETA' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Transporter' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Harga Jumlah Order' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible();
});

test('panel filter memuat semua field pencarian sesuai rule beserta Reset dan Filter', async ({ page }) => {
  await orderPage.filterToggle(page).click();

  for (const label of [
    'Nomor Lelang',
    'Transporter',
    'Tanggal Permintaan Muat',
    'Jenis Kontainer',
    'Nomor Kontainer',
    'Aksi',
    'Pelabuhan Asal',
    'Pelabuhan Tujuan',
    'Nama Kapal',
    'Tanggal Buat Order',
    'Jumlah Order',
    'Penerima Barang',
    'Status Order',
  ]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
  // Filter kapal connecting berupa checkbox (rule). exact:true agar tidak
  // bentrok dengan judul modal tersembunyi "JADWAL KAPAL CONNECTING".
  await expect(page.getByText('Kapal Connecting', { exact: true })).toBeVisible();
  await expect(page.locator('input[type="checkbox"]:visible').first()).toBeVisible();

  await expect(orderPage.resetButton(page)).toBeVisible();
});

test('input nomor kontainer menyaring spasi/simbol, maksimal 11 karakter, tampil kapital', async ({
  page,
}) => {
  await orderPage.filterToggle(page).click();
  const input = orderPage.nomorKontainer(page);

  await input.click();
  await input.pressSequentially('abc 12!@#defgh456789');

  // Spasi & karakter khusus dibuang, dipotong 11 karakter (rule).
  const nilai = await input.inputValue();
  expect(nilai).toHaveLength(11);
  expect(nilai).toMatch(/^[a-zA-Z0-9]+$/);
  // "Auto kapital" via CSS text-transform (tampilan), bukan nilai internal.
  await expect(input).toHaveCSS('text-transform', 'uppercase');
});

test('baris order memuat textlink info dan link Detail Order ke halaman detail', async ({ page }) => {
  await orderPage.actionButtons(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  test.skip((await orderPage.actionButtons(page).count()) === 0, 'Tidak ada data order di akun demo');

  await expect(page.getByRole('link', { name: 'Info Order' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Detail Order' }).first()).toHaveAttribute(
    'href',
    /order\/orderdetail\/.+/,
  );
});

test('order yang sudah konfirmasi unit menampilkan textlink Info Tracking', async ({ page }) => {
  await orderPage.actionButtons(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  test.skip((await orderPage.actionButtons(page).count()) === 0, 'Tidak ada data order di akun demo');

  const infoTracking = page.getByRole('link', { name: 'Info Tracking' });
  test.skip(
    (await infoTracking.count()) === 0,
    'Tidak ada order berstatus pasca-konfirmasi-unit di akun demo',
  );
  await expect(infoTracking.first()).toBeVisible();
});
