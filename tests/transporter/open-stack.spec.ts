import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Open Stack (field jadwal kapal BARU, rilis 2026-08) — peran
 * Bidder/Transporter (project "transporter", storageState
 * .auth/transporter.json via project setup).
 * Rule: docs/rules/open-stack.md (hasil kalibrasi — field TIDAK ada di
 * dokumen rule sumber). Scope read-only: tampilan nilai & keberadaan field
 * form; TIDAK menyimpan/mengubah jadwal.
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login form):
 * - Lihat Jadwal /home/masterjadwal1/<hash> (link "Lihat Jadwal" di dropdown
 *   Menu Jadwal, Harga & Jadwal tab 1/4): kolom "Open Stack" (th.clicknya =
 *   sortable, sama seperti kolom lain kecuali Aksi) di antara Voyage dan
 *   Closing Time; nilai dd/mm/yyyy TANPA jam (Closing Time ber-jam). Data
 *   ber-Open Stack: harga lelang LELANGFCU/28082026IK (KM. Layar 29/08/2026,
 *   KM. Malay 07/09/2026); harga lama pun ada yang terisi (KM. Jaya).
 * - Tombol "Tambah Jadwal" (button.tambahjadwal) → /home/tambahjadwal/<hash>?f=1;
 *   form tampil setelah pilih #jenis_jadwal (tanpa reload). Direct/Transit:
 *   input name=openstack (placeholder DD/MM/YYYY) di form-group berlabel
 *   "Open Stack" TANPA asterisk (opsional — Kapal/Voyage/Closing Time/ETD/ETA
 *   ber-asterisk), urutan Kapal, Voyage, Open Stack, Closing Time, Berangkat
 *   (ETD), Tiba (ETA). Connecting: input name=openstack_awal_connecting
 *   (input direct disembunyikan), posisi sama pada seksi kapal awal; seksi
 *   Data Kapal Connecting TANPA Open Stack.
 *   Catatan dev: label "Open Stack" ber-for="exampleEmail11" (id tak ada di
 *   halaman — sisa copy-paste; label tidak terasosiasi ke input).
 * - Edit Jadwal (a.editjadwal) pada jadwal yang sudah dipakai order → native
 *   alert "Jadwal sudah di order, tidak dapat di edit" — TIDAK dicakup.
 * - Detail Pengajuan Lelang /lelang/detaillistLelang/<id>: tabel harga
 *   penawaran desktop `.am-for-pc #tbody_hasil_penawaran`; sel kapal
 *   berteks "<kapal> <voyage> Open Stack: <tgl> Closing: <tgl jam>"
 *   (div.text_label_regular). Markup mobile duplikat tersembunyi berteks
 *   "Open Stack : <tgl>" (spasi sebelum titik dua).
 * - Detail Order /order/orderdetail/<hash> (link "Detail Order" ada di baris
 *   info TEPAT DI BAWAH baris data order; href relatif tanpa "/"): § 1.
 *   PEMESANAN blok "PELAYARAN" (div.heading_1, dobel desktop+mobile) berisi
 *   kapal, "Voyage : x", "Open Stack : <dd/mm/yyyy | ->", "Closing : <tgl jam>".
 *   TEMUAN untuk developer: order KM. Malay lelang LELANGFCU (20260829-06501,
 *   20260828-06506) menampilkan "Open Stack : -" padahal jadwal KM. Malay di
 *   Lihat Jadwal ber-Open Stack 07/09/2026 (Closing sama persis 01/12/2026
 *   16:21); order KM. Layar (20260828-06504/06505, 20260827-06502) tampil
 *   29/08/2026 sesuai jadwal. Belum jelas by-design (snapshot saat order
 *   dibuat, jadwal diedit belakangan) atau bug → dilaporkan, tidak diassert.
 * - Daftar Order (list) & tab Harga & Jadwal 1–5 TIDAK memuat Open Stack.
 * - Usulan data-testid ke developer: seluruh locator blok (.heading_1,
 *   .text_label_regular, #tbody_hasil_penawaran, th.clicknya) berbasis
 *   class/id tanpa role/label.
 */

const NOMOR_LELANG_OPEN_STACK = 'LELANGFCU/28082026IK';
const ID_LELANG_OPEN_STACK = 1089;
const TANGGAL = /^\d{2}\/\d{2}\/\d{4}$/;
/** Blok PELAYARAN: Voyage → Open Stack (tanggal atau "-") → Closing. Regex
 *  dicocokkan ke teks MENTAH (tanpa normalisasi whitespace) → pakai \s. */
const POLA_PELAYARAN =
  /Voyage\s*:\s*\S+\s+Open\s+Stack\s*:\s*(\d{2}\/\d{2}\/\d{4}|-)\s+Closing(?:\s+Time)?\s*:\s*\d{2}\/\d{2}\/\d{4}/;
const POLA_PELAYARAN_TANGGAL = /Open\s+Stack\s*:\s*\d{2}\/\d{2}\/\d{4}/;
/** Sel kapal tabel harga penawaran: voyage → Open Stack → Closing. Teks mentah
 *  antar-div TANPA spasi ("KMLYR001Open Stack: …Closing: …") → \s* di batasnya. */
const POLA_SEL_KAPAL = /\S+\s*Open\s+Stack\s*:\s*\d{2}\/\d{2}\/\d{4}\s*Closing\s*:\s*\d{2}\/\d{2}\/\d{4}/;

const lihatJadwal = {
  kolomOpenStack: (page: Page) => page.getByRole('columnheader', { name: /^Open Stack/ }),
  tabel: (page: Page) =>
    page.locator('table').filter({ has: page.getByRole('columnheader', { name: /^Open Stack/ }) }).first(),
  /** Baris jadwal = baris yang punya aksi Edit Jadwal (menyaring baris filler). */
  barisJadwal: (page: Page) =>
    lihatJadwal.tabel(page).locator('tbody tr').filter({ has: page.locator('a.editjadwal') }),
  tombolTambah: (page: Page) => page.getByRole('button', { name: 'Tambah Jadwal' }),
};

const formJadwal = {
  jenis: (page: Page) => page.locator('#jenis_jadwal'),
  grup: (page: Page, inputName: string) =>
    page.locator('.form-group', { has: page.locator(`input[name="${inputName}"]`) }),
  labelTampil: (page: Page) => page.locator('.form-group:visible label'),
};

const selKapalPenawaran = (page: Page) =>
  page.locator('.am-for-pc #tbody_hasil_penawaran td').filter({ hasText: /Open\s+Stack\s*:/ });

const blokPelayaran = (page: Page) =>
  page
    .locator('.heading_1', { hasText: /^\s*PELAYARAN\s*$/ })
    .filter({ visible: true })
    .first()
    .locator('..');

/** href relatif tanpa "/" di-resolve server via <base> — normalkan ke path absolut. */
function urlAbsolut(href: string): string {
  return /^https?:/.test(href) ? href : `/${href.replace(/^\/+/, '')}`;
}

/** Buka Lihat Jadwal (utamakan harga lelang ber-Open Stack); false bila tak ada harga. */
async function bukaLihatJadwal(page: Page): Promise<boolean> {
  for (const tab of [1, 4]) {
    await page.goto(`/home/hargajadwal?tab=${tab}`);
    const baris = page
      .locator('table tbody tr')
      .filter({ has: page.locator('a[href*="/home/masterjadwal1/"]') });
    await baris.first().waitFor({ timeout: 15_000 }).catch(() => {});
    if ((await baris.count()) === 0) continue;

    const utama = baris.filter({ hasText: NOMOR_LELANG_OPEN_STACK });
    const target = (await utama.count()) > 0 ? utama.first() : baris.first();
    const href = await target.locator('a[href*="/home/masterjadwal1/"]').first().getAttribute('href');
    if (!href) continue;

    await page.goto(href);
    await expect(lihatJadwal.kolomOpenStack(page)).toBeVisible({ timeout: 20_000 });
    return true;
  }
  return false;
}

/** Klik Tambah Jadwal lalu pilih jenis; kembalikan pesan alert bila lelang menolak. */
async function bukaFormTambahJadwal(
  page: Page,
  jenis: 'Kapal Direct / Transit' | 'Kapal Connecting',
): Promise<string | null> {
  let pesanAlert: string | null = null;
  page.once('dialog', async (dialog) => {
    pesanAlert = dialog.message();
    await dialog.dismiss();
  });
  await lihatJadwal.tombolTambah(page).click();
  await page.waitForURL(/\/home\/tambahjadwal\//, { timeout: 20_000 }).catch(() => {});
  if (pesanAlert) return pesanAlert;

  await formJadwal.jenis(page).selectOption({ label: jenis });
  return null;
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

test.describe('Open Stack — Lihat Jadwal (Bidder)', () => {
  test('kolom Open Stack tampil di antara Voyage dan Closing Time dan dapat diurutkan', async ({ page }) => {
    test.skip(!(await bukaLihatJadwal(page)), 'Tidak ada harga dengan jadwal pada akun demo');

    const kolom = (await lihatJadwal.tabel(page).getByRole('columnheader').allInnerTexts()).map((t) => t.trim());
    expect(kolom, `Kolom: ${kolom.join(' | ')}`).toContain('Open Stack');
    expect(kolom.indexOf('Open Stack')).toBe(kolom.indexOf('Voyage') + 1);
    expect(kolom.indexOf('Closing Time')).toBe(kolom.indexOf('Open Stack') + 1);
    // Sortable = class clicknya (sama dgn kolom lain; hanya Aksi yang tidak).
    await expect(lihatJadwal.kolomOpenStack(page)).toHaveClass(/clicknya/);
    await expect(lihatJadwal.tabel(page).getByRole('columnheader', { name: 'Aksi' })).not.toHaveClass(/clicknya/);
  });

  test('nilai Open Stack berformat tanggal dd/mm/yyyy tanpa jam, berbeda dengan Closing Time', async ({ page }) => {
    test.skip(!(await bukaLihatJadwal(page)), 'Tidak ada harga dengan jadwal pada akun demo');
    const baris = lihatJadwal.barisJadwal(page);
    await baris.first().waitFor({ timeout: 15_000 }).catch(() => {});
    const jumlah = await baris.count();
    test.skip(jumlah === 0, 'Harga terpilih belum punya jadwal pada akun demo');

    let adaTanggal = false;
    for (let i = 0; i < jumlah; i++) {
      const sel = baris.nth(i).locator('td');
      const openStack = (await sel.nth(3).innerText()).trim();
      // Opsional: boleh kosong, bila terisi wajib dd/mm/yyyy (tanpa jam).
      expect(openStack, `Baris ${i + 1} Open Stack: "${openStack}"`).toMatch(/^(\d{2}\/\d{2}\/\d{4})?$/);
      await expect(sel.nth(4)).toHaveText(/^\s*\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\s*$/);
      if (TANGGAL.test(openStack)) adaTanggal = true;
    }
    test.skip(!adaTanggal, 'Tidak ada jadwal ber-Open Stack pada harga terpilih di akun demo');
  });

  test('form Tambah Jadwal kapal direct/transit memuat field Open Stack opsional di antara Voyage dan Closing Time', async ({
    page,
  }) => {
    test.skip(!(await bukaLihatJadwal(page)), 'Tidak ada harga dengan jadwal pada akun demo');
    const alert = await bukaFormTambahJadwal(page, 'Kapal Direct / Transit');
    test.skip(alert !== null, `Lelang menolak tambah jadwal: "${alert}"`);

    const input = page.locator('input[name="openstack"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'DD/MM/YYYY');
    // Label tanpa asterisk (opsional) — pembanding: Closing Time ber-asterisk.
    await expect(formJadwal.grup(page, 'openstack').locator('label')).toHaveText('Open Stack');
    await expect(formJadwal.grup(page, 'closing').locator('label')).toHaveText(/Closing Time\s*\*/);

    const label = (await formJadwal.labelTampil(page).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    const posisi = label.indexOf('Open Stack');
    expect(posisi, `Label form: ${label.join(' | ')}`).toBeGreaterThan(0);
    expect(label[posisi - 1]).toMatch(/^Voyage/);
    expect(label[posisi + 1]).toMatch(/^Closing Time/);
    // Varian connecting tersembunyi saat direct dipilih.
    await expect(page.locator('input[name="openstack_awal_connecting"]')).toBeHidden();
  });

  test('form Tambah Jadwal kapal connecting memuat field Open Stack opsional hanya pada kapal awal', async ({
    page,
  }) => {
    test.skip(!(await bukaLihatJadwal(page)), 'Tidak ada harga dengan jadwal pada akun demo');
    const alert = await bukaFormTambahJadwal(page, 'Kapal Connecting');
    test.skip(alert !== null, `Lelang menolak tambah jadwal: "${alert}"`);

    const input = page.locator('input[name="openstack_awal_connecting"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'DD/MM/YYYY');
    await expect(formJadwal.grup(page, 'openstack_awal_connecting').locator('label')).toHaveText('Open Stack');
    await expect(page.locator('input[name="openstack"]')).toBeHidden();

    const label = (await formJadwal.labelTampil(page).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    // Tepat satu field Open Stack: di kapal awal (setelah Voyage, sebelum
    // Closing Time); seksi Data Kapal Connecting tidak memilikinya.
    expect(label.filter((l) => l === 'Open Stack'), `Label form: ${label.join(' | ')}`).toHaveLength(1);
    const posisi = label.indexOf('Open Stack');
    expect(label[posisi - 1]).toMatch(/^Voyage/);
    expect(label[posisi + 1]).toMatch(/^Closing Time/);
    expect(label.indexOf('Pelabuhan Connecting *')).toBeGreaterThan(posisi);
  });
});

test.describe('Open Stack — Detail Pengajuan Lelang (Bidder)', () => {
  test('tabel harga penawaran menampilkan Open Stack tiap kapal di antara voyage dan Closing', async ({ page }) => {
    await page.goto(`/lelang/detaillistLelang/${ID_LELANG_OPEN_STACK}`);
    // Nomor lelang dirender dobel (desktop + mobile hidden) → saring yang visible.
    const nomor = page.getByText(NOMOR_LELANG_OPEN_STACK).filter({ visible: true }).first();
    await nomor.waitFor({ timeout: 20_000 }).catch(() => {});
    test.skip(!(await nomor.isVisible().catch(() => false)), `Lelang ${NOMOR_LELANG_OPEN_STACK} tidak ada lagi di demo`);

    const sel = selKapalPenawaran(page);
    await sel.first().waitFor({ timeout: 15_000 }).catch(() => {});
    const jumlah = await sel.count();
    expect(jumlah).toBeGreaterThan(0);
    for (let i = 0; i < jumlah; i++) {
      await expect(sel.nth(i)).toHaveText(POLA_SEL_KAPAL);
    }
  });
});

test.describe('Open Stack — Detail Order (Bidder)', () => {
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
    // Lihat catatan kalibrasi: order KM. Malay LELANGFCU tampil "-" walau
    // jadwalnya ber-Open Stack — kandidat temuan, bukan asumsi test.
    test.skip(!ketemu, 'Tidak ada order ber-Open Stack terisi di antara order yang diperiksa');
    await expect(blokPelayaran(page)).toHaveText(POLA_PELAYARAN_TANGGAL);
  });
});
