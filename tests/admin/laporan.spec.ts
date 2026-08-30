import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Laporan — peran Administrator (project "admin", storageState
 * .auth/admin.json via project setup). Read-only.
 * Rule: docs/rules/administrator/10-laporan.md (Laporan Daftar History
 * Lelang, Laporan Logistik, Laporan Owner).
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - Menu LAPORAN admin punya TIGA submenu: /home/history_lelang, /home/
 *   laporanowner, /home/laporanlogistik (shipper hanya 2 — tanpa Laporan
 *   Owner). Ketiganya berbagi form: #tglawal, #tglakhir (jQuery datepicker +
 *   mask → isi via keyboard, fill() ditolak), select #BidOwnerID "Pilih
 *   Shipper" (WAJIB, khas admin), tombol #lanjutcari "Cari". Hint range:
 *   history & owner "Masukkan tanggal lelang (Maksimal range 90/31 hari)",
 *   logistik "Masukkan tanggal permintaan muat (Maksimal range 31 hari)".
 * - Submit menulis query ?tgl_awal=..&tgl_akhir=..&status_filter=1&BidOwnerID=..
 * - History Lelang: kolom Nomor Lelang | Tanggal Buka Lelang | Rute, ringkasan
 *   "Total : N Lelang", tombol Export Excel, label "Multidrop" pada rute
 *   multidrop.
 * - Laporan Owner: kolom "Nomor Lelang Tanggal Lelang", "Rute Pengiriman
 *   Periode Lelang", "Penawaran", "Harga Dipilih Nomor Order", "Transporter";
 *   ringkasan "Total : N Lelang, N Order"; Export Excel → /home/
 *   exportlaporanowner?tglawal=..; lelang tanpa penawaran → "0 Harga" & strip
 *   "-" pada harga dipilih/nomor order/transporter; link Detail → /home/
 *   detaillaporanowner/?OrderID=&LelangID=<id>&… memuat Shipper, Tanggal
 *   Lelang, Nomor Lelang, Rute, Jenis, Deskripsi Barang, Budget Pengiriman,
 *   Volume Unit, Buka/Tutup Lelang, Transporter Diundang/Respon, Penawaran
 *   Transporter, Harga Terendah/Tertinggi/Pemenang, Nomor Order, Transporter,
 *   Catatan Memilih + tombol Kembali (href kembali ke hasil pencarian).
 * - Laporan Logistik: kolom berpasangan "Nomor Lelang Nomer Order",
 *   "Transporter", "Rute ETD - ETA", "Nama Kapal Voyage", "Jumlah Unit Total
 *   Harga", "Permintaan Muat Tanggal Order"; ringkasan "Total : N Lelang, N
 *   Order, N Unit"; Export Excel → /home/exportlaporanlogistik?…; Detail →
 *   /home/detaillaporanlogistik/<hash> memuat TRACKING PENGIRIMAN (Kapal
 *   Berlayar, Kapal Sandar, SJ Diterima Agen; strip bila belum dikerjakan) +
 *   tabel Unit | Nomor Kontainer | Nomor Seal | Stuffing | Rencana Dooring |
 *   Dooring, serta Biaya Layanan.
 * - Shipper uji dipilih dinamis dari opsi ber-nama "Cipta Karya" (punya data
 *   lelang & order di demo); test skip bila opsi/hasil kosong.
 *
 * TIDAK dicakup: isi file excel export, perhitungan total & harga nego,
 * multidrop pada detail tracking (butuh order multidrop), urutan data.
 */

