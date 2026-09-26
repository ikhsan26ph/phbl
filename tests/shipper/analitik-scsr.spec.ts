import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Analitik → Shipping Cost Sales Ratio (SCSR) — peran Shipper/Bid Owner
 * (project "shipper", storageState .auth/shipper.json via setup). READ-ONLY:
 * hanya submit form pencarian (GET) dan menelusuri 3 level drill-down.
 * Rule: docs/rules/analitik-scsr.md (hasil kalibrasi — modul Analitik TIDAK ada
 * di dokumen rule sumber).
 *
 * Fokus spec ini = improve 2026-09 "Kota Asal pada analitik SCSR":
 *   1. Kolom "Kota Asal" HANYA ada saat klik Detail Kota.
 *   2. Jumlah Order terbagi per kategori Kota Asal + Kota Tujuan.
 *   3. Detail Consignee hanya memuat order dengan kota tujuan (dan kota asal)
 *      yang terpilih di step sebelumnya.
 *   4. Detail Consignee TIDAK menambahkan kolom kota asal.
 *
 * Kalibrasi ke halaman asli 2026-09-26 via playwright-cli (login form shipper):
 * - Menu ANALITIK (dropdown) → "Shipping Cost Sales Ratio" /home/analitikscsr.
 * - Form: #tglawal & #tglakhir (daterangepicker → pressSequentially + Enter,
 *   fill() bisa ter-reset), dropdown Provinsi/Consignee = widget custom
 *   `.multi-select` (BUKAN <select>, selectOption tidak berlaku), tombol Cari.
 *   Hint "Maksimal range 12 bulan" mengacu tanggal permintaan muat.
 * - Tombol Cari = `#lanjutcari`. TIDAK bisa via getByRole('button',{name:'Cari'}):
 *   glyph ikon Font Awesome (`<i class="fa-search">`) ikut terhitung di
 *   accessible name sehingga namanya "<glyph>&nbsp; Cari" → regex berjangkar
 *   ^Cari$ tak pernah cocok (terbukti 2026-09-26). Usulan ke dev: aria-label.
 * - Setelah Cari URL jadi /home/analitikscsr/?session_get=exp_<id>; id sesi ini
 *   dibawa ke semua level drill-down.
 * - JEBAKAN 1: teks header tabel dipecah ke beberapa <span> TANPA spasi
 *   ("Total BiayaPengiriman (Rp)", "Logistic CostRatio (%)") → setiap regex
 *   header WAJIB `\s*` di ANTAR-KATA, bukan sekadar di ujung. "Kota / Kab.
 *   Asal" berakhir titik → jangan pakai `\b` penutup.
 * - JEBAKAN 2: baris hasil dimuat ASYNC setelah header tabel dirender →
 *   count() seketika = 0 dan test ikut "skip palsu"; wajib poll (toPass).
 * - tbody juga menyisipkan baris kosong (spacer) + baris terakhir = TOTAL
 *   (tanpa nomor & tanpa aksi) → filter baris yang punya link aksi.
 * - Level 3 TIDAK punya pagination / pemilih page size (terverifikasi) →
 *   jumlah baris order di level 3 = angka Jumlah Order di level 2.
 *
 * Data uji dipilih DINAMIS (provinsi & pasangan kota mana pun yang ada saat
 * run) karena data demo bersama dan terus berubah.
 */

/** Range tanggal permintaan muat yang lebar tapi tetap <= 12 bulan. */
const DARI = '01/01/2026';
const SAMPAI = '30/09/2026';

async function isiTanggal(page: Page, id: string, nilai: string): Promise<void> {
  const input = page.locator(`#${id}`);
  await input.click();
  await input.pressSequentially(nilai);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue(nilai);
}

/** Baris tabel yang benar-benar berisi data (punya link aksi drill-down). */
const barisDenganAksi = (page: Page, teksAksi: RegExp): Locator =>
  page.locator('table tbody tr').filter({ has: page.getByRole('link', { name: teksAksi }) });

/** Baris hasil dimuat async → poll sampai ada; false bila memang tanpa data. */
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

/** Submit form pencarian SCSR dan tunggu URL hasil. */
async function cariSCSR(page: Page): Promise<void> {
  await page.goto('/home/analitikscsr');
  await isiTanggal(page, 'tglawal', DARI);
  await isiTanggal(page, 'tglakhir', SAMPAI);
  await page.locator('#lanjutcari').click();
  await expect(page).toHaveURL(/session_get=exp_/, { timeout: 60_000 });
}

