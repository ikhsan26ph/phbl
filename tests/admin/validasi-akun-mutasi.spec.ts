import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Validasi Akun (Administrator) — alur MUTASI dengan cleanup.
 * Project "admin". Rule: docs/rules/administrator/11-validasi-akun.md.
 * Izin mutasi demo dari user (2026-08-29). Varian read-only ada di
 * tests/admin/validasi-akun.spec.ts.
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login admin):
 * - Halaman listBidderKhusus dengan valuelimit=100 SANGAT lambat (>6 mnt,
 *   run 2026-08-30) → pakai 20 baris default.
 * - Pre Register: Hapus (button value=<hash>) → SweetAlert2 "Apakah anda yakin
 *   ingin menghapus data pre register?" [Batal/Ya]. Data pre register dibuat
 *   test sendiri lewat form publik /user/register (konteks browser baru tanpa
 *   login; lihat tests/anon/registrasi.spec.ts) — akun baru TIDAK diaktifkan.
 * - Validasi Transporter: baris akun demo transporter (partner.ph2021) →
 *   tombol "Lakukan Validasi" (button.validasi12 idnya=<hash>) →
 *   /home/validasibidder/<hash>: email ENABLED (rule: admin bisa edit email +
 *   popup konfirmasi), input alias, seksi rekening = baris select
 *   masterbank_dataID[], #nomor_rekening (nomor_rekening[]), #atas_nama
 *   (atas_nama[]), switch checkbox name=on_off[] (class switch_buat_invoice,
 *   input tersembunyi → klik pembungkus .switch), span "Tambah Baris Input"
 *   (.link_2), Simpan #simpan. Baris "Verifikasi Perubahan Data"
 *   (button.tooltip-verifikasi) tampil pada akun demo (ada perubahan
 *   menunggu) — tidak disentuh.
 * - Transporter Khusus: Tambah /adminprahu/tambahbidderkhusus (select
 *   name=nama "Pilih Transporter Khusus" → input alias otomatis & disabled,
 *   Simpan #tombolSimpanProvinsi); Setting /adminprahu/settingBidderKhusus?
 *   id=<id> → "Tambah Shipper" → /adminprahu/tambahbidownertobidderkhusus?
 *   BidderID=<id> (select name=nama "Pilih Shipper" — form merender DUA select
 *   name=nama, ambil yang visible; Simpan #tombolSimpanProvinsi; shipper
 *   duplikat → alert "Shipper Telah Ditambahkan", rule menulis "Input data
 *   ada yang sama"; Batal = <a> dgn confirm "Apakah Anda yakin ingin
 *   membatalkan ?"); list: Hapus Transporter (swal → navigasi server).
 * - Relasi Satu Pintu: Setting Relasi /adminprahu/SettingRelasi/<hash> →
 *   Tambah Relasi → /adminprahu/TambahRelasi/<hash>: select name=bidder,
 *   input name=va (angka), select name=bank (master bank aktif), input
 *   name=nama (atas nama), select name=status, Simpan #tombol_simpan_bank_pc.
 *
 * Verifikasi state pasca-alert: perubahan yang ditolak alert TIDAK boleh
 * tersimpan (dicek via reload). TIDAK dicakup: terima/tolak akun (mengubah
 * akun demo permanen), rekening maks 3 (butuh menambah baris rekening
 * sungguhan), verifikasi perubahan data, upload aanwijzing, hidden ulasan.
 */

const tsPendek = () => Date.now().toString(36).toUpperCase().slice(-6);

const listPage = {
  barisData: (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('td:nth-child(3)') }),
  baris: (page: Page, teks: string) => page.locator('table tbody tr').filter({ hasText: teks }),
  tombolAksi: (baris: Locator, judul: string) =>
    baris.locator(`[title="${judul}"], [data-original-title="${judul}"], [title*="${judul}"], [data-original-title*="${judul}"]`).first(),
  alertSukses: (page: Page, teks: RegExp) => page.getByRole('alert').filter({ hasText: teks }),
  swal: (page: Page) => page.locator('.swal2-container'),
};

/** Alert diterima, confirm DITOLAK (agar tidak ada penyimpanan tak sengaja). */
function pasangDialog(page: Page, terimaConfirm = false): string[] {
  const pesan: string[] = [];
  page.on('dialog', async (d) => {
    pesan.push(d.message());
    if (d.type() === 'confirm' && !terimaConfirm) await d.dismiss();
    else await d.accept();
  });
  return pesan;
}

async function bukaList(page: Page, url: string, limit100 = false): Promise<void> {
  await page.goto(url);
  await listPage.barisData(page).first().waitFor({ timeout: 30_000 }).catch(() => {});
  if (limit100) {
    await page.locator('#valuelimit').first().selectOption('100').catch(() => {});
    await page.waitForTimeout(2500);
  }
}

async function nilaiOpsi(select: Locator, pola: RegExp): Promise<string> {
  const opsi = select.locator('option').filter({ hasText: pola }).first();
  await expect(opsi).toBeAttached();
  return (await opsi.getAttribute('value'))!;
}

/** Klik tombol swal konfirmasi (Ya/Hapus/OK) bila swal tampil. */
async function konfirmasiSwal(page: Page): Promise<void> {
  const swal = listPage.swal(page);
  await swal.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
  if (await swal.isVisible().catch(() => false)) {
    await swal.getByRole('button', { name: /^(Ya|Hapus|OK)$/ }).first().click();
  }
}

test.describe('Pre Register (Admin, mutasi)', () => {
  test.slow();

  test('akun yang baru registrasi (belum aktivasi) tampil di Pre Register, detailnya sesuai, lalu dihapus admin', async ({
    page,
    browser,
  }) => {
    test.setTimeout(300_000);
    pasangDialog(page, true);
    const ts = tsPendek();
    const email = `autotest-prereg-${ts.toLowerCase()}@yopmail.com`;
    const nama = `AUTOTEST Prereg ${ts}`;

    // Registrasi awal lewat form publik pada konteks TANPA login admin.
    const ctx = await browser.newContext();
    const anon = await ctx.newPage();
    try {
      await anon.goto('/user/register');
      await anon.getByRole('radio', { name: 'Shipper' }).check();
      await anon.getByRole('textbox', { name: 'Masukkan Nama Lengkap Anda' }).fill(nama);
      await anon.getByRole('textbox', { name: '08xxxxxxxxxx' }).fill(`0897${String(Date.now()).slice(-8)}`);
      await anon.getByRole('textbox', { name: 'Masukkan Nama Perusahaan Anda' }).fill(`PT ${nama}`);
      await anon.getByRole('textbox', { name: 'Masukkan Email Anda' }).fill(email);
      await anon.getByRole('textbox', { name: 'Masukkan Kata Sandi Anda' }).fill('AutoTest123');
      await anon.getByRole('textbox', { name: 'Masukkan Ulang Kata Sandi Anda' }).fill('AutoTest123');
      await anon.getByRole('button', { name: 'Registrasi' }).click();
      await expect(anon.getByRole('heading', { name: 'KONFIRMASI EMAIL' })).toBeVisible({ timeout: 30_000 });
    } finally {
      await ctx.close();
    }

    let adaDiPreRegister = false;
    try {
      await bukaList(page, '/adminprahu/preregister');
      const baris = listPage.baris(page, email).first();
      await expect(baris).toBeVisible({ timeout: 20_000 });
      adaDiPreRegister = true;
      await expect(baris).toContainText(nama);
      await expect(baris).toContainText('Shipper');

      const detail = await baris.locator('a[href*="detailpreregister/"]').first().getAttribute('href');
      await page.goto(detail!);
      await expect(page.getByText(email).filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText(`PT ${nama}`).filter({ visible: true }).first()).toBeVisible();

      await bukaList(page, '/adminprahu/preregister');
      await listPage.tombolAksi(listPage.baris(page, email).first(), 'Hapus Pre Register').click();
      await expect(listPage.swal(page)).toContainText('Apakah anda yakin ingin menghapus data pre register');
      await listPage.swal(page).getByRole('button', { name: 'Ya' }).click();
      await expect(listPage.alertSukses(page, /berhasil/i)).toBeVisible({ timeout: 30_000 });
      await page.reload();
      await expect(listPage.baris(page, email)).toHaveCount(0, { timeout: 20_000 });
      adaDiPreRegister = false;
    } finally {
      if (adaDiPreRegister) {
        await bukaList(page, '/adminprahu/preregister');
        const baris = listPage.baris(page, email).first();
        if (await baris.isVisible().catch(() => false)) {
          await listPage.tombolAksi(baris, 'Hapus Pre Register').click();
          await konfirmasiSwal(page);
        }
      }
    }
  });
});

test.describe('Validasi Transporter (Admin) — aturan rekening & email', () => {
  test.slow();

  /** Buka halaman validasi akun demo transporter lewat tombol baris (bukan goto). */
  async function bukaValidasiTransporterDemo(page: Page): Promise<void> {
    await bukaList(page, '/home/bidder', true);
    const baris = listPage.baris(page, process.env.TRANSPORTER_EMAIL!).first();
    await expect(baris).toBeVisible({ timeout: 20_000 });
    await listPage.tombolAksi(baris, 'Lakukan Validasi').click();
    await expect(page).toHaveURL(/\/home\/validasibidder\/.+/, { timeout: 30_000 });
    await expect(page.locator('#simpan')).toBeVisible();
  }

  const switchRekening = (page: Page) => page.locator('input[name="on_off[]"]');

  test('menonaktifkan seluruh rekening ditolak: alert "Rekening aktif minimal satu!" dan data tidak berubah', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const pesan = pasangDialog(page);
    await bukaValidasiTransporterDemo(page);
    const total = await switchRekening(page).count();
    test.skip(total === 0, 'Akun demo transporter tanpa baris rekening');
    const aktifSemula = await switchRekening(page).evaluateAll((els) => els.filter((e) => (e as HTMLInputElement).checked).length);
    test.skip(aktifSemula === 0, 'Tidak ada rekening aktif pada akun demo transporter');

    // Switch input tersembunyi → klik pembungkus .switch (pola sama dgn Setting Notifikasi).
    for (let i = 0; i < total; i++) {
      const sw = switchRekening(page).nth(i);
      if (await sw.isChecked()) await sw.locator('xpath=..').click();
      await expect(sw).not.toBeChecked();
    }
    await page.locator('#simpan').click();
    // Validasi berupa SweetAlert2 "Rekening aktif minimal satu!" [Mengerti]
    // (kalibrasi 2026-08-30; rule menulis "alert") — fallback alert native.
    const swal = listPage.swal(page);
    await Promise.race([
      swal.waitFor({ state: 'visible', timeout: 15_000 }),
      expect.poll(() => pesan.length, { timeout: 15_000 }).toBeGreaterThan(0),
    ]).catch(() => {});
    if (await swal.isVisible().catch(() => false)) {
      await expect(swal).toContainText(/Rekening aktif minimal satu/i);
      await swal.getByRole('button', { name: /Mengerti|OK/ }).first().click();
    } else {
      expect(pesan[pesan.length - 1]).toMatch(/Rekening aktif minimal satu/i);
    }
    await expect(page).toHaveURL(/\/home\/validasibidder\/.+/);

    // Verifikasi sungguhan: reload → jumlah rekening aktif tetap seperti semula.
    await page.reload();
    await expect(page.locator('#simpan')).toBeVisible();
    await expect
      .poll(() => switchRekening(page).evaluateAll((els) => els.filter((e) => (e as HTMLInputElement).checked).length))
      .toBe(aktifSemula);
  });

  test('mengubah email transporter meminta konfirmasi "Apakah anda yakin mengubah email user?" dan batal tidak mengubah data', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const pesan = pasangDialog(page);
    await bukaValidasiTransporterDemo(page);
    const email = page.locator('input[name="email"], #email').first();
    await expect(email).toBeEnabled();
    const semula = await email.inputValue();
    expect(semula).toBe(process.env.TRANSPORTER_EMAIL);

    await email.fill('autotest-ganti-email@yopmail.com');
    await page.locator('#simpan').click();
    // Konfirmasi bisa berupa SweetAlert2 (klik Batal) atau confirm native
    // (ditolak otomatis oleh handler dialog).
    const swal = listPage.swal(page);
    await Promise.race([
      swal.waitFor({ state: 'visible', timeout: 15_000 }),
      expect.poll(() => pesan.length, { timeout: 15_000 }).toBeGreaterThan(0),
    ]).catch(() => {});
    if (await swal.isVisible().catch(() => false)) {
      await expect(swal).toContainText(/Apakah anda yakin mengubah email user/i);
      await swal.getByRole('button', { name: /Batal|Tidak|Cancel/i }).first().click();
    } else {
      expect(pesan.join(' | ')).toMatch(/Apakah anda yakin mengubah email user/i);
    }

    await page.goto('/home/bidder');
    await bukaValidasiTransporterDemo(page);
    await expect(email).toHaveValue(semula);
  });
});

