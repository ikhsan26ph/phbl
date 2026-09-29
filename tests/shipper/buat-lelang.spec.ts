import { expect, test, type Page } from '@playwright/test';
import {
  aliasTransporter,
  bukaKonteksAkun,
  idNotifikasiTerakhir,
  namaPerusahaan,
  tungguNotifikasiBaru,
} from '../push-notif.trigger';

/**
 * Modul: Buat Lelang Pengiriman — peran Shipper/Bid Owner (project
 * "shipper", storageState .auth/shipper.json via project setup)
 * Rule: docs/rules/bid-owner/08-pengajuan-lelang.md, bagian "Buat Lelang
 * Pengiriman" dan "Pilih Peserta Lelang"
 *
 * KEPUTUSAN SCOPE: submit akhir di halaman "Pilih Peserta Lelang" mengirim
 * notifikasi email+WA sungguhan ke bidder yang diundang (efek samping
 * nyata). User mengizinkan alur penuh 2026-08-14 dan menegaskan kembali
 * 2026-09-29 bahwa trigger hanya boleh memakai akun dengan email fixture
 * project. Karena itu test sekarang hanya mengundang akun tepat yang login
 * sebagai `transporter` (`TRANSPORTER_EMAIL`), bukan seluruh bidder "(IK)".
 * Test "alur penuh" di bawah
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

/** Tanggal Asia/Jakarta untuk offset hari, sesuai format mask aplikasi. */
function tanggalJam(offsetHari: number): string {
  const tanggal = new Date(Date.now() + offsetHari * 86_400_000);
  const bagian = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(tanggal);
  return `${bagian} 09:00`;
}

