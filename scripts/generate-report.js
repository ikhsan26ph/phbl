/**
 * Konversi hasil Playwright (JSON reporter) menjadi laporan Excel.
 *
 * Input : test-results/results.json (diproduksi otomatis tiap `npm test`,
 *         lihat reporter di playwright.config.ts)
 * Output: report/hasil-testing-<YYYY-MM-DD>.xlsx
 *
 * Struktur workbook:
 * - Sheet "Ringkasan"    — metadata run + rekap jumlah test per peran.
 * - Sheet per peran      — Admin / Shipper / Transporter / Anon, satu baris
 *   per test. Test project `setup` (login 6 akun) dimasukkan ke sheet peran
 *   masing-masing dengan modul "Setup Login" agar bukti login per akun ikut
 *   terlacak.
 *
 * Pemetaan istilah (konsisten dengan CLAUDE.md):
 * - Shipper     = Bid Owner  (UI: "Pemilik Barang")
 * - Transporter = Bidder     (UI: "Ekspedisi")
 *
 * Jalankan: npm run report  (setelah npm test)
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'test-results', 'results.json');
const OUT_DIR = path.join(ROOT, 'report');

/** project Playwright → nama sheet peran */
function roleOfProject(projectName, testTitle) {
  if (projectName === 'setup') {
    // Judul setup: "login <nama-akun>", mis. "login shipper-sub".
    const account = testTitle.replace(/^login\s+/, '');
    return roleOfProject(account, '');
  }
  if (projectName.startsWith('admin')) return 'Admin';
  if (projectName.startsWith('shipper')) return 'Shipper';
  if (projectName.startsWith('transporter')) return 'Transporter';
  return 'Anon';
}

