import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Buat Lelang Pengiriman — peran Shipper/Bid Owner (project
 * "shipper", storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/08-pengajuan-lelang.md, bagian "Buat Lelang
 * Pengiriman" dan "Pilih Peserta Lelang"
 *
 * KEPUTUSAN SCOPE: submit akhir di halaman "Pilih Peserta Lelang" mengirim
 * notifikasi email+WA sungguhan ke bidder yang diundang (efek samping
 * nyata). User mengizinkan alur penuh 2026-08-14 DENGAN SYARAT: hanya
 * mengundang bidder yang namanya mengandung "(IK)" — akun bidder demo
 * internal yang aman untuk menerima notifikasi test berulang (7 dari 21
 * bidder di data demo memenuhi kriteria ini). Test "alur penuh" di bawah
 * MEMBUAT LELANG BARU SUNGGUHAN setiap kali dijalankan (data terus
 * bertambah di akun demo, sama seperti pola registrasi.spec.ts yang bikin
 * akun yopmail asli) — nomor lelang dibuat unik per run via timestamp.
 *
 * Kalibrasi ke halaman asli 2026-08-14 via playwright-cli:
 * - /lelang/buatlelang. Field Nomor Lelang menyaring karakter live: hanya
 *   huruf, angka, dan simbol / - # ( ) + yang lolos (rule) — simbol lain
 *   (&, *, %, dst.) langsung dibuang saat diketik, TANPA alert (submit
 *   dengan simbol terlarang baru memicu alert "Tidak Bisa Input Simbol"
 *   menurut rule, tapi live-filter membuatnya sulit dipicu — tidak diuji).
 * - Checkbox "Biaya Laut" & "Freight Kapal" default checked dan TIDAK
 *   punya atribut HTML disabled, namun klik tidak mengubah state-nya
 *   (diblokir via JS) — sesuai rule "auto terceklist dan tidak bisa
 *   diunceklist".
 * - Radio Normal/Multidrop: Multidrop menggandakan section TEMPAT TUJUAN
 *   jadi 2 blok berlabel "Informasi Alamat Lengkap Tujuan * - Drop Off 1"
 *   dan "... - Drop Off 2" (rule: multidrop defaultnya 2 alamat & kota
 *   tujuan wajib diisi).
 * - Field "Telp. PIC Tempat Asal"/"Tujuan" hanya menerima digit — huruf &
 *   simbol difilter live (rule: "Telp pic tujuan hanya dapat diinputkan
 *   angka").
 * - DEFECT: klik "Lanjutkan" dengan SEMUA field wajib kosong tidak
 *   menampilkan alert maupun highlight invalid pada field manapun —
 *   halaman diam saja (tidak pindah, tidak ada umpan balik). Pola sama
 *   dengan defect validasi diam di registrasi.spec.ts.
 * - Field tanggal (#tanggal_buka_lelang, #tanggal_tutup_lelang,
 *   #tanggal_mulai_kontrak, #tanggal_selesai_kontrak) format
 *   "DD/MM/YYYY hh:mm", diisi via click + keyboard.type (mask, sama pola
 *   dengan dashboard/laporan).
 * - POL/POD/Kota Asal/Kota Tujuan ada 2 SET select2 di DOM (indeks 1-4
 *   visible desktop, 5-8 varian tersembunyi) — WAJIB pakai
 *   `.select2-container >> nth(1..4)`, bukan nth sembarang.
 * - Jenis Kontainer: select2 multi-select (id #jenis_kontainer) dibuka via
 *   searchbox "Anda Bisa Memilih Beberapa", pilih via
 *   `.select2-results__option--highlighted` setelah mengetik.
 * - Setelah step 1 "Lanjutkan" dengan field lengkap, lelang SUDAH tercipta
 *   (URL /lelang/pilihpesertalelang/<hash> — bukan sekadar navigasi
 *   client-side seperti dugaan awal) dan meringkas data yang diisi.
 * - Tabel peserta lelang: baris `tr.isiDataBidderTable_tr`, checkbox
 *   `input[type=checkbox]` pertama per baris; filter baris ber-"(IK)" via
 *   textContent. Checkbox master "Pilih Semua" (name=pilih_semua_bidder)
 *   terpisah dari checkbox per-bidder (class `bidder_cekN`, id duplikat
 *   tidak valid "pilih_bidder" — jangan pakai locator by id).
 * - Tombol final di Pilih Peserta Lelang JUGA bertuliskan "Lanjutkan"
 *   (bukan "Submit") — mengklik itu langsung submit & redirect ke
 *   /lelang/listlelang; lelang baru langsung muncul di tab Semua Lelang.
 *
 * Rule yang TIDAK dicakup di sini (butuh kondisi/waktu spesifik):
 * - Validasi urutan tanggal ditolak jika buka < sekarang, tutup < buka, dst.
 * - "Gunakan data lelang yang pernah dibuat" (history-based prefill).
 * - Alert "Pilih Jenis Kontainer" & "Tidak Bisa Input Simbol" saat submit
 *   step 1 (butuh skenario spesifik field lain lengkap kecuali satu itu).
 * - Upload dokumen lelang tambahan, validasi ukuran/format file.
 * - Rekomendasi bidder dari master iklan berbayar (butuh data master aktif).
 */

const buatLelangUrl = '/lelang/buatlelang';

const formPage = {
  nomorLelang: (page: Page) => page.getByRole('textbox', { name: 'Masukkan Nomor Lelang' }),
  biayaLaut: (page: Page) => page.getByRole('checkbox', { name: 'Biaya Laut' }),
  freightKapal: (page: Page) => page.getByRole('checkbox', { name: 'Freight Kapal' }),
  radioNormal: (page: Page) => page.getByRole('radio', { name: 'Normal' }),
  radioMultidrop: (page: Page) => page.getByRole('radio', { name: 'Multidrop' }),
  telpPicAsal: (page: Page) => page.getByRole('textbox', { name: 'Nomor Telp.' }).first(),
  lanjutkanButton: (page: Page) => page.getByRole('button', { name: 'Lanjutkan' }),
};

test.beforeEach(async ({ page }) => {
  await page.goto(buatLelangUrl);
});

test('menampilkan panduan format nomor lelang', async ({ page }) => {
  await expect(page.getByText('Contoh format nomor lelang : XYZ/01/24-JKT')).toBeVisible();
});

test('nomor lelang menyaring simbol terlarang secara live, simbol diizinkan tetap lolos', async ({
  page,
}) => {
  const input = formPage.nomorLelang(page);
  await input.click();
  await page.keyboard.type('TEST&*%');
  await expect(input).toHaveValue('TEST');

  await input.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('ABC/01-24#(1)+X');
  await expect(input).toHaveValue('ABC/01-24#(1)+X');
});

test('Biaya Laut dan Freight Kapal default aktif dan tidak bisa diunceklist', async ({ page }) => {
  await expect(formPage.biayaLaut(page)).toBeChecked();
  await expect(formPage.freightKapal(page)).toBeChecked();

  await formPage.biayaLaut(page).click({ force: true });
  await expect(formPage.biayaLaut(page)).toBeChecked();

  await formPage.freightKapal(page).click({ force: true });
  await expect(formPage.freightKapal(page)).toBeChecked();
});

test('memilih rute Multidrop menggandakan section Tempat Tujuan menjadi 2 Drop Off', async ({ page }) => {
  await expect(formPage.radioNormal(page)).toBeChecked();
  await expect(page.getByText('Informasi Alamat Lengkap Tujuan * - Drop Off 1')).not.toBeVisible();

  await formPage.radioMultidrop(page).click();

  await expect(page.getByText('Informasi Alamat Lengkap Tujuan * - Drop Off 1')).toBeVisible();
  await expect(page.getByText('Informasi Alamat Lengkap Tujuan * - Drop Off 2')).toBeVisible();
});

test('field Telp. PIC hanya menerima angka', async ({ page }) => {
  const telp = formPage.telpPicAsal(page);
  await telp.click();
  await page.keyboard.type('0812abc!@#3456');
  await expect(telp).toHaveValue('08123456');
});

test('DEFECT: klik Lanjutkan dengan field wajib kosong seharusnya menampilkan validasi, bukan diam', async ({
  page,
}) => {
  test.fail();
  await formPage.lanjutkanButton(page).click();
  const feedback = page.locator('.alert, [role="alert"], .swal2-popup, .is-invalid, .invalid-feedback');
  await expect(feedback.first()).toBeVisible({ timeout: 3_000 });
});

// ---------------------------------------------------------------------------
// Alur penuh: Buat Lelang → Pilih Peserta Lelang (khusus bidder "(IK)") →
// Submit. Membuat data lelang sungguhan — lihat catatan scope di atas.
// ---------------------------------------------------------------------------

/** Isi field tanggal ber-mask via keyboard (fill() ditolak mask). */
async function ketikTanggalJam(page: Page, selector: string, nilai: string) {
  await page.locator(selector).click();
  await page.keyboard.type(nilai);
  await page.keyboard.press('Escape');
}

/** Pilih opsi select2 ke-n (1-indexed di antara container visible desktop). */
async function pilihSelect2(page: Page, nth: number, kataKunci: string) {
  await page.locator('.select2-container').nth(nth).click();
  await page.keyboard.type(kataKunci);
  await page.locator('.select2-results__option--highlighted').click();
}

test('alur penuh: buat lelang normal dan undang hanya bidder "(IK)" berhasil submit', async ({ page }) => {
  // Default 30s test timeout tidak cukup: banyak langkah select2, dan
  // halaman Pilih Peserta Lelang memuat library PDF.js Express (termasuk
  // WASM) untuk preview dokumen aanwijzing sebelum submit final bisa
  // redirect — pada cold cache genuinely bisa >45 detik (dikonfirmasi via
  // trace 2026-08-14; BUKAN proses kirim notifikasi yang lambat, dan
  // BUKAN bisa diperbaiki dengan memblokir resource itu — sudah dicoba,
  // route blocking malah membuat redirect tidak pernah terjadi karena
  // logic submit menunggu resource itu berhasil dimuat).
  test.setTimeout(150_000);

  const nomorLelang = `AUTOTEST/${Date.now()}`;

  await formPage.nomorLelang(page).click();
  await page.keyboard.type(nomorLelang);

  await ketikTanggalJam(page, '#tanggal_buka_lelang', '20/08/2026 09:00');
  await ketikTanggalJam(page, '#tanggal_tutup_lelang', '21/08/2026 09:00');
  await ketikTanggalJam(page, '#tanggal_mulai_kontrak', '22/08/2026 09:00');
  await ketikTanggalJam(page, '#tanggal_selesai_kontrak', '25/08/2026 09:00');

  await pilihSelect2(page, 1, 'Tanjung Priok'); // Pelabuhan Asal (POL)
  await pilihSelect2(page, 2, 'Tanjung Perak'); // Pelabuhan Tujuan (POD)

  await page.getByRole('textbox', { name: 'Masukkan Alamat Lengkap Asal' }).fill('Jl. Test Otomasi No. 1, Jakarta Utara');
  await pilihSelect2(page, 3, 'Jakarta Utara'); // Kota Asal

  await page.getByRole('textbox', { name: 'Masukkan Alamat Lengkap Tujuan' }).fill('Jl. Test Otomasi No. 2, Surabaya');
  await pilihSelect2(page, 4, 'Kota Surabaya'); // Kota Tujuan

  await page.getByRole('searchbox', { name: 'Anda Bisa Memilih Beberapa' }).click();
  await page.keyboard.type('20 DRY');
  await page.locator('.select2-results__option--highlighted').click();

  await formPage.lanjutkanButton(page).click();

  // Step 2: Pilih Peserta Lelang — lelang sudah tercipta, ringkasan tampil.
  await expect(page).toHaveURL(/\/lelang\/pilihpesertalelang\/.+/);
  await expect(page.getByRole('cell', { name: nomorLelang })).toBeVisible();

  // Undang HANYA bidder dengan "(IK)" di namanya (syarat dari user).
  const barisIK = page.locator('tr.isiDataBidderTable_tr').filter({ hasText: '(IK)' });
  const jumlahIK = await barisIK.count();
  expect(jumlahIK).toBeGreaterThan(0);
  for (let i = 0; i < jumlahIK; i++) {
    await barisIK.nth(i).locator('input[type="checkbox"]').first().check();
  }

  // Checkbox master "Pilih Semua" TIDAK ikut ter-check (hanya sebagian
  // bidder dipilih) — sesuai rule "checkbox salah satu dihapus, Pilih
  // Semua akan hilang" (di sini: tidak pernah tercentang sama sekali).
  // Tanpa accessible name — locate via name attribute, bukan role/name.
  // Dirender 2x (varian pc/mobile) — cukup cek yang pertama.
  await expect(
    page.locator('input[type="checkbox"][name="pilih_semua_bidder"]').first(),
  ).not.toBeChecked();

  // Submit sesungguhnya (mengirim notifikasi email+WA nyata ke 7 bidder
  // terpilih) — root cause lambatnya adalah library PDF.js Express untuk
  // preview aanwijzing (lihat catatan di atas), bukan proses notifikasi.
  await formPage.lanjutkanButton(page).click();
  await expect(page).toHaveURL(/\/lelang\/listlelang/, { timeout: 90_000 });
  await expect(page.getByText('Anda berhasil membuat pengajuan lelang')).toBeVisible();

  // Tabel daftar lelang dimuat async ("Mohon tunggu sebentar" dulu). Teks
  // nomor lelang dirender 2x (varian desktop cell + #render-mobile).
  await expect(page.getByText(nomorLelang).first()).toBeVisible({ timeout: 15_000 });
});
