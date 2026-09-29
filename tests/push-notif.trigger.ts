import { devices, expect, type Browser, type BrowserContext } from '@playwright/test';
import path from 'path';

export type AuthRole = 'admin' | 'shipper' | 'transporter';

export interface PushNotificationRecord {
  ID: number;
  kategori: string;
  status_terbaca: string;
  judul: string;
  isi: string;
  redirect: string;
  to?: string;
  tgl_buat: string;
  expired: string;
}

interface PushNotificationResponse {
  jumlah: number;
  datatbl: PushNotificationRecord[];
}

interface ExpectedNotification {
  kategori: string;
  judul: RegExp;
  isi: Array<string | RegExp>;
  penerima?: RegExp;
  redirect?: RegExp;
}

const authDirectory = path.resolve(__dirname, '..', '.auth');

/**
 * Membuka sesi penerima terpisah memakai akun fixture yang dibuat setup.
 * Email diverifikasi ke halaman Akun Saya agar trigger tidak pernah diarahkan
 * ke akun di luar keenam email yang dikonfigurasi pada .env.
 */
export async function bukaKonteksAkun(
  browser: Browser,
  role: AuthRole,
  expectedEmail: string | undefined,
): Promise<BrowserContext> {
  expect(expectedEmail, `Email fixture ${role} wajib tersedia di .env`).toBeTruthy();
  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    baseURL: process.env.BASE_URL,
    storageState: path.join(authDirectory, `${role}.json`),
  });
  const accountPage = await context.newPage();
  try {
    await accountPage.goto('/home/akunsaya');
    await expect(
      accountPage.getByText(expectedEmail!, { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible({ timeout: 30_000 });
    return context;
  } catch (error) {
    await context.close();
    throw error;
  } finally {
    await accountPage.close().catch(() => {});
  }
}

/** Nama perusahaan akun utama dari halaman Akun Saya. */
export async function namaPerusahaan(context: BrowserContext): Promise<string> {
  const page = await context.newPage();
  try {
    await page.goto('/home/akunsaya');
    const label = page.getByRole('cell', { name: /^Nama Perusahaan\s*:/ }).filter({ visible: true }).first();
    await expect(label).toBeVisible({ timeout: 30_000 });
    return (await label.locator('xpath=following-sibling::td[1]').innerText()).trim();
  } finally {
    await page.close();
  }
}

/**
 * Ambil alias peserta dari daftar Validasi Transporter milik Admin dengan
 * filter email exact. Halaman pilih peserta menggunakan alias, bukan nama
 * perusahaan maupun email, sehingga lookup ini menjaga identitasnya tetap
 * tertaut ke fixture yang sudah diverifikasi.
 */
export async function aliasTransporter(
  adminContext: BrowserContext,
  email: string,
  expectedCompany: string,
): Promise<string> {
  const page = await adminContext.newPage();
  try {
    await page.goto('/home/bidder');
    await page.getByRole('button', { name: /Filter/ }).first().click();
    await page.locator('input[name="filter_2"]').fill(email);
    await page.getByRole('button', { name: /Filter/ }).last().click();

    const emailCell = page.getByRole('cell', { name: email, exact: true });
    await expect(emailCell).toHaveCount(1, { timeout: 30_000 });
    const row = emailCell.locator('xpath=ancestor::tr[1]');
    await expect(row).toContainText(expectedCompany);
    await expect(row).toContainText('AKTIF');
    const alias = (await row.locator('td').nth(2).innerText()).trim();
    expect(alias, `Alias transporter ${email} tidak boleh kosong`).not.toBe('');
    return alias;
  } finally {
    await page.close();
  }
}

async function daftarNotifikasi(
  context: BrowserContext,
  kategori: string,
): Promise<PushNotificationResponse> {
  const response = await context.request.post(
    `/home/searchpushnotif?status_read=all&kategori=${encodeURIComponent(kategori)}`,
    {
      form: {
        limit: '100',
        out: 'out',
        pageNow: '1',
        sortBy: '',
        pencarian: '',
        sortType: 'ASC',
      },
    },
  );
  expect(response.ok(), `Gagal membaca Push Notif: ${response.status()}`).toBeTruthy();
  const data = await response.json() as PushNotificationResponse | 'out';
  expect(data, 'Session penerima Push Notif tidak boleh logout').not.toBe('out');
  const result = data as PushNotificationResponse;
  expect(Array.isArray(result.datatbl)).toBeTruthy();
  return result;
}

/** Ambil record terbaru yang cocok untuk verifikasi ulang trigger one-shot. */
export async function cariNotifikasiTerbaru(
  context: BrowserContext,
  expected: ExpectedNotification,
): Promise<PushNotificationRecord | undefined> {
  const data = await daftarNotifikasi(context, expected.kategori);
  return data.datatbl.find((item) => {
    if (item.kategori !== expected.kategori || !expected.judul.test(item.judul)) return false;
    if (expected.penerima && !expected.penerima.test(item.to ?? '')) return false;
    return expected.isi.every((value) => typeof value === 'string' ? item.isi.includes(value) : value.test(item.isi));
  });
}

export async function notifikasiTerbaru(
  context: BrowserContext,
  expected: ExpectedNotification,
): Promise<PushNotificationRecord> {
  const found = await cariNotifikasiTerbaru(context, expected);
  expect(found, `Notifikasi ${expected.kategori}/${expected.judul} tidak ditemukan`).toBeTruthy();
  expect(new URL(found!.redirect).origin).toBe(new URL(process.env.BASE_URL!).origin);
  if (expected.redirect) expect(found!.redirect).toMatch(expected.redirect);
  return found!;
}

export async function notifikasiDenganId(
  context: BrowserContext,
  kategori: string,
  id: number,
): Promise<PushNotificationRecord | undefined> {
  const data = await daftarNotifikasi(context, kategori);
  return data.datatbl.find((item) => Number(item.ID) === id);
}

export async function idNotifikasiTerakhir(
  context: BrowserContext,
  kategori: string,
): Promise<number> {
  const data = await daftarNotifikasi(context, kategori);
  return data.datatbl.reduce((max, item) => Math.max(max, Number(item.ID)), 0);
}

/** Poll inbox sampai record baru yang cocok dengan payload trigger muncul. */
export async function tungguNotifikasiBaru(
  context: BrowserContext,
  afterId: number,
  expected: ExpectedNotification,
): Promise<PushNotificationRecord> {
  let found: PushNotificationRecord | undefined;
  await expect.poll(async () => {
    const data = await daftarNotifikasi(context, expected.kategori);
    found = data.datatbl.find((item) => {
      if (Number(item.ID) <= afterId || item.kategori !== expected.kategori || !expected.judul.test(item.judul)) {
        return false;
      }
      if (expected.penerima && !expected.penerima.test(item.to ?? '')) return false;
      return expected.isi.every((value) => typeof value === 'string' ? item.isi.includes(value) : value.test(item.isi));
    });
    return found?.ID ?? 0;
  }, {
    message: `Notifikasi baru ${expected.kategori}/${expected.judul} tidak diterima`,
    timeout: 90_000,
    intervals: [1_000, 2_000, 3_000, 5_000],
  }).toBeGreaterThan(afterId);

  expect(found).toBeTruthy();
  expect(found!.status_terbaca).toBe('belum');
  expect(new URL(found!.redirect).origin).toBe(new URL(process.env.BASE_URL!).origin);
  if (expected.redirect) expect(found!.redirect).toMatch(expected.redirect);

  const dibuat = new Date(found!.tgl_buat.replace(' ', 'T')).getTime();
  const kedaluwarsa = new Date(found!.expired.replace(' ', 'T')).getTime();
  const umurHari = (kedaluwarsa - dibuat) / 86_400_000;
  expect(umurHari).toBeGreaterThanOrEqual(89);
  expect(umurHari).toBeLessThanOrEqual(93);
  return found!;
}
