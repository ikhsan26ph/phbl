/**
 * Definisi target & akun — sumber tunggal untuk playwright.config.ts,
 * tests/auth.setup.ts, tests/smoke/, dan scripts/readiness-check.js.
 *
 * Akun WAJIB: kredensial kosong = penghambat kesiapan (login setup GAGAL).
 * Akun OPSIONAL: kredensial kosong = login di-skip.
 *
 * Pemetaan peran: Bid Owner = Shipper, Bidder = Transporter (lihat CLAUDE.md).
 */

/** name = nama project Playwright = nama file storageState. */
const ACCOUNTS = [
  { name: 'admin', env: 'ADMIN', viaAdminPath: true, sub: false },
  { name: 'admin-sub', env: 'ADMIN_SUB', viaAdminPath: true, sub: true },
  { name: 'admin-sub-read', env: 'ADMIN_SUB_READ', viaAdminPath: true, sub: true },
  { name: 'shipper', env: 'SHIPPER', viaAdminPath: false, sub: false },
  { name: 'shipper-sub', env: 'SHIPPER_SUB', viaAdminPath: false, sub: true },
  { name: 'transporter', env: 'TRANSPORTER', viaAdminPath: false, sub: false },
  { name: 'transporter-sub', env: 'TRANSPORTER_SUB', viaAdminPath: false, sub: true },
];

/**
 * Target = LABEL pengelompokan artefak & aturan (akun wajib, fixture), BUKAN
 * penentu file env — konfigurasi selalu dari .env root (scripts/env.js).
 * Default `local` (aplikasi via tunnel BASE_URL, sejak 2026-10-24); `demo`
 * dipertahankan hanya untuk aturan/riwayat lama.
 */
const DEFAULT_TARGET = 'local';

const TARGETS = {
  // Demo hanya punya 6 akun; admin-sub-read tidak tersedia di sana.
  demo: { required: ['admin', 'admin-sub', 'shipper', 'shipper-sub', 'transporter', 'transporter-sub'] },
  // Lokal: 6 akun wajib. admin-sub-read OPSIONAL sejak 2026-10-24 (keputusan
  // user: server tunnel tanpa akun baca-saja; sub admin diuji via admin-sub).
  // JANGAN isi ADMIN_SUB_READ_* dgn akun admin-sub — sesi server tunggal per
  // akun, login kedua menendang sesi admin-sub.
  local: { required: ACCOUNTS.filter((a) => a.name !== 'admin-sub-read').map((a) => a.name) },
};

/**
 * Data master yang DIPILIH oleh alur bisnis kritis per target (nama opsi
 * persis seperti tampil di dropdown). Nilai demo = literal lama di
 * tests/shipper/buat-lelang.spec.ts (terbukti lulus di demo 2026-09-29).
 * null = belum ada data/fixture sah di target itu → test alur & precondition
 * GAGAL dengan pesan jelas. JANGAN mengarang nilai: isi hanya setelah data
 * master benar-benar tersedia dan dikonfirmasi.
 */
const FIXTURES = {
  demo: {
    buatLelang: {
      pelabuhanAsal: 'Tanjung Priok',
      pelabuhanTujuan: 'Tanjung Perak',
      kotaAsal: 'Jakarta Utara',
      kotaTujuan: 'Kota Surabaya',
      jenisKontainer: '20 DRY',
    },
  },
  local: {
    // 2026-10-23 (server lokal .88/.89): dropdown 0 opsi → null.
    // 2026-10-25 (server tunnel): dropdown berisi 63 pelabuhan / 514 kota / 10 jenis
    // kontainer dan KELIMA nilai di bawah terverifikasi ada di opsi form
    // /lelang/buatlelang; ditetapkan atas instruksi user ("buat data baru").
    // Bila tunnel diarahkan ke server tanpa master ini, project precondition gagal jelas.
    buatLelang: {
      pelabuhanAsal: 'Tanjung Priok',
      pelabuhanTujuan: 'Tanjung Perak',
      kotaAsal: 'Jakarta Utara',
      kotaTujuan: 'Kota Surabaya',
      jenisKontainer: '20 DRY',
    },
  },
};

function fixture(nama, target = targetName()) {
  return FIXTURES[target]?.[nama] ?? null;
}

function targetName() {
  const target = process.env.TARGET_ENV || DEFAULT_TARGET;
  if (!TARGETS[target]) {
    throw new Error(`TARGET_ENV=${target} tidak dikenal (pilihan: ${Object.keys(TARGETS).join(', ')}).`);
  }
  return target;
}

function isRequired(accountName, target = targetName()) {
  return (TARGETS[target]?.required ?? []).includes(accountName);
}

function credentials(account) {
  return {
    email: process.env[`${account.env}_EMAIL`],
    password: process.env[`${account.env}_PASSWORD`],
  };
}

module.exports = { ACCOUNTS, DEFAULT_TARGET, TARGETS, FIXTURES, fixture, targetName, isRequired, credentials };
