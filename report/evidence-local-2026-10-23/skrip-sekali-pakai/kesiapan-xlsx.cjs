// Generator sekali-pakai: report/kesiapan-php82-local-2026-10-23.xlsx
// Tabel diambil dari report/kesiapan-php82-local-2026-10-23.md agar identik.
const fs = require('fs');
const path = require('path');
const ROOT = 'E:/Project/phbl';
const ExcelJS = require(path.join(ROOT, 'node_modules/exceljs'));

const md = fs.readFileSync(path.join(ROOT, 'report/kesiapan-php82-local-2026-10-23.md'), 'utf8').split('\n');
const klas = JSON.parse(fs.readFileSync(path.join(ROOT, 'report/evidence-local-2026-10-23/klasifikasi-skenario.json'), 'utf8'));
const clean = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();

/** Tabel markdown pertama setelah baris heading yang memuat `judul`. */
function tabel(judul, ke = 1) {
  let i = md.findIndex((l) => /^#{2,4} /.test(l) && l.includes(judul));
  if (i < 0) throw new Error('heading tidak ada: ' + judul);
  let n = 0;
  for (; i < md.length; i++) {
    if (md[i].startsWith('|') && !md[i - 1].startsWith('|')) { n++; if (n === ke) break; }
  }
  const rows = [];
  for (; i < md.length && md[i].startsWith('|'); i++) {
    if (/^\|[\s|:-]+\|$/.test(md[i])) continue;
    rows.push(md[i].slice(1, -1).split(' | ').map(clean));
  }
  return { header: rows[0], rows: rows.slice(1) };
}

const wb = new ExcelJS.Workbook();
wb.creator = 'Playwright QA Automation';
wb.created = new Date();
const HEAD = 'FF1F3864';
const FILL = { merah: 'FFFDE2E1', kuning: 'FFFFF2CC', hijau: 'FFE2F4E6', abu: 'FFEDEDED' };
const fill = (cell, argb) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }; };

function addSheet(name, header, rows, widths, warnai) {
  const ws = wb.addWorksheet(name);
  ws.columns = header.map((h, i) => ({ header: h, width: widths[i] || 30 }));
  ws.getRow(1).eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; fill(c, HEAD); c.alignment = { vertical: 'middle', wrapText: true }; });
  ws.getRow(1).height = 24;
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: header.length } };
  for (const r of rows) {
    const row = ws.addRow(r);
    row.eachCell((c) => { c.alignment = { vertical: 'top', wrapText: true }; });
    if (warnai) warnai(row, r);
  }
  return ws;
}

// ---- Ringkasan & Keputusan
const s = wb.addWorksheet('Ringkasan & Keputusan');
s.columns = [{ width: 34 }, { width: 110 }];
const t = s.addRow(['KESIAPAN PENGUJIAN PASCA-PEMBARUAN PHP 8.2.35 — TARGET LOKAL']); t.font = { bold: true, size: 14 }; s.mergeCells(1, 1, 1, 2);
s.addRow([]);
const kv = [
  ['Tanggal', 'Jumat, 23 Oktober 2026'],
  ['Target', 'TARGET_ENV=local — http://192.168.0.88:8102'],
  ['Versi suite', '0fd24cd + perubahan lokal belum di-commit'],
  ['Runtime teramati', 'PHP/8.2.35 (header X-Powered-By) — baseline pada VERSI TUJUAN, bukan sebelum upgrade'],
  ['Build aplikasi', 'Belum diketahui'],
  ['Dataset', 'DB lokal kosong (inventaris 2026-10-23)'],
  ['Cakupan tindakan', 'Read-only: tanpa mutasi data bisnis, tanpa test ke demo/produksi, tanpa perubahan backend'],
  ['KEPUTUSAN', 'BELUM SIAP untuk regresi alur bisnis maupun rilis. Smoke read-only siap sebagai gerbang awal.'],
  ['Alasan', '(1) data lokal kosong & izin mutasi belum ada; (2) HTTP 500 Penugasan Tracking; (3) hak akses sub user belum dikonfirmasi; (4) 80 skenario hardcode data demo; (5) bukti deployment patch belum ada'],
  ['Catatan penting', 'Hasil Playwright hijau BUKAN bukti kerentanan tertutup. Demo bukan pembanding sah (build/data/role/konfigurasi berbeda).'],
];
for (const [k, v] of kv) { const r = s.addRow([k, v]); r.getCell(1).font = { bold: true }; r.getCell(2).alignment = { wrapText: true }; if (k === 'KEPUTUSAN') { fill(r.getCell(2), FILL.merah); r.getCell(2).font = { bold: true }; } }
s.addRow([]);
const h1 = s.addRow(['Status native Playwright (run gabungan)', '']); h1.font = { bold: true, size: 12 };
for (const r of tabel('5. Jumlah skenario', 1).rows) s.addRow(r);
s.addRow([]);
const h2 = s.addRow(['Penyebab QA atas 25 hasil non-lulus', '(klasifikasi QA, bukan status Playwright)']); h2.font = { bold: true, size: 12 };
for (const r of tabel('5. Jumlah skenario', 2).rows) s.addRow([r[0], `${r[1]} — ${r[2]}`]).getCell(2).alignment = { wrapText: true };
s.addRow([]);
const h3 = s.addRow(['Klasifikasi kesiapan statis 529 skenario', '']); h3.font = { bold: true, size: 12 };
for (const r of tabel('5. Jumlah skenario', 3).rows) s.addRow(r);

