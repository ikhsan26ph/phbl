import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Daftar Order → Proses Invoice → Buat Invoice Jasa Pengiriman,
 * khusus penamaan item — peran Transporter/Bidder (project "transporter").
 * READ-ONLY: form invoice hanya DIBUKA (GET) dan dibaca; TIDAK PERNAH
 * disubmit (membuat invoice permanen & memakan kesempatan 3x per order).
 * Rule: docs/rules/bidder/08-daftar-order.md § Proses Invoice
 * ("Improve 2026-09 (nomor referensi pada nama item)").
 *
 * Spec ini menutup celah audit 2026-09-28: improve "No. Referensi pada nama
 * item" ditulis di rule bidder DAN administrator, tapi sebelumnya hanya sisi
 * ADMIN yang punya test (tests/admin/invoice-nama-item.spec.ts).
 *
 * Kalibrasi 2026-09-28 (project transporter, storageState .auth/transporter.json):
 * - Daftar Order transporter = /order/OrderList; menu "Proses Invoice" muncul
 *   pada tahap KAPAL SANDAR s.d. ORDER SELESAI, href
 *   `/order/uploadinvoice/<OrderID>` memakai OrderID MENTAH (angka), sama
 *   seperti sisi admin.
 * - `/order/buatinvoice/<OrderID>` → `textarea[name="item[]"]` per unit:
 *     baris 1: `<Jenis Kontainer> (<No. Kontainer>) | <Asal (KODE)> - <Tujuan (KODE)>`
 *     baris 2: `<No. Referensi>` (hanya bila order punya referensi)
 *   Contoh nyata sisi transporter: order 20260827-06502 →
 *   "20 DRY (EMCU4324531) | Tanjung Perak (SUB) - Tanjung Emas (SRG)\nINBOUND0111".
 * - `/order/buatinvoicetambahan/<OrderID>` → item KOSONG (sesuai rule: invoice
 *   tambahan tidak membawa item), jadi No. Referensi TIDAK ikut ke sana.
 * - Sebagian order menolak dibuka (kesempatan invoice habis / gating) →
 *   redirect ke /lelang/listlelang; kandidat semacam itu dilewati.
 * - Transporter TIDAK punya action menu Input/Edit Nomor Referensi (0 trigger
 *   `.btn_nomor_referensi`) — itu khusus shipper.
 * - `innerText` sebuah <textarea> SELALU kosong di Chromium → WAJIB inputValue().
 * - Nilai kosong di Detail Order dirender STRIP "-" → dinormalkan ke "".
 */

interface Kandidat {
  nomor: string;
  orderId: string;
  hashDetail: string;
  status: string;
}

/** Cache antar-test dalam satu worker (data read-only, aman di-reuse). */
let cache: Kandidat[] | null = null;

/** Panen atomik: baca seluruh tabel dalam satu evaluate (tabel bisa berubah). */
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
          (teks.match(/KAPAL SANDAR|RENCANA DOORING|DOORING|SJ DITERIMA AGEN|DOKUMEN DIKIRIM|ORDER SELESAI/i) || [''])[0];
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

async function kandidatInvoice(page: Page): Promise<Kandidat[]> {
  if (cache) return cache;
  await page.goto('/order/OrderList');
  await page.locator('#valuelimit').selectOption('100').catch(() => {});
  // Tampilan >20 order itu TRANSIEN (auto-refresh daftar order mengembalikannya
  // ke 20 baris) → panen WAJIB atomik dan page size dipilih ulang saat kurang.
  await expect(async () => {
    const hasil = await panenBaris(page);
    if (hasil.length < 3) {
      await page.locator('#valuelimit').selectOption('100').catch(() => {});
      await page.waitForTimeout(3_000);
    }
    expect(hasil.length, 'Panen kandidat invoice transporter terlalu sedikit').toBeGreaterThanOrEqual(3);
    cache = hasil;
  }).toPass({ timeout: 180_000, intervals: [2_000, 3_000, 5_000] });
  return cache!;
}

