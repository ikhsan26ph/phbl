import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Dashboard — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/06-dashboard.md (Monitoring Pengiriman,
 * Frekuensi Pengiriman, Grafik Pengiriman)
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - Monitoring Pengiriman = /home/dashboardorder. Menu "Tampilkan Penuh" /
 *   "Export Excel" tersembunyi di dropdown yang dibuka lewat tombol ikon
 *   #btn_action_menu (tanpa accessible name) — teks item berganti jadi
 *   "Tutup" saat fullscreen aktif (toggle di elemen yang sama, bukan tombol
 *   terpisah).
 * - Fullscreen memakai Fullscreen API browser sungguhan pada elemen
 *   #full1 (bukan simulasi CSS) — diverifikasi via document.fullscreenElement.
 * - Frekuensi Pengiriman DAN Grafik Pengiriman berbagi satu halaman
 *   /home/dashboardpengiriman (bukan URL terpisah), masing-masing dengan
 *   filter tanggal, tombol "Tampilkan Penuh" sendiri (fullscreen ke #full1
 *   untuk frekuensi, #full2 untuk grafik), dan teks "Maksimal range tanggal
 *   12 Bulan" DI BAWAH filter tanggalnya.
 * - DEFECT: teks bantuan filter tanggal Frekuensi & Grafik Pengiriman
 *   menyebut "Maksimal range tanggal 12 Bulan", padahal rule menuntut
 *   maksimal 90 hari (sama seperti Monitoring Pengiriman). Didokumentasikan
 *   dengan test.fail() di bawah.
 * - Input tanggal (id #tgl_awal / #tgl_akhir, dst.) pakai jQuery UI
 *   datepicker + input mask — WAJIB isi via click + Ctrl+A + pressSequentially
 *   (bukan fill(), yang langsung ditolak mask). Mengetik tanggal akhir yang
 *   membuat rentang >90 hari dari tanggal awal membuat field tanggal akhir
 *   tetap kosong (input ditolak diam-diam, tanpa alert) — begitulah wujud
 *   pembatasan "maksimal 90 hari" pada Monitoring Pengiriman.
 *
 * Rule yang TIDAK dicakup di sini (butuh kondisi data / waktu spesifik):
 * - Auto-update dashboard saat ada pesanan baru / perubahan jadwal tracking.
 * - Data kosong pada frekuensi/grafik pengiriman (hanya tampil map polos /
 *   diagram batang kosong) — butuh akun tanpa data pesanan.
 * - Detail isi popup lokasi pada map frekuensi pengiriman (butuh data rute).
 */

const dashboardOrderUrl = '/home/dashboardorder';
const dashboardPengirimanUrl = '/home/dashboardpengiriman';

const monitoringPage = {
  actionMenuButton: (page: Page) => page.locator('#btn_action_menu'),
  tglAwal: (page: Page) => page.locator('#tgl_awal'),
  tglAkhir: (page: Page) => page.locator('#tgl_akhir'),
  cariButton: (page: Page) => page.getByRole('button', { name: ' Cari' }),
};

async function ketikTanggal(page: Page, locator: ReturnType<typeof monitoringPage.tglAwal>, tanggal: string) {
  await locator.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(tanggal);
  await page.keyboard.press('Escape');
}

test.describe('Monitoring Pengiriman', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardOrderUrl);
  });

  test('tabel menampilkan kolom sesuai rule', async ({ page }) => {
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
      'Rencana Dooring',
      'Dooring',
      'Transporter',
      'Pelabuhan Tujuan (POD)',
    ]) {
      await expect(page.getByRole('columnheader', { name: kolom, exact: true })).toBeVisible();
    }
  });

  test('rentang tanggal lebih dari 90 hari ditolak (field tanggal akhir tetap kosong)', async ({ page }) => {
    await ketikTanggal(page, monitoringPage.tglAwal(page), '01/01/2026');
    await ketikTanggal(page, monitoringPage.tglAkhir(page), '01/08/2026'); // > 90 hari dari 01/01/2026
    await expect(monitoringPage.tglAkhir(page)).toHaveValue('');
  });

  test('rentang tanggal dalam 90 hari berhasil memfilter data', async ({ page }) => {
    await ketikTanggal(page, monitoringPage.tglAwal(page), '01/07/2026');
    await ketikTanggal(page, monitoringPage.tglAkhir(page), '01/08/2026'); // 31 hari
    await monitoringPage.cariButton(page).click();
    await expect(page).toHaveURL(/tgl_awal=01%2F07%2F2026&tgl_akhir=01%2F08%2F2026/);
  });

  test('menu aksi menyediakan Tampilkan Penuh dan Export Excel', async ({ page }) => {
    await monitoringPage.actionMenuButton(page).click();
    await expect(page.getByText('Tampilkan Penuh')).toBeVisible();
    await expect(page.getByText('Export Excel')).toBeVisible();
  });

  test('Tampilkan Penuh mengaktifkan fullscreen sungguhan, Tutup menonaktifkannya', async ({ page }) => {
    const dropdown = page.locator('ul.dropnya');
    await monitoringPage.actionMenuButton(page).click();
    await dropdown.getByText('Tampilkan Penuh').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('full1');

    // Dropdown tetap terbuka setelah klik pertama (bukan auto-close khas
    // Bootstrap dropdown) — item pertama berganti teks jadi "Tutup".
    await dropdown.getByText('Tutup').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });
});

test.describe('Frekuensi Pengiriman', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardPengirimanUrl);
  });

  test('menampilkan heading, map, dan kontrol zoom', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard FREKUENSI Pengiriman' })).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zoom out' })).toBeVisible();
  });

  test('Tampilkan Penuh mengaktifkan fullscreen pada #full1', async ({ page }) => {
    // .full_frekuensi tanpa .full_pc juga ada sebagai elemen tersembunyi lain
    // di DOM — scope ke .full_pc, satu-satunya yang visible di desktop.
    await page.locator('span.full_frekuensi.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('full1');
    await page.locator('span.full_frekuensi.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('DEFECT: teks batas filter tanggal seharusnya "90 hari" sesuai rule, bukan "12 Bulan"', async ({
    page,
  }) => {
    test.fail();
    const filterFrekuensi = page.getByRole('heading', { name: 'Dashboard FREKUENSI Pengiriman' }).locator('..');
    await expect(filterFrekuensi.getByText(/Maksimal range tanggal/)).toContainText('90 hari');
  });
});

test.describe('Grafik Pengiriman', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardPengirimanUrl);
  });

  test('menampilkan heading dan diagram batang', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard Grafik Pengiriman' })).toBeVisible();
    await expect(page.locator('#myChart')).toBeVisible();
  });

  test('Tampilkan Penuh mengaktifkan fullscreen pada #full2', async ({ page }) => {
    await page.locator('span.full_grafik.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('full2');
    await page.locator('span.full_grafik.full_pc').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('DEFECT: teks batas filter tanggal seharusnya "90 hari" sesuai rule, bukan "12 Bulan"', async ({
    page,
  }) => {
    test.fail();
    const filterGrafik = page.getByRole('heading', { name: 'Dashboard Grafik Pengiriman' }).locator('..');
    await expect(filterGrafik.getByText(/Maksimal range tanggal/)).toContainText('90 hari');
  });
});
