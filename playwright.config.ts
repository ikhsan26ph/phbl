import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Peran (dipakai konsisten di seluruh project):
 * - Bid Owner  = Shipper      (UI: "Pemilik Barang")
 * - Bidder     = Transporter  (UI: "Ekspedisi")
 */
const AUTH_DIR = path.resolve(__dirname, '.auth');

/** Project ber-login: nama project = nama folder test = nama file storageState. */
const authProjects = [
  'admin',
  'admin-sub',
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
  // JSON dipakai scripts/generate-report.js untuk membuat report/hasil-testing-<tanggal>.xlsx.
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
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
