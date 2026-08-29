import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Open Stack — Ganti Jadwal (Admin, MUTASI dengan revert).
 * Project "admin" (storageState .auth/admin.json). Izin mutasi demo dari
 * user 2026-08-29. Rule: docs/rules/open-stack.md § Administrator (hasil
 * eksplorasi — belum ada rule resmi) + docs/rules/administrator/07-daftar-order.md.
 *
 * Eksplorasi 2026-08-29 via playwright-cli (login admin):
 * - Menu baris "Ganti Jadwal" (a[href*="/order/ganti_jadwal/"]) → form
 *   jadwal PREFILL dari order: #kapal, #voyage, #open_stack (daterangepicker
 *   single tanpa minDate; ketik per karakter + Enter), #closing_time,
 *   #berangkat, #tiba; Simpan #submitonce1 → SweetAlert2 konfirmasi "Apakah
 *   anda yakin melakukan ganti jadwal ?" [Batal/Ya] → redirect
 *   /order/orderlist + alert DOM role=alert "Anda berhasil ganti jadwal".
 * - Efek: blok PELAYARAN Detail Order memakai nilai baru; Riwayat Perubahan
 *   Data (/order/historyupdateorder/<hash>) mendapat entri "Tanggal
 *   Perubahan : <tgl jam> (Ganti Jadwal)", "Edit By : <email>", "Open Stack
 *   : <tgl>". Jadwal MASTER transporter TIDAK berubah (nilai order =
 *   snapshot) — diverifikasi manual lintas peran, tidak diassert di sini.
 * - Order dipilih dinamis: utamakan ORDER BARU lelang LELANGFCU/28082026IK
 *   (fixture AUTOTEST 20260829-06504), lalu ORDER BARU mana pun, lalu baris
 *   mana pun ber-menu Ganti Jadwal. Nilai dikembalikan ke semula di finally
 *   (flag mutasi di-set saat klik "Ya", sebelum verifikasi); efek permanen
 *   tersisa = 2 entri Riwayat Perubahan Data (by design, seperti Edit Harga).
 */

const NOMOR_LELANG_OPEN_STACK = 'LELANGFCU/28082026IK';

function tgl(offsetHari: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetHari);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

interface OrderTarget {
  nomor: string;
  gantiJadwal: string;
  detail: string;
  history: string;
}

const blokPelayaran = (page: Page) =>
  page
    .locator('.heading_1', { hasText: /^\s*PELAYARAN\s*$/ })
    .filter({ visible: true })
    .first()
    .locator('..');

const formGanti = {
  openStack: (page: Page) => page.locator('#open_stack'),
  simpan: (page: Page) => page.locator('#submitonce1'),
  swal: (page: Page) => page.locator('.swal2-container'),
};

function urlAbsolut(href: string): string {
  return /^https?:/.test(href) ? href : `/${href.replace(/^\/+/, '')}`;
}

async function bukaDaftarOrder(page: Page): Promise<void> {
  await page.goto('/order/OrderList');
  const sisaFlash = page.getByRole('button', { name: 'Mengerti' });
  if (await sisaFlash.isVisible().catch(() => false)) await sisaFlash.click();
  await page.getByRole('button', { name: 'Action Menu' }).first().waitFor({ timeout: 20_000 }).catch(() => {});
}

/** Pilih order target dalam SATU evaluate (tabel admin bersama & auto-refresh). */
async function pilihOrderTarget(page: Page): Promise<OrderTarget | null> {
  await bukaDaftarOrder(page);
  return page.evaluate((nomorLelang) => {
    const baris = [...document.querySelectorAll('table tbody tr')].filter((tr) =>
      tr.querySelector('a[href*="/order/ganti_jadwal/"]'),
    );
    const skor = (tr: Element) => {
      const t = tr.textContent ?? '';
      if (t.includes('ORDER BARU') && t.includes(nomorLelang)) return 0;
      if (t.includes('ORDER BARU')) return 1;
      return 2;
    };
    const tr = baris.sort((a, b) => skor(a) - skor(b))[0];
    if (!tr) return null;
    const info = tr.nextElementSibling;
    return {
      nomor: (tr.textContent?.match(/\d{8}-\d{5}/) ?? [''])[0],
      gantiJadwal: tr.querySelector('a[href*="/order/ganti_jadwal/"]')!.getAttribute('href')!,
      detail: info?.querySelector('a[href*="orderdetail"]')?.getAttribute('href') ?? '',
      history: tr.querySelector('a[href*="historyupdateorder"]')?.getAttribute('href') ?? '',
    };
  }, NOMOR_LELANG_OPEN_STACK);
}

