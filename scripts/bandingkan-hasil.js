/**
 * Bandingkan hasil test Playwright sebelum vs sesudah (mis. patch PHP), per test.
 *
 *   node scripts/bandingkan-hasil.js \
 *     --sebelum=report/baseline-php-8.2.35/results-gabungan.json \
 *     --sesudah=test-results/local/runs/<runA>/results.json,test-results/local/runs/<runB>/results.json \
 *     [--out=report/banding-hasil-<tgl>.md]
 *
 * Beberapa file dipisah koma → digabung, hasil TERAKHIR per test yang dipakai
 * (urutan argumen = urutan kronologis). Kunci test = project|file|describe›judul (TANPA
 * nomor baris, agar edit spec tidak membuat test tampak hilang/baru).
 *
 * Kategori perubahan:
 *   REGRESI        lulus / lulus-defect → gagal
 *   PERLU CEK      skip → gagal (test kini berjalan lalu gagal; bisa data atau regresi)
 *   PERBAIKAN      gagal → lulus
 *   DEFECT HILANG? test.fail() kini lulus ("passed unexpectedly") → cek apakah defect diperbaiki
 *   CAKUPAN TURUN  lulus → skip (biasanya data berubah)
 *   GAGAL, ERROR BERUBAH  gagal → gagal dengan pesan berbeda
 *   TIDAK DIJALANKAN      ada di sebelum, tidak ada di sesudah
 * Exit code 1 bila ada REGRESI / PERLU CEK.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
if (!arg('sebelum') || !arg('sesudah')) {
  console.error('Wajib: --sebelum=<results.json[,…]> --sesudah=<results.json[,…]> [--out=<file.md>]');
  process.exit(2);
}
const strip = (s) => (s || '').replace(/\x1b\[[0-9;]*m/g, '');

function muat(daftar) {
  const m = new Map();
  for (const f of daftar.split(',').map((s) => s.trim()).filter(Boolean)) {
    const d = JSON.parse(fs.readFileSync(path.resolve(ROOT, f), 'utf8'));
    const w = (s, file, chain) => {
      file = s.file || file;
      for (const sp of s.specs || []) for (const t of sp.tests) {
        const r = t.results[t.results.length - 1];
        if (!r || r.status === 'interrupted') continue;
        let hasil;
        if (t.status === 'skipped') hasil = 'skip';
        else if (t.status === 'flaky') hasil = 'flaky';
        else if (t.status === 'expected') hasil = t.expectedStatus === 'failed' ? 'lulus-defect' : 'lulus';
        else hasil = t.expectedStatus === 'failed' ? 'defect-hilang?' : 'gagal';
        const err = strip(r.error?.message || (r.errors && r.errors[0]?.message)).split('\n').filter((l) => l.trim())[0] || '';
        // Kunci TANPA nomor baris (baris bergeser saat spec diedit) — rantai describe
        // membuatnya unik (469/469 unik di baseline). Baris disimpan sebagai info.
        const k = `${t.projectName}|${file}|${[...chain, sp.title].filter(Boolean).join(' › ')}`;
        m.set(k, { hasil, err: err.slice(0, 220), sumber: path.basename(path.dirname(f)), baris: sp.line });
      }
      // Suite describe juga punya properti `file`; suite file dikenali dari judul = path.
      for (const c of s.suites || []) w(c, file, c.title === c.file ? chain : [...chain, c.title]);
    };
    for (const s of d.suites || []) w(s, null, []);
  }
  return m;
}

const A = muat(arg('sebelum'));
const B = muat(arg('sesudah'));
const LULUS = new Set(['lulus', 'lulus-defect']);
const kat = {};
const tambah = (k, key, a, b) => (kat[k] ||= []).push({ key, a, b });

for (const key of new Set([...A.keys(), ...B.keys()])) {
  const a = A.get(key);
  const b = B.get(key);
  if (!b) { tambah('TIDAK DIJALANKAN', key, a, null); continue; }
  if (!a) { tambah('TEST BARU', key, null, b); continue; }
  if (a.hasil === b.hasil) {
    if (a.hasil === 'gagal' && a.err.replace(/\d+(ms|s)?/g, '#') !== b.err.replace(/\d+(ms|s)?/g, '#')) tambah('GAGAL, ERROR BERUBAH', key, a, b);
    else tambah('SAMA', key, a, b);
    continue;
  }
  if (b.hasil === 'gagal' && LULUS.has(a.hasil)) tambah('REGRESI', key, a, b);
  else if (b.hasil === 'gagal' && a.hasil === 'skip') tambah('PERLU CEK', key, a, b);
  else if (b.hasil === 'defect-hilang?') tambah('DEFECT HILANG?', key, a, b);
  else if (a.hasil === 'gagal' && LULUS.has(b.hasil)) tambah('PERBAIKAN', key, a, b);
  else if (LULUS.has(a.hasil) && b.hasil === 'skip') tambah('CAKUPAN TURUN', key, a, b);
  else tambah('PERUBAHAN LAIN', key, a, b);
}

const URUT = ['REGRESI', 'PERLU CEK', 'GAGAL, ERROR BERUBAH', 'DEFECT HILANG?', 'PERBAIKAN', 'CAKUPAN TURUN', 'PERUBAHAN LAIN', 'TIDAK DIJALANKAN', 'TEST BARU', 'SAMA'];
const hitung = (m) => [...m.values()].reduce((o, x) => ((o[x.hasil] = (o[x.hasil] || 0) + 1), o), {});
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');
const md = [
  '# Perbandingan hasil test — sebelum vs sesudah',
  '',
  `- Sebelum: \`${arg('sebelum')}\` → ${A.size} test ${JSON.stringify(hitung(A))}`,
  `- Sesudah: \`${arg('sesudah')}\` → ${B.size} test ${JSON.stringify(hitung(B))}`,
  '',
  '| Kategori | Jumlah |',
  '|---|---|',
  ...URUT.filter((k) => kat[k]).map((k) => `| ${k} | ${kat[k].length} |`),
  '',
  ...URUT.filter((k) => kat[k] && k !== 'SAMA').flatMap((k) => [
    `## ${k} (${kat[k].length})`,
    '',
    '| Test | Sebelum | Sesudah | Error sesudah | Error sebelum |',
    '|---|---|---|---|---|',
    ...kat[k].map(({ key, a, b }) => `| ${esc(key)} (baris ${b?.baris ?? a?.baris}) | ${a?.hasil ?? '-'} | ${b?.hasil ?? '-'} | ${esc(b?.err)} | ${esc(a?.err)} |`),
    '',
  ]),
].join('\n');
if (arg('out')) { fs.writeFileSync(path.resolve(ROOT, arg('out')), md); console.log(`Tersimpan: ${arg('out')}`); }
console.log(md.split('\n').slice(0, 6 + URUT.filter((k) => kat[k]).length + 2).join('\n'));
process.exitCode = kat.REGRESI || kat['PERLU CEK'] ? 1 : 0;
