import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Validasi Akun (Administrator) — 10 sub menu. Project "admin"
 * (storageState .auth/admin.json). Rule: docs/rules/administrator/11-validasi-akun.md.
 * Scope: struktur list, halaman detail/setting (dibuka, TIDAK disimpan) dan
 * aturan tampilan yang bisa diverifikasi tanpa mengubah akun demo.
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login admin):
 * - Pre Register /adminprahu/preregister: ID | Nama | Nama Perusahaan | Email
 *   | Telp / WA | Jenis Register | Tanggal | Aksi (Detail → /adminprahu/
 *   detailpreregister/<hash>: ID, Nama Perusahaan, Nama, Email, Telepon /
 *   Whatsapp, Tanggal Pre Register, Jenis Register; Hapus Pre Register).
 * - Validasi Shipper /home/bidowner: ID | Nama Perusahaan | Email | Telp/ WA |
 *   Status (MENUNGGU/AKTIF/TIDAK AKTIF) | Aksi (Detail Data → /home/
 *   detailbidowner/<hash> memuat Identitas (KTP / SIM), Logo Perusahaan,
 *   NPWP/SIUP, Tanggal Register, Metode Pembayaran ["Pilih Metode" utk
 *   pendaftar baru]; Lakukan Validasi → /home/validasibidowner/<hash>: form
 *   nama, nama_perusahaan, Propinsi, Kota, alamat, no_telp, email (ENABLED —
 *   rule: admin bisa edit email), NPWP/SIUP upload, Simpan #simpan).
 * - Validasi Transporter /home/bidder: + kolom Alias; /home/validasibidder/
 *   <hash> ada field alias ("Max : 8 Karakter") dan seksi rekening.
 * - Transporter Khusus /adminprahu/listBidderKhusus: ID | Tanggal Setting |
 *   Alias | Transporter | Khusus Shipper | Status Akun | Aksi (Setting
 *   Transporter → /adminprahu/settingBidderKhusus?id=<id> [daftar shipper +
 *   Tambah Shipper], Hapus Transporter); Tambah Transporter → /adminprahu/
 *   tambahbidderkhusus (select transporter → alias otomatis, input alias
 *   disabled).
 * - Profil Transporter /home/profilbidders: No | Nama Perusahaan | Bergabung
 *   Sejak | Detail Rating | Aksi (Detail Profil → /home/detail_profilbidder/
 *   <hash>: Bergabung Sejak, Lokasi, Detail Rating, Tahun Berdiri, Jumlah
 *   Karyawan, tab Informasi/Ulasan, strip "-" bila kosong).
 * - Dokumen Aanwijzing /adminprahu/aanwijzing: ID | Nama Perusahaan | Nama
 *   Dokumen Aanwijzing | Status Dokumen | Aksi (Lihat Detail → /adminprahu/
 *   detailaanwijzing/<id>: default "-" & WAITING; Setting Dokumen →
 *   /adminprahu/settingaanwijzing/<id>: nama_aanwijzing maxlength 100, upload
 *   ".pdf maks 4MB", status Waiting/Aktif/Tidak Aktif, Simpan #submit_kelas).
 * - Peserta Lelang /home/pesertalelang (baris dimuat lambat, "Mohon tunggu
 *   sebentar"): ID | Shipper | Kota | Email | Transporter | Aksi; Setting →
 *   /home/settingpesertalelang/<hash>: checkbox #pilih_semua_bidder + per
 *   transporter (class bidder_cek<id>); transporter yang dikunci utk shipper
 *   lain = checkbox DISABLED & tidak tercentang.
 * - Relasi Satu Pintu /home/relasi_satu_pintu: ID | Tanggal 1 Pintu (dd/mm/
 *   yyyy) | Shipper | Email | Relasi Transporter ("N Transporter") | Metode
 *   Pembayaran | Aksi (Setting Relasi → /adminprahu/SettingRelasi/<hash>:
 *   Tanggal Satu Pintu dd/mm/yyyy hh:mm, Jumlah Relasi, tabel ID | Tanggal
 *   Buat | Relasi Transporter | Nomor VA | Nama Bank | Atas Nama | Status |
 *   Aksi, tombol Tambah Relasi).
 * - Preference Notif /home/adminprefnotif: ID | Register | Nama Perusahaan |
 *   Jenis User | Notif Email ("N dari M") | Push Notif | Tanggal Setting |
 *   Aksi (Detail → /home/preferenceNotifBidder?par=; Setting → /home/
 *   settingPreferenceNotifBidder?par= dengan checkbox
 *   checkbox_preference_notif[] id <notif>_sistem / _email, Simpan
 *   #submit_preference_notif).
 * - Biaya Layanan /adminprahu/biayalayanan ada di menu tapi TIDAK ada di rule
 *   (struktur saja).
 *
 * TIDAK dicakup (mutasi akun demo / lintas peran): validasi terima/tolak &
 * emailnya, edit email + confirm, rekening on/off min 1 maks 3 (butuh Simpan
 * pada akun transporter nyata), verifikasi perubahan data (butuh bidder
 * mengubah akun), upload aanwijzing, tambah relasi/bidder khusus, hidden ulasan.
 */

interface Halaman {
  nama: string;
  url: string;
  kolom: string[];
  aksi?: string[];
  tambah?: string;
}

const LIST: Halaman[] = [
  { nama: 'Pre Register', url: '/adminprahu/preregister', kolom: ['ID', 'Nama', 'Nama Perusahaan', 'Email', 'Telp / WA', 'Jenis Register', 'Tanggal', 'Aksi'], aksi: ['Detail Pre Register', 'Hapus Pre Register'] },
  { nama: 'Validasi Shipper', url: '/home/bidowner', kolom: ['ID', 'Nama Perusahaan', 'Email', 'Telp/ WA', 'Status', 'Aksi'], aksi: ['Detail Data', 'Lakukan Validasi'] },
  { nama: 'Validasi Transporter', url: '/home/bidder', kolom: ['ID', 'Nama Perusahaan', 'Alias', 'Email', 'Telp/ WA', 'Status', 'Aksi'], aksi: ['Detail Data', 'Lakukan Validasi'] },
  { nama: 'Transporter Khusus', url: '/adminprahu/listBidderKhusus', kolom: ['ID', 'Tanggal Setting', 'Alias', 'Transporter', 'Khusus Shipper', 'Status Akun', 'Aksi'], aksi: ['Setting Transporter', 'Hapus Transporter'], tambah: 'Tambah Transporter' },
  { nama: 'Profil Transporter', url: '/home/profilbidders', kolom: ['No', 'Nama Perusahaan', 'Bergabung Sejak', 'Detail Rating', 'Aksi'], aksi: ['Detail Profil'] },
  { nama: 'Dokumen Aanwijzing', url: '/adminprahu/aanwijzing', kolom: ['ID', 'Nama Perusahaan', 'Nama Dokumen Aanwijzing', 'Status Dokumen', 'Aksi'], aksi: ['Lihat Detail', 'Setting Dokumen'] },
  { nama: 'Biaya Layanan', url: '/adminprahu/biayalayanan', kolom: ['ID', 'Tanggal Setting', 'Shipper', 'Jenis Biaya', 'Biaya Layanan', 'Masa Berlaku', 'Aksi'], aksi: ['Setting Biaya Layanan'] },
  { nama: 'Relasi Satu Pintu', url: '/home/relasi_satu_pintu', kolom: ['ID', 'Tanggal 1 Pintu', 'Shipper', 'Email', 'Relasi Transporter', 'Metode Pembayaran', 'Aksi'], aksi: ['Setting Relasi'] },
  { nama: 'Preference Notif', url: '/home/adminprefnotif', kolom: ['ID', 'Register', 'Nama Perusahaan', 'Jenis User', 'Notif Email', 'Push Notif', 'Tanggal Setting', 'Aksi'], aksi: ['Detail Preference Notif', 'Setting Preference Notif'] },
];

const listPage = {
  barisData: (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('td:nth-child(3)') }),
  tombolAksi: (baris: ReturnType<Page['locator']>, judul: string) =>
    baris.locator(`[title="${judul}"], [data-original-title="${judul}"]`).first(),
};

async function bukaList(page: Page, url: string, timeout = 20_000): Promise<number> {
  await page.goto(url);
  await listPage.barisData(page).first().waitFor({ timeout }).catch(() => {});
  return listPage.barisData(page).count();
}

/** href link pertama pada baris data yang cocok pola. */
async function hrefPertama(page: Page, pola: string): Promise<string | null> {
  return page.evaluate((pola) => {
    const a = [...document.querySelectorAll('table tbody tr a[href]')].find((a) => a.getAttribute('href')!.includes(pola));
    return a ? a.getAttribute('href') : null;
  }, pola);
}

test.describe('Validasi Akun (Admin) — struktur daftar', () => {
  for (const h of LIST) {
    test(`${h.nama}: kolom tabel${h.tambah ? ', tombol Tambah' : ''}, filter, aksi baris`, async ({ page }) => {
      const jumlah = await bukaList(page, h.url);
      for (const kolom of h.kolom) {
        await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom.replace(/[./]/g, '\\$&')}`) }).first()).toBeVisible();
      }
      await expect(page.getByRole('button', { name: /Filter/ }).first()).toBeVisible();
      if (h.tambah) await expect(page.getByRole('button', { name: h.tambah })).toBeVisible();
      test.skip(jumlah === 0, `Tidak ada data ${h.nama} pada demo`);
      const baris = listPage.barisData(page).first();
      for (const judul of h.aksi ?? []) await expect(listPage.tombolAksi(baris, judul)).toBeVisible();
    });
  }

  test('Peserta Lelang: kolom tabel, baris dimuat async, aksi Detail & Setting', async ({ page }) => {
    test.slow();
    const jumlah = await bukaList(page, '/home/pesertalelang', 60_000);
    for (const kolom of ['ID', 'Shipper', 'Kota', 'Email', 'Transporter', 'Aksi']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}`) }).first()).toBeVisible();
    }
    test.skip(jumlah === 0, 'Tidak ada data peserta lelang pada demo');
    const baris = listPage.barisData(page).first();
    await expect(listPage.tombolAksi(baris, 'Detail Peserta Lelang')).toBeVisible();
    await expect(listPage.tombolAksi(baris, 'Setting Peserta Lelang')).toBeVisible();
    // Kolom Transporter = jumlah peserta (angka).
    await expect(baris.locator('td').nth(4)).toHaveText(/^\s*\d+\s*$/);
  });
});

