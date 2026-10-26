import { expect, test, type Page, type TestInfo } from '@playwright/test';
import path from 'path';

/**
 * Smoke lintas role — READ-ONLY (project "smoke", dependencies setup).
 *
 * Tujuan: bukti cepat pasca-pembaruan runtime bahwa (1) sesi hasil login setup
 * benar-benar DIPAKAI ULANG (bukan hanya file sesinya ada) dan (2) halaman inti
 * tiap role terbuka tanpa HTTP 5xx, tanpa terlempar ke login, dan tanpa
 * request yang menggantung. Tidak ada klik aksi, submit, atau perubahan data:
 * hanya GET halaman + XHR pencarian yang dipicu halaman itu sendiri.
 *
 * Ekspektasi akses hanya dipasang untuk akun UTAMA sesuai menu peran di
 * docs/rules (admin/shipper/transporter). Akses menu sub user di lokal berbeda
 * dari demo dan belum dikonfirmasi → TIDAK di-assert di sini (clarification);
 * sub user hanya diuji pemakaian ulang sesi + penolakan Edit Akun Saya (rule
 * akun saya: sub user tanpa edit).
 *
 * Sengaja TIDAK memuat Master Provinsi: request pencariannya teramati
 * menggantung ±60 dtk lalu HTTP 500 dan menahan request lain (lihat
 * report/kesiapan-php82-local-2026-10-23.md); mengulanginya di setiap smoke
 * hanya menambah antrean.
 */

const { ACCOUNTS, targetName, credentials } = require('../../scripts/targets.js');

const TARGET: string = targetName();
const AUTH_DIR = path.resolve(__dirname, '..', '..', '.auth', TARGET);

/** Halaman inti per akun utama (menu peran di docs/rules). */
const HALAMAN_UTAMA: Record<string, string[]> = {
  admin: [
    '/lelang/listlelang?tab=semua-lelang',
    '/order/OrderList',
    '/lelang/pengajuannego',
    '/home/hargajadwal?tab=1',
    '/home/penugasantracking',
    '/home/notification',
    '/home/akunsaya',
    '/adminprahu/masterpelabuhan',
  ],
  shipper: [
    '/lelang/carirute',
    '/lelang/listlelang?tab=semua-lelang',
    '/order/OrderList',
    '/lelang/pengajuannego',
    '/home/notification',
    '/home/akunsaya',
  ],
  transporter: [
    '/lelang/listlelang?tab=semua-lelang',
    '/order/OrderList',
    '/lelang/pengajuannego',
    '/home/hargajadwal?tab=1',
    '/home/penugasantracking',
    '/home/notification',
    '/home/akunsaya',
  ],
};

interface HasilBuka {
  status: number | null;
  urlAkhir: string;
  respons5xx: string[];
  masihMemuat: boolean;
}

/**
 * Buka halaman dan catat respons 5xx (dokumen maupun XHR) dari origin aplikasi.
 * Penanda "Mohon tunggu sebentar" = tabel async belum selesai; ditunggu ≤20 dtk.
 */
async function buka(page: Page, url: string, testInfo: TestInfo): Promise<HasilBuka> {
  const origin = new URL(process.env.BASE_URL!).origin;
  const respons5xx: string[] = [];
  const catat = (r: import('@playwright/test').Response) => {
    if (r.status() >= 500 && r.url().startsWith(origin)) {
      respons5xx.push(`${r.request().method()} ${r.status()} ${r.url().replace(origin, '')}`);
    }
  };
  page.on('response', catat);
  try {
    const res = await page.goto(url);
    await page.waitForLoadState('load');
    // Hanya yang TERLIHAT: halaman Cari Penawaran shipper selalu membawa
    // div.loading tersembunyi berteks sama (terbukti 2026-10-23, 0 request
    // menggantung) — menghitung elemen hidden = false positive.
    const loading = page.getByText('Mohon tunggu sebentar').filter({ visible: true });
    let masihMemuat = false;
    try {
      await expect(loading).toHaveCount(0, { timeout: 20_000 });
    } catch {
      masihMemuat = true;
    }
    const hasil = { status: res?.status() ?? null, urlAkhir: page.url().replace(origin, ''), respons5xx, masihMemuat };
    for (const r of respons5xx) testInfo.annotations.push({ type: 'http-5xx', description: r });
    if (masihMemuat) testInfo.annotations.push({ type: 'request-menggantung', description: `${url} masih "Mohon tunggu sebentar" setelah 20 dtk` });
    return hasil;
  } finally {
    page.off('response', catat);
  }
}

