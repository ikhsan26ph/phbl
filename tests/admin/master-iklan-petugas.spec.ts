import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Master (Administrator) — Iklan Berbayar & Petugas APK, MUTASI
 * dengan cleanup. Project "admin". Rule: docs/rules/administrator/13-master.md
 * § Iklan Berbayar & Petugas APK. Izin mutasi demo dari user (2026-08-29).
 *
 * Kalibrasi ke halaman asli 2026-08-30 via playwright-cli (login admin):
 * - Iklan Berbayar /adminprahu/masteriklan: No | Nama Transporter | Tanggal
 *   Mulai | Tanggal Berakhir | Aksi (Edit → MODAL #modal "EDIT IKLAN BERBAYAR"
 *   [#BidderIDEdit, #tgl_mulaiEdit, #tgl_berakhirEdit, Simpan
 *   #btn_update_kelas]; Hapus = button value=<id>). Tambah → halaman
 *   /adminprahu/tambahiklan: select name=BidderID ("Pilih Transporter"),
 *   #tgl_mulai_1 & #tgl_akhir_1 (placeholder DD/MM/YYYY hh:mm; nilai awal
 *   KOSONG saat load — rule: default tanggal & jam saat ini), Simpan
 *   #tombol_simpan_bank (id copy-paste).
 * - Petugas APK /adminprahu/masterpetugasapk: No | Nama Transporter | Nama
 *   Petugas | No. Whatsapp | Kota | Status | Aksi (Detail → /adminprahu/
 *   detailpetugasapk/<hash>, Edit → /adminprahu/editpetugasapk/<hash>,
 *   Hapus = button value=<id>). Tambah → /adminprahu/tambahpetugasapk:
 *   #BidderID, #nama, #no_wa, #KotaID (515 opsi), #status, #alamat, Simpan
 *   #tombol_simpan_petugas. Fixture demo "AUTOTEST-FIXTURE-PETUGAS-01"
 *   (WA 089900000001, PT. Muda Jaya) — dipakai untuk uji WA duplikat,
 *   JANGAN dihapus. Alert WA duplikat di UI berbunyi "No. Whatsapp Sudah
 *   Terdaftar" (rule: "Nomor Whatsapp Sudah Terdaftar") — diskrepansi teks minor.
 *
 * TIDAK dicakup: efek iklan di rekomendasi bidder/pilih peserta lelang
 * (lintas peran), gating petugas yang sudah ditugaskan (butuh penugasan
 * aktif), efek edit bidder petugas ke APK.
 */

const tsPendek = () => Date.now().toString(36).toUpperCase().slice(-6);

function tglJam(offsetHari: number, jam: string): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetHari);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${jam}`;
}

const listPage = {
  barisData: (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('td:nth-child(3)') }),
  baris: (page: Page, teks: string) => page.locator('table tbody tr').filter({ hasText: teks }),
  tombolAksi: (baris: Locator, judul: string) =>
    baris.locator(`[title="${judul}"], [data-original-title="${judul}"]`).first(),
  alertSukses: (page: Page, teks: RegExp) => page.getByRole('alert').filter({ hasText: teks }),
  swal: (page: Page) => page.locator('.swal2-container'),
};

function pasangDialog(page: Page): string[] {
  const pesan: string[] = [];
  page.on('dialog', async (d) => {
    pesan.push(d.message());
    await d.accept();
  });
  return pesan;
}

async function bukaList(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await listPage.barisData(page).first().waitFor({ timeout: 20_000 }).catch(() => {});
}

/** Input tanggal (picker): ketik per karakter + Enter, verifikasi nilai. */
async function ketikTanggal(page: Page, input: Locator, nilai: string): Promise<void> {
  await input.click();
  await page.keyboard.press('Control+A');
  await input.pressSequentially(nilai, { delay: 15 });
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue(nilai);
  await page.mouse.click(5, 5);
}

/** Klik Hapus pada baris; tangani SweetAlert2 "Hapus?" bila muncul (confirm native ditangani handler dialog). */
async function hapusBaris(page: Page, baris: Locator, judul: string): Promise<void> {
  await listPage.tombolAksi(baris, judul).click();
  const swal = listPage.swal(page);
  await swal.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
  if (await swal.isVisible().catch(() => false)) {
    await swal.getByRole('button', { name: /^(Hapus|Ya|OK)$/ }).first().click();
  }
  await expect(listPage.alertSukses(page, /berhasil/i)).toBeVisible({ timeout: 30_000 });
}

/** value opsi <select> pertama yang teksnya cocok pola (di luar placeholder). */
async function nilaiOpsi(select: Locator, pola: RegExp): Promise<string> {
  const opsi = select.locator('option').filter({ hasText: pola }).first();
  await expect(opsi).toBeAttached();
  return (await opsi.getAttribute('value'))!;
}

test.describe('Master Iklan Berbayar (Admin, mutasi)', () => {
  test.slow();

  test('tambah iklan transporter → tampil di list, transporter yang sama ditolak, lalu dihapus', async ({ page }) => {
    test.setTimeout(240_000);
    const pesan = pasangDialog(page);
    await bukaList(page, '/adminprahu/masteriklan');
    const sudahAda = (await listPage.barisData(page).locator('td:nth-child(2)').allInnerTexts()).map((t) => t.trim());

    await page.goto('/adminprahu/tambahiklan');
    const select = page.locator('select[name="BidderID"]');
    await expect(select).toBeVisible();
    // Pilih transporter yang BELUM ada di list agar baris uji unik & duplikat teruji.
    const kandidat = await select.locator('option').evaluateAll((opts, ada) =>
      opts.map((o) => ({ v: (o as HTMLOptionElement).value, t: o.textContent!.trim() })).filter((o) => o.v && !/^Pilih/.test(o.t) && !ada.includes(o.t)), sudahAda);
    test.skip(kandidat.length === 0, 'Semua transporter sudah ada di Iklan Berbayar');
    const transporter = kandidat[kandidat.length - 1];

    let dibuat = false;
    try {
      await select.selectOption(transporter.v);
      const mulai = page.locator('#tgl_mulai_1');
      const nilaiAwal = await mulai.inputValue();
      test.info().annotations.push({ type: 'note', description: `Tanggal Mulai saat load: "${nilaiAwal}" (rule: default tanggal & jam saat ini)` });
      await ketikTanggal(page, mulai, tglJam(1, '10:00'));
      await ketikTanggal(page, page.locator('#tgl_akhir_1'), tglJam(8, '10:00'));
      await page.locator('#tombol_simpan_bank').click();
      dibuat = true;
      await expect(page).toHaveURL(/\/adminprahu\/masteriklan$/i, { timeout: 30_000 });
      await expect(listPage.alertSukses(page, /berhasil/i)).toBeVisible();
      const baris = listPage.baris(page, transporter.t).first();
      await expect(baris).toBeVisible();
      await expect(baris).toContainText(tglJam(8, '10:00').slice(0, 10));

      // Duplikat transporter → alert "Ada nama bidder yang sama".
      await page.goto('/adminprahu/tambahiklan');
      await select.selectOption(transporter.v);
      await ketikTanggal(page, page.locator('#tgl_mulai_1'), tglJam(2, '10:00'));
      await ketikTanggal(page, page.locator('#tgl_akhir_1'), tglJam(9, '10:00'));
      await page.locator('#tombol_simpan_bank').click();
      await expect.poll(() => pesan.length, { timeout: 15_000 }).toBeGreaterThan(0);
      expect(pesan[pesan.length - 1]).toMatch(/Ada nama bidder yang sama/i);

      await bukaList(page, '/adminprahu/masteriklan');
      await expect(listPage.baris(page, transporter.t)).toHaveCount(1);
      await hapusBaris(page, listPage.baris(page, transporter.t).first(), 'Hapus Iklan Berbayar');
      await expect(listPage.baris(page, transporter.t)).toHaveCount(0);
      dibuat = false;
    } finally {
      if (dibuat) {
        await bukaList(page, '/adminprahu/masteriklan');
        const sisa = listPage.baris(page, transporter.t);
        for (let i = await sisa.count(); i > 0; i--) await hapusBaris(page, sisa.first(), 'Hapus Iklan Berbayar');
      }
    }
  });
});

test.describe('Master Petugas APK (Admin, mutasi)', () => {
  test.slow();

  test('tambah petugas → list & detail, WA duplikat ditolak, edit nama, lalu dihapus', async ({ page }) => {
    test.setTimeout(300_000);
    const pesan = pasangDialog(page);
    const ts = tsPendek();
    const nama = `AUTOTEST-PETUGAS-${ts}`;
    const wa = `0899${String(Date.now()).slice(-8)}`;

    async function isiForm(namaPetugas: string, noWa: string): Promise<void> {
      await page.goto('/adminprahu/tambahpetugasapk');
      await page.locator('#BidderID').selectOption(await nilaiOpsi(page.locator('#BidderID'), /Muda Jaya/));
      await page.locator('#nama').fill(namaPetugas);
      await page.locator('#no_wa').fill(noWa);
      await page.locator('#KotaID').selectOption(await nilaiOpsi(page.locator('#KotaID'), /Kota Surabaya/));
      await page.locator('#status').selectOption({ label: 'Aktif' });
      await page.locator('#alamat').fill('Jl. AUTOTEST — dihapus di akhir test');
    }

    let dibuat = false;
    try {
      await isiForm(nama, wa);
      await page.locator('#tombol_simpan_petugas').click();
      dibuat = true;
      await expect(page).toHaveURL(/\/adminprahu\/masterpetugasapk$/i, { timeout: 30_000 });
      await expect(listPage.alertSukses(page, /berhasil/i)).toBeVisible();
      const baris = listPage.baris(page, nama).first();
      await expect(baris).toBeVisible();
      await expect(baris).toContainText(wa);
      await expect(baris).toContainText('AKTIF');

      const detail = await baris.locator('a[href*="detailpetugasapk/"]').first().getAttribute('href');
      await page.goto(detail!);
      await expect(page.getByText(nama).filter({ visible: true }).first()).toBeVisible();

      // 1 nomor WA hanya untuk 1 petugas → alert "Nomor Whatsapp Sudah Terdaftar".
      await isiForm(`${nama}-DUP`, wa);
      await page.locator('#tombol_simpan_petugas').click();
      await expect.poll(() => pesan.length, { timeout: 15_000 }).toBeGreaterThan(0);
      expect(pesan[pesan.length - 1]).toMatch(/(No\.|Nomor) Whatsapp Sudah Terdaftar/i);
      await bukaList(page, '/adminprahu/masterpetugasapk');
      await expect(listPage.baris(page, `${nama}-DUP`)).toHaveCount(0);

      // Edit nama via halaman edit.
      const edit = await listPage.baris(page, nama).first().locator('a[href*="editpetugasapk/"]').first().getAttribute('href');
      await page.goto(edit!);
      await expect(page.locator('#nama')).toHaveValue(nama);
      await expect(page.locator('#no_wa')).toHaveValue(wa);
      await page.locator('#nama').fill(`${nama} EDIT`);
      await page.locator('#tombol_simpan_petugas').click();
      // Edit meminta konfirmasi SweetAlert2 "Apakah anda yakin mengganti data
      // petugas APK ?" [Ya] (kalibrasi 2026-08-30) — tambah tidak.
      await expect(listPage.swal(page)).toContainText(/yakin mengganti data petugas/i);
      await listPage.swal(page).getByRole('button', { name: /^(Ya|OK)$/ }).first().click();
      await expect(page).toHaveURL(/\/adminprahu\/masterpetugasapk$/i, { timeout: 30_000 });
      await expect(listPage.baris(page, `${nama} EDIT`).first()).toBeVisible();

      await hapusBaris(page, listPage.baris(page, nama).first(), 'Hapus Petugas APK');
      await expect(listPage.baris(page, nama)).toHaveCount(0);
      dibuat = false;
    } finally {
      if (dibuat) {
        await bukaList(page, '/adminprahu/masterpetugasapk');
        const sisa = listPage.baris(page, nama);
        for (let i = await sisa.count(); i > 0; i--) await hapusBaris(page, sisa.first(), 'Hapus Petugas APK');
      }
    }
  });

  test('WA milik fixture petugas demo ditolak saat tambah petugas baru', async ({ page }) => {
    const pesan = pasangDialog(page);
    await page.goto('/adminprahu/tambahpetugasapk');
    await page.locator('#BidderID').selectOption(await nilaiOpsi(page.locator('#BidderID'), /Muda Jaya/));
    await page.locator('#nama').fill('AUTOTEST-WA-DUPLIKAT');
    await page.locator('#no_wa').fill('089900000001');
    await page.locator('#KotaID').selectOption(await nilaiOpsi(page.locator('#KotaID'), /Kota Surabaya/));
    await page.locator('#status').selectOption({ label: 'Aktif' });
    await page.locator('#alamat').fill('Jl. AUTOTEST');
    await page.locator('#tombol_simpan_petugas').click();
    await expect.poll(() => pesan.length, { timeout: 15_000 }).toBeGreaterThan(0);
    expect(pesan[0]).toMatch(/(No\.|Nomor) Whatsapp Sudah Terdaftar/i);
    await expect(page).toHaveURL(/tambahpetugasapk/);
  });
});
