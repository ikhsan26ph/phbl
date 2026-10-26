import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * BASE_URL & kredensial SELALU dari `.env` root (scripts/env.js; .env.demo /
 * .env.local tidak dibaca). TARGET_ENV (default `local`) hanya LABEL yang
 * memisahkan artefak per target dan per RUN agar bukti run sebelumnya
 * (termasuk kegagalan pertama) tidak hilang:
 *   .auth/<target>/<peran>.json
 *   test-results/<target>/runs/<runId>/   playwright-report/<target>/<runId>/
 */
const { loadEnv } = require('./scripts/env.js');
const { targetName } = require('./scripts/targets.js');
loadEnv();
const TARGET: string = targetName();
// Diteruskan ke helper test (auth.setup, push-notif.trigger) & generator report.
process.env.TARGET_ENV = TARGET;

// Run ID & versi suite dihitung SEKALI di proses utama lalu diwariskan lewat env
// ke worker (config dievaluasi ulang di tiap worker; tanpa ini tiap worker
// menghitung stempel waktu berbeda). PW_RUN_ID boleh di-set manual.
const pad = (n: number) => String(n).padStart(2, '0');
const now = new Date();
process.env.PW_RUN_ID ??=
  `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
  `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const RUN_ID = process.env.PW_RUN_ID;
if (!process.env.PW_SUITE_VERSION) {
  try {
    // HEAD + sidik jari perubahan lokal (diff tracked + isi file untracked di
    // tests/ & scripts/), supaya dua run dengan isi spec berbeda tidak tampak
    // bervers sama (terjadi 2026-10-23: spec smoke berubah di antara run).
    const git = (a: string) => execSync(`git ${a}`, { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const head = git('rev-parse --short HEAD').trim();
    const untracked = git('ls-files --others --exclude-standard -- tests scripts').split('\n').filter(Boolean).sort();
    const hash = createHash('sha1').update(git('diff HEAD'));
    for (const f of untracked) hash.update(f).update(fs.readFileSync(path.join(__dirname, f)));
    const dirty = git('status --porcelain --untracked-files=no').trim() || untracked.length;
    process.env.PW_SUITE_VERSION = dirty ? `${head}+lokal-${hash.digest('hex').slice(0, 8)}` : head;
  } catch {
    process.env.PW_SUITE_VERSION = 'Belum diketahui';
  }
}
const RUN_DIR = `test-results/${TARGET}/runs/${RUN_ID}`;

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
  // Per target & per run: Playwright MEMBERSIHKAN outputDir di awal run, jadi
  // folder bersama akan menghapus artefak/hasil run atau target lain.
  outputDir: RUN_DIR,
  // JSON dipakai scripts/generate-report.js untuk membuat
  // report/hasil-testing-<tanggal>-<jam>-<target>.xlsx.
  reporter: [
    ['html', { outputFolder: `playwright-report/${TARGET}/${RUN_ID}`, open: 'never' }],
    ['json', { outputFile: `${RUN_DIR}/results.json` }],
  ],
  // Dibaca generator report (JSON reporter tidak menyimpan use.baseURL).
  // Build/runtime/dataset aplikasi tidak bisa dibaca otomatis dari UI → isi
  // lewat env APP_BUILD / APP_RUNTIME / DATASET bila dev/DevOps sudah memberi.
  metadata: {
    target: TARGET,
    baseURL: process.env.BASE_URL,
    runId: RUN_ID,
    suiteVersion: process.env.PW_SUITE_VERSION,
    appBuild: process.env.APP_BUILD || 'Belum diketahui',
    appRuntime: process.env.APP_RUNTIME || 'Belum diketahui',
    dataset: process.env.DATASET || 'Belum diketahui',
  },
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
      // Login saja boleh diulang: 2026-10-25 dua kali seluruh project admin
      // (192 test) batal karena gangguan tunnel sesaat (GET / 57,9 dtk; HTTP 530
      // Cloudflare). Retry tercatat sebagai "flaky" di laporan, tidak tersembunyi.
      retries: 2,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Smoke lintas role, READ-ONLY (sesi tersimpan dipakai ulang + halaman
      // inti tanpa 5xx). storageState di-set per describe di dalam spec.
      name: 'smoke',
      testMatch: 'smoke/**/*.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Precondition alur bisnis kritis, READ-ONLY; gagal dengan daftar data
      // yang kurang. storageState di-set per describe/konteks di dalam spec.
      name: 'precondition',
      testMatch: 'precondition/**/*.spec.ts',
      dependencies: ['setup'],
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