test.describe('Validasi Akun (Admin) — halaman detail & setting', () => {
  test('Detail Pre Register menampilkan identitas pendaftar dan tanggal pre register', async ({ page }) => {
    test.skip((await bukaList(page, '/adminprahu/preregister')) === 0, 'Tidak ada data pre register');
    const href = await hrefPertama(page, 'detailpreregister');
    await page.goto(href!);
    for (const label of ['Nama Perusahaan', 'Nama', 'Email', 'Telepon / Whatsapp', 'Tanggal Pre Register', 'Jenis Register']) {
      await expect(page.getByText(new RegExp(`${label}\\s*:`)).first()).toBeVisible();
    }
    await expect(page.getByText(/Tanggal Pre Register\s*:\s*\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)).toBeVisible();
    await expect(page.getByText(/Jenis Register\s*:\s*(Shipper|Transporter)/)).toBeVisible();
  });

  test('Detail Shipper memuat dokumen (identitas, logo, NPWP, SIUP), tanggal register, metode pembayaran, dan tombol Lakukan Validasi', async ({ page }) => {
    test.skip((await bukaList(page, '/home/bidowner')) === 0, 'Tidak ada data shipper');
    const href = await hrefPertama(page, 'detailbidowner');
    await page.goto(href!);
    for (const label of ['Nama Perusahaan', 'Identitas (KTP / SIM)', 'Logo Perusahaan', 'NPWP', 'SIUP', 'Tanggal Register', 'Metode Pembayaran']) {
      // Label dirender dobel (desktop+mobile, salah satu hidden) → saring visible.
      await expect(page.getByText(label, { exact: false }).filter({ visible: true }).first()).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Lakukan Validasi' }).or(page.getByRole('link', { name: 'Lakukan Validasi' })).first()).toBeVisible();
  });

  test('Validasi Akun Shipper: form kelengkapan dengan email dapat diedit dan pilihan metode pembayaran', async ({ page }) => {
    test.skip((await bukaList(page, '/home/bidowner')) === 0, 'Tidak ada data shipper');
    await listPage.tombolAksi(listPage.barisData(page).first(), 'Lakukan Validasi').click();
    await expect(page).toHaveURL(/\/home\/validasibidowner\/.+/);
    for (const name of ['nama', 'nama_perusahaan', 'Propinsi', 'Kota', 'alamat', 'no_telp', 'email']) {
      await expect(page.locator(`[name="${name}"]`).first()).toBeVisible();
    }
    // Rule: admin dapat edit email langsung (field enabled).
    await expect(page.locator('#email')).toBeEditable();
    await expect(page.getByText(/Metode Pembayaran/).first()).toBeVisible();
    await expect(page.locator('#simpan')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Batal' })).toHaveAttribute('href', /\/home\/bidowner\/?$/);
  });

  test('Validasi Akun Transporter: field Alias maksimal 8 karakter dan seksi rekening', async ({ page }) => {
    test.skip((await bukaList(page, '/home/bidder')) === 0, 'Tidak ada data transporter');
    await listPage.tombolAksi(listPage.barisData(page).first(), 'Lakukan Validasi').click();
    await expect(page).toHaveURL(/\/home\/validasibidder\/.+/);
    await expect(page.getByText('Max : 8 Karakter')).toBeVisible();
    const alias = page.locator('input[name="alias"]');
    await expect(alias).toBeVisible();
    await expect(page.locator('#email')).toBeEditable();
    await expect(page.getByText(/Rekening/i).first()).toBeVisible();
  });

  test('Tambah Transporter Khusus: alias terisi otomatis dari transporter terpilih (input alias terkunci)', async ({ page }) => {
    await page.goto('/adminprahu/tambahbidderkhusus');
    const select = page.locator('select[name="nama"]');
    await expect(select.locator('option').first()).toHaveText('Pilih Transporter Khusus');
    await expect(page.locator('#alias0')).toBeDisabled();
    await select.selectOption({ index: 1 });
    await expect.poll(() => page.locator('#alias0').inputValue(), { timeout: 10_000 }).not.toBe('');
    await expect(page.locator('#tombolSimpanProvinsi')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Batal' })).toHaveAttribute('href', /listbidderkhusus/i);
  });

  test('Setting Transporter Khusus menampilkan info transporter, daftar shipper, dan tombol Tambah Shipper', async ({ page }) => {
    test.skip((await bukaList(page, '/adminprahu/listBidderKhusus')) === 0, 'Tidak ada transporter khusus');
    const href = await hrefPertama(page, 'settingBidderKhusus');
    await page.goto(href!);
    for (const label of ['Alias', 'Transporter', 'Tanggal Setting', 'Status Akun']) {
      await expect(page.getByText(new RegExp(`${label}\\s*:`)).first()).toBeVisible();
    }
    for (const kolom of ['ID', 'Tanggal Buat', 'Shipper', 'Status Akun', 'Aksi']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}`) }).first()).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Tambah Shipper' })).toHaveAttribute('href', /tambahbidownertobidderkhusus\?BidderID=\d+/);
  });

  test('Detail Profil Transporter menampilkan bergabung sejak, lokasi, rating, tab Informasi/Ulasan dan strip untuk data kosong', async ({ page }) => {
    test.skip((await bukaList(page, '/home/profilbidders')) === 0, 'Tidak ada profil transporter');
    const href = await hrefPertama(page, 'detail_profilbidder');
    await page.goto(href!);
    await expect(page.getByText(/Bergabung Sejak\s+\d{2}\/\d{2}\/\d{4}/).first()).toBeVisible();
    await expect(page.getByText(/Lokasi\s*:/).first()).toBeVisible();
    await expect(page.getByText(/Detail Rating\s*:/).first()).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Informasi' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Ulasan' })).toBeVisible();
    // Rule: data belum disetting → strip.
    await expect(page.getByText(/Tahun Berdiri\s*:\s*(-|\d{4})/).first()).toBeVisible();
  });

  test('Dokumen Aanwijzing: detail default strip/WAITING dan setting memuat nama (maks 100), upload PDF 4MB, status', async ({ page }) => {
    test.slow(); // halaman aanwijzing lambat dimuat (goto >60 dtk pada run 2026-08-29)
    test.skip((await bukaList(page, '/adminprahu/aanwijzing')) === 0, 'Tidak ada data aanwijzing');
    const detail = await hrefPertama(page, 'detailaanwijzing');
    const setting = await hrefPertama(page, 'settingaanwijzing');
    await page.goto(detail!);
    for (const label of ['Shipper', 'Status Shipper', 'Tanggal Register', 'Nama Dokumen Aanwijzing', 'Dokumen Aanwijzing', 'Status Dokumen', 'Tanggal Setting Terakhir']) {
      await expect(page.getByText(new RegExp(`${label}\\s*:`)).first()).toBeVisible();
    }
    await expect(page.getByText(/Status Dokumen\s*:\s*(WAITING|AKTIF|TIDAK AKTIF)/)).toBeVisible();

    await page.goto(setting!);
    await expect(page.getByText('*) Shipper hanya bisa upload 1 dokumen aanwijzing')).toBeVisible();
    await expect(page.locator('input[name="nama_aanwijzing"]')).toHaveAttribute('maxlength', '100');
    await expect(page.getByText('Upload File Maksimal 4MB dengan Format .pdf')).toBeVisible();
    const status = page.locator('select[name="status_aanwijzing"]');
    await expect(status.locator('option')).toHaveText(['Waiting', 'Aktif', 'Tidak Aktif']);
    await expect(page.locator('#submit_kelas')).toBeVisible();
  });

  test('Setting Peserta Lelang: checkbox Pilih Semua dan per transporter; transporter terkunci shipper lain tidak bisa dicentang', async ({ page }) => {
    test.slow();
    test.skip((await bukaList(page, '/home/pesertalelang', 60_000)) === 0, 'Tidak ada data peserta lelang');
    const href = await hrefPertama(page, 'settingpesertalelang');
    await page.goto(href!);
    await expect(page.getByText('*) Transporter yang dipilih akan menjadi peserta lelang shipper tersebut')).toBeVisible();
    for (const kolom of ['Semua', 'Alias', 'Transporter', 'Lokasi', 'Rating', 'ID Transporter']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}`) }).first()).toBeVisible();
    }
    await expect(page.locator('#pilih_semua_bidder')).toBeVisible();
    const perBidder = page.locator('input[id="pilih_bidder"]');
    expect(await perBidder.count()).toBeGreaterThan(0);
    const terkunci = perBidder.locator(':scope:disabled');
    for (let i = 0; i < (await terkunci.count()); i++) await expect(terkunci.nth(i)).not.toBeChecked();
    await expect(page.locator('#simpan')).toBeVisible();
  });

  test('Setting Relasi Satu Pintu: info shipper, tanggal satu pintu ber-jam, jumlah relasi, tabel relasi transporter, tombol Tambah Relasi', async ({ page }) => {
    test.skip((await bukaList(page, '/home/relasi_satu_pintu')) === 0, 'Tidak ada data relasi satu pintu');
    // Rule: tanggal di list dd/mm/yyyy, di detail dd/mm/yyyy hh:mm.
    await expect(listPage.barisData(page).first().locator('td').nth(1)).toHaveText(/^\s*\d{2}\/\d{2}\/\d{4}\s*$/);
    await expect(listPage.barisData(page).first().locator('td').nth(4)).toHaveText(/\d+ Transporter/);
    const href = await hrefPertama(page, 'SettingRelasi');
    await page.goto(href!);
    await expect(page.getByText(/Tanggal Satu Pintu\s*:\s*\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)).toBeVisible();
    await expect(page.getByText(/Jumlah Relasi Transporter\s*:\s*\d+ Transporter/)).toBeVisible();
    await expect(page.getByText(/Metode Pembayaran\s*:\s*(SATU PINTU|DIRECT)/i)).toBeVisible();
    for (const kolom of ['ID', 'Tanggal Buat', 'Relasi Transporter', 'Nomor VA', 'Nama Bank', 'Atas Nama', 'Status', 'Aksi']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}`) }).first()).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Tambah Relasi' })).toBeVisible();
  });

  const cekPreference = async (page: Page, jenis: 'Transporter' | 'Shipper', sistem: number, email: number) => {
    await bukaList(page, '/home/adminprefnotif');
      const baris = listPage.barisData(page).filter({ hasText: jenis }).first();
      test.skip(!(await baris.isVisible().catch(() => false)), `Tidak ada akun ${jenis} di daftar preference`);
      // Shipper memakai ...NotifBidowner, transporter ...NotifBidder → pola generik.
      const href = await baris.locator('a[href*="settingPreferenceNotif"]').first().getAttribute('href');
      await page.goto(href!);
      await expect(page.getByText('*) Preference notif digunakan hanya untuk akun utama').first()).toBeVisible();
      await expect(page.locator('input[id$="_sistem"]')).toHaveCount(sistem);
      await expect(page.locator('input[id$="_email"]')).toHaveCount(email);
      await expect(page.locator('#submit_preference_notif')).toBeVisible();
  };

  test('Preference Notif transporter: 8 push notif & 8 notif email sesuai rule', async ({ page }) => {
    test.slow();
    await cekPreference(page, 'Transporter', 8, 8);
  });

  test('Preference Notif shipper: 17 push notif & 13 notif email sesuai rule (DISKREPANSI: UI 16 & 12)', async ({ page }) => {
    test.slow();
    // Rule 11-validasi-akun § Preference Notifikasi: bid owner 17 sistem / 13
    // email; UI (setting preference admin maupun sisi shipper —
    // tests/shipper/preference-notif.spec.ts) memuat 16 / 12.
    test.fail(true, 'DISKREPANSI 2026-08-29: rule 17 push & 13 email untuk shipper, UI 16 & 12');
    await cekPreference(page, 'Shipper', 17, 13);
  });
});
