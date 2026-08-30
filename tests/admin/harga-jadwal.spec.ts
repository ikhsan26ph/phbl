import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Harga & Jadwal — peran Administrator (project "admin", storageState
 * .auth/admin.json via project setup). Read-only: halaman Tambah Harga hanya
 * DIBUKA (validasi klien pada field PPN diuji tanpa submit).
 * Rule: docs/rules/administrator/16-harga-jadwal.md.
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - /home/hargajadwal (menu "MENU TRANSPORTER > HARGA & JADWAL" di sisi admin);
 *   tanpa query redirect ?tab=1. 5 tab numerik seperti bidder: 1=Semua Harga &
 *   Jadwal (aktif default), 2=Butuh Jadwal Kapal, 3=Perlu Update Harga,
 *   4=Sudah Lengkap, 5=Request Jadwal; tombol tab DUPLIKAT desktop/mobile →
 *   .first(); aktif = class btn_tab_aktif.
 * - Kolom admin punya "Transporter" di depan: Transporter | Nomor Lelang |
 *   Rute | Jenis | Harga (Rp.) | Mulai Berlaku | Aksi. Keterangan: "*) Merah =
 *   perlu input jadwal, # adalah respon update harga, "EXPIRED" = harga sudah
 *   tidak berlaku". Baris info di bawah tiap baris data: "Tanggal Buat Harga :
 *   … PPN : … PPh : … Pelayaran : …".
 * - Warna: tab 2 (butuh jadwal) sel merah rgb(249, 73, 81); tab 1/4 normal
 *   rgb(73, 80, 87). Tanda "(#n)" dan "(EXPIRED)" di kolom Harga.
 * - Aksi tab 1/2/4: a.view-detail (ikon mata tanpa nama — usulan data-testid),
 *   button[title="Edit Harga"], button[title="Hapus Harga"], button[title=
 *   "Menu Jadwal"] berisi link "Tambah Jadwal" + "Lihat Jadwal" (/home/
 *   masterjadwal1/<hash>). Tab 5: a.view-detail + [title="Lihat Jadwal"] +
 *   a.updatejadwal "Update" (12 dari 40 baris saat kalibrasi). Tab 3 KOSONG
 *   di demo ("Tidak Ada Data yang tersedia").
 * - Tombol "Input Harga Penawaran" (a.tambahhover) → /home/tambahharga:
 *   heading "TAMBAH HARGA" + "BIAYA TERMASUK"; select #BidderID (Pilih
 *   Transporter — khas admin), #LelangID, #PelayaranID (master pelayaran),
 *   #JenisKontainerID (master jenis kontainer), #harga, #ppn (prefill "1,1"
 *   dari setting pajak), #pph (prefill "2"), #mulai_berlaku, checkbox include
 *   per biaya, Simpan #submitonce1.
 * - PPN > 100 otomatis tereset jadi 100 (rule) — diuji dengan mengetik 150
 *   pada #ppn tanpa submit.
 *
 * TIDAK dicakup (mutasi / kondisi data): tambah/edit/hapus/update harga &
 * jadwal, popup detail harga (late-binding, lihat defect #6), tab Perlu
 * Update Harga (tanpa data), alert PPN/PPh kosong (butuh submit), filter dan
 * perpindahan data antar tab.
 */

const listUrl = '/home/hargajadwal';

const TABS: Array<{ nama: string; tab: number }> = [
  { nama: 'Semua Harga & Jadwal', tab: 1 },
  { nama: 'Butuh Jadwal Kapal', tab: 2 },
  { nama: 'Perlu Update Harga', tab: 3 },
  { nama: 'Sudah Lengkap', tab: 4 },
  { nama: 'Request Jadwal', tab: 5 },
];

const listPage = {
  tab: (page: Page, nama: string) => page.getByRole('link', { name: nama, exact: true }).first(),
  barisData: (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('a.view-detail') }),
};

async function bukaTab(page: Page, tab: number): Promise<number> {
  await page.goto(`${listUrl}?tab=${tab}`);
  await listPage.barisData(page).first().waitFor({ timeout: 20_000 }).catch(() => {});
  return listPage.barisData(page).count();
}

function tombolAksi(baris: Locator, judul: string): Locator {
  return baris.locator(`[title="${judul}"], [data-original-title="${judul}"]`);
}

