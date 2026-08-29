import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Open Stack (field jadwal kapal BARU, rilis 2026-08) — halaman
 * Daftar Order peran Administrator (project "admin", storageState
 * .auth/admin.json via project setup).
 * Rule: docs/rules/open-stack.md (hasil kalibrasi — field TIDAK ada di
 * dokumen rule sumber). Scope read-only: halaman aksi hanya DIBUKA (GET),
 * tidak ada form yang disimpan.
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login form):
 * - /order/OrderList: item action menu ada di DOM tiap baris data (dropdown
 *   tersembunyi) → href dibaca langsung tanpa membuka dropdown:
 *   Ganti Jadwal a[href*="/order/ganti_jadwal/"], Edit Data Order
 *   a.editdataorder (/order/edit_inputpesanan/<hash>), Edit Status Order
 *   a.edit_status_order (/order/editstatusorder/<hash>; TIDAK ada utk ORDER
 *   BARU/KONFIRMASI UNIT — ada di ORDER SELESAI), Alihkan Order
 *   a.alihkanorder (href SUDAH memuat query ?idorder=&alihkan=yes&lelang= —
 *   URL polos me-redirect ke listlelang). Link "Detail Order" di baris info
 *   TEPAT DI BAWAH baris data (href relatif tanpa "/").
 * - Blok "PELAYARAN" (div.heading_1, dobel desktop+mobile) di Detail Order,
 *   Ganti Jadwal, Edit Data Order, Edit Status Order: kapal, "Voyage : x",
 *   "Open Stack : <dd/mm/yyyy | ->", lalu "Closing : <tgl jam>" — KECUALI
 *   Edit Data Order yang memakai label "Closing Time :". Nilai kosong
 *   dirender "-". Order connecting: blok diawali "Kapal Connecting 1x" dan
 *   memuat teks "Edit Jadwal" (tombol) sebelum Voyage.
 * - Ganti Jadwal: form jadwal baru berisi form-group #open_stack1 berlabel
 *   "Open Stack" TANPA asterisk (Kapal/Voyage/Closing Time/ETD/ETA
 *   ber-asterisk), input #open_stack placeholder DD/MM/YYYY, di antara Voyage
 *   dan Closing Time; pada order connecting (select jenis_jadwal terkunci
 *   "Kapal Connecting", label ETD Asal/ETA Tujuan) field Open Stack tetap
 *   satu (#open_stack), seksi kapal connecting tanpa Open Stack.
 * - Alihkan Order: ringkasan order = baris label/nilai (label "Open Stack :"
 *   di antara "ETD - ETA :" dan "Closing Time :", nilai di div sebelahnya;
 *   markup class ter-obfuscate `_1pEVDa/_1A0RCW/_1pEVDB` → dicari via teks
 *   label). Nilai kosong di ringkasan ini dirender KOSONG (bukan "-" —
 *   beda dari "Nomor Referensi : -" di ringkasan yang sama dan "-" di blok
 *   PELAYARAN; inkonsistensi minor, dilaporkan). Tabel harga pengganti
 *   `.am-for-pc #tbody_hasil_penawaran`: tiap sel kapal berteks "<kapal>
 *   <voyage> Open Stack: <tgl> Closing: <tgl jam>" (teks mentah antar-div
 *   tanpa spasi).
 * - Master admin & detail/edit lelang admin TIDAK memuat Open Stack.
 * - Data ber-Open Stack: order lelang LELANGFCU/28082026IK (KM. Layar
 *   29/08/2026; order KM. Malay tampil "-" — temuan, lihat spec transporter)
 *   dan order connecting 20260829-02602 (29/08/2026).
 * - Usulan data-testid ke developer: locator blok (.heading_1,
 *   .text_label_regular, #tbody_hasil_penawaran, a.<class> menu) berbasis
 *   class/id tanpa role/label.
 */

const NOMOR_LELANG_OPEN_STACK = 'LELANGFCU/28082026IK';
/** Regex dicocokkan ke teks MENTAH (tanpa normalisasi whitespace) → pakai \s. */
const POLA_PELAYARAN =
  /Voyage\s*:\s*\S+\s+Open\s+Stack\s*:\s*(\d{2}\/\d{2}\/\d{4}|-)\s+Closing(?:\s+Time)?\s*:\s*\d{2}\/\d{2}\/\d{4}/;
const POLA_PELAYARAN_CLOSING_TIME = /Open\s+Stack\s*:\s*(\d{2}\/\d{2}\/\d{4}|-)\s+Closing\s+Time\s*:/;
const POLA_PELAYARAN_TANGGAL = /Open\s+Stack\s*:\s*\d{2}\/\d{2}\/\d{4}/;
const POLA_SEL_KAPAL = /\S+\s*Open\s+Stack\s*:\s*\d{2}\/\d{2}\/\d{4}\s*Closing\s*:\s*\d{2}\/\d{2}\/\d{4}/;

const MENU = {
  gantiJadwal: 'a[href*="/order/ganti_jadwal/"]',
  editDataOrder: 'a.editdataorder',
  editStatusOrder: 'a.edit_status_order',
  alihkanOrder: 'a.alihkanorder',
} as const;

const blokPelayaran = (page: Page) =>
  page
    .locator('.heading_1', { hasText: /^\s*PELAYARAN\s*$/ })
    .filter({ visible: true })
    .first()
    .locator('..');

const formGantiJadwal = {
  grupOpenStack: (page: Page) => page.locator('#open_stack1'),
  inputOpenStack: (page: Page) => page.locator('#open_stack'),
  labelTampil: (page: Page) => page.locator('.form-group:visible label'),
};

const alihkanPage = {
  /** Baris ringkasan "Open Stack :" (label + nilai) — teks label berakhir titik dua,
   *  sehingga tidak bentrok dgn "Open Stack: <tgl>" di tabel pengganti. */
  barisRingkasanOpenStack: (page: Page) =>
    page.getByText(/^\s*Open\s+Stack\s*:\s*$/).filter({ visible: true }).first().locator('..'),
  /** Kontainer ringkasan order (induk dari baris label ETD - ETA). */
  ringkasan: (page: Page) =>
    page.getByText(/^\s*ETD - ETA\s*:\s*$/).filter({ visible: true }).first().locator('..').locator('..'),
  selKapalPengganti: (page: Page) =>
    page.locator('.am-for-pc #tbody_hasil_penawaran td').filter({ hasText: /Open\s+Stack\s*:/ }),
};
/** Ringkasan Alihkan Order: ETD - ETA → Open Stack (tanggal atau kosong) → Closing Time. */
const POLA_RINGKASAN_ALIHKAN =
  /ETD - ETA\s*:[\s\S]*?Open\s+Stack\s*:\s*(\d{2}\/\d{2}\/\d{4})?\s*Closing\s+Time\s*:/;

function urlAbsolut(href: string): string {
  return /^https?:/.test(href) ? href : `/${href.replace(/^\/+/, '')}`;
}

async function bukaDaftarOrder(page: Page): Promise<void> {
  await page.goto('/order/OrderList');
  // Flash SweetAlert2 dari aksi sebelumnya (mis. spec Edit Harga) — konsumsi.
  const sisaFlash = page.getByRole('button', { name: 'Mengerti' });
  if (await sisaFlash.isVisible().catch(() => false)) await sisaFlash.click();
  await page.getByRole('button', { name: 'Action Menu' }).first().waitFor({ timeout: 20_000 }).catch(() => {});
}

/** href item action menu dari baris-baris yang memilikinya; order lelang ber-Open Stack didahulukan.
 *  Dibaca dalam SATU evaluate — tabel admin bersama & auto-refresh (lihat CLAUDE.md). */
async function daftarTautanMenu(page: Page, selektor: string): Promise<string[]> {
  await bukaDaftarOrder(page);
  return page.evaluate(
    ({ selektor, nomor }) => {
      const baris = [...document.querySelectorAll('table tbody tr')].filter((tr) => tr.querySelector(selektor));
      const prioritas = (tr: Element) => (tr.textContent?.includes(nomor) ? 0 : 1);
      return baris
        .sort((a, b) => prioritas(a) - prioritas(b))
        .map((tr) => tr.querySelector(selektor)!.getAttribute('href')!)
        .slice(0, 8);
    },
    { selektor, nomor: NOMOR_LELANG_OPEN_STACK },
  );
}

async function tautanMenu(page: Page, selektor: string): Promise<string | null> {
  return (await daftarTautanMenu(page, selektor))[0] ?? null;
}

/** Tautan Detail Order (baris info di bawah baris data); order lelang ber-Open Stack didahulukan. */
async function daftarTautanDetailOrder(page: Page): Promise<string[]> {
  await bukaDaftarOrder(page);
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

async function bukaHalamanAksi(page: Page, href: string, url: RegExp): Promise<void> {
  await page.goto(urlAbsolut(href));
  await expect(page).toHaveURL(url);
  await expect(blokPelayaran(page)).toBeVisible({ timeout: 20_000 });
}

test.describe('Open Stack — Daftar Order (Admin)', () => {
  // Tabel Order List admin berisi ribuan baris — beri ruang waktu.
  test.slow();

  test('Detail Order: blok PELAYARAN memuat Open Stack di antara Voyage dan Closing (tanggal atau strip)', async ({
    page,
  }) => {
    const tautan = await daftarTautanDetailOrder(page);
    test.skip(tautan.length === 0, 'Tidak ada data order pada akun demo');

    await bukaHalamanAksi(page, tautan[0], /\/order\/orderdetail\/.+/);
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN);
    await expect(page.getByText('Open Stack', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  });

  test('Detail Order: order dari jadwal ber-Open Stack menampilkan tanggalnya', async ({ page }) => {
    const tautan = await daftarTautanDetailOrder(page);
    test.skip(tautan.length === 0, 'Tidak ada data order pada akun demo');

    let ketemu = false;
    for (const href of tautan) {
      await bukaHalamanAksi(page, href, /\/order\/orderdetail\/.+/);
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

  test('Ganti Jadwal: blok PELAYARAN memuat Open Stack dan form jadwal baru menyediakan field Open Stack opsional', async ({
    page,
  }) => {
    const href = await tautanMenu(page, MENU.gantiJadwal);
    test.skip(!href, 'Tidak ada order dengan menu Ganti Jadwal pada akun demo');

    await bukaHalamanAksi(page, href!, /\/order\/ganti_jadwal\/.+/);
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN);

    await expect(formGantiJadwal.grupOpenStack(page)).toBeVisible();
    await expect(formGantiJadwal.grupOpenStack(page).locator('label')).toHaveText('Open Stack');
    await expect(formGantiJadwal.inputOpenStack(page)).toHaveAttribute('placeholder', 'DD/MM/YYYY');
    await expect(formGantiJadwal.inputOpenStack(page)).toBeEditable();

    const label = (await formGantiJadwal.labelTampil(page).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    expect(label.filter((l) => l === 'Open Stack'), `Label form: ${label.join(' | ')}`).toHaveLength(1);
    const posisi = label.indexOf('Open Stack');
    expect(label[posisi - 1]).toMatch(/^Voyage \*/);
    expect(label[posisi + 1]).toMatch(/^Closing Time \*/);
  });

  test('Edit Data Order: blok PELAYARAN memuat Open Stack berpasangan dengan label Closing Time', async ({ page }) => {
    const href = await tautanMenu(page, MENU.editDataOrder);
    test.skip(!href, 'Tidak ada order dengan menu Edit Data Order pada akun demo');

    await bukaHalamanAksi(page, href!, /\/order\/edit_inputpesanan\/.+/);
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN);
    // Halaman ini satu-satunya yang memakai label "Closing Time" (bukan "Closing").
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN_CLOSING_TIME);
  });

  test('Edit Status Order: blok PELAYARAN memuat Open Stack (nilai kosong dirender strip)', async ({ page }) => {
    const href = await tautanMenu(page, MENU.editStatusOrder);
    test.skip(!href, 'Tidak ada order dengan menu Edit Status Order pada akun demo');

    await bukaHalamanAksi(page, href!, /\/order\/editstatusorder\/.+/);
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN);
  });

  /** Buka Alihkan Order dari href menu (wajib ber-query alihkan=yes) dan tunggu tabel pengganti. */
  async function bukaAlihkanOrder(page: Page, href: string): Promise<number> {
    expect(href, 'href Alihkan Order wajib membawa query alihkan=yes (URL polos redirect)').toMatch(
      /\/order\/alihkanorder\/.+\?idorder=.+&alihkan=yes&lelang=.+/,
    );
    await page.goto(href);
    await expect(page).toHaveURL(/\/order\/alihkanorder\/.+alihkan=yes/);
    await expect(alihkanPage.ringkasan(page)).toBeVisible({ timeout: 20_000 });
    await alihkanPage.selKapalPengganti(page).first().waitFor({ timeout: 20_000 }).catch(() => {});
    return alihkanPage.selKapalPengganti(page).count();
  }

  test('Alihkan Order: ringkasan order memuat Open Stack di antara ETD - ETA dan Closing Time, tiap harga pengganti menampilkan Open Stack', async ({
    page,
  }) => {
    const href = await tautanMenu(page, MENU.alihkanOrder);
    test.skip(!href, 'Tidak ada order dengan menu Alihkan Order pada akun demo');

    const jumlah = await bukaAlihkanOrder(page, href!);
    await expect(alihkanPage.ringkasan(page)).toHaveText(POLA_RINGKASAN_ALIHKAN);
    await expect(alihkanPage.barisRingkasanOpenStack(page)).toHaveText(
      /^\s*Open\s+Stack\s*:\s*(\d{2}\/\d{2}\/\d{4})?\s*$/,
    );

    test.skip(jumlah === 0, 'Tidak ada harga pengganti ber-Open Stack untuk order terpilih');
    for (let i = 0; i < jumlah; i++) {
      await expect(alihkanPage.selKapalPengganti(page).nth(i)).toHaveText(POLA_SEL_KAPAL);
    }
  });

  test('Alihkan Order: order dari jadwal ber-Open Stack menampilkan tanggalnya di ringkasan', async ({ page }) => {
    const tautan = await daftarTautanMenu(page, MENU.alihkanOrder);
    test.skip(tautan.length === 0, 'Tidak ada order dengan menu Alihkan Order pada akun demo');

    let ketemu = false;
    for (const href of tautan) {
      await bukaAlihkanOrder(page, href);
      const baris = await alihkanPage.barisRingkasanOpenStack(page).innerText();
      if (/\d{2}\/\d{2}\/\d{4}/.test(baris)) {
        ketemu = true;
        break;
      }
    }
    // Nilai kosong di ringkasan ini dirender kosong (bukan "-") — lihat catatan
    // kalibrasi; order KM. Malay LELANGFCU termasuk yang kosong.
    test.skip(!ketemu, 'Tidak ada order ber-Open Stack terisi di antara order Alihkan yang diperiksa');
    await expect(alihkanPage.barisRingkasanOpenStack(page)).toHaveText(/Open\s+Stack\s*:\s*\d{2}\/\d{2}\/\d{4}\s*$/);
  });
});
