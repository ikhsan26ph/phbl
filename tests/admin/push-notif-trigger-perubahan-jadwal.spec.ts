import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  bukaKonteksAkun,
  idNotifikasiTerakhir,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const target = {
  order: '20260829-06504',
  lelang: 'LELANGFCU/28082026IK',
  path: '/order/ganti_jadwal/MHZROHFLSlBlKyswU0p3SlpBRm5Idz09',
};

function tambahSatuHari(nilai: string): string {
  const [dd, mm, yyyy] = nilai.split('/').map(Number);
  const date = new Date(yyyy, mm - 1, dd + 1);
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear(),
  ].join('/');
}

async function ketikTanggal(page: Page, input: Locator, nilai: string): Promise<void> {
  await input.click();
  await page.keyboard.press('Control+A');
  if (nilai) {
    await input.pressSequentially(nilai, { delay: 15 });
    await page.keyboard.press('Enter');
  } else {
    await page.keyboard.press('Backspace');
  }
  await expect(input).toHaveValue(nilai);
  await page.mouse.click(5, 5);
}

async function simpanJadwal(page: Page, openStack: string): Promise<void> {
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto(target.path);
  await expect(page.getByText(`Nomor Order : ${target.order}`, { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(target.lelang, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('PT. Muda Jaya Wijaya Karya Sentosa Indah Elok (IK)', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await ketikTanggal(page, page.locator('#open_stack'), openStack);
  await page.locator('#submitonce1').click();
  const swal = page.locator('.swal2-container').filter({ visible: true });
  await expect(swal).toContainText('Apakah anda yakin melakukan ganti jadwal');
  await swal.getByRole('button', { name: 'Ya' }).click();
  await expect(page).toHaveURL(/\/order\/orderlist/i, { timeout: 60_000 });
  await expect(page.getByRole('alert').filter({ hasText: 'Anda berhasil ganti jadwal' })).toBeVisible();
}

test('Ganti Jadwal oleh Admin mengirim Push Notif baru ke Shipper dan salinan Admin', async ({ browser, page }) => {
  test.setTimeout(360_000);
  const shipper = await bukaKonteksAkun(browser, 'shipper', process.env.SHIPPER_EMAIL);
  const admin = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  const expected = {
    kategori: 'Order', judul: /Perubahan Jadwal/i,
    isi: [target.order, target.lelang], redirect: /\/order\/orderdetail\//i,
  };

  try {
    await page.goto(target.path);
    await expect(page.locator('#open_stack')).toBeVisible({ timeout: 30_000 });
    const semula = await page.locator('#open_stack').inputValue();
    expect(semula, 'Open Stack fixture harus terisi agar dapat dikembalikan').toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    const baru = tambahSatuHari(semula);

    const [baselineShipper, baselineAdmin] = await Promise.all([
      idNotifikasiTerakhir(shipper, 'Order'),
      idNotifikasiTerakhir(admin, 'Order'),
    ]);
    let berubah = false;
    try {
      await simpanJadwal(page, baru);
      berubah = true;
      const [notifShipper, copy] = await Promise.all([
        tungguNotifikasiBaru(shipper, baselineShipper, expected),
        tungguNotifikasiBaru(admin, baselineAdmin, { ...expected, penerima: /to (Shipper|Bid Owner)/i }),
      ]);
      expect(copy.isi).toBe(notifShipper.isi);
    } finally {
      if (berubah) {
        const [baselineRevertShipper, baselineRevertAdmin] = await Promise.all([
          idNotifikasiTerakhir(shipper, 'Order'),
          idNotifikasiTerakhir(admin, 'Order'),
        ]);
        await simpanJadwal(page, semula);
        const [notifRevert, copyRevert] = await Promise.all([
          tungguNotifikasiBaru(shipper, baselineRevertShipper, expected),
          tungguNotifikasiBaru(admin, baselineRevertAdmin, { ...expected, penerima: /to (Shipper|Bid Owner)/i }),
        ]);
        expect(copyRevert.isi).toBe(notifRevert.isi);
      }
    }
  } finally {
    await shipper.close();
    await admin.close();
  }
});