test.describe('Transporter Khusus (Admin, mutasi)', () => {
  test.slow();

  async function hapusTransporterKhusus(page: Page, namaTransporter: string): Promise<void> {
    await bukaList(page, '/adminprahu/listBidderKhusus');
    const baris = listPage.baris(page, namaTransporter).first();
    if (!(await baris.isVisible().catch(() => false))) return;
    await listPage.tombolAksi(baris, 'Hapus Transporter').click();
    await konfirmasiSwal(page);
    // Hapus memicu navigasi server; goto saat navigasi berjalan → ERR_ABORTED
    // (run 2026-08-30) → tunggu halaman list selesai dimuat dulu.
    await page.waitForURL(/listBidderKhusus/i, { timeout: 30_000 }).catch(() => {});
    await page.waitForLoadState('load').catch(() => {});
    await page.waitForTimeout(2000);
    await bukaList(page, '/adminprahu/listBidderKhusus');
    await expect(listPage.baris(page, namaTransporter)).toHaveCount(0, { timeout: 20_000 });
  }

  test('tambah transporter khusus (alias otomatis) → setting: tambah shipper, shipper sama ditolak → hapus transporter khusus', async ({
    page,
  }) => {
    test.setTimeout(360_000);
    const pesan = pasangDialog(page, true);
    await bukaList(page, '/adminprahu/listBidderKhusus');
    const sudahAda = (await listPage.barisData(page).locator('td:nth-child(4)').allInnerTexts()).map((t) => t.trim());

    await page.goto('/adminprahu/tambahbidderkhusus');
    // Form merender dua select name=nama (duplikat layout) → ambil yang visible.
    const select = page.locator('select[name="nama"]').filter({ visible: true }).first();
    const kandidat = await select.locator('option').evaluateAll((opts, ada) =>
      opts.map((o) => ({ v: (o as HTMLOptionElement).value, t: o.textContent!.trim() })).filter((o) => o.v && !/^Pilih/.test(o.t) && !ada.some((a) => a.startsWith(o.t.slice(0, 20)))), sudahAda);
    test.skip(kandidat.length === 0, 'Semua transporter sudah terdaftar sebagai transporter khusus');
    const transporter = kandidat.find((k) => /Bidder Coba/.test(k.t)) ?? kandidat[kandidat.length - 1];

    let dibuat = false;
    try {
      await select.selectOption(transporter.v);
      // Rule: alias terisi otomatis (field alias terkunci).
      const alias = page.locator('input[name="alias"]').filter({ visible: true }).first();
      await expect(alias).toBeDisabled();
      await expect(alias).not.toHaveValue('', { timeout: 10_000 });
      await page.locator('#tombolSimpanProvinsi').click();
      dibuat = true;
      await expect(page).toHaveURL(/listBidderKhusus/i, { timeout: 30_000 });
      await bukaList(page, '/adminprahu/listBidderKhusus');
      const baris = listPage.baris(page, transporter.t.slice(0, 20)).first();
      await expect(baris).toBeVisible({ timeout: 20_000 });

      // Setting → Tambah Shipper.
      await listPage.tombolAksi(baris, 'Setting Transporter').click();
      await expect(page).toHaveURL(/settingBidderKhusus/i, { timeout: 30_000 });
      await page.getByRole('button', { name: 'Tambah Shipper' }).or(page.getByRole('link', { name: 'Tambah Shipper' })).first().click();
      await expect(page).toHaveURL(/tambahbidownertobidderkhusus/i, { timeout: 30_000 });
      const selShipper = page.locator('select[name="nama"]').filter({ visible: true }).first();
      const shipperV = await nilaiOpsi(selShipper, /Cipta Karya/);
      const shipperT = (await selShipper.locator(`option[value="${shipperV}"]`).textContent())!.trim();
      await selShipper.selectOption(shipperV);
      await page.locator('#tombolSimpanProvinsi').click();
      await expect(page).toHaveURL(/settingBidderKhusus/i, { timeout: 30_000 });
      await expect(listPage.baris(page, shipperT.slice(0, 20)).first()).toBeVisible({ timeout: 20_000 });

      // Shipper yang sama → alert "Input data ada yang sama".
      await page.getByRole('button', { name: 'Tambah Shipper' }).or(page.getByRole('link', { name: 'Tambah Shipper' })).first().click();
      await expect(page).toHaveURL(/tambahbidownertobidderkhusus/i, { timeout: 30_000 });
      await page.locator('select[name="nama"]').filter({ visible: true }).first().selectOption(shipperV);
      const sebelum = pesan.length;
      await page.locator('#tombolSimpanProvinsi').click();
      await expect.poll(() => pesan.length, { timeout: 15_000 }).toBeGreaterThan(sebelum);
      // UI: "Shipper Telah Ditambahkan" (rule: "Input data ada yang sama") — diskrepansi teks.
      expect(pesan[pesan.length - 1]).toMatch(/Input data ada yang sama|Shipper Telah Ditambahkan/i);

      await hapusTransporterKhusus(page, transporter.t.slice(0, 20));
      dibuat = false;
    } finally {
      if (dibuat) await hapusTransporterKhusus(page, transporter.t.slice(0, 20));
    }
  });

  test('tombol Batal pada tambah shipper meminta konfirmasi "Apakah Anda yakin ingin membatalkan ?"', async ({ page }) => {
    const pesan = pasangDialog(page);
    await bukaList(page, '/adminprahu/listBidderKhusus');
    const setting = await page.locator('a[href*="settingBidderKhusus"]').first().getAttribute('href').catch(() => null);
    test.skip(!setting, 'Tidak ada transporter khusus pada demo');
    await page.goto(setting!);
    await page.getByRole('button', { name: 'Tambah Shipper' }).or(page.getByRole('link', { name: 'Tambah Shipper' })).first().click();
    await expect(page).toHaveURL(/tambahbidownertobidderkhusus/i, { timeout: 30_000 });
    // Batal = <a href=settingBidderKhusus onclick="return confirm(...)"> — confirm
    // ditolak handler dialog sehingga tetap di halaman tambah.
    await page.locator('a, button').filter({ hasText: /^\s*Batal\s*$/ }).first().click();
    await expect.poll(() => pesan.length, { timeout: 10_000 }).toBeGreaterThan(0);
    expect(pesan[0]).toMatch(/Apakah Anda yakin ingin membatalkan/i);
  });
});

