import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  bukaKonteksAkun,
  idNotifikasiTerakhir,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

const nomorLelang = 'LELANGIK/02/2026/NRML#2';

function tanggal(offsetHari: number, denganJam = false): string {
  const value = new Date(Date.now() + offsetHari * 86_400_000);
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(value);
  return denganJam ? `${date} 12:00` : date;
}

async function ajukanRequestJadwal(shipperContext: BrowserContext): Promise<void> {
  const page = await shipperContext.newPage();
  try {
    await page.goto(`/lelang/listlelang?tab=semua-lelang&status_filter=1&filter_1=${encodeURIComponent(nomorLelang)}`);
    const row = page.locator('table tbody tr').filter({ hasText: nomorLelang });
    await expect(row).toHaveCount(1, { timeout: 30_000 });
    await row.locator('button.btn_action_menu').click();
    await page.goto((await row.getByRole('link', { name: 'Lihat Harga Penawaran' }).getAttribute('href'))!);
    await expect(page.getByText('RINGKASAN LELANG')).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Request Jadwal' }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/lelang\/requestJadwal\/\d+$/i, { timeout: 30_000 });
    const request = page.getByRole('button', { name: 'Request', exact: true }).first();
    await expect(request).toBeVisible({ timeout: 30_000 });
    const profileIds = await page.locator('a[href*="/home/profilbidder/"]').evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute('href')?.match(/profilbidder\/(\d+)/)?.[1]))]
        .filter(Boolean));
    expect(profileIds).toEqual(['66']);
    const submit = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/doRequestJadwal'));
    await request.click();
    await page.locator('.swal2-container input.chek_').check();
    await page.getByRole('button', { name: 'Ya', exact: true }).click();
    expect((await submit).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/lelang\/daftarrequestjadwal\/\d+$/i, { timeout: 30_000 });
  } finally {
    await page.close();
  }
}

async function isiJadwalDirect(page: Page): Promise<void> {
  await page.locator('#ubah_harga').uncheck();
  const directValue = await page.locator('#jenis_jadwal option').evaluateAll((options) =>
    options.find((option) => /direct/i.test(option.textContent ?? ''))?.getAttribute('value'));
  expect(directValue, 'Opsi jenis jadwal Direct wajib tersedia').toBeTruthy();
  await page.locator('#jenis_jadwal + .select2 .select2-selection').click();
  await page.locator('.select2-results__option').filter({ hasText: /direct/i }).click();
  await expect(page.locator('[name="kapal"]:visible')).toBeVisible({ timeout: 30_000 });
  await page.locator('[name="kapal"]:visible').fill(`AUTOTEST-${Date.now()}`);
  await page.locator('[name="voyage"]:visible').fill('AT-001');
  await page.locator('[name="openstack"]:visible').fill(tanggal(1));
  await page.locator('[name="closing"]:visible').fill(tanggal(2, true));
  await page.locator('[name="etd"]:visible').fill(tanggal(3));
  await page.locator('[name="eta"]:visible').fill(tanggal(5));
}

test('respons Request Jadwal memicu Jadwal Telah Tersedia ke Shipper dan Admin', async ({ browser, page }) => {
  test.setTimeout(420_000);
  const shipperContext = await bukaKonteksAkun(browser, 'shipper', process.env.SHIPPER_EMAIL);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    await ajukanRequestJadwal(shipperContext);
    const [baselineShipper, baselineAdmin] = await Promise.all([
      idNotifikasiTerakhir(shipperContext, 'Lelang'),
      idNotifikasiTerakhir(adminContext, 'Lelang'),
    ]);

    await page.goto('/home/hargajadwal?tab=5');
    const row = page.locator('table tbody tr').filter({ has: page.locator('a.updatejadwal') }).first();
    await expect(row).toBeVisible({ timeout: 30_000 });
    await expect(row).toContainText('Dobo (DOB) - Bitung (BIT)');
    await expect(row).toContainText('420.000');
    await row.locator('a.updatejadwal').click();
    await expect(page).toHaveURL(/\/home\/updatejadwal\//, { timeout: 30_000 });
    await isiJadwalDirect(page);

    await page.locator('#submitonce').click();
    await expect(page.getByText(/Apakah anda yakin menyimpan update jadwal/i)).toBeVisible();
    const save = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/home/savemasterjadwal'));
    await page.getByRole('button', { name: 'Ya', exact: true }).click();
    expect((await save).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/home\/masterjadwal1\//i, { timeout: 60_000 });

    const [target, copy] = await Promise.all([
      tungguNotifikasiBaru(shipperContext, baselineShipper, {
        kategori: 'Lelang', judul: /Jadwal (?:Telah )?Tersedia/i,
        isi: [],
      }),
      tungguNotifikasiBaru(adminContext, baselineAdmin, {
        kategori: 'Lelang', judul: /Jadwal (?:Telah )?Tersedia/i,
        isi: [], penerima: /to (Shipper|Bid Owner)/i,
      }),
    ]);
    expect(target.isi).toMatch(/jadwal/i);
    expect(copy.isi).toBe(target.isi);
  } finally {
    await shipperContext.close();
    await adminContext.close();
  }
});
