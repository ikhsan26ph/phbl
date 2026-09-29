import { expect, test, type Page, type Response } from '@playwright/test';

/**
 * Suite bersama modul Push Notif untuk akun utama Admin, Shipper, dan
 * Transporter. Rule per peran ada di docs/rules/<peran>/*-push-notif.md.
 *
 * Kalibrasi UI demo 2026-09-28:
 * - Ikon top bar: dua varian responsive `a.link-notifikasi`; varian visible
 *   menuju /home/notification. Ikon belum punya accessible name.
 * - Daftar desktop dirender AJAX dari POST /home/searchpushnotif dengan
 *   filter #status_read, #kategori, dan #valuelimit. Tombol Cek Disini bukan
 *   link; tujuan ada di atribut nonstandar `hreff` dan kliknya menandai read.
 * - Hapus/Tandai Dibaca adalah div yang digerbangi class item-disable/
 *   item-enable. Test hanya mengubah checkbox di sisi klien dan TIDAK pernah
 *   mengklik kedua aksi tersebut maupun Cek Disini, sehingga data tetap utuh.
 *
 * Suite ini tidak mencakup pemicu lintas modul (lihat
 * shipper/buat-lelang.spec.ts untuk trigger Pengajuan Lelang), eksekusi
 * redirect yang akan menandai read, hapus/tandai read, eksekusi job retensi
 * server 3 bulan, dan akun sub-user.
 */

interface PushNotifConfig {
  peran: string;
  landingPath: string;
  kategori: string[];
  tampilPenerima: boolean;
  ujiAksesibilitasIkon?: boolean;
}

interface NotificationRecord {
  ID: number;
  kategori: string;
  status_terbaca: string;
  judul: string;
  tgl: string;
  waktu: string;
  redirect: string;
  to?: string;
}

interface NotificationResponse {
  jumlah: number;
  datatbl: NotificationRecord[];
}

const notificationUrl = '/home/notification';

function isSearchResponse(response: Response, query: RegExp): boolean {
  return response.request().method() === 'POST'
    && response.url().includes('/home/searchpushnotif?')
    && query.test(decodeURIComponent(response.url()));
}

async function responseJson(response: Response): Promise<NotificationResponse> {
  expect(response.ok(), `Request daftar notifikasi gagal: ${response.status()} ${response.url()}`).toBeTruthy();
  const data = await response.json() as NotificationResponse;
  expect(data.jumlah).toBeGreaterThanOrEqual(0);
  expect(Array.isArray(data.datatbl)).toBeTruthy();
  return data;
}

async function bukaNotifikasi(page: Page): Promise<NotificationResponse> {
  const responsePromise = page.waitForResponse((response) =>
    isSearchResponse(response, /status_read=unread&kategori=all/), { timeout: 60_000 });
  await page.goto(notificationUrl);
  const data = await responseJson(await responsePromise);
  await expect(page.locator('#fi-pagination')).toHaveAttribute('data-count', String(data.jumlah));
  return data;
}

async function pilihDanTunggu(
  page: Page,
  selector: string,
  value: string,
  query: RegExp,
): Promise<NotificationResponse> {
  const responsePromise = page.waitForResponse((response) => isSearchResponse(response, query), { timeout: 60_000 });
  await page.locator(selector).selectOption(value);
  const data = await responseJson(await responsePromise);
  await expect(page.locator('#fi-pagination')).toHaveAttribute('data-count', String(data.jumlah));
  return data;
}

function desktopRows(page: Page) {
  return page.locator('#isitrayek tr[class*="notification-row-"]');
}

