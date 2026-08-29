import { expect, test, type Locator, type Page } from '@playwright/test';
import * as ExcelJS from 'exceljs';

/**
 * Modul: Open Stack — alur MUTASI jadwal kapal sisi Bidder/Transporter
 * (project "transporter"). Izin mutasi demo dari user 2026-08-29.
 * Rule: docs/rules/open-stack.md (hasil eksplorasi — belum ada rule resmi)
 * + docs/rules/bidder/10-harga-jadwal.md § Jadwal (required, jenis jadwal,
 * hapus jadwal).
 *
 * Kalibrasi/eksplorasi 2026-08-29 via playwright-cli (login form):
 * - Lihat Jadwal /home/masterjadwal1/<hash> → tombol "Tambah Jadwal" →
 *   /home/tambahjadwal/<hash>?f=1; form tampil setelah pilih #jenis_jadwal.
 *   Direct: input kapal, voyage, openstack, closing, etd, eta; Simpan
 *   #submitonce. Connecting: *_awal_connecting + select #pelabuhan_connecting,
 *   kapal_connecting, voyage_connecting, etd_connecting; Simpan
 *   #submitonce_connecting.
 * - Validasi required = POPOVER Bootstrap transient (bukan alert), satu per
 *   satu mengikuti atribut `pesan` input ber-class .pesan: Nama Kapal →
 *   Voyage → Closing Time → Berangkat → Tiba. Open Stack TANPA .pesan =
 *   opsional, dan TANPA minDate/maxDate (daterangepicker) — nilai apa pun
 *   diterima (setelah Closing/ETA, bahkan tanggal lampau).
 * - Semua input tanggal = daterangepicker single: WAJIB diketik per karakter
 *   (pressSequentially) + Enter; fill() di-reset picker (terbukti).
 * - Sukses simpan/edit/hapus → redirect Lihat Jadwal + alert DOM role=alert
 *   "Anda berhasil menambah/mengedit/menghapus jadwal". Hapus (button
 *   .delete_kelas) → SweetAlert2 "Hapus?" [Hapus/Batal]. Edit (a.editjadwal)
 *   → /home/editjadwal/<id>, input openstack_master, Simpan #submitonce.
 * - Baris connecting: sel kapal memuat span.modal_conecting "(Connecting 1x)"
 *   → modal #modal_transit "JADWAL KAPAL CONNECTING" berisi "Open Stack -
 *   <tgl>" (format strip).
 * - Template Import Jadwal = tombol "Download template disini" (tampil
 *   setelah pilih jenis) → assets/Format/Template Jadwal PH Bid.xlsx: header
 *   baris 2 sheet "Template Jadwal PH BID" = Kapal, Voyage, Closing Time,
 *   Berangkat (ETD), Tiba (ETA) → TANPA Open Stack (gap). DEFECT #11: file
 *   berisi 11 sheet — sheet lain memuat data internal & data pribadi
 *   responden survei (nama, jenis kelamin, kota, nomor telepon).
 *
 * Pola mutasi: setiap test membuat jadwalnya sendiri (voyage unik
 * "AT-OS-<base36 waktu>") dan MENGHAPUSNYA di finally; flag `jadwalDibuat`
 * di-set segera setelah klik Simpan (sebelum verifikasi). Jadwal tanpa
 * order selalu bisa dihapus (rule). Data tetap: jadwal "AUTOTEST Kapal /
 * AT-OS-1" (id 1870) sengaja dibiarkan karena sudah di-order (tak bisa
 * dihapus) — lihat docs/rules/open-stack.md.
 */

const NOMOR_LELANG_OPEN_STACK = 'LELANGFCU/28082026IK';
const ID_LELANG_OPEN_STACK = 1089;

/** dd/mm/yyyy untuk hari ini + offset. */
function tgl(offsetHari: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetHari);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function voyageUnik(): string {
  return `AT-OS-${Date.now().toString(36).toUpperCase()}`;
}

const lihatJadwal = {
  kolomOpenStack: (page: Page) => page.getByRole('columnheader', { name: /^Open Stack/ }),
  barisVoyage: (page: Page, voyage: string) => page.locator('table tbody tr').filter({ hasText: voyage }),
  tombolTambah: (page: Page) => page.getByRole('button', { name: 'Tambah Jadwal' }),
  alertSukses: (page: Page, teks: string) => page.getByRole('alert').filter({ hasText: teks }),
};

