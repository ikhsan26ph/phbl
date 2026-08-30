import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Pengajuan Lelang — peran Administrator (project "admin",
 * storageState .auth/admin.json via project setup).
 * Rule: docs/rules/administrator/04-pengajuan-lelang.md (daftar, detail,
 * Edit Data Lelang, Tambah Peserta Lelang, History Data Lelang, Batalkan
 * Lelang, History Request Harga). Scope: read-only — halaman aksi hanya
 * DIBUKA, tidak ada form yang disubmit; alur Request Harga ada di
 * tests/admin/cari-penawaran.spec.ts (tombolnya di halaman Cari Penawaran).
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login form admin):
 * - "/" untuk admin redirect ke /lelang/listlelang?tab=semua-lelang. 6 tab
 *   sama dengan bidder (slug kebab-case, aktif `btn-tabs-active`). Breadcrumb
 *   "Beranda / Daftar Pengajuan Lelang" (Beranda bukan link di halaman ini).
 * - Kolom: No, Shipper, Nomor Lelang, Buka Lelang, Tutup Lelang, Rencana
 *   Mulai Kirim, Rencana Akhir Kirim, Aksi. Keterangan (visible, tag <i>):
 *   "*) Hijau = lelang tidak ada order, # adalah request harga" (varian
 *   "...request update harga" ada di DOM tapi hidden/mobile).
 * - Baris dimuat async ("Mohon tunggu sebentar"), tbody diawali baris filler
 *   → baris data = tr yang punya button.btn_action_menu. Tab kosong: "Tidak
 *   Ada Data yang Tersedia" (tab perlu-update-harga kosong saat kalibrasi).
 * - Menu aksi (SEMUA tab berdata, isinya sama): a "Detail Pengajuan Lelang"
 *   (/lelang/detaillistLelang/<id>), a "Lihat Harga Penawaran" (/lelang/
 *   carirute/?from=search&id_user=..&lelang=..&nomor_lelang=..), a#tombol_
 *   tambah_pesertalelang "Tambah Peserta Lelang" (/lelang/tambah_pilihpeserta
 *   Lelang/<id>), a#edit_data_lelang "Edit Data Lelang" (/lelang/edit_data_
 *   lelang/<id>), span.batalkan_lelang "Batalkan Lelang" (atribut link=
 *   /lelang/batalkanlelang/<id>, value=<id>); kondisional a.history_data_lelang
 *   "History Data Lelang" (/lelang/historyupdatelelang/<hash>) dan
 *   a.history_update_harga "History Request Harga" (/lelang/historyupdateharga/
 *   <hash>). Id elemen menu DUPLIKAT antar baris → locate di dalam baris.
 *   TIDAK ADA item "Minta Update Harga"/"Menuju Update Harga" (rule tab Lelang
 *   Tutup/Telah Akhir Kirim/Perlu Update Harga) — request harga dilakukan dari
 *   tombol "Request Harga" di Cari Penawaran → test.fail (diskrepansi).
 *   Rule menulis "History Update Harga"; UI "History Request Harga".
 * - Klik Edit/Tambah Peserta/Batalkan/Request = JS ajax cek dulu
 *   (lelang/cek_tgl_rencanaakhir[_edit_lelang], cekactionbatallelang) lalu
 *   SweetAlert2 [Mengerti] bila diblokir (rule menulis "alert"):
 *   lelang batal → "Tidak bisa batal! Lelang sudah dibatalkan" / "Tidak bisa
 *   edit! Lelang sudah dibatalkan" / "Tidak bisa tambah peserta! Lelang sudah
 *   dibatalkan"; lewat akhir kirim → "Tidak bisa tambah peserta! Lelang sudah
 *   melewati tgl. rencana akhir kirim"; lelang ber-order → "Tidak bisa batal!
 *   Lelang sudah ada order" (teks swal berisi <br> → cocokkan dgn \s*).
 *   Akses LANGSUNG (goto) halaman edit/tambah peserta lelang batal → redirect
 *   ke list + alert DOM .alert_negatif "Anda Tidak Memiliki Akses Ke Halaman
 *   Tersebut".
 * - Nomor lelang hijau = computed color rgb(58, 196, 125) pada td ke-3
 *   (contoh QA/06/26-OPEN1 di tab Lelang Batal); tanda "(#n)" di sel yang
 *   sama (contoh "LELANGTES (#1)").
 * - Detail: status label (BELUM BUKA/LELANG DIBUKA/LELANG DITUTUP/LELANG
 *   BATAL), tabel info lelang, seksi SYARAT & KETENTUAN / RUTE PENGIRIMAN /
 *   INFORMASI KONTAINER, heading "TRANSPORTER PENERIMA LELANG" + "Penawaran :
 *   N dari M" + "*) Penawaran = Telah input harga dan jadwal" + tabel No |
 *   Transporter | Tanggal Terkirim | Status Harga. Tombol "Batalkan Lelang"
 *   hanya pada lelang yang masih bisa dibatalkan. Lelang batal: card "LELANG
 *   BATAL" dgn "Tanggal Lelang Batal" & "Alasan Lelang Dibatalkan".
 * - Edit Data Lelang: 3 checkbox pembuka seksi (#edit_data, #edit_rute,
 *   #edit_kontainer); semua input DISABLED sebelum dicentang; Simpan
 *   #submitonce1. Tambah Peserta: #search_bidder, #pilih_semua_bidder, tabel
 *   Transporter | Lokasi | Rating | Pilih Semua, bidder yang sudah diundang =
 *   checkbox DISABLED+checked, Simpan #tombol_lanjutkan DISABLED default.
 *   Batalkan Lelang (halaman): select #alasan_batal (Pilih.., Harga Kemahalan,
 *   Jadwal Tidak Cocok, Salah Input Informasi, Lelang Double Input, Lainnya),
 *   textarea #catatan_batal_lelang, catatan "Lelang batal akan mengirim notif
 *   ke peserta lelang", tombol Batal/Submit.
 * - History Data Lelang: label Tanggal Perubahan / Edit By / Buka Lelang /
 *   Tutup Lelang / Rencana Mulai Kirim / Rencana Akhir Kirim. History Request
 *   Harga: Shipper / Lelang / Tanggal Request / Tanggal Tutup Request Harga /
 *   Peserta Yang Diundang / Close Request / Tanggal Close Request.
 *
 * TIDAK dicakup (mutasi / butuh kondisi data): submit edit/tambah peserta/
 * batal/request harga, alert "Tidak Bisa Input Simbol", "(By Admin)" pada
 * detail lelang batal admin, "Perubahan Terakhir"+History di detail, kondisi
 * "masih proses update harga" (tak ada datanya saat kalibrasi).
 */