/** Isi textarea item[]; null bila halaman ditolak (redirect). */
async function itemInvoice(page: Page, orderId: string, tambahan = false): Promise<string[] | null> {
  const path = tambahan ? 'buatinvoicetambahan' : 'buatinvoice';
  await page.goto(`/order/${path}/${orderId}`);
  if (!new URL(page.url()).pathname.includes(path)) return null;
  const textarea = page.locator('textarea[name="item[]"]');
  const jumlah = await textarea.count();
  const nilai: string[] = [];
  for (let i = 0; i < jumlah; i += 1) nilai.push(await textarea.nth(i).inputValue());
  return nilai;
}

async function nomorReferensi(page: Page, hash: string): Promise<string> {
  await page.goto(`/order/orderdetail/${hash}`);
  const teks = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const m = teks.match(/Nomor Referensi\s*:\s*(.*?)\s*Alasan Memesan/);
  const nilai = m ? m[1].trim() : '';
  return nilai === '-' ? '' : nilai;
}

const POLA_BARIS_ARMADA = /^.+\s\(.+\)\s\|\s.+\s-\s.+$/;
const baris = (item: string): string[] => item.split('\n').map((b) => b.trim()).filter(Boolean);

test.describe('Nama item Invoice Jasa Pengiriman (Transporter)', () => {
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

  test('nama item sisi bidder menampilkan No. Referensi order di baris bawah jenis kendaraan', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 14)) {
      const referensi = await nomorReferensi(page, k.hashDetail);
      if (!referensi) continue;
      const items = await itemInvoice(page, k.orderId);
      if (!items || items.length === 0) continue;

      for (const item of items) {
        const isi = baris(item);
        expect(isi.length, `Item order ${k.nomor} harus punya baris armada + referensi`).toBe(2);
        expect(isi[0], `Baris armada order ${k.nomor}`).toMatch(POLA_BARIS_ARMADA);
        expect(isi[1], `Baris referensi order ${k.nomor}`).toBe(referensi);
      }
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order ber-Nomor Referensi yang form invoice-nya bisa dibuka');
  });

  test('order tanpa No. Referensi hanya menampilkan baris jenis kendaraan', async ({ page }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 14)) {
      const referensi = await nomorReferensi(page, k.hashDetail);
      if (referensi) continue;
      const items = await itemInvoice(page, k.orderId);
      if (!items || items.length === 0) continue;
      for (const item of items) {
        const isi = baris(item);
        expect(isi.length, `Order ${k.nomor} tanpa referensi tidak boleh punya baris kedua`).toBe(1);
        expect(isi[0]).toMatch(POLA_BARIS_ARMADA);
      }
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order tanpa Nomor Referensi yang form invoice-nya bisa dibuka');
  });

  test('Invoice Tambahan tidak membawa nama item sehingga tanpa No. Referensi', async ({ page }) => {
    test.setTimeout(240_000);
    const kandidat = await kandidatInvoice(page);
    test.skip(kandidat.length === 0, 'Tidak ada order tahap akhir di demo');

    let diuji = false;
    for (const k of kandidat.slice(0, 14)) {
      const referensi = await nomorReferensi(page, k.hashDetail);
      if (!referensi) continue;
      const items = await itemInvoice(page, k.orderId, true);
      if (!items) continue;
      // Sesuai rule: item invoice tambahan defaultnya form kosong.
      for (const item of items) expect(item.trim(), `item invoice tambahan order ${k.nomor}`).toBe('');
      expect(items.join(''), 'No. Referensi tidak boleh ikut ke invoice tambahan').not.toContain(referensi);
      diuji = true;
      break;
    }
    test.skip(!diuji, 'Tidak ada order ber-referensi yang form invoice tambahan-nya bisa dibuka');
  });

  test('transporter TIDAK punya action menu Input/Edit Nomor Referensi', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/order/OrderList');
    await expect(async () => {
      expect(await page.locator('a[href*="order/orderdetail"]').count()).toBeGreaterThan(0);
    }).toPass({ timeout: 90_000, intervals: [1_000, 2_000, 3_000] });
    await expect(page.locator('.btn_nomor_referensi')).toHaveCount(0);
  });
});