test.describe('Relasi Satu Pintu (Admin, mutasi)', () => {
  test.slow();

  test('tambah relasi transporter (VA angka) → tampil, relasi sama ditolak "Data Relasi Sudah Ada", lalu dihapus', async ({
    page,
  }) => {
    test.setTimeout(360_000);
    const pesan = pasangDialog(page, true);
    await bukaList(page, '/home/relasi_satu_pintu');
    const daftarSetting = await page.locator('a[href*="SettingRelasi"]').evaluateAll((els) => els.map((a) => a.getAttribute('href')!));
    test.skip(daftarSetting.length === 0, 'Tidak ada shipper satu pintu pada demo');

    // Cari shipper satu pintu yang Tambah Relasi-nya aktif dan masih punya
    // transporter yang belum jadi relasi (shipper pertama bisa sudah penuh).
    const tambah = page.getByRole('button', { name: 'Tambah Relasi' }).or(page.getByRole('link', { name: 'Tambah Relasi' })).first();
    // Form relasi merender field dobel (layout) → selalu ambil yang visible.
    const vis = (sel: string) => page.locator(sel).filter({ visible: true }).first();
    const selBidder = vis('select[name="bidder"]');
    let setting: string | null = null;
    let kandidat: Array<{ v: string; t: string }> = [];
    for (const href of daftarSetting.slice(0, 6)) {
      await page.goto(href);
      await expect(tambah).toBeVisible({ timeout: 20_000 });
      if (await tambah.isDisabled().catch(() => false)) continue;
      const relasiAda = await page.locator('table tbody tr td:nth-child(3)').allInnerTexts();
      await tambah.click();
      await expect(page).toHaveURL(/TambahRelasi/i, { timeout: 30_000 });
      // Opsi transporter dimuat setelah halaman tampil — evaluateAll terlalu
      // dini mengembalikan 0 opsi → skip palsu (run gabungan 2026-08-30).
      await expect
        .poll(() => selBidder.locator('option').count(), { timeout: 20_000 })
        .toBeGreaterThan(1);
      kandidat = await selBidder.locator('option').evaluateAll((opts, ada) =>
        opts.map((o) => ({ v: (o as HTMLOptionElement).value, t: o.textContent!.trim() })).filter((o) => o.v && !/^Pilih/.test(o.t) && !ada.some((a) => a.trim().startsWith(o.t.slice(0, 20)))), relasiAda);
      if (kandidat.length > 0) {
        setting = href;
        break;
      }
    }
    test.skip(!setting, 'Tidak ada shipper satu pintu dengan transporter yang belum menjadi relasi');
    const bidder = kandidat.find((k) => /Bidder Coba/.test(k.t)) ?? kandidat[kandidat.length - 1];
    const atasNama = `AUTOTEST Relasi ${tsPendek()}`;

    async function isiRelasi(): Promise<void> {
      await selBidder.selectOption(bidder.v);
      const va = vis('input[name="va"]');
      // Rule: nomor VA hanya angka — penyaringan bekerja per keystroke
      // (fill() programatik lolos begitu saja, terbukti run 2026-08-30).
      await va.click();
      await va.pressSequentially('ab12cd34', { delay: 20 });
      await expect(va).toHaveValue('1234');
      await va.fill('');
      await va.pressSequentially(`88${String(Date.now()).slice(-8)}`, { delay: 10 });
      await vis('select[name="bank"]').selectOption({ index: 1 });
      await vis('input[name="nama"]').fill(atasNama);
      await vis('select[name="status"]').selectOption({ label: 'Aktif' });
    }

    let dibuat = false;
    try {
      await isiRelasi();
      await page.locator('#tombol_simpan_bank_pc').click();
      dibuat = true;
      await expect(page).toHaveURL(/SettingRelasi/i, { timeout: 30_000 });
      const baris = listPage.baris(page, atasNama).first();
      await expect(baris).toBeVisible({ timeout: 20_000 });
      await expect(baris).toContainText(bidder.t.slice(0, 20));

      await tambah.click();
      await expect(page).toHaveURL(/TambahRelasi/i, { timeout: 30_000 });
      await isiRelasi();
      const sebelum = pesan.length;
      await page.locator('#tombol_simpan_bank_pc').click();
      await expect.poll(() => pesan.length, { timeout: 15_000 }).toBeGreaterThan(sebelum);
      expect(pesan[pesan.length - 1]).toMatch(/Data Relasi Sudah Ada/i);

      await page.goto(setting!);
      const barisHapus = listPage.baris(page, atasNama).first();
      await expect(barisHapus).toBeVisible({ timeout: 20_000 });
      await listPage.tombolAksi(barisHapus, 'Hapus').click();
      await konfirmasiSwal(page);
      await page.waitForLoadState('load').catch(() => {});
      await page.waitForTimeout(2000);
      await page.goto(setting!);
      await expect(listPage.baris(page, atasNama)).toHaveCount(0, { timeout: 20_000 });
      dibuat = false;
    } finally {
      if (dibuat) {
        await page.goto(setting!);
        const sisa = listPage.baris(page, atasNama).first();
        if (await sisa.isVisible().catch(() => false)) {
          await listPage.tombolAksi(sisa, 'Hapus').click();
          await konfirmasiSwal(page);
        }
      }
    }
  });
});
