import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  bukaKonteksAkun,
  idNotifikasiTerakhir,
  notifikasiDenganId,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const nomorLelang = 'LELANGIK/02/2026/NRML#2';

async function triggerRequestJadwal(shipperContext: BrowserContext): Promise<void> {
  const page = await shipperContext.newPage();
  try {
    await page.goto(`/lelang/listlelang?tab=semua-lelang&status_filter=1&filter_1=${encodeURIComponent(nomorLelang)}`);
    const row = page.locator('table tbody tr').filter({ hasText: nomorLelang });
    await expect(row).toHaveCount(1, { timeout: 30_000 });
    await row.locator('button.btn_action_menu').click();
    await page.goto((await row.getByRole('link', { name: 'Lihat Harga Penawaran' }).getAttribute('href'))!);
    await page.getByRole('button', { name: 'Request Jadwal' }).filter({ visible: true }).first().click();
    const request = page.getByRole('button', { name: 'Request', exact: true }).first();
    await expect(request).toBeVisible({ timeout: 30_000 });
    const save = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/doRequestJadwal'));
    await request.click();
    await page.locator('.swal2-container input.chek_').check();
    await page.getByRole('button', { name: 'Ya', exact: true }).click();
    expect((await save).ok()).toBeTruthy();
  } finally {
    await page.close();
  }
}

function responseAksi(response: import('@playwright/test').Response, type: string, id: number): boolean {
  const postData = decodeURIComponent(response.request().postData() ?? '');
  return response.request().method() === 'POST'
    && response.url().endsWith('/home/hapusBacaNotif')
    && postData.includes(`type=${type}`)
    && postData.includes(`ids[]=${id}`);
}

async function pilihNotif(page: Page, id: number): Promise<void> {
  const row = page.locator(`#isitrayek .notification-row-${id}`);
  await expect(row).toHaveCount(1, { timeout: 30_000 });
  await row.locator('input[name="notif_id[]"]').check();
}

test('notifikasi hasil trigger dapat ditandai dibaca lalu dihapus dari inbox Transporter', async ({
  browser,
  page,
}) => {
  test.setTimeout(300_000);
  const shipperContext = await bukaKonteksAkun(browser, 'shipper', process.env.SHIPPER_EMAIL);
  try {
    const baseline = await idNotifikasiTerakhir(page.context(), 'Lelang');
    await triggerRequestJadwal(shipperContext);
    const notification = await tungguNotifikasiBaru(page.context(), baseline, {
      kategori: 'Lelang', judul: /Shipper Request Jadwal|Bid Owner Request Jadwal/i,
      isi: [/minta jadwal terbaru/i], redirect: /home\/hargajadwal/i,
    });

    const initial = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().includes('/home/searchpushnotif?status_read=unread&kategori=all'));
    await page.goto('/home/notification');
    await initial;
    await pilihNotif(page, notification.ID);

    const read = page.waitForResponse((response) => responseAksi(response, 'dibaca', notification.ID));
    await page.locator('.dibaca-btn').click();
    expect((await read).ok()).toBeTruthy();
    await expect.poll(async () => (await notifikasiDenganId(page.context(), 'Lelang', notification.ID))?.status_terbaca)
      .not.toBe('belum');

    const all = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().includes('/home/searchpushnotif?status_read=all&kategori=all'));
    await page.locator('#status_read').selectOption('all');
    await all;
    await pilihNotif(page, notification.ID);

    const remove = page.waitForResponse((response) => responseAksi(response, 'hapus', notification.ID));
    await page.locator('.hapus-btn').click();
    await page.getByRole('button', { name: 'Ya', exact: true }).click();
    expect((await remove).ok()).toBeTruthy();
    await expect.poll(async () => notifikasiDenganId(page.context(), 'Lelang', notification.ID))
      .toBeUndefined();
  } finally {
    await shipperContext.close();
  }
});