function formatTanggal(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

async function ketikTanggal(page: Page, selector: string, tanggal: string) {
  await page.locator(selector).click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(tanggal);
  await page.keyboard.press('Escape');
}

/** Pilih shipper demo yang punya data; null bila tak ada. */
async function pilihShipperUji(page: Page): Promise<string | null> {
  const value = await page.evaluate(() => {
    const sel = document.querySelector<HTMLSelectElement>('#BidOwnerID');
    const opt = [...(sel?.options ?? [])].find((o) => /Cipta Karya/i.test(o.text));
    return opt ? opt.value : null;
  });
  if (!value) return null;
  await page.selectOption('#BidOwnerID', value);
  return value;
}

/** Isi form + cari; kembalikan false bila shipper uji tidak tersedia. */
async function cari(page: Page, url: string, mundurHari: number): Promise<boolean> {
  await page.goto(url);
  const akhir = new Date();
  const awal = new Date();
  awal.setDate(awal.getDate() - mundurHari);
  await ketikTanggal(page, '#tglawal', formatTanggal(awal));
  await ketikTanggal(page, '#tglakhir', formatTanggal(akhir));
  if (!(await pilihShipperUji(page))) return false;
  await page.locator('#lanjutcari').click();
  await page.waitForURL(/BidOwnerID=\d+/, { timeout: 30_000 }).catch(() => {});
  return true;
}

const barisData = (page: Page) =>
  page.locator('table tbody tr').filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ });

/**
 * Label detail berpola `<div>Label <span>:</span></div>` dengan newline &
 * indentasi mentah — regex WAJIB memberi ruang \s* di kedua ujung (CLAUDE.md).
 */
const label = (page: Page, teks: string) =>
  page
    .getByText(new RegExp(`^\\s*${teks.replace(/[./()]/g, '\\$&')}\\s*:?\\s*$`))
    .filter({ visible: true })
    .first();

