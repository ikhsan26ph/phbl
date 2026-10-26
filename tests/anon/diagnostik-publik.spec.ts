import { expect, test } from '@playwright/test';

/**
 * Modul: Keamanan — endpoint diagnostik publik (anon, tanpa login).
 * Bukan dari docs/rules: temuan keamanan (lihat report/temuan-keamanan-tunnel-2026-10-24.md).
 *
 * Fakta teramati 2026-10-24 di BASE_URL tunnel (readiness
 * test-results/local/readiness/2026-10-24T07-49-13-429Z.json): GET /user/tess
 * tanpa login → HTTP 200 + halaman phpinfo() (sama dgn temuan demo/live
 * 2026-09-30). Ekspektasi yang benar: tidak menampilkan phpinfo (idealnya 404).
 *
 * Didokumentasikan via test.fail(): begitu server diperbaiki test ini "lulus
 * tak terduga" dan runner menandainya GAGAL → hapus test.fail() saat itu.
 *
 * READ-ONLY: satu GET tanpa redirect; badan respons hanya dicek penandanya,
 * tidak dilampirkan/disimpan (isi phpinfo memuat konfigurasi server).
 */

const PENANDA_PHPINFO = /<title>PHP \d|phpinfo\(\)|PHP Version/i;

test('/user/tess tidak menampilkan phpinfo() tanpa login', async ({ request }) => {
  test.fail(true, 'Temuan keamanan 2026-10-24: /user/tess menampilkan phpinfo() tanpa login di URL tunnel publik');
  const res = await request.get('/user/tess', { maxRedirects: 0, timeout: 30_000 });
  const phpinfoTampil = PENANDA_PHPINFO.test(await res.text());
  test.info().annotations.push({ type: 'http-status', description: `GET /user/tess → HTTP ${res.status()}` });
  expect(phpinfoTampil, 'halaman phpinfo() terbuka tanpa login').toBe(false);
});
