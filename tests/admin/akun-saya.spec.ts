import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Akun Saya — peran Administrator (project "admin", storageState
 * .auth/admin.json via project setup). Read-only.
 * Rule: docs/rules/administrator/15-akun-saya.md — "Untuk akun pusat dari
 * admin di create dari backend, maka data yang tampil hanya nama dan email
 * saja."
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - /home/akunsaya: heading span.heading_1 "AKUN SAYA" (teks yang sama juga
 *   dipakai link menu sidebar → jangan getByText polos, strict mode violation
 *   terbukti), breadcrumb "Beranda / Akun Saya" (Beranda = link ke
 *   /lelang/listLelang). Data akun BUKAN tabel melainkan pasangan div:
 *   `<div><div>Label <span>:</span></div><div>Nilai</div></div>` → nilai
 *   diambil via xpath following-sibling. Empat baris: Nama, Email, Nomor
 *   Whatsapp, Bagian Staff — dua terakhir bernilai "-" untuk akun pusat
 *   (itulah wujud "hanya nama dan email" pada rule: barisnya tetap dirender,
 *   nilainya strip).
 * - TIDAK ada tombol Edit Akun Saya / Ubah Kata Sandi / menu Preference Notif
 *   di halaman ini (beda dgn Akun Saya shipper & transporter).
 * - Nilai Nama/Email dicocokkan dengan ADMIN_EMAIL di .env (kredensial tidak
 *   di-hardcode, sesuai konvensi repo).
 */

/** Nilai baris data akun: div berisi label → div sesudahnya berisi nilai. */
const nilaiBaris = (page: Page, label: string) =>
  page.locator(`xpath=//div[normalize-space(text())="${label}"]/following-sibling::div[1]`).first();

test.describe('Akun Saya (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home/akunsaya');
  });

  test('menampilkan nama dan email akun pusat admin', async ({ page }) => {
    await expect(page.getByText(/Beranda\s*\/\s*Akun Saya/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Beranda' }).first()).toHaveAttribute('href', /\/lelang\/listLelang$/i);
    // Teks "AKUN SAYA" juga dipakai link sidebar — scope ke heading halaman.
    await expect(page.locator('span.heading_1', { hasText: 'AKUN SAYA' })).toBeVisible();

    const email = process.env.ADMIN_EMAIL;
    expect(email, 'ADMIN_EMAIL wajib ada di .env').toBeTruthy();
    await expect(nilaiBaris(page, 'Nama')).toHaveText(/\S+/);
    await expect(nilaiBaris(page, 'Email')).toHaveText(email!);
  });

  test('data selain nama & email bernilai strip karena akun dibuat dari backend', async ({ page }) => {
    // Rule: akun pusat admin hanya menampilkan nama & email — baris Nomor
    // Whatsapp dan Bagian Staff tetap dirender tapi tanpa nilai ("-").
    for (const label of ['Nomor Whatsapp', 'Bagian Staff']) {
      await expect(nilaiBaris(page, label)).toHaveText('-');
    }
  });

  test('tidak menyediakan tombol edit akun maupun ubah kata sandi', async ({ page }) => {
    for (const nama of [/Edit Akun Saya/i, /Ubah Kata Sandi/i, /Edit Profil/i]) {
      await expect(page.getByRole('link', { name: nama })).toHaveCount(0);
      await expect(page.getByRole('button', { name: nama })).toHaveCount(0);
    }
  });
});
