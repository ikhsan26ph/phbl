import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Open Stack (field jadwal kapal BARU, rilis 2026-08) — peran
 * Shipper/Bid Owner (project "shipper", storageState .auth/shipper.json).
 * Rule: docs/rules/open-stack.md (hasil kalibrasi — field TIDAK ada di
 * dokumen rule sumber). Scope read-only.
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login form):
 * - Cari Penawaran /lelang/carirute → isi Nomor Lelang → "Cari Harga
 *   Penawaran" → /lelang/carirute?from=search&...: tabel hasil penawaran
 *   desktop `.am-for-pc #tbody_hasil_penawaran`; sel kapal tiap penawaran
 *   berisi "<kapal> <voyage> Open Stack: <dd/mm/yyyy> Closing: <tgl jam>"
 *   (div.text_label_regular; markup mobile duplikat tersembunyi berteks
 *   "Open Stack : <tgl>"). Data: lelang LELANGFCU/28082026IK — KM. Layar
 *   (29/08/2026) & KM. Malay (07/09/2026).
 * - Detail Order /order/orderdetail/<hash> (link "Detail Order" di baris info
 *   TEPAT DI BAWAH baris data; href relatif tanpa "/"): § 1. PEMESANAN blok
 *   "PELAYARAN" (div.heading_1, dobel desktop+mobile) berisi kapal, "Voyage :
 *   x", "Open Stack : <dd/mm/yyyy | ->", "Closing : <tgl jam>". Nilai kosong
 *   (order lama / order KM. Malay LELANGFCU — lihat temuan di spec
 *   transporter) dirender "-".
 * - Cek Jadwal /lelang/carijadwal & Daftar Order (list) TIDAK memuat Open Stack.
 * - Usulan data-testid ke developer: locator blok (.heading_1,
 *   .text_label_regular, #tbody_hasil_penawaran) berbasis class/id.
 */

const NOMOR_LELANG_OPEN_STACK = 'LELANGFCU/28082026IK';
/** Regex dicocokkan ke teks MENTAH (tanpa normalisasi whitespace) → pakai \s. */
const POLA_PELAYARAN =
  /Voyage\s*:\s*\S+\s+Open\s+Stack\s*:\s*(\d{2}\/\d{2}\/\d{4}|-)\s+Closing(?:\s+Time)?\s*:\s*\d{2}\/\d{2}\/\d{4}/;
const POLA_PELAYARAN_TANGGAL = /Open\s+Stack\s*:\s*\d{2}\/\d{2}\/\d{4}/;
const POLA_SEL_KAPAL = /\S+\s*Open\s+Stack\s*:\s*\d{2}\/\d{2}\/\d{4}\s*Closing\s*:\s*\d{2}\/\d{2}\/\d{4}/;

const cariPage = {
  nomorLelang: (page: Page) => page.getByRole('textbox', { name: 'Nomor Lelang *' }),
  cariButton: (page: Page) => page.getByRole('button', { name: 'Cari Harga Penawaran' }),
  alertTidakDitemukan: (page: Page) => page.getByText('× Nomor Lelang Tidak Ditemukan'),
  selKapalPenawaran: (page: Page) =>
    page.locator('.am-for-pc #tbody_hasil_penawaran td').filter({ hasText: /Open\s+Stack\s*:/ }),
};

const blokPelayaran = (page: Page) =>
  page
    .locator('.heading_1', { hasText: /^\s*PELAYARAN\s*$/ })
    .filter({ visible: true })
    .first()
    .locator('..');

function urlAbsolut(href: string): string {
  return /^https?:/.test(href) ? href : `/${href.replace(/^\/+/, '')}`;
}

/** Tautan Detail Order (baris info di bawah baris data); order lelang ber-Open Stack didahulukan. */
async function daftarTautanDetailOrder(page: Page): Promise<string[]> {
  await page.goto('/order/OrderList');
  await page.getByRole('link', { name: 'Detail Order' }).first().waitFor({ timeout: 20_000 }).catch(() => {});
  return page.evaluate((nomor) => {
    const barisInfo = [...document.querySelectorAll('table tbody tr')].filter((tr) =>
      tr.querySelector('a[href*="orderdetail"]'),
    );
    const prioritas = (tr: Element) => (tr.previousElementSibling?.textContent?.includes(nomor) ? 0 : 1);
    return barisInfo
      .sort((a, b) => prioritas(a) - prioritas(b))
      .map((tr) => tr.querySelector('a[href*="orderdetail"]')!.getAttribute('href')!)
      .slice(0, 8);
  }, NOMOR_LELANG_OPEN_STACK);
}

async function bukaDetailOrder(page: Page, href: string): Promise<void> {
  await page.goto(urlAbsolut(href));
  await expect(page).toHaveURL(/\/order\/orderdetail\/.+/);
  await expect(blokPelayaran(page)).toBeVisible({ timeout: 20_000 });
}

test.describe('Open Stack — Cari Penawaran (Bid Owner)', () => {
  test('hasil penawaran menampilkan Open Stack tiap kapal di antara voyage dan Closing', async ({ page }) => {
    await page.goto('/lelang/carirute');
    await cariPage.nomorLelang(page).fill(NOMOR_LELANG_OPEN_STACK);
    await cariPage.cariButton(page).click();

    const sel = cariPage.selKapalPenawaran(page);
    await Promise.race([
      sel.first().waitFor({ timeout: 20_000 }),
      cariPage.alertTidakDitemukan(page).waitFor({ timeout: 20_000 }),
    ]).catch(() => {});
    test.skip(
      await cariPage.alertTidakDitemukan(page).isVisible().catch(() => false),
      `Lelang ${NOMOR_LELANG_OPEN_STACK} tidak ada lagi di demo`,
    );

    await expect(page.getByText('RINGKASAN LELANG')).toBeVisible();
    const jumlah = await sel.count();
    expect(jumlah).toBeGreaterThan(0);
    for (let i = 0; i < jumlah; i++) {
      await expect(sel.nth(i)).toHaveText(POLA_SEL_KAPAL);
    }
  });
});

test.describe('Open Stack — Detail Order (Bid Owner)', () => {
  test('blok PELAYARAN memuat Open Stack di antara Voyage dan Closing (tanggal atau strip)', async ({ page }) => {
    const tautan = await daftarTautanDetailOrder(page);
    test.skip(tautan.length === 0, 'Tidak ada data order pada akun demo');

    await bukaDetailOrder(page, tautan[0]);
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN);
    await expect(page.getByText('Open Stack', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  });

  test('order dari jadwal ber-Open Stack menampilkan tanggalnya', async ({ page }) => {
    test.slow();
    const tautan = await daftarTautanDetailOrder(page);
    test.skip(tautan.length === 0, 'Tidak ada data order pada akun demo');

    let ketemu = false;
    for (const href of tautan) {
      await bukaDetailOrder(page, href);
      const blok = await blokPelayaran(page).innerText();
      expect(blok.replace(/\s+/g, ' ')).toMatch(POLA_PELAYARAN);
      if (POLA_PELAYARAN_TANGGAL.test(blok)) {
        ketemu = true;
        break;
      }
    }
    test.skip(!ketemu, 'Tidak ada order ber-Open Stack terisi di antara order yang diperiksa');
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN_TANGGAL);
  });
});
