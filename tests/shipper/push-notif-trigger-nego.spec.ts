import { expect, test } from '@playwright/test';
import {
  bukaKonteksAkun,
  idNotifikasiTerakhir,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const nomorLelang = 'LELANGIK/02/2026/NRML#2';

test('pengajuan nego ke Transporter fixture memicu Push Notif Transporter dan Admin', async ({
  browser,
  page,
}) => {
  test.fail(
    true,
    'DEFECT server demo: POST /home/dosubmitnego mengembalikan HTTP 500, sehingga Pengajuan Nego dan notifikasi hasil nego belum dapat dipicu.',
  );
  test.setTimeout(300_000);
  const transporterContext = await bukaKonteksAkun(browser, 'transporter', process.env.TRANSPORTER_EMAIL);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    const [baselineTransporter, baselineAdmin] = await Promise.all([
      idNotifikasiTerakhir(transporterContext, 'Lelang'),
      idNotifikasiTerakhir(adminContext, 'Lelang'),
    ]);

    await page.goto(`/lelang/listlelang?tab=semua-lelang&status_filter=1&filter_1=${encodeURIComponent(nomorLelang)}`);
    const auction = page.locator('table tbody tr').filter({ hasText: nomorLelang });
    await expect(auction).toHaveCount(1, { timeout: 30_000 });
    await auction.locator('button.btn_action_menu').click();
    await page.goto((await auction.getByRole('link', { name: 'Lihat Harga Penawaran' }).getAttribute('href'))!);
    await expect(page.getByText('RINGKASAN LELANG')).toBeVisible({ timeout: 30_000 });

    const target = page.locator('.tombolNego[data-hargaid="1707"]').filter({ visible: true }).first();
    await expect(target).toBeVisible({ timeout: 30_000 });
    await expect(target.locator('xpath=ancestor::tr[1]')).toContainText('PT. Muda Jaya Wijaya Karya Sentosa Indah Elok (IK)');
    await target.click();
    const modal = page.locator('#myModal');
    await modal.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    if (await modal.isVisible()) {
      await expect(modal).toContainText('BERHASIL DITAMBAHKAN KE DAFTAR NEGO');
      await page.goto((await modal.locator('a.linkmodal').getAttribute('href'))!);
    } else {
      await page.goto('/home/daftarnego/991');
    }

    await expect(page).toHaveURL(/\/home\/daftarnego\/991$/i);
    await expect(page.getByText(nomorLelang, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('PT. Muda Jaya Wijaya Karya Sentosa Indah Elok (IK)', { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(page.getByText('Rp. 31.500.000', { exact: true }).filter({ visible: true })).toBeVisible();
    await page.locator('#jumlahnego_web').fill('30000000');

    page.once('dialog', (dialog) => dialog.accept());
    const submit = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/home/dosubmitnego'));
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await submit).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/lelang\/pengajuannego/i, { timeout: 60_000 });

    const [targetNotif, copy] = await Promise.all([
      tungguNotifikasiBaru(transporterContext, baselineTransporter, {
        kategori: 'Lelang', judul: /Pengajuan Nego/i,
        isi: [], redirect: /lelang\/pengajuannego/i,
      }),
      tungguNotifikasiBaru(adminContext, baselineAdmin, {
        kategori: 'Lelang', judul: /Pengajuan Nego/i,
        isi: [], penerima: /to (Transporter|Bidder)/i,
        redirect: /lelang\/pengajuannego/i,
      }),
    ]);
    expect(targetNotif.isi).toMatch(/nego/i);
    expect(copy.isi).toBe(targetNotif.isi);
  } finally {
    await transporterContext.close();
    await adminContext.close();
  }
});