test.describe('Laporan Daftar History Lelang (Admin)', () => {
  test('form pencarian wajib memilih shipper dan berbatas range 90 hari', async ({ page }) => {
    await page.goto('/home/history_lelang');
    await expect(page.getByText(/Beranda\s*\/\s*Daftar History Lelang/)).toBeVisible();
    await expect(page.getByText('Masukkan tanggal lelang (Maksimal range 90 hari)')).toBeVisible();
    // Khas admin: pemilihan shipper (bid owner) wajib sebelum mencari.
    await expect(page.locator('label', { hasText: 'Shipper *' })).toBeVisible();
    await expect(page.locator('#BidOwnerID option').first()).toHaveText('Pilih Shipper');
    await expect(page.locator('#lanjutcari')).toHaveText(/Cari/);
  });

  test('hasil pencarian menampilkan total lelang, kolom, dan Export Excel', async ({ page }) => {
    test.skip(!(await cari(page, '/home/history_lelang', 89)), 'Shipper uji tidak tersedia di demo');
    const total = page.getByText(/Total\s*:\s*\d+ Lelang/);
    await total.waitFor({ timeout: 30_000 }).catch(() => {});
    test.skip((await total.count()) === 0, 'Tidak ada history lelang pada range 90 hari terakhir');

    await expect(total.first()).toBeVisible();
    // Header berupa <th><div>Label</div><div>ikon sortir</div></th> — nama
    // aksesibelnya tidak persis sama dengan label, jadi cocokkan dengan
    // jangkar awal, bukan exact.
    for (const kolom of ['Nomor Lelang', 'Tanggal Buka Lelang', 'Rute']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}`) }).first()).toBeVisible();
    }
    await expect(page.getByText('Export Excel').first()).toBeVisible();
    test.skip((await barisData(page).count()) === 0, 'Tidak ada baris lelang pada range yang dicari');
    // Rule: data lelang berdasarkan tanggal buatnya (format dd/mm/yyyy hh:mm).
    await expect(barisData(page).first().locator('td').nth(1)).toHaveText(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });

  test('rute multidrop ditandai label Multidrop', async ({ page }) => {
    test.skip(!(await cari(page, '/home/history_lelang', 89)), 'Shipper uji tidak tersedia di demo');
    await barisData(page).first().waitFor({ timeout: 30_000 }).catch(() => {});
    const multidrop = page.getByText('Multidrop', { exact: true }).filter({ visible: true });
    test.skip((await multidrop.count()) === 0, 'Tidak ada lelang multidrop pada range yang dicari');
    await expect(multidrop.first()).toBeVisible();
  });
});

test.describe('Laporan Owner (Admin)', () => {
  test('form pencarian berbatas range 31 hari dan wajib memilih shipper', async ({ page }) => {
    await page.goto('/home/laporanowner');
    await expect(page.getByText(/Beranda\s*\/\s*Laporan Owner/)).toBeVisible();
    await expect(page.getByText('Masukkan tanggal lelang (Maksimal range 31 hari)')).toBeVisible();
    await expect(page.locator('#BidOwnerID option').first()).toHaveText('Pilih Shipper');
  });

  test('hasil menampilkan total lelang & order, kolom laporan, dan Export Excel', async ({ page }) => {
    test.skip(!(await cari(page, '/home/laporanowner', 30)), 'Shipper uji tidak tersedia di demo');
    const total = page.getByText(/Total\s*:\s*\d+ Lelang, \d+ Order/);
    await total.waitFor({ timeout: 30_000 }).catch(() => {});
    test.skip((await total.count()) === 0, 'Tidak ada data laporan owner pada range 31 hari terakhir');

    await expect(total.first()).toBeVisible();
    for (const kolom of [
      'Nomor Lelang Tanggal Lelang',
      'Rute Pengiriman Periode Lelang',
      'Penawaran',
      'Harga Dipilih Nomor Order',
      'Transporter',
    ]) {
      await expect(page.getByRole('columnheader', { name: kolom, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Export Excel' })).toHaveAttribute('href', /\/home\/exportlaporanowner\?tglawal=/);
  });

  test('lelang tanpa penawaran tampil dengan 0 harga dan strip pada harga dipilih/nomor order/transporter', async ({ page }) => {
    test.skip(!(await cari(page, '/home/laporanowner', 30)), 'Shipper uji tidak tersedia di demo');
    await barisData(page).first().waitFor({ timeout: 30_000 }).catch(() => {});
    const tanpaPenawaran = barisData(page).filter({ hasText: /0 Harga/ });
    test.skip((await tanpaPenawaran.count()) === 0, 'Tidak ada lelang tanpa penawaran pada range yang dicari');
    const baris = tanpaPenawaran.first();
    await expect(baris.locator('td').nth(2)).toHaveText(/0 Harga/);
    await expect(baris.locator('td').nth(3)).toContainText('-');
    await expect(baris.locator('td').nth(4)).toContainText('-');
  });

  test('detail laporan owner memuat data lelang, statistik bidder, dan harga; Kembali menuju hasil pencarian', async ({ page }) => {
    test.skip(!(await cari(page, '/home/laporanowner', 30)), 'Shipper uji tidak tersedia di demo');
    const detail = page.getByRole('link', { name: 'Detail', exact: true });
    await detail.first().waitFor({ timeout: 30_000 }).catch(() => {});
    test.skip((await detail.count()) === 0, 'Tidak ada data laporan owner pada range yang dicari');

    await detail.first().click();
    await expect(page).toHaveURL(/\/home\/detaillaporanowner\/\?OrderID=.*LelangID=\d+/);
    await expect(page.getByText(/Beranda\s*\/\s*Laporan Owner\s*\/\s*Detail Data Lelang/)).toBeVisible();
    for (const teks of [
      'Shipper',
      'Tanggal Lelang',
      'Nomor Lelang',
      'Rute',
      'Jenis',
      'Deskripsi Barang',
      'Budget Pengiriman',
      'Volume Unit',
      'Buka Lelang',
      'Tutup Lelang',
      'Transporter Diundang',
      'Transporter Respon',
      'Penawaran Transporter',
      'Harga Terendah',
      'Harga Tertinggi',
      'Harga Pemenang',
      'Nomor Order',
      'Catatan Memilih',
    ]) {
      await expect(label(page, teks)).toBeVisible();
    }
    // Rule: bidder diundang/respon = jumlah transporter; harga 0 rupiah bila
    // belum ada penawaran/pemenang.
    await expect(page.getByText(/\d+ Transporter/).first()).toBeVisible();
    await expect(page.getByText(/Rp\. [\d.]+/).first()).toBeVisible();
    // Rule: tombol Kembali menuju hasil pencarian laporan owner sebelumnya.
    await expect(page.getByRole('link', { name: 'Kembali' })).toHaveAttribute('href', /\/home\/laporanowner\?.*tgl_awal=/);
  });
});

test.describe('Laporan Logistik (Admin)', () => {
  // Halaman ini sporadis lambat dimuat di server demo (goto pernah >60 dtk).
  test.slow();

  test('form pencarian memakai tanggal permintaan muat berbatas 31 hari', async ({ page }) => {
    await page.goto('/home/laporanlogistik');
    await expect(page.getByText(/Beranda\s*\/\s*Laporan Logistik/)).toBeVisible();
    await expect(page.getByText('Masukkan tanggal permintaan muat (Maksimal range 31 hari)')).toBeVisible();
    await expect(page.locator('#BidOwnerID option').first()).toHaveText('Pilih Shipper');
  });

  test('hasil menampilkan total lelang/order/unit, kolom berpasangan, dan Export Excel', async ({ page }) => {
    test.skip(!(await cari(page, '/home/laporanlogistik', 30)), 'Shipper uji tidak tersedia di demo');
    const total = page.getByText(/Total\s*:\s*\d+ Lelang, \d+ Order, \d+ Unit/);
    await total.waitFor({ timeout: 30_000 }).catch(() => {});
    test.skip((await total.count()) === 0, 'Tidak ada order tervalidasi pada range 31 hari terakhir');

    await expect(total.first()).toBeVisible();
    for (const kolom of [
      'Nomor Lelang Nomer Order',
      'Transporter',
      'Rute ETD - ETA',
      'Nama Kapal Voyage',
      'Jumlah Unit Total Harga',
      'Permintaan Muat Tanggal Order',
    ]) {
      await expect(page.getByRole('columnheader', { name: kolom, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Export Excel' })).toHaveAttribute('href', /\/home\/exportlaporanlogistik\?tglawal=/);
    // Rule: harga = harga satuan x jumlah unit.
    await expect(barisData(page).first().locator('td').nth(4)).toHaveText(/\d+x .+Rp\. [\d.]+/s);
  });

  test('detail laporan logistik memuat tahapan tracking dan data unit (kontainer & seal)', async ({ page }) => {
    test.skip(!(await cari(page, '/home/laporanlogistik', 30)), 'Shipper uji tidak tersedia di demo');
    const detail = page.getByRole('link', { name: 'Detail', exact: true });
    await detail.first().waitFor({ timeout: 30_000 }).catch(() => {});
    test.skip((await detail.count()) === 0, 'Tidak ada order tervalidasi pada range yang dicari');

    await detail.first().click();
    await expect(page).toHaveURL(/\/home\/detaillaporanlogistik\/.+/);
    await expect(page.getByText(/Beranda\s*\/\s*Laporan Logistik\s*\/\s*Detail Laporan Logistik/)).toBeVisible();
    for (const teks of ['Shipper', 'Tanggal Order', 'Nomor Order', 'Nomor Lelang', 'Transporter', 'Rute', 'Kapal / Voyage', 'Tgl. Permintaan Muat', 'Jumlah Unit', 'Total Harga', 'Biaya Layanan']) {
      await expect(label(page, teks)).toBeVisible();
    }
    // Rule: tahapan tracking; strip bila belum/tidak dikerjakan. Tahap per
    // unit (stuffing, rencana dooring, dooring) ada di tabel unit.
    await expect(page.getByText('TRACKING PENGIRIMAN')).toBeVisible();
    for (const tahap of ['Kapal Berlayar', 'Kapal Sandar', 'SJ Diterima Agen']) {
      await expect(page.getByText(new RegExp(`${tahap}\\s*:?`)).first()).toBeVisible();
    }
    for (const kolom of ['Unit', 'Nomor Kontainer', 'Nomor Seal', 'Stuffing', 'Rencana Dooring', 'Dooring']) {
      await expect(page.getByRole('columnheader', { name: kolom, exact: true })).toBeVisible();
    }
    // Di halaman ini "Kembali" berupa LINK (kembali ke hasil pencarian),
    // bukan button seperti pada detail laporan owner.
    await expect(page.getByRole('link', { name: 'Kembali' })).toHaveAttribute('href', /\/home\/laporanlogistik\?/);
  });
});
