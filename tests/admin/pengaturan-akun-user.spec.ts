import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Pengaturan Akun (Administrator) — Hak Akses & Sub User untuk
 * SHIPPER dan TRANSPORTER (mutasi dengan cleanup). Project "admin".
 * Rule: docs/rules/administrator/14-pengaturan-akun.md. Izin mutasi demo
 * dari user (2026-08-29). Varian admin ada di tests/admin/pengaturan-akun.spec.ts.
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login admin):
 * - Tambah Hak Akses Shipper /home/tambahhakaksesbidowner: select #bidowner
 *   (name=user_id, 68 opsi, "Pilih Shipper"; PT. Cipta Karya … = akun demo
 *   shipper), #nama_hak_akses, #deskripsi_hak_akses, 119 checkbox (id =
 *   <akses>, "Pilih Semua" id=modul_<x>_pilih_semua), Simpan
 *   #submit_tambah_hak_akses. Transporter /home/tambahhakaksesbidder: select
 *   #bidder (PT. Muda Jaya … = akun demo transporter), 80 checkbox.
 *   DISKREPANSI rule: form shipper memuat "Modul Administrator", "Modul
 *   Master", "Modul Analitik", "Modul Preference Sub User" (rule bid owner
 *   hanya Pengajuan Lelang, Cari Penawaran, Nego, Daftar Order, Cek Jadwal,
 *   Laporan, Dashboard, Pengaturan Akun, Notifikasi email/sistem); form
 *   transporter memuat "Modul Administrator" & "Preference Sub User".
 * - List: Detail (a[href*=detailHakAksesbidowner/<id>] / home/
 *   detailhakaksesbidder/<id> — href RELATIF tanpa "/"), Edit, Hapus: shipper
 *   button.btn-delete value=<id> (#tombolHapusProvinsi, copy-paste),
 *   transporter button.hapus_hak_akses data-id_hak_akses=<id> data-hal=bidder.
 * - Sub User: Tambah /home/subuser_create/?admin=bidowner|bidder — select
 *   #pilihuser, lalu select multiple name="hakaksesuser[]" TERISI via ajax
 *   setelah user dipilih (select2, kosong sebelumnya), #email, #password,
 *   #password_confirm, placeholder "Masukkan Nama Sub user"/"Masukkan Bagian
 *   Staff", #no_wa, select name=status, Simpan #submitonce1. List: Detail
 *   /home/subuser_detail/<id>?classname=shipper_data|operator_data, Hapus =
 *   link /home/subuser_dodelete/<id>?classname=… dengan native confirm
 *   "Apakah anda yakin untuk menghapus …".
 *
 * TIDAK dicakup: efek akses ke menu sub user (butuh login sub user), notif,
 * edit sub user (form sama dgn tambah).
 */

const tsPendek = () => Date.now().toString(36).toUpperCase().slice(-6);

interface Peran {
  nama: string;
  hakList: string;
  hakTambah: string;
  selectHak: string;
  subList: string;
  subTambah: string;
  classname: string;
  pilih: RegExp;
}

const PERAN: Peran[] = [
  { nama: 'Shipper', hakList: '/home/hakaksesbidowner', hakTambah: '/home/tambahhakaksesbidowner', selectHak: '#bidowner', subList: '/home/subuserbidowner', subTambah: '/home/subuser_create/?admin=bidowner', classname: 'shipper_data', pilih: /Cipta Karya/ },
  { nama: 'Transporter', hakList: '/home/hakaksesbidder', hakTambah: '/home/tambahhakaksesbidder', selectHak: '#bidder', subList: '/home/subuserbidder', subTambah: '/home/subuser_create/?admin=bidder', classname: 'operator_data', pilih: /Muda Jaya/ },
];

const listPage = {
  barisData: (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('td:nth-child(3)') }),
  baris: (page: Page, teks: string) => page.locator('table tbody tr').filter({ hasText: teks }),
  tombolAksi: (baris: Locator, judul: string) =>
    baris.locator(`[title="${judul}"], [data-original-title="${judul}"]`).first(),
  alertSukses: (page: Page, teks: RegExp) => page.getByRole('alert').filter({ hasText: teks }),
  swal: (page: Page) => page.locator('.swal2-container'),
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

async function nilaiOpsi(select: Locator, pola: RegExp): Promise<string> {
  const opsi = select.locator('option').filter({ hasText: pola }).first();
  await expect(opsi).toBeAttached();
  return (await opsi.getAttribute('value'))!;
}

function urlAbsolut(href: string): string {
  return /^https?:/.test(href) ? href : `/${href.replace(/^\/+/, '')}`;
}

/** Hapus grup hak akses bernama `nama` bila ada (SweetAlert2 / confirm native), verifikasi via reload. */
async function hapusGrup(page: Page, p: Peran, nama: string): Promise<void> {
  await bukaList(page, p.hakList);
  const baris = listPage.baris(page, nama).first();
  if (!(await baris.isVisible().catch(() => false))) return;
  await listPage.tombolAksi(baris, 'Hapus Hak Akses').click();
  // SweetAlert2 muncul beberapa ratus ms setelah klik — isVisible() seketika
  // bisa false → konfirmasi tak pernah diklik & grup tidak terhapus (run
  // gabungan 2026-08-30, 2x). Tunggu dulu sampai 8 dtk.
  const swal = listPage.swal(page);
  await swal.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
  if (await swal.isVisible().catch(() => false)) await swal.getByRole('button', { name: /^(Hapus|Ya|OK)$/ }).first().click();
  // Konfirmasi memicu navigasi server → goto saat itu ERR_ABORTED; tunggu
  // load selesai dulu. Penghapusan juga bisa TERTUNDA beberapa detik (run
  // gabungan 2026-08-30) → poll reload sampai 90 dtk, goto dibungkus catch.
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForTimeout(2500);
  await expect
    .poll(
      async () => {
        await bukaList(page, p.hakList).catch(() => {});
        return listPage.baris(page, nama).count();
      },
      { timeout: 90_000, intervals: [3000, 5000, 8000] },
    )
    .toBe(0);
}

/** Hapus sub user ber-email `email` bila ada (link do_delete + confirm native). */
async function hapusSubUser(page: Page, p: Peran, email: string): Promise<void> {
  await bukaList(page, p.subList);
  const baris = listPage.baris(page, email).first();
  if (!(await baris.isVisible().catch(() => false))) return;
  await baris.locator('a[href*="subuser_dodelete/"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  await bukaList(page, p.subList);
  await expect(listPage.baris(page, email)).toHaveCount(0, { timeout: 20_000 });
}

for (const p of PERAN) {
  test.describe(`Hak Akses ${p.nama} (Admin, mutasi)`, () => {
    test.slow();

    test(`Simpan tanpa akses ditolak dengan alert "Pilih Hak akses minimal 1"`, async ({ page }) => {
      const pesan = pasangDialog(page);
      await page.goto(p.hakTambah);
      await page.locator(p.selectHak).selectOption(await nilaiOpsi(page.locator(p.selectHak), p.pilih));
      await page.locator('#nama_hak_akses').fill('AUTOTEST-TANPA-AKSES');
      await page.locator('#submit_tambah_hak_akses').click();
      await expect.poll(() => pesan.length, { timeout: 10_000 }).toBeGreaterThan(0);
      expect(pesan[0]).toMatch(/Pilih Hak akses minimal 1/i);
      await expect(page).toHaveURL(new RegExp(p.hakTambah.replace(/[/?=]/g, '\\$&')));
    });

    test(`tambah grup satu akses untuk ${p.nama} demo → tampil di list & detail, lalu dihapus`, async ({ page }) => {
      test.setTimeout(240_000);
      pasangDialog(page);
      const nama = `AUTOTEST-HAK-${p.nama.slice(0, 1)}-${tsPendek()}`;
      let dibuat = false;
      try {
        await page.goto(p.hakTambah);
        await page.locator(p.selectHak).selectOption(await nilaiOpsi(page.locator(p.selectHak), p.pilih));
        await page.locator('#nama_hak_akses').fill(nama);
        await page.locator('#deskripsi_hak_akses').fill('Grup uji otomatis — dihapus di akhir test');
        // Akses level 1 (tanpa induk) agar Total Perizinan = 1.
        const akses = page.locator('#lihat_daftar_pengajuan_lelang');
        const target = (await akses.count()) ? akses : page.locator('input[name="checkbox_hak_akses[]"]:not(#semua_akses)').first();
        await target.check({ force: true });
        await page.locator('#submit_tambah_hak_akses').click();
        dibuat = true;
        await expect(page).toHaveURL(new RegExp(`${p.hakList}$`), { timeout: 30_000 });
        // Alert sukses tidak selalu dirender (Shipper: tanpa alert pada run
        // 2026-08-30) → bukti utama = baris tampil di list.
        const baris = listPage.baris(page, nama).first();
        await expect(baris).toBeVisible();
        await expect(baris).toContainText(/\d+ Perizinan/);
        if (await akses.count()) await expect(baris).toContainText(/\b1 Perizinan\b/);

        const detail = await baris.locator('a[href*="etailHakAkses" i], a[href*="etailhakakses" i]').first().getAttribute('href');
        expect(detail, 'link Detail Hak Akses').toBeTruthy();
        await page.goto(urlAbsolut(detail!));
        await expect(page.getByText(nama).filter({ visible: true }).first()).toBeVisible();

        await hapusGrup(page, p, nama);
        dibuat = false;
      } finally {
        if (dibuat) await hapusGrup(page, p, nama);
      }
    });
  });

  test.describe(`Sub User ${p.nama} (Admin, mutasi)`, () => {
    test.slow();

    async function isiFormSubUser(page: Page, email: string, nama: string, wa: string): Promise<void> {
      await page.goto(p.subTambah);
      await page.locator('#pilihuser').selectOption(await nilaiOpsi(page.locator('#pilihuser'), p.pilih));
      // Daftar hak akses user dimuat ajax setelah user dipilih.
      const hak = page.locator('select[name="hakaksesuser[]"]');
      await expect(hak.locator('option')).not.toHaveCount(0, { timeout: 15_000 });
      await hak.selectOption([(await hak.locator('option').first().getAttribute('value'))!]);
      await hak.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
      await page.locator('#email').fill(email);
      await page.locator('#password').fill('AutoTest123');
      await page.locator('#password_confirm').fill('AutoTest123');
      await page.getByPlaceholder('Masukkan Nama Sub user').fill(nama);
      await page.getByPlaceholder('Masukkan Bagian Staff').fill('QA Otomasi');
      await page.locator('#no_wa').fill(wa);
      await page.locator('select[name="status"]').selectOption({ label: 'Aktif' });
    }

    test(`tambah sub user ${p.nama} demo → tampil di list & detail, lalu dihapus dengan konfirmasi`, async ({ page }) => {
      test.setTimeout(240_000);
      const pesan = pasangDialog(page);
      const ts = tsPendek();
      const email = `autotest-sub-${p.nama.slice(0, 1).toLowerCase()}-${ts.toLowerCase()}@yopmail.com`;
      const nama = `AUTOTEST Sub ${p.nama} ${ts}`;
      let dibuat = false;
      try {
        await isiFormSubUser(page, email, nama, `0898${String(Date.now()).slice(-8)}`);
        await page.locator('#submitonce1').click();
        dibuat = true;
        await expect(page).toHaveURL(new RegExp(p.subList.replace('/home/', '/home/')), { timeout: 30_000 });
        expect(pesan.filter((m) => /sudah|terdaftar|gagal/i.test(m)), `Dialog: ${pesan.join(' | ')}`).toEqual([]);
        await bukaList(page, p.subList);
        const baris = listPage.baris(page, email).first();
        await expect(baris).toBeVisible({ timeout: 20_000 });
        await expect(baris).toContainText(nama);
        await expect(baris).toContainText('AKTIF');

        const detail = await baris.locator('a[href*="subuser_detail/"]').first().getAttribute('href');
        await page.goto(urlAbsolut(detail!));
        await expect(page.getByText(email).filter({ visible: true }).first()).toBeVisible();

        await hapusSubUser(page, p, email);
        dibuat = false;
      } finally {
        if (dibuat) await hapusSubUser(page, p, email);
      }
    });

    test(`email sub user ${p.nama} yang sudah terdaftar ditolak`, async ({ page }) => {
      const pesan = pasangDialog(page);
      await bukaList(page, p.subList);
      const emailAda = (await listPage.barisData(page).first().locator('td').nth(3).innerText()).trim();
      test.skip(!/@/.test(emailAda), `Tidak ada sub user ${p.nama} sebagai pembanding`);
      await isiFormSubUser(page, emailAda, 'AUTOTEST Duplikat', `0898${String(Date.now()).slice(-8)}`);
      await page.locator('#submitonce1').click();
      await page.waitForTimeout(3000);
      const ditolakViaAlert = pesan.some((m) => /sudah|terdaftar|digunakan/i.test(m));
      const masihDiForm = /subuser_create/i.test(page.url());
      expect(ditolakViaAlert || masihDiForm, `Dialog: ${pesan.join(' | ')} | URL: ${page.url()}`).toBe(true);
      await bukaList(page, p.subList);
      await expect(listPage.baris(page, 'AUTOTEST Duplikat')).toHaveCount(0);
    });
  });
}

test.describe('Hak Akses Shipper/Transporter — modul sesuai rule', () => {
  for (const kasus of [
    { p: PERAN[0], asing: ['Modul Administrator', 'Modul Master', 'Modul Analitik'] },
    { p: PERAN[1], asing: ['Modul Administrator'] },
  ]) {
    test(`form Tambah Hak Akses ${kasus.p.nama} hanya memuat modul peran tersebut (DISKREPANSI: ada ${kasus.asing.join(', ')})`, async ({ page }) => {
      test.fail(true, `DISKREPANSI 2026-08-30: form hak akses ${kasus.p.nama} menampilkan ${kasus.asing.join(', ')} yang tidak ada di rule`);
      await page.goto(kasus.p.hakTambah);
      const modul = await page.locator('input[name="checkbox_hak_akses_modul[]"]').evaluateAll((els) =>
        els.map((c) => (c.closest('label') ?? c.parentElement)!.textContent!.trim().replace(/\s+/g, ' ')));
      expect(modul.length).toBeGreaterThan(0);
      for (const nama of kasus.asing) expect(modul.join(' | ')).not.toContain(nama);
    });
  }
});
