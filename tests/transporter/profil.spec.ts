import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Profil — peran Bidder/Transporter (project "transporter",
 * storageState .auth/transporter.json via project setup). Read-only.
 * Rule: docs/rules/bidder/11-profil.md
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login form):
 * - /home/myprofile (menu PROFIL), judul dokumen "Profil Transporter",
 *   breadcrumb "Beranda / Profil" (Beranda = link ke /lelang/listLelang).
 * - Header: nama perusahaan, span "Bergabung Sejak dd/mm/yyyy", span
 *   "Lokasi : <kota>", "Detail Rating :" + nilai "x/5" + 5 ikon bintang
 *   (class fa-star*) + "Menang Nx".
 * - Tab (role=tab): "Informasi" (default aktif, panel #tab1) & "Ulasan"
 *   (panel #tab2). Panel Informasi: label <span><b>Tahun Berdiri :</b></span>
 *   dst. dengan nilai di induk span (Tahun Berdiri, Jumlah Karyawan, Jenis
 *   Pengiriman, Tentang Perusahaan), link "Edit Profil" → /home/editprofile,
 *   dan seksi "Galeri Perusahaan" yang TERLIPAT (collapse #pengiriman_collapse,
 *   dibuka via ikon #icon_pengiriman "Tampilkan Detail" — id warisan
 *   copy-paste "pengiriman"); isi kosong = "Tidak Ada Data Tersedia".
 * - Panel Ulasan: tabel #isitrayek, tiap ulasan = tr berisi <p> "Shipper"
 *   (rule menulis label "Bid Owner" — pemetaan istilah UI, bukan defect) +
 *   tanggal dd/mm/yyyy, <p> rute "Asal (KODE) - Tujuan (KODE)[ / Multidrop]",
 *   <p> isi ulasan; diselingi tr kosong (spacer). Urutan terbaru di atas.
 * - Edit Profil (/home/editprofile): input tgl_berdiri (placeholder
 *   DD/MM/YYYY) & jumlah_karyawan, tombol Batal/Simpan. CATATAN dev: pada
 *   akun demo tgl_berdiri terisi "20/00/0719" padahal profil menampilkan
 *   Tahun Berdiri "2000" — konversi tahun → tanggal salah (tidak diassert,
 *   halaman edit hanya dibuka, tidak disimpan).
 * - Akun demo punya semua data terisi → rule "strip bila belum disetting"
 *   tidak bisa diverifikasi (butuh akun tanpa data).
 *
 * Rule yang TIDAK dicakup: sumber data (registrasi awal, kota, total rating,
 * jumlah order) — butuh pembanding DB; foto galeri diklik (akun tanpa galeri).
 */

const profilPage = {
  tab: (page: Page, nama: string) => page.getByRole('tab', { name: nama }),
  panelInformasi: (page: Page) => page.locator('#tab1'),
  panelUlasan: (page: Page) => page.locator('#tab2'),
  /** Baris label "<Label> :" (span) → induknya memuat nilai. */
  nilai: (page: Page, label: string) =>
    page.locator('span', { hasText: new RegExp(`^\\s*${label}\\s*:\\s*$`) }).first().locator('..'),
  ikonGaleri: (page: Page) => page.locator('#icon_pengiriman'),
  collapseGaleri: (page: Page) => page.locator('#pengiriman_collapse'),
  editProfil: (page: Page) => page.getByRole('link', { name: 'Edit Profil' }),
  /** Baris ulasan = tr yang punya <p> (menyaring tr spacer). */
  barisUlasan: (page: Page) => page.locator('#isitrayek tr').filter({ has: page.locator('p') }),
};

test.beforeEach(async ({ page }) => {
  await page.goto('/home/myprofile');
});

test('header profil menampilkan bergabung sejak, lokasi, detail rating berbintang, dan jumlah menang lelang', async ({
  page,
}) => {
  await expect(page).toHaveTitle('Profil Transporter');
  await expect(page.getByRole('link', { name: 'Beranda' })).toHaveAttribute('href', /\/lelang\/listLelang$/i);

  await expect(page.getByText(/Bergabung Sejak\s+\d{2}\/\d{2}\/\d{4}/).first()).toBeVisible();
  await expect(page.getByText(/Lokasi\s*:\s*\S+/).first()).toBeVisible();

  const rating = page.getByText(/^\s*Detail Rating\s*:\s*$/).first().locator('..');
  await expect(rating).toHaveText(/Detail Rating\s*:\s*\d(?:\.\d+)?\/5/);
  await expect(rating).toHaveText(/Menang\s+\d+x/);
  await expect(rating.locator('[class*="fa-star"]')).toHaveCount(5);
});

test('tab Informasi aktif default dan memuat tahun berdiri, jumlah karyawan, jenis pengiriman, tentang perusahaan', async ({
  page,
}) => {
  await expect(profilPage.tab(page, 'Informasi')).toHaveClass(/active/);
  await expect(profilPage.panelInformasi(page)).toBeVisible();
  await expect(profilPage.panelUlasan(page)).toBeHidden();

  // Rule: bila belum disetting tampil strip — nilai wajib ada (isi atau "-").
  for (const label of ['Tahun Berdiri', 'Jumlah Karyawan', 'Jenis Pengiriman', 'Tentang Perusahaan']) {
    await expect(profilPage.nilai(page, label)).toHaveText(new RegExp(`${label}\\s*:\\s*\\S`));
  }
  await expect(profilPage.editProfil(page)).toHaveAttribute('href', /\/home\/editprofile$/);
});

test('galeri perusahaan menampilkan keterangan Tidak Ada Data Tersedia bila kosong, atau foto bila ada', async ({
  page,
}) => {
  await expect(page.getByText('Galeri Perusahaan').first()).toBeVisible();
  await profilPage.ikonGaleri(page).click();
  await expect(profilPage.collapseGaleri(page)).toBeVisible();

  const kosong = profilPage.collapseGaleri(page).getByText('Tidak Ada Data Tersedia');
  const foto = profilPage.collapseGaleri(page).locator('img');
  if (await kosong.isVisible().catch(() => false)) {
    await expect(kosong).toBeVisible();
    await expect(foto).toHaveCount(0);
  } else {
    await expect(foto.first()).toBeVisible();
  }
});

test('Edit Profil membuka form tahun berdiri & jumlah karyawan tanpa menyimpan', async ({ page }) => {
  await profilPage.editProfil(page).click();
  await expect(page).toHaveURL(/\/home\/editprofile$/);
  await expect(page.locator('input[name="tgl_berdiri"]')).toBeVisible();
  await expect(page.locator('input[name="tgl_berdiri"]')).toHaveAttribute('placeholder', 'DD/MM/YYYY');
  await expect(page.locator('input[name="jumlah_karyawan"]')).not.toHaveValue('');
  await expect(page.getByRole('link', { name: 'Batal' }).or(page.getByRole('button', { name: 'Batal' }))).toBeVisible();
  await expect(page.getByRole('button', { name: /Simpan/ })).toBeVisible();
});

test('tab Ulasan menampilkan ulasan berlabel Shipper dengan tanggal, rute, isi, terbaru di atas', async ({ page }) => {
  await profilPage.tab(page, 'Ulasan').click();
  await expect(profilPage.tab(page, 'Ulasan')).toHaveClass(/active/);
  await expect(profilPage.panelUlasan(page)).toBeVisible();
  await expect(profilPage.panelInformasi(page)).toBeHidden();

  // Baris ulasan dimuat async setelah tab dibuka — tunggu baris pertama
  // (run 2026-08-29: count() langsung = 0 padahal ada 4 ulasan → skip palsu).
  const baris = profilPage.barisUlasan(page);
  await baris.first().waitFor({ timeout: 10_000 }).catch(() => {});
  const jumlah = await baris.count();
  test.skip(jumlah === 0, 'Tidak ada ulasan pada akun demo');

  const tanggal: number[] = [];
  for (let i = 0; i < jumlah; i++) {
    const p = baris.nth(i).locator('p');
    // Nama bid owner tidak ditampilkan — hanya label peran ("Shipper") + tanggal.
    await expect(p.nth(0)).toHaveText(/^\s*Shipper\s*\d{2}\/\d{2}\/\d{4}\s*$/);
    await expect(p.nth(1)).toHaveText(/\S.*\(\w+\)\s*-\s*\S.*\(\w+\)/);
    await expect(p.nth(2)).toHaveText(/\S/);

    const [, d, m, y] = (await p.nth(0).innerText()).match(/(\d{2})\/(\d{2})\/(\d{4})/)!;
    tanggal.push(Number(`${y}${m}${d}`));
  }
  // Rule: ulasan terbaru paling atas → tanggal tidak naik dari atas ke bawah.
  for (let i = 1; i < tanggal.length; i++) {
    expect(tanggal[i], `Urutan tanggal ulasan: ${tanggal.join(', ')}`).toBeLessThanOrEqual(tanggal[i - 1]);
  }
});
