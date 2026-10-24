// Sweep keberadaan fitur per role — READ-ONLY: hanya GET halaman menu; tidak
// mengklik, mengisi, atau submit apa pun. Bukti "ada di UI", BUKAN "berfungsi".
const fs = require('fs');
const path = require('path');
const ROOT = 'E:/Project/phbl';
require(path.join(ROOT, 'node_modules/dotenv')).config({ path: path.join(ROOT, '.env.local'), quiet: true });
const { chromium, devices } = require(path.join(ROOT, 'node_modules/@playwright/test'));
const BASE = process.env.BASE_URL;
const LEWATI = /masterpropinsi|masterkota|logout|keluar|wa\.me|mailto:|javascript:|#$/i; // Provinsi/Kota: antrean server

(async () => {
  const b = await chromium.launch();
  const hasil = { waktu: new Date().toISOString(), target: 'local', catatan: 'GET halaman menu saja; Provinsi/Kota dilewati', role: {} };
  for (const role of ['admin', 'shipper', 'transporter', 'admin-sub-read']) {
    const ctx = await b.newContext({ ...devices['Desktop Chrome'], baseURL: BASE, storageState: path.join(ROOT, '.auth/local', role + '.json') });
    const p = await ctx.newPage();
    await p.goto('/home/akunsaya'); await p.waitForLoadState('load');
    const menu = await p.evaluate(() => [...document.querySelectorAll('ul.vertical-nav-menu a[href]')]
      .map((a) => ({ teks: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href') }))
      .filter((m) => m.teks && m.href));
    const seen = new Set(); const halaman = [];
    for (const m of menu) {
      let url; try { url = new URL(m.href, BASE + '/'); } catch { continue; }
      if (url.origin !== new URL(BASE).origin || LEWATI.test(url.href) || seen.has(url.pathname + url.search)) continue;
      seen.add(url.pathname + url.search);
      const err5 = []; const onRes = (r) => { if (r.status() >= 500 && r.url().startsWith(BASE)) err5.push(`${r.request().method()} ${r.status()} ${r.url().replace(BASE, '')}`); };
      p.on('response', onRes);
      const t0 = Date.now(); let status = null; let gagal = '';
      try { const r = await p.goto(url.href, { timeout: 45000 }); status = r && r.status(); await p.waitForLoadState('load', { timeout: 45000 }); } catch (e) { gagal = String(e.message).split('\n')[0].slice(0, 100); }
      // tunggu tabel async selesai (indikator terlihat), maks 15 dtk
      for (let i = 0; i < 15; i++) { const n = await p.getByText('Mohon tunggu sebentar').filter({ visible: true }).count().catch(() => 0); if (!n) break; await p.waitForTimeout(1000); }
      const info = await p.evaluate(() => {
        const vis = (e) => !!e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
        const txt = (e) => (e.textContent || e.value || e.getAttribute('title') || e.getAttribute('data-original-title') || '').replace(/\s+/g, ' ').trim();
        const aksi = [...document.querySelectorAll('main a, main button, .app-main a, .app-main button, .app-main__inner a, .app-main__inner button, input[type=submit], input[type=button]')]
          .filter(vis).map(txt).filter((t) => t && t.length < 50 && /tambah|export|import|upload|download|filter|reset|cari|input|edit|hapus|simpan|submit|pilih|buat|lihat|detail|setting|request|kirim|batal|terima|tolak|nego|pesan|tracking|invoice|tugas|unduh|template|cetak|print|validasi|aktif/i.test(t));
        const tab = [...document.querySelectorAll('.btn-tabs, .nav-tabs a, [class*=tabs] a')].filter(vis).map(txt).filter(Boolean);
        const th = [...document.querySelectorAll('table thead th')].filter(vis).map(txt).filter(Boolean);
        const tolak = [...document.querySelectorAll('.alert_negatif')].filter(vis).map(txt).join(' | ');
        const kosong = /Tidak Ada Data/i.test(document.body.innerText);
        const judul = (document.querySelector('.heading_1, .heading_2, h1, h2') || {}).textContent;
        return { judul: (judul || '').replace(/\s+/g, ' ').trim().slice(0, 60), aksi: [...new Set(aksi)].slice(0, 40), tab: [...new Set(tab)].slice(0, 12), kolom: [...new Set(th)].slice(0, 25), tolak, kosong };
      }).catch((e) => ({ error: String(e.message).slice(0, 80) }));
      p.off('response', onRes);
      halaman.push({ menu: m.teks, path: url.pathname + url.search, status, ms: Date.now() - t0, akhir: p.url().replace(BASE, ''), gagal, http5xx: err5, ...info });
      process.stdout.write(`${role} ${status} ${(Date.now() - t0)}ms ${url.pathname}${err5.length ? ' 5xx' : ''}\n`);
    }
    hasil.role[role] = { menu, halaman };
    await ctx.close();
  }
  await b.close();
  const out = path.join(ROOT, 'report/evidence-local-2026-10-23/sweep-ui-per-role.json');
  fs.writeFileSync(out, JSON.stringify(hasil, null, 1));
  console.log('Tersimpan', out);
})();