test.describe('Daftar Harga & Jadwal (Admin)', () => {
  test('halaman default redirect ke tab Semua Harga & Jadwal dengan tab tersebut aktif', async ({ page }) => {
    await page.goto(listUrl);
    await expect(page).toHaveURL(/\/home\/hargajadwal\?tab=1$/);
    await expect(listPage.tab(page, 'Semua Harga & Jadwal')).toHaveClass(/btn_tab_aktif/);
    await expect(page.getByText(/Beranda\s*\/\s*Harga & Jadwal/)).toBeVisible();
  });

  test('kelima tab tampil dengan link benar dan klik tab memindahkan tab aktif', async ({ page }) => {
    await page.goto(listUrl);
    for (const { nama, tab } of TABS) {
      await expect(listPage.tab(page, nama)).toHaveAttribute('href', new RegExp(`\\?tab=${tab}$`));
    }
    await listPage.tab(page, 'Butuh Jadwal Kapal').click();
    await expect(page).toHaveURL(/\?tab=2$/);
    await expect(listPage.tab(page, 'Butuh Jadwal Kapal')).toHaveClass(/btn_tab_aktif/);
    await expect(listPage.tab(page, 'Semua Harga & Jadwal')).not.toHaveClass(/btn_tab_aktif/);
  });

  test('tabel menampilkan kolom sisi admin (ada Transporter) beserta keterangan penanda', async ({ page }) => {
    await page.goto(listUrl);
    for (const kolom of ['Transporter', 'Nomor Lelang', 'Rute', 'Jenis', 'Harga (Rp.)', 'Mulai Berlaku', 'Aksi']) {
      // Tanpa \b penutup: "Harga (Rp.)" berakhir non-word char.
      await expect(
        page.getByRole('columnheader', { name: new RegExp(`^${kolom.replace(/[().]/g, '\\$&')}`) }).first(),
      ).toBeVisible();
    }
    // Keterangan dirender dua kali (varian desktop & mobile) dan varian
    // pertama justru yang tersembunyi → saring visible dulu.
    await expect(
      page
        .getByText('*) Merah = perlu input jadwal, # adalah respon update harga, "EXPIRED" = harga sudah tidak berlaku')
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  });

  test('harga tanpa jadwal di tab Butuh Jadwal Kapal ditandai merah, tab Sudah Lengkap tidak', async ({ page }) => {
    const jumlah2 = await bukaTab(page, 2);
    test.skip(jumlah2 === 0, 'Tidak ada data di tab Butuh Jadwal Kapal pada demo');
    await expect(listPage.barisData(page).first().locator('td').first()).toHaveCSS('color', 'rgb(249, 73, 81)');

    const jumlah4 = await bukaTab(page, 4);
    test.skip(jumlah4 === 0, 'Tidak ada data di tab Sudah Lengkap pada demo');
    await expect(listPage.barisData(page).first().locator('td').first()).toHaveCSS('color', 'rgb(73, 80, 87)');
  });

  for (const tab of [
    { nama: 'Butuh Jadwal Kapal', nomor: 2 },
    { nama: 'Sudah Lengkap', nomor: 4 },
  ]) {
    test(`aksi tab ${tab.nama}: detail, edit, hapus harga, serta lihat & tambah jadwal`, async ({ page }) => {
      const jumlah = await bukaTab(page, tab.nomor);
      test.skip(jumlah === 0, `Tidak ada data di tab ${tab.nama} pada demo`);
      const baris = listPage.barisData(page).first();
      await expect(baris.locator('a.view-detail')).toBeVisible();
      await expect(tombolAksi(baris, 'Edit Harga')).toBeVisible();
      await expect(tombolAksi(baris, 'Hapus Harga')).toBeVisible();
      await expect(tombolAksi(baris, 'Menu Jadwal')).toBeVisible();
      await expect(baris.getByText('Tambah Jadwal', { exact: true })).toBeAttached();
      await expect(baris.getByText('Lihat Jadwal', { exact: true })).toBeAttached();
      await expect(baris.locator('a[href*="/home/masterjadwal1/"]')).toBeAttached();
    });
  }

  test('aksi tab Perlu Update Harga: detail harga dan update harga', async ({ page }) => {
    const jumlah = await bukaTab(page, 3);
    // Tab kosong di demo sejak kalibrasi — assertion mengikuti rule.
    test.skip(jumlah === 0, 'Tidak ada data di tab Perlu Update Harga pada demo');
    const baris = listPage.barisData(page).first();
    await expect(baris.locator('a.view-detail')).toBeVisible();
    await expect(tombolAksi(baris, 'Update Harga')).toBeVisible();
  });

  test('aksi tab Request Jadwal: update jadwal (bila belum direspon), detail harga, lihat jadwal', async ({ page }) => {
    const jumlah = await bukaTab(page, 5);
    test.skip(jumlah === 0, 'Tidak ada data di tab Request Jadwal pada demo');
    const baris = listPage.barisData(page).first();
    await expect(baris.locator('a.view-detail')).toBeVisible();
    await expect(tombolAksi(baris, 'Lihat Jadwal')).toBeVisible();

    // Rule: tombol Update hanya pada harga yang belum direspon bidder.
    const denganUpdate = listPage.barisData(page).filter({ has: page.locator('a.updatejadwal') });
    test.skip((await denganUpdate.count()) === 0, 'Tidak ada request jadwal yang belum direspon pada demo');
    await expect(denganUpdate.first().getByText('Update', { exact: true })).toBeVisible();
    // Baris yang sudah direspon TANPA tombol Update.
    expect(await listPage.barisData(page).filter({ hasNot: page.locator('a.updatejadwal') }).count()).toBeGreaterThan(0);
  });

  test('harga hasil respon update harga bertanda (#n) dan harga kadaluarsa bertanda (EXPIRED)', async ({ page }) => {
    const jumlah = await bukaTab(page, 1);
    test.skip(jumlah === 0, 'Tidak ada data harga pada demo');
    const bertanda = listPage.barisData(page).filter({ hasText: /\(#\d+\)/ });
    const expired = listPage.barisData(page).filter({ hasText: /\(EXPIRED\)/ });
    test.skip((await bertanda.count()) === 0 && (await expired.count()) === 0, 'Tidak ada harga bertanda # / EXPIRED pada halaman pertama');
    if ((await bertanda.count()) > 0) {
      // Tanda # berada di kolom Harga (sel ke-5 pada tabel admin).
      await expect(bertanda.first().locator('td').nth(4)).toHaveText(/\(#\d+\)/);
    }
    if ((await expired.count()) > 0) {
      await expect(expired.first().locator('td').nth(4)).toHaveText(/\(EXPIRED\)/);
    }
  });
});

test.describe('Input Harga Penawaran (Admin, form dibuka tanpa simpan)', () => {
  test('form tambah harga memuat pilihan transporter, lelang, pelayaran, jenis kontainer, dan rekomendasi PPN/PPh', async ({ page }) => {
    await page.goto(listUrl);
    await page.getByRole('button', { name: 'Input Harga Penawaran' }).click();
    await expect(page).toHaveURL(/\/home\/tambahharga$/);
    await expect(page.getByText('TAMBAH HARGA', { exact: true })).toBeVisible();

    // Khas admin: memilih transporter yang diinputkan harganya.
    await expect(page.locator('label', { hasText: 'Pilih Transporter *' })).toBeVisible();
    await expect(page.locator('#BidderID')).toBeVisible();
    expect(await page.locator('#BidderID option').count()).toBeGreaterThan(1);
    for (const label of ['Pilih Lelang Masuk *', 'Pelayaran *', 'Jenis Kontainer *', 'Harga Penawaran (Rp.) *', 'Nilai PPN *', 'Nilai PPh *', 'Mulai Berlaku *']) {
      await expect(page.locator('label', { hasText: label }).first()).toBeVisible();
    }
    // Rule: pilihan pelayaran & jenis kontainer dari master admin.
    await expect(page.locator('#PelayaranID option').first()).toHaveText('Pilih Pelayaran');
    await expect(page.locator('#JenisKontainerID option').first()).toHaveText('Pilih Jenis Kontainer');
    // Rule: rekomendasi PPN & PPh dari setting pajak admin (desimal koma).
    await expect(page.locator('#ppn')).toHaveValue(/^\d+(,\d+)?$/);
    await expect(page.locator('#pph')).toHaveValue(/^\d+(,\d+)?$/);
    // Rule: biaya termasuk ngedraft dari lelang; daftar include tampil.
    await expect(page.getByText('BIAYA TERMASUK')).toBeVisible();
    await expect(page.locator('#submitonce1')).toHaveText(/Simpan/);
  });

  test('nilai PPN di atas 100 otomatis direset menjadi 100', async ({ page }) => {
    await page.goto('/home/tambahharga');
    const ppn = page.locator('#ppn');
    await ppn.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type('150');
    await ppn.blur();
    await expect(ppn).toHaveValue('100');
  });
});
