import { expect, test } from '@playwright/test';
import {
  bukaKonteksAkun,
  idNotifikasiTerakhir,
  namaPerusahaan,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const nomorLelang = 'LELANGIK/02/2026/NRML#2';

test('Request Jadwal ke Transporter fixture memicu Push Notif Transporter dan Admin', async ({
  browser,
  page,
}) => {
  test.setTimeout(240_000);
  const transporterContext = await bukaKonteksAkun(browser, 'transporter', process.env.TRANSPORTER_EMAIL);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    const company = await namaPerusahaan(transporterContext);
    const [baselineTransporter, baselineAdmin] = await Promise.all([
      idNotifikasiTerakhir(transporterContext, 'Lelang'),
      idNotifikasiTerakhir(adminContext, 'Lelang'),
    ]);

    await page.goto(`/lelang/listlelang?tab=semua-lelang&status_filter=1&filter_1=${encodeURIComponent(nomorLelang)}`);
    const row = page.locator('table tbody tr').filter({ hasText: nomorLelang });
    await expect(row).toHaveCount(1, { timeout: 30_000 });
    await row.locator('button.btn_action_menu').click();
    const offerUrl = await row.getByRole('link', { name: 'Lihat Harga Penawaran' }).getAttribute('href');
    await page.goto(offerUrl!);
    await expect(page.getByText('RINGKASAN LELANG')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Request Jadwal' }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/lelang\/requestJadwal\/\d+$/i, { timeout: 30_000 });

    const requestButtons = page.getByRole('button', { name: 'Request', exact: true });
    await expect(requestButtons.first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(company, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    const profileIds = await page.locator('a[href*="/home/profilbidder/"]').evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute('href')?.match(/profilbidder\/(\d+)/)?.[1]))]
        .filter(Boolean),
    );
    expect(profileIds, 'Semua penawaran yang dapat dipilih wajib milik Transporter fixture ID 66').toEqual(['66']);

    const submit = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/doRequestJadwal'));
    await requestButtons.first().click();
    await expect(page.getByText('Request Jadwal Ke Transporter', { exact: true })).toBeVisible();
    await page.locator('.swal2-container input.chek_').check();
    await page.getByRole('button', { name: 'Ya', exact: true }).click();
    expect((await submit).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/lelang\/daftarrequestjadwal\/\d+$/i, { timeout: 30_000 });

    const [target, copy] = await Promise.all([
      tungguNotifikasiBaru(transporterContext, baselineTransporter, {
        kategori: 'Lelang', judul: /(?:Shipper|Bid Owner) Request Jadwal/i,
        isi: [], redirect: /hargajadwal.*tab=5/i,
      }),
      tungguNotifikasiBaru(adminContext, baselineAdmin, {
        kategori: 'Lelang', judul: /(?:Shipper|Bid Owner) Request Jadwal/i,
        isi: [], penerima: /to (Transporter|Bidder)/i,
        redirect: /hargajadwal.*tab=5/i,
      }),
    ]);
    expect(target.isi).toMatch(/minta jadwal terbaru pada penawaran lelang/i);
    expect(copy.isi).toBe(target.isi);
    expect(decodeURIComponent(target.redirect)).toContain(nomorLelang);
  } finally {
    await transporterContext.close();
    await adminContext.close();
  }
});
