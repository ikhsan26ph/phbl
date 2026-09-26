import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Analitik → Shipping Cost Sales Ratio (SCSR) — peran Administrator
 * (project "admin", storageState .auth/admin.json via setup). READ-ONLY.
 * Rule: docs/rules/analitik-scsr.md (hasil kalibrasi — modul Analitik TIDAK ada
 * di dokumen rule sumber).
 *
 * Sisi admin menguji improve 2026-09 yang sama dengan tests/shipper/analitik-scsr.spec.ts
 * (kolom Kota Asal di Detail Kota, Jumlah Order per pasangan kota, filter
 * diteruskan ke Detail Consignee, consignee tanpa kolom kota asal) DITAMBAH
 * pembeda khas admin.
 *
 * Kalibrasi ke halaman asli 2026-09-26 via playwright-cli (login form admin):
 * - Menu ANALITIK admin punya 5 submenu: Ringkasan Analitik
 *   (/dashboardanalitik/ringkasan), Shipping Cost Sales Ratio
 *   (/home/analitikscsr — route SAMA dengan shipper), Freight Cost
 *   (/analitik/analitikfcu), On Time Delivery Rate (/analitik/analitikotdr),
 *   Shipment Accuracy (/home/analitikshipmentaccuracy). Submenu master
 *   (Jenis Muatan / Harga Barang) sudah dicakup tests/admin/master.spec.ts.
 * - Form admin punya filter WAJIB "Shipper *" yang tidak ada di sisi shipper
 *   (pola sama dengan Laporan admin yang wajib memilih #BidOwnerID).
 * - Ketiga dropdown = widget custom `.multi-select` dengan id `#ProvinsiID`
 *   (37 opsi), `#Consignee` (296), `#BidOwnerID` (4). BUKAN <select> native →
 *   selectOption() tidak berlaku: klik `.multi-select-header` untuk membuka,
 *   lalu klik `[role=option]` (punya data-value = ID). Pilihan tersimpan ke
 *   input hidden `BidOwnerID[][]`.
 * - Dropdown Shipper HANYA memuat 4 shipper (Ducati Racing Team PNP/287,
 *   Haier Sales Indonesia/277, Cipta Karya…/65, Katalisator Asa Indonesia -
 *   Manuva/26) — diduga hanya shipper yang punya data master Harga Barang;
 *   dicatat sebagai fakta kalibrasi, bukan assertion jumlah tetap.
 * - Jebakan locator sama dengan sisi shipper: tombol Cari = `#lanjutcari`
 *   (accessible name terkontaminasi glyph Font Awesome), teks header tabel
 *   terpecah antar-<span> tanpa spasi → regex WAJIB `\s*` antar kata, dan
 *   baris hasil dimuat ASYNC → wajib poll, jangan count() seketika.
 */

const DARI = '01/01/2026';
const SAMPAI = '30/09/2026';
/** Shipper yang terbukti punya data SCSR saat kalibrasi (dipilih via nama, bukan index). */
const SHIPPER_UJI = 'PT. Cipta Karya Abadi Sejahtera Sentora Mujur Selalu';

async function isiTanggal(page: Page, id: string, nilai: string): Promise<void> {
  const input = page.locator(`#${id}`);
  await input.click();
  await input.pressSequentially(nilai);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue(nilai);
}

const barisDenganAksi = (page: Page, teksAksi: RegExp): Locator =>
  page.locator('table tbody tr').filter({ has: page.getByRole('link', { name: teksAksi }) });

async function tungguBaris(page: Page, teksAksi: RegExp): Promise<{ baris: Locator; ada: boolean }> {
  const baris = barisDenganAksi(page, teksAksi);
  const ada = await expect(async () => {
    expect(await baris.count()).toBeGreaterThan(0);
  })
    .toPass({ timeout: 45_000, intervals: [500, 1000, 2000, 3000] })
    .then(() => true)
    .catch(() => false);
  return { baris, ada };
}

async function cariSCSR(page: Page): Promise<void> {
  await page.goto('/home/analitikscsr');
  await isiTanggal(page, 'tglawal', DARI);
  await isiTanggal(page, 'tglakhir', SAMPAI);
  // Shipper wajib (khas admin) — widget .multi-select, bukan <select>.
  const headerShipper = page.locator('#BidOwnerID .multi-select-header');
  await headerShipper.click();
  await page.locator('#BidOwnerID').getByRole('option', { name: SHIPPER_UJI }).click();
  await expect(headerShipper).toContainText(SHIPPER_UJI);
  // WAJIB tutup dropdown: setelah opsi dipilih, panel `.multi-select-options`
  // (role=listbox) TETAP terbuka dan MENUTUPI tombol #lanjutcari sehingga klik
  // Cari ter-intercept selamanya (terbukti: 3 test timeout 150-180 dtk,
  // 2026-09-26). Escape TIDAK menutupnya (display tetap flex) — yang bekerja
  // hanya klik header sekali lagi, dan pilihan tetap tersimpan.
  await headerShipper.click();
  await expect(page.locator('#BidOwnerID .multi-select-options')).toBeHidden();
  await page.locator('#lanjutcari').click();
  await expect(page).toHaveURL(/session_get=exp_/, { timeout: 60_000 });
}

test.describe('Analitik SCSR (Admin)', () => {
  test('menu Analitik admin memuat lima submenu analitik', async ({ page }) => {
    await page.goto('/lelang/listlelang');
    // Item dropdown yang belum dibuka TIDAK punya role (gotcha berulang di repo
    // ini) → ambil lewat CSS href, lalu cocokkan teksnya.
    const submenu: [string, string][] = [
      ['Ringkasan Analitik', 'dashboardanalitik/ringkasan'],
      ['Shipping Cost Sales Ratio', 'home/analitikscsr'],
      ['Freight Cost', 'analitik/analitikfcu'],
      ['On Time Delivery Rate', 'analitik/analitikotdr'],
      ['Shipment Accuracy', 'home/analitikshipmentaccuracy'],
    ];
    for (const [nama, hrefBagian] of submenu) {
      await expect(page.locator(`a[href*="${hrefBagian}"]`).first()).toHaveText(new RegExp(nama, 'i'));
    }
  });

  test('form admin mewajibkan filter Shipper (tidak ada di sisi shipper)', async ({ page }) => {
    await page.goto('/home/analitikscsr');
    await expect(page.locator('.heading_1', { hasText: /SHIPPING COST SALES RATIO/i })).toBeVisible();
    await expect(page.getByText(/Shipper\s*\*/).first()).toBeVisible();
    const header = page.locator('.multi-select-header');
    await expect(header.filter({ hasText: /Pilih\s*Shipper/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Provinsi/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Nama\s*Consignee/ })).toBeVisible();
    // Opsi shipper dimuat sebagai [role=option] dengan data-value = ShipperID.
    const opsi = page.locator('#BidOwnerID [role="option"]');
    expect(await opsi.count(), 'Dropdown Shipper harus punya opsi').toBeGreaterThan(0);
    await expect(opsi.filter({ hasText: SHIPPER_UJI })).toHaveAttribute('data-value', /^\d+$/);
  });

  test('level 1 per Provinsi Tujuan tanpa kolom kota asal, Detail Kota membawa ShipperID terpilih', async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await cariSCSR(page);

    const header = page.getByRole('columnheader');
    for (const pola of [
      /Provinsi\s*Tujuan/,
      /Total\s*Biaya\s*Pengiriman\s*\(Rp\)/,
      /Total\s*Harga\s*Barang\s*\(Rp\)/,
      /Logistic\s*Cost\s*Ratio\s*\(%\)/,
    ]) {
      await expect(header.filter({ hasText: pola })).toBeVisible();
    }
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toHaveCount(0);

    const { baris, ada } = await tungguBaris(page, /Detail Kota/);
    test.skip(!ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
    await expect(baris.first().getByRole('link', { name: /Detail Kota/ })).toHaveAttribute(
      'href',
      /analitikscsrbykota\?kota=true&session_get=exp_[^&]+&PilihPropinsi=\d+&ShipperID=\d+/,
    );
  });

  test('Detail Kota admin menampilkan pasangan Kota Asal → Kota Tujuan dengan Jumlah Order', async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrbykota/);
    const header = page.getByRole('columnheader');
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toBeVisible();
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Tujuan/ })).toBeVisible();
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toBeVisible();

    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    for (const baris of await kota.baris.all()) {
      const sel = baris.locator('td');
      await expect(sel.nth(1)).toHaveText(/\S/);
      await expect(sel.nth(2)).toHaveText(/\S/);
      await expect(sel.nth(3)).toHaveText(/^\s*\d+\s*$/);
    }
    await expect(kota.baris.first().getByRole('link', { name: /Detail Consignee/ })).toHaveAttribute(
      'href',
      /analitikscsrconsignee\?.*PilihKota=\d+.*PilihKotaAsal=\d+/,
    );
  });

  test('Detail Consignee admin sesuai pasangan kota terpilih dan tanpa kolom kota asal', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    const barisKota = kota.baris.first();
    const jumlahOrder = Number((await barisKota.locator('td').nth(3).innerText()).trim());
    expect(jumlahOrder).toBeGreaterThan(0);
    await barisKota.getByRole('link', { name: /Detail Consignee/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrconsignee/);
    await expect(page.getByText(/DETAIL\s*DATA\s*CONSIGNEE/)).toBeVisible();
    const header = page.getByRole('columnheader');
    for (const pola of [/ID\s*Order/, /Consignee/, /Alamat\s*Tujuan/]) {
      await expect(header.filter({ hasText: pola })).toBeVisible();
    }
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);

    const barisOrder = page
      .locator('table tbody tr')
      .filter({ has: page.locator('a[href*="order/orderdetail"]') });
    await expect(barisOrder).toHaveCount(jumlahOrder, { timeout: 45_000 });
  });
});