const listUrl = '/lelang/listlelang';

const TABS: Array<{ nama: string; slug: string }> = [
  { nama: 'Semua Lelang', slug: 'semua-lelang' },
  { nama: 'Perlu Input Harga', slug: 'perlu-input-harga' },
  { nama: 'Perlu Update Harga', slug: 'perlu-update-harga' },
  { nama: 'Lelang Tutup', slug: 'lelang-tutup' },
  { nama: 'Telah Akhir Kirim', slug: 'telah-akhir-kirim' },
  { nama: 'Lelang Batal', slug: 'lelang-batal' },
];

const MENU_DASAR = [
  'Detail Pengajuan Lelang',
  'Lihat Harga Penawaran',
  'Tambah Peserta Lelang',
  'Edit Data Lelang',
  'Batalkan Lelang',
];

const listPage = {
  tab: (page: Page, nama: string) => page.getByRole('link', { name: nama, exact: true }),
  barisData: (page: Page) =>
    page.locator('table tbody tr').filter({ has: page.locator('button.btn_action_menu') }),
  swal: (page: Page) => page.locator('.swal2-container'),
};

async function tungguBarisData(page: Page): Promise<number> {
  await listPage.barisData(page).first().waitFor({ timeout: 20_000 }).catch(() => {});
  return listPage.barisData(page).count();
}

async function bukaTab(page: Page, slug: string): Promise<number> {
  await page.goto(`${listUrl}?tab=${slug}`);
  return tungguBarisData(page);
}

/**
 * Label detail/form berpola `<div>Label <span>:</span></div>` dengan newline
 * & indentasi mentah → regex WAJIB memberi ruang \s* di kedua ujung, dan
 * hasilnya disaring visible agar tidak tertukar link menu sidebar (CLAUDE.md).
 */
const label = (page: Page, teks: string) =>
  page
    .getByText(new RegExp(`^\\s*${teks.replace(/[./()&]/g, '\\$&')}\\s*:?\\s*$`))
    .filter({ visible: true })
    .first();

/**
 * Buka panel filter. Label filter dirender dua varian (desktop & mobile) dan
 * varian pertama di DOM justru yang tersembunyi → cek yang benar-benar
 * visible, bukan `.first()`.
 */
