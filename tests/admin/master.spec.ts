import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Master (Administrator) — project "admin" (storageState .auth/admin.json).
 * Rule: docs/rules/administrator/13-master.md. Izin mutasi demo dari user
 * (2026-08-29): test CRUD membuat data berprefix AUTOTEST-<ts> dan
 * menghapusnya di finally.
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login admin):
 * - Menu MASTER (14 halaman /adminprahu/... & /analitik/...): Provinsi &
 *   Kota read-only tanpa Aksi (Kota: tabel kosong sebelum filter); Jenis
 *   Muatan, Harga Barang, Free Time TIDAK ada di rule (hanya diuji struktur).
 * - Pola CRUD master sederhana: tombol "Tambah <X>" → halaman
 *   /adminprahu/tambah<x> (bukan modal); field input name=nama (DP/Include/
 *   Pelabuhan: name=un [+nama]) + select name=status (Aktif/Tidak Aktif,
 *   value aktif|tidak_aktif); Simpan #tombol_simpan_bank (id copy-paste di
 *   semua master; Pelayaran #simpan, Petugas #tombol_simpan_petugas). Validasi
 *   required = POPOVER Bootstrap berteks atribut `pesan` ("Masukkan Nama
 *   Bank", "Pilih Status"). Sukses → redirect list + alert DOM role=alert
 *   "Anda berhasil menambah/mengedit/menghapus <x>".
 * - Edit = MODAL (button title "Edit <X>", onclick edit_data(...)): Bank &
 *   Jenis Kontainer #modal_edit_bank (#nama_bank_edit, #status_edit, Simpan
 *   #tombol_edit_simpan_bank); Kemasan & Pelabuhan #modalEditProvinsi
 *   (#nama_provinsi_edit [+#un_edit, #kota_edit], Simpan #tombolEditProvinsi)
 *   — id warisan copy-paste. Hapus = button title "Hapus <X>" → SweetAlert2
 *   "Hapus?" [Hapus/Batal].
 * - Duplikat nama → native alert (Bank terverifikasi: "Nama Bank Sudah
 *   Digunakan"), tetap di halaman tambah.
 * - Data TERPAKAI (fixture demo "AUTOTEST-FIXTURE-*-01", tampaknya sengaja
 *   disiapkan; Bank memakai "CIMB Niaga"): klik Edit → native CONFIRM
 *   "Data sudah digunakan pada registrasi, yakin untuk mengedit?" (Bank),
 *   "... pada pengajuan lelang dan harga ..." (Include), "... pada lelang.
 *   Yakin untuk edit ?" (DP), "... pada master harga ..." (Pelayaran);
 *   Kemasan terpakai: modal langsung terbuka dgn nama READONLY. Klik Hapus
 *   data terpakai → SweetAlert2 "Data sudah digunakan pada registrasi/
 *   lelang/master harga/pengajuan lelang dan harga" [OK] (tanpa "Hapus?");
 *   KECUALI Kemasan: swal "Hapus?" dulu, lalu native alert "Data sudah
 *   digunakan pada master jenis muatan" (rule menulis "orderan" — fixture
 *   terpakai di Master Jenis Muatan, teks mengikuti pemakaian nyata).
 * - Fixture Jenis Kontainer & Pelabuhan TIDAK terpakai (modal edit terbuka
 *   tanpa confirm, semua field enabled) → tidak dipakai utk uji gating.
 *
 * TIDAK dicakup: Pelayaran tambah (butuh upload logo), Iklan Berbayar &
 * Petugas APK mutasi (butuh bidder/WA unik — dibahas terpisah), export
 * Excel pelabuhan (isi file), sumber data Provinsi/Kota (PH Bid Darat).
 */

interface MasterSederhana {
  nama: string;
  list: string;
  tambah: string;
  judulEdit: string;
  judulHapus: string;
  /** Field form tambah: name → nilai (fungsi dari nama unik). */
  isi: (nama: string) => Record<string, string>;
  /** Kolom nama pada tabel list (index td). */
  kolomNama: number;
  duplikat?: { nama: string; alert: RegExp };
}

const tsPendek = () => Date.now().toString(36).toUpperCase().slice(-6);

const MASTER: MasterSederhana[] = [
  {
    nama: 'Bank',
    list: '/adminprahu/masterbank',
    tambah: '/adminprahu/tambahbank',
    judulEdit: 'Edit Bank',
    judulHapus: 'Hapus Bank',
    isi: (n) => ({ nama: n }),
    kolomNama: 1,
    duplikat: { nama: 'CIMB Niaga', alert: /Nama Bank Sudah Digunakan/i },
  },
  {
    nama: 'Kemasan',
    list: '/adminprahu/masterkemasan',
    tambah: '/adminprahu/tambahkemasan',
    judulEdit: 'Edit Kemasan',
    judulHapus: 'Hapus Kemasan',
    isi: (n) => ({ nama: n }),
    kolomNama: 1,
    duplikat: { nama: 'AUTOTEST-FIXTURE-KEMASAN-01', alert: /Nama Kemasan Sudah Digunakan/i },
  },
  {
    nama: 'Jenis Kontainer',
    list: '/adminprahu/kontainer',
    tambah: '/adminprahu/tambahKontainer',
    judulEdit: 'Edit Jenis Kontainer',
    judulHapus: 'Hapus Jenis Kontainer',
    isi: (n) => ({ nama: n }),
    kolomNama: 1,
    duplikat: { nama: 'AUTOTEST-FIXTURE-KONTAINER-01', alert: /Jenis Kontainer Sudah Digunakan/i },
  },
  {
    nama: 'Dokumen Penagihan',
    list: '/adminprahu/masterDP',
    tambah: '/adminprahu/tambahDP',
    judulEdit: 'Edit Dokumen Penagihan',
    judulHapus: 'Hapus Dokumen Penagihan',
    isi: (n) => ({ un: n }),
    kolomNama: 1,
    duplikat: { nama: 'AUTOTEST-FIXTURE-DP-01', alert: /Nama Dokumen Penagihan Sudah digunakan/i },
  },
  {
    nama: 'Include',
    list: '/adminprahu/masterInclude',
    tambah: '/adminprahu/tambahinclude',
    judulEdit: 'Edit Include',
    judulHapus: 'Hapus Include',
    isi: (n) => ({ un: n, kota: 'Asal' }),
    kolomNama: 1,
    duplikat: { nama: 'AUTOTEST-FIXTURE-INCLUDE-01', alert: /Nama Include Sudah Digunakan/i },
  },
  {
    nama: 'Pelabuhan',
    list: '/adminprahu/masterpelabuhan',
    tambah: '/adminprahu/tambahpelabuhan',
    judulEdit: 'Edit Pelabuhan',
    judulHapus: 'Hapus Pelabuhan',
    isi: (n) => ({ un: `AT${n.slice(-3)}`, nama: n, kota: 'Kota Surabaya' }),
    kolomNama: 2,
    duplikat: { nama: 'AUTOTEST-FIXTURE-PELABUHAN-01', alert: /UN Code atau Nama Pelabuhan Sudah Digunakan/i },
  },
];

/** Struktur seluruh halaman master (kalibrasi 2026-08-29). */
const STRUKTUR: Array<{ nama: string; url: string; kolom: string[]; tambah?: string; aksi?: string[] }> = [
  { nama: 'Provinsi', url: '/adminprahu/masterpropinsi', kolom: ['No', 'Nama Provinsi', 'Status'] },
  { nama: 'Kota', url: '/adminprahu/masterkota', kolom: ['No', 'Nama Kota / Kab.', 'Nama Provinsi', 'Status'] },
  { nama: 'Pelabuhan', url: '/adminprahu/masterpelabuhan', kolom: ['No', 'UN Code', 'Nama Pelabuhan', 'Nama Kota / Kab.', 'Status', 'Aksi'], tambah: 'Tambah Pelabuhan', aksi: ['Edit Pelabuhan', 'Hapus Pelabuhan'] },
  { nama: 'Bank', url: '/adminprahu/masterbank', kolom: ['No', 'Nama Bank', 'Status', 'Aksi'], tambah: 'Tambah Bank', aksi: ['Edit Bank', 'Hapus Bank'] },
  { nama: 'Include', url: '/adminprahu/masterInclude', kolom: ['No', 'Nama Include', 'Tipe Include', 'Status', 'Aksi'], tambah: 'Tambah Include', aksi: ['Edit Include', 'Hapus Include'] },
  { nama: 'Kemasan', url: '/adminprahu/masterkemasan', kolom: ['No', 'Nama Kemasan', 'Status', 'Aksi'], tambah: 'Tambah Kemasan', aksi: ['Edit Kemasan', 'Hapus Kemasan'] },
  { nama: 'Jenis Muatan', url: '/analitik/masterjenismuatan', kolom: ['ID', 'Shipper', 'Email', 'Jml jenis Muatan', 'Aksi'], aksi: ['Lihat Daftar Jenis Muatan'] },
  { nama: 'Harga Barang', url: '/analitik/masterhargabarang', kolom: ['ID', 'Shipper', 'Email', 'Harga Terinput', 'Aksi'], aksi: ['Lihat Daftar Harga Barang'] },
  { nama: 'Free Time', url: '/adminprahu/masterfreetime', kolom: ['No', 'Pelabuhan Tujuan (POD)', 'Storage (Hari)', 'Status', 'Aksi'], tambah: 'Tambah Free Time', aksi: ['Edit Free Time', 'Hapus Free Time'] },
  { nama: 'Pelayaran', url: '/adminprahu/pelayaran', kolom: ['No', 'Nama Pelayaran', 'Logo Pelayaran', 'Status', 'Aksi'], tambah: 'Tambah Pelayaran', aksi: ['Edit Pelayaran', 'Hapus Pelayaran'] },
  { nama: 'Jenis Kontainer', url: '/adminprahu/kontainer', kolom: ['No', 'Jenis Kontainer', 'Status', 'Aksi'], tambah: 'Tambah Jenis Kontainer', aksi: ['Edit Jenis Kontainer', 'Hapus Jenis Kontainer'] },
  { nama: 'Dokumen Penagihan', url: '/adminprahu/masterDP', kolom: ['No', 'Nama Dokumen Penagihan', 'Status', 'Aksi'], tambah: 'Tambah Dokumen Penagihan', aksi: ['Edit Dokumen Penagihan', 'Hapus Dokumen Penagihan'] },
  { nama: 'Iklan Berbayar', url: '/adminprahu/masteriklan', kolom: ['No', 'Nama Transporter', 'Tanggal Mulai', 'Tanggal Berakhir', 'Aksi'], tambah: 'Tambah Iklan Berbayar', aksi: ['Edit Iklan Berbayar', 'Hapus Iklan Berbayar'] },
  { nama: 'Petugas APK', url: '/adminprahu/masterpetugasapk', kolom: ['No', 'Nama Transporter', 'Nama Petugas', 'No. Whatsapp', 'Kota', 'Status', 'Aksi'], tambah: 'Tambah Petugas', aksi: ['Detail Petugas APK', 'Edit Petugas APK', 'Hapus Petugas APK'] },
];

const listPage = {
  barisData: (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('td:nth-child(2)') }),
  baris: (page: Page, teks: string) => page.locator('table tbody tr').filter({ hasText: teks }),
  tombolAksi: (baris: Locator, judul: string) =>
    baris.locator(`[title="${judul}"], [data-original-title="${judul}"]`).first(),
  alertSukses: (page: Page, teks: RegExp) => page.getByRole('alert').filter({ hasText: teks }),
  swal: (page: Page) => page.locator('.swal2-container'),
  modalTerbuka: (page: Page) => page.locator('.modal').filter({ visible: true }).first(),
};

/** Tampung pesan dialog native; confirm diterima bila `terimaConfirm`. */
function pasangDialog(page: Page, terimaConfirm = false): string[] {
  const pesan: string[] = [];
  page.on('dialog', async (dialog) => {
    pesan.push(dialog.message());
    if (dialog.type() === 'confirm' && !terimaConfirm) await dialog.dismiss();
    else await dialog.accept();
  });
  return pesan;
}

async function bukaList(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await listPage.barisData(page).first().waitFor({ timeout: 20_000 }).catch(() => {});
}

async function isiFormTambah(page: Page, m: MasterSederhana, nama: string): Promise<void> {
  await page.goto(m.tambah);
  for (const [field, nilai] of Object.entries(m.isi(nama))) {
    const el = page.locator(`[name="${field}"]`).first();
    if ((await el.evaluate((e) => e.tagName)) === 'SELECT') await el.selectOption({ label: nilai });
    else await el.fill(nilai);
  }
  await page.locator('select[name="status"]').selectOption({ label: 'Aktif' });
}

async function klikSimpanTambah(page: Page): Promise<void> {
  await page.locator('#tombol_simpan_bank, #simpan').first().click();
}

/** Input modal edit yang nilainya = nama (id input beda-beda per master; value
 *  diisi JS sehingga selector [value=...] tak bisa dipakai). */
async function inputBernilai(modal: Locator, nilai: string): Promise<Locator> {
  const inputs = modal.locator('input:visible');
  await expect
    .poll(async () => {
      const n = await inputs.count();
      for (let i = 0; i < n; i++) if ((await inputs.nth(i).inputValue()) === nilai) return i;
      return -1;
    }, { timeout: 10_000 })
    .toBeGreaterThanOrEqual(0);
  const n = await inputs.count();
  for (let i = 0; i < n; i++) if ((await inputs.nth(i).inputValue()) === nilai) return inputs.nth(i);
  throw new Error(`Input bernilai "${nilai}" tidak ditemukan di modal`);
}

/** Hapus baris (belum terpakai) via SweetAlert2; verifikasi alert & baris hilang. */
async function hapusBaris(page: Page, m: MasterSederhana, nama: string): Promise<void> {
  await listPage.tombolAksi(listPage.baris(page, nama).first(), m.judulHapus).click();
  await expect(listPage.swal(page)).toContainText('Hapus?');
  await listPage.swal(page).getByRole('button', { name: 'Hapus' }).click();
  await expect(listPage.alertSukses(page, /Anda berhasil menghapus/i)).toBeVisible({ timeout: 20_000 });
  await expect(listPage.baris(page, nama)).toHaveCount(0);
}

test.describe('Master (Admin) — struktur halaman', () => {
  for (const s of STRUKTUR) {
    test(`Master ${s.nama}: kolom tabel${s.tambah ? ', tombol Tambah' : ''}${s.aksi ? ', aksi baris' : ''} sesuai kalibrasi`, async ({
      page,
    }) => {
      await bukaList(page, s.url);
      for (const kolom of s.kolom) {
        await expect(
          page.getByRole('columnheader', { name: new RegExp(`^${kolom.replace(/[.()/]/g, '\\$&')}`) }).first(),
        ).toBeVisible();
      }
      if (s.tambah) await expect(page.getByRole('button', { name: s.tambah })).toBeVisible();
      else await expect(page.getByRole('button', { name: /^\s*Tambah/ })).toHaveCount(0);
      if (s.aksi) {
        const baris = listPage.barisData(page).first();
        test.skip(!(await baris.isVisible().catch(() => false)), `Tidak ada data ${s.nama} pada demo`);
        for (const judul of s.aksi) await expect(listPage.tombolAksi(baris, judul)).toBeVisible();
      }
    });
  }
});

test.describe('Master (Admin) — CRUD data sederhana (mutasi)', () => {
  test.slow();

  for (const m of MASTER) {
    test(`${m.nama}: tambah → tampil di list → edit nama via modal → hapus`, async ({ page }) => {
      const pesanDialog = pasangDialog(page);
      const nama = `AUTOTEST-${m.nama.replace(/\s+/g, '').toUpperCase()}-${tsPendek()}`;
      const namaEdit = `${nama}-EDIT`;
      let dibuat = false;
      try {
        await isiFormTambah(page, m, nama);
        await klikSimpanTambah(page);
        dibuat = true;
        // Redirect pasca-simpan memakai kapitalisasi path berbeda dari menu
        // (/adminprahu/Kontainer, /adminprahu/masterinclude) → case-insensitive.
        await expect(page).toHaveURL(new RegExp(`${m.list.replace(/\//g, '\\/')}$`, 'i'), { timeout: 20_000 });
        await expect(listPage.alertSukses(page, /Anda berhasil menambah/i)).toBeVisible();
        const baris = listPage.baris(page, nama).first();
        await expect(baris).toBeVisible();
        await expect(baris.locator('td').nth(m.kolomNama)).toHaveText(nama);
        // Data baru tidak terpakai → Edit langsung membuka modal tanpa confirm.
        await listPage.tombolAksi(baris, m.judulEdit).click();
        const modal = listPage.modalTerbuka(page);
        await expect(modal).toBeVisible();
        expect(pesanDialog, 'tidak ada confirm untuk data belum terpakai').toEqual([]);
        // Input nama modal: #nama_bank_edit (Bank/Kontainer) atau
        // #nama_provinsi_edit (Kemasan/Pelabuhan/DP/Include — id warisan);
        // atribut type input di app ini kosong, jangan filter [type=text].
        const inputNama = await inputBernilai(modal, nama);
        await expect(inputNama).toHaveValue(nama);
        await inputNama.fill(namaEdit);
        await modal.getByRole('button', { name: 'Simpan' }).click();
        await expect(listPage.alertSukses(page, /Anda berhasil mengedit/i)).toBeVisible({ timeout: 20_000 });
        await expect(listPage.baris(page, namaEdit).first().locator('td').nth(m.kolomNama)).toHaveText(namaEdit);

        await hapusBaris(page, m, namaEdit);
        dibuat = false;
      } finally {
        if (dibuat) {
          await bukaList(page, m.list);
          for (const n of [namaEdit, nama]) {
            if ((await listPage.baris(page, n).count()) > 0) await hapusBaris(page, m, n);
          }
        }
      }
    });
  }

  test('Bank: field required divalidasi lewat popover berurutan (Nama Bank lalu Status)', async ({ page }) => {
    await page.goto('/adminprahu/tambahbank');
    await klikSimpanTambah(page);
    await expect(page.locator('.popover').filter({ hasText: 'Masukkan Nama Bank' })).toBeVisible();
    await page.locator('input[name="nama"]').fill('AUTOTEST-VALIDASI');
    await klikSimpanTambah(page);
    await expect(page.locator('.popover').filter({ hasText: 'Pilih Status' })).toBeVisible();
    await expect(page).toHaveURL(/\/adminprahu\/tambahbank$/);
  });

  for (const m of MASTER.filter((x) => x.duplikat)) {
    test(`${m.nama}: nama yang sudah ada ditolak dengan alert "${m.duplikat!.alert.source}"`, async ({ page }) => {
      await bukaList(page, m.list);
      test.skip(
        (await listPage.baris(page, m.duplikat!.nama).count()) === 0,
        `Data pembanding "${m.duplikat!.nama}" tidak ada di demo`,
      );
      const pesanDialog = pasangDialog(page);
      await isiFormTambah(page, m, m.duplikat!.nama);
      await klikSimpanTambah(page);
      await expect.poll(() => pesanDialog.length, { timeout: 15_000 }).toBeGreaterThan(0);
      expect(pesanDialog[0]).toMatch(m.duplikat!.alert);
      await expect(page).toHaveURL(new RegExp(`${m.tambah.replace(/\//g, '\\/')}$`));
    });
  }
});

test.describe('Master (Admin) — data yang sudah digunakan', () => {
  test.slow();

  const TERPAKAI: Array<{ nama: string; list: string; baris: string; judulEdit: string; judulHapus: string; confirmEdit: RegExp; tolakHapus: RegExp }> = [
    { nama: 'Bank', list: '/adminprahu/masterbank', baris: 'CIMB Niaga', judulEdit: 'Edit Bank', judulHapus: 'Hapus Bank', confirmEdit: /Data sudah digunakan pada registrasi, yakin untuk mengedit\?/, tolakHapus: /Data sudah digunakan pada registrasi/ },
    { nama: 'Include', list: '/adminprahu/masterInclude', baris: 'AUTOTEST-FIXTURE-INCLUDE-01', judulEdit: 'Edit Include', judulHapus: 'Hapus Include', confirmEdit: /Data sudah digunakan pada pengajuan lelang dan harga, yakin untuk mengedit\?/, tolakHapus: /Data sudah digunakan pada pengajuan lelang dan harga/ },
    { nama: 'Dokumen Penagihan', list: '/adminprahu/masterDP', baris: 'AUTOTEST-FIXTURE-DP-01', judulEdit: 'Edit Dokumen Penagihan', judulHapus: 'Hapus Dokumen Penagihan', confirmEdit: /Data sudah digunakan pada lelang\. Yakin untuk edit \?/, tolakHapus: /Data sudah digunakan pada lelang/ },
    { nama: 'Pelayaran', list: '/adminprahu/pelayaran', baris: 'AUTOTEST-FIXTURE-PELAYARAN-01', judulEdit: 'Edit Pelayaran', judulHapus: 'Hapus Pelayaran', confirmEdit: /Data sudah digunakan pada master harga, yakin untuk mengedit \?/, tolakHapus: /Data Sudah digunakan pada master harga/i },
  ];

  for (const t of TERPAKAI) {
    test(`${t.nama} terpakai: Edit meminta konfirmasi dan Hapus ditolak`, async ({ page }) => {
      await bukaList(page, t.list);
      test.skip((await listPage.baris(page, t.baris).count()) === 0, `Data terpakai "${t.baris}" tidak ada di demo`);
      const pesanDialog = pasangDialog(page, false);
      const baris = listPage.baris(page, t.baris).first();

      await listPage.tombolAksi(baris, t.judulEdit).click();
      await expect.poll(() => pesanDialog.length, { timeout: 10_000 }).toBe(1);
      expect(pesanDialog[0]).toMatch(t.confirmEdit);
      // Confirm ditolak (dismiss) → modal edit tidak dibuka.
      await expect(listPage.modalTerbuka(page)).toHaveCount(0);

      await listPage.tombolAksi(baris, t.judulHapus).click();
      await expect(listPage.swal(page)).toContainText(t.tolakHapus);
      await listPage.swal(page).getByRole('button', { name: 'OK' }).click();
      await expect(listPage.baris(page, t.baris)).toHaveCount(1);
    });
  }

  test('Kemasan terpakai: hanya status yang bisa diedit (nama disabled) dan hapus ditolak setelah konfirmasi', async ({ page }) => {
    await bukaList(page, '/adminprahu/masterkemasan');
    const nama = 'AUTOTEST-FIXTURE-KEMASAN-01';
    test.skip((await listPage.baris(page, nama).count()) === 0, 'Fixture kemasan terpakai tidak ada di demo');
    const pesanDialog = pasangDialog(page);
    const baris = listPage.baris(page, nama).first();

    await listPage.tombolAksi(baris, 'Edit Kemasan').click();
    const modal = page.locator('#modalEditProvinsi');
    await expect(modal).toBeVisible();
    // "Disable" pada rule diimplementasikan sebagai readonly (bukan disabled).
    await expect(modal.locator('#nama_provinsi_edit')).not.toBeEditable();
    await expect(modal.locator('#status_edit')).toBeEditable();
    await modal.getByRole('button', { name: 'Batal' }).click();
    await expect(modal).toBeHidden();

    await listPage.tombolAksi(baris, 'Hapus Kemasan').click();
    await expect(listPage.swal(page)).toContainText('Hapus?');
    await listPage.swal(page).getByRole('button', { name: 'Hapus' }).click();
    // Rule menulis "Data sudah digunakan pada orderan"; fixture demo terpakai
    // di Master Jenis Muatan sehingga teks mengikuti pemakaian nyata.
    await expect.poll(() => pesanDialog.length, { timeout: 15_000 }).toBeGreaterThan(0);
    expect(pesanDialog[0]).toMatch(/Data sudah digunakan pada (orderan|master jenis muatan)/);
    await bukaList(page, '/adminprahu/masterkemasan');
    await expect(listPage.baris(page, nama)).toHaveCount(1);
  });
});
