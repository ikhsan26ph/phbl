/**
 * Klasifikasi kesiapan PER SKENARIO (bukan per file) — analisis STATIS.
 *
 * Input : --list=<json>   output `npx playwright test --list --reporter=json`
 *         --hasil=<json>  (opsional) results.json run lokal → kolom hasil eksekusi
 *         --out=<json>    tujuan hasil
 * Contoh:
 *   TARGET_ENV=local npx playwright test --list --reporter=json > list.json
 *   node scripts/klasifikasi-skenario.js --list=list.json --out=klasifikasi.json
 *
 * Aturan (urutan prioritas, heuristik — hasil WAJIB ditinjau QA):
 *  1. Placeholder      : spec placeholder admin-sub-read.
 *  2. Clarification    : spec akun-saya sub user yang meng-assert menu/identitas
 *                        akun demo (hak akses lokal berbeda, belum dikonfirmasi).
 *  3. Adaptasi data    : badan test (atau konstanta level-file yang dipakainya)
 *                        memuat nomor order/lelang, hash URL, fixture, email,
 *                        perusahaan/akun demo.
 *  4. Setelah data/izin: test memicu mutasi (simpan/hapus/submit/POST) ATAU
 *                        bergantung baris data (skip-on-data, panen baris).
 *  5. Siap             : selain itu (struktur, navigasi, sesi).
 *  "Di luar cakupan" dipakai bila tidak menyentuh aplikasi PHP (tidak ada saat ini).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);

const KATEGORI = {
  siap: '1. Siap dijalankan tanpa mutasi bisnis',
  data: '2. Siap setelah data tersedia (dan/atau izin mutasi)',
  adaptasi: '3. Perlu adaptasi akun/ID/data demo yang di-hardcode',
  klarifikasi: '4. Perlu clarification requirement/hak akses',
  placeholder: '5. Placeholder/belum diimplementasikan',
  luar: '6. Di luar cakupan perubahan',
};

const DEMO = [
  /\b20\d{6}-\d{5}\b/, /\b[A-Z()]{3,}\/\d{8}[A-Z]*\b/, /AUTOTEST-FIXTURE/, /AT-OS-1|AUTOTEST Kapal/,
  /\/(orderdetail|lihatdataunit|order_rating|daftarnego|detaillistLelang)\/[A-Za-z0-9=]{3,}/,
  /@(gmail|yopmail|prahu-hub)\.com/, /yopmail/i, /PT\. (Muda Jaya|Cipta Karya|Haier|Bebas Ketik|United Family)/,
  /CIMB Niaga/, /ID_LELANG/, /\(IK\)/, /KM\. (Layar|Malay|Jaya)/, /OrderID[^A-Za-z]{0,4}\d{3,}/, /\b0899\d{6,}\b/,
  /Software QC|Jumadi|Penjualan|Sub User Bidder|IK Sub Admin/, /csct@/, /\b1089\b|\b1454\b|\b1870\b/,
];
const MUTASI = [
  /\.post\(/, /#tombol_simpan|#submitonce|#tombol_submit|#simpan\b|#submitSelesai/, /btn-delete|hapus_hak_akses|do_hapus/,
  /name:\s*['"`/]\s*(Simpan|Hapus|Ya|Lanjutkan|Submit|Kirim|Konfirmasi|Masuk Ulang)\b/i,
  /getByRole\('button',\s*\{\s*name:\s*['"`/][^'"`/]*(Simpan|Hapus|Kirim|Submit|Daftar)/i,
  /dosubmit|do_buat|save_|update_|dialog\.accept|\.accept\(\)/i, /setInputFiles/,
];
const DATA = [/\.skip\(/, /tbody/, /baris|kandidat|rows\b|panen/i];

const MODUL_PRIORITAS = [
  [/auth\.setup|login|registrasi|lupa-kata-sandi|akun-saya|pengaturan-akun|validasi-akun/, 'Tinggi (autentikasi/otorisasi)'],
  [/smoke/, 'Tinggi (smoke rilis)'],
  [/pengajuan-lelang|buat-lelang|cari-penawaran|harga-jadwal|nego|daftar-order|penugasan|invoice|nomor-referensi|open-stack/, 'Tinggi (alur bisnis inti)'],
  [/master|setting|push-notif|preference/, 'Sedang'],
  [/laporan|dashboard|analitik|profil|cek-jadwal/, 'Sedang (laporan/analitik)'],
];

const src = {};
const read = (f) => (src[f] ??= fs.readFileSync(path.join(ROOT, 'tests', f), 'utf8').split('\n'));

/** Nama konstanta level-file yang inisialisasinya memuat literal demo. */
const constDemo = {};
function demoConsts(f) {
  if (constDemo[f]) return constDemo[f];
  const lines = read(f);
  const names = new Set();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)/);
    if (!m) continue;
    let block = lines[i];
    for (let j = i + 1; j < lines.length && !/^\S/.test(lines[j]); j++) block += '\n' + lines[j];
    if (DEMO.some((r) => r.test(block))) names.add(m[1]);
  }
  return (constDemo[f] = names);
}

const tests = [];
function walk(suite, chain, file) {
  const f = suite.file || file;
  for (const sp of suite.specs || []) {
    for (const t of sp.tests) tests.push({ file: sp.file || f, line: sp.line, title: sp.title, chain, project: t.projectName });
  }
  for (const s of suite.suites || []) walk(s, s.title && !/\.ts$/.test(s.title) ? [...chain, s.title] : chain, f);
}
const list = JSON.parse(fs.readFileSync(arg('list'), 'utf8'));
list.suites.forEach((s) => walk(s, [], s.file));

