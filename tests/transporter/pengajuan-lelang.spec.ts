import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Pengajuan Lelang — peran Bidder/Transporter (project "transporter",
 * storageState .auth/transporter.json via project setup)
 * Rule: docs/rules/bidder/06-pengajuan-lelang.md (daftar + detail; read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-20 via playwright-cli (login form —
 * state-load CLI ditolak server karena sesi terikat User-Agent):
 * - "/" untuk transporter login redirect ke /lelang/listlelang?tab=semua-lelang
 *   (rule: Beranda bidder = daftar pengajuan lelang). Breadcrumb "Beranda"
 *   berupa SPAN, bukan link — sesuai rule (disable).
 * - 6 tab (urutan UI): Semua Lelang, Perlu Input Harga, Perlu Update Harga,
 *   Lelang Tutup, Telah Akhir Kirim, Lelang Batal. Slug = nama di-kebab-case.
 *   Tab aktif class `btn-tabs-active`, lainnya `btn-tabs` (sama dgn shipper).
 * - Kolom: No, Shipper, Nomor Lelang, Buka Lelang, Tutup Lelang, Rencana
 *   Mulai Kirim, Rencana Akhir Kirim, Aksi. Keterangan bawah judul:
 *   "*) Merah = perlu input harga, # adalah request harga".
 * - Nomor lelang "merah" = computed color rgb(255, 0, 0) pada sel td ke-3
 *   (tanpa class khusus; warna dari CSS baris) — diassert via toHaveCSS.
 * - Baris dimuat async + tbody menyisipkan baris filler kosong pertama
 *   (colspan=8) → filter baris yang punya button.btn_action_menu.
 *   Tab kosong menampilkan teks "Tidak Ada Data yang Tersedia".
 * - Menu aksi (terverifikasi di semua tab berdata): link "Detail Pengajuan
 *   Lelang" (/lelang/detaillistLelang/<id>) + SPAN "Input Harga Penawaran".
 *   Tab perlu-update-harga tanpa data saat kalibrasi → item "Menuju Request
 *   Harga" belum terverifikasi (test skip bila kosong).
 * - Detail: heading DOM "Detail Pengajuan Lelang" (tampil kapital via CSS
 *   text-transform — jangan assert teks kapital selain status). Tombol input
 *   harga bernama "Tambah Harga Penawaran" (link /home/tambahharga?no_lelang=
 *   <id>); saat lelang tutup elemennya tetap di DOM namun HIDDEN (rule:
 *   "hilang"). Catatan merah "(Belum memasukkan harga penawaran)"
 *   (div.ketbelumadapenawaran). Daftar harga kosong = teks "Belum ada harga
 *   yang diinputkan" (rule menulis "di inputkan"). Kontak/nomor PIC Muat
 *   tidak dirender untuk bidder; PIC Tempat Tujuan tetap tampil.
 * - Dokumen aanwijzing: span.modalwizing membuka modal .modal-lg-aanwijzing;
 *   handler di-bind terlambat (lihat defect #6 CLAUDE.md) → klik pakai
 *   pola retry toPass, sama seperti spec shipper.
 *
 * Rule yang TIDAK dicakup (butuh mutasi / kondisi data spesifik):
 * - Input/update harga penawaran & Menuju Request Harga (mutasi).
 * - Perpindahan lelang antar tab berdasarkan tanggal (butuh kontrol waktu).
 * - Tombol "kapal connecting nx" (butuh harga dengan jadwal connecting —
 *   tidak ada di data demo saat kalibrasi).
 * - Spreadsheet keaktifan bidder (di luar aplikasi web).
 */

const listUrl = '/lelang/listlelang';

const TABS: Array<{ nama: string; slug: string }> = [
  { nama: 'Semua Lelang', slug: 'semua-lelang' },
  { nama: 'Perlu Input Harga', slug: 'perlu-input-harga' },
  { nama: 'Perlu Update Harga', slug: 'perlu-update-harga' },
  { nama: 'Lelang Tutup', slug: 'lelang-tutup' },
  { nama: 'Telah Akhir Kirim', slug: 'telah-akhir-kirim' },
  { nama: 'Lelang Batal', slug: 'lelang-batal' },
];

/** Menu aksi per tab sesuai rule (perlu-update-harga beda sendiri). */
const MENU_PER_TAB: Array<{ slug: string; item: string[] }> = [
  { slug: 'perlu-input-harga', item: ['Detail Pengajuan Lelang', 'Input Harga Penawaran'] },
  { slug: 'perlu-update-harga', item: ['Detail Pengajuan Lelang', 'Menuju Request Harga'] },
  { slug: 'lelang-tutup', item: ['Detail Pengajuan Lelang', 'Input Harga Penawaran'] },
  { slug: 'telah-akhir-kirim', item: ['Detail Pengajuan Lelang', 'Input Harga Penawaran'] },
  { slug: 'lelang-batal', item: ['Detail Pengajuan Lelang', 'Input Harga Penawaran'] },
];

const listPage = {
  tab: (page: Page, nama: string) => page.getByRole('link', { name: nama, exact: true }),
  aksiButtons: (page: Page) => page.locator('table tbody button.btn_action_menu'),
  barisData: (page: Page) =>
    page.locator('table tbody tr').filter({ has: page.locator('button.btn_action_menu') }),
};

/** Baris data dimuat async — kembalikan jumlah tombol aksi (0 = tanpa data). */
async function tungguBarisData(page: Page): Promise<number> {
  await listPage.aksiButtons(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  return listPage.aksiButtons(page).count();
}

test.describe('Daftar Pengajuan Lelang (Bidder)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(listUrl);
  });

  test('halaman default redirect ke tab Semua Lelang dengan tab tersebut aktif', async ({ page }) => {
    await expect(page).toHaveURL(/\?tab=semua-lelang$/);
    await expect(listPage.tab(page, 'Semua Lelang')).toHaveClass(/btn-tabs-active/);
  });

  test('Beranda pada breadcrumb nonaktif dan mengarah ke daftar pengajuan lelang', async ({ page }) => {
    // Rule: Beranda bidder di-disable karena tujuannya halaman ini sendiri.
    // Match regex TIDAK menormalkan whitespace — teks mentah breadcrumb
    // berspasi ganda/baris baru, jadi pakai \s* di sekitar pemisah.
    await expect(page.getByText(/Beranda\s*\/\s*Daftar Pengajuan Lelang/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Beranda' })).toHaveCount(0);
    // Redirect root "/" bagi bidder login = halaman daftar pengajuan lelang.
    await page.goto('/');
    await expect(page).toHaveURL(/\/lelang\/listlelang\?tab=semua-lelang$/);
  });

  test('keenam tab pengelompokan lelang tampil dengan link yang benar', async ({ page }) => {
    for (const { nama, slug } of TABS) {
      await expect(listPage.tab(page, nama)).toHaveAttribute('href', new RegExp(`\\?tab=${slug}$`));
    }
  });

  test('klik tab lain memindahkan tab aktif', async ({ page }) => {
    await listPage.tab(page, 'Perlu Input Harga').click();
    await expect(page).toHaveURL(/\?tab=perlu-input-harga$/);
    await expect(listPage.tab(page, 'Perlu Input Harga')).toHaveClass(/btn-tabs-active/);
    await expect(listPage.tab(page, 'Semua Lelang')).not.toHaveClass(/btn-tabs-active/);
  });

  test('tabel menampilkan kolom sisi bidder beserta keterangan penanda merah dan #', async ({ page }) => {
    for (const kolom of [
      'No',
      'Shipper',
      'Nomor Lelang',
      'Buka Lelang',
      'Tutup Lelang',
      'Rencana Mulai Kirim',
      'Rencana Akhir Kirim',
      'Aksi',
    ]) {
      // Accessible name header diakhiri glyph ikon sortir dan "No" adalah
      // substring "Nomor Lelang" — jangkar awal + \b (pola sama dgn shipper).
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}\\b`) })).toBeVisible();
    }
    await expect(page.getByText('*) Merah = perlu input harga, # adalah request harga')).toBeVisible();
  });

  for (const { slug, item } of MENU_PER_TAB) {
    test(`menu aksi tab ${slug} memuat: ${item.join(', ')}`, async ({ page }) => {
      await page.goto(`${listUrl}?tab=${slug}`);
      const jumlahBaris = await tungguBarisData(page);
      test.skip(jumlahBaris === 0, `Tidak ada data lelang di tab ${slug} pada akun demo`);

      await listPage.aksiButtons(page).first().click();
      const menu = listPage.barisData(page).first().locator('.dropdown-menu');
      for (const nama of item) {
        await expect(menu.getByText(nama)).toBeVisible();
      }
      await expect(menu.getByRole('link', { name: 'Detail Pengajuan Lelang' })).toHaveAttribute(
        'href',
        /\/lelang\/detaillistLelang\/\d+$/,
      );
    });
  }

  test('nomor lelang yang belum diinput harga berwarna merah di tab Perlu Input Harga', async ({ page }) => {
    await page.goto(`${listUrl}?tab=perlu-input-harga`);
    const jumlahBaris = await tungguBarisData(page);
    test.skip(jumlahBaris === 0, 'Tidak ada data di tab Perlu Input Harga pada akun demo');

    // Kolom Nomor Lelang = sel ke-3; warna dari CSS baris, tanpa class penanda.
    const selNomor = listPage.barisData(page).first().locator('td').nth(2);
    await expect(selNomor).toHaveCSS('color', 'rgb(255, 0, 0)');
  });

  test('lelang yang pernah diajukan request harga bertanda (#n) di nomor lelang', async ({ page }) => {
    const jumlahBaris = await tungguBarisData(page);
    test.skip(jumlahBaris === 0, 'Tidak ada data lelang di akun demo');

    const bertanda = listPage.barisData(page).filter({ hasText: /\(#\d+\)/ });
    test.skip((await bertanda.count()) === 0, 'Tidak ada lelang dengan riwayat request harga di akun demo');
    await expect(bertanda.first()).toBeVisible();
  });
});

test.describe('Detail Pengajuan Lelang (Bidder)', () => {
  /** Buka detail lelang pertama dari tab tertentu; false bila tab kosong. */
  async function bukaDetailDariTab(page: Page, slug: string): Promise<boolean> {
    await page.goto(`${listUrl}?tab=${slug}`);
    if ((await tungguBarisData(page)) === 0) return false;

    await listPage.aksiButtons(page).first().click();
    await page.getByRole('link', { name: 'Detail Pengajuan Lelang' }).first().click();
    await expect(page).toHaveURL(/\/lelang\/detaillistLelang\/\d+$/);
    return true;
  }

  test('menampilkan status lelang dan bagian utama detail', async ({ page }) => {
    test.skip(!(await bukaDetailDariTab(page, 'semua-lelang')), 'Tidak ada data lelang di akun demo');

    await expect(page.getByText(/^(BELUM BUKA|LELANG DIBUKA|LELANG DITUTUP|LELANG BATAL)$/).first()).toBeVisible();
    await expect(page.getByText('Status Lelang')).toBeVisible();
    // Label = <div>Shipper <span>:</span></div> — exact/anchored gagal karena
    // ":" ikut dalam teks elemen; substring "Shipper" unik di halaman ini.
    await expect(page.getByText('Shipper')).toBeVisible();
    await expect(page.getByText('Dokumen Aanwijzing')).toBeVisible();
  });

  test('lelang belum tutup: tombol Tambah Harga Penawaran tampil menuju halaman Tambah Harga', async ({ page }) => {
    test.skip(
      !(await bukaDetailDariTab(page, 'perlu-input-harga')),
      'Tidak ada data di tab Perlu Input Harga pada akun demo',
    );

    const tombol = page.getByRole('link', { name: 'Tambah Harga Penawaran' });
    await expect(tombol).toBeVisible();
    await expect(tombol).toHaveAttribute('href', /\/home\/tambahharga\?no_lelang=\d+$/);
  });

  test('lelang tutup: tombol Tambah Harga Penawaran hilang', async ({ page }) => {
    test.skip(!(await bukaDetailDariTab(page, 'lelang-tutup')), 'Tidak ada data di tab Lelang Tutup pada akun demo');

    // Elemen tetap ada di DOM namun disembunyikan — rule: "tombol akan hilang".
    await expect(page.getByRole('link', { name: 'Tambah Harga Penawaran' })).toBeHidden();
  });

  test('belum ada harga penawaran: catatan merah dan keterangan daftar kosong tampil', async ({ page }) => {
    // Baris di tab Perlu Input Harga berstatus harga "Belum Input Penawaran".
    test.skip(
      !(await bukaDetailDariTab(page, 'perlu-input-harga')),
      'Tidak ada data di tab Perlu Input Harga pada akun demo',
    );

    await expect(page.getByText('(Belum memasukkan harga penawaran)')).toBeVisible();
    await expect(page.getByText('Belum ada harga yang diinputkan')).toBeVisible();
  });

  test('kontak dan nomor PIC muat disembunyikan dari bidder', async ({ page }) => {
    test.skip(!(await bukaDetailDariTab(page, 'semua-lelang')), 'Tidak ada data lelang di akun demo');

    // Rule: kontak pic muat & nomor pic muat dihidden pada sisi bidder.
    // PIC Tempat Tujuan tetap tampil — pembanding bahwa halaman utuh termuat.
    await expect(page.getByText('PIC Tempat Tujuan').first()).toBeVisible();
    await expect(page.getByText(/PIC Muat/i)).toHaveCount(0);
  });

  test('dokumen aanwijzing tampil sesuai nama dokumen dan dibuka sebagai popup', async ({ page }) => {
    // Handler klik span.modalwizing di-bind terlambat (defect #6 CLAUDE.md) —
    // klik dini tertelan diam-diam, sehingga klik di-retry via toPass
    // (pola sama dengan spec shipper pasca-investigasi 2026-08-20).
    test.setTimeout(120_000);

    test.skip(!(await bukaDetailDariTab(page, 'semua-lelang')), 'Tidak ada data lelang di akun demo');

    await expect(page.getByText('Dokumen Aanwijzing')).toBeVisible();
    const namaDokumen = page.locator('span.modalwizing');
    test.skip((await namaDokumen.count()) === 0, 'Lelang pertama tidak punya dokumen aanwijzing aktif');

    const dialog = page.locator('.modal-lg-aanwijzing');
    await expect(async () => {
      if (!(await dialog.isVisible())) {
        await namaDokumen.first().click({ timeout: 2_000 });
      }
      await expect(dialog).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 90_000 });
    await expect(dialog.getByText('LIHAT DOKUMEN')).toBeVisible();
  });
});