for (const account of ACCOUNTS as Array<{ name: string; env: string; sub: boolean }>) {
  const { email, password } = credentials(account);

  test.describe(`smoke ${account.name}`, () => {
    test.skip(!email || !password, `Kredensial ${account.name} kosong di .env — dilewati`);
    test.use({ storageState: path.join(AUTH_DIR, `${account.name}.json`) });

    test('sesi hasil login setup dipakai ulang (tidak diarahkan ke login)', async ({ page }, testInfo) => {
      const hasil = await buka(page, '/home/akunsaya', testInfo);
      expect(hasil.urlAkhir, 'sesi tersimpan ditolak server (kedaluwarsa/tertendang)').not.toMatch(/\/user\/login/i);
      await expect(page.getByRole('link', { name: 'KELUAR' })).toBeVisible();
      // Identitas: sesi milik akun yang benar (bukan sesi akun lain yang
      // tersimpan di file sesi). Locator sama dgn bukaKonteksAkun
      // (tests/push-notif.trigger.ts) — email tampil di Akun Saya semua role.
      await expect(
        page.getByText(email!, { exact: true }).filter({ visible: true }).first(),
        'email akun pada halaman Akun Saya',
      ).toBeVisible({ timeout: 30_000 });
      expect(hasil.respons5xx, 'respons HTTP 5xx').toEqual([]);
    });

    if (account.sub) {
      test('sub user: Edit Akun Saya ditolak (rule akun saya)', async ({ page }, testInfo) => {
        // Penolakan dibuktikan di sisi SERVER, bukan hanya URL akhir: respons
        // asli /home/editakunsaya harus redirect 3xx (kalibrasi 2026-10-23: 302 →
        // /home/akunsaya, body kosong) dan halaman akhir tidak memuat form update.
        // Endpoint tulis (POST doupdateakunsaya) TIDAK dicoba — itu mutasi.
        const asli = page.waitForResponse((r) => /\/home\/editakunsaya$/i.test(new URL(r.url()).pathname));
        const hasil = await buka(page, '/home/editakunsaya', testInfo);
        const resAsli = await asli;
        expect(resAsli.status(), 'status respons asli /home/editakunsaya').toBeGreaterThanOrEqual(300);
        expect(resAsli.status(), 'status respons asli /home/editakunsaya').toBeLessThan(400);
        expect(hasil.respons5xx, 'respons HTTP 5xx').toEqual([]);
        expect(hasil.urlAkhir).not.toMatch(/editakunsaya/i);
        await expect(page.locator('form[action*="updateakunsaya" i]'), 'form update akun ikut dirender').toHaveCount(0);
        await expect(page.locator('.alert_negatif').filter({ visible: true })).toContainText(
          /Anda Tidak Memiliki Akses Ke Halaman Tersebut/i,
        );
      });
      return;
    }

    for (const url of HALAMAN_UTAMA[account.name] ?? []) {
      test(`halaman ${url} terbuka tanpa 5xx dan tanpa penolakan akses`, async ({ page }, testInfo) => {
        const hasil = await buka(page, url, testInfo);
        expect(hasil.status, `status dokumen ${url}`).toBeLessThan(500);
        expect(hasil.respons5xx, 'respons HTTP 5xx (dokumen/XHR)').toEqual([]);
        expect(hasil.urlAkhir, 'terlempar ke halaman login (sesi tidak berlaku)').not.toMatch(/\/user\/login/i);
        await expect(page.getByRole('link', { name: 'KELUAR' })).toBeVisible();
        await expect(
          page.locator('.alert_negatif').filter({ visible: true }),
          'akun utama ditolak mengakses menu perannya sendiri',
        ).toHaveCount(0);
        expect(hasil.masihMemuat, 'tabel masih "Mohon tunggu sebentar" setelah 20 dtk (request belum selesai)').toBe(false);
      });
    }
  });
}