const labelFilter = (page: Page, teks: string) =>
  page.locator('label.labelfilter', { hasText: new RegExp(`^${teks}$`) }).filter({ visible: true });

async function bukaFilter(page: Page): Promise<void> {
  const tombol = page.locator('button.button_filter');
  const jumlah = await tombol.count();
  for (let i = 0; i < jumlah; i++) {
    await tombol.nth(i).click({ timeout: 5_000 }).catch(() => {});
    if ((await labelFilter(page, 'Shipper').count()) > 0) return;
  }
}

async function bukaMenu(baris: Locator): Promise<Locator> {
  await baris.locator('button.btn_action_menu').click();
  const menu = baris.locator('.dropdown-menu');
  await expect(menu).toBeVisible();
  return menu;
}

/** Klik item menu yang diblokir aplikasi; kembalikan teks SweetAlert2-nya. */
async function klikMenuDiblokir(page: Page, baris: Locator, item: string): Promise<string> {
  const menu = await bukaMenu(baris);
  await menu.getByText(item, { exact: true }).click();
  const swal = listPage.swal(page);
  await expect(swal).toBeVisible({ timeout: 15_000 });
  const teks = (await swal.locator('.swal2-html-container').innerText()).replace(/\s+/g, ' ').trim();
  const mengerti = swal.getByRole('button', { name: 'Mengerti' });
  await expect(mengerti).toBeVisible();
  await mengerti.click();
  await expect(swal).toBeHidden();
  return teks;
}

/** Klik item menu yang berpindah halaman (ajax cek → redirect). */
async function klikMenuNavigasi(baris: Locator, item: string, urlPola: RegExp): Promise<void> {
  const menu = await bukaMenu(baris);
  await menu.getByText(item, { exact: true }).click();
  await baris.page().waitForURL(urlPola, { timeout: 20_000 });
}

