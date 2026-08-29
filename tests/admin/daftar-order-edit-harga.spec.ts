import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul: Daftar Order — fitur BARU "Edit Harga" (peran Administrator,
 * project "admin", storageState .auth/admin.json via project setup).
 * Rule: docs/rules/administrator/07-daftar-order.md § "Edit Harga (fitur baru 2026-08)".
 *
 * Kalibrasi ke halaman asli 2026-08-28 via playwright-cli (login form, akun admin):
 * - /order/OrderList. Trigger = link dropdown `a.btn_edit_harga_order`
 *   (href javascript:void(0), atribut `idnya=<OrderID numerik>`), tampil pada
 *   baris ORDER BARU s.d ORDER SELESAI, TEPAT di bawah item "Edit Data Order"
 *   di dalam `.dropdown-menu` tombol "Action Menu".
 * - Klik trigger → POST /order/cek_edit_harga_order:
 *   - status SUKSES → popup `#modalEditHargaOrder` dibuka; `#eh_nomor_order`
 *     & `#eh_harga_sekarang` diisi dari respons; kedua input dikosongkan.
 *   - status SUDAH_ADA_INVOICE → SweetAlert2 (`.swal2-container`, BUKAN
 *     native alert) "Tidak bisa mengubah harga!" + "Invoice pengiriman untuk
 *     order ini sudah dibuat", tombol "Mengerti". Popup tidak dibuka.
 * - Popup: heading "Edit Harga"; info "Nomor Order" & "Harga Saat Ini" (label
 *   BARU sesuai rule — bukan "Harga Sebelumnya"); input #input_harga_baru
 *   (label "Harga Baru", placeholder "Masukkan Harga Baru", mask ribuan
 *   class "money": "3100000" → "3.100.000", maxlength 23, angka "0" tunggal
 *   di-mask jadi kosong); textarea #input_alasan_edit_harga (label "Alasan
 *   Edit Harga", placeholder "Masukkan Alasan Edit Harga"); tombol Batal
 *   (data-dismiss) & Simpan (#btn_simpan_edit_harga).
 * - "Alert" required di rule diimplementasikan sebagai POPOVER Bootstrap di
 *   bawah field (container #modalEditHargaOrder), auto-dispose ±2 detik —
 *   assert segera setelah klik Simpan.
 * - Simpan valid → POST /order/save_edit_harga_order → reload + SweetAlert2
 *   "Anda berhasil mengubah harga order !" (kalibrasi 2026-08-28) ATAU
 *   "Anda berhasil edit harga order" (teramati 2026-08-29, run yang sama —
 *   flash session, kemungkinan 2 varian teks bergantian; test cocokkan regex
 *   /mengubah|edit/ agar tahan keduanya), tombol "Mengerti"; harga baris di
 *   list berubah; entry History Perubahan
 *   Data: "<tgl> (Edit Harga)", Edit By, "Harga Sebelumnya"/"Harga Terbaru"
 *   (label history memang lama — beda dgn label popup), Alasan Edit Harga.
 * - Hak akses admin (/adminprahu/hakaksesadmin → tambah_hakaksesadmin,
 *   editHakAksesAdmin/<id>, detailHakAksesAdmin/<id>): checkbox BARU
 *   #edit_harga_order (value edit_harga_order) berlabel "Edit Harga" pada
 *   grup Modul Daftar Order. AWAS: ada checkbox lain berlabel sama persis
 *   "Edit Harga" (#edit_harga, grup Modul Harga) → locator WAJIB pakai id.
 * - "Hanya sisi admin": di shipper & transporter trigger + akses server
 *   absen (endpoint menjawab "Anda tidak memiliki akses ke fitur tersebut");
 *   test absensinya ada di spec daftar-order masing-masing peran. Catatan
 *   untuk developer: markup #modalEditHargaOrder + JS handler-nya ikut
 *   ter-render di halaman non-admin (tersembunyi, tanpa trigger).
 *
 * Mutasi (izin user 2026-08-28): test e2e mengubah harga satu order ORDER
 * BARU lalu MENGEMBALIKANNYA ke harga semula pada test yang sama (pola
 * "sandi baru = sandi lama"). Efek samping permanen yang tersisa hanya
 * entry History Perubahan Data (by design, history tidak bisa dihapus).
 */

const orderListUrl = '/order/OrderList';

const STATUS_EDIT_HARGA =
  /ORDER BARU|PROSES PERJANJIAN|PROSES VALIDASI|KONFIRMASI UNIT|PROSES PENUGASAN|AMBIL KONTAINER|STUFFING|KAPAL BERLAYAR|KAPAL SANDAR|RENCANA DOORING|DOORING|SJ Diterima Agen|DOKUMEN DIKIRIM|ORDER SELESAI/;

const listPage = {
  /** Baris data yang memuat menu Edit Harga (hanya ada di sisi admin). */
  barisDenganEditHarga: (page: Page) => page.locator('tr:has(a.btn_edit_harga_order)'),
  barisStatus: (page: Page, status: RegExp) =>
    page.locator('tr:has(a.btn_edit_harga_order)').filter({ hasText: status }),
  actionMenu: (baris: Locator) => baris.getByRole('button', { name: 'Action Menu' }),
  editHarga: (baris: Locator) => baris.locator('a.btn_edit_harga_order'),
};

const popup = {
  modal: (page: Page) => page.locator('#modalEditHargaOrder'),
  nomorOrder: (page: Page) => page.locator('#eh_nomor_order'),
  hargaSaatIni: (page: Page) => page.locator('#eh_harga_sekarang'),
  hargaBaru: (page: Page) => page.getByRole('textbox', { name: 'Harga Baru *' }),
  alasan: (page: Page) => page.getByRole('textbox', { name: 'Alasan Edit Harga *' }),
  simpan: (page: Page) => page.locator('#btn_simpan_edit_harga'),
  batal: (page: Page) => page.locator('#modalEditHargaOrder button[data-dismiss="modal"]'),
  /** Popover validasi Bootstrap — transient ±2 dtk, dirender di dalam modal. */
  popover: (page: Page) => page.locator('#modalEditHargaOrder .popover'),
};

/** SweetAlert2 (sukses & blokir memakai komponen yang sama, tombol "Mengerti"). */
const swal = {
  container: (page: Page) => page.locator('.swal2-container'),
  mengerti: (page: Page) => page.getByRole('button', { name: 'Mengerti' }),
};

async function bukaDaftarOrder(page: Page): Promise<void> {
  await page.goto(orderListUrl);
  // Flash message sukses tersimpan di session server — konsumsi bila tersisa
  // dari test/aksi sebelumnya agar tidak menghalangi klik test ini.
  const sisaFlash = swal.mengerti(page);
  if (await sisaFlash.isVisible().catch(() => false)) await sisaFlash.click();
  await listPage
    .barisDenganEditHarga(page)
    .first()
    .waitFor({ timeout: 15_000 })
    .catch(() => {});
}

/** Buka popup Edit Harga dari baris pertama berstatus tertentu; return baris. */
async function bukaPopupDariStatus(page: Page, status: RegExp): Promise<Locator> {
  const baris = listPage.barisStatus(page, status).first();
  await listPage.actionMenu(baris).click();
  await listPage.editHarga(baris).click();
  await expect(popup.modal(page)).toBeVisible({ timeout: 15_000 });
  return baris;
}

/** "Rp. 3.000.000" → 3000000 */
function angkaDariRupiah(teks: string): number {
  return Number(teks.replace(/[^\d]/g, ''));
}

/** 3100000 → "3.100.000" (format mask "money" pada input & tampilan harga). */
function formatRibuan(angka: number): string {
  return angka.toLocaleString('id-ID');
}

test.describe('Daftar Order — Edit Harga (Admin)', () => {
  test('menu Edit Harga tampil tepat di bawah Edit Data Order pada action menu', async ({ page }) => {
    await bukaDaftarOrder(page);
    const baris = listPage.barisDenganEditHarga(page).first();
    test.skip(!(await baris.isVisible().catch(() => false)), 'Tidak ada order pada akun demo');

    await listPage.actionMenu(baris).click();
    const item = await baris.locator('.dropdown-menu .dropdown-item').allInnerTexts();
    const daftar = item.map((t) => t.trim());
    const posisiEditDataOrder = daftar.indexOf('Edit Data Order');
    expect(posisiEditDataOrder, `Item menu: ${daftar.join(', ')}`).toBeGreaterThanOrEqual(0);
    expect(daftar[posisiEditDataOrder + 1]).toBe('Edit Harga');
  });

  test('menu Edit Harga tersedia pada tiap status Order Baru s.d Order Selesai yang ada di demo', async ({
    page,
  }) => {
    await bukaDaftarOrder(page);
    // Sweep baris data halaman pertama: setiap baris berstatus dikenal
    // (ORDER BARU..ORDER SELESAI) wajib memuat trigger Edit Harga.
    const barisData = page
      .locator('table tbody tr')
      .filter({ has: page.getByRole('button', { name: 'Action Menu' }) })
      .filter({ hasText: STATUS_EDIT_HARGA });
    const jumlah = await barisData.count();
    test.skip(jumlah === 0, 'Tidak ada order berstatus Order Baru s.d Order Selesai pada akun demo');

    for (let i = 0; i < jumlah; i++) {
      await expect(barisData.nth(i).locator('a.btn_edit_harga_order')).toHaveCount(1);
    }
  });

  test('popup Edit Harga menampilkan Nomor Order dan Harga Saat Ini sesuai baris, dengan label dan placeholder sesuai rule', async ({
    page,
  }) => {
    await bukaDaftarOrder(page);
    // ORDER BARU belum mungkin punya invoice → klik pasti membuka popup.
    const adaOrderBaru = await listPage.barisStatus(page, /ORDER BARU/).count();
    test.skip(adaOrderBaru === 0, 'Tidak ada order berstatus Order Baru pada akun demo');

    const baris = listPage.barisStatus(page, /ORDER BARU/).first();
    const nomorOrder = (await baris.locator('td').first().innerText()).trim().split('\n')[0].trim();
    const hargaBaris = angkaDariRupiah((await baris.getByText(/Rp\. [\d.]+/).first().innerText()));

    await listPage.actionMenu(baris).click();
    await listPage.editHarga(baris).click();
    await expect(popup.modal(page)).toBeVisible({ timeout: 15_000 });

    await expect(popup.modal(page).getByRole('heading', { name: 'Edit Harga' })).toBeVisible();
    // Data popup sesuai baris yang dipilih.
    await expect(popup.nomorOrder(page)).toHaveText(nomorOrder);
    expect(angkaDariRupiah(await popup.hargaSaatIni(page).innerText())).toBe(hargaBaris);
    // Label sesuai rule (revisi desain): "Harga Saat Ini" & "Harga Baru",
    // BUKAN "Harga Sebelumnya"/"Harga Terbaru".
    await expect(popup.modal(page).getByText('Harga Saat Ini')).toBeVisible();
    await expect(popup.modal(page).getByText('Nomor Order')).toBeVisible();
    await expect(popup.hargaBaru(page)).toHaveAttribute('placeholder', 'Masukkan Harga Baru');
    await expect(popup.alasan(page)).toHaveAttribute('placeholder', 'Masukkan Alasan Edit Harga');
    await expect(popup.batal(page)).toBeVisible();
    await expect(popup.simpan(page)).toBeVisible();

    // Batal menutup popup tanpa menyimpan.
    await popup.batal(page).click();
    await expect(popup.modal(page)).toBeHidden();
  });

  test('submit tanpa harga baru menampilkan pesan Masukkan Harga Baru', async ({ page }) => {
    await bukaDaftarOrder(page);
    const adaOrderBaru = await listPage.barisStatus(page, /ORDER BARU/).count();
    test.skip(adaOrderBaru === 0, 'Tidak ada order berstatus Order Baru pada akun demo');

    await bukaPopupDariStatus(page, /ORDER BARU/);
    await popup.simpan(page).click();
    // Popover auto-dispose ±2 dtk — assert langsung setelah klik.
    await expect(popup.popover(page)).toHaveText('Masukkan Harga Baru');
    await expect(popup.modal(page)).toBeVisible(); // tidak tersimpan/tertutup
    await popup.batal(page).click();
  });

  test('submit tanpa alasan menampilkan pesan Masukkan Alasan Edit Harga; input harga ber-mask ribuan', async ({
    page,
  }) => {
    await bukaDaftarOrder(page);
    const adaOrderBaru = await listPage.barisStatus(page, /ORDER BARU/).count();
    test.skip(adaOrderBaru === 0, 'Tidak ada order berstatus Order Baru pada akun demo');

    await bukaPopupDariStatus(page, /ORDER BARU/);
    await popup.hargaBaru(page).fill('3100000');
    // Mask "money": otomatis berformat titik ribuan.
    await expect(popup.hargaBaru(page)).toHaveValue('3.100.000');

    await popup.simpan(page).click();
    await expect(popup.popover(page)).toHaveText('Masukkan Alasan Edit Harga');
    await expect(popup.modal(page)).toBeVisible();
    await popup.batal(page).click();
  });

  test('edit harga tersimpan, tercatat di History Perubahan Data, lalu dikembalikan ke harga semula', async ({
    page,
  }) => {
    // 2 mutasi berurutan (masing2 goto + 2 AJAX + modal + simpan) + kunjungan
    // History butuh ~6-8 round trip; lonjakan latensi server demo (>30 dtk/
    // request, terdokumentasi CLAUDE.md) bisa mengakumulasi >120 dtk total
    // (terbukti timeout 2x di 120s/60s 2026-08-28, data tetap konsisten
    // pasca-kejadian — bukan defect, murni waktu jaringan server demo).
    test.setTimeout(180_000);
    await bukaDaftarOrder(page);
    const adaOrderBaru = await listPage.barisStatus(page, /ORDER BARU/).count();
    test.skip(adaOrderBaru === 0, 'Tidak ada order berstatus Order Baru pada akun demo');

    const baris = listPage.barisStatus(page, /ORDER BARU/).first();
    // WAJIB baca nomor order & harga dalam SATU evaluate() atomik — dua
    // pembacaan Playwright terpisah (mis. .locator().innerText() lalu
    // .getByText().innerText()) masing2 me-resolve ulang ".first()" ke DOM
    // TERKINI; tabel order demo yang bersama & terus tumbuh (live/auto-
    // refresh) bisa berubah di antara keduanya, membuat nomor order dari
    // baris A "kepasang" dengan harga baris B (terbukti gagal 2026-08-28:
    // assert mengharapkan harga order lain yang tak pernah diedit test ini).
    const dataAwal = await baris.evaluate((el) => {
      const td = el.querySelector('td');
      const nomor = (td?.innerText ?? '').trim().split('\n')[0].trim();
      const hargaMatch = el.innerText.match(/Rp\.\s?[\d.]+/);
      return { nomorOrder: nomor, hargaTeks: hargaMatch ? hargaMatch[0] : '' };
    });
    const nomorOrder = dataAwal.nomorOrder;
    const hargaAwal = angkaDariRupiah(dataAwal.hargaTeks);
    const hargaUji = hargaAwal + 111;
    // Alasan WAJIB unik per run: history menumpuk lintas run (tidak bisa
    // dihapus) dan tampil terbaru-dulu — alasan statis membuat locator
    // menangkap entry run lama (terbukti gagal 2026-08-28).
    const alasanUji = `Uji otomasi QA ${Date.now()} - harga akan dikembalikan`;

    async function editHarga(nominal: number, alasan: string, onSubmitted?: () => void): Promise<void> {
      const barisOrder = listPage.barisDenganEditHarga(page).filter({ hasText: nomorOrder }).first();
      await listPage.actionMenu(barisOrder).click();
      await listPage.editHarga(barisOrder).click();
      await expect(popup.modal(page)).toBeVisible({ timeout: 15_000 });
      await popup.hargaBaru(page).fill(String(nominal));
      await popup.alasan(page).fill(alasan);
      await popup.simpan(page).click();
      // POST save_edit_harga_order sudah terkirim di titik ini — beri tahu
      // caller SEBELUM menunggu toast, supaya revert di finally tetap jalan
      // walau assertion toast di bawah ini gagal (terbukti gagal 2026-08-29:
      // mutasi sukses tapi toast-nya "Anda berhasil edit harga order", bukan
      // "...mengubah...", assertion lama timeout & revert ikut ter-skip →
      // data demo ter-drift +111 sampai diperbaiki manual).
      onSubmitted?.();
      // Sukses = SweetAlert2 (bukan native alert) setelah proses simpan.
      // Teks toast pernah teramati 2 varian ("mengubah"/"edit") — regex agar
      // tahan terhadap keduanya.
      await expect(page.getByText(/Anda berhasil (mengubah|edit) harga order/i)).toBeVisible({ timeout: 20_000 });
      await swal.mengerti(page).click();
      await page.goto(orderListUrl);
    }

    // Mutasi 2 (revert) WAJIB tetap jalan di finally selama mutasi 1 sukses,
    // apa pun yang terjadi di antaranya (assertion harga/History gagal,
    // dll.) — jangan pernah tinggalkan harga order demo bersama ini
    // ter-drift. Timeout eksplisit 20s pada cek visibilitas harga: default
    // expect timeout (~5s) terbukti kepentok reload tabel async yang lambat
    // pasca goto() saat server demo lonjak latensi (2026-08-28) — mutasi
    // SEBENARNYA selalu sukses (dikonfirmasi via History Perubahan Data),
    // hanya verifikasi cepatnya yang keburu timeout.
    let mutasi1Berhasil = false;
    try {
      // --- Mutasi 1: harga uji ---
      await editHarga(hargaUji, alasanUji, () => {
        mutasi1Berhasil = true;
      });
      const barisSetelah = listPage.barisDenganEditHarga(page).filter({ hasText: nomorOrder }).first();
      await expect(barisSetelah.getByText(`Rp. ${formatRibuan(hargaUji)}`)).toBeVisible({ timeout: 20_000 });

      // --- Efek: tercatat di History Perubahan Data ---
      await listPage.actionMenu(barisSetelah).click();
      await barisSetelah.getByRole('link', { name: 'History Perubahan Data' }).click();
      await expect(page).toHaveURL(/\/order\/historyupdateorder\/.+$/);
      const entri = page
        .locator('div')
        .filter({ hasText: /\(Edit Harga\)/ })
        .filter({ hasText: alasanUji })
        .last();
      await expect(entri.getByText('(Edit Harga)')).toBeVisible();
      // Label history memakai istilah lama "Harga Sebelumnya"/"Harga Terbaru"
      // (kalibrasi 2026-08-28) — beda dengan label popup, sesuai desain.
      await expect(entri.getByText(`Rp. ${formatRibuan(hargaAwal)}`).first()).toBeVisible();
      await expect(entri.getByText(`Rp. ${formatRibuan(hargaUji)}`).first()).toBeVisible();
      await expect(entri.getByText(alasanUji).first()).toBeVisible();
    } finally {
      if (mutasi1Berhasil) {
        // --- Mutasi 2: kembalikan harga semula (jaga data demo) ---
        await page.goto(orderListUrl);
        await editHarga(hargaAwal, 'Uji otomasi QA - mengembalikan harga semula');
        const barisPulih = listPage.barisDenganEditHarga(page).filter({ hasText: nomorOrder }).first();
        await expect(barisPulih.getByText(`Rp. ${formatRibuan(hargaAwal)}`)).toBeVisible({ timeout: 20_000 });
      }
    }
  });

  test('order yang invoicenya sudah dibuat tidak bisa edit harga', async ({ page }) => {
    await bukaDaftarOrder(page);
    // Invoice hanya mungkin dibuat mulai KAPAL SANDAR — kandidat: status
    // KAPAL SANDAR s.d ORDER SELESAI. Coba tiap kandidat sampai ketemu yang
    // ber-invoice (blokir); yang belum ber-invoice membuka popup → tutup lagi.
    const kandidat = listPage.barisStatus(page, /KAPAL SANDAR|SJ Diterima Agen|DOKUMEN DIKIRIM|ORDER SELESAI/);
    const jumlah = await kandidat.count();
    test.skip(jumlah === 0, 'Tidak ada order pasca kapal sandar pada akun demo');

    let ketemuBlokir = false;
    for (let i = 0; i < jumlah && !ketemuBlokir; i++) {
      const baris = kandidat.nth(i);
      await listPage.actionMenu(baris).click();
      await listPage.editHarga(baris).click();
      // Respons cek_edit_harga_order menentukan: popup terbuka ATAU swal
      // blokir. TIDAK memakai locator.or(): #modalEditHargaOrder selalu ada
      // (hidden) di DOM sehingga .or() ambigu (terbukti gagal 2026-08-28) —
      // poll visibilitas keduanya secara eksplisit.
      await expect
        .poll(
          async () =>
            (await swal.container(page).isVisible())
              ? 'blokir'
              : (await popup.modal(page).isVisible())
                ? 'popup'
                : null,
          { timeout: 15_000 },
        )
        .not.toBeNull();
      if (await swal.container(page).isVisible()) {
        ketemuBlokir = true;
        await expect(swal.container(page)).toContainText('Tidak bisa mengubah harga!');
        await expect(swal.container(page)).toContainText('Invoice pengiriman untuk order ini sudah dibuat');
        await expect(popup.modal(page)).toBeHidden();
        await swal.mengerti(page).click();
      } else {
        await popup.batal(page).click();
        await expect(popup.modal(page)).toBeHidden();
        // Tunggu backdrop fade Bootstrap benar-benar hilang sebelum membuka
        // dropdown baris berikutnya (klik bisa tertelan backdrop).
        await expect(page.locator('.modal-backdrop')).toHaveCount(0);
      }
    }
    test.skip(!ketemuBlokir, 'Tidak ada order ber-invoice pada akun demo saat run ini');
  });
});

test.describe('Hak Akses Admin — checkbox Edit Harga', () => {
  // AWAS: dua checkbox berlabel persis "Edit Harga" (Modul Harga #edit_harga
  // vs Modul Daftar Order #edit_harga_order) → wajib menyasar id.
  const cekCheckbox = async (page: Page) => {
    const checkbox = page.locator('#edit_harga_order');
    await expect(checkbox).toHaveCount(1);
    await expect(checkbox).toHaveValue('edit_harga_order');
    // Anggota grup Modul Daftar Order (class penanda grup dari kalibrasi).
    await expect(checkbox).toHaveClass(/modul_daftar_order_pilih_semua/);
    await expect(page.locator('label[for="edit_harga_order"]')).toHaveText('Edit Harga');
  };

  test('halaman Tambah Hak Akses memuat checkbox Edit Harga pada grup Modul Daftar Order', async ({
    page,
  }) => {
    await page.goto('/adminprahu/tambah_hakaksesadmin');
    await cekCheckbox(page);
  });

  test('halaman Edit dan Detail Hak Akses memuat checkbox Edit Harga', async ({ page }) => {
    await page.goto('/adminprahu/hakaksesadmin');
    const linkEdit = page.locator('a[href*="editHakAksesAdmin/"]').first();
    await linkEdit.waitFor({ timeout: 15_000 }).catch(() => {});
    test.skip(!(await linkEdit.isVisible().catch(() => false)), 'Tidak ada data hak akses pada demo');

    const idHakAkses = (await linkEdit.getAttribute('href'))!.split('/').pop();
    await page.goto(`/adminprahu/editHakAksesAdmin/${idHakAkses}`);
    await cekCheckbox(page);
    await page.goto(`/adminprahu/detailHakAksesAdmin/${idHakAkses}`);
    await cekCheckbox(page);
  });
});

/**
 * Defect ditemukan 2026-08-28 saat verifikasi hak akses Edit Harga end-to-end
 * memakai sub user admin sungguhan (phbiddaratadmean@gmail.com / ADMIN_SUB_EMAIL,
 * project "admin-sub" login form yang sama, dibuka di context Playwright kedua
 * dari dalam test "admin" ini karena butuh kredensial admin ATASNYA untuk
 * membuat/meng-assign/menghapus grup hak akses sekaligus).
 *
 * Alur uji: buat grup hak akses baru (nama unik per run, hapus otomatis di
 * finally) dengan HANYA #edit_harga_order dicentang → assign sementara ke
 * sub user admin nyata (dicari dinamis via ADMIN_SUB_EMAIL, bukan hardcode
 * id — id sub user bisa berubah) → login sebagai sub user itu di context
 * terpisah → trigger & endpoint TETAP menolak walau checkbox tercentang &
 * sudah re-login (sesi baru, bukan cache lama). Assignment semula sub user
 * (apa pun itu saat run) disimpan & dikembalikan di finally.
 */
/**
 * Hapus grup hak akses uji via UI, menunggu SweetAlert2 konfirmasi secara
 * eksplisit (bukan click().catch() buta — terbukti gagal SENYAP 2026-08-28:
 * grup tersisa di server walau test lulus, klik konfirmasi tidak sempat
 * ditunggu). Melempar error bila grup masih ada setelah dicoba hapus, supaya
 * kegagalan cleanup TIDAK pernah senyap pada data demo bersama ini.
 */
async function hapusGrupHakAksesUji(page: Page, idGrup: string, nama: string): Promise<void> {
  await page.goto('/adminprahu/hakaksesadmin');
  const baris = page.locator('tr', { hasText: nama });
  // WAJIB pakai waitFor (polling) — bukan isVisible({timeout}), yang TIDAK
  // menunggu/retry sama sekali (cek sesaat). Tabel ini load baris secara
  // async setelah goto (pola sama seperti tabel Order List) — isVisible()
  // sempat salah simpul "sudah tak ada" sebelum baris selesai dirender,
  // membuat cleanup skip diam-diam tanpa error (terbukti 2026-08-28: grup uji
  // tersisa permanen di server padahal test lulus).
  const ditemukan = await baris
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (!ditemukan) return; // sudah tak ada

  await baris.locator(`button.btn-delete[value="${idGrup}"]`).first().click();
  const swal = page.locator('.swal2-container');
  await expect(swal).toBeVisible({ timeout: 10_000 });
  await swal.getByRole('button', { name: 'Hapus' }).click();
  await expect(swal).toBeHidden({ timeout: 15_000 });

  // Verifikasi SUNGGUHAN via reload — bukan cuma cek DOM pasca-klik (bisa
  // ter-update optimistik di klien walau request server gagal).
  await page.reload();
  await expect(page.getByText(nama, { exact: false })).toHaveCount(0, { timeout: 15_000 });
}

test.describe('Hak Akses Admin — defect penerapan izin Edit Harga', () => {
  test('DEFECT: halaman Detail Hak Akses Admin tidak merefleksikan checkbox yang sebenarnya tercentang', async ({
    page,
  }) => {
    test.fail();
    const nama = `QA TEST DETAIL CHECKBOX ${Date.now()} - HAPUS`;
    let idGrup: string | null = null;
    try {
      await page.goto('/adminprahu/tambah_hakaksesadmin');
      await page.fill('#nama_hak_akses', nama);
      await page.fill('#deskripsi_hak_akses', 'Sementara — verifikasi tampilan checkbox halaman Detail');
      await page.check('#edit_harga_order');
      await page.getByRole('button', { name: 'Simpan' }).click();
      await expect(page).toHaveURL(/\/adminprahu\/hakaksesadmin$/, { timeout: 15_000 });

      const baris = page.locator('tr', { hasText: nama });
      await expect(baris).toBeVisible({ timeout: 15_000 });
      idGrup = (await baris.locator('a[href*="detailHakAksesAdmin/"]').first().getAttribute('href'))!
        .split('/')
        .pop()!;

      // Edit page = sumber kebenaran (dipakai test lain di atas): checkbox
      // memang tersimpan tercentang.
      await page.goto(`/adminprahu/editHakAksesAdmin/${idGrup}`);
      await expect(page.locator('#edit_harga_order')).toBeChecked();

      // Detail page SEHARUSNYA menampilkan hal yang sama (ini yang gagal).
      await page.goto(`/adminprahu/detailHakAksesAdmin/${idGrup}`);
      await expect(page.locator('#edit_harga_order')).toBeChecked();
    } finally {
      if (idGrup) await hapusGrupHakAksesUji(page, idGrup, nama);
    }
  });

  test('DEFECT: sub user admin dengan hak akses Edit Harga tercentang tetap ditolak menu & endpoint-nya', async ({
    page,
    browser,
  }) => {
    test.fail();
    const emailSubAdmin = process.env.ADMIN_SUB_EMAIL;
    const passwordSubAdmin = process.env.ADMIN_SUB_PASSWORD;
    test.skip(!emailSubAdmin || !passwordSubAdmin, 'ADMIN_SUB_EMAIL/ADMIN_SUB_PASSWORD kosong di .env');

    const nama = `QA TEST SUBADMIN EDIT HARGA ${Date.now()} - HAPUS`;
    let idGrup: string | null = null;
    let idSubUser: string | null = null;
    let hakAksesSemula: string[] = [];
    let subContext: Awaited<ReturnType<typeof browser.newContext>> | null = null;

    try {
      // 1) Cari sub user admin nyata secara dinamis via emailnya (bukan
      // hardcode id — id bisa berubah kalau data demo di-reset).
      await page.goto('/adminprahu/subUserAdmin');
      const barisSubUser = page.locator('tr', { hasText: emailSubAdmin! });
      await expect(barisSubUser.first()).toBeVisible({ timeout: 15_000 });
      idSubUser = (await barisSubUser.first().locator('a[href*="editsubuseradmin/"]').first().getAttribute('href'))!
        .split('/')
        .pop()!;

      // 2) Simpan hak akses semula sub user ini agar bisa dikembalikan.
      await page.goto(`/adminprahu/editsubuseradmin/${idSubUser}`);
      const selectHakAkses = page.locator('#ukuran');
      hakAksesSemula = await selectHakAkses.evaluate((el: HTMLSelectElement) =>
        [...el.selectedOptions].map((o) => o.value),
      );
      expect(hakAksesSemula.length, 'Sub user demo harus sudah punya hak akses semula').toBeGreaterThan(0);

      // 3) Buat grup hak akses baru dengan HANYA Edit Harga dicentang.
      await page.goto('/adminprahu/tambah_hakaksesadmin');
      await page.fill('#nama_hak_akses', nama);
      await page.fill('#deskripsi_hak_akses', 'Sementara — verifikasi penerapan izin Edit Harga ke sub admin');
      await page.check('#edit_harga_order');
      await page.getByRole('button', { name: 'Simpan' }).click();
      await expect(page).toHaveURL(/\/adminprahu\/hakaksesadmin$/, { timeout: 15_000 });
      const barisGrupBaru = page.locator('tr', { hasText: nama });
      await expect(barisGrupBaru).toBeVisible({ timeout: 15_000 });
      idGrup = (await barisGrupBaru.locator('a[href*="detailHakAksesAdmin/"]').first().getAttribute('href'))!
        .split('/')
        .pop()!;

      // 4) Assign grup baru ke sub user (menggantikan sementara).
      await page.goto(`/adminprahu/editsubuseradmin/${idSubUser}`);
      await selectHakAkses.selectOption([idGrup]);
      await page.evaluate(() => document.getElementById('ukuran')!.dispatchEvent(new Event('change', { bubbles: true })));
      page.once('dialog', (d) => d.accept());
      await page.getByRole('button', { name: 'Simpan' }).click();
      await expect(page).toHaveURL(/subuseradmin/i, { timeout: 15_000 });

      // 5) Login sebagai sub user itu di context TERPISAH (sesi baru, bukan
      // cache lama) dan verifikasi menu + endpoint Edit Harga.
      subContext = await browser.newContext();
      const subPage = await subContext.newPage();
      await subPage.goto('/');
      await subPage.getByRole('textbox', { name: 'Masukkan Email / No. Whatsapp' }).fill(emailSubAdmin!);
      await subPage.getByRole('textbox', { name: 'Masukkan Kata Sandi Anda' }).fill(passwordSubAdmin!);
      await subPage.getByRole('button', { name: 'Masuk' }).click();
      await expect(subPage.getByRole('link', { name: 'KELUAR' })).toBeVisible({ timeout: 20_000 });

      await subPage.goto('/order/OrderList');
      // Seharusnya trigger Edit Harga MUNCUL (izin sudah diberikan) — ini
      // yang gagal (defect).
      await expect(subPage.locator('a.btn_edit_harga_order').first()).toBeVisible({ timeout: 15_000 });

      const responsEndpoint = await subPage.evaluate(async () => {
        const res = await fetch('/order/cek_edit_harga_order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
          body: 'OrderID=1454',
        });
        return res.json();
      });
      // Seharusnya endpoint TIDAK menolak dengan pesan "tidak memiliki akses"
      // — ini juga gagal (defect konsisten di backend, bukan cuma rendering).
      expect(responsEndpoint.status).not.toBe('ERROR');
    } finally {
      if (subContext) await subContext.close().catch(() => {});
      if (idSubUser && hakAksesSemula.length > 0) {
        await page.goto(`/adminprahu/editsubuseradmin/${idSubUser}`);
        await page.locator('#ukuran').selectOption(hakAksesSemula);
        await page.evaluate(() =>
          document.getElementById('ukuran')!.dispatchEvent(new Event('change', { bubbles: true })),
        );
        page.once('dialog', (d) => d.accept());
        await page.getByRole('button', { name: 'Simpan' }).click();
        await expect(page).toHaveURL(/subuseradmin/i, { timeout: 15_000 });
        // Verifikasi assignment semula benar2 kembali — jangan tinggalkan
        // sub user demo dalam keadaan tak menentu.
        await page.goto(`/adminprahu/editsubuseradmin/${idSubUser}`);
        const kembali = await page
          .locator('#ukuran')
          .evaluate((el: HTMLSelectElement) => [...el.selectedOptions].map((o) => o.value));
        expect(kembali.sort()).toEqual([...hakAksesSemula].sort());
      }
      if (idGrup) await hapusGrupHakAksesUji(page, idGrup, nama);
    }
  });
});