/** "cari-penawaran.spec.ts" → "Cari Penawaran" */
function moduleOfFile(file) {
  const base = path.basename(file).replace(/\.spec\.ts$/, '').replace(/\.setup\.ts$/, '');
  if (base === 'auth') return 'Setup Login';
  return base
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Label status berbahasa Indonesia dari outcome Playwright. */
function statusLabel(test) {
  switch (test.status) {
    case 'expected':
      return test.expectedStatus === 'failed'
        ? 'LULUS (defect terdokumentasi)' // test.fail(): gagal memang diharapkan
        : 'LULUS';
    case 'flaky':
      return 'FLAKY';
    case 'skipped':
      return 'DILEWATI';
    default:
      return 'GAGAL';
  }
}

const STATUS_COLOR = {
  'LULUS': 'FF1E7B34', // hijau
  'LULUS (defect terdokumentasi)': 'FF7B5B1E', // kuning tua
  'FLAKY': 'FFB35900', // oranye
  'DILEWATI': 'FF6C757D', // abu-abu
  'GAGAL': 'FFB02A37', // merah
};

const stripAnsi = (s) => (s || '').replace(/\[[0-9;]*m/g, '');

/** Rekursif: kumpulkan semua spec dari pohon suite JSON reporter. */
function collectRows(suite, titleChain, rows) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const last = test.results[test.results.length - 1] || {};
      const durationMs = test.results.reduce((a, r) => a + (r.duration || 0), 0);
      const notes = [];
      for (const a of test.annotations || []) {
        notes.push(a.description ? `${a.type}: ${a.description}` : a.type);
      }
      if (test.status === 'unexpected' && last.errors && last.errors.length) {
        notes.push(stripAnsi(last.errors[0].message).split('\n')[0]);
      }
      if (test.status === 'flaky') {
        notes.push(`lulus setelah ${test.results.length - 1}x retry`);
      }
      rows.push({
        role: roleOfProject(test.projectName, spec.title),
        project: test.projectName,
        file: suite.file,
        module: moduleOfFile(suite.file),
        suitePath: titleChain.join(' › '),
        title: spec.title,
        status: statusLabel(test),
        durationSec: Math.round(durationMs / 100) / 10,
        notes: notes.join(' | '),
      });
    }
  }
  for (const child of suite.suites || []) {
    collectRows(child, [...titleChain, child.title], rows);
  }
}

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
    cell.alignment = { vertical: 'middle' };
  });
  row.height = 20;
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(
      `Tidak menemukan ${path.relative(ROOT, INPUT)}.\n` +
        'Jalankan "npm test" dulu agar JSON reporter menghasilkan file itu.'
    );
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

  const rows = [];
  for (const suite of data.suites || []) collectRows(suite, [], rows);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Playwright QA Automation';
  wb.created = new Date();

  // ---------- Sheet Ringkasan ----------
  const runDate = data.stats?.startTime ? new Date(data.stats.startTime) : new Date();
  const summary = wb.addWorksheet('Ringkasan');
  summary.columns = [
    { width: 26 },
    { width: 14 },
    { width: 10 },
    { width: 28 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
  ];

  const titleRow = summary.addRow(['LAPORAN HASIL TESTING — PHBID LAUT (TMS Lelang & Pengiriman Laut)']);
  titleRow.font = { bold: true, size: 14 };
  summary.mergeCells(1, 1, 1, 7);
  summary.addRow([]);
  const meta = [
    ['Aplikasi', data.config?.projects?.[0]?.use?.baseURL || process.env.BASE_URL || 'https://phbidlautdemo.prahu-hub.com'],
    ['Tanggal eksekusi', runDate.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })],
    ['Durasi total', `${Math.round((data.stats?.duration || 0) / 1000)} detik`],
    ['Framework', `Playwright ${data.config?.version || ''} + TypeScript`],
    ['Catatan istilah', 'Shipper = Pemilik Barang (Bid Owner); Transporter = Ekspedisi (Bidder)'],
  ];
  for (const [k, v] of meta) {
    const r = summary.addRow([k, v]);
    r.getCell(1).font = { bold: true };
    summary.mergeCells(r.number, 2, r.number, 7);
  }
  summary.addRow([]);

  const header = summary.addRow([
    'Peran',
    'Total',
    'Lulus',
    'Lulus (defect terdokumentasi)',
    'Gagal',
    'Flaky',
    'Dilewati',
  ]);
  styleHeader(header);

  const ROLES = ['Admin', 'Shipper', 'Transporter', 'Anon'];
  for (const role of ROLES) {
    const rs = rows.filter((r) => r.role === role);
    const count = (label) => rs.filter((r) => r.status === label).length;
    const row = summary.addRow([
      role,
      rs.length,
      count('LULUS'),
      count('LULUS (defect terdokumentasi)'),
      count('GAGAL'),
      count('FLAKY'),
      count('DILEWATI'),
    ]);
    if (count('GAGAL') > 0) row.getCell(5).font = { bold: true, color: { argb: STATUS_COLOR['GAGAL'] } };
  }
  const totalRow = summary.addRow([
    'TOTAL',
    rows.length,
    rows.filter((r) => r.status === 'LULUS').length,
    rows.filter((r) => r.status === 'LULUS (defect terdokumentasi)').length,
    rows.filter((r) => r.status === 'GAGAL').length,
    rows.filter((r) => r.status === 'FLAKY').length,
    rows.filter((r) => r.status === 'DILEWATI').length,
  ]);
  totalRow.font = { bold: true };

  // ---------- Sheet per peran ----------
  const COLUMNS = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Akun (project)', key: 'project', width: 16 },
    { header: 'Modul', key: 'module', width: 22 },
    { header: 'Grup Test', key: 'suitePath', width: 30 },
    { header: 'Judul Test', key: 'title', width: 60 },
    { header: 'Status', key: 'status', width: 28 },
    { header: 'Durasi (detik)', key: 'durationSec', width: 13 },
    { header: 'Keterangan', key: 'notes', width: 70 },
  ];

  for (const role of ROLES) {
    const ws = wb.addWorksheet(role);
    ws.columns = COLUMNS;
    styleHeader(ws.getRow(1));
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = { from: 'A1', to: 'H1' };

    const rs = rows.filter((r) => r.role === role);
    rs.forEach((r, i) => {
      const row = ws.addRow({ ...r, no: i + 1 });
      row.getCell('status').font = {
        bold: true,
        color: { argb: STATUS_COLOR[r.status] || 'FF000000' },
      };
      row.getCell('title').alignment = { wrapText: true };
      row.getCell('notes').alignment = { wrapText: true };
    });
    if (rs.length === 0) {
      ws.addRow({ no: '-', title: 'Belum ada test untuk peran ini' });
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = runDate.toISOString().slice(0, 10);
  const outFile = path.join(OUT_DIR, `hasil-testing-${stamp}.xlsx`);
  await wb.xlsx.writeFile(outFile);

  console.log(`Laporan tersimpan: ${path.relative(ROOT, outFile)}`);
  console.log(`Total baris test: ${rows.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
