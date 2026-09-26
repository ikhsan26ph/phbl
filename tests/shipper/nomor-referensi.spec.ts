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
});
