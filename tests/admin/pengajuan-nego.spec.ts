import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Pengajuan Nego + Riwayat Nego — peran Administrator (project
 * "admin", storageState .auth/admin.json via project setup). Read-only.
 * Rule: docs/rules/administrator/05-pengajuan-nego.md dan 06-riwayat-nego.md.
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - /lelang/pengajuannego: breadcrumb "Beranda / Pengajuan Nego" (Beranda =
 *   link ke /lelang/listLelang). Tabel #tabel_pengajuan_nego, header
 *   berpasangan: "Shipper Status Nego", "Pelayaran Jenis", "Pelabuhan Asal
 *   ETD", "Pelabuhan Tujuan ETA", "Nego Harga Harga Awal", "Harga Baru Jumlah
 *   Nego", "Aksi". Baris dimuat async; tiap nego = baris data + baris info
 *   ("Info Harga Transporter : … Tanggal Nego : …"). Status di badge
 *   WAITING/DITERIMA/DITOLAK/NEGOSIASI; "Nego Ke N"; strip "-" harga baru bila
 *   waiting/ditolak. Link "Detail" → /lelang/detailnego/<hash>.
 * - Filter: #nomor_lelang, select[name=id_bidder] (Transporter), select
 *   [name=bidowner] (Shipper), jenis_kontainer, harga_awal, from/to, ETD/ETA,
 *   nego_harga, harga_baru, jumlah_nego, status (Pilih Status, Waiting=0,
 *   Diterima=1, Ditolak=99, Negosiasi=2).
 * - Detail: "DETAIL NEGO", label Transporter / Pelayaran / Kapal / Voy. -
 *   Closing Time / Pelabuhan Asal - ETD / Pelabuhan Tujuan - ETA / Jenis /
 *   Harga Awal (Sebelum PPN) / PPN / PPh / Biaya Termasuk / Deskripsi Harga,
 *   "DATA NEGO": Shipper / Nomor Lelang / Tanggal Nego Diajukan / Nego Harga /
 *   Jumlah Nego ("Nego Ke N ( Lihat Riwayat )") / Status Nego. Status WAITING
 *   berketerangan "Menunggu bidder merespon nego harga". HANYA tombol Kembali
 *   + link a.link_1 "Lihat Riwayat" (/lelang/riwayatnego/<hash>) — tanpa aksi
 *   nego apa pun (rule: admin hanya melihat).
 * - Link "Lihat Riwayat" (a.link_1) dirender DUA varian dengan href sama:
 *   satu biasa, satu ber-`target="_blank"` → klik membuka TAB BARU sehingga
 *   URL halaman asal tidak berubah (terbukti 2026-08-30). Helper bukaRiwayat()
 *   menangani keduanya.
 * - Riwayat: "RIWAYAT NEGO", breadcrumb "Beranda / Pengajuan Nego / Riwayat
 *   Nego", ringkasan harga + "Jumlah Nego : Nego ke N", tombol Filter
 *   #btn-filter-provinsi, tabel Tanggal Nego | Nego Harga | Jumlah Nego |
 *   Konfirmasi Transporter | Harga Baru | Status Nego (rule: "Konfirmasi
 *   Bidder"); tanggal DD/MM/YYYY HH:MM; waiting → konfirmasi "-" & harga baru
 *   "-"; ditolak → harga baru "-"; status capitalize (Waiting/Ditolak/…).
 *
 * TIDAK dicakup: respon nego (lintas peran), pembentukan riwayat lanjutan
 * saat nego ulang (butuh mutasi), nilai PPN/PPh "-" utk data lama (tidak ada
 * di halaman pertama demo).
 */

const negoUrl = '/lelang/pengajuannego';

const negoPage = {
  detailLinks: (page: Page) => page.getByRole('link', { name: 'Detail', exact: true }),
  barisData: (page: Page) => page.locator('#tabel_pengajuan_nego tbody tr').filter({ has: page.getByRole('link', { name: 'Detail', exact: true }) }),
};

async function tungguBaris(page: Page): Promise<number> {
  await negoPage.detailLinks(page).first().waitFor({ timeout: 20_000 }).catch(() => {});
  return negoPage.detailLinks(page).count();
}

/**
 * Buka Riwayat Nego dari halaman Detail Nego. Link punya varian target=_blank
 * (tab baru) — kembalikan Page yang benar-benar memuat riwayat.
 */
async function bukaRiwayat(page: Page): Promise<Page> {
  const link = page.getByRole('link', { name: 'Lihat Riwayat' }).first();
  await expect(link).toHaveAttribute('href', /\/lelang\/riwayatnego\/.+/);
  if ((await link.getAttribute('target')) === '_blank') {
    const [tab] = await Promise.all([page.context().waitForEvent('page'), link.click()]);
    await tab.waitForLoadState();
    await expect(tab).toHaveURL(/\/lelang\/riwayatnego\/.+/);
    return tab;
  }
  await link.click();
  await page.waitForURL(/\/lelang\/riwayatnego\/.+/, { timeout: 20_000 });
  return page;
}

test.describe('Daftar Pengajuan Nego (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(negoUrl);
  });

  test('tabel menampilkan kolom berpasangan (Shipper di sisi admin) dan status nego pada baris', async ({ page }) => {
    await expect(page.getByText(/Beranda\s*\/\s*Pengajuan Nego/)).toBeVisible();
    for (const kolom of [
      'Shipper Status Nego',
      'Pelayaran Jenis',
      'Pelabuhan Asal ETD',
      'Pelabuhan Tujuan ETA',
      'Nego Harga Harga Awal',
      'Harga Baru Jumlah Nego',
      'Aksi',
    ]) {
      await expect(page.getByRole('columnheader', { name: kolom, exact: true })).toBeVisible();
    }
    test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego pada demo');
    // Rule: status waiting = belum direspon bidder; Diterima/Ditolak/Negosiasi
    // = sudah direspon.
    await expect(negoPage.barisData(page).first().locator('td').first()).toHaveText(/WAITING|DITERIMA|DITOLAK|NEGOSIASI/);
    await expect(negoPage.barisData(page).first().locator('td').nth(5)).toHaveText(/Nego Ke \d+/);
  });

  test('filter menyediakan Shipper, Transporter, dan keempat status nego', async ({ page }) => {
    await page.getByRole('button', { name: 'Filter' }).first().click();
    await expect(page.locator('select[name="bidowner"] option').first()).toHaveText('Masukkan Nama Shipper');
    await expect(page.locator('select[name="id_bidder"] option').first()).toHaveText('Masukkan Nama Transporter');
    const opsi = await page.locator('select[name="status"] option').allTextContents();
    expect(opsi.map((o) => o.trim())).toEqual(['Pilih Status', 'Waiting', 'Diterima', 'Ditolak', 'Negosiasi']);
  });

  test('nego berstatus WAITING atau DITOLAK menampilkan strip pada Harga Baru', async ({ page }) => {
    test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego pada demo');
    const baris = negoPage.barisData(page).filter({ hasText: /WAITING|DITOLAK/ });
    test.skip((await baris.count()) === 0, 'Tidak ada nego WAITING/DITOLAK pada halaman pertama');
    // Regex toHaveText memakai teks MENTAH (tanpa normalisasi whitespace) —
    // sel diawali newline+indentasi, jadi jangkar butuh \s* (CLAUDE.md).
    await expect(baris.first().locator('td').nth(5)).toHaveText(/^\s*-\s*Nego Ke \d+/);
  });
});

