import { expect, test } from '@playwright/test';
import {
  bukaKonteksAkun,
  cariNotifikasiTerbaru,
  idNotifikasiTerakhir,
  notifikasiTerbaru,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const orderId = '20260904-06501';
const inputUnitPath = '/order/inputunit/MWhTQXZlTFZHM1lXZmlFSkJqUm5Gdz09';

test('input unit order fixture memicu Kelengkapan Data Unit ke Shipper dan Admin', async ({
  browser,
  page,
}) => {
  test.setTimeout(300_000);
  const shipperContext = await bukaKonteksAkun(browser, 'shipper', process.env.SHIPPER_EMAIL);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    const [baselineShipper, baselineAdmin] = await Promise.all([
      idNotifikasiTerakhir(shipperContext, 'Order'),
      idNotifikasiTerakhir(adminContext, 'Order'),
    ]);

    const [priorTarget, priorCopy] = await Promise.all([
      cariNotifikasiTerbaru(shipperContext, {
        kategori: 'Order', judul: /Kelengkapan Data Unit/i, isi: [orderId], redirect: /order/i,
      }),
      cariNotifikasiTerbaru(adminContext, {
        kategori: 'Order', judul: /Kelengkapan Data Unit/i, isi: [orderId],
        penerima: /to (Shipper|Bid Owner)/i, redirect: /order/i,
      }),
    ]);
    if (priorTarget && priorCopy) {
      expect(priorCopy.isi).toBe(priorTarget.isi);
      return;
    }

    await page.goto('/order/OrderList');
    const existing = page.locator('table tbody tr').filter({ hasText: orderId });
    await expect(existing).toHaveCount(1, { timeout: 30_000 });
    if (await existing.getByText('PROSES PENUGASAN', { exact: true }).isVisible().catch(() => false)) {
      const [target, copy] = await Promise.all([
        notifikasiTerbaru(shipperContext, {
          kategori: 'Order', judul: /Kelengkapan Data Unit/i,
          isi: [orderId], redirect: /order/i,
        }),
        notifikasiTerbaru(adminContext, {
          kategori: 'Order', judul: /Kelengkapan Data Unit/i,
          isi: [orderId], penerima: /to (Shipper|Bid Owner)/i,
          redirect: /order/i,
        }),
      ]);
      expect(copy.isi).toBe(target.isi);
      return;
    }

    await page.goto(inputUnitPath);
    await expect(page.getByText(`Nomor Order : ${orderId}`, { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('PT. Cipta Karya Abadi Sejahtera Sentora Mujur Selalu', { exact: true }).filter({ visible: true }).first()).toBeVisible();

    const suffix = String(Date.now()).slice(-8);
    await page.locator('#nopol1').fill(`B${suffix}AT`);
    await page.locator('#nama_sopir1').fill('Kusuma Jaya Wijaya Abadi Sentosa Mujur Selalu');
    await page.locator('#telp_sopir1').fill('081246665023');
    await page.locator('#no_kontainer1').fill(`AT${suffix}`);
    await page.locator('#no_segel1').fill(`SG${suffix}`);

    page.once('dialog', (dialog) => dialog.accept());
    const save = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().includes('/order/do_input_unit_create'));
    await page.locator('#btn_submit').click();
    expect((await save).ok()).toBeTruthy();
    await expect(page.getByText('Data Unit Berhasil Disimpan')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Ke Daftar Order' }).click();
    await expect(page).toHaveURL(/\/order\/OrderList/i, { timeout: 60_000 });
    const row = page.locator('table tbody tr').filter({ hasText: orderId }).filter({ hasText: 'PROSES PENUGASAN' });
    await expect(row).toHaveCount(1, { timeout: 30_000 });

    const [target, copy] = await Promise.all([
      tungguNotifikasiBaru(shipperContext, baselineShipper, {
        kategori: 'Order', judul: /Kelengkapan Data Unit/i,
        isi: [], redirect: /order/i,
      }),
      tungguNotifikasiBaru(adminContext, baselineAdmin, {
        kategori: 'Order', judul: /Kelengkapan Data Unit/i,
        isi: [], penerima: /to (Shipper|Bid Owner)/i,
        redirect: /order/i,
      }),
    ]);
    expect(target.isi).toMatch(/unit|20260904/i);
    expect(copy.isi).toBe(target.isi);
  } finally {
    await shipperContext.close();
    await adminContext.close();
  }
});
