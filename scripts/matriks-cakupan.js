/**
 * Matriks cakupan fitur — acuan utama status per AKSI (bukan per test).
 *
 * Input (default di report/evidence-local-2026-10-23/):
 *  - inventaris-fitur/fitur-{admin,shipper,transporter}.tsv  (fitur dari docs/rules)
 *  - inventaris-fitur/map-{admin,shipper,transporter}.tsv    (pemetaan fitur→spec & UI)
 *  - katalog-test-hasil-lokal.tsv                            (hasil lokal per test)
 * Output: --out=<file.json> (+ dipakai generator xlsx/md).
 *
 * Aturan status (urutan prioritas; jumlah test BUKAN ukuran cakupan):
 *  1. Ada test terpetakan yang LULUS sebagai test.fail()  → Bermasalah (defect masih ada).
 *  2. Ada test terpetakan GAGAL karena defect produk      → Bermasalah.
 *  3. Halaman fitur 5xx (sweep/isolasi)                    → Bermasalah (Tampilan) / Blocked (aksi turunan).
 *  4. Ada test terpetakan GAGAL karena clarification       → Perlu clarification.
 *  5. Ada test terpetakan LULUS normal yang membuktikan aksi itu (Bukti Fungsi/Validasi/Mutasi,
 *     atau Tampilan untuk fitur berjenis Tampilan)          → Berjalan.
 *  6. Ada test terpetakan GAGAL/DILEWATI karena data       → Blocked (data).
 *  Penyaring bukti: hasil test hanya dihitung bila project/akunnya sesuai Role fitur (spec
 *  bersama spt push-notif.shared.ts satu file:line untuk 3 role); hasil smoke (satu file:line
 *  untuk semua halaman, dibangkitkan loop) hanya dihitung bila judulnya memuat path Halaman UI
 *  fitur. Fitur yang isinya bergantung data (Prasyarat Data transaksi/master) TIDAK bisa
 *  "Berjalan" hanya karena struktur halamannya lulus selama data lokal kosong → Blocked (data).
 *  Koreksi QA per ID (inventaris-fitur/koreksi-qa.tsv: ID, Status, Alasan) diterapkan terakhir.
 *  7. Belum ada bukti eksekusi:
 *     Mutasi=Ya → Blocked (izin mutasi + prasyarat); prasyarat data transaksi/master → Blocked (data);
 *     lainnya → Belum diuji. Placeholder & test.fail TIDAK pernah dihitung sebagai bukti fungsi.
 * Keberadaan di lokal: Terkonfirmasi (test lulus / aksi terlihat di sweep) | Belum terkonfirmasi.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3);
const EV = path.resolve(ROOT, arg('evidence', 'report/evidence-local-2026-10-23'));

function tsv(file) {
  const L = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split('\n').filter(Boolean);
  const h = L[0].split('\t');
  return L.slice(1).map((l) => Object.fromEntries(l.split('\t').map((v, i) => [h[i], (v ?? '').trim()])));
}

const fitur = [];
const peta = {};
for (const r of ['admin', 'shipper', 'transporter', 'ui']) {
  fitur.push(...tsv(path.join(EV, 'inventaris-fitur', `fitur-${r}.tsv`)));
  const mf = path.join(EV, 'inventaris-fitur', `map-${r}.tsv`);
  if (fs.existsSync(mf)) for (const m of tsv(mf)) peta[m.ID] = m;
}

// Hasil lokal per lokasi file:line (bisa >1 project, mis. push-notif.shared.ts)
const hasil = {};
for (const t of tsv(path.join(EV, 'katalog-test-hasil-lokal.tsv'))) {
  (hasil[`${t.File}:${t.Line}`] ??= []).push(t);
}

// Role fitur → akun/project yang sah sebagai bukti.
const AKUN = { Admin: 'admin', Shipper: 'shipper', 'Shipper-Sub': 'shipper-sub', Transporter: 'transporter', 'Transporter-Sub': 'transporter-sub', Anon: 'anon' };
function buktiSah(f, m, t) {
  const akun = AKUN[f.Role] || '';
  const judul = t['Judul Test'] || '';
  if (t.Project === 'smoke') {
    const cocokAkun = new RegExp(`^smoke ${akun.replace('-', '\-')} >`).test(judul);
    const hal = (m?.['Halaman UI'] || '-').split('?')[0];
    return cocokAkun && hal !== '-' && judul.toLowerCase().includes(hal.toLowerCase());
  }
  if (t.Project === 'setup') return judul === `login ${akun}`;
  if (t.Project === 'precondition') return true;
  if (t.Project === 'anon') return f.Role === 'Anon' || /login|lupa|registrasi/i.test(f.Modul);
  return t.Project === akun;
}

const DATA_TRANSAKSI = /lelang|order|harga|penawaran|nego|invoice|notif|jadwal|tracking|unit|petugas|master|pelabuhan|kota|kontainer|include|rating|ulasan|dokumen|laporan|data/i;

function tentukan(f, m) {
  const lokasi = m && m['Spec Terkait'] && m['Spec Terkait'] !== '-' ? m['Spec Terkait'].split(';').map((s) => s.trim()).filter(Boolean) : [];
  const bukti = m && m['Bukti Spec'] && m['Bukti Spec'] !== '-' ? m['Bukti Spec'].split(';').map((s) => s.trim()) : [];
  const runs = lokasi.flatMap((loc, i) => (hasil[loc] || []).filter((t) => buktiSah(f, m, t)).map((t) => ({ loc, bukti: bukti[i] || '', ...t })));
  const exe = runs.filter((t) => t['Hasil Lokal'] !== 'Belum dijalankan');
  const evidence = exe.map((t) => `${t.loc} [${t.Project}] ${t['Hasil Lokal']} (${t['Run ID']})`);
  const ui = m ? m['Bukti UI'] || '-' : '-';
  const halaman5xx = /5xx/i.test(ui) || /penugasantracking/.test(m?.['Halaman UI'] || '') || /datajenismuatan/.test(m?.['Halaman UI'] || '');
  const penyebab = (t) => t['Penyebab QA'] || '';

  const tfail = exe.filter((t) => /test\.fail/i.test(t['Hasil Lokal']));
  const gagalDefect = exe.filter((t) => t['Hasil Lokal'] === 'GAGAL' && /^Defect/.test(penyebab(t)));
  const gagalKlar = exe.filter((t) => t['Hasil Lokal'] === 'GAGAL' && /Clarification|konfirmasi \(Versi/i.test(penyebab(t)));
  const lulus = exe.filter((t) => t['Hasil Lokal'] === 'LULUS' && !/placeholder/i.test(t.bukti));
  const lulusBukti = lulus.filter((t) => /Fungsi|Validasi|Mutasi/i.test(t.bukti) || (f.Jenis === 'Tampilan' && /Tampilan/i.test(t.bukti)));
  const dataGagal = exe.filter((t) => (t['Hasil Lokal'] === 'GAGAL' || t['Hasil Lokal'] === 'DILEWATI') && /^Data|precondition/i.test(penyebab(t)));

  let status; let blocker = '-';
  if (tfail.length) { status = 'Bermasalah'; blocker = 'Defect terdokumentasi masih terjadi (test.fail lulus): ' + tfail.map((t) => t.loc).join(', '); }
  else if (gagalDefect.length) { status = 'Bermasalah'; blocker = [...new Set(gagalDefect.map(penyebab))].join('; '); }
  else if (halaman5xx) {
    const ref = /datajenismuatan|D5/.test(`${m?.['Halaman UI'] || ''} ${ui}`) ? 'D5 (Master Jenis Muatan / searchdatajenismuatan HTTP 500)' : 'D1 (Penugasan Tracking HTTP 500)';
    status = f.Jenis === 'Tampilan' ? 'Bermasalah' : 'Blocked'; blocker = ref;
  } else if (gagalKlar.length) { status = 'Perlu clarification'; blocker = [...new Set(gagalKlar.map(penyebab))].join('; '); }
  else if (lulusBukti.length && f['Prasyarat Data'] && f['Prasyarat Data'] !== '-' && DATA_TRANSAKSI.test(f['Prasyarat Data']) && !/^(Validasi|Akses\/Otorisasi)$/.test(f.Jenis)) {
    status = 'Blocked';
    blocker = `Data lokal kosong: ${f['Prasyarat Data']} — yang sudah terbukti hanya struktur/kontrol: ${[...new Set(lulusBukti.map((t) => t.loc))].join(', ')}`;
  } else if (lulusBukti.length) { status = 'Berjalan'; }
  else if (dataGagal.length) { status = 'Blocked'; blocker = [...new Set(dataGagal.map(penyebab))].join('; '); }
  else if (f.Mutasi === 'Ya') { status = 'Blocked'; blocker = `Izin mutasi belum ada${f['Prasyarat Data'] && f['Prasyarat Data'] !== '-' ? '; data: ' + f['Prasyarat Data'] : ''}`; }
  else if (f['Prasyarat Data'] && f['Prasyarat Data'] !== '-' && DATA_TRANSAKSI.test(f['Prasyarat Data'])) { status = 'Blocked'; blocker = `Data lokal kosong: ${f['Prasyarat Data']}`; }
  else { status = 'Belum diuji'; blocker = lulus.length ? 'Test terkait lulus tetapi hanya membuktikan tampilan halaman, bukan aksi ini' : '-'; }

  const keberadaan = halaman5xx ? 'Halaman error'
    : lulus.length || /aksi terlihat/i.test(ui) ? 'Terkonfirmasi'
      : f.Jenis === 'Tampilan' && /halaman terbuka/i.test(ui) ? 'Terkonfirmasi (halaman)' : 'Belum terkonfirmasi';
  return { status, blocker, evidence: evidence.join(' | ') || (ui !== '-' ? `sweep: ${ui}` : '-'), keberadaan, dieksekusi: exe.length > 0 };
}

const koreksiFile = path.join(EV, 'inventaris-fitur', 'koreksi-qa.tsv');
const koreksi = fs.existsSync(koreksiFile) ? Object.fromEntries(tsv(koreksiFile).map((k) => [k.ID, k])) : {};

const rows = fitur.map((f) => {
  const m = peta[f.ID];
  const s = tentukan(f, m);
  const k = koreksi[f.ID];
  if (k) { s.blocker = `[Koreksi QA: ${s.status} → ${k.Status}] ${k.Alasan}`; s.status = k.Status; }
  return {
    'ID Fitur': f.ID, Modul: f.Modul, 'Fitur/Aksi': f['Fitur/Aksi'], Role: f.Role, 'Sumber Requirement': f.Sumber,
    'Data/Prasyarat': f['Prasyarat Data'], 'Spec Terkait': m ? m['Spec Terkait'] : '(belum dipetakan)',
    'Metode Uji': m ? m['Metode Uji'] : '-', Status: s.status, Evidence: s.evidence,
    'Blocker/Tindak Lanjut': s.blocker, Jenis: f.Jenis, Mutasi: f.Mutasi, 'Keberadaan di Lokal': s.keberadaan,
    Automation: m ? m.Automation : '-', 'Bukti Spec': m ? m['Bukti Spec'] : '-', 'Halaman UI': m ? m['Halaman UI'] : '-',
    'Bukti UI': m ? m['Bukti UI'] : '-', Kelompok: m ? m.Kelompok : '-', Dependensi: m ? m.Dependensi : '-',
    'Langkah Manual': m ? m['Langkah Manual'] : '-', 'Expected Manual': m ? m['Expected Manual'] : '-',
    'Evidence Manual': m ? m['Evidence Manual'] : '-', 'Catatan Rule': f.Catatan,
  };
});

const out = path.resolve(ROOT, arg('out', path.join(EV, 'matriks-cakupan.json')));
const belumPeta = rows.filter((r) => r['Spec Terkait'] === '(belum dipetakan)').length;
fs.writeFileSync(out, JSON.stringify({ dibuat: new Date().toISOString(), total: rows.length, belumDipetakan: belumPeta, rows }, null, 1));
const hit = (k) => rows.reduce((a, r) => ((a[r[k]] = (a[r[k]] || 0) + 1), a), {});
console.log(`Fitur: ${rows.length} (belum dipetakan: ${belumPeta})`);
console.log('Status:', JSON.stringify(hit('Status')));
console.log('Automation:', JSON.stringify(hit('Automation')));
console.log('Keberadaan:', JSON.stringify(hit('Keberadaan di Lokal')));
console.log(`Tersimpan: ${path.relative(ROOT, out)}`);