const form = {
  jenis: (page: Page) => page.locator('#jenis_jadwal'),
  input: (page: Page, name: string) => page.locator(`input[name="${name}"]`),
  simpanDirect: (page: Page) => page.locator('#submitonce'),
  simpanConnecting: (page: Page) => page.locator('#submitonce_connecting'),
  popover: (page: Page, teks: string) => page.locator('.popover').filter({ hasText: teks }),
};

/** Buka Lihat Jadwal harga lelang ber-Open Stack (fallback harga pertama); null bila tak ada. */
async function bukaLihatJadwal(page: Page): Promise<string | null> {
  for (const tab of [1, 4]) {
    await page.goto(`/home/hargajadwal?tab=${tab}`);
    const baris = page.locator('table tbody tr').filter({ has: page.locator('a[href*="/home/masterjadwal1/"]') });
    await baris.first().waitFor({ timeout: 15_000 }).catch(() => {});
    if ((await baris.count()) === 0) continue;
    const utama = baris.filter({ hasText: NOMOR_LELANG_OPEN_STACK });
    const target = (await utama.count()) > 0 ? utama.first() : baris.first();
    const href = await target.locator('a[href*="/home/masterjadwal1/"]').first().getAttribute('href');
    if (!href) continue;
    await page.goto(href);
    await expect(lihatJadwal.kolomOpenStack(page)).toBeVisible({ timeout: 20_000 });
    return page.url();
  }
  return null;
}

