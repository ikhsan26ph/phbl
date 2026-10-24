/**
 * Workbook matriks cakupan fitur dari:
 *  - <evidence>/matriks-cakupan.json   (hasil scripts/matriks-cakupan.js)
 *  - <md>                              (laporan markdown; tabel § 3.2, 4–7 diambil apa adanya)
 *  - <evidence>/inventaris-fitur/koreksi-qa.tsv
 * Jalankan: node scripts/matriks-cakupan-xlsx.js --md=report/matriks-cakupan-fitur-2026-10-24.md
 *           [--evidence=report/evidence-local-2026-10-23] [--out=report/matriks-cakupan-fitur-2026-10-24.xlsx]
 */
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3);
const EV = path.resolve(ROOT, arg('evidence', 'report/evidence-local-2026-10-23'));
const MD = path.resolve(ROOT, arg('md', 'report/matriks-cakupan-fitur-2026-10-24.md'));
const OUT = path.resolve(ROOT, arg('out', MD.replace(/\.md$/, '.xlsx')));

const rows = JSON.parse(fs.readFileSync(path.join(EV, 'matriks-cakupan.json'), 'utf8')).rows;
const md = fs.readFileSync(MD, 'utf8').replace(/\r/g, '').split('\n');
const clean = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();

/** Tabel markdown ke-n setelah heading yang memuat `judul`. */
function tabel(judul, ke = 1) {
  let i = md.findIndex((l) => /^#{2,4} /.test(l) && l.includes(judul));
  if (i < 0) throw new Error(`heading tidak ada: ${judul}`);
  let n = 0;
  for (; i < md.length; i++) if (md[i].startsWith('|') && !md[i - 1].startsWith('|') && ++n === ke) break;
  const out = [];
  for (; i < md.length && md[i].startsWith('|'); i++) {
    if (/^\|[\s|:-]+\|$/.test(md[i])) continue;
    out.push(md[i].slice(1, -1).split(' | ').map(clean));
  }
  return { header: out[0], rows: out.slice(1) };
}

const wb = new ExcelJS.Workbook();
wb.creator = 'Playwright QA Automation';
wb.created = new Date();
const WARNA = { Berjalan: 'FFE2F4E6', Bermasalah: 'FFFDE2E1', Blocked: 'FFFFF2CC', 'Perlu clarification': 'FFDDEBF7', 'Belum diuji': 'FFEDEDED' };
const fill = (c, argb) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }; };

function sheet(nama, header, data, lebar, kolStatus) {
  const ws = wb.addWorksheet(nama);
  ws.columns = header.map((h, i) => ({ header: h, width: lebar[i] || 24 }));
  ws.getRow(1).eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; fill(c, 'FF1F3864'); c.alignment = { vertical: 'middle', wrapText: true }; });
  ws.getRow(1).height = 26;
  ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: header.length } };
  for (const d of data) {
    const r = ws.addRow(d);
    r.eachCell((c) => { c.alignment = { vertical: 'top', wrapText: true }; });
    if (kolStatus !== undefined && WARNA[d[kolStatus]]) fill(r.getCell(kolStatus + 1), WARNA[d[kolStatus]]);
  }
  return ws;
}
const dariMd = (nama, judul, lebar, ke = 1) => { const t = tabel(judul, ke); return sheet(nama, t.header, t.rows, lebar); };

// Ringkasan
const s = wb.addWorksheet('Ringkasan');
s.columns = [{ width: 34 }, { width: 14 }, { width: 14 }, { width: 12 }, { width: 18 }, { width: 14 }, { width: 10 }];
const j = s.addRow(['MATRIKS CAKUPAN FITUR — PASCA-UPDATE PHP 8.2.35 (LOKAL)']); j.font = { bold: true, size: 14 }; s.mergeCells(1, 1, 1, 7);
s.addRow([]);
for (const [k, v] of [
  ['Tanggal', 'Sabtu, 24 Oktober 2026'],
  ['Target', 'TARGET_ENV=local — http://192.168.0.88:8102'],
  ['Kondisi hari ini', 'Server lokal tidak dapat dijangkau (port 8102 menolak koneksi); hasil eksekusi berasal dari run 2026-10-23'],
  ['Total fitur/aksi', `${rows.length} (rules 1.317 + UI tanpa rule 14)`],
  ['Catatan', 'Cakupan fitur ≠ jumlah test. Status per AKSI; placeholder & test.fail bukan bukti fungsi. Produk TIDAK dinyatakan siap rilis.'],
]) { const r = s.addRow([k, v]); r.getCell(1).font = { bold: true }; s.mergeCells(r.number, 2, r.number, 7); r.getCell(2).alignment = { wrapText: true }; }
for (const [judul, ke] of [['3.1 Cakupan FITUR', 1], ['3.1 Cakupan FITUR', 2], ['3.1 Cakupan FITUR', 3]]) {
  s.addRow([]);
  const t = tabel(judul, ke);
  const h = s.addRow(t.header); h.eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; fill(c, 'FF1F3864'); });
  t.header.slice(1, 6).forEach((st, i) => { if (WARNA[st]) fill(h.getCell(i + 2), WARNA[st]); h.getCell(i + 2).font = { bold: true }; });
  for (const r of t.rows) s.addRow(r.map((v, i) => (i > 0 && /^\d+$/.test(v) ? Number(v) : v)));
}