// Hasil eksekusi (opsional)
const hasil = {};
if (arg('hasil') && fs.existsSync(arg('hasil'))) {
  const r = JSON.parse(fs.readFileSync(arg('hasil'), 'utf8'));
  const w = (s, chain) => {
    for (const sp of s.specs || []) for (const t of sp.tests) {
      const last = t.results[t.results.length - 1] || {};
      const fail = t.status === 'expected' && t.expectedStatus === 'failed';
      hasil[`${t.projectName}|${sp.file}|${sp.line}|${sp.title}`] =
        t.status === 'expected' ? (fail ? 'LULUS (defect terdokumentasi)' : 'LULUS')
          : t.status === 'skipped' ? 'DILEWATI' : t.status === 'flaky' ? 'FLAKY' : `GAGAL: ${(last.errors?.[0]?.message || '').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0].slice(0, 160)}`;
    }
    (s.suites || []).forEach((x) => w(x, chain));
  };
  r.suites.forEach((s) => w(s, []));
}

const lineStarts = {};
for (const t of tests) (lineStarts[t.file] ??= new Set()).add(t.line);

const rows = tests.map((t) => {
  const lines = read(t.file);
  const starts = [...lineStarts[t.file]].sort((a, b) => a - b);
  const next = starts.find((l) => l > t.line) ?? lines.length + 1;
  const body = lines.slice(t.line - 1, next - 1).join('\n');
  const consts = [...demoConsts(t.file)].filter((n) => new RegExp(`\\b${n}\\b`).test(body));
  const demoBody = DEMO.filter((r) => r.test(body)).map((r) => (body.match(r) || [''])[0]);
  const mutasi = MUTASI.some((r) => r.test(body));
  const data = DATA.some((r) => r.test(body));
  const testFail = /test\.fail\(/.test(body);

  let k; let alasan;
  if (/^admin-sub-read\//.test(t.file)) { k = 'placeholder'; alasan = 'Spec placeholder (hanya cek link KELUAR)'; }
  // Login setup hanya membuat sesi; setup.skip di sana = akun opsional, bukan data.
  else if (t.file === 'auth.setup.ts') { k = 'siap'; alasan = 'Login form + simpan sesi (membuat sesi, bukan data bisnis)'; }
  else if (/^(admin-sub|shipper-sub|transporter-sub)\/akun-saya/.test(t.file) && (demoBody.length || consts.length || /menu|sidebar|Bagian Staff|Preference/i.test(body))) {
    k = 'klarifikasi'; alasan = 'Meng-assert menu/identitas sub user demo; hak akses sub user lokal berbeda & belum dikonfirmasi';
  } else if (demoBody.length || consts.length) {
    k = 'adaptasi'; alasan = `Hardcode demo: ${[...new Set([...demoBody, ...consts])].slice(0, 4).join(', ')}`;
  } else if (mutasi || data) {
    k = 'data'; alasan = [mutasi && 'memicu mutasi (butuh izin)', data && 'bergantung baris data/skip-on-data'].filter(Boolean).join('; ');
  } else { k = 'siap'; alasan = 'Struktur/navigasi/sesi tanpa data transaksi'; }

  const dep = [];
  if (/penugasan/.test(t.file)) dep.push('HTTP 500 /home/penugasantracking');
  if (/yopmail/i.test(body) || /registrasi|lupa-kata-sandi|buat-lelang|validasi-akun-mutasi/.test(t.file)) dep.push('mailbox eksternal (yopmail)');
  if (/csct@/.test(body)) dep.push('email CS di setting general');
  if (/push-notif-trigger/.test(t.file)) dep.push('alur trigger lintas role + data order');
  if (/master\.spec|master-iklan/.test(t.file) && /Provinsi/i.test(body)) dep.push('Master Provinsi timeout 500');

  return {
    project: t.project, role: t.project === 'smoke' ? (t.chain.find((c) => /^smoke /.test(c)) || '').replace('smoke ', '') : t.project,
    file: t.file, line: t.line, skenario: [...t.chain, t.title].join(' › '),
    kategori: KATEGORI[k], alasan, potensiMutasi: mutasi ? 'Ya' : 'Tidak', dependency: dep.join('; ') || '-',
    defectTerdokumentasi: testFail ? 'Ya (test.fail)' : '-',
    prioritas: (MODUL_PRIORITAS.find(([r]) => r.test(t.file)) || [0, 'Rendah'])[1],
    hasilLokal: hasil[`${t.project}|${t.file}|${t.line}|${t.title}`] || 'Belum dijalankan',
  };
});

const rekap = {};
for (const r of rows) rekap[r.kategori] = (rekap[r.kategori] || 0) + 1;
for (const k of Object.values(KATEGORI)) rekap[k] ??= 0;
fs.mkdirSync(path.dirname(path.resolve(ROOT, arg('out'))), { recursive: true });
fs.writeFileSync(path.resolve(ROOT, arg('out')), JSON.stringify({ dibuat: new Date().toISOString(), total: rows.length, rekap, rows }, null, 2));
console.log(`Total skenario: ${rows.length}`);
for (const k of Object.values(KATEGORI)) console.log(`  ${k}: ${rekap[k]}`);