test.describe('Daftar Pengajuan Lelang (Admin)', () => {
  test('halaman default redirect ke tab Semua Lelang; root "/" admin mendarat di halaman ini', async ({ page }) => {
    await page.goto(listUrl);
    await expect(page).toHaveURL(/\?tab=semua-lelang$/);
    await expect(listPage.tab(page, 'Semua Lelang')).toHaveClass(/btn-tabs-active/);
    await page.goto('/');
    await expect(page).toHaveURL(/\/lelang\/listlelang\?tab=semua-lelang$/);
    await expect(page.getByText(/Beranda\s*\/\s*Daftar Pengajuan Lelang/)).toBeVisible();
  });

  test('keenam tab pengelompokan lelang tampil dan klik tab memindahkan tab aktif', async ({ page }) => {
    await page.goto(listUrl);
    for (const { nama, slug } of TABS) {
      await expect(listPage.tab(page, nama)).toHaveAttribute('href', new RegExp(`\\?tab=${slug}$`));
    }
    await listPage.tab(page, 'Lelang Tutup').click();
    await expect(page).toHaveURL(/\?tab=lelang-tutup$/);
    await expect(listPage.tab(page, 'Lelang Tutup')).toHaveClass(/btn-tabs-active/);
    await expect(listPage.tab(page, 'Semua Lelang')).not.toHaveClass(/btn-tabs-active/);
  });

  test('tabel menampilkan kolom sisi admin (ada Shipper) dan keterangan hijau/#', async ({ page }) => {
    await page.goto(listUrl);
    for (const kolom of [
      'No',
      'Shipper',
      'Nomor Lelang',
      'Buka Lelang',
      'Tutup Lelang',
      'Rencana Mulai Kirim',
      'Rencana Akhir Kirim',
      'Aksi',
    ]) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}\\b`) })).toBeVisible();
    }
    // Rule: nomor lelang hijau = lewat akhir kirim, ada harga, belum ada
    // order; "#" = pernah request harga.
    await expect(
      page.getByText('*) Hijau = lelang tidak ada order, # adalah request harga', { exact: true }),
    ).toBeVisible();
  });

  test('panel filter memuat field lelang, shipper, dan pelabuhan', async ({ page }) => {
    await page.goto(listUrl);
    await bukaFilter(page);
    for (const teks of [
      'Nomor Lelang',
      'Buka Lelang',
      'Tutup Lelang',
      'Rencana Mulai Kirim',
      'Rencana Akhir Kirim',
      'Shipper',
      'Pelabuhan Asal',
      'Pelabuhan Tujuan',
    ]) {
      await expect(labelFilter(page, teks).first()).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.locator('select[name="BidOwnerID"]').first()).toBeAttached();
  });

  for (const slug of ['semua-lelang', 'perlu-input-harga', 'perlu-update-harga', 'lelang-tutup', 'telah-akhir-kirim', 'lelang-batal']) {
    test(`menu aksi tab ${slug} memuat lima aksi dasar dengan tujuan link yang benar`, async ({ page }) => {
      const jumlah = await bukaTab(page, slug);
      test.skip(jumlah === 0, `Tidak ada data lelang di tab ${slug} pada demo`);

      const baris = listPage.barisData(page).first();
      const menu = await bukaMenu(baris);
      for (const nama of MENU_DASAR) {
        await expect(menu.getByText(nama, { exact: true })).toBeVisible();
      }
      await expect(menu.getByRole('link', { name: 'Detail Pengajuan Lelang' })).toHaveAttribute(
        'href',
        /\/lelang\/detaillistLelang\/\d+$/,
      );
      await expect(menu.getByRole('link', { name: 'Lihat Harga Penawaran' })).toHaveAttribute(
        'href',
        /\/lelang\/carirute\/\?from=search&id_user=.+&lelang=.+&nomor_lelang=.+/,
      );
      await expect(menu.getByRole('link', { name: 'Tambah Peserta Lelang' })).toHaveAttribute(
        'href',
        /\/lelang\/tambah_pilihpesertaLelang\/\d+$/,
      );
      await expect(menu.getByRole('link', { name: 'Edit Data Lelang' })).toHaveAttribute(
        'href',
        /\/lelang\/edit_data_lelang\/\d+$/,
      );
      // Batalkan Lelang = SPAN ber-atribut link (bukan <a>) — dicek via ajax dulu.
      await expect(menu.locator('span.batalkan_lelang')).toHaveAttribute('link', /\/lelang\/batalkanlelang\/\d+$/);
    });
  }

  test('DISKREPANSI: rule tab Lelang Tutup memuat menu "Minta Update Harga", UI tidak menyediakannya', async ({ page }) => {
    // Request harga di UI dilakukan dari tombol "Request Harga" halaman
    // Cari Penawaran (lihat tests/admin/cari-penawaran.spec.ts), bukan dari
    // action menu daftar lelang.
    test.fail();
    const jumlah = await bukaTab(page, 'lelang-tutup');
    test.skip(jumlah === 0, 'Tidak ada data di tab Lelang Tutup pada demo');
    const menu = await bukaMenu(listPage.barisData(page).first());
    await expect(menu.getByText('Minta Update Harga', { exact: true })).toBeVisible();
  });

  test('History Data Lelang hanya tampil pada lelang yang pernah diubah, menuju halaman riwayat', async ({ page }) => {
    await bukaTab(page, 'semua-lelang');
    const berhistory = listPage.barisData(page).filter({ has: page.locator('a.history_data_lelang') });
    test.skip((await berhistory.count()) === 0, 'Tidak ada lelang yang pernah diedit/ditambah peserta pada halaman pertama');
    // Lelang lain di halaman yang sama TANPA item ini (kondisional sesuai rule).
    const tanpaHistory = listPage.barisData(page).filter({ hasNot: page.locator('a.history_data_lelang') });
    expect(await tanpaHistory.count()).toBeGreaterThan(0);

    const menu = await bukaMenu(berhistory.first());
    const item = menu.getByRole('link', { name: 'History Data Lelang' });
    await expect(item).toHaveAttribute('href', /\/lelang\/historyupdatelelang\/.+/);
    await item.click();
    await expect(page).toHaveURL(/\/lelang\/historyupdatelelang\/.+/);
    await expect(page.getByText('Riwayat Perubahan Data Lelang').first()).toBeVisible();
    for (const label of ['Tanggal Perubahan', 'Edit By', 'Buka Lelang', 'Tutup Lelang', 'Rencana Mulai Kirim', 'Rencana Akhir Kirim']) {
      await expect(page.getByText(new RegExp(`${label}\\s*:`)).first()).toBeVisible();
    }
  });

  test('History Request Harga tampil pada lelang yang pernah request harga (nomor bertanda #n)', async ({ page }) => {
    let ketemu = false;
    for (const slug of ['semua-lelang', 'lelang-batal', 'lelang-tutup']) {
      await bukaTab(page, slug);
      if ((await listPage.barisData(page).filter({ has: page.locator('a.history_update_harga') }).count()) > 0) {
        ketemu = true;
        break;
      }
    }
    test.skip(!ketemu, 'Tidak ada lelang yang pernah request harga pada halaman pertama tab yang diperiksa');

    const baris = listPage.barisData(page).filter({ has: page.locator('a.history_update_harga') }).first();
    // Rule: lelang yang pernah request harga bertanda (#n) di nomor lelang.
    await expect(baris.locator('td').nth(2)).toHaveText(/\(#\d+\)/);
    const menu = await bukaMenu(baris);
    // Rule menamai "History Update Harga"; UI "History Request Harga".
    const item = menu.getByRole('link', { name: 'History Request Harga' });
    await expect(item).toHaveAttribute('href', /\/lelang\/historyupdateharga\/.+/);
    await item.click();
    await expect(page).toHaveURL(/\/lelang\/historyupdateharga\/.+/);
    await expect(page.getByText('Riwayat Request Harga').first()).toBeVisible();
    for (const label of ['Tanggal Request', 'Tanggal Tutup Request Harga', 'Peserta Yang Diundang', 'Close Request', 'Tanggal Close Request']) {
      await expect(page.getByText(new RegExp(`${label}\\s*:`)).first()).toBeVisible();
    }
  });

  test('nomor lelang tanpa order berwarna hijau', async ({ page }) => {
    let hijau: string | null = null;
    for (const slug of ['semua-lelang', 'lelang-batal', 'telah-akhir-kirim']) {
      await bukaTab(page, slug);
      hijau = await page.evaluate(() => {
        const sel = [...document.querySelectorAll('table tbody tr td:nth-child(3)')].find(
          (td) => getComputedStyle(td).color === 'rgb(58, 196, 125)',
        );
        return sel ? sel.textContent!.trim() : null;
      });
      if (hijau) break;
    }
    test.skip(!hijau, 'Tidak ada nomor lelang berwarna hijau pada halaman pertama tab yang diperiksa');
    await expect(page.locator('table tbody tr td:nth-child(3)', { hasText: hijau! }).first()).toHaveCSS(
      'color',
      'rgb(58, 196, 125)',
    );
  });
});

test.describe('Aksi lelang yang diblokir (SweetAlert2, rule menulis "alert")', () => {
  test('lelang batal: Batalkan / Edit Data / Tambah Peserta ditolak dengan pesan "sudah dibatalkan"', async ({ page }) => {
    test.setTimeout(120_000);
    const jumlah = await bukaTab(page, 'lelang-batal');
    test.skip(jumlah === 0, 'Tidak ada lelang batal pada demo');
    const baris = () => listPage.barisData(page).first();

    expect(await klikMenuDiblokir(page, baris(), 'Batalkan Lelang')).toMatch(/Tidak bisa batal!\s*Lelang sudah dibatalkan/);
    expect(await klikMenuDiblokir(page, baris(), 'Edit Data Lelang')).toMatch(/Tidak bisa edit!\s*Lelang sudah dibatalkan/);
    expect(await klikMenuDiblokir(page, baris(), 'Tambah Peserta Lelang')).toMatch(
      /Tidak bisa tambah peserta!\s*Lelang sudah dibatalkan/,
    );
  });

  test('lelang lewat rencana akhir kirim: Tambah Peserta ditolak', async ({ page }) => {
    const jumlah = await bukaTab(page, 'telah-akhir-kirim');
    test.skip(jumlah === 0, 'Tidak ada lelang telah akhir kirim pada demo');
    expect(await klikMenuDiblokir(page, listPage.barisData(page).first(), 'Tambah Peserta Lelang')).toMatch(
      /Tidak bisa tambah peserta!\s*Lelang sudah melewati tgl\. rencana akhir kirim/,
    );
  });

  test('lelang yang sudah ada order tidak bisa dibatalkan', async ({ page }) => {
    // Rule: admin dapat batalkan lelang asalkan belum ada order. Lelang demo
    // LELANGFCU/28082026IK punya order (lihat CLAUDE.md § Open Stack).
    await bukaTab(page, 'lelang-tutup');
    const baris = listPage.barisData(page).filter({ hasText: 'LELANGFCU/28082026IK' });
    test.skip((await baris.count()) === 0, 'Lelang LELANGFCU/28082026IK tidak ada di tab Lelang Tutup');
    expect(await klikMenuDiblokir(page, baris.first(), 'Batalkan Lelang')).toMatch(/Tidak bisa batal!\s*Lelang sudah ada order/);
  });

  test('akses langsung halaman edit/tambah peserta lelang batal ditolak dengan alert tidak memiliki akses', async ({ page }) => {
    const jumlah = await bukaTab(page, 'lelang-batal');
    test.skip(jumlah === 0, 'Tidak ada lelang batal pada demo');
    // Item menu masih tersembunyi (dropdown tertutup) sehingga TIDAK punya
    // role link — ambil lewat CSS href, bukan getByRole.
    const href = await listPage.barisData(page).first().locator('a[href*="/lelang/edit_data_lelang/"]').first().getAttribute('href');
    const id = href!.match(/\/(\d+)$/)![1];

    for (const path of [`/lelang/edit_data_lelang/${id}`, `/lelang/tambah_pilihpesertaLelang/${id}`]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/lelang\/listlelang/);
      await expect(page.locator('.alert_negatif')).toContainText('Anda Tidak Memiliki Akses Ke Halaman Tersebut');
    }
  });
});

test.describe('Detail Pengajuan Lelang (Admin)', () => {
  async function bukaDetailPertama(page: Page, slug: string): Promise<boolean> {
    if ((await bukaTab(page, slug)) === 0) return false;
    const menu = await bukaMenu(listPage.barisData(page).first());
    await menu.getByRole('link', { name: 'Detail Pengajuan Lelang' }).click();
    await expect(page).toHaveURL(/\/lelang\/detaillistLelang\/\d+$/);
    return true;
  }

  test('menampilkan status lelang, ringkasan, dan daftar transporter penerima lelang beserta status harga', async ({ page }) => {
    test.skip(!(await bukaDetailPertama(page, 'semua-lelang')), 'Tidak ada data lelang pada demo');

    await expect(page.getByText(/^(BELUM BUKA|LELANG DIBUKA|LELANG DITUTUP|LELANG BATAL)$/).first()).toBeVisible();
    await expect(page.getByText(/Beranda\s*\/\s*Daftar Pengajuan Lelang\s*\/\s*Detail Pengajuan Lelang/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Beranda' }).first()).toHaveAttribute('href', /\/lelang\/listLelang$/i);
    for (const teks of ['Lelang Dibuat', 'Shipper', 'Status Lelang', 'Dokumen Aanwijzing', 'Budget Pengiriman', 'Dokumen Lelang']) {
      await expect(label(page, teks)).toBeVisible();
    }
    for (const seksi of ['SYARAT & KETENTUAN', 'RUTE PENGIRIMAN', 'INFORMASI KONTAINER']) {
      await expect(page.getByText(seksi, { exact: true }).first()).toBeVisible();
    }
    // Rule: Bidder Penerima Lelang memuat jumlah penawaran = total bidder yang
    // sudah input harga dari total bidder yang diundang.
    await expect(page.getByText('TRANSPORTER PENERIMA LELANG')).toBeVisible();
    await expect(page.getByText(/Penawaran\s*:\s*\d+\s*dari\s*\d+/).first()).toBeVisible();
    await expect(page.getByText('*) Penawaran = Telah input harga dan jadwal').first()).toBeVisible();
    for (const kolom of ['No', 'Transporter', 'Tanggal Terkirim', 'Status Harga']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}\\b`) }).first()).toBeVisible();
    }
    // Rule: 3 status harga — Belum Input Penawaran / Telah Input Harga /
    // Telah Input Penawaran; tanggal terkirim = waktu submit lelang.
    const barisPeserta = page.locator('#tabel_master_bank tbody tr').filter({ hasText: /Input/ });
    expect(await barisPeserta.count()).toBeGreaterThan(0);
    // Sel ber-newline & indentasi mentah → jangkar butuh \s* (CLAUDE.md).
    await expect(barisPeserta.first().locator('td').nth(3)).toHaveText(
      /^\s*(Belum Input Penawaran|Telah Input Harga|Telah Input Penawaran)\s*$/,
    );
    await expect(barisPeserta.first().locator('td').nth(2)).toHaveText(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    await expect(page.getByRole('button', { name: 'Kembali' })).toBeVisible();
  });

  test('detail lelang batal menampilkan card Lelang Batal dengan tanggal dan alasan, tanpa tombol Batalkan', async ({ page }) => {
    test.skip(!(await bukaDetailPertama(page, 'lelang-batal')), 'Tidak ada lelang batal pada demo');
    await expect(page.getByText('LELANG BATAL', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Tanggal Lelang Batal/)).toBeVisible();
    await expect(page.getByText(/Alasan Lelang Dibatalkan/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Batalkan Lelang' })).toHaveCount(0);
  });

  test('detail lelang yang masih bisa dibatalkan menyediakan tombol Batalkan Lelang', async ({ page }) => {
    // Rule: tombol hanya ada bila lelang belum punya order — telusuri beberapa
    // lelang teratas, jangan asumsikan baris pertama.
    test.setTimeout(120_000);
    const jumlah = await bukaTab(page, 'perlu-input-harga');
    test.skip(jumlah === 0, 'Tidak ada lelang di tab Perlu Input Harga pada demo');

    const tombol = page.getByRole('button', { name: 'Batalkan Lelang' });
    let ketemu = false;
    for (let i = 0; i < Math.min(jumlah, 5); i++) {
      const menu = await bukaMenu(listPage.barisData(page).nth(i));
      await menu.getByRole('link', { name: 'Detail Pengajuan Lelang' }).click();
      await expect(page).toHaveURL(/\/lelang\/detaillistLelang\/\d+$/);
      if (await tombol.isVisible().catch(() => false)) {
        ketemu = true;
        break;
      }
      await bukaTab(page, 'perlu-input-harga');
    }
    test.skip(!ketemu, 'Lima lelang teratas tab Perlu Input Harga semuanya sudah ada order');
    await expect(tombol).toBeVisible();
  });
});

