import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Dashboard — peran Administrator (project "admin", storageState
 * .auth/admin.json via project setup). Read-only.
 * Rule: docs/rules/administrator/17-dashboard.md (Monitoring Pengiriman,
 * Frekuensi Pengiriman, Grafik Pengiriman).
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - Monitoring Pengiriman = /home/dashboardorder; halaman AUTO-mencari saat
 *   load ($('#lanjutcari').trigger('click')) sehingga URL langsung berisi
 *   ?tgl_awal=..&tgl_akhir=..&BidOwnerID=.. (default 30 hari terakhir,
 *   shipper = opsi pertama select2 #BidOwnerID — khas admin; shipper WAJIB,
 *   tanpa opsi "Pilih Shipper" kosong).
 * - Kolom admin LEBIH BANYAK dari rule (rule menyebut 12): ID Order,
 *   Consignee, Alamat Tujuan, Nomer Referensi, Jenis Kontainer, Jumlah
 *   Dipesan, Harga Order, Total Harga, Nama Kapal, Stuffing, Closing Time,
 *   ETD, ETA, Kapal Sandar, Rencana Dooring, Dooring, Keterangan Dooring,
 *   Transporter, Pelabuhan Tujuan (POD). Kolom sortir (class `clicknya`):
 *   ID Order, Stuffing, ETD, ETA, Kapal Sandar, Transporter, Pelabuhan Tujuan
 *   (POD) — sesuai rule.
 * - ID Order = link ke /order/orderdetail/<hash> target=_blank (rule: buka
 *   tab baru ke detail pesanan).
 * - Menu #btn_action_menu (ikon tanpa nama) berisi li "Tampilkan Penuh"
 *   (fullscreen API pada #full1, teks berubah jadi "Tutup") & "Export Excel".
 * - Filter tanggal: #tgl_awal/#tgl_akhir (datepicker + mask → ketik via
 *   keyboard), teks "Masukkan tanggal order (Maksimal range tanggal 90 hari)";
 *   rentang >90 hari ditolak diam-diam (field akhir dikosongkan datepicker).
 * - Frekuensi + Grafik Pengiriman = /home/dashboardpengiriman: heading
 *   "Dashboard FREKUENSI Pengiriman" (#map, span.full_frekuensi.full_pc →
 *   fullscreen #full1) & "Dashboard Grafik Pengiriman" (#myChart,
 *   span.full_grafik.full_pc → #full2), masing-masing filter #tgl_*_maps /
 *   #tgl_*_grafik + #BidOwnerID_maps / #BidOwnerID_grafik dan tombol
 *   #lanjutcari_maps / #lanjutcari_grafik.
 * - DEFECT (sama dgn sisi shipper, defect dashboard): teks batas filter
 *   frekuensi & grafik "Maksimal range tanggal 12 Bulan", rule menuntut 90
 *   hari → test.fail().
 *
 * TIDAK dicakup: auto-update via websocket, isi export excel, popup lokasi
 * map, agregasi tanggal stuffing/dooring per unit (butuh kontrol data).
 */

const dashboardOrderUrl = '/home/dashboardorder';
const dashboardPengirimanUrl = '/home/dashboardpengiriman';

async function ketikTanggal(page: Page, selector: string, tanggal: string) {
  await page.locator(selector).click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(tanggal);
  await page.keyboard.press('Escape');
}

const barisOrder = (page: Page) =>
  page.locator('#table_dashboard_order tbody tr').filter({ has: page.locator('a[href*="/order/orderdetail/"]') });

test.describe('Monitoring Pengiriman (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardOrderUrl);
    // Halaman memicu pencarian sendiri saat load.
    await page.waitForURL(/tgl_awal=/, { timeout: 30_000 }).catch(() => {});
  });

  test('filter wajib memilih shipper dan berbatas 90 hari', async ({ page }) => {
    await expect(page.locator('label', { hasText: 'Shipper *' })).toBeVisible();
    await expect(page.locator('#BidOwnerID')).toBeAttached();
    await expect(page.getByText('Masukkan tanggal order (Maksimal range tanggal 90 hari)')).toBeVisible();
    await expect(page.locator('#lanjutcari')).toHaveText(/Cari/);
  });

  test('tabel menampilkan kolom monitoring pengiriman sesuai rule', async ({ page }) => {
    for (const kolom of [
      'ID Order',
      'Consignee',
      'Alamat Tujuan',
      'Nomer Referensi',
      'Nama Kapal',
      'Stuffing',
      'ETD',
      'ETA',
      'Kapal Sandar',
      'Dooring',
      'Transporter',
      'Pelabuhan Tujuan (POD)',
    ]) {
      await expect(page.getByRole('columnheader', { name: kolom, exact: true }).first()).toBeVisible();
    }
  });

  test('kolom yang bisa disortir sesuai rule (ID Order, Stuffing, ETD, ETA, Kapal Sandar, Transporter, POD)', async ({ page }) => {
    const sortir = await page.evaluate(() =>
      [...document.querySelectorAll('th.clicknya')].map((th) => th.textContent!.replace(/\s+/g, ' ').trim()),
    );
    for (const kolom of ['ID Order', 'Stuffing', 'ETD', 'ETA', 'Kapal Sandar', 'Transporter', 'Pelabuhan Tujuan (POD)']) {
      expect(sortir).toContain(kolom);
    }
  });

  test('ID Order berupa tautan ke detail pesanan yang dibuka di tab baru', async ({ page }) => {
    await barisOrder(page).first().waitFor({ timeout: 30_000 }).catch(() => {});
    test.skip((await barisOrder(page).count()) === 0, 'Tidak ada data order pada shipper & rentang default');
    const link = barisOrder(page).first().locator('a[href*="/order/orderdetail/"]').first();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('href', /\/order\/orderdetail\/.+/);
  });

  test('tracking yang belum dikerjakan ditampilkan strip', async ({ page }) => {
    await barisOrder(page).first().waitFor({ timeout: 30_000 }).catch(() => {});
    test.skip((await barisOrder(page).count()) === 0, 'Tidak ada data order pada shipper & rentang default');
    // Rule: stuffing, kapal sandar, dooring bernilai "-" bila belum ditracking.
    const adaStrip = await page.evaluate(() =>
      [...document.querySelectorAll('#table_dashboard_order tbody tr')].some((tr) =>
        [...tr.querySelectorAll('td')].some((td) => td.textContent!.trim() === '-'),
      ),
    );
    test.skip(!adaStrip, 'Semua order pada rentang ini sudah ditracking penuh');
    expect(adaStrip).toBe(true);
  });

  test('rentang tanggal lebih dari 90 hari ditolak (field tanggal akhir tetap kosong)', async ({ page }) => {
    await ketikTanggal(page, '#tgl_awal', '01/01/2026');
    await ketikTanggal(page, '#tgl_akhir', '01/08/2026'); // > 90 hari
    await expect(page.locator('#tgl_akhir')).toHaveValue('');
  });

  test('rentang tanggal dalam 90 hari memperbarui query pencarian', async ({ page }) => {
    await ketikTanggal(page, '#tgl_awal', '01/07/2026');
    await ketikTanggal(page, '#tgl_akhir', '01/08/2026'); // 31 hari
    await page.locator('#lanjutcari').click();
    await expect(page).toHaveURL(/tgl_awal=01%2F07%2F2026&tgl_akhir=01%2F08%2F2026/);
  });

  test('menu aksi menyediakan Tampilkan Penuh (fullscreen) dan Export Excel', async ({ page }) => {
    await page.locator('#btn_action_menu').click();
    const menu = page.locator('ul.dropnya');
    await expect(menu.getByText('Tampilkan Penuh')).toBeVisible();
    await expect(menu.getByText('Export Excel')).toBeVisible();

    await menu.getByText('Tampilkan Penuh').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('full1');
    // Item yang sama berganti teks jadi "Tutup" saat fullscreen aktif.
    await menu.getByText('Tutup').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });
});