test.describe('Detail Nego (Admin, tanpa aksi)', () => {
  test('detail memuat harga sebelum PPN, nilai PPN/PPh, data nego, tanpa tombol respon nego', async ({ page }) => {
    await page.goto(negoUrl);
    test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego pada demo');
    await negoPage.detailLinks(page).first().click();
    await expect(page).toHaveURL(/\/lelang\/detailnego\/.+/);

    await expect(page.getByText(/Beranda\s*\/\s*Pengajuan Nego\s*\/\s*Detail Nego/)).toBeVisible();
    for (const label of [
      'Transporter',
      'Pelayaran',
      'Kapal / Voy. - Closing Time',
      'Pelabuhan Asal - ETD',
      'Pelabuhan Tujuan - ETA',
      'Jenis',
      'Harga Awal (Sebelum PPN)',
      'PPN',
      'PPh',
      'Biaya Termasuk',
      'Shipper',
      'Nomor Lelang',
      'Tanggal Nego Diajukan',
      'Nego Harga',
      'Jumlah Nego',
      'Status Nego',
    ]) {
      await expect(page.locator('label', { hasText: new RegExp(`^${label.replace(/[().]/g, '\\$&')}\\s*:`) }).filter({ visible: true }).first()).toBeVisible();
    }
    await expect(page.getByText('DATA NEGO')).toBeVisible();
    // Rule: PPN & PPh ditampilkan; nilai "-" bila data lama tanpa PPN/PPh.
    await expect(page.getByText(/^\s*([\d,]+ %|-)\s*$/).first()).toBeVisible();
    // Rule: admin hanya melihat — tidak ada aksi terima/tolak/nego/ajukan kembali.
    await expect(page.getByRole('button', { name: /Terima|Tolak|Nego/ })).toHaveCount(0);
    await expect(page.locator('a[href*="terimaNego"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Kembali' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lihat Riwayat' }).first()).toHaveAttribute('href', /\/lelang\/riwayatnego\/.+/);
  });

  test('nego WAITING berketerangan menunggu respon bidder', async ({ page }) => {
    await page.goto(negoUrl);
    test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego pada demo');
    const baris = negoPage.barisData(page).filter({ hasText: 'WAITING' });
    test.skip((await baris.count()) === 0, 'Tidak ada nego WAITING pada halaman pertama');
    await baris.first().getByRole('link', { name: 'Detail', exact: true }).click();
    await expect(page.getByText('WAITING', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Menunggu bidder merespon nego harga')).toBeVisible();
  });
});

test.describe('Riwayat Nego (Admin)', () => {
  test('diakses dari textlink Lihat Riwayat; mencatat tanggal, nego harga, jumlah nego, konfirmasi, harga baru, status', async ({ page }) => {
    await page.goto(negoUrl);
    test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego pada demo');
    await negoPage.detailLinks(page).first().click();
    const riwayat = await bukaRiwayat(page);

    await expect(riwayat.getByText(/Beranda\s*\/\s*Pengajuan Nego\s*\/\s*Riwayat Nego/)).toBeVisible();
    // Teks yang sama ada di breadcrumb → scope ke heading halaman.
    await expect(riwayat.locator('.heading_1', { hasText: 'Riwayat Nego' })).toBeVisible();
    await expect(riwayat.getByText(/Jumlah Nego\s*:\s*Nego ke \d+/i)).toBeVisible();
    // Rule menamai "Konfirmasi Bidder"; UI "Konfirmasi Transporter".
    for (const kolom of ['Tanggal Nego', 'Nego Harga', 'Jumlah Nego', 'Konfirmasi Transporter', 'Harga Baru', 'Status Nego']) {
      await expect(riwayat.getByRole('columnheader', { name: new RegExp(`^${kolom}\\b`) })).toBeVisible();
    }
    const baris = riwayat.locator('table tbody tr').filter({ hasText: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/ });
    expect(await baris.count()).toBeGreaterThan(0);
    // Rule: tanggal DD/MM/YYYY HH:MM, nego harga rupiah, jumlah "Nego Ke N",
    // status nego.
    // Sel tabel ber-newline & indentasi mentah → jangkar butuh \s* (CLAUDE.md).
    const pertama = baris.first();
    await expect(pertama.locator('td').nth(0)).toHaveText(/^\s*\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\s*$/);
    await expect(pertama.locator('td').nth(1)).toHaveText(/^\s*Rp\. [\d.]+\s*$/);
    await expect(pertama.locator('td').nth(2)).toHaveText(/^\s*Nego Ke \d+\s*$/);
    await expect(pertama.locator('td').nth(5)).toHaveText(/^\s*(Waiting|Diterima|Ditolak|Negosiasi)\s*$/);
  });

  test('riwayat berstatus Waiting/Ditolak menampilkan strip pada konfirmasi dan/atau harga baru', async ({ page }) => {
    await page.goto(negoUrl);
    test.skip((await tungguBaris(page)) === 0, 'Tidak ada data nego pada demo');
    const barisNego = negoPage.barisData(page).filter({ hasText: /WAITING|DITOLAK/ });
    test.skip((await barisNego.count()) === 0, 'Tidak ada nego WAITING/DITOLAK pada halaman pertama');
    await barisNego.first().getByRole('link', { name: 'Detail', exact: true }).click();
    const riwayat = await bukaRiwayat(page);

    const waiting = riwayat.locator('table tbody tr').filter({ hasText: /Waiting\s*$/ });
    const ditolak = riwayat.locator('table tbody tr').filter({ hasText: /Ditolak\s*$/ });
    if ((await waiting.count()) > 0) {
      // Rule: status waiting → konfirmasi bidder "-" dan harga baru "-".
      await expect(waiting.first().locator('td').nth(3)).toHaveText('-');
      await expect(waiting.first().locator('td').nth(4)).toHaveText('-');
    }
    if ((await ditolak.count()) > 0) {
      // Rule: ditolak → konfirmasi terisi (DD/MM/YYYY HH:MM), harga baru "-".
      await expect(ditolak.first().locator('td').nth(3)).toHaveText(/^\s*\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\s*$/);
      await expect(ditolak.first().locator('td').nth(4)).toHaveText('-');
    }
    expect((await waiting.count()) + (await ditolak.count())).toBeGreaterThan(0);
  });
});
