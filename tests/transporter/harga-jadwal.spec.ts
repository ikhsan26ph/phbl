import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Harga & Jadwal — peran Bidder/Transporter (project "transporter")
 * Rule: docs/rules/bidder/10-harga-jadwal.md (halaman daftar; read-only)
 *
 * Kalibrasi ke halaman asli 2026-08-20 via playwright-cli (login form):
 * - URL /home/hargajadwal; tanpa query redirect ke ?tab=1. Tab numerik:
 *   1=Semua Harga & Jadwal, 2=Butuh Jadwal Kapal, 3=Perlu Update Harga,
 *   4=Sudah Lengkap, 5=Request Jadwal. Tab aktif class `btn_tab_aktif`.
 *   Rule hanya mendaftar 4 tab — "Request Jadwal" ada di UI dan aksinya
 *   diatur rule (inkonsistensi dokumen, bukan defect).
 *   Setiap tombol tab DUPLIKAT di DOM (layout desktop + mobile) → pakai
 *   .first() pada locator tab.
 * - Kolom: Nomor Lelang, Rute, Pelayaran, Jenis, Harga (Rp.), Mulai
 *   Berlaku, Aksi.
 * - Baris "merah" (harga belum ada jadwal, tab 2) = computed color
 *   rgb(249, 73, 81) pada sel; baris normal rgb(73, 80, 87).
 * - Aksi baris tab 1/2/4: a.view-detail (ikon mata, TANPA accessible
 *   name/title — usulan data-testid ke developer), button[title="Edit
 *   Harga"], button[title="Hapus Harga"], button[title="Menu Jadwal"]
 *   yang menaungi dropdown berisi link "Tambah Jadwal" dan "Lihat Jadwal"
 *   (href /home/masterjadwal1/<hash>) — rule: "Lihat & tambah jadwal".
 * - Aksi baris tab 5: a.updatejadwal ber-title "Update" (hanya pada harga
 *   yang belum direspon — 4 dari 20 baris saat kalibrasi; yang sudah
 *   direspon TANPA tombol Update, sesuai rule), a.view-detail, dan ikon
 *   "Lihat Jadwal" (di tab ini TANPA teks node — hanya tooltip via
 *   data-original-title; beda dari dropdown Menu Jadwal di tab 1/2/4 yang
 *   "Lihat Jadwal"-nya berupa teks link biasa).
 * - Tanda "(#n)" hasil respon update harga berada di kolom Harga (sel
 *   ke-5), contoh data demo: "4.230.000 (#1) (EXPIRED)".
 * - Tab kosong: teks "Tidak Ada Data yang tersedia" ("tersedia" huruf
 *   kecil — beda dengan "Tersedia" di daftar pengajuan lelang).
 * - Klik a.view-detail TIDAK memunculkan modal sampai 12 dtk pada
 *   kalibrasi (indikasi late-binding yang sama dgn defect #6) — isi popup
 *   Detail Harga tidak diassert di sini.
 *
 * Rule yang TIDAK dicakup (butuh mutasi / kondisi data spesifik):
 * - Semua alur tambah/edit/hapus/update harga & jadwal (mutasi).
 * - Tombol Update disabled (expired / lewat akhir kirim / ada request
 *   baru / harga dihapus admin) — tidak ada datanya di demo saat kalibrasi.
 * - Info "Request Harga" pada popup detail harga ber-tanda # (popup tidak
 *   terbuka saat kalibrasi, lihat catatan di atas).
 * - Perpindahan data antar tab & perilaku filter/reset pasca-aksi.
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
  /** Tombol tab duplikat (desktop+mobile) — ambil instance pertama. */
  tab: (page: Page, nama: string) => page.getByRole('link', { name: nama, exact: true }).first(),
  /** Baris data = tr yang punya tombol detail (menyaring baris filler). */
  barisData: (page: Page) =>
    page.locator('table tbody tr').filter({ has: page.locator('a.view-detail') }),
};

/** Baris dimuat async — tunggu baris data pertama; 0 = tab tanpa data. */
async function tungguBarisData(page: Page): Promise<number> {
  await listPage.barisData(page).first().waitFor({ timeout: 10_000 }).catch(() => {});
  return listPage.barisData(page).count();
}

/** Tombol aksi baris: title asli atau data-original-title (pasca-init tooltip). */
function tombolAksi(baris: Locator, judul: string): Locator {
  return baris.locator(`[title="${judul}"], [data-original-title="${judul}"]`);
}

