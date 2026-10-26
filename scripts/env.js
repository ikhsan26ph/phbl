/**
 * Pemuat environment TUNGGAL — dipakai playwright.config.ts,
 * scripts/readiness-check.js, dan scripts/perf-probe.js.
 *
 * Sumber konfigurasi aplikasi hanya `.env` di root repository (2026-10-24,
 * menggantikan `.env.<target>`). File `.env.demo` / `.env.local` lama TIDAK
 * dibaca dan tidak ada fallback ke sana.
 *
 * Precedence:
 * - Kunci aplikasi (BASE_URL, ADMIN_PATH, <AKUN>_EMAIL/_PASSWORD dari
 *   scripts/targets.js): nilai `.env` SELALU menang. Variabel shell yang
 *   bertentangan ditimpa dan NAMA-nya (bukan nilainya) dilaporkan; kunci yang
 *   tidak ada di `.env` dihapus dari process.env supaya kredensial shell tidak
 *   ikut terpakai diam-diam.
 * - Variabel kontrol run (TARGET_ENV, PW_*): TIDAK pernah diambil dari `.env`
 *   — dibaca dari shell saja agar `PW_RUN_ID` dsb. tidak tertimpa.
 * - Kunci lain di `.env` (mis. APP_BUILD, DATASET): dimuat hanya bila belum
 *   di-set di shell.
 *
 * Target (`TARGET_ENV`, default `local`) kini hanya LABEL pengelompokan
 * artefak (.auth/<target>/, test-results/<target>/, playwright-report/<target>/)
 * dan aturan akun/fixture di scripts/targets.js — bukan penentu file env.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { ACCOUNTS } = require('./targets.js');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');

/** Kunci aplikasi yang wajib bersumber dari `.env`. */
const APP_KEYS = [
  'BASE_URL',
  'ADMIN_PATH',
  ...ACCOUNTS.flatMap((a) => [`${a.env}_EMAIL`, `${a.env}_PASSWORD`]),
];
const isControlKey = (k) => k === 'TARGET_ENV' || k.startsWith('PW_');

let cache = null;

function loadEnv({ quiet = false } = {}) {
  if (cache) return cache;
  if (!fs.existsSync(ENV_FILE)) {
    throw new Error(
      `File .env tidak ditemukan di root repository (${ROOT}). ` +
        'Salin .env.example ke .env lalu isi BASE_URL & kredensial. ' +
        '.env.demo/.env.local tidak dipakai lagi.',
    );
  }
  const parsed = dotenv.parse(fs.readFileSync(ENV_FILE));

  const shellConflicts = [];
  for (const key of APP_KEYS) {
    const fromFile = parsed[key];
    const fromShell = process.env[key];
    if (fromShell !== undefined && fromShell !== fromFile) shellConflicts.push(key);
    if (fromFile === undefined) delete process.env[key];
    else process.env[key] = fromFile;
  }
  const ignoredControlKeys = Object.keys(parsed).filter(isControlKey);
  for (const [key, value] of Object.entries(parsed)) {
    if (APP_KEYS.includes(key) || isControlKey(key)) continue;
    if (process.env[key] === undefined) process.env[key] = value;
  }

  const base = process.env.BASE_URL;
  let url = null;
  try { url = new URL(base); } catch { /* dilaporkan di bawah */ }
  if (!base) throw new Error('BASE_URL kosong di .env.');
  if (!url || !/^https?:$/.test(url.protocol) || url.username || url.password) {
    // Nilai tidak dicetak: bisa saja memuat kredensial.
    throw new Error('BASE_URL di .env tidak valid (wajib URL http/https tanpa user:password).');
  }

  if (!quiet) {
    if (shellConflicts.length) {
      console.warn(`[env] Variabel shell diabaikan, nilai .env dipakai: ${shellConflicts.join(', ')}`);
    }
    if (ignoredControlKeys.length) {
      console.warn(`[env] Variabel kontrol di .env diabaikan (set lewat shell): ${ignoredControlKeys.join(', ')}`);
    }
  }
  cache = { file: ENV_FILE, baseURL: base, shellConflicts, ignoredControlKeys };
  return cache;
}

module.exports = { loadEnv, ENV_FILE, APP_KEYS };
