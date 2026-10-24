/**
 * Pemeriksaan kesiapan target sebelum menjalankan suite — AMAN & READ-ONLY.
 *
 * Jalankan (TARGET_ENV WAJIB eksplisit, tidak ada default):
 *   TARGET_ENV=local npm run readiness
 *   TARGET_ENV=local npm run readiness -- --out=report/evidence-x/readiness.json
 *
 * Pemeriksaan:
 *  1. Statis: file .env.<target>, BASE_URL, host lokal (bukan 127.0.0.1/localhost —
 *     cookie sesi terikat host), kredensial akun WAJIB/opsional (scripts/targets.js;
 *     hanya NAMA variabel yang dilaporkan), file sesi .auth/<target>/ (ada + umur,
 *     isi tidak dibaca).
 *  2. Jaringan (hanya target local; target lain butuh --allow-remote): satu GET
 *     /user/login (status, waktu, X-Powered-By, ada/tidaknya header Server,
 *     atribut cookie TANPA nilai) dan satu GET /user/tess tanpa redirect (status
 *     + penanda phpinfo; badan respons dibuang, tidak disimpan).
 *
 * Tidak login, tidak submit form, tidak memanggil action diagnostik lain.
 * Exit code 1 bila ada PENGHAMBAT (env/akun wajib/host/aplikasi tak terjangkau);
 * temuan keamanan dilaporkan sebagai observasi, bukan penghambat menjalankan suite.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { ACCOUNTS, TARGETS, isRequired, credentials } = require('./targets.js');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const outArg = (args.find((a) => a.startsWith('--out=')) || '').slice('--out='.length);
const allowRemote = args.includes('--allow-remote');

const TARGET = process.env.TARGET_ENV;
if (!TARGET) {
  console.error('TARGET_ENV wajib di-set eksplisit (mis. TARGET_ENV=local). Tidak ada default untuk pemeriksaan ini.');
  process.exit(2);
}
if (!TARGETS[TARGET]) {
  console.error(`TARGET_ENV=${TARGET} tidak dikenal (pilihan: ${Object.keys(TARGETS).join(', ')}).`);
  process.exit(2);
}

const hasil = { target: TARGET, waktu: new Date().toISOString(), penghambat: [], observasi: [], cek: [] };
const cek = (item, status, detail) => hasil.cek.push({ item, status, detail });

const envFile = path.join(ROOT, `.env.${TARGET}`);
if (!fs.existsSync(envFile)) {
  hasil.penghambat.push(`File .env.${TARGET} tidak ada`);
  cek(`.env.${TARGET}`, 'GAGAL', 'tidak ditemukan');
} else {
  dotenv.config({ path: envFile, quiet: true });
  cek(`.env.${TARGET}`, 'OK', 'ada');
}

const base = process.env.BASE_URL;
let host = '';
try { host = new URL(base).hostname; } catch { /* dicek di bawah */ }
if (!base || !host) {
  hasil.penghambat.push('BASE_URL kosong/tidak valid');
  cek('BASE_URL', 'GAGAL', base ? 'tidak valid' : 'kosong');
} else {
  cek('BASE_URL', 'OK', base);
  if (TARGET === 'local' && /^(127\.0\.0\.1|localhost)$/i.test(host)) {
    hasil.penghambat.push(`BASE_URL local memakai ${host}; wajib host konsisten (cookie sesi terikat host)`);
    cek('Host local', 'GAGAL', host);
  }
}

for (const a of ACCOUNTS) {
  const { email, password } = credentials(a);
  const wajib = isRequired(a.name, TARGET);
  const lengkap = Boolean(email && password);
  if (!lengkap && wajib) hasil.penghambat.push(`Akun WAJIB ${a.name} (${a.env}_EMAIL/${a.env}_PASSWORD) kosong`);
  cek(`Akun ${a.name}`, lengkap ? 'OK' : wajib ? 'GAGAL' : 'DILEWATI', `${wajib ? 'wajib' : 'opsional'}; kredensial ${lengkap ? 'terisi' : 'kosong'}`);

  const sesi = path.join(ROOT, '.auth', TARGET, `${a.name}.json`);
  if (fs.existsSync(sesi)) {
    const umurMenit = Math.round((Date.now() - fs.statSync(sesi).mtimeMs) / 60000);
    cek(`Sesi ${a.name}`, 'INFO', `file ada, umur ${umurMenit} mnt (validitas dibuktikan lewat project smoke, bukan keberadaan file)`);
  } else {
    cek(`Sesi ${a.name}`, 'INFO', 'file belum ada (jalankan project setup)');
  }
}

