import { expect, test, type Locator, type Page } from '@playwright/test';
import ExcelJS from 'exceljs';

/**
 * Modul: Analitik → Shipping Cost Sales Ratio (SCSR) — peran Shipper/Bid Owner
 * (project "shipper", storageState .auth/shipper.json via setup). READ-ONLY:
 * hanya submit form pencarian (GET), menelusuri 3 level drill-down, mengklik
 * header sortir, dan mengunduh file export.
 * Rule: docs/rules/analitik-scsr.md (hasil kalibrasi — modul Analitik TIDAK ada
 * di dokumen rule sumber).
 *
 * Fokus spec ini = improve 2026-09 "Kota Asal pada analitik SCSR":
 *   1. Kolom "Kota / Kab. Asal" HANYA ada saat klik Detail Kota (level 2).
 *   2. Jumlah Order terbagi per pasangan Kota Asal + Kota Tujuan.
 *   3. Detail Consignee hanya memuat order dengan pasangan kota terpilih.
 *   4. Detail Consignee TIDAK menambahkan kolom kota asal (hanya blok info).
 *
 * AUDIT MENDALAM 2026-09-28 (permintaan user "jangan ada bug kecil yang lolos")
 * menambahkan pengujian yang sebelumnya tidak ada:
 * - konsistensi angka berjenjang: level 1 = Σ level 2, level 2 = Σ level 3,
 *   Jumlah Order = jumlah baris level 3 — untuk SEMUA provinsi & pasangan,
 *   bukan cuma baris pertama;
 * - order antar pasangan dalam satu provinsi wajib DISJOINT (order multidrop
 *   dipecah per drop: biayanya dibagi, bukan diduplikasi);
 * - blok info "DATA BY PROVINSI" di level 3 harus memuat pasangan terpilih;
 * - kolom Kota Asal bisa disortir (POST searchanalitikscsrkota
 *   sortBy=kota_asal&sortType=ASC|DESC);
 * - file Export Excel ketiga level wajib memuat kota asal;
 * - parameter URL milik shipper lain tidak boleh membuka data shipper lain.
 *
 * Kalibrasi ke halaman asli (2026-09-26, diperdalam 2026-09-28) via
 * playwright-cli + spec eksplorasi:
 * - Menu ANALITIK (dropdown) shipper menampilkan EMPAT submenu: Shipping Cost
 *   Sales Ratio (/home/analitikscsr), Freight Cost (/analitik/analitikfcu),
 *   On Time Delivery Rate (/analitik/analitikotdr), Shipment Accuracy
 *   (/home/analitikshipmentaccuracy). Kalibrasi 2026-09-26 yang menulis "2
 *   submenu" SALAH/kedaluwarsa. DOM juga memuat link /dashboardanalitik/ringkasan
 *   + master analitik, tapi di grup menu lain yang tidak terbuka (tampil=false).
 * - Form: #tglawal & #tglakhir (daterangepicker → pressSequentially + Enter,
 *   fill() bisa ter-reset), dropdown Provinsi/Consignee = widget custom
 *   `.multi-select` (BUKAN <select>, selectOption tidak berlaku), tombol Cari.
 * - Tombol Cari = `#lanjutcari`. TIDAK bisa via getByRole('button',{name:'Cari'}):
 *   glyph ikon Font Awesome ikut terhitung di accessible name.
 * - Range tanggal DIBATASI 12 bulan oleh datepicker secara SENYAP: dengan
 *   tglawal 01/01/2025, mengetik 30/09/2026 di tglakhir menghasilkan nilai
 *   01/01/2026 (di-clamp, tanpa pesan apa pun).
 * - JEBAKAN 1: teks header tabel dipecah ke beberapa <span> TANPA spasi →
 *   setiap regex header WAJIB `\s*` ANTAR-KATA. "Kota / Kab. Asal" berakhir
 *   titik → jangan pakai `\b` penutup.
 * - JEBAKAN 2: baris hasil dimuat ASYNC setelah header tabel dirender →
 *   count() seketika = 0 dan test ikut "skip palsu"; wajib poll (toPass).
 *   Level 3 dgn 43 order butuh ±6 detik; sebelum itu tbody berisi SATU baris
 *   "Mohon tunggu sebentar" (jadi "ada baris" BUKAN penanda selesai).
 * - tbody juga menyisipkan baris kosong (spacer) + baris terakhir = TOTAL
 *   (tanpa nomor & tanpa aksi) → filter baris yang punya link aksi.
 * - Level 3 TIDAK punya pagination / pemilih page size (terverifikasi) →
 *   jumlah baris order di level 3 = angka Jumlah Order di level 2.
 *
 * Data uji dipilih DINAMIS (provinsi & pasangan kota mana pun yang ada saat
 * run) karena data demo bersama dan terus berubah.
 */