export function definePushNotifTests(config: PushNotifConfig): void {
  test.describe(`Push Notif (${config.peran})`, () => {
    test('ikon lonceng top bar membuka halaman Notifikasi dan indikator unread tampil', async ({ page }) => {
      await page.goto(config.landingPath);
      const link = page.locator('a.link-notifikasi').filter({ visible: true });
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', /\/home\/notification$/);
      await expect(link.locator('i.fa-bell')).toBeVisible();

      const responsePromise = page.waitForResponse((response) =>
        isSearchResponse(response, /status_read=unread&kategori=all/), { timeout: 60_000 });
      await link.click();
      await expect(page).toHaveURL(/\/home\/notification$/);
      const data = await responseJson(await responsePromise);
      if (data.jumlah > 0) {
        await expect(page.locator('.indikator-notif').filter({ visible: true })).toHaveCount(1, { timeout: 15_000 });
      }
    });

    if (config.ujiAksesibilitasIkon) {
      test('DEFECT: ikon lonceng top bar memiliki accessible name', async ({ page }) => {
        test.fail(true, 'Ikon notifikasi hanya berupa <i class="fa-bell"> tanpa teks, aria-label, atau title.');
        await page.goto(config.landingPath);
        await expect(page.locator('a.link-notifikasi').filter({ visible: true })).toHaveAccessibleName(/notifikasi/i);
      });
    }

    test('default halaman, kategori per peran, batas data, dan informasi retensi sesuai rule', async ({ page }) => {
      await bukaNotifikasi(page);
      await expect(page.locator('.heading_1, .heading_2').filter({ hasText: /^NOTIFIKASI$/ }).first()).toBeVisible();
      await expect(page.locator('#status_read')).toHaveValue('unread');
      await expect(page.locator('#kategori')).toHaveValue('all');
      await expect(page.locator('#valuelimit')).toHaveValue('50');

      await expect(page.locator('#status_read option')).toHaveText(['Belum Dibaca', 'Semua Notif']);
      await expect(page.locator('#kategori option')).toHaveText(['Filter By Kategori', ...config.kategori]);
      await expect(page.locator('#valuelimit option')).toHaveText(['20', '30', '50', '100']);
      await expect(page.getByText('*) Notifikasi akan auto terhapus 3 bulan sekali')).toBeVisible();
    });

    test('daftar unread memuat kategori, waktu, badge, checkbox, dan tujuan Cek Disini', async ({ page }) => {
      const data = await bukaNotifikasi(page);
      expect(data.jumlah, 'Akun demo perlu memiliki minimal satu notifikasi unread').toBeGreaterThan(0);

      const rows = desktopRows(page);
      await expect(rows).toHaveCount(data.datatbl.length);
      const first = rows.first();
      const expected = data.datatbl[0];
      await expect(first).toContainText(expected.kategori);
      await expect(first).toContainText(expected.tgl);
      await expect(first).toContainText(expected.waktu);
      await expect(first.locator('input[name="notif_id[]"]')).toHaveValue(String(expected.ID));
      await expect(first.locator('.notif_belum_terbaca')).toBeVisible();
      await expect(first.locator('.notif_belum_terbaca img')).toHaveAttribute('src', /Icon_Belum_Dibaca\.svg$/);

      const cek = first.getByRole('button', { name: 'Cek Disini' });
      await expect(cek).toHaveAttribute('data-id', String(expected.ID));
      await expect(cek).toHaveAttribute('hreff', expected.redirect);
      expect(new URL(expected.redirect).origin).toBe(new URL(page.url()).origin);

      if (config.tampilPenerima) {
        await expect(first).toContainText(/to (Shipper|Transporter|Admin)/);
      } else {
        await expect(first).not.toContainText(/to (Shipper|Transporter|Admin)/);
      }
    });

    test('filter Semua Notif dan kategori Lelang mengirim parameter dan menampilkan data yang sesuai', async ({ page }) => {
      const unread = await bukaNotifikasi(page);
      const all = await pilihDanTunggu(page, '#status_read', 'all', /status_read=all&kategori=all/);
      await expect(page.locator('#status_read')).toHaveValue('all');
      expect(all.jumlah).toBeGreaterThanOrEqual(unread.jumlah);
      await expect(desktopRows(page)).toHaveCount(all.datatbl.length);

      const lelang = await pilihDanTunggu(page, '#kategori', 'Lelang', /status_read=all&kategori=Lelang/);
      await expect(page.locator('#kategori')).toHaveValue('Lelang');
      expect(lelang.datatbl.every((item) => item.kategori === 'Lelang')).toBeTruthy();
      await expect(desktopRows(page)).toHaveCount(lelang.datatbl.length);
      for (const row of await desktopRows(page).all()) await expect(row).toContainText('Lelang');
    });

    test('Hapus Notif dan Tandai Dibaca hanya aktif setelah notifikasi dipilih', async ({ page }) => {
      const data = await bukaNotifikasi(page);
      expect(data.jumlah, 'Akun demo perlu memiliki notifikasi untuk menguji selection state').toBeGreaterThan(0);

      const actions = page.locator('.hapus-btn, .dibaca-btn');
      await expect(actions).toHaveCount(2);
      for (const action of await actions.all()) {
        await expect(action).toHaveClass(/item-disable/);
        await expect(action).not.toHaveClass(/item-enable/);
      }

      const first = desktopRows(page).first().locator('input[name="notif_id[]"]');
      await first.check();
      for (const action of await actions.all()) await expect(action).toHaveClass(/item-enable/);

      await first.uncheck();
      for (const action of await actions.all()) await expect(action).toHaveClass(/item-disable/);

      const selectAll = page.locator('#pilih-semua-notif');
      await selectAll.check();
      await expect(desktopRows(page).first().locator('input[name="notif_id[]"]')).toBeChecked();
      for (const action of await actions.all()) await expect(action).toHaveClass(/item-enable/);
      await selectAll.uncheck();
    });

    test('pilihan jumlah data memperbarui limit daftar tanpa mengubah notifikasi', async ({ page }) => {
      await bukaNotifikasi(page);
      const responsePromise = page.waitForResponse((response) =>
        isSearchResponse(response, /status_read=unread&kategori=all/)
          && response.request().postData()?.includes('limit=20') === true, { timeout: 60_000 });
      await page.locator('#valuelimit').selectOption('20');
      const data = await responseJson(await responsePromise);
      await expect(page.locator('#valuelimit')).toHaveValue('20');
      expect(data.datatbl.length).toBeLessThanOrEqual(20);
      await expect(desktopRows(page)).toHaveCount(data.datatbl.length);
    });
  });
}
