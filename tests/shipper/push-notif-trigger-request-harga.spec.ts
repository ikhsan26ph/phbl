import { expect, test } from '@playwright/test';
import {
  aliasTransporter,
  bukaKonteksAkun,
  cariNotifikasiTerbaru,
  idNotifikasiTerakhir,
  namaPerusahaan,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const nomorLelang = 'LELANGIK/247/2026/MLTD';

function tanggalJamMendatang(offsetJam: number): string {
  const date = new Date(Date.now() + offsetJam * 3_600_000);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date).replace(',', '');
}

test('Request Update Harga hanya ke Transporter fixture memicu Push Notif Transporter dan Admin', async ({
  browser,
  page,
}) => {
  test.setTimeout(240_000);
  const transporterContext = await bukaKonteksAkun(browser, 'transporter', process.env.TRANSPORTER_EMAIL);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    const company = await namaPerusahaan(transporterContext);
    await aliasTransporter(adminContext, process.env.TRANSPORTER_EMAIL!, company);
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
    const requestButton = page.getByRole('button', { name: 'Request Harga' }).filter({ visible: true }).first();
    if (await requestButton.isDisabled()) {
      const [target, copy] = await Promise.all([
        cariNotifikasiTerbaru(transporterContext, {
          kategori: 'Lelang', judul: /Request Update \/ Input Harga/i,
          isi: [], redirect: /tab=perlu-update-harga/,
        }),
        cariNotifikasiTerbaru(adminContext, {
          kategori: 'Lelang', judul: /Request Update \/ Input Harga/i,
          isi: [], penerima: /to (Transporter|Bidder)/i,
          redirect: /tab=perlu-update-harga/,
        }),
      ]);
      expect(target, 'Request sebelumnya harus punya notifikasi Transporter').toBeTruthy();
      expect(copy, 'Request sebelumnya harus punya salinan notifikasi Admin').toBeTruthy();
      expect(decodeURIComponent(target!.redirect)).toContain(nomorLelang);
      expect(copy!.isi).toBe(target!.isi);
      return;
    }
    await requestButton.click();
    await expect(page).toHaveURL(/\/lelang\/request_update_harga\/\d+$/, { timeout: 30_000 });

    await page.waitForFunction(() => {
      const jq = (window as any).jQuery;
      const button = document.querySelector('#tombol_submit');
      return Boolean(jq && button && jq._data(button, 'events')?.click?.length);
    }, undefined, { timeout: 90_000 });

    const desktopChecks = page.locator('table.table_bidder tbody input.pilih_semua_bidder[normal="yes"]');
    for (const checkbox of await desktopChecks.all()) {
      if (await checkbox.isChecked()) await checkbox.uncheck();
    }
    const targetRow = page.locator('table.table_bidder tbody tr').filter({ hasText: company });
    await expect(targetRow).toHaveCount(1);
    await targetRow.locator('input.pilih_semua_bidder').check();
    const selectedIds = await page.locator('.pilih_semua_bidder[normal="yes"]:checked').evaluateAll((items) =>
      [...new Set(items.map((item) => (item as HTMLInputElement).dataset.id))]);
    expect(selectedIds).toHaveLength(1);
    await expect(page.locator('.jumlah_pilih_bidder').filter({ visible: true })).toHaveText('1');

    const date = page.locator('#tanggal_tutup_update_harga');
    await date.click();
    await page.keyboard.type(tanggalJamMendatang(4));
    await page.keyboard.press('Escape');
    await expect(date).not.toHaveValue('');

    const checkOffer = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/cek_lelang_ada_penawaran'));
    await page.locator('#tombol_submit').click();
    expect((await checkOffer).ok()).toBeTruthy();
    await expect(page.getByText(/Apakah anda yakin request harga/)).toBeVisible({ timeout: 30_000 });

    const submit = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/do_request_update_harga'));
    await page.getByRole('button', { name: 'Ya', exact: true }).click();
    expect((await submit).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/lelang\/listLelang\?tab=lelang-diproses$/i, { timeout: 30_000 });

    const [target, copy] = await Promise.all([
      tungguNotifikasiBaru(transporterContext, baselineTransporter, {
        kategori: 'Lelang', judul: /Request Update \/ Input Harga/i,
        isi: [/mengajukan permintaan update \/ Input harga/i],
        redirect: /tab=perlu-update-harga/,
      }),
      tungguNotifikasiBaru(adminContext, baselineAdmin, {
        kategori: 'Lelang', judul: /Request Update \/ Input Harga/i,
        isi: [/mengajukan permintaan update \/ Input harga/i],
        penerima: /to (Transporter|Bidder)/i,
        redirect: /tab=perlu-update-harga/,
      }),
    ]);
    expect(decodeURIComponent(target.redirect)).toContain(nomorLelang);
    expect(copy.isi).toBe(target.isi);
  } finally {
    await transporterContext.close();
    await adminContext.close();
  }
});