test('alur penuh: buat lalu batalkan lelang memicu Push Notif Transporter dan Admin', async ({
  browser,
  page,
}) => {
  // Default 30s test timeout tidak cukup: banyak langkah select2, dan
  // halaman Pilih Peserta Lelang memuat library PDF.js Express (termasuk
  // WASM) untuk preview dokumen aanwijzing sebelum submit final bisa
  // redirect — pada cold cache genuinely bisa >45 detik (dikonfirmasi via
  // trace 2026-08-14; BUKAN proses kirim notifikasi yang lambat, dan
  // BUKAN bisa diperbaiki dengan memblokir resource itu — sudah dicoba,
  // route blocking malah membuat redirect tidak pernah terjadi karena
  // logic submit menunggu resource itu berhasil dimuat).
  test.setTimeout(240_000);

  const nomorLelang = `AUTOTEST/${Date.now()}`;
  test.info().annotations.push(
    { type: 'data-uji', description: `Nomor lelang: ${nomorLelang}` },
    { type: 'penerima', description: process.env.TRANSPORTER_EMAIL! },
  );
  const transporterContext = await bukaKonteksAkun(browser, 'transporter', process.env.TRANSPORTER_EMAIL);
  const adminContext = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);

  try {
    const transporter = await namaPerusahaan(transporterContext);
    const alias = await aliasTransporter(adminContext, process.env.TRANSPORTER_EMAIL!, transporter);
    const [baselineTransporter, baselineAdmin] = await Promise.all([
      idNotifikasiTerakhir(transporterContext, 'Lelang'),
      idNotifikasiTerakhir(adminContext, 'Lelang'),
    ]);

    await expect(
      page.getByText(process.env.SHIPPER_EMAIL!, { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();

    await formPage.nomorLelang(page).click();
    await page.keyboard.type(nomorLelang);

    await ketikTanggalJam(page, '#tanggal_buka_lelang', tanggalJam(1));
    await ketikTanggalJam(page, '#tanggal_tutup_lelang', tanggalJam(2));
    await ketikTanggalJam(page, '#tanggal_mulai_kontrak', tanggalJam(3));
    await ketikTanggalJam(page, '#tanggal_selesai_kontrak', tanggalJam(6));

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

    // Tombol peserta dirender sebelum script jQuery selesai dipasang. Jika
    // diklik terlalu cepat, button type="button" tidak melakukan apa pun.
    // Tunggu handler do_buat_lelang benar-benar siap sebelum memilih peserta.
    await page.waitForFunction(() => {
      const jquery = (window as typeof window & {
        jQuery?: { _data: (element: Element, key: string) => { click?: unknown[] } | undefined };
      }).jQuery;
      const button = document.querySelector('#tombol_lanjutkan');
      return Boolean(jquery && button && jquery._data(button, 'events')?.click?.length);
    }, undefined, { timeout: 90_000 });
    await expect(page.getByRole('cell', { name: nomorLelang })).toBeVisible({ timeout: 30_000 });

    // Undang HANYA akun yang sudah diverifikasi sebagai TRANSPORTER_EMAIL.
    const barisTransporter = page.locator('tr.isiDataBidderTable_tr').filter({
      has: page.getByRole('cell', { name: alias, exact: true }),
    });
    await expect(barisTransporter).toHaveCount(1);
    await barisTransporter.locator('input[type="checkbox"]').first().check();
    await expect(page.locator('tr.isiDataBidderTable_tr input[type="checkbox"]:checked')).toHaveCount(1);
    await expect(page.locator('#jumlah_pilih_bidder')).toHaveText('1');

    // Checkbox master "Pilih Semua" TIDAK ikut ter-check karena hanya satu
    // akun fixture yang dipilih. Dirender dua kali (desktop/mobile).
    await expect(
      page.locator('input[type="checkbox"][name="pilih_semua_bidder"]').first(),
    ).not.toBeChecked();

    // Submit sesungguhnya: email/WA/push hanya menuju akun transporter fixture.
    const submitPeserta = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/do_buat_lelang'),
    { timeout: 90_000 });
    await formPage.lanjutkanButton(page).click();
    const responsePeserta = await submitPeserta;
    expect(responsePeserta.ok(), `Submit peserta gagal: ${responsePeserta.status()}`).toBeTruthy();
    await expect(page).toHaveURL(/\/lelang\/listlelang/, { timeout: 90_000 });
    await expect(page.getByText('Anda berhasil membuat pengajuan lelang')).toBeVisible();

    // Tabel daftar lelang dimuat async ("Mohon tunggu sebentar" dulu).
    await expect(page.getByText(nomorLelang).first()).toBeVisible({ timeout: 15_000 });

    const [notifTransporter, notifAdmin] = await Promise.all([
      tungguNotifikasiBaru(transporterContext, baselineTransporter, {
        kategori: 'Lelang',
        judul: /Pengajuan Lelang/i,
        isi: [nomorLelang],
        redirect: /\/lelang\/listlelang\/.+tab=perlu-input-harga/,
      }),
      tungguNotifikasiBaru(adminContext, baselineAdmin, {
        kategori: 'Lelang',
        judul: /Pengajuan Lelang/i,
        isi: [nomorLelang],
        penerima: /to Transporter/i,
        redirect: /\/lelang\/listlelang\/.+tab=perlu-input-harga/,
      }),
    ]);
    expect(notifTransporter.isi).toContain(nomorLelang);
    expect(notifAdmin.isi).toBe(notifTransporter.isi);

    // Trigger kedua: pembatalan lelang yang baru dibuat. Lelang ini hanya
    // memiliki satu peserta, sehingga tidak ada notifikasi ke akun non-fixture.
    await page.goto(
      `/lelang/listlelang?tab=semua-lelang&status_filter=1&filter_1=${encodeURIComponent(nomorLelang)}`,
    );
    const barisLelang = page.locator('table tbody tr').filter({ hasText: nomorLelang });
    await expect(barisLelang).toHaveCount(1, { timeout: 30_000 });
    const linkPembatalan = await barisLelang.locator('span.batalkan_lelang').getAttribute('link');
    expect(linkPembatalan).toMatch(/\/lelang\/batalkanlelang\/\d+$/);
    await page.goto(linkPembatalan!);
    await page.locator('#alasan_batal').selectOption({ label: 'Salah Input Informasi' });

    const cekBatal = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/cekactionbatallelang'));
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    expect((await cekBatal).ok()).toBeTruthy();
    await expect(page.getByText('Apakah anda yakin membatalkan lelang ?')).toBeVisible();

    const submitBatal = page.waitForResponse((response) =>
      response.request().method() === 'POST' && response.url().endsWith('/lelang/do_batalkan_lelang'));
    await page.getByRole('button', { name: 'Ya', exact: true }).click();
    const responseBatal = await submitBatal;
    expect(responseBatal.ok(), `Pembatalan gagal: ${responseBatal.status()}`).toBeTruthy();
    await expect(page).toHaveURL(/\/lelang\/detaillistlelang\/\d+$/i, { timeout: 30_000 });
    await expect(page.getByText('LELANG BATAL', { exact: true }).first()).toBeVisible();

    const [batalTransporter, batalAdmin] = await Promise.all([
      tungguNotifikasiBaru(transporterContext, Number(notifTransporter.ID), {
        kategori: 'Lelang',
        judul: /Pembatalan Lelang/i,
        isi: [nomorLelang],
        redirect: /\/lelang\/detaillistlelang\/\d+\?notif=batal/i,
      }),
      tungguNotifikasiBaru(adminContext, Number(notifAdmin.ID), {
        kategori: 'Lelang',
        judul: /Pembatalan Lelang/i,
        isi: [nomorLelang],
        penerima: /to (Transporter|Bidder)/i,
        redirect: /\/lelang\/detaillistlelang\/\d+\?notif=batal/i,
      }),
    ]);
    expect(batalAdmin.isi).toBe(batalTransporter.isi);
  } finally {
    await transporterContext.close();
    await adminContext.close();
  }
});
