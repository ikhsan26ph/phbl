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

const TARGETS = {
  // Demo hanya punya 6 akun; admin-sub-read tidak tersedia di sana.
  demo: { required: ['admin', 'admin-sub', 'shipper', 'shipper-sub', 'transporter', 'transporter-sub'] },
  // Lokal (pengujian rilis PHP 8.2): ketujuh role wajib.
  local: { required: ACCOUNTS.map((a) => a.name) },
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
    // 2026-10-23: dropdown Buat Lelang shipper lokal 0 opsi (master kosong).
    buatLelang: null,
  },
};

function fixture(nama, target = targetName()) {
  return FIXTURES[target]?.[nama] ?? null;
}

function targetName() {
  return process.env.TARGET_ENV ?? 'demo';
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

module.exports = { ACCOUNTS, TARGETS, FIXTURES, fixture, targetName, isRequired, credentials };
