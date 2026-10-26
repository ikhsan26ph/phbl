import { expect, test as setup, type Page } from '@playwright/test';
import path from 'path';

/**
 * Login tujuh akun dan simpan storageState ke .auth/<target>/<peran>.json
 * (target = TARGET_ENV, lihat playwright.config.ts).
 *
 * Kredensial WAJIB dari .env root (process.env, dimuat scripts/env.js) — dilarang hardcode
 * email/password. Daftar akun & status wajib/opsional per target ada di
 * scripts/targets.js: akun WAJIB yang kosong = GAGAL (penghambat kesiapan),
 * akun opsional yang kosong = skip (mis. admin-sub-read di demo). Untuk
 * verifikasi terbatas tanpa akun tertentu, saring lewat --grep-invert (lihat
 * CLAUDE.md "Setup environment") — aturan wajib/opsional jangan dilonggarkan.
 *
 * Pemetaan peran:
 * - Bid Owner  = Shipper      (UI: "Pemilik Barang")
 * - Bidder     = Transporter  (UI: "Ekspedisi")
 *
 * Locator dikalibrasi ke halaman asli via `playwright-cli generate-locator`
 * (2026-08-12, https://phbidlautdemo.prahu-hub.com). Admin & admin-sub login
 * lewat form yang sama di root (/user/login) — dikonfirmasi user; ADMIN_PATH=/.
 * Halaman pendaratan pasca-login BERBEDA per akun (carirute / listlelang /
 * akunsaya), sehingga bukti login memakai elemen, bukan URL: link "KELUAR"
 * di top bar yang hanya ada setelah login (terverifikasi visible di 6 akun demo).
 */

const { ACCOUNTS, targetName, isRequired, credentials } = require('../scripts/targets.js');

const TARGET: string = targetName();
const AUTH_DIR = path.resolve(__dirname, '..', '.auth', TARGET);

interface RoleAccount {
  /** Nama project Playwright sekaligus nama file storageState. */
  name: string;
  /** Prefiks variabel env, mis. ADMIN_SUB → ADMIN_SUB_EMAIL/ADMIN_SUB_PASSWORD. */
  env: string;
  /** true = login lewat ADMIN_PATH, false = lewat root ("/"). */
  viaAdminPath: boolean;
}

async function login(page: Page, account: RoleAccount): Promise<void> {
  const { email, password } = credentials(account);
  const loginPath = account.viaAdminPath ? process.env.ADMIN_PATH ?? '/' : '/';
  await page.goto(loginPath);

  await page.getByRole('textbox', { name: 'Masukkan Email / No. Whatsapp' }).fill(email!);
  await page.getByRole('textbox', { name: 'Masukkan Kata Sandi Anda' }).fill(password!);
  await page.getByRole('button', { name: 'Masuk' }).click();

  // Bukti login: link "KELUAR" hanya dirender setelah autentikasi.
  await expect(page.getByRole('link', { name: 'KELUAR' })).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: path.join(AUTH_DIR, `${account.name}.json`) });
}

for (const account of ACCOUNTS as RoleAccount[]) {
  setup(`login ${account.name}`, async ({ page }) => {
    const { email, password } = credentials(account);
    const kosong = !email || !password;
    // Akun WAJIB untuk target ini (scripts/targets.js) yang kredensialnya kosong
    // adalah penghambat kesiapan → gagal keras, bukan skip diam-diam.
    if (kosong && isRequired(account.name, TARGET)) {
      throw new Error(
        `Akun WAJIB ${account.name} (${account.env}_EMAIL/${account.env}_PASSWORD) kosong di ` +
          `.env — penghambat kesiapan target ${TARGET}`,
      );
    }
    setup.skip(kosong, `Kredensial opsional ${account.name} kosong di .env — dilewati`);
    await login(page, account);
  });
}
