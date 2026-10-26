/**
 * Sinkronkan daftar test baseline (format `tests/file:baris`) ke nomor baris TERKINI.
 *
 * Spec diedit → nomor baris bergeser → `npx playwright test file:baris` diam-diam
 * memilih test lain / tidak memilih apa pun (terjadi 2026-10-25: 0 test berjalan).
 * Skrip ini memetakan tiap lokasi baseline ke identitas test (project|file|describe›judul)
 * memakai listing saat baseline dibuat, lalu mencari baris terkininya.
 *
 *   node scripts/sinkron-daftar.js [--baseline=report/baseline-php-8.2.35] [--out=test-results/local/daftar-terkini]
 *
 * Gagal (exit 1) bila ada test baseline yang tidak ditemukan lagi — jangan lanjut run
 * sebelum diperiksa. Entri berupa file utuh (tanpa :baris) diteruskan apa adanya.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3) || d;
const BL = path.resolve(ROOT, arg('baseline', 'report/baseline-php-8.2.35'));
const OUT = path.resolve(ROOT, arg('out', 'test-results/local/daftar-terkini'));

function petakan(listing) {
  const lokasiKeId = new Map(); // "tests/file:line" -> Set(id)
  const idKeLokasi = new Map(); // id -> "tests/file:line"
  const w = (s, file, chain) => {
    file = s.file || file;
    for (const sp of s.specs || []) for (const t of sp.tests) {
      const id = `${t.projectName}|${file}|${[...chain, sp.title].join(' › ')}`;
      const loc = `tests/${file}:${sp.line}`;
      (lokasiKeId.get(loc) || lokasiKeId.set(loc, new Set()).get(loc)).add(id);
      idKeLokasi.set(id, loc);
    }
    for (const c of s.suites || []) w(c, file, c.title === c.file ? chain : [...chain, c.title]);
  };
  for (const s of listing.suites || []) w(s, null, []);
  return { lokasiKeId, idKeLokasi };
}

const lama = petakan(JSON.parse(fs.readFileSync(path.join(BL, 'listing-baseline.json'), 'utf8')));
const kini = petakan(JSON.parse(execFileSync('npx', ['playwright', 'test', '--list', '--reporter=json'], {
  cwd: ROOT, env: { ...process.env, TARGET_ENV: process.env.TARGET_ENV || 'local' }, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'],
}).toString()));

fs.mkdirSync(OUT, { recursive: true });
let hilang = 0;
for (const f of fs.readdirSync(BL).filter((x) => /^(set-readonly-lengkap|run-penuh|penuh-[a-z]+)\.txt$/.test(x))) {
  const hasil = new Set();
  for (const entri of fs.readFileSync(path.join(BL, f), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)) {
    if (!/:\d+$/.test(entri)) { hasil.add(entri); continue; }
    const ids = lama.lokasiKeId.get(entri);
    if (!ids) { console.error(`[${f}] ${entri}: tidak ada di listing baseline`); hilang++; continue; }
    for (const id of ids) {
      const loc = kini.idKeLokasi.get(id);
      if (!loc) { console.error(`[${f}] ${entri} → test "${id}" TIDAK DITEMUKAN di kode terkini`); hilang++; continue; }
      hasil.add(loc);
    }
  }
  fs.writeFileSync(path.join(OUT, f), [...hasil].join('\n') + '\n');
  const geser = [...hasil].filter((l) => /:\d+$/.test(l) && !fs.readFileSync(path.join(BL, f), 'utf8').includes(l + '\n')).length;
  console.log(`${f.padEnd(26)} ${hasil.size} entri (${geser} baris bergeser)`);
}
console.log(`Tersimpan di ${path.relative(ROOT, OUT)}/${hilang ? ` — ${hilang} TEST TIDAK DITEMUKAN` : ''}`);
process.exitCode = hilang ? 1 : 0;