async function ketikTanggal(page: Page, input: Locator, nilai: string): Promise<void> {
  await input.click();
  await page.keyboard.press('Control+A');
  if (nilai === '') {
    await page.keyboard.press('Backspace');
  } else {
    await input.pressSequentially(nilai, { delay: 15 });
    await page.keyboard.press('Enter');
  }
  await expect(input).toHaveValue(nilai);
  await page.mouse.click(5, 5);
}

/** Simpan Ganti Jadwal dengan Open Stack tertentu; return setelah klik "Ya". */
async function simpanGantiJadwal(page: Page, target: OrderTarget, openStack: string): Promise<void> {
  await page.goto(urlAbsolut(target.gantiJadwal));
  await expect(page).toHaveURL(/\/order\/ganti_jadwal\/.+/);
  await expect(formGanti.openStack(page)).toBeVisible({ timeout: 20_000 });
  await ketikTanggal(page, formGanti.openStack(page), openStack);
  await formGanti.simpan(page).click();
  await expect(formGanti.swal(page)).toContainText('Apakah anda yakin melakukan ganti jadwal');
  await formGanti.swal(page).getByRole('button', { name: 'Ya' }).click();
}

async function tungguSuksesGanti(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/order\/orderlist/i, { timeout: 30_000 });
  await expect(page.getByRole('alert').filter({ hasText: 'Anda berhasil ganti jadwal' })).toBeVisible();
}

test.describe('Open Stack — Ganti Jadwal (Admin, mutasi)', () => {
  test.slow();

  test('mengubah Open Stack order via Ganti Jadwal tercermin di Detail Order dan Riwayat Perubahan Data, lalu dikembalikan', async ({
    page,
  }) => {
    page.on('dialog', (dialog) => dialog.accept());
    const target = await pilihOrderTarget(page);
    test.skip(!target, 'Tidak ada order dengan menu Ganti Jadwal pada akun demo');
    expect(target!.detail, 'link Detail Order baris info').not.toBe('');

    // Nilai semula dibaca dari form (prefill order) sebelum diubah.
    await page.goto(urlAbsolut(target!.gantiJadwal));
    await expect(formGanti.openStack(page)).toBeVisible({ timeout: 20_000 });
    const semula = await formGanti.openStack(page).inputValue();
    let baru = tgl(20 + (Date.now() % 7));
    if (baru === semula) baru = tgl(30);

    let bermutasi = false;
    try {
      await simpanGantiJadwal(page, target!, baru);
      bermutasi = true;
      await tungguSuksesGanti(page);

      await page.goto(urlAbsolut(target!.detail));
      await expect(blokPelayaran(page)).toBeVisible({ timeout: 20_000 });
      await expect(blokPelayaran(page)).toHaveText(new RegExp(`Open\\s+Stack\\s*:\\s*${baru}\\s+Closing`));

      if (target!.history) {
        await page.goto(urlAbsolut(target!.history));
        await expect(page.getByText(/\(Ganti Jadwal\)/).first()).toBeVisible({ timeout: 20_000 });
        await expect(page.getByText(new RegExp(`Open Stack\\s*:\\s*${baru}`)).first()).toBeVisible();
      }
    } finally {
      if (bermutasi) {
        await simpanGantiJadwal(page, target!, semula);
        await tungguSuksesGanti(page);
        await page.goto(urlAbsolut(target!.detail));
        await expect(blokPelayaran(page)).toHaveText(
          new RegExp(`Open\\s+Stack\\s*:\\s*${semula === '' ? '-' : semula}\\s+Closing`),
          { timeout: 20_000 },
        );
      }
    }
  });
});
