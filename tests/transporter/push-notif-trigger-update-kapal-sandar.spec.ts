import { expect, test } from '@playwright/test';
import { bukaKonteksAkun, cariNotifikasiTerbaru, idNotifikasiTerakhir, notifikasiTerbaru, tungguNotifikasiBaru } from '../push-notif.trigger';

const orderId = '20260904-06501';
const trackingPath = '/order/posisitracking/MWhTQXZlTFZHM1lXZmlFSkJqUm5Gdz09';
const title = /Update Kapal Sandar/i;
const today = () => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric',
}).format(new Date());

test('update Kapal Sandar memicu Push Notif Tracking ke Shipper dan Admin', async ({ browser, page }) => {
  test.setTimeout(240_000);
  const shipper = await bukaKonteksAkun(browser, 'shipper', process.env.SHIPPER_EMAIL);
  const admin = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    const [shipperId, adminId] = await Promise.all([
      idNotifikasiTerakhir(shipper, 'Tracking'), idNotifikasiTerakhir(admin, 'Tracking'),
    ]);
    const [priorTarget, priorCopy] = await Promise.all([
      cariNotifikasiTerbaru(shipper, { kategori: 'Tracking', judul: title, isi: [orderId] }),
      cariNotifikasiTerbaru(admin, { kategori: 'Tracking', judul: title, isi: [orderId], penerima: /to (Shipper|Bid Owner)/i }),
    ]);
    if (priorTarget && priorCopy) {
      expect(priorCopy.isi).toBe(priorTarget.isi);
      return;
    }
    await page.goto('/home/penugasantracking');
    const row = page.locator('table tbody tr').filter({ hasText: orderId }).filter({ has: page.locator('button:has-text("Action Menu")') });
    await expect(row).toHaveCount(1, { timeout: 30_000 });
    if (await row.getByText('KAPAL SANDAR', { exact: true }).isVisible().catch(() => false)) {
      const [target, copy] = await Promise.all([
        notifikasiTerbaru(shipper, { kategori: 'Tracking', judul: title, isi: [orderId] }),
        notifikasiTerbaru(admin, { kategori: 'Tracking', judul: title, isi: [orderId], penerima: /to (Shipper|Bid Owner)/i }),
      ]);
      expect(copy.isi).toBe(target.isi);
      return;
    }
    await page.goto(trackingPath);
    if (await page.locator('#tgstiba').isVisible().catch(() => false)) {
      await page.locator('#ptgtiba').selectOption({ label: 'AUTOTEST-FIXTURE-PETUGASAPK-01 - 089900000001' });
      const assign = page.waitForResponse((response) => response.url().includes('/order/savePenugasan/'));
      await page.locator('#tgstiba').click();
      expect((await assign).ok()).toBeTruthy();
      await page.waitForLoadState('domcontentloaded');
    }
    await page.locator('button.p_btn_no_4').click();
    await page.getByText('Isi Data Tracking', { exact: true }).filter({ visible: true }).click();
    const modal = page.locator('.modal:visible');
    await expect(modal).toContainText('KAPAL SANDAR');
    await modal.locator('#tgl_tracking').fill(today());
    const save = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/order/doSaveIsiTracking_web'));
    await page.evaluate(() => setTimeout(() => (document.querySelector('.modal.show .btn_update_kelas') as HTMLElement)?.click(), 0));
    expect((await save).ok()).toBeTruthy();
    await expect(modal).toBeHidden({ timeout: 60_000 });
    const [target, copy] = await Promise.all([
      tungguNotifikasiBaru(shipper, shipperId, { kategori: 'Tracking', judul: title, isi: [orderId] }),
      tungguNotifikasiBaru(admin, adminId, { kategori: 'Tracking', judul: title, isi: [orderId], penerima: /to (Shipper|Bid Owner)/i }),
    ]);
    expect(copy.isi).toBe(target.isi);
  } finally {
    await shipper.close();
    await admin.close();
  }
});
