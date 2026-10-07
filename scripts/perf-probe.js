// Probe ringan untuk baseline HTTP, bukan load test. Tidak memuat AJAX/render browser.
// Jalankan: node scripts/perf-probe.js
const { request } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');
const { performance } = require('perf_hooks');

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const cases = [
  { role: 'anon', path: '/user/login' },
  { role: 'admin', path: '/order/OrderList' },
  { role: 'admin', path: '/order/search_order_list', method: 'POST', form: { limit: '20', pageNow: '1', sortBy: '', pencarian: '', sortType: '' } },
  { role: 'admin', path: '/home/dashboardorder' },
  { role: 'shipper', path: '/home/analitikscsr' },
  { role: 'shipper', path: '/home/searchpushnotif?status_read=unread&kategori=all', method: 'POST', form: { limit: '20', pageNow: '1' } },
  { role: 'transporter', path: '/lelang/listlelang' },
];
const credentials = {
  admin: ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
  shipper: ['SHIPPER_EMAIL', 'SHIPPER_PASSWORD'],
  transporter: ['TRANSPORTER_EMAIL', 'TRANSPORTER_PASSWORD'],
};

async function main() {
  if (!process.env.BASE_URL) throw new Error('BASE_URL belum diisi di .env');
  let invalidSessions = 0;
  let errors = 0;
  let invalidResponses = 0;
  const contexts = new Map();
  for (const item of cases) {
    try {
      let context = contexts.get(item.role);
      if (!context) {
        context = await request.newContext({ baseURL: process.env.BASE_URL, timeout: 20000 });
        contexts.set(item.role, context);
        if (item.role !== 'anon') {
          const [emailKey, passwordKey] = credentials[item.role];
          if (!process.env[emailKey] || !process.env[passwordKey]) throw new Error(`Kredensial ${item.role} kosong`);
          await context.get('/user/login');
          const login = await context.post('/user/do_login/', {
            form: { email: process.env[emailKey], password: process.env[passwordKey] },
          });
          if (!login.ok()) throw new Error(`Login ${item.role} HTTP ${login.status()}`);
        }
      }
      const start = performance.now();
      const response = item.method === 'POST'
        ? await context.post(item.path, { form: item.form })
        : await context.get(item.path);
      const body = await response.body();
      const elapsedMs = Math.round(performance.now() - start);
      const finalPath = new URL(response.url()).pathname;
      const content = body.toString('utf8');
      const authValid = item.role === 'anon' || (
        finalPath.toLowerCase() !== '/user/login'
        && !content.includes('Masukkan Email / No. Whatsapp')
      );
      if (!authValid) invalidSessions += 1;
      const details = {};
      if (item.path === '/order/search_order_list') {
        details.orderIds = new Set(content.match(/20\d{6}-\d{5}/g) || []).size;
      }
      if (item.path.startsWith('/home/searchpushnotif?')) {
        try {
          const data = JSON.parse(content);
          details.notificationSchemaValid = Number.isFinite(Number(data.jumlah)) && Array.isArray(data.datatbl);
        } catch { details.notificationSchemaValid = false; }
      }
      if (!response.ok()
        || (item.path === '/order/search_order_list' && details.orderIds === 0)
        || (item.path.startsWith('/home/searchpushnotif?') && !details.notificationSchemaValid)) {
        invalidResponses += 1;
      }
      console.log(JSON.stringify({ role: item.role, method: item.method || 'GET', path: item.path, status: response.status(), finalPath, elapsedMs, bytes: body.length, authValid, ...details }));
    } catch (error) {
      errors += 1;
      console.log(JSON.stringify({ role: item.role, path: item.path, error: error.message.split('\n')[0] }));
    }
  }
  for (const context of contexts.values()) await context.dispose();
  if (invalidSessions > 0) {
    console.error(`${invalidSessions} request diarahkan ke login; cek respons login atau pembatasan sesi aplikasi.`);
    process.exitCode = 2;
  }
  if (errors > 0) process.exitCode = 1;
  if (invalidResponses > 0) process.exitCode = 1;
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