test.describe('Halaman aksi lelang (dibuka tanpa submit)', () => {
  test('Edit Data Lelang: seksi terkunci sampai checkbox edit dicentang, field sesuai rule, tombol Simpan', async ({ page }) => {
    const jumlah = await bukaTab(page, 'perlu-input-harga');
    test.skip(jumlah === 0, 'Tidak ada lelang di tab Perlu Input Harga pada demo');
    await klikMenuNavigasi(listPage.barisData(page).first(), 'Edit Data Lelang', /\/lelang\/edit_data_lelang\/\d+$/);

    await expect(page.getByText(/Beranda\s*\/\s*Daftar Pengajuan Lelang\s*\/\s*Edit Data Lelang/)).toBeVisible();
    for (const id of ['edit_data', 'edit_rute', 'edit_kontainer']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`)).not.toBeChecked();
    }
    // Rule: data yang bisa diedit admin — nomor lelang, tanggal-tanggal, kota &
    // alamat asal/tujuan, PIC, volume, deskripsi. Semua terkunci (disabled)
    // sebelum seksi dibuka.
    for (const id of [
      'nomor_lelang',
      'tanggal_buka_lelang',
      'tanggal_tutup_lelang',
      'tanggal_mulai_kontrak',
      'tanggal_selesai_kontrak',
      'alamat_pic_asal',
      'id_kota_asal',
      'nama_pic_asal',
      'telp_pic_asal',
      'alamat_pic_tujuan',
      'id_kota_tujuan',
      'nama_pic_tujuan',
      'telp_pic_tujuan',
      'volume_pengiriman',
      'deskripsi_barang',
    ]) {
      await expect(page.locator(`#${id}`)).toBeDisabled();
    }
    for (const label of [
      'Nomor Lelang *',
      'Tanggal Buka Lelang *',
      'Tanggal Tutup Lelang *',
      'Tgl Rencana Mulai Kirim *',
      'Tgl Rencana Akhir Kirim *',
      'Kota Asal *',
      'Informasi Alamat Lengkap Asal *',
      'PIC Tempat Asal',
      'Telp. PIC Tempat Asal',
      'Kota Tujuan *',
      'Informasi Alamat Lengkap Tujuan *',
      'PIC Tempat Tujuan',
      'Telp. PIC Tempat Tujuan',
      'Volume Pengiriman',
      'Deskripsi Barang',
    ]) {
      await expect(page.locator('label', { hasText: label }).filter({ visible: true }).first()).toBeVisible();
    }
    // "Dokumen Aanwijzing" juga nama link menu sidebar (hidden) → saring visible.
    await expect(page.getByText('Dokumen Aanwijzing').filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator('#submitonce1')).toHaveText(/Simpan/);
    await expect(page.getByRole('button', { name: 'Batal' })).toBeVisible();
  });

  test('Tambah Peserta Lelang: bidder terundang terkunci tercentang, Simpan disable sampai ada bidder baru', async ({ page }) => {
    const jumlah = await bukaTab(page, 'perlu-input-harga');
    test.skip(jumlah === 0, 'Tidak ada lelang di tab Perlu Input Harga pada demo');
    await klikMenuNavigasi(listPage.barisData(page).first(), 'Tambah Peserta Lelang', /\/lelang\/tambah_pilihpesertaLelang\/\d+$/);

    await expect(page.getByText(/Beranda\s*\/\s*Daftar Pengajuan Lelang\s*\/\s*Tambah Peserta Lelang/)).toBeVisible();
    await expect(page.getByText('PESERTA LELANG', { exact: true })).toBeVisible();
    await expect(page.locator('#search_bidder')).toHaveAttribute('placeholder', 'Masukkan Nama Peserta Lelang');
    for (const kolom of ['Transporter', 'Lokasi', 'Rating', 'Pilih Semua']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(`^${kolom}\\b`) }).first()).toBeVisible();
    }
    // Rule: bidder yang sudah diundang tampil tercentang & tidak bisa dihapus
    // (disabled), tombol simpan tidak bisa diklik bila tak ada bidder baru.
    const terkunci = page.locator('table.table_bidder input[type=checkbox]:disabled');
    expect(await terkunci.count()).toBeGreaterThan(0);
    for (const cb of await terkunci.all()) await expect(cb).toBeChecked();
    const simpan = page.locator('#tombol_lanjutkan');
    await expect(simpan).toHaveText(/Simpan/);
    await expect(simpan).toBeDisabled();

    // Centang satu bidder baru (hanya di klien, TIDAK disimpan) → Simpan aktif.
    // Locator WAJIB stabil: `:not(:checked)` berhenti cocok begitu dicentang
    // sehingga uncheck() menggantung (terbukti timeout 2026-08-30) — pakai
    // indeks dari daftar checkbox yang bisa diubah.
    // Scope ke tbody agar checkbox "Pilih Semua" di header tidak ikut.
    const bisaDiubah = page.locator('table.table_bidder tbody input[type=checkbox]:not(:disabled)');
    const status = await bisaDiubah.evaluateAll((els) => els.map((e) => (e as HTMLInputElement).checked));
    const idx = status.findIndex((checked) => !checked);
    test.skip(idx === -1, 'Semua bidder sudah diundang pada lelang ini');

    const bidderBaru = bisaDiubah.nth(idx);
    await bidderBaru.check();
    await expect(simpan).toBeEnabled();
    await bidderBaru.uncheck();
    await expect(simpan).toBeDisabled();
  });

  test('Batalkan Lelang: form alasan (wajib) dengan opsi Lainnya + catatan, peringatan notifikasi peserta', async ({ page }) => {
    const jumlah = await bukaTab(page, 'perlu-input-harga');
    test.skip(jumlah === 0, 'Tidak ada lelang di tab Perlu Input Harga pada demo');
    const link = await listPage.barisData(page).first().locator('span.batalkan_lelang').getAttribute('link');
    await page.goto(link!);
    test.skip(!/\/lelang\/batalkanlelang\/\d+$/.test(page.url()), 'Lelang pertama tidak bisa dibatalkan (dialihkan ke daftar)');

    await expect(page.getByText(/Beranda\s*\/\s*Daftar Pengajuan Lelang\s*\/\s*Batalkan Lelang/)).toBeVisible();
    await expect(page.getByText('Ajukan Lelang Batal')).toBeVisible();
    await expect(page.locator('label', { hasText: 'Alasan Lelang Dibatalkan *' })).toBeVisible();
    const opsi = await page.locator('#alasan_batal option').allTextContents();
    expect(opsi.map((o) => o.trim())).toEqual([
      'Pilih Alasan Lelang Dibatalkan',
      'Harga Kemahalan',
      'Jadwal Tidak Cocok',
      'Salah Input Informasi',
      'Lelang Double Input',
      'Lainnya',
    ]);
    await expect(page.locator('#catatan_batal_lelang')).toHaveAttribute('placeholder', 'Masukkan Catatan Lelang Dibatalkan');
    await expect(page.getByText('Lelang batal akan mengirim notif ke peserta lelang')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Batal', exact: true })).toBeVisible();
    // Ringkasan lelang + daftar peserta ikut ditampilkan di halaman ini.
    await expect(page.getByText('TRANSPORTER PENERIMA LELANG')).toBeVisible();
  });
});