// ---- Matriks kesiapan
const mk = tabel('3. Matriks kesiapan');
addSheet('Matriks Kesiapan', mk.header, mk.rows, [30, 50, 28, 40, 45, 22], (row, r) => {
  const st = r[2].toLowerCase();
  fill(row.getCell(3), /terverifikasi|tersedia,/.test(st) ? FILL.hijau : /belum|tidak|sebagian/.test(st) ? FILL.kuning : FILL.abu);
  if (/^tidak (ada|setara|tersedia)/.test(st)) fill(row.getCell(3), FILL.merah);
});

// ---- Hasil eksekusi (103) dengan penyebab QA
function penyebab(r) {
  const h = r.hasilLokal;
  if (/^LULUS/.test(h)) return '-';
  if (/penugasantracking/.test(r.skenario)) return 'Defect produk/environment (HTTP 500 diterima)';
  if (h === 'DILEWATI') return 'Data/precondition tidak tersedia';
  if (/Push Notif/.test(r.skenario)) return 'Data/precondition (0 notifikasi)';
  if (/-sub$/.test(r.project)) return 'Perlu clarification hak akses sub user';
  if (/akun-saya/.test(r.file)) return 'Data/precondition (data akun QA lokal: file/rekening) — perlu konfirmasi';
  return 'Perlu analisis';
}
const exec = klas.rows.filter((r) => r.hasilLokal !== 'Belum dijalankan');
addSheet('Hasil Eksekusi Lokal', ['Project', 'Role', 'File', 'Baris', 'Skenario', 'Hasil', 'Penyebab (klasifikasi QA)', 'Kategori statis', 'Prioritas'],
  exec.map((r) => [r.project, r.role, r.file, r.line, r.skenario, r.hasilLokal, penyebab(r), r.kategori, r.prioritas]),
  [14, 14, 34, 7, 70, 50, 40, 36, 24], (row, r) => {
    fill(row.getCell(6), /^LULUS \(/.test(r[5]) ? FILL.kuning : /^LULUS/.test(r[5]) ? FILL.hijau : /^GAGAL/.test(r[5]) ? FILL.merah : FILL.abu);
  });
const unk = exec.filter((r) => penyebab(r) === 'Perlu analisis');
if (unk.length) console.warn('PERINGATAN penyebab belum dipetakan:', unk.map((r) => r.skenario));

// ---- Klasifikasi 529 skenario
addSheet('Klasifikasi Skenario', ['Project', 'Role', 'File', 'Baris', 'Skenario', 'Kategori', 'Alasan', 'Potensi mutasi', 'Dependency', 'Defect terdokumentasi', 'Prioritas bisnis', 'Hasil lokal'],
  klas.rows.map((r) => [r.project, r.role, r.file, r.line, r.skenario, r.kategori, r.alasan, r.potensiMutasi, r.dependency, r.defectTerdokumentasi, r.prioritas, r.hasilLokal]),
  [14, 14, 34, 7, 60, 34, 45, 10, 30, 14, 22, 30], (row, r) => {
    const k = r[5][0];
    fill(row.getCell(6), k === '1' ? FILL.hijau : k === '2' ? FILL.kuning : k === '3' || k === '4' ? FILL.merah : FILL.abu);
  });

// ---- Temuan
const tm = tabel('6. Temuan');
addSheet('Temuan', tm.header, tm.rows, [5, 50, 45, 32, 40, 45], (row, r) => {
  const k = r[3].toLowerCase();
  fill(row.getCell(4), /sudah diperbaiki/.test(k) ? FILL.hijau : /defect|keamanan/.test(k) ? FILL.merah : FILL.kuning);
});

// ---- Pertanyaan (gabungan)
const q = [];
let pihak = '';
const start = md.findIndex((l) => l.startsWith('## 8.'));
for (let i = start + 1; i < md.length && !md[i].startsWith('## 9.'); i++) {
  const p = md[i].match(/^\*\*(.+?):\*\*/); if (p) { pihak = p[1]; continue; }
  const m = md[i].match(/^(\d+)\.\s+(.*)/); if (m) q.push([Number(m[1]), pihak, clean(m[2]), '']);
}
addSheet('Pertanyaan Terbuka', ['No', 'Pihak', 'Pertanyaan / kebutuhan', 'Jawaban'], q, [5, 22, 100, 45]);

// ---- Rencana lanjutan
const ds = tabel('7.1 Dataset minimum');
addSheet('Rencana - Dataset Alur Kritis', ds.header, ds.rows, [26, 16, 45, 40, 36, 30]);
const rg = tabel('7.2 Regresi');
addSheet('Rencana - Regresi', rg.header, rg.rows, [22, 60, 60]);
const gg = tabel('7.7 Kriteria Go/No-Go');
addSheet('Kriteria Go-No-Go', [...gg.header, 'Status saat ini'], gg.rows.map((r) => [...r, 'Belum terpenuhi']), [24, 80, 22], (row) => fill(row.getCell(3), FILL.merah));

const out = path.join(ROOT, 'report/kesiapan-php82-local-2026-10-23.xlsx');
wb.xlsx.writeFile(out).then(() => console.log('Tersimpan:', out, '\nSheet:', wb.worksheets.map((w) => `${w.name}(${w.rowCount - 1})`).join(' | ')));