/** Klik Tambah Jadwal & pilih jenis; kembalikan pesan alert bila lelang menolak. */
async function bukaFormTambahJadwal(
  page: Page,
  jenis: 'Kapal Direct / Transit' | 'Kapal Connecting',
  pesanDialog: string[],
): Promise<string | null> {
  const sebelum = pesanDialog.length;
  await lihatJadwal.tombolTambah(page).click();
  await page.waitForURL(/\/home\/tambahjadwal\//, { timeout: 20_000 }).catch(() => {});
  if (pesanDialog.length > sebelum) return pesanDialog[pesanDialog.length - 1];
  await form.jenis(page).selectOption({ label: jenis });
  return null;
}

/** daterangepicker: ketik per karakter + Enter (fill() di-reset picker). */
async function ketikTanggal(page: Page, input: Locator, nilai: string): Promise<void> {
  await input.click();
  await page.keyboard.press('Control+A');
  await input.pressSequentially(nilai, { delay: 15 });
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue(nilai);
}

/** Tutup picker/popover yang mungkin masih terbuka dengan klik area kosong. */
async function klikAreaKosong(page: Page): Promise<void> {
  await page.mouse.click(5, 5);
}

async function isiDirect(
  page: Page,
  data: { kapal: string; voyage: string; openStack?: string; closing: string; etd: string; eta: string },
): Promise<void> {
  await form.input(page, 'kapal').fill(data.kapal);
  await form.input(page, 'voyage').fill(data.voyage);
  if (data.openStack) await ketikTanggal(page, form.input(page, 'openstack'), data.openStack);
  await ketikTanggal(page, form.input(page, 'closing'), data.closing);
  await ketikTanggal(page, form.input(page, 'etd'), data.etd);
  await ketikTanggal(page, form.input(page, 'eta'), data.eta);
  await klikAreaKosong(page);
}

async function tungguSuksesTambah(page: Page, voyage: string): Promise<Locator> {
  await expect(page).toHaveURL(/\/home\/masterjadwal1\//, { timeout: 20_000 });
  await expect(lihatJadwal.alertSukses(page, 'Anda berhasil menambah jadwal')).toBeVisible();
  const baris = lihatJadwal.barisVoyage(page, voyage).first();
  await expect(baris).toBeVisible();
  return baris;
}

/** Hapus jadwal (belum di-order) dari halaman Lihat Jadwal, verifikasi alert & baris hilang. */
async function hapusJadwal(page: Page, voyage: string): Promise<void> {
  const baris = lihatJadwal.barisVoyage(page, voyage).first();
  await baris.locator('button.delete_kelas').click();
  const swal = page.locator('.swal2-container');
  await expect(swal).toContainText('Hapus?');
  await swal.getByRole('button', { name: 'Hapus' }).click();
  await expect(lihatJadwal.alertSukses(page, 'Anda berhasil menghapus jadwal')).toBeVisible({ timeout: 20_000 });
  await expect(lihatJadwal.barisVoyage(page, voyage)).toHaveCount(0);
}

/** Cleanup finally: kembali ke Lihat Jadwal, hapus bila baris masih ada. */
async function bersihkanJadwal(page: Page, urlLihatJadwal: string, voyage: string): Promise<void> {
  await page.goto(urlLihatJadwal);
  await lihatJadwal.kolomOpenStack(page).waitFor({ timeout: 20_000 }).catch(() => {});
  if ((await lihatJadwal.barisVoyage(page, voyage).count()) > 0) {
    await hapusJadwal(page, voyage);
  }
}

function pasangPenampungDialog(page: Page): string[] {
  const pesan: string[] = [];
  page.on('dialog', async (dialog) => {
    pesan.push(dialog.message());
    await dialog.accept();
  });
  return pesan;
}

test.describe('Open Stack — Tambah/Edit/Hapus Jadwal (Bidder, mutasi)', () => {
  test.describe.configure({ mode: 'serial' });
  test.slow();

  test('validasi required Tambah Jadwal berurutan lewat popover dan melewati Open Stack (opsional)', async ({
    page,
  }) => {
    const pesanDialog = pasangPenampungDialog(page);
    test.skip(!(await bukaLihatJadwal(page)), 'Tidak ada harga dengan jadwal pada akun demo');
    const alert = await bukaFormTambahJadwal(page, 'Kapal Direct / Transit', pesanDialog);
    test.skip(alert !== null, `Lelang menolak tambah jadwal: "${alert}"`);

    // Popover transient (±2 dtk) → assert segera setelah klik Simpan.
    await form.simpanDirect(page).click();
    await expect(form.popover(page, 'Masukkan Nama Kapal')).toBeVisible();
    await form.input(page, 'kapal').fill('AUTOTEST Validasi');
    await form.simpanDirect(page).click();
    await expect(form.popover(page, 'Masukkan Voyage')).toBeVisible();
    await form.input(page, 'voyage').fill('AT-VALIDASI');
    // Open Stack dikosongkan → validasi langsung loncat ke Closing Time.
    await form.simpanDirect(page).click();
    await expect(form.popover(page, 'Masukkan Tanggal Closing Time')).toBeVisible();
    await ketikTanggal(page, form.input(page, 'closing'), `${tgl(30)} 10:00`);
    await klikAreaKosong(page);
    await form.simpanDirect(page).click();
    await expect(form.popover(page, 'Masukkan Tanggal Berangkat')).toBeVisible();
    await ketikTanggal(page, form.input(page, 'etd'), tgl(31));
    await klikAreaKosong(page);
    await form.simpanDirect(page).click();
    await expect(form.popover(page, 'Masukkan Tanggal Tiba')).toBeVisible();
    // Berhenti di sini (ETA kosong) → tidak ada jadwal yang tersimpan.
    await expect(page).toHaveURL(/\/home\/tambahjadwal\//);
  });

  test('tambah jadwal direct ber-Open Stack tampil di Lihat Jadwal & Detail Pengajuan Lelang, bisa diedit lalu dihapus', async ({
    page,
  }) => {
    const pesanDialog = pasangPenampungDialog(page);
    const urlLihatJadwal = await bukaLihatJadwal(page);
    test.skip(!urlLihatJadwal, 'Tidak ada harga dengan jadwal pada akun demo');
    const alert = await bukaFormTambahJadwal(page, 'Kapal Direct / Transit', pesanDialog);
    test.skip(alert !== null, `Lelang menolak tambah jadwal: "${alert}"`);

    const voyage = voyageUnik();
    const openStack = tgl(28);
    const openStackBaru = tgl(29);
    let jadwalDibuat = false;
    try {
      await isiDirect(page, {
        kapal: 'AUTOTEST Kapal',
        voyage,
        openStack,
        closing: `${tgl(30)} 10:00`,
        etd: tgl(31),
        eta: tgl(35),
      });
      await form.simpanDirect(page).click();
      jadwalDibuat = true;

      const baris = await tungguSuksesTambah(page, voyage);
      const sel = baris.locator('td');
      await expect(sel.nth(1)).toHaveText('AUTOTEST Kapal');
      await expect(sel.nth(2)).toHaveText(voyage);
      await expect(sel.nth(3)).toHaveText(openStack);

      // Detail Pengajuan Lelang: sel kapal memuat "Open Stack: <tgl>".
      await page.goto(`/lelang/detaillistLelang/${ID_LELANG_OPEN_STACK}`);
      const nomor = page.getByText(NOMOR_LELANG_OPEN_STACK).filter({ visible: true }).first();
      await nomor.waitFor({ timeout: 20_000 }).catch(() => {});
      if (await nomor.isVisible().catch(() => false)) {
        const selKapal = page.locator('.am-for-pc #tbody_hasil_penawaran td').filter({ hasText: voyage });
        await expect(selKapal.first()).toHaveText(new RegExp(`Open\\s+Stack\\s*:\\s*${openStack}\\s*Closing`));
      } else {
        test.info().annotations.push({ type: 'note', description: `Lelang ${NOMOR_LELANG_OPEN_STACK} tidak ditemukan — cek detail lelang dilewati` });
      }

      // Edit Jadwal: ubah Open Stack saja.
      await page.goto(urlLihatJadwal!);
      await lihatJadwal.barisVoyage(page, voyage).first().locator('a.editjadwal').click();
      await expect(page).toHaveURL(/\/home\/editjadwal\/\d+$/);
      const inputEdit = form.input(page, 'openstack_master');
      await expect(inputEdit).toHaveValue(openStack);
      await ketikTanggal(page, inputEdit, openStackBaru);
      await klikAreaKosong(page);
      await form.simpanDirect(page).click();
      await expect(page).toHaveURL(/\/home\/masterjadwal1\//, { timeout: 20_000 });
      await expect(lihatJadwal.alertSukses(page, 'Anda berhasil mengedit jadwal')).toBeVisible();
      await expect(lihatJadwal.barisVoyage(page, voyage).first().locator('td').nth(3)).toHaveText(openStackBaru);

      // Hapus jadwal (belum di-order): konfirmasi SweetAlert2 lalu alert sukses.
      await hapusJadwal(page, voyage);
      jadwalDibuat = false;
    } finally {
      if (jadwalDibuat) await bersihkanJadwal(page, urlLihatJadwal!, voyage);
    }
  });

  test('Open Stack tidak dibatasi tanggal: diterima setelah ETA saat tambah dan tanggal lampau saat edit (perilaku teramati, belum ada rule)', async ({
    page,
  }) => {
    // Bila developer menambahkan validasi, test INI yang gagal → perbarui
    // docs/rules/open-stack.md (kandidat rule/defect #1 di dokumen itu).
    const pesanDialog = pasangPenampungDialog(page);
    const urlLihatJadwal = await bukaLihatJadwal(page);
    test.skip(!urlLihatJadwal, 'Tidak ada harga dengan jadwal pada akun demo');
    const alert = await bukaFormTambahJadwal(page, 'Kapal Direct / Transit', pesanDialog);
    test.skip(alert !== null, `Lelang menolak tambah jadwal: "${alert}"`);

    const voyage = voyageUnik();
    const openStackSetelahEta = tgl(40);
    let jadwalDibuat = false;
    try {
      await isiDirect(page, {
        kapal: 'AUTOTEST Kapal',
        voyage,
        openStack: openStackSetelahEta,
        closing: `${tgl(30)} 10:00`,
        etd: tgl(31),
        eta: tgl(35),
      });
      await form.simpanDirect(page).click();
      jadwalDibuat = true;
      const baris = await tungguSuksesTambah(page, voyage);
      await expect(baris.locator('td').nth(3)).toHaveText(openStackSetelahEta);

      await baris.locator('a.editjadwal').click();
      await expect(page).toHaveURL(/\/home\/editjadwal\/\d+$/);
      // Prefill form diisi JS SETELAH load (atribut value kosong) — tunggu
      // nilai lama muncul dulu, kalau tidak ketikan tertimpa prefill
      // (terbukti gagal run pertama 2026-08-29).
      await expect(form.input(page, 'openstack_master')).toHaveValue(openStackSetelahEta);
      await ketikTanggal(page, form.input(page, 'openstack_master'), '01/01/2020');
      await klikAreaKosong(page);
      await form.simpanDirect(page).click();
      await expect(lihatJadwal.alertSukses(page, 'Anda berhasil mengedit jadwal')).toBeVisible({ timeout: 20_000 });
      await expect(lihatJadwal.barisVoyage(page, voyage).first().locator('td').nth(3)).toHaveText('01/01/2020');
    } finally {
      if (jadwalDibuat) await bersihkanJadwal(page, urlLihatJadwal!, voyage);
    }
  });

  test('tambah jadwal connecting ber-Open Stack: baris (Connecting 1x) dan modal Jadwal Kapal Connecting menampilkan Open Stack, lalu dihapus', async ({
    page,
  }) => {
    const pesanDialog = pasangPenampungDialog(page);
    const urlLihatJadwal = await bukaLihatJadwal(page);
    test.skip(!urlLihatJadwal, 'Tidak ada harga dengan jadwal pada akun demo');
    const alert = await bukaFormTambahJadwal(page, 'Kapal Connecting', pesanDialog);
    test.skip(alert !== null, `Lelang menolak tambah jadwal: "${alert}"`);

    const voyage = voyageUnik();
    const openStack = tgl(20);
    let jadwalDibuat = false;
    try {
      await form.input(page, 'kapal_awal_connecting').fill('AUTOTEST Conn');
      await form.input(page, 'voyage_awal_connecting').fill(voyage);
      await ketikTanggal(page, form.input(page, 'openstack_awal_connecting'), openStack);
      await ketikTanggal(page, form.input(page, 'closing_awal_connecting'), `${tgl(25)} 09:00`);
      await ketikTanggal(page, form.input(page, 'etd_awal_connecting'), tgl(26));
      await ketikTanggal(page, form.input(page, 'eta_awal_connecting'), tgl(30));
      await page.locator('#pelabuhan_connecting').selectOption({ index: 1 });
      await form.input(page, 'kapal_connecting').fill('AUTOTEST Feeder');
      await form.input(page, 'voyage_connecting').fill(`${voyage}F`);
      await ketikTanggal(page, form.input(page, 'etd_connecting'), tgl(28));
      await klikAreaKosong(page);
      await form.simpanConnecting(page).click();
      jadwalDibuat = true;

      const baris = await tungguSuksesTambah(page, voyage);
      await expect(baris.locator('td').nth(1)).toHaveText(/AUTOTEST Conn\s*\(Connecting 1x\)/);
      await expect(baris.locator('td').nth(3)).toHaveText(openStack);

      await baris.locator('span.modal_conecting').click();
      const modal = page.locator('#modal_transit');
      await expect(modal).toBeVisible({ timeout: 15_000 });
      await expect(modal).toContainText('JADWAL KAPAL CONNECTING');
      await expect(modal).toContainText(`Open Stack - ${openStack}`);
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();

      await hapusJadwal(page, voyage);
      jadwalDibuat = false;
    } finally {
      if (jadwalDibuat) await bersihkanJadwal(page, urlLihatJadwal!, voyage);
    }
  });
});

test.describe('Open Stack — template Import Jadwal (Bidder)', () => {
  test.slow();

  async function unduhTemplate(page: Page): Promise<ExcelJS.Workbook | null> {
    const pesanDialog = pasangPenampungDialog(page);
    if (!(await bukaLihatJadwal(page))) return null;
    if ((await bukaFormTambahJadwal(page, 'Kapal Direct / Transit', pesanDialog)) !== null) return null;
    const [unduhan] = await Promise.all([
      page.waitForEvent('download', { timeout: 20_000 }),
      page.getByRole('button', { name: 'Download template disini' }).click(),
    ]);
    const lokasi = await unduhan.path();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(lokasi!);
    return wb;
  }

  test('template berisi kolom jadwal (Kapal, Voyage, Closing Time, ETD, ETA) — belum ada kolom Open Stack', async ({
    page,
  }) => {
    const wb = await unduhTemplate(page);
    test.skip(!wb, 'Template tidak bisa diunduh (tidak ada harga / lelang menolak tambah jadwal)');

    const sheet = wb!.getWorksheet('Template Jadwal PH BID') ?? wb!.worksheets[0];
    const header = (sheet.getRow(2).values as Array<string | undefined>).filter((v): v is string => typeof v === 'string');
    expect(header).toEqual(['Kapal', 'Voyage', 'Closing Time', 'Berangkat (ETD)', 'Tiba (ETA)']);
    // Gap fitur (docs/rules/open-stack.md temuan #2): import tidak bisa
    // membawa Open Stack karena kolomnya tidak ada di template.
    test.info().annotations.push({
      type: 'gap',
      description: 'Template Import Jadwal tidak menyediakan kolom Open Stack',
    });
  });

  test('template hanya berisi satu sheet jadwal (DEFECT: sheet lain memuat data internal & data pribadi)', async ({
    page,
  }) => {
    test.fail(
      true,
      'DEFECT #11 2026-08-29: Template Jadwal PH Bid.xlsx berisi 11 sheet — KPI/PIVOT/CHART/Annwijzing TCI/LinkedIn (nama, jenis kelamin, kota, no. telepon responden)/Penelitian ikut terunduh publik',
    );
    const wb = await unduhTemplate(page);
    test.skip(!wb, 'Template tidak bisa diunduh (tidak ada harga / lelang menolak tambah jadwal)');

    const namaSheet = wb!.worksheets.map((ws) => ws.name);
    expect(namaSheet, `Sheet: ${namaSheet.join(', ')}`).toEqual(['Template Jadwal PH BID']);
  });
});
