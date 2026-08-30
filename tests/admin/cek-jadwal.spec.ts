import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Cek Jadwal + Setting Pelabuhan (UN Code Meratus) — peran
 * Administrator (project "admin", storageState .auth/admin.json). Read-only:
 * modal Setting UNCODE hanya dibuka, tidak disimpan.
 * Rule: docs/rules/administrator/09-cek-jadwal.md.
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - /lelang/carijadwal identik dgn versi shipper: select[0] Pelayaran
 *   DISABLED "Meratus", select[1] polid, select[2] podid (select2 →
 *   .select2-container indeks 1 & 2), select[3] sortir (etd "Tanggal
 *   Berangkat Terdekat" default / eta "Tanggal Tiba Terdekat"), input
 *   #mulai_berlaku (name=etd) default hari ini + teks "Default tanggal hari
 *   ini", tombol #submitonce1 "Cari Jadwal", 5 logo liner (meratus-one,
 *   iconlinebooking, myspil, tantonet, kliktemas) + "*) Klik logo dibawah…".
 *   Breadcrumb "Beranda / Cek Jadwal Pelayaran" (Beranda link ke listLelang).
 * - Hasil pencarian bergantung API Meratus (pesan maaf / tabel kosong / baris)
 *   — test toleran seperti spec shipper.
 * - Setting Pelabuhan /adminprahu/setting_pelabuhan TIDAK ada di menu (rule:
 *   hidden, akses via link): heading "SETTING PELABUHAN", tabel #tabletrayek
 *   No | Nama Pelabuhan | Nama Kota / Kab. | UN Code | UN Meratus | Status |
 *   Aksi; UN Meratus "-" bila belum diset; tombol "Setting" per baris → modal
 *   #modalEditProvinsi "Setting UNCODE" (nama/kota/UN Code DISABLED, hanya
 *   #un_meratus_edit yang bisa diedit; Batal / Simpan #tombolEditProvinsi);
 *   link "Edit Data Pelabuhan" → /adminprahu/edit_datapelabuhan; filter
 *   "Filter 0" (UN Code, Nama Pelabuhan, Kota/Kab., Status).
 *
 * TIDAK dicakup: urutan ETD/ETA nyata, simpan UN Code Meratus, kondisi UN
 * Code beda → pesan (butuh mutasi setting).
 */

const cekJadwalUrl = '/lelang/carijadwal';
const settingPelabuhanUrl = '/adminprahu/setting_pelabuhan';

const jadwalPage = {
  cariButton: (page: Page) => page.locator('#submitonce1'),
  select2: (page: Page, index: number) => page.locator('.select2-container').nth(index),
  selects: (page: Page) => page.locator('select'),
};

async function pilihSelect2(page: Page, index: number, kataKunci: string) {
  await jadwalPage.select2(page, index).click();
  await page.keyboard.type(kataKunci);
  await page.locator('.select2-results__option--highlighted').click();
}

test.describe('Cek Jadwal Pelayaran (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(cekJadwalUrl);
  });

  test('form default: pelayaran terkunci Meratus, sortir tanggal berangkat, tanggal hari ini', async ({ page }) => {
    await expect(page.getByText(/Beranda\s*\/\s*Cek Jadwal Pelayaran/)).toBeVisible();
    await expect(page.getByText('CEK JADWAL PELAYARAN', { exact: true })).toBeVisible();
    await expect(page.getByText('Sementara waktu pelayaran yang tersedia masih MERATUS')).toBeVisible();
    await expect(jadwalPage.selects(page).first()).toBeDisabled();
    await expect(jadwalPage.selects(page).first().locator('option')).toHaveText(['Meratus']);

    const sortir = jadwalPage.selects(page).nth(3);
    await expect(sortir).toHaveValue('etd');
    expect(await sortir.locator('option').allTextContents()).toEqual(['Tanggal Berangkat Terdekat', 'Tanggal Tiba Terdekat']);

    const hariIni = new Date();
    const dd = String(hariIni.getDate()).padStart(2, '0');
    const mm = String(hariIni.getMonth() + 1).padStart(2, '0');
    await expect(page.locator('#mulai_berlaku')).toHaveValue(`${dd}/${mm}/${hariIni.getFullYear()}`);
    await expect(page.getByText('Default tanggal hari ini')).toBeVisible();
  });

  test('logo liner tampil dengan link jadwal pelayaran masing-masing', async ({ page }) => {
    for (const href of ['meratus-one.com', 'iconlinebooking.co.id', 'myspil.com', 'tantonet.com', 'kliktemas.com']) {
      await expect(page.locator(`a[href*="${href}"]`)).toBeVisible();
    }
    await expect(page.getByText('*) Klik logo dibawah untuk melihat jadwal pelayaran lain').first()).toBeVisible();
  });

  test('klik Cari Jadwal tanpa pelabuhan tidak menampilkan hasil (POL/POD wajib)', async ({ page }) => {
    await jadwalPage.cariButton(page).click();
    await expect(page.getByText('HASIL JADWAL')).toHaveCount(0);
    await expect(page).toHaveURL(/\/lelang\/carijadwal$/);
  });

  test('pencarian jadwal menampilkan hasil atau pesan jadwal belum tersedia beserta kontak CS', async ({ page }) => {
    await pilihSelect2(page, 1, 'Perak');
    await pilihSelect2(page, 2, 'Makassar');
    await expect(jadwalPage.selects(page).nth(1)).toHaveValue(/.+/);
    await expect(jadwalPage.selects(page).nth(2)).toHaveValue(/.+/);
    await jadwalPage.cariButton(page).click();

    await expect(page.getByText('HASIL JADWAL')).toBeVisible({ timeout: 30_000 });
    const pesanMaaf = page.getByText(/Mohon maaf, jadwal yang anda cari belum tersedia di sistem/).filter({ visible: true });
    const tanpaData = page.getByText('Tidak Ada Data yang tersedia').filter({ visible: true });
    const barisJadwal = page.locator('table tbody tr').filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ }).filter({ visible: true });
    await expect(pesanMaaf.or(tanpaData).or(barisJadwal).first()).toBeVisible({ timeout: 30_000 });

    if ((await pesanMaaf.count()) > 0) {
      await expect(pesanMaaf.first().getByText('csct@prahu-hub.com')).toBeVisible();
      await expect(pesanMaaf.first().getByText('081246665023')).toBeVisible();
    } else {
      // Rule: data pelayaran, nama kapal, voyage, closing time, POL, ETD, POD, ETA.
      await expect(page.getByRole('columnheader', { name: 'Pelayaran' }).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Nama Kapal\s+Status Jadwal/ }).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Voyage\s+Closing Time/ }).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Pelabuhan Asal\s+ETD/ }).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /Pelabuhan Tujuan\s+ETA/ }).filter({ visible: true }).first()).toBeVisible();
    }
    // Rule: logo liner tetap tampil baik hasil ditemukan maupun tidak.
    await expect(page.locator('a[href*="myspil.com"]')).toBeVisible();
  });
});

