import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Analitik → Shipping Cost Sales Ratio (SCSR) — peran Administrator
 * (project "admin", storageState .auth/admin.json via setup). READ-ONLY.
 * Rule: docs/rules/analitik-scsr.md (hasil kalibrasi — modul Analitik TIDAK ada
 * di dokumen rule sumber).
 *
 * Sisi admin menguji improve 2026-09 yang sama dengan tests/shipper/analitik-scsr.spec.ts
 * (kolom Kota Asal di Detail Kota, Jumlah Order per pasangan kota, filter
 * diteruskan ke Detail Consignee, consignee tanpa kolom kota asal) DITAMBAH
 * pembeda khas admin.
 *
 * AUDIT MENDALAM 2026-09-28 menambahkan:
 * - uji SUMBER KEBENARAN: nilai "Kota / Kab. Asal" & "Kota / Kab. Tujuan" wajib
 *   sama dengan field order (`#kota_asal` / `#kota_tujuan[]` di halaman Edit
 *   Data Order) — membuktikan improve membaca data order, bukan menebak dari
 *   pelabuhan/alamat (alamat di data demo memang sering tak sinkron dgn kota);
 * - opsi "Pilih Semua" pada dropdown Shipper (tidak terdokumentasi sebelumnya);
 * - DEFECT drill-down lintas shipper (lihat dua test.fail di bawah);
 * - perilaku session_get yang tidak dikenal.
 *
 * Kalibrasi ke halaman asli (2026-09-26, diperdalam 2026-09-28):
 * - Menu ANALITIK admin punya 5 submenu: Ringkasan Analitik
 *   (/dashboardanalitik/ringkasan), Shipping Cost Sales Ratio
 *   (/home/analitikscsr — route SAMA dengan shipper), Freight Cost
 *   (/analitik/analitikfcu), On Time Delivery Rate (/analitik/analitikotdr),
 *   Shipment Accuracy (/home/analitikshipmentaccuracy).
 * - Form admin punya filter WAJIB "Shipper *" yang tidak ada di sisi shipper.
 * - Ketiga dropdown = widget custom `.multi-select` dengan id `#ProvinsiID`,
 *   `#Consignee`, `#BidOwnerID`. BUKAN <select> native → selectOption() tidak
 *   berlaku: klik `.multi-select-header`, lalu klik `[role=option]`
 *   (punya data-value = ID). Opsi pertama = "Pilih Semua" (data-value null)
 *   yang mencentang keempat shipper sekaligus (header jadi "4 Data Terpilih").
 * - Dropdown Shipper memuat 4 shipper (Ducati Racing Team PNP/287, Haier Sales
 *   Indonesia/277, Cipta Karya…/65, Katalisator Asa Indonesia - Manuva/26).
 *   Hanya 3 yang punya data SCSR di demo (Ducati kosong).
 * - Level 1 sisi admin SELALU punya kolom "Shipper" (beda dari sisi shipper).
 * - Jebakan locator sama dengan sisi shipper: tombol Cari = `#lanjutcari`,
 *   teks header terpecah antar-<span> tanpa spasi → regex WAJIB `\s*` antar
 *   kata, baris hasil dimuat ASYNC → wajib poll (baris "Mohon tunggu sebentar"
 *   BUKAN penanda selesai), dan panel `.multi-select-options` tetap terbuka
 *   menutupi tombol Cari sampai header diklik ulang (Escape tidak bekerja).
 */

const DARI = '01/01/2026';
const SAMPAI = '30/09/2026';
/** Shipper yang terbukti punya data SCSR saat kalibrasi (dipilih via nama, bukan index). */
const SHIPPER_UJI = 'PT. Cipta Karya Abadi Sejahtera Sentora Mujur Selalu';

const angka = (teks: string): number => Number(String(teks).replace(/[^\d]/g, '')) || 0;

async function isiTanggal(page: Page, id: string, nilai: string): Promise<void> {
  const input = page.locator(`#${id}`);
  await input.click();
  await input.pressSequentially(nilai);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue(nilai);
}

const barisDenganAksi = (page: Page, teksAksi: RegExp): Locator =>
  page.locator('table tbody tr').filter({ has: page.getByRole('link', { name: teksAksi }) });

const barisOrder = (page: Page): Locator =>
  page.locator('table tbody tr').filter({ has: page.locator('a[href*="order/orderdetail"]') });

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

