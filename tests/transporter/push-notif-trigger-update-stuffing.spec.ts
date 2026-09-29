import { expect, test } from '@playwright/test';
import {
  bukaKonteksAkun,
  cariNotifikasiTerbaru,
  idNotifikasiTerakhir,
  notifikasiTerbaru,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const orderId = '20260904-06501';
const trackingPath = '/order/posisitracking/MWhTQXZlTFZHM1lXZmlFSkJqUm5Gdz09';
const petugasFixture = 'AUTOTEST-FIXTURE-PETUGASAPK-01 - 089900000001';

function tanggalHariIni(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
}

test('update Stuffing oleh Transporter memicu Push Notif Tracking ke Shipper dan Admin', async ({
  browser,
  page,
}) => {
  test.setTimeout(180_000);
  const shipperContext = await bukaKonteksAkun(browser, 'shipper', process.env.SHIPPER_EMAIL);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    const [baselineShipper, baselineAdmin] = await Promise.all([
      idNotifikasiTerakhir(shipperContext, 'Tracking'),
      idNotifikasiTerakhir(adminContext, 'Tracking'),
    ]);
    const [priorTarget, priorCopy] = await Promise.all([
      cariNotifikasiTerbaru(shipperContext, { kategori: 'Tracking', judul: /Update Stuffing/i, isi: [orderId] }),
      cariNotifikasiTerbaru(adminContext, { kategori: 'Tracking', judul: /Update Stuffing/i, isi: [orderId], penerima: /to (Shipper|Bid Owner)/i }),
    ]);
    if (priorTarget && priorCopy) {
      expect(priorCopy.isi).toBe(priorTarget.isi);
      return;
    }

    await page.goto('/home/penugasantracking');
    const existing = page.locator('table tbody tr').filter({ hasText: orderId })
      .filter({ has: page.locator('a:text-is("Tracking"), button:has-text("Action Menu")') });
    await expect(existing).toHaveCount(1, { timeout: 30_000 });
    if (await existing.getByText('STUFFING', { exact: true }).isVisible().catch(() => false)) {
      const [target, copy] = await Promise.all([
        notifikasiTerbaru(shipperContext, {
          kategori: 'Tracking', judul: /Update Stuffing/i,
          isi: [orderId], redirect: /tracking|order/i,
        }),
        notifikasiTerbaru(adminContext, {
          kategori: 'Tracking', judul: /Update Stuffing/i,
          isi: [orderId], penerima: /to (Shipper|Bid Owner)/i,
          redirect: /tracking|order/i,
        }),
      ]);
      expect(copy.isi).toBe(target.isi);
      return;
    }

    await page.goto(trackingPath);
    if (await page.locator('#tgsstuffing').isVisible().catch(() => false)) {
      await page.locator('#ptgstuffing').selectOption({ label: petugasFixture });
      await expect(page.locator('#wastuffing')).toHaveValue('089900000001');
      const assign = page.waitForResponse((response) =>
        response.request().method() === 'POST' && response.url().includes('/order/savePenugasan/'));
      await page.locator('#tgsstuffing').click();
      expect((await assign).ok()).toBeTruthy();
      await page.waitForLoadState('domcontentloaded');
    }

    const action = page.getByRole('button', { name: 'Action Menu' }).first();
    await expect(action).toBeVisible({ timeout: 30_000 });
    await action.click();
    await page.getByText('Isi Data Tracking', { exact: true }).click();
    const modal = page.locator('.modal:visible');
    await expect(modal).toContainText(`Nomor Order : ${orderId}`);
    await modal.locator('#tgl_tracking0').fill(tanggalHariIni());

    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });
    const save = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/order/doSaveIsiTracking_web'),
    { timeout: 30_000 }).catch(() => null);
    await page.evaluate(() => {
      setTimeout(() => (document.querySelector('.modal.show .btn_update_kelas') as HTMLElement)?.click(), 0);
    });
    const saveResponse = await save;
    expect(saveResponse, `Simpan tracking tidak terpanggil. Dialog: ${dialogMessage || '(tidak ada)'}`).toBeTruthy();
    expect(saveResponse!.ok()).toBeTruthy();
    await expect(modal).toBeHidden({ timeout: 60_000 });

    const [target, copy] = await Promise.all([
      tungguNotifikasiBaru(shipperContext, baselineShipper, {
        kategori: 'Tracking', judul: /Update Stuffing/i,
        isi: [orderId], redirect: /tracking|order/i,
      }),
      tungguNotifikasiBaru(adminContext, baselineAdmin, {
        kategori: 'Tracking', judul: /Update Stuffing/i,
        isi: [orderId], penerima: /to (Shipper|Bid Owner)/i,
        redirect: /tracking|order/i,
      }),
    ]);
    expect(copy.isi).toBe(target.isi);
  } finally {
    await shipperContext.close();
    await adminContext.close();
  }
});
