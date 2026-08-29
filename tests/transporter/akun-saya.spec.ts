import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Akun Saya — peran Bidder/Transporter akun utama (project
 * "transporter", storageState .auth/transporter.json via project setup).
 * Rule: docs/rules/bidder/04-akun-saya.md (sub user: tests/transporter-sub/).
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login form):
 * - /home/akunsaya: breadcrumb "Beranda" = LINK (a di dalam span.mr_5) ke
 *   /lelang/listLelang — rule: Beranda bidder → daftar pengajuan lelang.
 * - Data akun = tabel label/nilai (td label berteks "<Label> :"): Nama,
 *   Nama Perusahaan, Alamat, Kota, Provinsi, Telepon / Whatsapp, No. Fax,
 *   Email, NPWP, No. NPWP, SIUP, No. SIUP, Nama Bank 1, Nomor Rekening 1,
 *   Atas Nama Rekening 1. Sel "Logo Perusahaan" berisi <a href=".../assets/
 *   photo/..."> yang membungkus tombol "Download Gambar" (pola sama dgn
 *   shipper). Tabel kendaraan (Jenis Kendaraan/Dimensi/Kapasitas/Jumlah)
 *   ikut dirender — tidak ada di rule, tidak diassert.
 * - Akun demo transporter TANPA file NPWP & SIUP (nilai "-") → rule "NPWP
 *   dan SIUP bisa didownload kembali" tidak bisa diverifikasi (skip).
 * - DEFECT (CLAUDE.md #10): link "Edit Akun Saya" → /home/editakunsaya
 *   menjawab HTTP 500 "[Emergency] Uncaught SilverStripe\ORM\Connect\
 *   DatabaseException: Couldn't run query: SELECT * FROM File where ID="
 *   (ID kosong — diduga karena akun tanpa file NPWP/SIUP). Halaman error
 *   membocorkan stack trace + potongan source code (mode debug aktif).
 *   Sub user tidak kena (aksesnya ditolak lebih dulu).
 *
 * Rule yang TIDAK dicakup (butuh kondisi/mutasi data spesifik):
 * - Notif "Selamat datang di PHBID" (first-login akun baru) dan "Akun anda
 *   dinonaktifkan" (butuh akun nonaktif).
 * - Alert WA duplikat, tombol edit disable saat menunggu konfirmasi admin,
 *   alur terima/tolak + email — mutasi lintas peran, dan halaman editnya
 *   sendiri sedang 500.
 */

const LABEL_AKUN = [
  'Nama',
  'Nama Perusahaan',
  'Alamat',
  'Kota',
  'Provinsi',
  'Telepon / Whatsapp',
  'Email',
  'NPWP',
  'No. NPWP',
  'SIUP',
  'No. SIUP',
  'Nama Bank 1',
  'Nomor Rekening 1',
  'Atas Nama Rekening 1',
];

const akunSayaPage = {
  breadcrumbBeranda: (page: Page) => page.getByRole('link', { name: 'Beranda' }),
  /** Sel label "<Label> :" — jangkar awal + titik dua agar "Nama" ≠ "Nama Perusahaan". */
  selLabel: (page: Page, label: string) =>
    page.getByRole('cell', { name: new RegExp(`^${label.replace(/[./]/g, '\\$&')}\\s*:`) }).first(),
  logoCell: (page: Page) => page.getByRole('cell', { name: /Logo Perusahaan/ }),
  editAkunSaya: (page: Page) => page.getByRole('link', { name: /Edit Akun Saya/ }).first(),
};

test.beforeEach(async ({ page }) => {
  await page.goto('/home/akunsaya');
});

test('breadcrumb Beranda pada Akun Saya mengarah ke daftar pengajuan lelang', async ({ page }) => {
  await expect(akunSayaPage.breadcrumbBeranda(page)).toBeVisible();
  await expect(akunSayaPage.breadcrumbBeranda(page)).toHaveAttribute('href', /\/lelang\/listLelang$/i);
});

test('halaman menampilkan seluruh data akun utama beserta email akun login', async ({ page }) => {
  for (const label of LABEL_AKUN) {
    await expect(akunSayaPage.selLabel(page, label)).toBeVisible();
  }
  await expect(page.getByRole('cell', { name: process.env.TRANSPORTER_EMAIL!, exact: true })).toBeVisible();
});

test('logo perusahaan dapat didownload kembali lewat link ke file asli', async ({ page }) => {
  const linkLogo = akunSayaPage.logoCell(page).locator('a');
  await expect(linkLogo.getByRole('button', { name: 'Download Gambar' })).toBeVisible();
  await expect(linkLogo).toHaveAttribute('href', /\/assets\/photo\/.+/);
});

for (const dokumen of [
  { label: 'NPWP', folder: 'npwp' },
  { label: 'SIUP', folder: 'siup' },
]) {
  test(`${dokumen.label} yang telah diupload dapat didownload kembali`, async ({ page }) => {
    await expect(akunSayaPage.selLabel(page, dokumen.label)).toBeVisible();
    const link = page.locator(`a[href*="/assets/${dokumen.folder}/"]`);
    test.skip(
      (await link.count()) === 0,
      `Akun demo transporter belum mengupload ${dokumen.label} (nilai "-") — tidak ada file untuk diverifikasi`,
    );
    await expect(link.first()).toBeVisible();
  });
}

test('Edit Akun Saya membuka form edit akun (DEFECT: server menjawab 500)', async ({ page }) => {
  test.fail(
    true,
    'DEFECT 2026-08-29: /home/editakunsaya transporter → HTTP 500 DatabaseException "SELECT * FROM File where ID=" (ID kosong, akun tanpa NPWP/SIUP); halaman error membocorkan stack trace',
  );
  await expect(akunSayaPage.editAkunSaya(page)).toHaveAttribute('href', /\/home\/editakunsaya$/);

  const respons = await page.goto('/home/editakunsaya');
  expect(respons?.status(), 'status HTTP halaman Edit Akun Saya').toBe(200);
  await expect(page.getByRole('button', { name: /Simpan/ })).toBeVisible();
});
