import { expect, test as setup, type Page } from '@playwright/test';
import path from 'path';

/**
 * Login tujuh akun dan simpan storageState ke .auth/<target>/<peran>.json
 * (target = TARGET_ENV, lihat playwright.config.ts).
 *
 * Kredensial WAJIB dari .env.<target> (process.env) — dilarang hardcode
 * email/password. Peran yang kredensialnya kosong akan di-skip, bukan error
 * (mis. admin-sub-read hanya ada di target local; demo tetap 6 akun).
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

const AUTH_DIR = path.resolve(__dirname, '..', '.auth', process.env.TARGET_ENV ?? 'demo');

interface RoleAccount {
  /** Nama project Playwright sekaligus nama file storageState. */
  name:
    | 'admin'
    | 'admin-sub'
    | 'admin-sub-read'
    | 'shipper'
    | 'shipper-sub'
    | 'transporter'
    | 'transporter-sub';
  email: string | undefined;
  password: string | undefined;
  /** true = login lewat ADMIN_PATH, false = lewat root ("/"). */
  viaAdminPath: boolean;
}

const accounts: RoleAccount[] = [
  { name: 'admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, viaAdminPath: true },
  { name: 'admin-sub', email: process.env.ADMIN_SUB_EMAIL, password: process.env.ADMIN_SUB_PASSWORD, viaAdminPath: true },
  { name: 'admin-sub-read', email: process.env.ADMIN_SUB_READ_EMAIL, password: process.env.ADMIN_SUB_READ_PASSWORD, viaAdminPath: true },
  { name: 'shipper', email: process.env.SHIPPER_EMAIL, password: process.env.SHIPPER_PASSWORD, viaAdminPath: false },
  { name: 'shipper-sub', email: process.env.SHIPPER_SUB_EMAIL, password: process.env.SHIPPER_SUB_PASSWORD, viaAdminPath: false },
  { name: 'transporter', email: process.env.TRANSPORTER_EMAIL, password: process.env.TRANSPORTER_PASSWORD, viaAdminPath: false },
  { name: 'transporter-sub', email: process.env.TRANSPORTER_SUB_EMAIL, password: process.env.TRANSPORTER_SUB_PASSWORD, viaAdminPath: false },
];

async function login(page: Page, account: RoleAccount): Promise<void> {
  const loginPath = account.viaAdminPath ? process.env.ADMIN_PATH ?? '/' : '/';
  await page.goto(loginPath);

  await page.getByRole('textbox', { name: 'Masukkan Email / No. Whatsapp' }).fill(account.email!);
  await page.getByRole('textbox', { name: 'Masukkan Kata Sandi Anda' }).fill(account.password!);
  await page.getByRole('button', { name: 'Masuk' }).click();

  // Bukti login: link "KELUAR" hanya dirender setelah autentikasi.
  await expect(page.getByRole('link', { name: 'KELUAR' })).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: path.join(AUTH_DIR, `${account.name}.json`) });
}

for (const account of accounts) {
  setup(`login ${account.name}`, async ({ page }) => {
    setup.skip(
      !account.email || !account.password,
      `Kredensial ${account.name} kosong di .env.${process.env.TARGET_ENV ?? 'demo'} — dilewati`,
    );
    await login(page, account);
  });
}