test.describe('Analitik SCSR (Shipper)', () => {
  test('menu Analitik memuat submenu Shipping Cost Sales Ratio dan Freight Cost', async ({ page }) => {
    await page.goto('/lelang/carirute');
    await page.getByText('ANALITIK', { exact: true }).first().click();
    await expect(page.getByRole('link', { name: 'Shipping Cost Sales Ratio' })).toHaveAttribute(
      'href',
      /\/home\/analitikscsr$/,
    );
    await expect(page.getByRole('link', { name: 'Freight Cost' })).toHaveAttribute(
      'href',
      /\/analitik\/analitikfcu$/,
    );
  });

  test('form pencarian memuat tanggal wajib, filter provinsi & consignee, dan hint 12 bulan', async ({
    page,
  }) => {
    await page.goto('/home/analitikscsr');
    // heading_1 di halaman ini adalah DIV (di halaman lain SPAN) → jangan kunci tag.
    await expect(page.locator('.heading_1', { hasText: /SHIPPING COST SALES RATIO/i })).toBeVisible();
    await expect(page.locator('#tglawal')).toBeVisible();
    await expect(page.locator('#tglakhir')).toBeVisible();
    await expect(
      page.getByText(/Masukkan tanggal permintaan muat\s*\(Maksimal range 12 bulan\)/),
    ).toBeVisible();
    // Dropdown custom .multi-select — shipper hanya punya Provinsi & Consignee
    // (TANPA filter Shipper; itu khas admin).
    const header = page.locator('.multi-select-header');
    await expect(header.filter({ hasText: /Pilih\s*Provinsi/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Nama\s*Consignee/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Shipper/ })).toHaveCount(0);
  });

  test('level 1 menampilkan ringkasan per Provinsi Tujuan tanpa kolom kota asal maupun jumlah order', async ({
    page,
  }) => {
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
    // Improve poin 1: kota asal HANYA muncul di Detail Kota, bukan di level ini.
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toHaveCount(0);

    const { baris, ada } = await tungguBaris(page, /Detail Kota/);
    test.skip(!ada, 'Tidak ada data SCSR pada range tanggal uji');
    await expect(baris.first().getByRole('link', { name: /Detail Kota/ })).toHaveAttribute(
      'href',
      /\/home\/analitikscsrbykota\?kota=true&session_get=exp_[^&]+&PilihPropinsi=\d+&ShipperID=\d+/,
    );
  });

  test('Detail Kota menambahkan kolom Kota / Kab. Asal berpasangan dengan Kota Tujuan & Jumlah Order', async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrbykota/);
    await expect(page.getByText(/DATA\s*ANALITIK\s*:\s*BY\s*KOTA/)).toBeVisible();

    const header = page.getByRole('columnheader');
    // Improve poin 1 & 2.
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toBeVisible();
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Tujuan/ })).toBeVisible();
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toBeVisible();

    // Setiap baris data = satu pasangan Kota Asal → Kota Tujuan dengan jumlah
    // order tersendiri (ketiga sel wajib terisi, jumlah order berupa angka).
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    for (const baris of await kota.baris.all()) {
      const sel = baris.locator('td');
      await expect(sel.nth(1)).toHaveText(/\S/); // Kota / Kab. Asal
      await expect(sel.nth(2)).toHaveText(/\S/); // Kota / Kab. Tujuan
      await expect(sel.nth(3)).toHaveText(/^\s*\d+\s*$/); // Jumlah Order
    }

    // Improve poin 3: kota asal & kota tujuan terpilih diteruskan ke level 3.
    await expect(kota.baris.first().getByRole('link', { name: /Detail Consignee/ })).toHaveAttribute(
      'href',
      /analitikscsrconsignee\?.*PilihKota=\d+.*PilihKotaAsal=\d+/,
    );
  });

  test('Detail Consignee hanya memuat order pasangan kota terpilih dan tanpa kolom kota asal', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    const barisKota = kota.baris.first();
    const jumlahOrder = Number((await barisKota.locator('td').nth(3).innerText()).trim());
    expect(jumlahOrder, 'Jumlah Order harus angka > 0').toBeGreaterThan(0);
    await barisKota.getByRole('link', { name: /Detail Consignee/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrconsignee/);
    await expect(page.getByText(/DETAIL\s*DATA\s*CONSIGNEE/)).toBeVisible();

    const header = page.getByRole('columnheader');
    for (const pola of [/ID\s*Order/, /Consignee/, /Alamat\s*Tujuan/, /Logistic\s*Cost\s*Ratio\s*\(%\)/]) {
      await expect(header.filter({ hasText: pola })).toBeVisible();
    }
    // Improve poin 4: tidak ada kolom kota asal/tujuan di level consignee.
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Tujuan/ })).toHaveCount(0);

    // Improve poin 3: jumlah baris order = Jumlah Order pasangan kota terpilih
    // (halaman ini tanpa pagination — terverifikasi saat kalibrasi).
    const barisOrder = page
      .locator('table tbody tr')
      .filter({ has: page.locator('a[href*="order/orderdetail"]') });
    await expect(barisOrder).toHaveCount(jumlahOrder, { timeout: 45_000 });
  });
});
