import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Daftar Order → action menu "Input / Edit Nomor Referensi" — peran
 * Shipper/Bid Owner (project "shipper"). READ-ONLY: modal dibuka dan validasi
 * sisi klien diuji, TAPI TIDAK PERNAH disimpan (endpoint
 * `order/save_nomor_referensi` mengubah data order demo secara permanen).
 * Rule: docs/rules/analitik-scsr.md TIDAK relevan; lihat
 * docs/rules/bid-owner/10-daftar-order.md § "Input / Edit Nomor Referensi
 * (temuan kalibrasi 2026-09)". Nilai inilah yang kemudian tampil sebagai baris
 * kedua nama item invoice (lihat tests/admin/invoice-nama-item.spec.ts).
 *
 * Kalibrasi ke halaman asli 2026-09-26 via playwright-cli (login form shipper):
 * - Trigger `.btn_nomor_referensi` berada DI DALAM dropdown "Action Menu" per
 *   baris order (wajib dibuka dulu; klik langsung ke elemen tersembunyi tidak
 *   membuka modal — terbukti). Atribut `idnya` = OrderID mentah.
 * - Setiap order merender DUA trigger (varian desktop + mobile; 24 elemen untuk
 *   12 order) → wajib `:visible` / filter visible, jangan `.first()` buta.
 * - Dua label: "Input Nomor Referensi" (order belum punya referensi) dan
 *   "Edit Nomor Referensi" (sudah punya).
 * - Status order yang punya menu ini saat kalibrasi: ORDER BARU, PROSES
 *   VALIDASI, KONFIRMASI UNIT, PROSES PENUGASAN.
 * - Klik trigger → POST `general/cekLoginAjax` lalu POST
 *   `order/cek_nomor_referensi` {OrderID}; bila status != SUKSES muncul
 *   SweetAlert2 (msg1/msg2, tombol "Mengerti"), bila SUKSES `#nr_order_id`
 *   terisi OrderID dan modal `#modalNomorReferensi` terbuka berisi info Nomor
 *   Order, Rute, Permintaan Muat + input `#input_nomor_referensi`
 *   (hint "Misal nomor dokumen inbound : 20210809-12092") + tombol Batal dan
 *   `#btn_simpan_nomor_referensi`.
 * - Simpan dengan input KOSONG → validasi sisi klien berupa POPOVER Bootstrap
 *   transient (~2 dtk, container #modalNomorReferensi) bertuliskan "Masukkan
 *   Nomor Referensi"; modal TETAP terbuka dan TIDAK ada request save
 *   (pola sama dengan popover Edit Harga admin — bukan window.alert).
 *   Karena transient, tangkap dengan waitFor SEGERA setelah klik.
 * - Tidak ada batasan maxlength/karakter di sisi klien: field bebas teks
 *   (order 20260811-06501 di demo bahkan berisi "7100399697, 7100399697,
 *   7100399697" — satu field, nilai berulang).
 * - Sisi ADMIN TIDAK punya action menu ini (0 trigger dari 100 order yang
 *   dirender) — diassert di tests/admin/invoice-nama-item.spec.ts.
 *
 * TIDAK dicakup (butuh izin mutasi): menyimpan nomor referensi
 * (order/save_nomor_referensi), pesan sukses SweetAlert2-nya, serta kondisi
 * penolakan cek_nomor_referensi (butuh order berstatus yang diblokir).
 */

const LABEL_MENU = /(Input|Edit) Nomor Referensi/;

/** Buka Action Menu baris order pertama yang punya menu Nomor Referensi. */
async function bukaMenuReferensi(page: Page): Promise<{ nomorOrder: string; label: string }> {
  await page.goto('/order/OrderList');
  const baris = page.locator('table tbody tr').filter({ has: page.locator('.btn_nomor_referensi') });
  await expect(async () => {
    expect(await baris.count()).toBeGreaterThan(0);
  }).toPass({ timeout: 45_000, intervals: [500, 1000, 2000] });

  const barisPertama = baris.first();
  const nomorOrder = ((await barisPertama.innerText()).match(/\d{8}-\d{5}/) ?? [''])[0];
  await barisPertama.locator('button.dropdown-toggle').first().click();
  const item = barisPertama.locator('.btn_nomor_referensi').filter({ visible: true }).first();
  const label = (await item.innerText()).trim();
  await item.click();
  return { nomorOrder, label };
}

test.describe('Input / Edit Nomor Referensi (Shipper)', () => {
  test('action menu Daftar Order menyediakan Input atau Edit Nomor Referensi ber-OrderID', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto('/order/OrderList');
    const trigger = page.locator('.btn_nomor_referensi');
    await expect(async () => {
      expect(await trigger.count()).toBeGreaterThan(0);
    }).toPass({ timeout: 45_000, intervals: [500, 1000, 2000] });

    // Label hanya dua varian; atribut idnya = OrderID mentah (angka).
    const label = (await trigger.first().innerText()).trim();
    expect(label).toMatch(LABEL_MENU);
    await expect(trigger.first()).toHaveAttribute('idnya', /^\d+$/);

    // Dirender dobel (desktop + mobile) → jumlah elemen = 2 × jumlah baris.
    const baris = page.locator('table tbody tr').filter({ has: page.locator('.btn_nomor_referensi') });
    expect(await trigger.count()).toBe((await baris.count()) * 2);
  });

  test('modal Nomor Referensi terbuka memuat data order yang dipilih', async ({ page }) => {
    test.setTimeout(120_000);
    const { nomorOrder, label } = await bukaMenuReferensi(page);
    expect(label).toMatch(LABEL_MENU);

    const modal = page.locator('#modalNomorReferensi');
    await expect(modal).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('#nr_order_id')).toHaveValue(/^\d+$/);
    await expect(modal).toContainText(nomorOrder);
    await expect(modal).toContainText(/Rute\s*:/);
    await expect(modal).toContainText(/Permintaan Muat\s*:/);
    await expect(modal).toContainText(/Misal nomor dokumen inbound\s*:\s*20210809-12092/);
    await expect(modal.locator('#input_nomor_referensi')).toBeVisible();
    await expect(modal.getByRole('button', { name: /^\s*Batal\s*$/ })).toBeVisible();

    // Label "Edit" hanya untuk order yang sudah punya referensi → input terisi;
    // label "Input" untuk yang belum → input kosong.
    const nilai = await modal.locator('#input_nomor_referensi').inputValue();
    if (/^Edit/.test(label)) expect(nilai).not.toBe('');
    else expect(nilai).toBe('');
  });

  test('simpan tanpa mengisi memunculkan popover "Masukkan Nomor Referensi" tanpa request simpan', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await bukaMenuReferensi(page);
    const modal = page.locator('#modalNomorReferensi');
    await expect(modal).toBeVisible({ timeout: 30_000 });

    const input = modal.locator('#input_nomor_referensi');
    await input.fill('');

    // Rekam request agar terbukti TIDAK ada penyimpanan yang terkirim.
    const requestSimpan: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('order/save_nomor_referensi')) requestSimpan.push(req.url());
    });

    await modal.locator('#btn_simpan_nomor_referensi').click();
    // Popover transient (~2 dtk) → tangkap segera, jangan assert setelah jeda.
    await expect(page.locator('.popover')).toContainText('Masukkan Nomor Referensi', { timeout: 5_000 });
    await expect(modal).toBeVisible();
    expect(requestSimpan, 'validasi kosong tidak boleh mengirim request simpan').toHaveLength(0);
  });

  // ————— Tambahan audit mendalam 2026-09-28 —————

  test('menu hanya tersedia sebelum tahap invoice (hilang mulai KAPAL SANDAR)', async ({ page }) => {
    // Terukur 2026-09-28 pada 100 order shipper: menu ADA pada ORDER BARU,
    // PROSES VALIDASI, KONFIRMASI UNIT, PROSES PENUGASAN, AMBIL KONTAINER,
    // STUFFING; TIDAK ADA pada KAPAL SANDAR, RENCANA DOORING, SJ DITERIMA
    // AGEN, ORDER SELESAI (0 dari 26 order di tahap-tahap itu).
    test.setTimeout(240_000);
    await page.goto('/order/OrderList');
    let data: { status: string; ada: boolean }[] = [];
    await expect(async () => {
      await page.locator('#valuelimit').selectOption('100').catch(() => {});
      await page.waitForTimeout(3_000);
      data = await page.evaluate(() => {
        const hasil: { status: string; ada: boolean }[] = [];
        let status = '';
        let ada = false;
        let punyaNomor = false;
        document.querySelectorAll('table tbody tr').forEach((tr) => {
          const teks = (tr as HTMLElement).innerText.replace(/\s+/g, ' ');
          if (/\d{8}-\d{5}/.test(teks)) {
            status =
              (teks.match(
                /ORDER BARU|PROSES VALIDASI|KONFIRMASI UNIT|PROSES PENUGASAN|AMBIL KONTAINER|STUFFING|KAPAL BERLAYAR|KAPAL SANDAR|RENCANA DOORING|DOORING|SJ DITERIMA AGEN|DOKUMEN DIKIRIM|ORDER SELESAI/i,
              ) || [''])[0].toUpperCase();
            ada = false;
            punyaNomor = true;
          }
          if (tr.querySelector('.btn_nomor_referensi')) ada = true;
          if (tr.querySelector('a[href*="order/orderdetail"]') && punyaNomor) {
            hasil.push({ status, ada });
            punyaNomor = false;
          }
        });
        return hasil;
      });
      expect(data.length, 'butuh >40 order terpanen').toBeGreaterThan(40);
    }).toPass({ timeout: 240_000, intervals: [3_000, 5_000, 5_000] });

    const tahapInvoice = ['KAPAL SANDAR', 'RENCANA DOORING', 'SJ DITERIMA AGEN', 'DOKUMEN DIKIRIM', 'ORDER SELESAI'];
    const sebelumInvoice = data.filter((d) => ['ORDER BARU', 'PROSES VALIDASI', 'KONFIRMASI UNIT', 'PROSES PENUGASAN'].includes(d.status));
    expect(sebelumInvoice.length, 'butuh order tahap awal sebagai pembanding').toBeGreaterThan(0);
    for (const d of sebelumInvoice) expect(d.ada, `order ${d.status} harus punya menu Nomor Referensi`).toBe(true);
    for (const d of data.filter((x) => tahapInvoice.includes(x.status))) {
      expect(d.ada, `order ${d.status} tidak menampilkan menu Nomor Referensi (perilaku saat ini)`).toBe(false);
    }
  });

  test.fail(
    'DEFECT: shipper tidak punya cara mengisi No. Referensi untuk order yang sudah bisa diinvoice',
    async ({ page }) => {
      // Konsekuensi improve 2026-09: nilai referensi baru berguna di invoice
      // (tahap KAPAL SANDAR ke atas), tapi menu Input/Edit Nomor Referensi
      // justru hilang tepat di tahap itu. Order yang referensinya belum
      // terisi sebelum kapal sandar TIDAK bisa lagi diperbaiki oleh shipper
      // (hanya admin, lewat Edit Data Order, dan hanya sebelum ORDER SELESAI).
      test.setTimeout(240_000);
      await page.goto('/order/OrderList');
      let baris: { nomor: string; status: string; ada: boolean }[] = [];
      await expect(async () => {
        await page.locator('#valuelimit').selectOption('100').catch(() => {});
        await page.waitForTimeout(3_000);
        baris = await page.evaluate(() => {
          const hasil: { nomor: string; status: string; ada: boolean }[] = [];
          let nomor = '';
          let status = '';
          let ada = false;
          document.querySelectorAll('table tbody tr').forEach((tr) => {
            const teks = (tr as HTMLElement).innerText.replace(/\s+/g, ' ');
            const m = teks.match(/\d{8}-\d{5}/);
            if (m) {
              nomor = m[0];
              status = (teks.match(/KAPAL SANDAR|RENCANA DOORING|SJ DITERIMA AGEN|DOKUMEN DIKIRIM|ORDER SELESAI/i) || [''])[0].toUpperCase();
              ada = false;
            }
            if (tr.querySelector('.btn_nomor_referensi')) ada = true;
            if (tr.querySelector('a[href*="order/orderdetail"]') && nomor) {
              hasil.push({ nomor, status, ada });
              nomor = '';
            }
          });
          return hasil;
        });
        expect(baris.length).toBeGreaterThan(40);
      }).toPass({ timeout: 240_000, intervals: [3_000, 5_000, 5_000] });

      const tahapInvoice = baris.filter((b) => b.status);
      expect(tahapInvoice.length, 'butuh order tahap invoice').toBeGreaterThan(0);
      for (const b of tahapInvoice) {
        expect(b.ada, `order ${b.nomor} (${b.status}) seharusnya masih bisa diisi No. Referensi`).toBe(true);
      }
    },
  );

  test('MUTASI: simpan No. Referensi baru lalu kembalikan nilai lama', async ({ page }) => {
    // Izin mutasi user 2026-09-28 (hanya alur ini): endpoint
    // order/save_nomor_referensi diuji sungguhan pada order yang SUDAH punya
    // referensi supaya bisa direvert (field ini wajib — nilai kosong ditolak
    // popover, jadi order tanpa referensi TIDAK boleh dipakai: tak bisa
    // dikembalikan ke keadaan semula).
    // Pelajaran repo ini dipakai: flag "sudah bermutasi" di-set SEGERA saat
    // request simpan terkirim (bukan setelah assertion sukses) supaya blok
    // finally tetap merevert walau verifikasi di tengah gagal.
    // Server demo pernah membutuhkan ~40 detik hanya untuk satu OrderList.
    // Beri headroom agar finally tidak dipotong oleh timeout test.
    test.setTimeout(12 * 60_000);

    const bukaModal = async (nomorOrder?: string) => {
      await page.goto('/order/OrderList', { timeout: 90_000 });
      const kandidat = page
        .locator('table tbody tr')
        .filter({ has: page.locator('.btn_nomor_referensi') })
        .filter({ hasText: nomorOrder ? new RegExp(nomorOrder) : /\d{8}-\d{5}/ });
      await expect(async () => {
        expect(await kandidat.count()).toBeGreaterThan(0);
      }).toPass({ timeout: 60_000, intervals: [500, 1000, 2000] });

      // Hanya order berlabel "Edit" yang punya nilai lama (bisa direvert).
      const total = await kandidat.count();
      for (let i = 0; i < total; i += 1) {
        const baris = kandidat.nth(i);
        // Label dibaca dari varian mana pun (desktop & mobile identik); pada
        // elemen yang belum tampil pun innerText Playwright tetap terbaca.
        const label = (await baris.locator('.btn_nomor_referensi').first().innerText()).trim();
        if (!nomorOrder && !/^Edit/.test(label)) continue;
        const nomor = ((await baris.innerText()).match(/\d{8}-\d{5}/) ?? [''])[0];
        await baris.locator('button.dropdown-toggle').first().click();
        const tampil = baris.locator('.btn_nomor_referensi').filter({ visible: true }).first();
        const orderId = await tampil.getAttribute('idnya');
        await tampil.click();
        const modal = page.locator('#modalNomorReferensi');
        await expect(modal).toBeVisible({ timeout: 30_000 });
        expect(orderId, `OrderID untuk order ${nomor}`).toMatch(/^\d+$/);
        return { modal, nomor, orderId: orderId! };
      }
      return null;
    };

    const bacaReferensiServer = async (orderId: string): Promise<string> => {
      const cek = await page.context().request.post('/order/cek_nomor_referensi', {
        form: { OrderID: orderId },
        timeout: 60_000,
      });
      expect(cek.ok()).toBe(true);
      const data = (await cek.json()) as { nomor_referensi?: string };
      return data.nomor_referensi ?? '';
    };

    const target = await bukaModal();
    test.skip(!target, 'Tidak ada order berlabel "Edit Nomor Referensi" (butuh order yang sudah punya nilai untuk direvert)');
    const { modal, nomor, orderId } = target!;
    const input = modal.locator('#input_nomor_referensi');
    const nilaiLama = (await input.inputValue()).trim();
    expect(nilaiLama, 'order uji harus sudah punya nomor referensi').not.toBe('');

    const nilaiUji = `QA-REF-${Date.now()}`;
    let sudahBermutasi = false;
    page.on('request', (req) => {
      if (req.url().includes('order/save_nomor_referensi')) sudahBermutasi = true;
    });

    try {
      await input.fill(nilaiUji);
      await modal.locator('#btn_simpan_nomor_referensi').click();

      // Umpan balik sukses: SweetAlert2 (teks bisa bervariasi) + modal tertutup.
      const swal = page.locator('.swal2-popup');
      const adaSwal = await swal
        .waitFor({ state: 'visible', timeout: 30_000 })
        .then(() => true)
        .catch(() => false);
      if (adaSwal) {
        const teksSwal = (await swal.innerText()).replace(/\s+/g, ' ');
        expect(teksSwal, `pesan sukses simpan: ${teksSwal}`).toMatch(/berhasil|sukses/i);
        await page.locator('.swal2-confirm').click().catch(() => {});
      }
      expect(sudahBermutasi, 'request order/save_nomor_referensi harus terkirim').toBe(true);
      await expect(page.locator('#modalNomorReferensi')).toBeHidden({ timeout: 30_000 });

      // Baca ulang sumber server tanpa navigasi lambat agar nilai QA hanya
      // tersimpan beberapa detik sebelum finally mengembalikan nilai lama.
      expect(await bacaReferensiServer(orderId), `order ${nomor} harus memuat nilai baru`).toBe(nilaiUji);
    } finally {
      if (sudahBermutasi) {
        // Revert lewat endpoint yang sama agar cleanup tidak bergantung pada
        // beberapa navigasi OrderList yang sangat lambat. Simpan awal tetap
        // diuji lewat UI; endpoint di sini khusus jalur keselamatan finally.
        const revert = await page.context().request.post('/order/save_nomor_referensi', {
          form: { OrderID: orderId, nomor_referensi: nilaiLama },
          timeout: 120_000,
        });
        expect(revert.ok(), `revert No. Referensi order ${nomor}`).toBe(true);

        // Verifikasi langsung ke sumber server, bukan DOM/modal yang tercache.
        await expect(async () => {
          expect(await bacaReferensiServer(orderId)).toBe(nilaiLama);
        }).toPass({ timeout: 90_000, intervals: [2_000, 5_000] });
      }
    }
  });
});
