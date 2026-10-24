// Eksplorasi READ-ONLY fitur UI tanpa rule: GET halaman + rekam struktur. Tanpa klik
// aksi/submit; halaman "tambah" hanya dibuka (GET) untuk mencatat field form.
const fs = require('fs'); const path = require('path'); const ROOT = 'E:/Project/phbl';
require(path.join(ROOT, 'node_modules/dotenv')).config({ path: path.join(ROOT, '.env.local'), quiet: true });
const { chromium, devices, request } = require(path.join(ROOT, 'node_modules/@playwright/test'));
const BASE = process.env.BASE_URL;
const HALAMAN = [
  ['admin', 'UI-ADM-01', '/dashboardanalitik/ringkasan'], ['admin', 'UI-ADM-02', '/analitik/analitikfcu'],
  ['admin', 'UI-ADM-03', '/analitik/analitikotdr'], ['admin', 'UI-ADM-04', '/home/analitikshipmentaccuracy'],
  ['admin', 'UI-ADM-05', '/adminprahu/biayalayanan'], ['admin', 'UI-ADM-06', '/analitik/masterjenismuatan'],
  ['admin', 'UI-ADM-07', '/analitik/masterhargabarang'], ['admin', 'UI-ADM-08', '/adminprahu/masterfreetime'],
  ['shipper', 'UI-SHP-01', '/dashboardanalitik/ringkasan'], ['shipper', 'UI-SHP-02', '/analitik/analitikfcu'],
  ['shipper', 'UI-SHP-03', '/analitik/analitikotdr'], ['shipper', 'UI-SHP-04', '/home/analitikshipmentaccuracy'],
  ['shipper', 'UI-SHP-06', '/analitik/hargabarang'],
];
async function tenang() { const r = await request.newContext(); for (let i = 0; i < 30; i++) { const t = Date.now(); await r.get(BASE + '/user/login', { timeout: 120000 }).catch(() => {}); if (Date.now() - t < 3000) break; await new Promise((s) => setTimeout(s, 10000)); } await r.dispose(); }
async function struktur(p) {
  return p.evaluate(() => {
    const vis = (e) => !!e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
    const txt = (e) => (e.innerText || e.textContent || e.value || '').replace(/\s+/g, ' ').trim();
    const main = document.querySelector('.app-main__inner') || document.body;
    const labelOf = (el) => { const l = el.id && document.querySelector(`label[for="${el.id}"]`); return l ? txt(l) : (el.closest('.form-group, .col, div')?.querySelector('label') ? txt(el.closest('.form-group, .col, div').querySelector('label')) : ''); };
    const field = [...main.querySelectorAll('input, select, textarea')].filter((e) => e.type !== 'hidden' && (vis(e) || e.classList.contains('select2-hidden-accessible') || e.closest('.multi-select')))
      .map((e) => ({ label: labelOf(e).slice(0, 40), id: e.id || e.name, tipe: e.tagName === 'SELECT' ? 'select' : e.type, wajib: e.required, nilai: e.tagName === 'SELECT' ? `${[...e.options].filter((o) => o.value).length} opsi` : (e.value || '').slice(0, 30), placeholder: e.placeholder || '' })).slice(0, 30);
    const ms = [...main.querySelectorAll('.multi-select')].map((m) => ({ widget: 'multi-select', header: txt(m.querySelector('.multi-select-header') || m).slice(0, 40), opsi: m.querySelectorAll('[role=option]').length }));
    const tombol = [...main.querySelectorAll('a, button, input[type=submit], input[type=button]')].filter(vis).map((e) => ({ teks: txt(e).slice(0, 40) || e.getAttribute('title') || e.getAttribute('data-original-title') || '', href: (e.getAttribute('href') || '').replace(location.origin, '').slice(0, 70), id: e.id || '' })).filter((t) => t.teks || t.href).slice(0, 40);
    const kolom = [...main.querySelectorAll('table thead th')].filter(vis).map(txt).filter(Boolean);
    const petunjuk = [...main.querySelectorAll('small, .text-muted, .hint, i, p, span')].filter(vis).map(txt).filter((t) => /maksimal|wajib|minimal|catatan|\*\)|range|bulan|hari/i.test(t) && t.length < 160);
    const judul = [...main.querySelectorAll('.heading_1, .heading_2, h1, h2, h3, h4')].filter(vis).map(txt).filter(Boolean).slice(0, 8);
    const breadcrumb = txt(main.querySelector('.breadcrumb, [class*=breadcrumb]') || { innerText: '' }).slice(0, 100);
    const kosong = /Tidak Ada Data/i.test(main.innerText);
    const grafik = main.querySelectorAll('canvas, svg.highcharts-root, .apexcharts-canvas').length;
    return { judul, breadcrumb, field, multiSelect: ms, tombol, kolom, petunjuk: [...new Set(petunjuk)].slice(0, 10), tabelKosong: kosong, elemenGrafik: grafik };
  });
}
(async () => {
  const b = await chromium.launch(); const out = [];
  const ctxs = {};
  for (const [role, id, url] of HALAMAN) {
    await tenang();
    ctxs[role] ??= await b.newContext({ ...devices['Desktop Chrome'], baseURL: BASE, storageState: path.join(ROOT, '.auth/local', role + '.json') });
    const p = await ctxs[role].newPage(); const err5 = []; const xhr = [];
    p.on('response', (r) => { const q = r.request(); if (['xhr', 'fetch'].includes(q.resourceType())) xhr.push(`${q.method()} ${r.status()} ${r.url().replace(BASE, '').slice(0, 70)}`); if (r.status() >= 500) err5.push(r.url().replace(BASE, '')); });
    let status = null; try { const r = await p.goto(url, { timeout: 60000 }); status = r && r.status(); await p.waitForLoadState('load', { timeout: 60000 }); } catch (e) { status = 'ERR ' + e.message.split('\n')[0].slice(0, 60); }
    for (let i = 0; i < 15; i++) { if (!(await p.getByText('Mohon tunggu sebentar').filter({ visible: true }).count().catch(() => 0))) break; await p.waitForTimeout(1000); }
    const s = await struktur(p).catch((e) => ({ error: e.message.slice(0, 80) }));
    // halaman tambah/detail yang berupa link (bukan modal): buka GET saja untuk mencatat field
    const sub = [];
    for (const t of (s.tombol || []).filter((t) => /tambah|lihat daftar|lihat laporan|detail/i.test(t.teks) && t.href && t.href.startsWith('/') && !/javascript/.test(t.href)).slice(0, 2)) {
      await tenang();
      const q = await ctxs[role].newPage(); let st = null;
      try { const r = await q.goto(t.href, { timeout: 60000 }); st = r && r.status(); await q.waitForLoadState('load', { timeout: 60000 }); } catch (e) { st = 'ERR'; }
      sub.push({ dari: t.teks, href: t.href, status: st, struktur: await struktur(q).catch(() => null) });
      await q.close();
    }
    out.push({ role, id, url, status, urlAkhir: p.url().replace(BASE, ''), http5xx: err5, xhr: [...new Set(xhr)].slice(0, 8), ...s, subHalaman: sub });
    console.log(`${id} ${role} ${url} → ${status}; field ${(s.field || []).length}, tombol ${(s.tombol || []).length}, kolom ${(s.kolom || []).length}, sub ${sub.length}`);
    await p.close();
  }
  await b.close();
  fs.writeFileSync(path.join(ROOT, 'report/evidence-local-2026-10-23/eksplor-ui-tanpa-rule.json'), JSON.stringify({ waktu: new Date().toISOString(), host: BASE, out }, null, 1));
  console.log('Tersimpan eksplor-ui-tanpa-rule.json');
})();
