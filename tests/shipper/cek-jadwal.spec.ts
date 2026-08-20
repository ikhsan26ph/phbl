import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Cek Jadwal — peran Shipper/Bid Owner (project "shipper",
 * storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/11-cek-jadwal.md
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - /lelang/carijadwal. Field Pelayaran DISABLED terkunci "Meratus" dengan
 *   hint "Sementara waktu pelayaran yang tersedia masih MERATUS".
 * - POL/POD/Sortir adalah select2 (bootstrap4) — dibuka dengan klik
 *   container .select2-container (indeks 1=POL, 2=POD, 3=Sortir), lalu
 *   ketik kata kunci dan klik .select2-results__option--highlighted.
 *   Klik textbox pencariannya langsung TIDAK bisa (tertutup overlay).
 * - Sortir: 2 opsi pada <select> tersembunyi — "Tanggal Berangkat Terdekat"
 *   (value etd, default) dan "Tanggal Tiba Terdekat" (value eta).
 * - Logo liner ada 5 link (rule menyebut hard code Spil/Tanto/Temas; UI
 *   juga menampilkan Meratus & ICON): meratus-one.com,
 *   iconlinebooking.co.id, myspil.com, tantonet.com, kliktemas.com.
 * - Hasil pencarian SUB→MAK di server demo: "Tidak Ada Data yang tersedia"
 *   + pesan "Mohon maaf, jadwal yang anda cari belum tersedia..." lengkap
 *   dengan email & WA CS (sesuai rule saat Meratus tanpa jadwal) DAN header
 *   tabel hasil tetap dirender (Pelayaran, Nama Kapal/Status Jadwal,
 *   Voyage/Closing Time, Pelabuhan Asal/ETD, Pelabuhan Tujuan/ETA).
 *   Test hasil ditulis toleran: baris jadwal ATAU pesan maaf — keduanya
 *   valid tergantung ketersediaan API Meratus.
 * - Klik "Cari Jadwal" tanpa pilih pelabuhan: tidak terjadi apa-apa
 *   (tidak ada alert, tidak ada request) — wujud "wajib dipilih".
 *
 * Rule yang TIDAK dicakup di sini:
 * - Urutan hasil sortir ETD/ETA terdekat (butuh jadwal Meratus nyata ≥2).
 * - Setting UN Code pelabuhan (halaman admin tersembunyi, lintas peran).
 */

const cekJadwalUrl = '/lelang/carijadwal';

const jadwalPage = {
  cariButton: (page: Page) => page.getByRole('button', { name: ' Cari Jadwal' }),
  select2: (page: Page, index: number) => page.locator('.select2-container').nth(index),
  selects: (page: Page) => page.locator('select'),
};

/** Pilih opsi select2: buka container, ketik kata kunci, pilih highlight. */
async function pilihSelect2(page: Page, index: number, kataKunci: string) {
  await jadwalPage.select2(page, index).click();
  await page.keyboard.type(kataKunci);
  await page.locator('.select2-results__option--highlighted').click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(cekJadwalUrl);
});

test('form default: pelayaran terkunci Meratus, sortir tanggal berangkat, tanggal hari ini', async ({
  page,
}) => {
  // getByText default case-insensitive — batasi exact agar tidak bentrok
  // dengan breadcrumb "Cek Jadwal Pelayaran".
  await expect(page.getByText('CEK JADWAL PELAYARAN', { exact: true })).toBeVisible();
  await expect(page.getByText('Sementara waktu pelayaran yang tersedia masih MERATUS')).toBeVisible();

  const pelayaran = jadwalPage.selects(page).first();
  await expect(pelayaran).toBeDisabled();

  // Sortir default "Tanggal Berangkat Terdekat" (etd); opsi lain eta.
  const sortir = jadwalPage.selects(page).nth(3);
  await expect(sortir).toHaveValue('etd');
  const opsiSortir = await sortir.locator('option').allTextContents();
  expect(opsiSortir).toEqual(['Tanggal Berangkat Terdekat', 'Tanggal Tiba Terdekat']);

  const hariIni = new Date();
  const dd = String(hariIni.getDate()).padStart(2, '0');
  const mm = String(hariIni.getMonth() + 1).padStart(2, '0');
  await expect(page.getByRole('textbox', { name: 'DD/MM/YYYY' })).toHaveValue(
    `${dd}/${mm}/${hariIni.getFullYear()}`,
  );
  await expect(page.getByText('Default tanggal hari ini')).toBeVisible();
});

test('logo kelima liner tampil dengan link jadwal pelayaran masing-masing', async ({ page }) => {
  for (const href of [
    'meratus-one.com',
    'iconlinebooking.co.id',
    'myspil.com',
    'tantonet.com',
    'kliktemas.com',
  ]) {
    await expect(page.locator(`a[href*="${href}"]`)).toBeVisible();
  }
  // Teks helper dirender 2x (varian pc & mobile) — cukup salah satu visible.
  await expect(
    page.getByText('*) Klik logo dibawah untuk melihat jadwal pelayaran lain').first(),
  ).toBeVisible();
});

test('pencarian jadwal menampilkan hasil atau pesan jadwal belum tersedia beserta kontak CS', async ({
  page,
}) => {
  await pilihSelect2(page, 1, 'Perak');
  await pilihSelect2(page, 2, 'Makassar');
  await expect(jadwalPage.selects(page).nth(1)).toHaveValue(/.+/);
  await expect(jadwalPage.selects(page).nth(2)).toHaveValue(/.+/);

  await jadwalPage.cariButton(page).click();

  // Ringkasan pencarian tampil di panel hasil.
  await expect(page.getByText('HASIL JADWAL')).toBeVisible({ timeout: 20_000 });

  // Hasil tergantung respons API Meratus dan bervariasi antar run di server
  // demo: pesan maaf (tanpa tabel), tabel kosong "Tidak Ada Data", atau
  // baris jadwal. Teks-teks ini juga ada sebagai template TERSEMBUNYI di
  // DOM (33 duplikat td) — wajib filter({ visible: true }).
  const pesanMaaf = page
    .getByText(/Mohon maaf, jadwal yang anda cari belum tersedia di sistem/)
    .filter({ visible: true });
  const tanpaData = page.getByText('Tidak Ada Data yang tersedia').filter({ visible: true });
  await expect(pesanMaaf.or(tanpaData).first()).toBeVisible({ timeout: 20_000 });

  if ((await pesanMaaf.count()) > 0) {
    // Rule: pesan memuat email & WA customer service dari setting general.
    // Email/WA yang sama juga ada di sidebar KONTAK KAMI — scope ke pesan.
    await expect(pesanMaaf.first().getByText('csct@prahu-hub.com')).toBeVisible();
    await expect(pesanMaaf.first().getByText('081246665023')).toBeVisible();
  } else {
    // Jalur bertabel: kolom hasil sesuai rule (pasangan label per header).
    await expect(
      page.getByRole('columnheader', { name: 'Pelayaran' }).filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Nama Kapal\s+Status Jadwal/ }).filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Pelabuhan Asal\s+ETD/ }).filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: /Pelabuhan Tujuan\s+ETA/ }).filter({ visible: true }).first(),
    ).toBeVisible();
  }

  // Rule: logo liner tetap tampil baik hasil ditemukan maupun tidak.
  await expect(page.locator('a[href*="myspil.com"]')).toBeVisible();
});