async function jaringan() {
  if (!base || !host) return;
  if (TARGET !== 'local' && !allowRemote) {
    cek('Pemeriksaan jaringan', 'DILEWATI', `target ${TARGET} bukan local; tambahkan --allow-remote bila memang diizinkan`);
    return;
  }
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(new URL('/user/login', base), { redirect: 'manual', signal: AbortSignal.timeout(30_000) });
  } catch (e) {
    hasil.penghambat.push(`GET /user/login gagal: ${e.name === 'TimeoutError' ? 'timeout request 30 dtk' : e.message}`);
    cek('GET /user/login', 'GAGAL', String(e.message || e));
    return;
  }
  await res.arrayBuffer();
  const ms = Date.now() - t0;
  cek('GET /user/login', res.status < 400 ? 'OK' : 'GAGAL', `HTTP ${res.status}, ${ms} ms`);
  if (res.status >= 400) hasil.penghambat.push(`GET /user/login HTTP ${res.status}`);
  const xpb = res.headers.get('x-powered-by');
  cek('X-Powered-By', 'INFO', xpb || 'tidak ada');
  hasil.runtimeTeramati = xpb || 'Belum diketahui';
  cek('Header Server', 'INFO', res.headers.get('server') || 'tidak ada');
  cek('Nama header respons', 'INFO', [...res.headers.keys()].join(', '));
  for (const c of res.headers.getSetCookie()) {
    const [pair, ...attrs] = c.split(';').map((s) => s.trim());
    const nama = pair.split('=')[0];
    const low = attrs.map((x) => x.toLowerCase());
    const httpOnly = low.includes('httponly');
    const secure = low.includes('secure');
    const sameSite = (attrs.find((x) => /^samesite=/i.test(x)) || '').split('=')[1] || 'tidak di-set';
    cek(`Cookie ${nama}`, 'INFO', `HttpOnly=${httpOnly}, Secure=${secure}, SameSite=${sameSite} (nilai tidak dicatat)`);
    if (!httpOnly) hasil.observasi.push(`Cookie ${nama} tanpa HttpOnly`);
    if (sameSite === 'tidak di-set') hasil.observasi.push(`Cookie ${nama} tanpa SameSite eksplisit`);
  }

  try {
    const r = await fetch(new URL('/user/tess', base), { redirect: 'manual', signal: AbortSignal.timeout(30_000) });
    const body = await r.text();
    const phpinfo = /<title>PHP \d|phpinfo\(\)|PHP Version/i.test(body);
    cek('GET /user/tess (tanpa login)', phpinfo ? 'TEMUAN' : 'OK', `HTTP ${r.status}; phpinfo tampil: ${phpinfo ? 'ya' : 'tidak'} (badan respons tidak disimpan)`);
    if (phpinfo) hasil.observasi.push('/user/tess menampilkan phpinfo tanpa login');
  } catch (e) {
    cek('GET /user/tess (tanpa login)', 'INFO', `gagal: ${e.message}`);
  }
}

jaringan().then(() => {
  const w = Math.max(...hasil.cek.map((c) => c.item.length));
  console.log(`Pemeriksaan kesiapan — target ${TARGET} — ${hasil.waktu}`);
  for (const c of hasil.cek) console.log(`  ${c.item.padEnd(w)}  ${c.status.padEnd(8)}  ${c.detail}`);
  console.log(`Penghambat (${hasil.penghambat.length}): ${hasil.penghambat.join(' | ') || '-'}`);
  console.log(`Observasi (${hasil.observasi.length}): ${hasil.observasi.join(' | ') || '-'}`);
  const out = outArg
    ? path.resolve(ROOT, outArg)
    : path.join(ROOT, 'test-results', TARGET, 'readiness', `${hasil.waktu.replace(/[:.]/g, '-')}.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(hasil, null, 2));
  console.log(`Bukti tersimpan: ${path.relative(ROOT, out)}`);
  process.exitCode = hasil.penghambat.length ? 1 : 0;
});