/** Pilih satu opsi pada dropdown Shipper lalu TUTUP panelnya. */
async function pilihShipper(page: Page, nama: string): Promise<void> {
  const header = page.locator('#BidOwnerID .multi-select-header');
  await header.click();
  await page.locator('#BidOwnerID').getByRole('option', { name: nama, exact: true }).first().click();
  // WAJIB tutup dropdown: setelah opsi dipilih, panel `.multi-select-options`
  // TETAP terbuka dan MENUTUPI tombol #lanjutcari sehingga klik Cari
  // ter-intercept selamanya (terbukti: 3 test timeout 150-180 dtk, 2026-09-26).
  // Escape TIDAK menutupnya — yang bekerja hanya klik header sekali lagi.
  await header.click();
  await expect(page.locator('#BidOwnerID .multi-select-options')).toBeHidden();
}

async function cariSCSR(page: Page, shipper: string = SHIPPER_UJI): Promise<void> {
  await page.goto('/home/analitikscsr');
  await isiTanggal(page, 'tglawal', DARI);
  await isiTanggal(page, 'tglakhir', SAMPAI);
  await pilihShipper(page, shipper);
  await page.locator('#lanjutcari').click();
  await expect(page).toHaveURL(/session_get=exp_/, { timeout: 60_000 });
}

const sel = async (baris: Locator): Promise<string[]> =>
  baris.evaluate((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim()));

