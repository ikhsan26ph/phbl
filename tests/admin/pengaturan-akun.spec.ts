import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Pengaturan Akun (Administrator) — Hak Akses & Sub User untuk
 * Shipper/Transporter/Admin. Project "admin" (storageState .auth/admin.json).
 * Rule: docs/rules/administrator/14-pengaturan-akun.md. Izin mutasi demo
 * dari user (2026-08-29): test membuat grup hak akses / sub user berprefix
 * AUTOTEST-<ts> lalu menghapusnya di finally.
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login admin):
 * - Hak Akses Shipper /home/hakaksesbidowner, Transporter /home/hakaksesbidder,
 *   Admin /adminprahu/hakaksesadmin: kolom No | Nama <peran> | Nama Hak Akses
 *   | Total Perizinan | Aksi (admin: Nama | Deskripsi | Total | Aksi); aksi
 *   Detail (a[href*=detailHakAkses...]), Edit, Hapus (button.btn-delete
 *   value=<id> → SweetAlert2 "Hapus?" → alert "Anda berhasil menghapus hak
 *   akses admin"); tombol Tambah Hak Akses → /home/tambahhakaksesbidowner
 *   (select #bidowner "Pilih Shipper" + 119 checkbox) / /adminprahu/
 *   tambah_hakaksesadmin (#nama_hak_akses, #deskripsi_hak_akses, 308 checkbox
 *   name=checkbox_hak_akses[] id=<akses>, 16 checkbox "Pilih Semua"
 *   name=checkbox_hak_akses_modul[] id=modul_<x>_pilih_semua, Simpan
 *   #submit_tambah_hak_akses). Simpan tanpa checkbox → native alert "Pilih
 *   Hak akses minimal 1". Rule parent/child terverifikasi: centang anak
 *   (#tambah_bank) → induk (#lihat_daftar_bank) ikut tercentang; lepas induk
 *   → anak ikut lepas; "Pilih Semua" modul mencentang seluruh modul.
 * - Sub User Admin /adminprahu/subUserAdmin: kolom No. | Nama Sub User |
 *   Email | Bagian Staff | Status | Aksi; aksi Detail (/adminprahu/
 *   detailsubuseradmin/<id>), Edit (/editsubuseradmin/<id>), Hapus = link
 *   /adminprahu/do_hapus_sub_user/<id> dengan native confirm "Apakah anda
 *   yakin untuk menghapus data sub user ...". Tambah → /adminprahu/
 *   tambahsubuseradmin: #email, #kata_sandi, #konfirm_kata_sandi, #nama,
 *   #bagian_staff, #no_wa, #status, multi-select #ukuran (hakaksesuser[],
 *   select2), Simpan #submit_tambah_sub_user.
 * - Sub User Shipper /home/subuserbidowner (Transporter /home/subuserbidder):
 *   kolom No | Nama <peran> | Nama Sub User | Email | Status | Aksi; Tambah →
 *   /home/subuser_create/?admin=bidowner (select #pilihuser, #email,
 *   #password, #password_confirm, nama, bagian staff, #no_wa, status,
 *   hakaksesuser[]; Simpan #submitonce1); Hapus = link /home/subuser_dodelete/
 *   <id>?classname=... dengan native confirm.
 * - Sampah grup "QA TEST … - HAPUS" (10 grup sisa run Edit Harga lama)
 *   dibersihkan manual 2026-08-29.
 *
 * TIDAK dicakup: efek tiap akses ke menu sub user (butuh login sub user per
 * kombinasi — sebagian sudah di tests/transporter-sub & edit-harga), notif
 * email/push, sub user non-aktif tidak bisa login (butuh akun uji nonaktif).
 */

const tsPendek = () => Date.now().toString(36).toUpperCase().slice(-6);

const STRUKTUR: Array<{ nama: string; url: string; kolom: string[]; tambah: string; aksi: string[] }> = [
  { nama: 'Hak Akses Shipper', url: '/home/hakaksesbidowner', kolom: ['No', 'Nama Shipper', 'Nama Hak Akses', 'Total Perizinan', 'Aksi'], tambah: 'Tambah Hak Akses', aksi: ['Detail Hak Akses', 'Edit Hak Akses', 'Hapus Hak Akses'] },
  { nama: 'Sub User Shipper', url: '/home/subuserbidowner', kolom: ['No', 'Nama Shipper', 'Nama Sub User', 'Email', 'Status', 'Aksi'], tambah: 'Tambah Sub User', aksi: ['Detail Sub User', 'Edit Sub User', 'Hapus Sub User'] },
  { nama: 'Hak Akses Transporter', url: '/home/hakaksesbidder', kolom: ['No', 'Nama Transporter', 'Nama Hak Akses', 'Total Perizinan', 'Aksi'], tambah: 'Tambah Hak Akses', aksi: ['Detail Hak Akses', 'Edit Hak Akses', 'Hapus Hak Akses'] },
  { nama: 'Sub User Transporter', url: '/home/subuserbidder', kolom: ['No', 'Nama Transporter', 'Nama Sub User', 'Email', 'Status', 'Aksi'], tambah: 'Tambah Sub User', aksi: ['Detail Sub User', 'Edit Sub User', 'Hapus Sub User'] },
  { nama: 'Hak Akses Admin', url: '/adminprahu/hakaksesadmin', kolom: ['No', 'Nama Hak Akses', 'Deskripsi Hak Akses', 'Total Perizinan', 'Aksi'], tambah: 'Tambah Hak Akses', aksi: ['Detail Hak Akses', 'Edit Hak Akses', 'Hapus Hak Akses'] },
  { nama: 'Sub User Admin', url: '/adminprahu/subUserAdmin', kolom: ['No.', 'Nama Sub User', 'Email', 'Bagian Staff', 'Status', 'Aksi'], tambah: 'Tambah Sub User', aksi: ['Detail Sub User', 'Edit Sub User', 'Hapus Sub User'] },
];

const listPage = {
  barisData: (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('td:nth-child(3)') }),
  baris: (page: Page, teks: string) => page.locator('table tbody tr').filter({ hasText: teks }),
  tombolAksi: (baris: ReturnType<Page['locator']>, judul: string) =>
    baris.locator(`[title="${judul}"], [data-original-title="${judul}"]`).first(),
  alertSukses: (page: Page, teks: RegExp) => page.getByRole('alert').filter({ hasText: teks }),
};

function pasangDialog(page: Page): string[] {
  const pesan: string[] = [];
  page.on('dialog', async (d) => {
    pesan.push(d.message());
    await d.accept();
  });
  return pesan;
}

async function bukaList(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await listPage.barisData(page).first().waitFor({ timeout: 20_000 }).catch(() => {});
}

/** Hapus grup hak akses admin bernama `nama` (bila ada) via SweetAlert2, verifikasi lewat reload. */
async function hapusGrupAdmin(page: Page, nama: string): Promise<void> {
  await bukaList(page, '/adminprahu/hakaksesadmin');
  const baris = listPage.baris(page, nama).filter({ has: page.locator('button.btn-delete') }).first();
  if (!(await baris.isVisible().catch(() => false))) return;
  await baris.locator('button.btn-delete').first().click();
  const swal = page.locator('.swal2-container');
  await expect(swal).toContainText('Hapus?');
  await swal.getByRole('button', { name: 'Hapus' }).click();
  await expect(listPage.alertSukses(page, /Anda berhasil menghapus hak akses admin/i)).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await expect(listPage.baris(page, nama)).toHaveCount(0, { timeout: 20_000 });
}

test.describe('Pengaturan Akun (Admin) — struktur halaman', () => {
  for (const s of STRUKTUR) {
    test(`${s.nama}: kolom tabel, tombol ${s.tambah}, aksi baris sesuai kalibrasi`, async ({ page }) => {
      await bukaList(page, s.url);
      for (const kolom of s.kolom) {
        await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom.replace(/[.]/g, '\\$&')}`) }).first()).toBeVisible();
      }
      await expect(page.getByRole('button', { name: s.tambah })).toBeVisible();
      const baris = listPage.barisData(page).first();
      test.skip(!(await baris.isVisible().catch(() => false)), `Tidak ada data ${s.nama} pada demo`);
      for (const judul of s.aksi) await expect(listPage.tombolAksi(baris, judul)).toBeVisible();
    });
  }

  test('Tambah Hak Akses Shipper memuat pilihan shipper, nama/deskripsi, dan daftar checkbox akses', async ({ page }) => {
    await page.goto('/home/tambahhakaksesbidowner');
    await expect(page.locator('#bidowner')).toBeVisible();
    await expect(page.locator('#bidowner option').first()).toHaveText('Pilih Shipper');
    await expect(page.locator('#nama_hak_akses')).toBeVisible();
    await expect(page.locator('#deskripsi_hak_akses')).toBeVisible();
    expect(await page.locator('input[type="checkbox"]').count()).toBeGreaterThan(50);
    await expect(page.getByText('Pilih Semua').first()).toBeVisible();
    await expect(page.locator('#submit_tambah_hak_akses')).toBeVisible();
  });

  test('Tambah Sub User Shipper memuat pilihan shipper, kredensial, data sub user, status, dan hak akses', async ({ page }) => {
    await page.goto('/home/subuser_create/?admin=bidowner');
    await expect(page.locator('#pilihuser option').first()).toHaveText('Pilih Shipper');
    for (const id of ['#email', '#password', '#password_confirm', '#no_wa']) await expect(page.locator(id)).toBeVisible();
    await expect(page.getByPlaceholder('Masukkan Nama Sub user')).toBeVisible();
    await expect(page.getByPlaceholder('Masukkan Bagian Staff')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
    await expect(page.locator('select[name="hakaksesuser[]"]')).toHaveAttribute('multiple', '');
    await expect(page.locator('#submitonce1')).toBeVisible();
  });
});

test.describe('Hak Akses Admin (mutasi)', () => {
  test.slow();

  test('Simpan tanpa memilih akses ditolak dengan alert "Pilih Hak akses minimal 1"', async ({ page }) => {
    const pesan = pasangDialog(page);
    await page.goto('/adminprahu/tambah_hakaksesadmin');
    await page.locator('#nama_hak_akses').fill('AUTOTEST-TANPA-AKSES');
    await page.locator('#submit_tambah_hak_akses').click();
    await expect.poll(() => pesan.length, { timeout: 10_000 }).toBeGreaterThan(0);
    expect(pesan[0]).toMatch(/Pilih Hak akses minimal 1/i);
    await expect(page).toHaveURL(/\/adminprahu\/tambah_hakaksesadmin$/);
  });

  test('centang akses anak ikut mencentang induk, lepas induk melepas anak, Pilih Semua mencentang satu modul', async ({ page }) => {
    await page.goto('/adminprahu/tambah_hakaksesadmin');
    const induk = page.locator('#lihat_daftar_bank');
    const anak = page.locator('#tambah_bank');
    await expect(induk).not.toBeChecked();
    await anak.check({ force: true });
    await expect(induk).toBeChecked();
    await induk.uncheck({ force: true });
    await expect(anak).not.toBeChecked();

    await page.locator('#modul_master_pilih_semua').check({ force: true });
    for (const id of ['#lihat_daftar_provinsi', '#lihat_daftar_bank', '#tambah_bank', '#hapus_pelabuhan']) {
      await expect(page.locator(id)).toBeChecked();
    }
    await expect(page.locator('#modul_admin_pilih_semua')).not.toBeChecked();
  });

  test('tambah grup dengan satu akses → Total Perizinan 1, detail & edit merefleksikan, lalu hapus', async ({ page }) => {
    pasangDialog(page);
    const nama = `AUTOTEST-HAK-${tsPendek()}`;
    let dibuat = false;
    try {
      await page.goto('/adminprahu/tambah_hakaksesadmin');
      await page.locator('#nama_hak_akses').fill(nama);
      await page.locator('#deskripsi_hak_akses').fill('Grup uji otomatis — dihapus di akhir test');
      await page.locator('#lihat_daftar_provinsi').check({ force: true });
      // Rule: Total Perizinan hanya menghitung akses sub modul — "Pilih Semua"
      // (modul_master_pilih_semua ikut tercentang otomatis) tidak dihitung.
      await page.locator('#submit_tambah_hak_akses').click();
      dibuat = true;
      await expect(page).toHaveURL(/\/adminprahu\/hakaksesadmin$/, { timeout: 20_000 });
      await expect(listPage.alertSukses(page, /berhasil/i)).toBeVisible();
      const baris = listPage.baris(page, nama).filter({ has: page.locator('button.btn-delete') }).first();
      await expect(baris).toBeVisible();
      await expect(baris).toContainText(/\b1 Perizinan\b/);

      const idGrup = (await baris.locator('a[href*="detailHakAksesAdmin/"]').first().getAttribute('href'))!.split('/').pop()!;
      await page.goto(`/adminprahu/editHakAksesAdmin/${idGrup}`);
      await expect(page.locator('#nama_hak_akses')).toHaveValue(nama);
      await expect(page.locator('#lihat_daftar_provinsi')).toBeChecked();
      await expect(page.locator('#lihat_daftar_bank')).not.toBeChecked();
      await page.goto(`/adminprahu/detailHakAksesAdmin/${idGrup}`);
      // Nama grup dirender dobel (desktop+mobile) → saring yang visible.
      await expect(page.getByText(nama).filter({ visible: true }).first()).toBeVisible();

      await hapusGrupAdmin(page, nama);
      dibuat = false;
    } finally {
      if (dibuat) await hapusGrupAdmin(page, nama);
    }
  });
});

test.describe('Sub User Admin (mutasi)', () => {
  test.slow();

  async function hapusSubUser(page: Page, email: string): Promise<void> {
    await bukaList(page, '/adminprahu/subUserAdmin');
    const baris = listPage.baris(page, email).first();
    if (!(await baris.isVisible().catch(() => false))) return;
    const link = baris.locator('a[href*="do_hapus_sub_user/"]').first();
    // Confirm native ditangani handler global pasangDialog (jangan daftarkan
    // page.once lagi → "Cannot accept dialog which is already handled").
    await link.click();
    await expect(page).toHaveURL(/subuseradmin/i, { timeout: 20_000 });
    await page.goto('/adminprahu/subUserAdmin');
    await expect(listPage.baris(page, email)).toHaveCount(0, { timeout: 20_000 });
  }

  test('tambah sub user admin baru → tampil di list & detail, lalu dihapus dengan konfirmasi', async ({ page }) => {
    const pesan = pasangDialog(page);
    const ts = tsPendek();
    const email = `autotest-sub-${ts.toLowerCase()}@yopmail.com`;
    const nama = `AUTOTEST Sub ${ts}`;
    let dibuat = false;
    try {
      await page.goto('/adminprahu/tambahsubuseradmin');
      await page.locator('#email').fill(email);
      await page.locator('#kata_sandi').fill('AutoTest123');
      await page.locator('#konfirm_kata_sandi').fill('AutoTest123');
      await page.locator('#nama').fill(nama);
      await page.locator('#bagian_staff').fill('QA Otomasi');
      await page.locator('#no_wa').fill(`0899${String(Date.now()).slice(-8)}`);
      await page.locator('#status').selectOption({ label: 'Aktif' });
      // Pilih satu hak akses yang ada (multi-select select2 → set via option pertama).
      const ukuran = page.locator('#ukuran');
      const nilaiPertama = await ukuran.locator('option').first().getAttribute('value');
      await ukuran.selectOption([nilaiPertama!]);
      await page.evaluate(() => document.getElementById('ukuran')!.dispatchEvent(new Event('change', { bubbles: true })));
      await page.locator('#submit_tambah_sub_user').click();
      dibuat = true;
      await expect(page).toHaveURL(/subuseradmin/i, { timeout: 20_000 });
      expect(pesan.filter((p) => /sudah|terdaftar|gagal/i.test(p)), `Dialog: ${pesan.join(' | ')}`).toEqual([]);
      await bukaList(page, '/adminprahu/subUserAdmin');
      const baris = listPage.baris(page, email).first();
      await expect(baris).toBeVisible({ timeout: 20_000 });
      await expect(baris).toContainText(nama);
      await expect(baris).toContainText('AKTIF');

      const detail = baris.locator('a[href*="detailsubuseradmin/"]').first();
      await detail.click();
      await expect(page).toHaveURL(/detailsubuseradmin\/\d+/);
      await expect(page.getByText(email)).toBeVisible();

      await hapusSubUser(page, email);
      dibuat = false;
    } finally {
      if (dibuat) await hapusSubUser(page, email);
    }
  });

  test('email/nomor WhatsApp yang sudah terdaftar ditolak saat tambah sub user', async ({ page }) => {
    const pesan = pasangDialog(page);
    await bukaList(page, '/adminprahu/subUserAdmin');
    const emailAda = (await listPage.barisData(page).first().locator('td').nth(2).innerText()).trim();
    test.skip(!/@/.test(emailAda), 'Tidak ada sub user admin sebagai pembanding');

    await page.goto('/adminprahu/tambahsubuseradmin');
    await page.locator('#email').fill(emailAda);
    await page.locator('#kata_sandi').fill('AutoTest123');
    await page.locator('#konfirm_kata_sandi').fill('AutoTest123');
    await page.locator('#nama').fill('AUTOTEST Duplikat');
    await page.locator('#bagian_staff').fill('QA');
    await page.locator('#status').selectOption({ label: 'Aktif' });
    const ukuran = page.locator('#ukuran');
    await ukuran.selectOption([(await ukuran.locator('option').first().getAttribute('value'))!]);
    await page.evaluate(() => document.getElementById('ukuran')!.dispatchEvent(new Event('change', { bubbles: true })));
    await page.locator('#submit_tambah_sub_user').click();
    // Penolakan bisa berupa alert native ATAU tetap di form dengan pesan; yang
    // pasti sub user duplikat TIDAK boleh bertambah di list.
    await page.waitForTimeout(3000);
    const ditolakViaAlert = pesan.some((p) => /sudah|terdaftar|digunakan/i.test(p));
    const masihDiForm = /tambahsubuseradmin/i.test(page.url());
    expect(ditolakViaAlert || masihDiForm, `Dialog: ${pesan.join(' | ')} | URL: ${page.url()}`).toBe(true);
    await bukaList(page, '/adminprahu/subUserAdmin');
    await expect(listPage.baris(page, 'AUTOTEST Duplikat')).toHaveCount(0);
  });
});