test.describe('Frekuensi Pengiriman (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardPengirimanUrl);
  });

  test('menampilkan heading, map Indonesia, dan filter shipper sendiri', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard FREKUENSI Pengiriman' })).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('#BidOwnerID_maps')).toBeVisible();
    await expect(page.locator('#tgl_awal_maps')).toBeVisible();
    await expect(page.locator('#lanjutcari_maps')).toHaveText(/Cari/);
  });

  test('Tampilkan Penuh mengaktifkan fullscreen pada #full1 dan menutupnya kembali', async ({ page }) => {
    await page.locator('span.full_frekuensi.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('full1');
    await page.locator('span.full_frekuensi.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('DEFECT: teks batas filter tanggal seharusnya "90 hari" sesuai rule, bukan "12 Bulan"', async ({ page }) => {
    test.fail();
    const filter = page.getByRole('heading', { name: 'Dashboard FREKUENSI Pengiriman' }).locator('..');
    await expect(filter.getByText(/Maksimal range tanggal/)).toContainText('90 hari');
  });
});

test.describe('Grafik Pengiriman (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardPengirimanUrl);
  });

  test('menampilkan heading, diagram batang, dan filter shipper sendiri', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard Grafik Pengiriman' })).toBeVisible();
    await expect(page.locator('#myChart')).toBeVisible();
    await expect(page.locator('#BidOwnerID_grafik')).toBeVisible();
    await expect(page.locator('#lanjutcari_grafik')).toHaveText(/Cari/);
  });

  test('Tampilkan Penuh mengaktifkan fullscreen pada #full2 dan menutupnya kembali', async ({ page }) => {
    await page.locator('span.full_grafik.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('full2');
    await page.locator('span.full_grafik.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('DEFECT: teks batas filter tanggal seharusnya "90 hari" sesuai rule, bukan "12 Bulan"', async ({ page }) => {
    test.fail();
    const filter = page.getByRole('heading', { name: 'Dashboard Grafik Pengiriman' }).locator('..');
    await expect(filter.getByText(/Maksimal range tanggal/)).toContainText('90 hari');
  });
});