/** Range tanggal permintaan muat yang lebar tapi tetap <= 12 bulan. */
const DARI = '01/01/2026';
const SAMPAI = '30/09/2026';

/** Angka Indonesia ("1.410.000") → number. */
const angka = (teks: string): number => Number(String(teks).replace(/[^\d]/g, '')) || 0;

async function isiTanggal(page: Page, id: string, nilai: string): Promise<void> {
  const input = page.locator(`#${id}`);
  await input.click();
  await input.pressSequentially(nilai);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue(nilai);
}

/** Baris tabel yang benar-benar berisi data (punya link aksi drill-down). */
const barisDenganAksi = (page: Page, teksAksi: RegExp): Locator =>
  page.locator('table tbody tr').filter({ has: page.getByRole('link', { name: teksAksi }) });

/** Baris hasil dimuat async → poll sampai ada; false bila memang tanpa data. */
async function tungguBaris(page: Page, teksAksi: RegExp): Promise<{ baris: Locator; ada: boolean }> {
  const baris = barisDenganAksi(page, teksAksi);
  const ada = await expect(async () => {
    expect(await baris.count()).toBeGreaterThan(0);
  })
    .toPass({ timeout: 45_000, intervals: [500, 1000, 2000, 3000] })
    .then(() => true)
    .catch(() => false);
  return { baris, ada };
}

/** Baris order di level 3 (punya link ke detail order); dimuat async. */
const barisOrder = (page: Page): Locator =>
  page.locator('table tbody tr').filter({ has: page.locator('a[href*="order/orderdetail"]') });

/** Submit form pencarian SCSR dan tunggu URL hasil. */
async function cariSCSR(page: Page): Promise<void> {
  await page.goto('/home/analitikscsr');
  await isiTanggal(page, 'tglawal', DARI);
  await isiTanggal(page, 'tglakhir', SAMPAI);
  await page.locator('#lanjutcari').click();
  await expect(page).toHaveURL(/session_get=exp_/, { timeout: 60_000 });
}

/** Sel data (td) satu baris sebagai teks mentah — dibaca atomik per baris. */
const sel = async (baris: Locator): Promise<string[]> =>
  baris.evaluate((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim()));

