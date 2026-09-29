import { expect, test } from '@playwright/test';
import {
  bukaKonteksAkun,
  idNotifikasiTerakhir,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

test('perubahan data akun Shipper memicu Konfirmasi Perubahan Data ke Admin', async ({ browser, page }) => {
  test.fail(
    true,
    'DEFECT server demo: POST /home/doupdateakunsaya/65 mengembalikan HTTP 500, sehingga alur konfirmasi dan notifikasi perubahan akun belum dapat dipicu.',
  );
  test.setTimeout(240_000);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    const baseline = await idNotifikasiTerakhir(adminContext, 'Akun');
    await page.goto('/home/editakunsaya');
    const name = page.locator('#nama_lengkap');
    await expect(name).toBeEditable({ timeout: 30_000 });
    const original = await name.inputValue();
    expect(original).not.toContain('[AUTOTEST]');
    await name.fill(`${original} [AUTOTEST]`);

    const submit = page.waitForResponse((response) =>
      response.request().method() === 'POST' && /\/home\/doupdateakunsaya\/65$/.test(response.url()));
    await page.getByRole('button', { name: /Simpan/ }).click();
    expect((await submit).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/home\/akunsaya$/i, { timeout: 60_000 });

    const notification = await tungguNotifikasiBaru(adminContext, baseline, {
      kategori: 'Akun', judul: /Konfirmasi Perubahan Data/i,
      isi: [/Cipta Karya/i], penerima: /to Admin/i,
    });
    expect(notification.redirect).toMatch(/bidowner/i);
  } finally {
    await adminContext.close();
  }
});
