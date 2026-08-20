import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Pengajuan Lelang — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/08-pengajuan-lelang.md (daftar + detail;
 * scope read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - /lelang/listlelang auto-redirect ke ?tab=semua-lelang; tab aktif
 *   ditandai class `btn-tabs-active`, tab lain `btn-tabs`. Kelima tab
 *   berupa link dengan query ?tab=<slug>.
 * - Baris tabel dimuat async setelah render awal (ada baris kosong filler
 *   di tbody) — tunggu tombol aksi baris pertama sebelum menghitung.
 * - Tombol aksi per baris: button.btn_action_menu (ikon tanpa accessible
 *   name); item menunya campuran <a class="dropdown-item"> dan <span>
 *   ("Batalkan Lelang" adalah SPAN pembuka modal, bukan link).
 * - Item menu di UI bernama "History Request Harga" — dokumen rule memakai
 *   dua istilah bergantian ("History Update Harga" di daftar aksi,
 *   "History Request Harga" di bagian khususnya); bukan defect, hanya
 *   inkonsistensi penamaan di rule.
 * - "Minta Update Harga" muncul KONDISIONAL (tergantung status request
 *   harga berjalan) — tidak diassert karena butuh kondisi data spesifik.
 * - Penanda "(#n)" tampil di sebelah nomor lelang yang pernah diajukan
 *   request harga (terverifikasi ada di data demo: "LELANG0004 (#1)").
 * - Detail pengajuan lelang: card status ("LELANG DITUTUP" dst.),
 *   "Penawaran : X dari Y", tabel bidder dengan kolom status harga, dan
 *   "Dokumen Aanwijzing" berupa span.modalwizing yang membuka modal
 *   "LIHAT DOKUMEN" (rule: aanwijzing ditampilkan berupa popup).
 *
 * Rule yang TIDAK dicakup di sini (butuh mutasi / kondisi data spesifik):
 * - Buat Lelang Pengiriman + Pilih Peserta Lelang (mutasi: membuat lelang
 *   baru di akun demo — modul form besar, digarap terpisah).
 * - Batalkan Lelang & Request Harga (mutasi permanen pada lelang demo).
 * - Perpindahan lelang antar tab berdasarkan tanggal tutup/akhir kirim
 *   (butuh kontrol waktu server).
 * - Nomor lelang berwarna hijau (butuh lelang lewat akhir kirim + ada harga
 *   tanpa order — kondisi data yang tidak bisa dijamin).
 */

const listUrl = '/lelang/listlelang';

const TABS: Array<{ nama: string; slug: string }> = [
  { nama: 'Semua Lelang', slug: 'semua-lelang' },
  { nama: 'Lelang Tersedia', slug: 'lelang-tersedia' },
  { nama: 'Lelang Diproses', slug: 'lelang-diproses' },
  { nama: 'Telah Akhir Kirim', slug: 'telah-akhir-kirim' },
  { nama: 'Lelang Batal', slug: 'lelang-batal' },
];

const listPage = {
  tab: (page: Page, nama: string) => page.getByRole('link', { name: nama, exact: true }),
  buatLelang: (page: Page) => page.getByRole('button', { name: ' Buat Pengajuan Lelang' }),
  aksiButtons: (page: Page) => page.locator('table tbody button.btn_action_menu'),
};

/** Baris data dimuat async — kembalikan jumlah tombol aksi (0 = tanpa data). */
async function tungguBarisData(page: Page): Promise<number> {
  await listPage.aksiButtons(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  return listPage.aksiButtons(page).count();
}

test.describe('Daftar Pengajuan Lelang', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(listUrl);
  });

  test('halaman default redirect ke tab Semua Lelang dengan tab tersebut aktif', async ({ page }) => {
    await expect(page).toHaveURL(/\?tab=semua-lelang$/);
    await expect(listPage.tab(page, 'Semua Lelang')).toHaveClass(/btn-tabs-active/);
  });

  test('kelima tab pengelompokan lelang tampil dengan link yang benar', async ({ page }) => {
    for (const { nama, slug } of TABS) {
      await expect(listPage.tab(page, nama)).toHaveAttribute('href', new RegExp(`\\?tab=${slug}$`));
    }
  });

  test('klik tab lain memindahkan tab aktif', async ({ page }) => {
    await listPage.tab(page, 'Lelang Tersedia').click();
    await expect(page).toHaveURL(/\?tab=lelang-tersedia$/);
    await expect(listPage.tab(page, 'Lelang Tersedia')).toHaveClass(/btn-tabs-active/);
    await expect(listPage.tab(page, 'Semua Lelang')).not.toHaveClass(/btn-tabs-active/);
  });

  test('tabel menampilkan kolom sesuai rule beserta keterangan penanda hijau dan #', async ({ page }) => {
    for (const kolom of [
      'No',
      'Nomor Lelang',
      'Buka Lelang',
      'Tutup Lelang',
      'Rencana Mulai Kirim',
      'Rencana Akhir Kirim',
      'Transporter',
      'Aksi',
    ]) {
      // Accessible name header diakhiri glyph ikon sortir (karakter
      // private-use, bukan spasi) dan "No" adalah substring "Nomor Lelang" —
      // jangkar awal + \b memastikan match kolom yang tepat.
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}\\b`) })).toBeVisible();
    }
    await expect(page.getByText('*) Hijau = lelang tidak ada order, # adalah request harga')).toBeVisible();
  });

  test('tombol Buat Pengajuan Lelang mengarah ke halaman buat lelang', async ({ page }) => {
    const link = page.getByRole('link').filter({ has: listPage.buatLelang(page) });
    await expect(link).toHaveAttribute('href', /\/lelang\/buatlelang$/);
  });

  test('menu aksi baris memuat Detail Pengajuan Lelang, Lihat Harga Penawaran, dan Batalkan Lelang', async ({
    page,
  }) => {
    const jumlahBaris = await tungguBarisData(page);
    test.skip(jumlahBaris === 0, 'Tidak ada data lelang di akun demo');

    await listPage.aksiButtons(page).first().click();
    const barisPertama = page
      .locator('table tbody tr')
      .filter({ has: page.locator('button.btn_action_menu') })
      .first();
    const menu = barisPertama.locator('.dropdown-menu');
    await expect(menu.getByText('Detail Pengajuan Lelang')).toBeVisible();
    await expect(menu.getByText('Lihat Harga Penawaran')).toBeVisible();
    await expect(menu.getByText('Batalkan Lelang')).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Detail Pengajuan Lelang' })).toHaveAttribute(
      'href',
      /\/lelang\/detaillistLelang\/\d+$/,
    );
  });

  test('lelang yang pernah diajukan request harga bertanda (#n) di nomor lelang', async ({ page }) => {
    const jumlahBaris = await tungguBarisData(page);
    test.skip(jumlahBaris === 0, 'Tidak ada data lelang di akun demo');

    const bertanda = page.locator('table tbody tr').filter({ hasText: /\(#\d+\)/ });
    test.skip((await bertanda.count()) === 0, 'Tidak ada lelang dengan riwayat request harga di akun demo');
    await expect(bertanda.first()).toBeVisible();
  });
});

test.describe('Detail Pengajuan Lelang', () => {
  /** Buka halaman detail lelang pertama dari daftar; null jika tanpa data. */
  async function bukaDetailPertama(page: Page): Promise<Locator | null> {
    await page.goto(listUrl);
    await listPage.aksiButtons(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
    if ((await listPage.aksiButtons(page).count()) === 0) return null;

    await listPage.aksiButtons(page).first().click();
    const detailLink = page.getByRole('link', { name: 'Detail Pengajuan Lelang' }).first();
    await detailLink.click();
    return page.locator('body');
  }

  test('menampilkan status lelang, jumlah penawaran, dan status harga tiap bidder', async ({ page }) => {
    test.skip((await bukaDetailPertama(page)) === null, 'Tidak ada data lelang di akun demo');

    await expect(page.getByText(/^(BELUM BUKA|LELANG DIBUKA|LELANG DITUTUP|LELANG BATAL)$/).first()).toBeVisible();
    await expect(page.getByText(/Penawaran : \d+ dari \d+/).first()).toBeVisible();
    // Status harga per bidder (rule): salah satu dari 3 nilai berikut.
    await expect(
      page.getByText(/^(Belum Input Penawaran|Telah Input Harga|Telah Input Penawaran)$/).first(),
    ).toBeVisible();
  });

  test('dokumen aanwijzing tampil sesuai nama dokumen dan dibuka sebagai popup', async ({ page }) => {
    // Popup ini memuat library PDF.js Express pihak ketiga (WASM, domain
    // auth.pdfjs.express) untuk preview dokumen SEBELUM modal ditampilkan —
    // modal tidak muncul kalau resource itu diblokir (dicoba & terbukti
    // salah 2026-08-14: blocking route PDFView/pdfjs.express membuat modal
    // tidak pernah muncul sama sekali, jadi bukan pilihan). Durasinya TIDAK
    // konsisten — pernah ~10 detik, pernah >60 detik pada regresi yang
    // sama tanpa perubahan kode — kemungkinan bergantung pada latensi
    // layanan pihak ketiga tsb, di luar kendali test ini. Timeout 90s
    // adalah upaya wajar terakhir; jika masih gagal sesekali di regresi,
    // itu bukan regresi kode, cukup jalankan ulang.
    test.setTimeout(120_000);

    test.skip((await bukaDetailPertama(page)) === null, 'Tidak ada data lelang di akun demo');

    await expect(page.getByText('Dokumen Aanwijzing')).toBeVisible();
    const namaDokumen = page.locator('span.modalwizing');
    test.skip((await namaDokumen.count()) === 0, 'Lelang pertama tidak punya dokumen aanwijzing aktif');

    await namaDokumen.first().click();
    const dialog = page.locator('.modal-lg-aanwijzing');
    await expect(dialog).toBeVisible({ timeout: 90_000 });
    await expect(dialog.getByText('LIHAT DOKUMEN')).toBeVisible();
  });
});
