import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Target environment dipilih lewat TARGET_ENV (demo | local, default demo).
 * Tiap target punya env file, storageState, dan hasil run sendiri sehingga
 * run ke satu target tidak menimpa target lain:
 *   .env.<target>   .auth/<target>/<peran>.json   test-results/<target>/
 */
const TARGET = process.env.TARGET_ENV ?? 'demo';
const ENV_FILE = path.resolve(__dirname, `.env.${TARGET}`);
if (!fs.existsSync(ENV_FILE)) {
  throw new Error(
    `TARGET_ENV=${TARGET}: file ${path.basename(ENV_FILE)} tidak ditemukan. ` +
      'Salin .env.example ke file itu lalu isi BASE_URL & kredensial.',
  );
}
dotenv.config({ path: ENV_FILE, quiet: true });
// Diteruskan ke helper test (auth.setup, push-notif.trigger) & generator report.
process.env.TARGET_ENV = TARGET;

/**
 * Peran (dipakai konsisten di seluruh project):
 * - Bid Owner  = Shipper      (UI: "Pemilik Barang")
 * - Bidder     = Transporter  (UI: "Ekspedisi")
 */
const AUTH_DIR = path.resolve(__dirname, '.auth', TARGET);

/** Project ber-login: nama project = nama folder test = nama file storageState. */
const authProjects = [
  'admin',
  'admin-sub',
  'admin-sub-read',
  'shipper',
  'shipper-sub',
  'transporter',
  'transporter-sub',
] as const;

export default defineConfig({
  testDir: './tests',
  // Sengaja TIDAK fullyParallel: aplikasi menyimpan flash message (mis. alert
  // "Nomor Lelang Tidak Ditemukan") di session server, dan semua test satu peran
  // berbagi session login yang sama (storageState) — test paralel saling
  // mengonsumsi flash message milik test lain (terbukti flaky 2026-08-13).
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // workers: 1 juga di lokal (2026-08-20): fullyParallel false hanya
  // menserikan test DI DALAM satu file — antar-file tetap paralel, dan
  // dengan 5 file transporter server demo mulai timeout di bawah beban
  // beberapa worker satu akun (terbukti: 2 run gabungan, tiap run 1 test
  // acak gagal timeout; serial = hijau semua).
  workers: 1,
  // Server demo punya lonjakan latensi sporadis (halaman kadang >30 dtk;
  // teramati berulang 2026-08-20) — 60 dtk memberi ruang tanpa menutupi
  // regresi nyata.
  timeout: 60_000,
  // Per target: Playwright MEMBERSIHKAN outputDir di awal run, jadi folder
  // bersama akan menghapus artefak/hasil target lain.
  outputDir: `test-results/${TARGET}`,
  // JSON dipakai scripts/generate-report.js untuk membuat
  // report/hasil-testing-<tanggal>-<jam>-<target>.xlsx.
  reporter: [
    ['html', { outputFolder: `playwright-report/${TARGET}` }],
    ['json', { outputFile: `test-results/${TARGET}/results.json` }],
  ],
  // Dibaca generator report (JSON reporter tidak menyimpan use.baseURL).
  metadata: { target: TARGET, baseURL: process.env.BASE_URL },
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Test tanpa login: modul Login, Registrasi, Lupa Kata Sandi.
      name: 'anon',
      testMatch: 'anon/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    ...authProjects.map((name) => ({
      name,
      testMatch: `${name}/**/*.spec.ts`,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(AUTH_DIR, `${name}.json`),
      },
    })),
  ],
});
