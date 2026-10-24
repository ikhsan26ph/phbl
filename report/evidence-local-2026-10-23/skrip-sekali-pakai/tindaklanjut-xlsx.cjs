// Generator sekali-pakai: report/tindak-lanjut-php82-local-2026-10-23.xlsx
// Semua tabel diambil dari dua dokumen markdown agar isi identik.
const fs = require('fs');
const path = require('path');
const ROOT = 'E:/Project/phbl';
const ExcelJS = require(path.join(ROOT, 'node_modules/exceljs'));

const baca = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
const TL = baca('report/tindak-lanjut-php82-local-2026-10-23.md');
const AK = baca('report/alur-kritis-buat-lelang-2026-10-23.md');
const clean = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').trim();

function tabel(md, judul) {
  let i = md.findIndex((l) => /^#{2,4} /.test(l) && l.includes(judul));
  if (i < 0) throw new Error('heading tidak ada: ' + judul);
  while (i < md.length && !md[i].startsWith('|')) i++;
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
const fill = (c, argb) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }; };
const W = { merah: 'FFFDE2E1', kuning: 'FFFFF2CC', hijau: 'FFE2F4E6', biru: 'FFDDEBF7' };

function sheet(nama, t, lebar, warnai, ekstra) {
  const ws = wb.addWorksheet(nama);
  const header = ekstra ? [ekstra, ...t.header] : t.header;
  ws.columns = header.map((h, i) => ({ header: h, width: lebar[i] || 30 }));
  ws.getRow(1).eachCell((c) => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; fill(c, 'FF1F3864'); c.alignment = { vertical: 'middle', wrapText: true }; });
  ws.getRow(1).height = 24;
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: header.length } };
  for (const r of t.rows) {
    const row = ws.addRow(r);
    row.eachCell((c) => { c.alignment = { vertical: 'top', wrapText: true }; });
    if (warnai) warnai(row, r);
  }
  return ws;
}

// Ringkasan
const s = wb.addWorksheet('Ringkasan');
s.columns = [{ width: 30 }, { width: 110 }];
const t0 = s.addRow(['TINDAK LANJUT PENGUJIAN PHP 8.2.35 LOKAL']); t0.font = { bold: true, size: 14 }; s.mergeCells(1, 1, 1, 2);
s.addRow([]);
for (const [k, v] of [
  ['Tanggal', 'Jumat, 23 Oktober 2026'],
  ['Target', 'TARGET_ENV=local — http://192.168.0.88:8102'],
  ['Sumber', 'report/tindak-lanjut-php82-local-2026-10-23.md; report/alur-kritis-buat-lelang-2026-10-23.md'],
  ['Hasil gabungan "103 / 78 passed"', 'TAMPILAN TURUNAN dari 2 run (smoke-local tanpa smoke + smoke-final), bukan satu run. 78 = 75 lulus normal + 2 test.fail sesuai harapan + 1 placeholder. Acuan audit = per run (sheet Rekonsiliasi Run).'],
  ['Keputusan alur #1', 'CP0/CP1 dapat dieksekusi read-only (sudah dijalankan: 2 lulus, 2 gagal karena data). CP2 (mutasi) BELUM dapat dieksekusi: master kosong, fixture lokal null, izin mutasi & keputusan setting notifikasi belum ada.'],
  ['Status rilis', 'Produk TIDAK dinyatakan siap rilis.'],
  ['Severity / akar masalah', 'Tidak ditetapkan: evidence belum cukup (tanpa log backend & pembanding).'],
]) { const r = s.addRow([k, v]); r.getCell(1).font = { bold: true }; r.getCell(2).alignment = { wrapText: true }; }

const warnaStatus = (row, r, kol) => {
  const v = (r[kol] || '').toLowerCase();
  fill(row.getCell(kol + 1), /lulus|tersedia|diperbaiki/.test(v) && !/gagal|blocked/.test(v) ? W.hijau : /gagal|blocked|0 opsi|null|konflik/.test(v) ? W.merah : W.kuning);
};

sheet('Rekonsiliasi Run', tabel(TL, '1.1 Per run'), [32, 12, 10, 24, 36, 7, 8, 7, 11, 14, 12, 7, 6]);
sheet('Turunan 103', tabel(TL, '1.2 Angka'), [32, 12, 16, 14, 8, 8]);
sheet('Jumlah Skenario', tabel(TL, '1.3 Jumlah'), [52, 10, 50]);
sheet('Klasifikasi QA', tabel(TL, '1.4 Klasifikasi'), [44, 18, 70]);
sheet('Koreksi Interpretasi', tabel(TL, '2. Koreksi'), [55, 110]);
const kolTL = [6, 30, 55, 45, 40, 26, 36, 18, 40];
sheet('TL - Defect', tabel(TL, '3.1 Defect'), kolTL, (row) => fill(row.getCell(6), W.merah));
sheet('TL - Clarification', tabel(TL, '3.2 Clarification'), kolTL, (row) => fill(row.getCell(6), W.kuning));
sheet('TL - Kebutuhan Data', tabel(TL, '3.3 Kebutuhan data'), kolTL, (row) => fill(row.getCell(6), W.biru));
sheet('TL - Keamanan', tabel(TL, '3.4 Temuan keamanan'), kolTL, (row) => fill(row.getCell(6), W.merah));
sheet('TL - Environment', tabel(TL, '3.5 Environment'), kolTL, (row) => fill(row.getCell(6), W.kuning));
sheet('TL - Automation (internal)', tabel(TL, '3.6 Automation'), [6, 60, 60]);
sheet('Status Pekerjaan', tabel(TL, '4. Status pekerjaan'), [18, 140]);
sheet('Alur #1 - Pemilihan', tabel(AK, '1. Alasan pemilihan'), [40, 50, 40, 50]);
sheet('Alur #1 - Checkpoint', tabel(AK, '2. Checkpoint'), [6, 50, 18, 26, 55, 30, 50], (row, r) => warnaStatus(row, r, 6));
sheet('Alur #1 - Data Wajib', tabel(AK, '3.1 Wajib'), [40, 40, 16, 36, 30], (row, r) => warnaStatus(row, r, 3));
sheet('Alur #1 - Setting Integrasi', tabel(AK, '3.3 Setting'), [40, 50, 50, 50]);
sheet('Alur #1 - Opsi Data', tabel(AK, '4. Opsi penyediaan'), [26, 50, 40, 55, 40]);

const out = path.join(ROOT, 'report/tindak-lanjut-php82-local-2026-10-23.xlsx');
wb.xlsx.writeFile(out).then(() => console.log('Tersimpan:', out, '\nSheet:', wb.worksheets.map((w) => `${w.name}(${w.rowCount - 1})`).join(' | ')));