test.describe('Daftar Harga & Jadwal (Bidder)', () => {
  test('halaman default redirect ke tab Semua Harga & Jadwal dengan tab tersebut aktif', async ({ page }) => {
    await page.goto(listUrl);
    await expect(page).toHaveURL(/\/home\/hargajadwal\?tab=1$/);
    await expect(listPage.tab(page, 'Semua Harga & Jadwal')).toHaveClass(/btn_tab_aktif/);
  });

  test('kelima tab pengelompokan harga tampil dengan link yang benar', async ({ page }) => {
    await page.goto(listUrl);
    for (const { nama, tab } of TABS) {
      await expect(listPage.tab(page, nama)).toHaveAttribute('href', new RegExp(`\\?tab=${tab}$`));
    }
  });

  test('klik tab lain memindahkan tab aktif', async ({ page }) => {
    await page.goto(listUrl);
    await listPage.tab(page, 'Butuh Jadwal Kapal').click();
    await expect(page).toHaveURL(/\?tab=2$/);
    await expect(listPage.tab(page, 'Butuh Jadwal Kapal')).toHaveClass(/btn_tab_aktif/);
    await expect(listPage.tab(page, 'Semua Harga & Jadwal')).not.toHaveClass(/btn_tab_aktif/);
  });

  test('tabel menampilkan kolom daftar harga dan jadwal', async ({ page }) => {
    await page.goto(listUrl);
    for (const kolom of [
      'Nomor Lelang',
      'Rute',
      'Pelayaran',
      'Jenis',
      'Harga (Rp.)',
      'Mulai Berlaku',
      'Aksi',
    ]) {
      // Tanpa \b penutup: "Harga (Rp.)" berakhir non-word char, \b tak
      // pernah cocok di sana (butuh transisi word/non-word di kedua sisi).
      await expect(
        page.getByRole('columnheader', { name: new RegExp(`^${kolom.replace(/[().]/g, '\\$&')}`) }).first(),
      ).toBeVisible();
    }
  });

  test('harga tanpa jadwal di tab Butuh Jadwal Kapal ditandai warna merah', async ({ page }) => {
    await page.goto(`${listUrl}?tab=2`);
    const jumlah = await tungguBarisData(page);
    test.skip(jumlah === 0, 'Tidak ada data di tab Butuh Jadwal Kapal pada akun demo');

    await expect(listPage.barisData(page).first().locator('td').first()).toHaveCSS(
      'color',
      'rgb(249, 73, 81)',
    );
  });

  test('harga yang sudah lengkap jadwalnya tidak berwarna merah', async ({ page }) => {
    await page.goto(`${listUrl}?tab=4`);
    const jumlah = await tungguBarisData(page);
    test.skip(jumlah === 0, 'Tidak ada data di tab Sudah Lengkap pada akun demo');

    await expect(listPage.barisData(page).first().locator('td').first()).toHaveCSS(
      'color',
      'rgb(73, 80, 87)',
    );
  });

  for (const tab of [
    { nama: 'Butuh Jadwal Kapal', nomor: 2 },
    { nama: 'Sudah Lengkap', nomor: 4 },
  ]) {
    test(`aksi tab ${tab.nama}: detail, edit, hapus harga, serta lihat & tambah jadwal`, async ({ page }) => {
      await page.goto(`${listUrl}?tab=${tab.nomor}`);
      const jumlah = await tungguBarisData(page);
      test.skip(jumlah === 0, `Tidak ada data di tab ${tab.nama} pada akun demo`);

      const baris = listPage.barisData(page).first();
      await expect(baris.locator('a.view-detail')).toBeVisible();
      await expect(tombolAksi(baris, 'Edit Harga')).toBeVisible();
      await expect(tombolAksi(baris, 'Hapus Harga')).toBeVisible();
      await expect(tombolAksi(baris, 'Menu Jadwal')).toBeVisible();
      // Isi dropdown Menu Jadwal (rule: "Lihat & tambah jadwal") — item ada
      // di DOM baris; visibilitasnya menunggu interaksi dropdown, cukup
      // diassert keberadaan + tujuan link Lihat Jadwal.
      await expect(baris.getByText('Tambah Jadwal', { exact: true })).toBeAttached();
      await expect(baris.getByText('Lihat Jadwal', { exact: true })).toBeAttached();
      await expect(baris.locator('a[href*="/home/masterjadwal1/"]')).toBeAttached();
    });
  }

  test('aksi tab Perlu Update Harga: detail harga dan update harga', async ({ page }) => {
    await page.goto(`${listUrl}?tab=3`);
    const jumlah = await tungguBarisData(page);
    // Tab kosong saat kalibrasi 2026-08-20 — penamaan tombol Update Harga
    // belum terverifikasi terhadap UI; assertion mengikuti rule.
    test.skip(jumlah === 0, 'Tidak ada data di tab Perlu Update Harga pada akun demo');

    const baris = listPage.barisData(page).first();
    await expect(baris.locator('a.view-detail')).toBeVisible();
    await expect(tombolAksi(baris, 'Update Harga')).toBeVisible();
  });

  test('aksi tab Request Jadwal: update jadwal, detail harga, lihat jadwal', async ({ page }) => {
    await page.goto(`${listUrl}?tab=5`);
    const jumlah = await tungguBarisData(page);
    test.skip(jumlah === 0, 'Tidak ada data di tab Request Jadwal pada akun demo');

    const baris = listPage.barisData(page).first();
    await expect(baris.locator('a.view-detail')).toBeVisible();
    // Ikon tanpa teks node di tab ini — tooltip via title/data-original-title.
    await expect(tombolAksi(baris, 'Lihat Jadwal')).toBeVisible();

    // Tombol Update hanya pada harga yang belum direspon bidder (rule);
    // harga yang telah direspon tampil TANPA tombol Update.
    const barisDenganUpdate = listPage.barisData(page).filter({ has: page.locator('a.updatejadwal') });
    test.skip(
      (await barisDenganUpdate.count()) === 0,
      'Tidak ada request jadwal yang belum direspon pada akun demo',
    );
    // a.updatejadwal tampil sebagai teks "Update" biasa (tanpa atribut title).
    await expect(barisDenganUpdate.first().getByText('Update', { exact: true })).toBeVisible();
  });

  test('harga hasil respon update harga bertanda (#n) di kolom Harga', async ({ page }) => {
    await page.goto(`${listUrl}?tab=1`);
    const jumlah = await tungguBarisData(page);
    test.skip(jumlah === 0, 'Tidak ada data harga pada akun demo');

    const bertanda = listPage.barisData(page).filter({ hasText: /\(#\d+\)/ });
    test.skip((await bertanda.count()) === 0, 'Tidak ada harga hasil respon update harga pada akun demo');
    // Tanda # berada di sel kolom Harga (sel ke-5).
    await expect(bertanda.first().locator('td').nth(4)).toHaveText(/\(#\d+\)/);
  });
});
