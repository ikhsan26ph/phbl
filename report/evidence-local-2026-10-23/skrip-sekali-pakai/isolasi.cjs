// Pengamatan TERISOLASI satu halaman per role (READ-ONLY): tunggu server tenang dulu,
// rekam dokumen + semua XHR (status, durasi, ringkasan error), tunggu XHR selesai ≤120 dtk.
const fs = require('fs'); const path = require('path'); const ROOT = 'E:/Project/phbl';
require(path.join(ROOT, 'node_modules/dotenv')).config({ path: path.join(ROOT, '.env.local'), quiet: true });
const { chromium, devices, request } = require(path.join(ROOT, 'node_modules/@playwright/test'));
const BASE = process.env.BASE_URL;
const CEK = [['shipper', '/analitik/datajenismuatan'], ['transporter', '/home/myprofile'], ['shipper', '/lelang/carijadwal'], ['transporter', '/home/hakaksesbidder']];
async function tenang() { const r = await request.newContext(); for (let i = 0; i < 30; i++) { const t = Date.now(); await r.get(BASE + '/user/login', { timeout: 120000 }).catch(() => {}); const ms = Date.now() - t; if (ms < 3000) { await r.dispose(); return ms; } await new Promise((s) => setTimeout(s, 10000)); } await r.dispose(); return -1; }
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const [role, url] of CEK) {
    const pre = await tenang();
    const ctx = await b.newContext({ ...devices['Desktop Chrome'], baseURL: BASE, storageState: path.join(ROOT, '.auth/local', role + '.json') });
    const p = await ctx.newPage(); const t0 = Date.now(); const pend = new Map(); const log = [];
    p.on('request', (q) => { if (['document', 'xhr', 'fetch'].includes(q.resourceType())) pend.set(q, Date.now()); });
    p.on('response', async (r) => { const q = r.request(); if (!pend.has(q)) return; const ms = Date.now() - pend.get(q); pend.delete(q); let b2 = ''; try { b2 = (await r.text()).replace(/\s+/g, ' '); } catch {}
      const err = (b2.match(/Fatal error[^<]{0,100}|\[(Emergency|Error|Warning|Notice|User Error)\][^<]{0,110}/) || [''])[0].replace(/[A-Z]:\[^\s<]+/g, '<path>');
      log.push({ t: +((Date.now() - t0) / 1000).toFixed(1), tipe: q.resourceType(), metode: q.method(), status: r.status(), ms, url: r.url().replace(BASE, '').slice(0, 70), err }); });
    let navErr = '';
    try { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); } catch (e) { navErr = String(e.message).split('\n')[0]; }
    for (let i = 0; i < 120 && pend.size; i++) await p.waitForTimeout(1000);
    const masih = [...pend.keys()].map((q) => q.method() + ' ' + q.url().replace(BASE, ''));
    out.push({ role, url, serverTenangSebelumMs: pre, navErr, xhrBelumSelesai: masih, log });
    console.log(`\n## ${role} ${url} (login sebelum: ${pre}ms) ${navErr}`); log.forEach((l) => console.log(`   ${l.t}s ${l.tipe} ${l.metode} ${l.status} ${l.ms}ms ${l.url}${l.err ? ' ERR=' + l.err : ''}`)); if (masih.length) console.log('   BELUM SELESAI:', masih.join(', '));
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(path.join(ROOT, 'report/evidence-local-2026-10-23/isolasi-halaman-lambat.json'), JSON.stringify({ waktu: new Date().toISOString(), out }, null, 1));
})();
