import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Pengajuan Nego — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/09-pengajuan-nego.md (scope read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - /lelang/pengajuannego. Baris dimuat async ("Mohon tunggu sebentar" dulu).
 *   Data demo punya keempat status: WAITING, DITERIMA, DITOLAK, NEGOSIASI
 *   (ditampilkan uppercase di badge baris; opsi filter Status memakai
 *   capitalize: Waiting/Diterima/Ditolak/Negosiasi).
 * - Baris DITOLAK menampilkan strip "-" di kolom Harga Baru (sesuai rule).
 * - Kolom jumlah nego berformat "Nego Ke N".
 * - Link "Detail" per baris → /lelang/detailnego/<hash>.
 * - Halaman detail: "Harga Awal (Sebelum PPN)", baris PPN dan PPh (nilai %
 *   atau strip "-" untuk data lama), tombol "Ajukan Nego Kembali" (untuk
 *   status Ditolak/Negosiasi) dirender 2 varian — hanya .am-for-pc yang
 *   visible di desktop.
 * - Filter: Nomor Lelang, Transporter (free text "Masukkan Nama
 *   Transporter" — inilah "filter Nama Bidder free text" pada rule;
 *   Bidder = Transporter), Jenis Kontainer, Harga Awal, POL/POD, ETD/ETA,
 *   Nego Harga, Harga Baru, Jumlah Nego, Status.
 *
 * Rule yang TIDAK dicakup di sini (butuh mutasi / akun khusus):
 * - Submit ajukan nego kembali + validasi rentang nominal (mutasi nego).
 * - Perubahan status oleh respon bidder (lintas peran).
 * - Menu nego disable untuk bid owner satoria / sub user IMP & TCI
 *   (butuh akun khusus tersebut).
 */

const negoUrl = '/lelang/pengajuannego';

const negoPage = {
  filterToggle: (page: Page) => page.getByRole('button', { name: ' Filter' }).first(),
  detailLinks: (page: Page) => page.getByRole('link', { name: 'Detail', exact: true }),
  barisData: (page: Page) => page.locator('table tbody tr').filter({ hasText: /./ }),
};

test.beforeEach(async ({ page }) => {
  await page.goto(negoUrl);
});

/** Baris nego dimuat async; kembalikan jumlah link Detail (0 = tanpa data). */
async function tungguBaris(page: Page): Promise<number> {
  await negoPage.detailLinks(page).first().waitFor({ timeout: 15_000 }).catch(() => {});
  return negoPage.detailLinks(page).count();
}

test('tabel pengajuan nego menampilkan kolom berpasangan sesuai rule', async ({ page }) => {
  await expect(page.getByRole('columnheader', { name: 'Transporter Status Nego' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Pelayaran Jenis' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Pelabuhan Asal ETD' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Pelabuhan Tujuan ETA' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Nego Harga Harga Awal' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Harga Baru Jumlah Nego' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Aksi' })).toBeVisible();
});

test('filter Status menyediakan keempat status nego sesuai rule', async ({ page }) => {
  await negoPage.filterToggle(page).click();
  const statusSelect = page
    .locator('select')
    .filter({ has: page.locator('option', { hasText: 'Waiting' }) });
  const opsi = await statusSelect.locator('option').allTextContents();
  expect(opsi).toEqual(['Pilih Status', 'Waiting', 'Diterima', 'Ditolak', 'Negosiasi']);
});

test('filter Transporter (nama bidder) berupa free text', async ({ page }) => {
  await negoPage.filterToggle(page).click();
  // Accessible name input diambil dari label "Transporter", bukan
  // placeholder — locate via placeholder.
  const transporter = page.getByPlaceholder('Masukkan Nama Transporter');
  await expect(transporter).toBeVisible();
  await transporter.fill('PT. Bebas Ketik Apapun');
  await expect(transporter).toHaveValue('PT. Bebas Ketik Apapun');
});

test('nego berstatus DITOLAK menampilkan strip pada kolom Harga Baru', async ({ page }) => {
  test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego di akun demo');

  const barisDitolak = negoPage.barisData(page).filter({ hasText: 'DITOLAK' });
  test.skip((await barisDitolak.count()) === 0, 'Tidak ada nego berstatus DITOLAK di akun demo');
  // Kolom Harga Baru/Jumlah Nego (indeks 5): strip untuk nego ditolak.
  await expect(barisDitolak.first().getByRole('cell').nth(5)).toContainText('-');
});

test('kolom jumlah nego menampilkan format "Nego Ke N"', async ({ page }) => {
  test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego di akun demo');
  await expect(negoPage.barisData(page).filter({ hasText: /Nego Ke \d+/ }).first()).toBeVisible();
});

test('detail nego menampilkan harga sebelum PPN, nilai PPN dan PPh', async ({ page }) => {
  test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego di akun demo');

  await negoPage.detailLinks(page).first().click();
  await expect(page).toHaveURL(/\/lelang\/detailnego\/.+/);

  await expect(page.getByText('Harga Awal (Sebelum PPN)')).toBeVisible();
  // Label sesungguhnya "PPN :" / "PPh :" (dengan titik dua); nilai berupa
  // persentase atau strip "-" untuk data lama (rule). Label dirender ganda
  // (varian mobile tersembunyi) — filter visible.
  await expect(page.getByText('PPN :').filter({ visible: true })).toBeVisible();
  await expect(page.getByText('PPh :').filter({ visible: true })).toBeVisible();
});

test('detail nego berstatus Ditolak/Negosiasi menyediakan tombol Ajukan Nego Kembali', async ({ page }) => {
  test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego di akun demo');

  const barisBisaNego = negoPage.barisData(page).filter({ hasText: /DITOLAK|NEGOSIASI/ });
  test.skip(
    (await barisBisaNego.count()) === 0,
    'Tidak ada nego berstatus Ditolak/Negosiasi di akun demo',
  );

  await barisBisaNego.first().getByRole('link', { name: 'Detail', exact: true }).click();
  await expect(page).toHaveURL(/\/lelang\/detailnego\/.+/);
  // Dua varian tombol (pc/mobile) — hanya varian .am-for-pc yang visible.
  await expect(
    page.getByRole('button', { name: 'Ajukan Nego Kembali' }).and(page.locator('.am-for-pc')),
  ).toBeVisible();
});