test.describe('Analitik SCSR (Shipper)', () => {
  test('menu Analitik memuat empat submenu analitik', async ({ page }) => {
    await page.goto('/lelang/carirute');
    await page.getByText('ANALITIK', { exact: true }).first().click();
    const submenu: [string, RegExp][] = [
      ['Shipping Cost Sales Ratio', /\/home\/analitikscsr$/],
      ['Freight Cost', /\/analitik\/analitikfcu$/],
      ['On Time Delivery Rate', /\/analitik\/analitikotdr$/],
      ['Shipment Accuracy', /\/home\/analitikshipmentaccuracy$/],
    ];
    for (const [nama, href] of submenu) {
      const link = page.getByRole('link', { name: nama }).filter({ visible: true }).first();
      await expect(link, `submenu ${nama} harus tampil`).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    }
  });

  test('form pencarian memuat tanggal wajib, filter provinsi & consignee, dan hint 12 bulan', async ({
    page,
  }) => {
    await page.goto('/home/analitikscsr');
    // heading_1 di halaman ini adalah DIV (di halaman lain SPAN) → jangan kunci tag.
    await expect(page.locator('.heading_1', { hasText: /SHIPPING COST SALES RATIO/i })).toBeVisible();
    await expect(page.locator('#tglawal')).toBeVisible();
    await expect(page.locator('#tglakhir')).toBeVisible();
    await expect(
      page.getByText(/Masukkan tanggal permintaan muat\s*\(Maksimal range 12 bulan\)/),
    ).toBeVisible();
    // Dropdown custom .multi-select — shipper hanya punya Provinsi & Consignee
    // (TANPA filter Shipper; itu khas admin).
    const header = page.locator('.multi-select-header');
    await expect(header.filter({ hasText: /Pilih\s*Provinsi/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Nama\s*Consignee/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Shipper/ })).toHaveCount(0);
  });

  test('range tanggal > 12 bulan di-clamp senyap oleh datepicker', async ({ page }) => {
    // Perilaku teramati 2026-09-28: tidak ada alert/swal; tanggal akhir yang
    // melewati 12 bulan dari tanggal awal otomatis diganti tglawal + 12 bulan.
    await page.goto('/home/analitikscsr');
    await isiTanggal(page, 'tglawal', '01/01/2025');
    const akhir = page.locator('#tglakhir');
    await akhir.click();
    await akhir.pressSequentially('30/09/2026');
    await page.keyboard.press('Enter');
    await expect(akhir).toHaveValue('01/01/2026');
    await expect(page.locator('.swal2-popup')).toHaveCount(0);
  });

  test('level 1 menampilkan ringkasan per Provinsi Tujuan tanpa kolom kota asal maupun jumlah order', async ({
    page,
  }) => {
    await cariSCSR(page);

    const header = page.getByRole('columnheader');
    // URL berubah sebelum respons hasil pencarian selesai dirender. Server demo
    // kadang butuh >5 detik dan pada saat itu area konten masih putih polos.
    await expect(header.filter({ hasText: /Provinsi\s*Tujuan/ })).toBeVisible({ timeout: 60_000 });
    for (const pola of [
      /Total\s*Biaya\s*Pengiriman\s*\(Rp\)/,
      /Total\s*Harga\s*Barang\s*\(Rp\)/,
      /Logistic\s*Cost\s*Ratio\s*\(%\)/,
    ]) {
      await expect(header.filter({ hasText: pola })).toBeVisible();
    }
    // Improve poin 1: kota asal HANYA muncul di Detail Kota, bukan di level ini.
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toHaveCount(0);
    // Sisi shipper TIDAK punya kolom Shipper (itu khas admin).
    await expect(header.filter({ hasText: /^\s*Shipper\s*$/ })).toHaveCount(0);

    const { baris, ada } = await tungguBaris(page, /Detail Kota/);
    test.skip(!ada, 'Tidak ada data SCSR pada range tanggal uji');
    await expect(baris.first().getByRole('link', { name: /Detail Kota/ })).toHaveAttribute(
      'href',
      /\/home\/analitikscsrbykota\?kota=true&session_get=exp_[^&]+&PilihPropinsi=\d+&ShipperID=\d+/,
    );
  });

  test('Detail Kota menambahkan kolom Kota / Kab. Asal berpasangan dengan Kota Tujuan & Jumlah Order', async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrbykota/);
    await expect(page.getByText(/DATA\s*ANALITIK\s*:\s*BY\s*KOTA/)).toBeVisible();
    // Blok info level 2 = provinsi tujuan terpilih, BELUM memuat kota asal.
    await expect(page.getByText(/Provinsi\s*Tujuan/).first()).toBeVisible();
    await expect(page.getByText(/^\s*Kota Asal\s*$/)).toHaveCount(0);

    const header = page.getByRole('columnheader');
    // Improve poin 1 & 2.
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toBeVisible();
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Tujuan/ })).toBeVisible();
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toBeVisible();

    // Setiap baris data = satu pasangan Kota Asal → Kota Tujuan dengan jumlah
    // order tersendiri (ketiga sel wajib terisi, jumlah order berupa angka).
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    for (const baris of await kota.baris.all()) {
      const isi = baris.locator('td');
      await expect(isi.nth(1)).toHaveText(/\S/); // Kota / Kab. Asal
      await expect(isi.nth(2)).toHaveText(/\S/); // Kota / Kab. Tujuan
      await expect(isi.nth(3)).toHaveText(/^\s*\d+\s*$/); // Jumlah Order
    }

    // Improve poin 3: kota asal & kota tujuan terpilih diteruskan ke level 3.
    await expect(kota.baris.first().getByRole('link', { name: /Detail Consignee/ })).toHaveAttribute(
      'href',
      /analitikscsrconsignee\?.*PilihKota=\d+.*PilihKotaAsal=\d+/,
    );
  });

  test('angka level 1 sama dengan jumlah seluruh pasangan kota di level 2 (semua provinsi)', async ({
    page,
  }) => {
    test.setTimeout(8 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');

    // Panen level 1 dulu (nilai + href) supaya tidak bolak-balik halaman.
    const ringkasan = await provinsi.baris.evaluateAll((trs) =>
      trs.map((tr) => ({
        cells: Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
        href: tr.querySelector('a[href*="analitikscsrbykota"]')?.getAttribute('href') || '',
      })),
    );
    expect(ringkasan.length, 'butuh minimal 1 provinsi').toBeGreaterThan(0);

    for (const prov of ringkasan) {
      await page.goto(prov.href);
      const kota = await tungguBaris(page, /Detail Consignee/);
      expect(kota.ada, `provinsi ${prov.cells[1]} harus punya baris pasangan kota`).toBe(true);
      const pasangan = await kota.baris.evaluateAll((trs) =>
        trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim())),
      );
      const sumBiaya = pasangan.reduce((a, c) => a + (Number(c[4].replace(/[^\d]/g, '')) || 0), 0);
      const sumHarga = pasangan.reduce((a, c) => a + (Number(c[5].replace(/[^\d]/g, '')) || 0), 0);
      expect(sumBiaya, `Σ biaya pasangan kota ${prov.cells[1]}`).toBe(angka(prov.cells[2]));
      expect(sumHarga, `Σ harga barang pasangan kota ${prov.cells[1]}`).toBe(angka(prov.cells[3]));
    }
  });

  test('Jumlah Order & angka pasangan kota sama dengan detail consignee-nya, dan antar pasangan disjoint', async ({
    page,
  }) => {
    test.setTimeout(8 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    const hrefProvinsi = await provinsi.baris.evaluateAll((trs) =>
      trs.map((tr) => tr.querySelector('a[href*="analitikscsrbykota"]')?.getAttribute('href') || ''),
    );

    // Cari provinsi dengan >= 2 pasangan kota (bukti terkuat improve: satu kota
    // tujuan bisa punya beberapa kota asal). Kalau tidak ada, pakai yang pertama.
    let target = { href: hrefProvinsi[0], pasangan: [] as string[][] };
    for (const href of hrefProvinsi) {
      await page.goto(href);
      const kota = await tungguBaris(page, /Detail Consignee/);
      if (!kota.ada) continue;
      const rows = await kota.baris.evaluateAll((trs) =>
        trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim())),
      );
      if (rows.length >= 2) {
        target = { href, pasangan: rows };
        break;
      }
      if (!target.pasangan.length) target = { href, pasangan: rows };
    }
    expect(target.pasangan.length, 'butuh minimal 1 pasangan kota').toBeGreaterThan(0);

    await page.goto(target.href);
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada).toBe(true);
    const daftar = await kota.baris.evaluateAll((trs) =>
      trs.map((tr) => ({
        cells: Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
        href: tr.querySelector('a[href*="analitikscsrconsignee"]')?.getAttribute('href') || '',
      })),
    );

    const semuaOrder: string[] = [];
    for (const pasangan of daftar) {
      const jumlahOrder = Number(pasangan.cells[3]);
      await page.goto(pasangan.href);
      await expect(barisOrder(page), `jumlah baris order pasangan ${pasangan.cells[1]} → ${pasangan.cells[2]}`).toHaveCount(
        jumlahOrder,
        { timeout: 60_000 },
      );
      const order = await barisOrder(page).evaluateAll((trs) =>
        trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim())),
      );
      const sumBiaya = order.reduce((a, c) => a + (Number(c[4].replace(/[^\d]/g, '')) || 0), 0);
      const sumHarga = order.reduce((a, c) => a + (Number(c[5].replace(/[^\d]/g, '')) || 0), 0);
      expect(sumBiaya, `Σ biaya order pasangan ${pasangan.cells[1]} → ${pasangan.cells[2]}`).toBe(angka(pasangan.cells[4]));
      expect(sumHarga, `Σ harga order pasangan ${pasangan.cells[1]} → ${pasangan.cells[2]}`).toBe(angka(pasangan.cells[5]));
      semuaOrder.push(...order.map((c) => c[1]));
    }
    // Satu order boleh muncul di beberapa PROVINSI (order multidrop: satu drop
    // per provinsi, biayanya dibagi), tapi TIDAK BOLEH muncul dua kali di dalam
    // satu provinsi — itu tanda dobel hitung.
    expect(new Set(semuaOrder).size, `order dobel di satu provinsi: ${semuaOrder.join(',')}`).toBe(semuaOrder.length);
  });

  test('Detail Consignee memuat blok info pasangan kota terpilih dan tanpa kolom kota asal', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    const barisKota = kota.baris.first();
    const [, kotaAsal, kotaTujuan, jumlahOrderTeks] = await sel(barisKota);
    const jumlahOrder = Number(jumlahOrderTeks);
    expect(jumlahOrder, 'Jumlah Order harus angka > 0').toBeGreaterThan(0);
    await barisKota.getByRole('link', { name: /Detail Consignee/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrconsignee/);
    await expect(page.getByText(/DETAIL\s*DATA\s*CONSIGNEE/)).toBeVisible();

    // Blok info "DATA BY PROVINSI" = jejak pasangan kota yang diklik (improve).
    // Blok info "DATA BY PROVINSI" tidak punya wrapper class khas (bukan
    // .main-card) → assertion dilakukan atas teks halaman dengan regex yang
    // menyertakan NILAI-nya, jadi tetap spesifik.
    const blok = page.locator('body');
    await expect(blok).toContainText(new RegExp(`Kota Asal\\s*:?\\s*${kotaAsal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await expect(blok).toContainText(new RegExp(`Kota Tujuan\\s*:?\\s*${kotaTujuan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await expect(blok).toContainText(new RegExp(`Total Order\\s*:?\\s*${jumlahOrder}\\b`));
    await expect(blok).toContainText(/Tanggal Permintaan Muat\s*:?\s*01\/01\/2026 - 30\/09\/2026/);

    const header = page.getByRole('columnheader');
    for (const pola of [/ID\s*Order/, /Consignee/, /Alamat\s*Tujuan/, /Logistic\s*Cost\s*Ratio\s*\(%\)/]) {
      await expect(header.filter({ hasText: pola })).toBeVisible();
    }
    // Improve poin 4: tidak ada kolom kota asal/tujuan di level consignee.
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Tujuan/ })).toHaveCount(0);

    // Improve poin 3: jumlah baris order = Jumlah Order pasangan kota terpilih
    // (halaman ini tanpa pagination — terverifikasi saat kalibrasi).
    await expect(barisOrder(page)).toHaveCount(jumlahOrder, { timeout: 60_000 });
  });

  test('kolom Kota / Kab. Asal bisa disortir naik dan turun', async ({ page }) => {
    test.setTimeout(5 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    const hrefProvinsi = await provinsi.baris.evaluateAll((trs) =>
      trs.map((tr) => tr.querySelector('a[href*="analitikscsrbykota"]')?.getAttribute('href') || ''),
    );

    // Butuh provinsi dengan >= 2 pasangan supaya urutan bisa dinilai.
    let kotaAsalAwal: string[] = [];
    for (const href of hrefProvinsi) {
      await page.goto(href);
      const kota = await tungguBaris(page, /Detail Consignee/);
      if (!kota.ada) continue;
      const nilai = await kota.baris.evaluateAll((trs) =>
        trs.map((tr) => (tr.querySelectorAll('td')[1] as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
      );
      if (nilai.length >= 2) {
        kotaAsalAwal = nilai;
        break;
      }
    }
    test.skip(kotaAsalAwal.length < 2, 'Tidak ada provinsi dengan >= 2 pasangan kota asal di data demo');

    // Sortir memakai POST /home/searchanalitikscsrkota (sortBy=kota_asal).
    const kolom = page.locator('th', { hasText: /Kota \/ Kab\. Asal/ }).first();
    const bacaKolom = async () =>
      barisDenganAksi(page, /Detail Consignee/).evaluateAll((trs) =>
        trs.map((tr) => (tr.querySelectorAll('td')[1] as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
      );

    const [reqAsc] = await Promise.all([
      page.waitForRequest((r) => /searchanalitikscsrkota/.test(r.url()), { timeout: 30_000 }),
      kolom.click(),
    ]);
    expect(reqAsc.postData() || '').toContain('sortBy=kota_asal');
    await expect(async () => {
      const naik = await bacaKolom();
      expect(naik).toEqual([...naik].sort((a, b) => a.localeCompare(b, 'id')));
    }).toPass({ timeout: 30_000, intervals: [500, 1000, 2000] });

    await kolom.click();
    await expect(async () => {
      const turun = await bacaKolom();
      expect(turun).toEqual([...turun].sort((a, b) => b.localeCompare(a, 'id')));
    }).toPass({ timeout: 30_000, intervals: [500, 1000, 2000] });
  });

  test.fail(
    'DEFECT: nomor urut baris tidak mengikuti hasil sortir kolom Kota Asal',
    async ({ page }) => {
      // Teramati 2026-09-28: setelah sortir, kolom "No" tetap membawa nomor lama
      // (baris pertama bisa bernomor 2) sehingga penomoran tidak berurutan.
      test.setTimeout(5 * 60_000);
      await cariSCSR(page);
      const provinsi = await tungguBaris(page, /Detail Kota/);
      test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
      const hrefProvinsi = await provinsi.baris.evaluateAll((trs) =>
        trs.map((tr) => tr.querySelector('a[href*="analitikscsrbykota"]')?.getAttribute('href') || ''),
      );
      let siap = false;
      for (const href of hrefProvinsi) {
        await page.goto(href);
        const kota = await tungguBaris(page, /Detail Consignee/);
        if (kota.ada && (await kota.baris.count()) >= 2) {
          siap = true;
          break;
        }
      }
      test.skip(!siap, 'Tidak ada provinsi dengan >= 2 pasangan kota asal di data demo');

      await page.locator('th', { hasText: /Kota \/ Kab\. Asal/ }).first().click();
      await page.waitForTimeout(4000);
      const nomor = await barisDenganAksi(page, /Detail Consignee/).evaluateAll((trs) =>
        trs.map((tr) => (tr.querySelectorAll('td')[0] as HTMLElement).innerText.trim()),
      );
      expect(nomor).toEqual(nomor.map((_, i) => String(i + 1)));
    },
  );

  test('file Export Excel ketiga level memuat kota asal', async ({ page }, testInfo) => {
    test.setTimeout(8 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');

    /** Klik Export Data By → Export Excel, simpan, kembalikan worksheet pertama. */
    const unduhExcel = async (nama: string) => {
      const tombolExport = page.getByRole('button', { name: /Export Data By/i }).filter({ visible: true }).first();
      await tombolExport.click();
      const item = page.getByRole('link', { name: /Export Excel/i }).filter({ visible: true }).first();
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120_000 }), item.click()]);
      const file = testInfo.outputPath(`${nama}.xlsx`);
      await dl.saveAs(file);
      // Bootstrap tidak selalu menutup dropdown setelah klik link download.
      // Bila dibiarkan terbuka, menu Export PDF menutupi link drill-down.
      if (await item.isVisible()) await tombolExport.click();
      await expect(item).toBeHidden();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(file);
      const ws = wb.worksheets[0];
      const baris: string[][] = [];
      ws.eachRow((row) =>
        baris.push(
          (row.values as unknown[])
            .slice(1)
            .map((v) => (v && typeof v === 'object' ? String((v as { text?: string }).text ?? '') : String(v ?? ''))),
        ),
      );
      return baris;
    };

    // Level 1: export berupa daftar order datar; kolom pertama setelah No
    // adalah Kota/Kab. Asal (improve ikut ke file export).
    const l1 = await unduhExcel('export-level1');
    const headerL1 = l1.find((r) => r.some((c) => /ID Order/i.test(c)));
    expect(headerL1, 'header tabel export level 1').toBeTruthy();
    expect(headerL1!.some((c) => /Kota\s*\/?\s*Kab\.\s*Asal/i.test(c)), `header level 1: ${headerL1!.join(' | ')}`).toBe(true);
    const iAsal = headerL1!.findIndex((c) => /Kota\s*\/?\s*Kab\.\s*Asal/i.test(c));
    const dataL1 = l1.slice(l1.indexOf(headerL1!) + 1).filter((r) => /\d{8}-\d{5}/.test(r.join(' ')));
    expect(dataL1.length, 'export level 1 harus punya baris order').toBeGreaterThan(0);
    for (const r of dataL1) expect(r[iAsal].trim(), `kota asal kosong di baris ${r.join(' | ')}`).not.toBe('');

    // Level 2: kolom Kota / Kab. Asal + Kota / Kab. Tujuan + Jumlah Order.
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada).toBe(true);
    const l2 = await unduhExcel('export-level2');
    const headerL2 = l2.find((r) => r.some((c) => /Jumlah Order/i.test(c)));
    expect(headerL2, 'header tabel export level 2').toBeTruthy();
    expect(headerL2!.some((c) => /Kota\s*\/?\s*Kab\.\s*Asal/i.test(c))).toBe(true);

    // Level 3: kota asal tampil di blok informasi (bukan kolom).
    await kota.baris.first().getByRole('link', { name: /Detail Consignee/ }).click();
    await expect(barisOrder(page).first()).toBeVisible({ timeout: 60_000 });
    const l3 = await unduhExcel('export-level3');
    const teksL3 = l3.map((r) => r.join(' ')).join('\n');
    expect(teksL3).toMatch(/Kota Asal\s*:?\s*\S/);
    expect(l3.find((r) => r.some((c) => /ID Order/i.test(c)))!.some((c) => /Kota\s*\/?\s*Kab\.\s*Asal/i.test(c))).toBe(false);
  });

  test.fail('DEFECT: Logistic Cost Ratio baris TOTAL di file export masih angka mentah', async ({
    page,
  }, testInfo) => {
    // Baris data memakai format "0.01 %", baris TOTAL memakai pecahan mentah
    // (mis. 0.000015632293568188) — terjadi di ketiga level export (2026-09-28).
    test.setTimeout(5 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada).toBe(true);

    await page.getByRole('button', { name: /Export Data By/i }).filter({ visible: true }).first().click();
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 120_000 }),
      page.getByRole('link', { name: /Export Excel/i }).filter({ visible: true }).first().click(),
    ]);
    const file = testInfo.outputPath('export-total.xlsx');
    await dl.saveAs(file);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    const ws = wb.worksheets[0];
    const terakhir = ws.getRow(ws.rowCount);
    const nilai = (terakhir.values as unknown[]).slice(1).map((v) => String(v ?? ''));
    const ratio = nilai[nilai.length - 1];
    expect(ratio, `nilai ratio baris TOTAL: ${ratio}`).toMatch(/%/);
  });

  test.fail('DEFECT: baris TOTAL level 2 tidak menjumlahkan kolom Jumlah Order', async ({ page }) => {
    // Kolom baru "Jumlah Order" tidak ikut ditotal (sel kosong), padahal biaya,
    // harga barang, dan ratio ditotal. Terjadi di layar maupun file export.
    test.setTimeout(5 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada).toBe(true);
    const totalPasangan = (
      await kota.baris.evaluateAll((trs) => trs.map((tr) => Number((tr.querySelectorAll('td')[3] as HTMLElement).innerText.trim()) || 0))
    ).reduce((a, b) => a + b, 0);

    // Baris TOTAL = baris tanpa link aksi tapi punya nilai uang.
    const barisTotal = page
      .locator('table tbody tr')
      .filter({ hasNot: page.getByRole('link', { name: /Detail Consignee/ }) })
      .filter({ hasText: /\d\.\d{3}/ })
      .last();
    await expect(barisTotal).toContainText(new RegExp(`\\b${totalPasangan}\\b`));
  });

  test('parameter URL milik shipper/kota lain tidak membuka data shipper lain', async ({ page }) => {
    // Pengaman scope: level 2 & 3 hanya boleh menampilkan data shipper yang
    // sedang login, walau ShipperID / PilihKota / PilihKotaAsal diganti manual.
    test.setTimeout(6 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    const contoh = await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).getAttribute('href');
    const sesi = (contoh!.match(/session_get=exp_[^&]+/) || [''])[0];
    const provinsiSendiri = await provinsi.baris.evaluateAll((trs) =>
      trs.map((tr) => (tr.querySelector('a[href*="analitikscsrbykota"]')?.getAttribute('href') || '').match(/PilihPropinsi=(\d+)/)?.[1] || ''),
    );
    // Kalimantan Timur (17) di demo hanya dipunyai shipper LAIN (Haier 277 &
    // Katalisator 26) — kalau suatu saat shipper login punya data di sana,
    // pilih provinsi lain yang bukan miliknya.
    const provinsiAsing = ['17', '23', '31', '7', '15'].find((id) => !provinsiSendiri.includes(id));
    test.skip(!provinsiAsing, 'Tidak ada provinsi pembanding yang bukan milik shipper login');

    for (const shipperId of ['26', '277']) {
      await page.goto(
        `/home/analitikscsrbykota?kota=true&${sesi}&PilihPropinsi=${provinsiAsing}&ShipperID=${shipperId}`,
      );
      await expect(page.getByText(/Tidak Ada Data yang tersedia/i)).toBeVisible({ timeout: 60_000 });
      await expect(barisDenganAksi(page, /Detail Consignee/)).toHaveCount(0);
    }
    // Level 3 dengan pasangan kota milik shipper lain (Balikpapan ← Surabaya).
    await page.goto(
      `/home/analitikscsrconsignee?kota=true&kota=true&${sesi}&PilihPropinsi=17&ShipperID=26&PilihKota=303&PilihKotaAsal=347`,
    );
    await expect(page.getByText(/Tidak Ada Data yang tersedia/i)).toBeVisible({ timeout: 60_000 });
    await expect(barisOrder(page)).toHaveCount(0);
  });

  test('level 3 tanpa parameter PilihKotaAsal jatuh ke data kota tujuan (tanpa filter asal)', async ({
    page,
  }) => {
    // Perilaku teramati 2026-09-28 (bukan error): parameter kota asal opsional
    // di server; blok info menghilangkan baris "Kota Asal" dan tabel memuat
    // seluruh order kota tujuan tersebut. Didokumentasikan supaya perubahan
    // perilaku (mis. kelak divalidasi) langsung terdeteksi.
    test.setTimeout(6 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada).toBe(true);
    const href = await kota.baris.first().getByRole('link', { name: /Detail Consignee/ }).getAttribute('href');
    const jumlahOrder = Number((await sel(kota.baris.first()))[3]);

    await page.goto(href!.replace(/&PilihKotaAsal=\d+/, ''));
    await expect(barisOrder(page).first()).toBeVisible({ timeout: 60_000 });
    // Blok info "DATA BY PROVINSI" tidak punya wrapper class khas (bukan
    // .main-card) → assertion dilakukan atas teks halaman dengan regex yang
    // menyertakan NILAI-nya, jadi tetap spesifik.
    const blok = page.locator('body');
    await expect(blok).not.toContainText(/Kota Asal/);
    expect(await barisOrder(page).count()).toBeGreaterThanOrEqual(jumlahOrder);

    // PilihKotaAsal yang tidak dikenal → kosong, dan label kota asal tanpa nama.
    await page.goto(href!.replace(/PilihKotaAsal=\d+/, 'PilihKotaAsal=99999'));
    await expect(page.getByText(/Tidak Ada Data yang tersedia/i)).toBeVisible({ timeout: 60_000 });
    await expect(blok).toContainText(/Kota Asal\s*:?\s*\(Provinsi\s*:\s*-\)/);
  });
});
