/**
 * Probe plugin/library front-end per halaman — READ-ONLY (hanya GET halaman).
 *
 * Jalankan (sesi .auth/<target>/ harus segar → jalankan project setup dulu):
 *   node scripts/plugin-probe.js --out=report/evidence-plugin-<tanggal>
 *   node scripts/plugin-probe.js --halaman=report/baseline-php-8.2.35/plugin-hasil.json --out=...
 *
 * Daftar halaman default = daftar di baseline (`--halaman`, default
 * report/baseline-php-8.2.35/plugin-hasil.json) supaya hasil sebelum/sesudah
 * patch sebanding. Halaman yang membebani server / mengakhiri sesi tidak
 * pernah dibuka (lihat SKIP).
 *
 * Per halaman dicatat: status & waktu, respons ≥400 (dokumen/XHR/aset, termasuk
 * CDN), request gagal, pageerror (JS tak tertangkap), console.error, daftar
 * <script>/<link> yang dimuat, global window baru (dibanding halaman kosong),
 * plugin $.fn terdaftar, dan instance plugin yang terpasang di elemen.
 * Tidak ada klik, submit, atau perubahan data. Cookie/kredensial tidak dicatat.
 */
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('@playwright/test');
const { loadEnv } = require('./env.js');
const { targetName } = require('./targets.js');

loadEnv();
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').slice(k.length + 3) || d;
const OUT = path.resolve(ROOT, arg('out', `report/evidence-plugin-${new Date().toISOString().slice(0, 10)}`));
const HALAMAN = path.resolve(ROOT, arg('halaman', 'report/baseline-php-8.2.35/plugin-hasil.json'));
const BASE = process.env.BASE_URL;
const ORIGIN = new URL(BASE).origin;
const AUTH = path.join(ROOT, '.auth', targetName());
const SKIP = /do_logout|masterkota|masterpropinsi|datajenismuatan/i;

const plan = JSON.parse(fs.readFileSync(HALAMAN, 'utf8'))
  .map((x) => ({ role: x.role, page: x.page }))
  .filter((x) => !SKIP.test(x.page));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const blank = await (await browser.newContext()).newPage();
  await blank.goto('about:blank');
  const baseGlobals = await blank.evaluate(() => Object.getOwnPropertyNames(window));
  const hasil = [];
  let ctx;
  let cur;
  for (const { role, page: p } of plan) {
    if (cur !== role) {
      if (ctx) await ctx.close();
      cur = role;
      const sesi = path.join(AUTH, `${role}.json`);
      if (role !== 'anon') {
        // Penjaga: sesi milik host BASE_URL saat ini (tunnel bisa berganti) …
        const domains = JSON.parse(fs.readFileSync(sesi, 'utf8')).cookies.map((c) => c.domain.replace(/^\./, ''));
        if (!domains.includes(new URL(BASE).hostname)) {
          throw new Error(`Sesi ${role} dibuat untuk host lain (${domains.join(', ') || 'tanpa cookie'}), bukan ${new URL(BASE).hostname} — jalankan project setup dulu.`);
        }
      }
      ctx = await browser.newContext({
        ...devices['Desktop Chrome'],
        baseURL: BASE,
        ...(role === 'anon' ? {} : { storageState: sesi }),
      });
      if (role !== 'anon') {
        // … dan benar-benar login; tanpa ini probe diam-diam memeriksa halaman login.
        const cek = await ctx.newPage();
        await cek.goto('/home/akunsaya', { timeout: 90_000 });
        const login = await cek.locator('a[href*="do_logout"]').count();
        await cek.close();
        if (!login) throw new Error(`Sesi ${role} tidak berlaku (tidak ada link logout) — jalankan project setup dulu.`);
      }
    }
    const page = await ctx.newPage();
    const rec = { role, page: p, res: [], fail: [], pageErrors: [], consoleErrors: [] };
    page.on('response', (r) => {
      const t = r.request().resourceType();
      if (['script', 'stylesheet', 'font', 'image', 'xhr', 'fetch', 'document'].includes(t)) rec.res.push({ t, s: r.status(), u: r.url() });
    });
    page.on('requestfailed', (q) => rec.fail.push({ t: q.resourceType(), u: q.url(), e: q.failure()?.errorText }));
    page.on('pageerror', (e) => rec.pageErrors.push({ m: e.message.split('\n')[0].slice(0, 300), st: (e.stack || '').split('\n').slice(1, 3).join(' ').slice(0, 300) }));
    page.on('console', (m) => { if (m.type() === 'error') rec.consoleErrors.push({ m: m.text().slice(0, 300), loc: m.location()?.url || '' }); });
    const t0 = Date.now();
    try {
      const resp = await page.goto(p, { timeout: 90_000, waitUntil: 'load' });
      rec.status = resp?.status();
      rec.finalUrl = page.url().replace(ORIGIN, '');
      await page.waitForTimeout(6000);
      Object.assign(rec, await page.evaluate((bg) => {
        const $ = window.jQuery;
        const all = (s) => [...document.querySelectorAll(s)];
        const dataCount = (k) => ($ ? all('input,select,textarea,div,span').filter((e) => $(e).data(k)).length : 0);
        let charts = 0;
        try { charts = window.Chart && window.Chart.instances ? Object.keys(window.Chart.instances).length : 0; } catch { /* abaikan */ }
        return {
          title: document.title,
          loggedIn: !!document.querySelector('a[href*="do_logout"]'),
          jq: $ ? $.fn.jquery : null,
          jqfn: $ ? Object.keys($.fn).filter((k) => typeof $.fn[k] === 'function') : [],
          globals: Object.getOwnPropertyNames(window).filter((k) => !bg.includes(k) && !/^(on|webkit)/.test(k)),
          scripts: [...document.scripts].map((s) => s.src).filter(Boolean),
          css: all('link[rel=stylesheet]').map((l) => l.href),
          inst: {
            select2: all('.select2-container').length,
            daterangepicker: dataCount('daterangepicker'),
            datepicker: dataCount('datepicker'),
            mask: dataCount('mask'),
            chart: charts,
            leafletMap: all('.leaflet-container').length,
            floatThead: all('.floatThead-container').length,
            multiSelect: all('.multi-select').length,
            ckeditor: all('.ck-editor').length,
          },
        };
      }, baseGlobals));
    } catch (e) {
      rec.navError = e.message.split('\n')[0];
    }
    rec.ms = Date.now() - t0;
    await page.close();
    hasil.push(rec);
    console.log(`${role.padEnd(11)} ${String(rec.status ?? 'ERR').padEnd(4)} ${String(Math.round(rec.ms / 1000)).padStart(3)}s pe=${rec.pageErrors.length} bad=${rec.res.filter((x) => x.s >= 400).length} ${p}${rec.navError ? ' NAV:' + rec.navError.slice(0, 80) : ''}`);
  }
  if (ctx) await ctx.close();
  await browser.close();
  const meta = { waktu: new Date().toISOString(), baseURL: BASE, halaman: hasil.length };
  fs.writeFileSync(path.join(OUT, 'hasil.json'), JSON.stringify(hasil));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
  console.log(`Tersimpan: ${path.relative(ROOT, OUT)}/hasil.json (${hasil.length} halaman)`);
})();