test.describe('Analitik SCSR (Admin)', () => {
  test('menu Analitik admin memuat lima submenu analitik', async ({ page }) => {
    await page.goto('/lelang/listlelang');
    // Item dropdown yang belum dibuka TIDAK punya role (gotcha berulang di repo
    // ini) → ambil lewat CSS href, lalu cocokkan teksnya.
    const submenu: [string, string][] = [
      ['Ringkasan Analitik', 'dashboardanalitik/ringkasan'],
      ['Shipping Cost Sales Ratio', 'home/analitikscsr'],
      ['Freight Cost', 'analitik/analitikfcu'],
      ['On Time Delivery Rate', 'analitik/analitikotdr'],
      ['Shipment Accuracy', 'home/analitikshipmentaccuracy'],
    ];
    for (const [nama, hrefBagian] of submenu) {
      await expect(page.locator(`a[href*="${hrefBagian}"]`).first()).toHaveText(new RegExp(nama, 'i'));
    }
  });

  test('form admin mewajibkan filter Shipper dan menyediakan opsi Pilih Semua', async ({ page }) => {
    await page.goto('/home/analitikscsr');
    await expect(page.locator('.heading_1', { hasText: /SHIPPING COST SALES RATIO/i })).toBeVisible();
    await expect(page.getByText(/Shipper\s*\*/).first()).toBeVisible();
    const header = page.locator('.multi-select-header');
    await expect(header.filter({ hasText: /Pilih\s*Shipper/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Provinsi/ })).toBeVisible();
    await expect(header.filter({ hasText: /Pilih\s*Nama\s*Consignee/ })).toBeVisible();
    // Opsi shipper dimuat sebagai [role=option] dengan data-value = ShipperID.
    const opsi = page.locator('#BidOwnerID [role="option"]');
    expect(await opsi.count(), 'Dropdown Shipper harus punya opsi').toBeGreaterThan(0);
    await expect(opsi.filter({ hasText: SHIPPER_UJI })).toHaveAttribute('data-value', /^\d+$/);
    // Opsi "Pilih Semua" mencentang seluruh shipper (header jadi "N Data Terpilih").
    // hasText memakai teks MENTAH (tanpa normalisasi whitespace) → regex
    // berjangkar WAJIB `\s*` di kedua ujung.
    await expect(opsi.filter({ hasText: /^\s*Pilih Semua\s*$/ })).toHaveCount(1);
    await pilihShipper(page, 'Pilih Semua');
    await expect(page.locator('#BidOwnerID .multi-select-header')).toContainText(/\d+ Data Terpilih/);
  });

  test('level 1 per Provinsi Tujuan punya kolom Shipper, tanpa kolom kota asal', async ({ page }) => {
    test.setTimeout(150_000);
    await cariSCSR(page);

    const header = page.getByRole('columnheader');
    for (const pola of [
      /^\s*Shipper\s*$/,
      /Provinsi\s*Tujuan/,
      /Total\s*Biaya\s*Pengiriman\s*\(Rp\)/,
      /Total\s*Harga\s*Barang\s*\(Rp\)/,
      /Logistic\s*Cost\s*Ratio\s*\(%\)/,
    ]) {
      await expect(header.filter({ hasText: pola })).toBeVisible();
    }
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toHaveCount(0);

    const { baris, ada } = await tungguBaris(page, /Detail Kota/);
    test.skip(!ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
    await expect(baris.first()).toContainText(SHIPPER_UJI);
    await expect(baris.first().getByRole('link', { name: /Detail Kota/ })).toHaveAttribute(
      'href',
      /analitikscsrbykota\?kota=true&session_get=exp_[^&]+&PilihPropinsi=\d+&ShipperID=\d+/,
    );
  });

  test('Detail Kota admin menampilkan pasangan Kota Asal → Kota Tujuan dengan Jumlah Order', async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrbykota/);
    // Blok info khas admin: baris "Shipper".
    // Blok info "DATA BY PROVINSI" tidak punya wrapper class khas (bukan
    // .main-card) → assertion dilakukan atas teks halaman dengan regex yang
    // menyertakan NILAI-nya, jadi tetap spesifik.
    const blok = page.locator('body');
    await expect(blok).toContainText(SHIPPER_UJI);
    const header = page.getByRole('columnheader');
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toBeVisible();
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Tujuan/ })).toBeVisible();
    await expect(header.filter({ hasText: /Jumlah\s*Order/ })).toBeVisible();

    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    for (const baris of await kota.baris.all()) {
      const isi = baris.locator('td');
      await expect(isi.nth(1)).toHaveText(/\S/);
      await expect(isi.nth(2)).toHaveText(/\S/);
      await expect(isi.nth(3)).toHaveText(/^\s*\d+\s*$/);
    }
    await expect(kota.baris.first().getByRole('link', { name: /Detail Consignee/ })).toHaveAttribute(
      'href',
      /analitikscsrconsignee\?.*PilihKota=\d+.*PilihKotaAsal=\d+/,
    );
  });

  test('Detail Consignee admin sesuai pasangan kota terpilih dan tanpa kolom kota asal', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();

    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada, 'Detail Kota harus punya minimal 1 baris data').toBe(true);
    const barisKota = kota.baris.first();
    const [, kotaAsal, kotaTujuan, jumlahTeks, biaya, harga] = await sel(barisKota);
    const jumlahOrder = Number(jumlahTeks);
    expect(jumlahOrder).toBeGreaterThan(0);
    await barisKota.getByRole('link', { name: /Detail Consignee/ }).click();

    await expect(page).toHaveURL(/\/home\/analitikscsrconsignee/);
    await expect(page.getByText(/DETAIL\s*DATA\s*CONSIGNEE/)).toBeVisible();
    // Blok info "DATA BY PROVINSI" tidak punya wrapper class khas (bukan
    // .main-card) → assertion dilakukan atas teks halaman dengan regex yang
    // menyertakan NILAI-nya, jadi tetap spesifik.
    const blok = page.locator('body');
    await expect(blok).toContainText(SHIPPER_UJI);
    await expect(blok).toContainText(new RegExp(`Kota Asal\\s*:?\\s*${kotaAsal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await expect(blok).toContainText(new RegExp(`Kota Tujuan\\s*:?\\s*${kotaTujuan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await expect(blok).toContainText(new RegExp(`Total Order\\s*:?\\s*${jumlahOrder}\\b`));

    const header = page.getByRole('columnheader');
    for (const pola of [/ID\s*Order/, /Consignee/, /Alamat\s*Tujuan/]) {
      await expect(header.filter({ hasText: pola })).toBeVisible();
    }
    await expect(header.filter({ hasText: /Kota\s*\/\s*Kab\.\s*Asal/ })).toHaveCount(0);

    await expect(barisOrder(page)).toHaveCount(jumlahOrder, { timeout: 60_000 });
    // Σ angka order = angka pasangan kota di level 2 (tidak ada dobel hitung).
    const order = await barisOrder(page).evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim())),
    );
    expect(order.reduce((a, c) => a + angka(c[4]), 0)).toBe(angka(biaya));
    expect(order.reduce((a, c) => a + angka(c[5]), 0)).toBe(angka(harga));
  });

  test('nilai Kota Asal & Kota Tujuan sama dengan field order di Edit Data Order', async ({ page }) => {
    // Uji sumber kebenaran improve: kota asal/tujuan pada analitik = field
    // `kota_asal` / `kota_tujuan[]` milik order, BUKAN kota pelabuhan atau teks
    // alamat (di data demo keduanya sering tidak sinkron — mis. order
    // 20260811-06501 berpelabuhan Dobo→Belawan tapi kota_asal = Kab. Deli
    // Serdang). Halaman Edit Data Order dipakai sebagai pembanding: hanya
    // DIBUKA (GET), tidak pernah disubmit; sebagian order (mis. ORDER SELESAI)
    // menolak dibuka → ditelusuri sampai ketemu yang bisa.
    test.setTimeout(8 * 60_000);
    await cariSCSR(page);
    const provinsi = await tungguBaris(page, /Detail Kota/);
    test.skip(!provinsi.ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
    await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();
    const kota = await tungguBaris(page, /Detail Consignee/);
    expect(kota.ada).toBe(true);
    const pasangan = await kota.baris.first().evaluate((tr) => ({
      asal: (tr.querySelectorAll('td')[1] as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
      tujuan: (tr.querySelectorAll('td')[2] as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
      href: tr.querySelector('a[href*="analitikscsrconsignee"]')?.getAttribute('href') || '',
    }));
    await page.goto(pasangan.href);
    await expect(barisOrder(page).first()).toBeVisible({ timeout: 60_000 });
    const hash = await barisOrder(page).evaluateAll((trs) =>
      trs.map((tr) => (tr.querySelector('a[href*="order/orderdetail"]')?.getAttribute('href') || '').split('/').pop() || ''),
    );

    let diuji = false;
    for (const h of hash.slice(0, 6)) {
      await page.goto(`/order/edit_inputpesanan/${h}`);
      await page.waitForLoadState('domcontentloaded');
      if (!page.url().includes('edit_inputpesanan')) continue; // ditolak utk status tertentu
      const kotaAsal = page.locator('#kota_asal');
      await expect(kotaAsal).toBeVisible({ timeout: 30_000 });
      const teksAsal = await kotaAsal.locator('option:checked').innerText();
      expect(teksAsal.trim(), 'kota asal order vs kolom Kota / Kab. Asal').toBe(pasangan.asal);
      const tujuan = await page
        .locator('select[name="kota_tujuan[]"]')
        .evaluateAll((els) => els.map((e) => (e as HTMLSelectElement).selectedOptions[0]?.textContent?.trim() || ''));
      expect(tujuan, 'kota tujuan order harus memuat kota tujuan pasangan').toContain(pasangan.tujuan);
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order pada pasangan kota ini yang halaman Edit Data Order-nya bisa dibuka');
  });

  test.fail(
    'DEFECT: Detail Kota mengabaikan ShipperID baris saat beberapa shipper dipilih',
    async ({ page }) => {
      // Dengan opsi "Pilih Semua" (atau >1 shipper), klik Detail Kota pada baris
      // shipper A membuka halaman ber-ShipperID=A, blok infonya benar (nama +
      // total shipper A), TAPI tabelnya memuat pasangan kota milik shipper lain
      // sehingga baris TOTAL tabel ≠ total di blok info pada halaman yang sama.
      // Terbukti 2026-09-28: Haier + Kalimantan Timur → blok info 7.000.000,
      // tabel 2 baris dengan TOTAL 52.800.000 (45.800.000 milik Katalisator).
      test.setTimeout(8 * 60_000);
      await cariSCSR(page, 'Pilih Semua');
      const provinsi = await tungguBaris(page, /Detail Kota/);
      test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');

      // Cari provinsi yang muncul untuk >1 shipper (di situ kebocorannya terlihat).
      const baris = await provinsi.baris.evaluateAll((trs) =>
        trs.map((tr) => ({
          shipper: (tr.querySelectorAll('td')[1] as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
          provinsi: (tr.querySelectorAll('td')[2] as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
          biaya: (tr.querySelectorAll('td')[3] as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
          href: tr.querySelector('a[href*="analitikscsrbykota"]')?.getAttribute('href') || '',
        })),
      );
      const hitung: Record<string, number> = {};
      baris.forEach((b) => {
        hitung[b.provinsi] = (hitung[b.provinsi] || 0) + 1;
      });
      const target = baris.find((b) => hitung[b.provinsi] > 1);
      test.skip(!target, 'Tidak ada provinsi yang dipakai lebih dari satu shipper di data demo');

      await page.goto(target!.href);
      const kota = await tungguBaris(page, /Detail Consignee/);
      expect(kota.ada).toBe(true);
      const totalPasangan = (
        await kota.baris.evaluateAll((trs) =>
          trs.map((tr) => Number((tr.querySelectorAll('td')[4] as HTMLElement).innerText.replace(/[^\d]/g, '')) || 0),
        )
      ).reduce((a, b) => a + b, 0);
      expect(
        totalPasangan,
        `total pasangan kota (${totalPasangan}) harus sama dengan total baris level 1 shipper ${target!.shipper} (${target!.biaya})`,
      ).toBe(angka(target!.biaya));
    },
  );

  test.fail(
    'DEFECT: Detail Consignee lintas shipper menampilkan order milik shipper lain',
    async ({ page }) => {
      // Lanjutan defect di atas: pasangan kota "asing" bisa di-drill sampai
      // level 3 dan blok infonya tetap menulis nama shipper yang dipilih,
      // padahal ordernya milik shipper lain (terbukti 2026-09-28: order
      // 20260829-02603 / 20260625-02604 milik Katalisator tampil di halaman
      // ber-blok info "PT. Haier Sales Indonesia").
      test.setTimeout(8 * 60_000);
      await cariSCSR(page, 'Pilih Semua');
      const provinsi = await tungguBaris(page, /Detail Kota/);
      test.skip(!provinsi.ada, 'Tidak ada data SCSR pada range tanggal uji');
      const baris = await provinsi.baris.evaluateAll((trs) =>
        trs.map((tr) => ({
          shipper: (tr.querySelectorAll('td')[1] as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
          provinsi: (tr.querySelectorAll('td')[2] as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
          href: tr.querySelector('a[href*="analitikscsrbykota"]')?.getAttribute('href') || '',
        })),
      );
      const hitung: Record<string, number> = {};
      baris.forEach((b) => {
        hitung[b.provinsi] = (hitung[b.provinsi] || 0) + 1;
      });
      const target = baris.find((b) => hitung[b.provinsi] > 1);
      test.skip(!target, 'Tidak ada provinsi yang dipakai lebih dari satu shipper di data demo');

      await page.goto(target!.href);
      const kota = await tungguBaris(page, /Detail Consignee/);
      expect(kota.ada).toBe(true);
      const href = await kota.baris.evaluateAll((trs) =>
        trs.map((tr) => tr.querySelector('a[href*="analitikscsrconsignee"]')?.getAttribute('href') || ''),
      );
      // Setiap order yang tampil harus dipesan oleh shipper di blok info.
      for (const h of href) {
        await page.goto(h);
        await expect(barisOrder(page).first()).toBeVisible({ timeout: 60_000 });
        const hash = await barisOrder(page).evaluateAll((trs) =>
          trs.map((tr) => (tr.querySelector('a[href*="order/orderdetail"]')?.getAttribute('href') || '').split('/').pop() || ''),
        );
        for (const x of hash.slice(0, 2)) {
          await page.goto(`/order/orderdetail/${x}`);
          await expect(page.getByText(/DETAIL PEMESAN/i).first()).toBeVisible({ timeout: 30_000 });
          const teks = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
          expect(teks, `order ${x} harus milik ${target!.shipper}`).toContain(target!.shipper);
        }
      }
    },
  );

  test.fail(
    'DEFECT: session_get tak dikenal → blok info memakai data tanpa filter tanggal, tabel kosong',
    async ({ page }) => {
      // Dibuka dengan session pencarian yang tidak ada (mis. link lama/bookmark):
      // blok info menulis "Tanggal Permintaan Muat : -" lalu menampilkan Total
      // Order & total biaya SELURUH periode (247 order / 2.176.696.260 saat
      // kalibrasi) sementara tabel detailnya tidak memuat satu baris pun —
      // halaman jadi saling bertentangan dan tanpa pesan kesalahan.
      test.setTimeout(6 * 60_000);
      await cariSCSR(page);
      const provinsi = await tungguBaris(page, /Detail Kota/);
      test.skip(!provinsi.ada, `Tidak ada data SCSR untuk ${SHIPPER_UJI} pada range tanggal uji`);
      await provinsi.baris.first().getByRole('link', { name: /Detail Kota/ }).click();
      const kota = await tungguBaris(page, /Detail Consignee/);
      expect(kota.ada).toBe(true);
      const href = await kota.baris.first().getByRole('link', { name: /Detail Consignee/ }).getAttribute('href');

      await page.goto(href!.replace(/session_get=exp_[^&]+/, 'session_get=exp_tidakadaini'));
      await page.waitForTimeout(15_000);
      // Blok info "DATA BY PROVINSI" tidak punya wrapper class khas (bukan
      // .main-card) → assertion dilakukan atas teks halaman dengan regex yang
      // menyertakan NILAI-nya, jadi tetap spesifik.
      const blok = page.locator('body');
      const adaTotalOrder = await blok.getByText(/Total Order/).count();
      const jumlahBaris = await barisOrder(page).count();
      // Harapan yang sehat: entah ada pesan kesalahan, entah blok info & tabel
      // konsisten. Yang terjadi: blok info berisi total, tabel 0 baris.
      expect(
        adaTotalOrder === 0 || jumlahBaris > 0,
        `blok info menampilkan Total Order (${adaTotalOrder}) tapi tabel hanya ${jumlahBaris} baris`,
      ).toBe(true);
    },
  );
});
