/**
 * Bandingkan dua hasil probe plugin (scripts/plugin-probe.js) — sebelum vs sesudah.
 *
 *   node scripts/bandingkan-plugin.js \
 *     --sebelum=report/baseline-php-8.2.35/plugin-hasil.json \
 *     --inst-sebelum=report/baseline-php-8.2.35/plugin-inst.json \
 *     --sesudah=report/evidence-plugin-<tgl>/hasil.json [--out=report/banding-plugin-<tgl>.md]
 *
 * Yang dilaporkan hanya PERUBAHAN per halaman: status HTTP, error JS baru/hilang,
 * respons ≥400 baru/hilang, file JS/CSS baru/hilang, plugin $.fn & global yang
 * hilang/baru, instance plugin yang berubah. Error yang sudah ada di baseline
 * tidak dilaporkan ulang sebagai temuan baru.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const baca = (p) => JSON.parse(fs.readFileSync(path.resolve(ROOT, p), 'utf8'));
if (!arg('sebelum') || !arg('sesudah')) {
  console.error('Wajib: --sebelum=<hasil.json> --sesudah=<hasil.json> [--inst-sebelum=<inst.json>] [--out=<file.md>]');
  process.exit(2);
}
const A = baca(arg('sebelum'));
const B = baca(arg('sesudah'));
const instA = arg('inst-sebelum') ? new Map(baca(arg('inst-sebelum')).map((x) => [x.role + '|' + x.page, x])) : new Map();

const INST_KEYS = ['select2', 'daterangepicker', 'datepicker', 'mask', 'chart', 'leafletMap', 'floatThead', 'multiSelect', 'ckeditor'];
const origin = (x) => { try { return new URL(x.res.find((r) => r.t === 'document')?.u || '').origin; } catch { return ''; } };
const norm = (u, o) => u.replace(o, '').replace(/[?#].*/, '');
// Nomor baris inline berubah bila HTML berubah → error dibandingkan tanpa nomor baris.
const errKey = (e) => e.m.replace(/:\d+:\d+/g, '');
const inst = (x, side) => (x.inst ? x.inst : side === 'A' ? instA.get(x.role + '|' + x.page) || {} : {});
const set = (arr) => new Set(arr);
const beda = (a, b) => ({ baru: [...b].filter((v) => !a.has(v)), hilang: [...a].filter((v) => !b.has(v)) });

const mapA = new Map(A.map((x) => [x.role + '|' + x.page, x]));
const mapB = new Map(B.map((x) => [x.role + '|' + x.page, x]));
const out = [];
const ringkas = { halamanSama: 0, halamanBerubah: 0, errorJsBaru: 0, consoleErrorBaru: 0, respon400Baru: 0, statusBerubah: 0, fileHilang: 0, pluginHilang: 0 };