test.describe('Setting Pelabuhan — UN Code Meratus (halaman tersembunyi)', () => {
  test('tidak ada di menu navigasi, tapi bisa diakses langsung dengan tabel pelabuhan dan kolom UN Meratus', async ({ page }) => {
    await page.goto(cekJadwalUrl);
    await expect(page.locator('a[href*="setting_pelabuhan"]')).toHaveCount(0);

    await page.goto(settingPelabuhanUrl);
    await expect(page.getByText(/Beranda\s*\/\s*Setting Pelabuhan/)).toBeVisible();
    await expect(page.getByText('SETTING PELABUHAN', { exact: true })).toBeVisible();
    for (const kolom of ['No', 'Nama Pelabuhan', 'Nama Kota / Kab.', 'UN Code', 'UN Meratus', 'Status', 'Aksi']) {
      // \b penutup HANYA bila nama kolom berakhir word char — "Kab." berakhir
      // titik sehingga `\.\b` tidak pernah cocok (jebakan yang sama dgn
      // "Harga (Rp.)", lihat CLAUDE.md).
      const escaped = kolom.replace(/[./]/g, '\\$&');
      const pola = new RegExp(`^${escaped}${/\w$/.test(kolom) ? '\\b' : ''}`);
      await expect(page.locator('#tabletrayek').getByRole('columnheader', { name: pola })).toBeVisible();
    }
    await expect(page.locator('#btn_filter_')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit Data Pelabuhan' })).toHaveAttribute('href', /\/adminprahu\/edit_datapelabuhan$/);
    // Rule: data diambil dari master pelabuhan; UN Meratus "-" bila belum diset.
    const baris = page.locator('#tabletrayek tbody tr').filter({ has: page.getByRole('button', { name: 'Setting' }) });
    await baris.first().waitFor({ timeout: 20_000 }).catch(() => {});
    test.skip((await baris.count()) === 0, 'Tidak ada data pelabuhan pada demo');
    await expect(baris.first().locator('td').nth(4)).toHaveText(/^(-|[A-Z0-9]+)$/);
    await expect(baris.first().locator('td').nth(5)).toHaveText(/^(AKTIF|TIDAK AKTIF)$/);
  });

  test('tombol Setting membuka modal Setting UNCODE yang hanya mengizinkan edit UN Code Meratus', async ({ page }) => {
    await page.goto(settingPelabuhanUrl);
    const baris = page.locator('#tabletrayek tbody tr').filter({ has: page.getByRole('button', { name: 'Setting' }) });
    await baris.first().waitFor({ timeout: 20_000 }).catch(() => {});
    test.skip((await baris.count()) === 0, 'Tidak ada data pelabuhan pada demo');
    const namaPelabuhan = (await baris.first().locator('td').nth(1).innerText()).trim();
    await baris.first().getByRole('button', { name: 'Setting' }).click();

    const modal = page.locator('#modalEditProvinsi');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Setting UNCODE')).toBeVisible();
    await expect(modal.locator('#nama_provinsi_edit')).toHaveValue(namaPelabuhan);
    for (const id of ['nama_provinsi_edit', 'kota_edit', 'un_edit']) {
      await expect(modal.locator(`#${id}`)).toBeDisabled();
    }
    await expect(modal.locator('#un_meratus_edit')).toBeEnabled();
    await expect(modal.locator('label', { hasText: 'UNCODE Meratus *' })).toBeVisible();
    await expect(modal.locator('#tombolEditProvinsi')).toHaveText(/Simpan/);
    await modal.getByRole('button', { name: 'Batal' }).click();
    await expect(modal).toBeHidden();
  });
});