// Matriks utama — kolom sesuai permintaan, lalu kolom pendukung
const UTAMA = ['ID Fitur', 'Modul', 'Fitur/Aksi', 'Role', 'Sumber Requirement', 'Data/Prasyarat', 'Spec Terkait', 'Metode Uji', 'Status', 'Evidence', 'Blocker/Tindak Lanjut'];
const EKSTRA = ['Keberadaan di Lokal', 'Automation', 'Bukti Spec', 'Jenis', 'Mutasi', 'Kelompok', 'Dependensi', 'Halaman UI', 'Bukti UI', 'Catatan Rule'];
sheet('Matriks Fitur', [...UTAMA, ...EKSTRA], rows.map((r) => [...UTAMA, ...EKSTRA].map((k) => r[k] ?? '-')),
  [12, 20, 50, 12, 36, 26, 30, 16, 16, 40, 48, 18, 16, 16, 14, 8, 20, 26, 24, 26, 36], 8);

// Rekap per modul
const S = ['Berjalan', 'Bermasalah', 'Blocked', 'Perlu clarification', 'Belum diuji'];
const rekap = {};
for (const r of rows) { const k = `${r.Role}\t${r.Modul}`; rekap[k] ??= Object.fromEntries(S.map((x) => [x, 0])); rekap[k][r.Status]++; }
sheet('Rekap per Modul', ['Role', 'Modul', ...S, 'Total'], Object.entries(rekap).sort().map(([k, v]) => [...k.split('\t'), ...S.map((x) => v[x]), S.reduce((a, x) => a + v[x], 0)]), [14, 34, 10, 11, 9, 13, 11, 8]);

const pilih = (f, kol) => rows.filter(f).map((r) => kol.map((k) => r[k] ?? '-'));
sheet('Celah Automation', ['ID Fitur', 'Role', 'Modul', 'Fitur/Aksi', 'Automation', 'Metode Uji', 'Status', 'Spec Terkait', 'Blocker/Tindak Lanjut'],
  pilih((r) => r.Automation !== 'Tersedia' || /Manual/.test(r['Metode Uji']), ['ID Fitur', 'Role', 'Modul', 'Fitur/Aksi', 'Automation', 'Metode Uji', 'Status', 'Spec Terkait', 'Blocker/Tindak Lanjut']),
  [12, 12, 22, 50, 16, 16, 16, 30, 48], 6);
sheet('Uji Manual', ['ID Fitur', 'Kelompok', 'Role', 'Modul', 'Fitur/Aksi', 'Status', 'Data/Prasyarat', 'Dependensi', 'Langkah Manual', 'Expected Manual', 'Evidence Manual'],
  pilih((r) => /Manual/.test(r['Metode Uji']), ['ID Fitur', 'Kelompok', 'Role', 'Modul', 'Fitur/Aksi', 'Status', 'Data/Prasyarat', 'Dependensi', 'Langkah Manual', 'Expected Manual', 'Evidence Manual'])
    .sort((a, b) => String(a[1]).localeCompare(String(b[1]))),
  [12, 22, 12, 20, 44, 16, 24, 24, 55, 50, 44], 5);
sheet('Siap Eksekusi', ['ID Fitur', 'Role', 'Modul', 'Fitur/Aksi', 'Automation', 'Metode Uji', 'Spec Terkait', 'Halaman UI', 'Langkah Manual', 'Expected Manual'],
  pilih((r) => r.Status === 'Belum diuji' && r.Mutasi === 'Tidak' && (!r['Data/Prasyarat'] || r['Data/Prasyarat'] === '-'),
    ['ID Fitur', 'Role', 'Modul', 'Fitur/Aksi', 'Automation', 'Metode Uji', 'Spec Terkait', 'Halaman UI', 'Langkah Manual', 'Expected Manual']),
  [12, 12, 22, 50, 16, 16, 30, 26, 55, 50]);
sheet('Fitur Notifikasi', ['ID Fitur', 'Jenis', 'Role', 'Modul', 'Fitur/Aksi', 'Status', 'Blocker/Tindak Lanjut', 'Sumber Requirement'],
  pilih((r) => /Notifikasi/.test(r.Jenis), ['ID Fitur', 'Jenis', 'Role', 'Modul', 'Fitur/Aksi', 'Status', 'Blocker/Tindak Lanjut', 'Sumber Requirement']), [12, 20, 12, 22, 55, 16, 48, 36], 5);
dariMd('Notifikasi - Aspek', '6. Notifikasi', [30, 40, 30, 22, 50, 30]);
dariMd('Urutan Eksekusi', '4. Urutan eksekusi', [8, 28, 70, 40, 46]);
dariMd('Kebutuhan Data', '5. Kebutuhan data', [22, 40, 44, 44, 44]);
dariMd('Rencana Mutasi', '7. Rencana mutasi', [6, 50, 12, 30, 44, 40, 26]);
dariMd('Test vs Run', '3.2 Jumlah TEST', [32, 14, 7, 9, 7, 12, 14, 12, 7, 6]);
const kq = fs.readFileSync(path.join(EV, 'inventaris-fitur', 'koreksi-qa.tsv'), 'utf8').replace(/\r/g, '').split('\n').filter(Boolean).map((l) => l.split('\t'));
sheet('Koreksi QA', kq[0], kq.slice(1), [12, 18, 110], 1);
sheet('UI Tanpa Rule', ['ID Fitur', 'Role', 'Modul', 'Fitur/Aksi', 'Halaman UI', 'Bukti UI', 'Status', 'Blocker/Tindak Lanjut'],
  pilih((r) => /^UI-/.test(r['ID Fitur']), ['ID Fitur', 'Role', 'Modul', 'Fitur/Aksi', 'Halaman UI', 'Bukti UI', 'Status', 'Blocker/Tindak Lanjut']), [11, 10, 28, 44, 30, 30, 16, 60], 6);

wb.xlsx.writeFile(OUT).then(() => console.log(`Tersimpan: ${path.relative(ROOT, OUT)}\nSheet: ${wb.worksheets.map((w) => `${w.name}(${w.rowCount - 1})`).join(' | ')}`));
