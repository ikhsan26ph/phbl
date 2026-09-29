import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Daftar Order → Proses Invoice → Buat Invoice Jasa Pengiriman,
 * khusus penamaan item — peran Administrator (project "admin"). READ-ONLY:
 * form invoice hanya DIBUKA (GET) dan dibaca; TIDAK PERNAH disubmit, karena
 * membuat invoice bersifat permanen dan memakan kesempatan (masing-masing 3x
 * per order, lihat rule) sehingga tidak bisa di-revert.
 * Rule: docs/rules/administrator/07-daftar-order.md § Proses Invoice
 * ("Improve 2026-09 (nomor referensi pada nama item)") dan padanannya di
 * docs/rules/bidder/08-daftar-order.md.
 *
 * Improve 2026-09 yang diuji:
 *   - Nama item invoice jasa pengiriman menampilkan No. Referensi order,
 *     posisinya DI BAWAH baris jenis kendaraan (baris kedua, dipisah newline).
 *   - Bila order punya > 1 kendaraan/unit, SEMUA item mendapat No. Referensi
 *     yang SAMA.
 *   - Order tanpa nomor referensi: baris kedua tidak dirender (bukan strip).
 *
 * Kalibrasi ke halaman asli 2026-09-26 via playwright-cli (login form admin,
 * 19 order dari 5 shipper disampel + 1 shipper diblokir aturan satu pintu):
 * - Action menu "Proses Invoice" hanya ada pada order tahap KAPAL SANDAR s.d.
 *   ORDER SELESAI; href-nya `/order/uploadinvoice/<OrderID>` memakai OrderID
 *   MENTAH (angka), bukan hash — beda dari menu order lain yang pakai hash.
 * - Halaman Invoice: tombol "Buat Invoice" (dropdown) → "Invoice Jasa
 *   Pengiriman" `/order/buatinvoice/<OrderID>` dan "Invoice Tambahan (Tanpa
 *   PPN)" `/order/buatinvoicetambahan/<OrderID>`.
 * - Nama item = `<textarea name="item[]">` (satu textarea per unit), isinya:
 *     baris 1: `<Jenis Kontainer> (<No. Kontainer/Nopol>) | <Asal (KODE)> - <Tujuan (KODE)>`
 *     baris 2: `<No. Referensi>`  ← improve 2026-09, hanya bila order punya referensi
 *   Contoh nyata: "20 DRY (EMCU4324531) | Tanjung Perak (SUB) - Tanjung Emas (SRG)\nINBOUND0111".
 * - Nomor referensi diverifikasi cocok dengan Detail Order ("Nomor Referensi :
 *   <nilai>"). Order 20260811-06501 menyimpan referensi ganda
 *   "7100399697, 7100399697, 7100399697" DI DATA ORDER-nya sendiri, jadi
 *   invoice hanya meneruskan apa adanya (bukan bug duplikasi invoice).
 * - Sebagian order menolak dibuka: `/order/buatinvoice/<id>` me-redirect ke
 *   /lelang/listlelang (kesempatan invoice habis / toggle setting admin off,
 *   sesuai rule) → kandidat semacam itu dilewati, bukan digagalkan.
 * - Daftar order default 20 order (order TERBARU, semuanya berstatus awal) →
 *   #valuelimit di-set 100 agar kandidat tahap akhir ikut terpanen. AWAS:
 *   tampilan 100 order itu TRANSIEN (terukur: 20 order t≈4s, 100 order t≈14s,
 *   balik ke 20 order t≈16s karena auto-refresh daftar order; pada run lain
 *   bertahan >30 dtk — racy). Lihat komentar di kandidatInvoice().
 *
 * BELUM BISA DIUJI (dilaporkan ke user/dev): varian "Shipper memiliki Alamat
 * Tujuan pada nama item" (urutan armada → no referensi → alamat tujuan) TIDAK
 * ditemukan di demo — 19 order dari 5 shipper (Cipta Karya, Katalisator/Manuva,
 * Haier, Ikan Laut Jaya, United Family Food) semuanya berpola
 * `armada (nopol) | pelabuhan asal - pelabuhan tujuan` tanpa alamat tujuan;
 * form validasi shipper di admin juga tidak punya toggle terkait. Perlu
 * konfirmasi shipper mana yang seharusnya menampilkannya.
 *
 * Bukti referensi identik pada order multi-unit (2 order): 20260625-02604
 * (3 unit → "INBOUND34343" ×3) dan 20260303-06501 (3 unit →
 * "20260303-028311" ×3).
 */

interface Kandidat {
  nomor: string;
  orderId: string;
  hashDetail: string;
  status: string;
}

/** Cache antar-test dalam satu worker (data read-only, aman di-reuse). */
let cache: Kandidat[] | null = null;

/** Panen order tahap akhir yang punya menu Proses Invoice. */
async function kandidatInvoice(page: Page): Promise<Kandidat[]> {
  if (cache) return cache;
  await page.goto('/order/orderlist');

  // Tampilan 100 order itu TRANSIEN (terukur 2026-09-26): tabel merender 20
  // order di t≈4s, 100 order di t≈14s, lalu AUTO-REFRESH daftar order
  // MENGEMBALIKANNYA ke 20 order di t≈16s. Karena itu:
  //  (a) panen WAJIB atomik di dalam SATU evaluate() bersama pengecekan
  //      jumlahnya — menunggu "sudah 100" lalu memanggil evaluate terpisah
  //      pernah memanen tabel yang sudah balik ke 20 baris (hasil 3 kandidat,
  //      test multi-unit ter-skip padahal datanya ada);
  //  (b) polling harus memilih ulang page size bila tabel sudah balik ke 20.
  // Catatan: teks "Menampilkan 20 30 50 100 Data" itu opsi page size, BUKAN
  // info jumlah data — jangan dipakai sebagai penanda.
  // Jangan selectOption() lagi pada setiap poll: request 100 data memerlukan
  // ±14 detik; retrigger tiap 2–5 detik membuat request tidak pernah selesai.
  // Poll 500 ms menangkap jendela transien tersebut sebelum auto-refresh.
  let terbaik: Kandidat[] = [];
  for (let percobaan = 0; percobaan < 6 && terbaik.length <= 5; percobaan += 1) {
    await page.locator('#valuelimit').selectOption('100');
    for (let poll = 0; poll < 40; poll += 1) {
      const hasil = await panenBaris(page);
      if (hasil.length > terbaik.length) terbaik = hasil;
      if (terbaik.length > 5) break;
      await page.waitForTimeout(500);
    }
  }
  expect(
    terbaik.length,
    'Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order',
  ).toBeGreaterThan(5);
  cache = terbaik;

  return cache!;
}

/** Panen atomik: baca seluruh tabel dalam satu evaluate (anti tabel berubah). */
async function panenBaris(page: Page): Promise<Kandidat[]> {
  return page.evaluate(() => {
    const hasil: { nomor: string; orderId: string; hashDetail: string; status: string }[] = [];
    let nomor = '';
    let status = '';
    let idInvoice = '';
    // Satu order = BEBERAPA baris (baris data + baris info order di bawahnya),
    // link Detail Order ada di baris info → kumpulkan lintas baris.
    document.querySelectorAll('table tbody tr').forEach((tr) => {
      const teks = (tr as HTMLElement).innerText.replace(/\s+/g, ' ');
      const m = teks.match(/\d{8}-\d{5}/);
      if (m) {
        nomor = m[0];
        status =
          (teks.match(/KAPAL SANDAR|RENCANA DOORING|DOORING|SJ DITERIMA AGEN|DOKUMEN DIKIRIM|ORDER SELESAI/) ||
            [''])[0];
        idInvoice = '';
      }
      const inv = tr.querySelector('a[href*="order/uploadinvoice"]');
      if (inv) idInvoice = (inv.getAttribute('href') || '').split('/').pop() || '';
      const det = tr.querySelector('a[href*="order/orderdetail"]');
      if (det && status && idInvoice && nomor) {
        hasil.push({
          nomor,
          orderId: idInvoice,
          hashDetail: (det.getAttribute('href') || '').split('/').pop() || '',
          status,
        });
        nomor = '';
      }
    });
    return hasil;
  });
}

/**
 * Isi textarea item[] pada form buat invoice; null bila halaman ditolak.
 * WAJIB inputValue(): `innerText` sebuah <textarea> SELALU kosong di Chromium
 * (terbukti 2026-09-26: innerText "" sedangkan value/textContent berisi
 * "20 DRY (EMCU4324531) | … \nINBOUND0111") — allInnerTexts() bikin test
 * salah lapor "item tanpa baris".
 */
async function itemInvoice(page: Page, orderId: string): Promise<string[] | null> {
  await page.goto(`/order/buatinvoice/${orderId}`);
  if (!/\/order\/buatinvoice\//.test(new URL(page.url()).pathname)) return null; // kesempatan habis / toggle off
  const textarea = page.locator('textarea[name="item[]"]');
  const jumlah = await textarea.count();
  const nilai: string[] = [];
  for (let i = 0; i < jumlah; i += 1) nilai.push(await textarea.nth(i).inputValue());
  return nilai;
}

/**
 * Nomor Referensi dari halaman Detail Order ("" bila order tidak punya).
 * Order tanpa referensi dirender STRIP "-" (terbukti pada 20260827-06501),
 * bukan string kosong → strip dinormalkan ke "" supaya pengecekan
 * "ada/tidak ada referensi" tidak salah arah.
 */
async function nomorReferensi(page: Page, hash: string): Promise<string> {
  await page.goto(`/order/orderdetail/${hash}`);
  const teks = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const m = teks.match(/Nomor Referensi\s*:\s*(.*?)\s*Alasan Memesan/);
  const nilai = m ? m[1].trim() : '';
  return nilai === '-' ? '' : nilai;
}

/** Baris 1 nama item: armada (nopol/no kontainer) | asal (KODE) - tujuan (KODE). */
const POLA_BARIS_ARMADA = /^.+\s\(.+\)\s\|\s.+\s-\s.+$/;

test.describe('Nama item Invoice Jasa Pengiriman (Admin)', () => {
  test('menu Proses Invoice memakai OrderID mentah dan halaman invoice menyediakan Buat Invoice', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap KAPAL SANDAR s.d. ORDER SELESAI di demo');

    expect(kandidat[0].orderId).toMatch(/^\d+$/);
    await page.goto(`/order/uploadinvoice/${kandidat[0].orderId}`);
    await expect(page).toHaveTitle(/Invoice/i);
    await page.getByRole('button', { name: /Buat Invoice/ }).click();
    await expect(page.getByRole('link', { name: /Invoice Jasa Pengiriman/ })).toHaveAttribute(
      'href',
      new RegExp(`/order/buatinvoice/${kandidat[0].orderId}$`),
    );
    await expect(page.getByRole('link', { name: /Invoice Tambahan \(Tanpa PPN\)/ })).toHaveAttribute(
      'href',
      new RegExp(`/order/buatinvoicetambahan/${kandidat[0].orderId}$`),
    );
  });

  test('admin TIDAK punya action menu Input/Edit Nomor Referensi (khusus shipper)', async ({ page }) => {
    test.setTimeout(180_000);
    // CATATAN 2026-09-28: absennya action menu BUKAN berarti admin tak bisa
    // mengubah nilainya — field `#nomor_referensi` tersedia di halaman Edit
    // Data Order admin (lihat test "admin bisa mengubah No. Referensi lewat
    // Edit Data Order" di bawah).
    // Sumber nilai referensi adalah action menu di sisi SHIPPER (lihat
    // tests/shipper/nomor-referensi.spec.ts). Terbukti 2026-09-26: 0 trigger
    // `.btn_nomor_referensi` di 100 order yang dirender sisi admin, sementara
    // sisi shipper merender 24 trigger untuk 12 order.
    // WAJIB memuat halamannya sendiri: kandidatInvoice() memakai cache antar-test
    // sehingga bisa langsung kembali tanpa navigasi — assert di about:blank akan
    // LULUS PALSU (count 0 karena halaman kosong).
    await page.goto('/order/orderlist');
    // Tabel dimuat async; tunggu benar-benar ada baris order (20 teratas cukup:
    // di sisi shipper justru order tahap AWAL yang punya menu referensi, dan
    // 20 teratas memang order terbaru/berstatus awal).
    await expect(async () => {
      expect(await page.locator('a[href*="order/uploadinvoice"], a[href*="order/orderdetail"]').count()).toBeGreaterThan(
        0,
      );
    }).toPass({ timeout: 90_000, intervals: [1_000, 2_000, 3_000] });
    await expect(page.locator('.btn_nomor_referensi')).toHaveCount(0);
  });

  test('nama item menampilkan No. Referensi order di baris bawah jenis kendaraan', async ({ page }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    // Cari order pertama yang (a) form invoice-nya bisa dibuka dan (b) punya
    // nomor referensi — data demo bersama, jadi ditelusuri, bukan diasumsikan.
    let diuji = false;
    for (const k of kandidat.slice(0, 12)) {
      const referensi = await nomorReferensi(page, k.hashDetail);
      if (!referensi) continue;
      const items = await itemInvoice(page, k.orderId);
      if (!items || items.length === 0) continue;

      for (const item of items) {
        const baris = item.split('\n').map((b) => b.trim()).filter(Boolean);
        expect(baris.length, `Item order ${k.nomor} harus punya baris armada + referensi`).toBe(2);
        expect(baris[0], `Baris armada order ${k.nomor}`).toMatch(POLA_BARIS_ARMADA);
        expect(baris[1], `Baris referensi order ${k.nomor}`).toBe(referensi);
      }
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order tahap akhir ber-Nomor Referensi yang form invoice-nya bisa dibuka');
  });

  test('order dengan lebih dari satu kendaraan memakai No. Referensi yang sama di semua item', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 12)) {
      const items = await itemInvoice(page, k.orderId);
      if (!items || items.length < 2) continue;
      const referensi = await nomorReferensi(page, k.hashDetail);
      if (!referensi) continue;

      const barisKedua = items.map((i) => i.split('\n').map((b) => b.trim()).filter(Boolean)[1]);
      expect(new Set(barisKedua).size, `Order ${k.nomor} harus punya referensi identik di semua item`).toBe(1);
      expect(barisKedua[0]).toBe(referensi);
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order multi-unit ber-Nomor Referensi yang form invoice-nya bisa dibuka');
  });

  test('order tanpa No. Referensi hanya menampilkan baris jenis kendaraan', async ({ page }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 12)) {
      const referensi = await nomorReferensi(page, k.hashDetail);
      if (referensi) continue;
      const items = await itemInvoice(page, k.orderId);
      if (!items || items.length === 0) continue;

      for (const item of items) {
        const baris = item.split('\n').map((b) => b.trim()).filter(Boolean);
        expect(baris.length, `Order ${k.nomor} tanpa referensi tidak boleh punya baris kedua`).toBe(1);
        expect(baris[0]).toMatch(POLA_BARIS_ARMADA);
      }
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order tahap akhir tanpa Nomor Referensi yang form invoice-nya bisa dibuka');
  });

  // ————— Tambahan audit mendalam 2026-09-28 —————

  test('order MULTIDROP tetap satu item per unit: rute pelabuhan + No. Referensi, tanpa alamat drop', async ({
    page,
  }) => {
    // Rule menyebut varian "Shipper memiliki Alamat Tujuan pada nama item"
    // (urutan armada → no referensi → alamat tujuan). Order multidrop adalah
    // kandidat paling mungkin memunculkannya (punya beberapa alamat tujuan),
    // dan terbukti TIDAK: order 20260811-06501 (3 drop: Langkat, Banggai
    // Kepulauan, Bangka Barat) hanya menghasilkan 1 item
    // "20 DRY (EMCU4234234) | Dobo (DOB) - Belawan (BLW)" + baris referensi.
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 14)) {
      await page.goto(`/order/orderdetail/${k.hashDetail}`);
      const teks = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      if (!/Rute Multidrop/i.test(teks)) continue;
      const referensi = ((teks.match(/Nomor Referensi\s*:\s*(.*?)\s*Alasan Memesan/) || ['', ''])[1] || '').trim();
      const items = await itemInvoice(page, k.orderId);
      if (!items || items.length === 0) continue;

      for (const item of items) {
        const isi = item.split('\n').map((b) => b.trim()).filter(Boolean);
        expect(isi[0], `baris armada order multidrop ${k.nomor}`).toMatch(POLA_BARIS_ARMADA);
        if (referensi && referensi !== '-') {
          expect(isi.length, `order multidrop ${k.nomor} = armada + referensi (tanpa alamat drop)`).toBe(2);
          expect(isi[1]).toBe(referensi);
        } else {
          expect(isi.length, `order multidrop ${k.nomor} tanpa referensi = 1 baris`).toBe(1);
        }
      }
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order multidrop tahap akhir yang form invoice-nya bisa dibuka');
  });

  test('Invoice Tambahan tidak membawa nama item sehingga tanpa No. Referensi', async ({ page }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 14)) {
      const referensi = await nomorReferensi(page, k.hashDetail);
      if (!referensi) continue;
      await page.goto(`/order/buatinvoicetambahan/${k.orderId}`);
      if (!new URL(page.url()).pathname.includes('buatinvoicetambahan')) continue;
      const item = page.locator('textarea[name="item[]"]');
      const jumlah = await item.count();
      for (let i = 0; i < jumlah; i += 1) {
        expect((await item.nth(i).inputValue()).trim(), `item invoice tambahan order ${k.nomor}`).toBe('');
      }
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order ber-referensi yang form invoice tambahan-nya bisa dibuka');
  });

  test('admin bisa mengubah No. Referensi lewat Edit Data Order (field #nomor_referensi)', async ({
    page,
  }) => {
    // Koreksi dokumentasi 2026-09-28: admin memang TIDAK punya action menu
    // "Input / Edit Nomor Referensi" (itu khusus shipper), TAPI field
    // `#nomor_referensi` ada di halaman Edit Data Order admin dan nilainya =
    // nilai di Detail Order. Halaman hanya DIBUKA (GET), tidak disubmit.
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 14)) {
      const referensi = await nomorReferensi(page, k.hashDetail);
      await page.goto(`/order/edit_inputpesanan/${k.hashDetail}`);
      await page.waitForLoadState('domcontentloaded');
      if (!page.url().includes('edit_inputpesanan')) continue; // ORDER SELESAI ditolak
      const field = page.locator('#nomor_referensi');
      await expect(field).toBeVisible({ timeout: 30_000 });
      await expect(field).toHaveValue(referensi);
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Semua order tahap akhir yang disampel menolak halaman Edit Data Order');
  });

  test('Edit Data Order ditolak untuk ORDER SELESAI sehingga No. Referensi tak bisa lagi diubah', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    const selesai = kandidat.find((k) => /ORDER SELESAI/i.test(k.status));
    test.skip(!selesai, 'Tidak ada order berstatus ORDER SELESAI di demo');
    await page.goto(`/order/edit_inputpesanan/${selesai!.hashDetail}`);
    await expect(page).not.toHaveURL(/edit_inputpesanan/);
    await expect(page.locator('.alert_negatif, [role="alert"]').first()).toContainText(
      /Anda Tidak Memiliki Akses Ke Halaman Tersebut/i,
    );
  });

  test('form invoice ditolak untuk order tahap awal (belum boleh diinvoice)', async ({ page }) => {
    // Gating server-side: /order/buatinvoice/<id> untuk order ORDER BARU dsb.
    // me-redirect ke listlelang + alert. Ini sekaligus menjelaskan mengapa
    // rantai "shipper isi referensi → invoice" tidak bisa diuji pada SATU
    // order: menu Input/Edit Nomor Referensi sisi shipper hilang mulai
    // KAPAL SANDAR, sementara invoice baru terbuka dari KAPAL SANDAR.
    test.setTimeout(180_000);
    await page.goto('/order/orderlist');
    // Jangan mengambil trigger pertama secara global: urutan tabel dapat berubah
    // ketika order terbaru bergerak ke tahap KAPAL SANDAR dan sudah boleh
    // diinvoice. Ambil ID dari baris yang statusnya benar-benar ORDER BARU.
    const barisAwal = page
      .locator('tr:has(a.btn_edit_harga_order[idnya])')
      .filter({ hasText: /ORDER BARU/ })
      .first();
    await expect(barisAwal).toBeVisible({ timeout: 90_000 });
    const orderId = await barisAwal.locator('a.btn_edit_harga_order[idnya]').getAttribute('idnya');
    expect(orderId).toMatch(/^\d+$/);

    await page.goto(`/order/buatinvoice/${orderId}`);
    await expect(page).not.toHaveURL(/buatinvoice/);
    await expect(page.locator('.alert_negatif, [role="alert"]').first()).toContainText(
      /Anda Tidak Memiliki Akses Ke Halaman Tersebut/i,
    );
  });
});