for (const key of new Set([...mapA.keys(), ...mapB.keys()])) {
  const a = mapA.get(key);
  const b = mapB.get(key);
  if (!a || !b) { out.push({ key, catatan: [!a ? 'halaman BARU di sesudah' : 'halaman TIDAK diperiksa di sesudah'] }); continue; }
  const oA = origin(a);
  const oB = origin(b);
  const cat = [];
  if (a.status !== b.status) { cat.push(`STATUS ${a.status} → ${b.status}`); ringkas.statusBerubah++; }
  if (b.navError && !a.navError) cat.push(`GAGAL NAVIGASI: ${b.navError}`);
  if (a.loggedIn !== b.loggedIn && a.role !== 'anon') cat.push(`status login ${a.loggedIn} → ${b.loggedIn}`);
  const pe = beda(set(a.pageErrors.map(errKey)), set(b.pageErrors.map(errKey)));
  pe.baru.forEach((e) => cat.push(`ERROR JS BARU: ${e}`)); pe.hilang.forEach((e) => cat.push(`error JS hilang: ${e}`)); ringkas.errorJsBaru += pe.baru.length;
  // console.error (mis. kegagalan handshake WebSocket, resource gagal) — host & angka dinormalkan.
  const ceKey = (c, o) => c.m.replace(o, '').replace(/https?:\/\/[^/\s'"]+/g, '<host>').replace(/wss?:\/\/[^/\s'"]+/g, '<ws-host>').replace(/\d{3,}/g, '#').slice(0, 160);
  const ce = beda(set(a.consoleErrors.map((c) => ceKey(c, oA))), set(b.consoleErrors.map((c) => ceKey(c, oB))));
  ce.baru.forEach((e) => cat.push(`CONSOLE ERROR BARU: ${e}`)); ce.hilang.forEach((e) => cat.push(`console error hilang: ${e}`)); ringkas.consoleErrorBaru += ce.baru.length;
  const bad = beda(set(a.res.filter((r) => r.s >= 400).map((r) => `${r.s} ${norm(r.u, oA)}`)), set(b.res.filter((r) => r.s >= 400).map((r) => `${r.s} ${norm(r.u, oB)}`)));
  bad.baru.forEach((e) => cat.push(`RESPONS ≥400 BARU: ${e}`)); bad.hilang.forEach((e) => cat.push(`respons ≥400 hilang: ${e}`)); ringkas.respon400Baru += bad.baru.length;
  const fl = beda(set([...(a.scripts || []), ...(a.css || [])].map((u) => norm(u, oA))), set([...(b.scripts || []), ...(b.css || [])].map((u) => norm(u, oB))));
  fl.hilang.forEach((e) => cat.push(`FILE JS/CSS tidak dimuat lagi: ${e}`)); fl.baru.forEach((e) => cat.push(`file JS/CSS baru: ${e}`)); ringkas.fileHilang += fl.hilang.length;
  const fn = beda(set(a.jqfn || []), set(b.jqfn || []));
  if (fn.hilang.length) { cat.push(`PLUGIN $.fn HILANG: ${fn.hilang.join(', ')}`); ringkas.pluginHilang += fn.hilang.length; }
  if (fn.baru.length) cat.push(`plugin $.fn baru: ${fn.baru.join(', ')}`);
  if ((a.jq || null) !== (b.jq || null)) cat.push(`versi jQuery ${a.jq} → ${b.jq}`);
  const iA = inst(a, 'A');
  const iB = inst(b, 'B');
  if (Object.keys(iA).length && Object.keys(iB).length) {
    for (const k of INST_KEYS) if ((iA[k] || 0) !== (iB[k] || 0) && k in iA) cat.push(`instance ${k}: ${iA[k] || 0} → ${iB[k] || 0}`);
  }
  const lambat = b.ms - a.ms;
  if (b.ms > 30_000 && lambat > 20_000) cat.push(`LAMBAT: ${Math.round(a.ms / 1000)} → ${Math.round(b.ms / 1000)} dtk`);
  if (cat.length) { ringkas.halamanBerubah++; out.push({ key, catatan: cat }); } else ringkas.halamanSama++;
}

const tidakLogin = B.filter((x) => x.role !== 'anon' && x.loggedIn === false && (x.status ?? 0) < 400).map((x) => `${x.role}:${x.page}`);
const md = [
  '# Perbandingan probe plugin — sebelum vs sesudah',
  '',
  `- Sebelum: \`${arg('sebelum')}\` (${A.length} halaman)`,
  `- Sesudah: \`${arg('sesudah')}\` (${B.length} halaman)`,
  `- Halaman tanpa perubahan: **${ringkas.halamanSama}**, berubah: **${ringkas.halamanBerubah}**`,
  `- Error JS baru: **${ringkas.errorJsBaru}**, console.error baru: **${ringkas.consoleErrorBaru}**, respons ≥400 baru: **${ringkas.respon400Baru}**, status HTTP berubah: **${ringkas.statusBerubah}**, file tidak dimuat lagi: **${ringkas.fileHilang}**, plugin $.fn hilang: **${ringkas.pluginHilang}**`,
  '',
  ...(tidakLogin.length ? [`> **PERBANDINGAN TIDAK SAH**: ${tidakLogin.length} halaman ber-login di hasil sesudah TIDAK dalam keadaan login (sesi kedaluwarsa / host tunnel berganti). Jalankan project setup lalu ulangi probe. Contoh: ${tidakLogin.slice(0, 3).join(', ')}`, ''] : []),
  '## Halaman yang berubah',
  '',
  ...(out.length ? out.flatMap((o) => [`### ${o.key.replace('|', ' ')}`, ...o.catatan.map((c) => `- ${c}`), '']) : ['Tidak ada perubahan.']),
].join('\n');
if (arg('out')) { fs.writeFileSync(path.resolve(ROOT, arg('out')), md); console.log(`Tersimpan: ${arg('out')}`); }
console.log(md.split('\n').slice(0, 8).join('\n'));
if (tidakLogin.length) { console.error(`PERBANDINGAN TIDAK SAH: ${tidakLogin.length} halaman ber-login tidak login di hasil sesudah.`); process.exitCode = 3; } else process.exitCode = ringkas.errorJsBaru || ringkas.consoleErrorBaru || ringkas.respon400Baru || ringkas.statusBerubah || ringkas.pluginHilang ? 1 : 0;
