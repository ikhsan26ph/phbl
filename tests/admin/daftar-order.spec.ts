import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Modul inti Daftar Order — Administrator.
 * Rule: docs/rules/administrator/07-daftar-order.md.
 *
 * Kalibrasi 2026-09-29 pada 100 order aktual. Seluruh test di file ini
 * read-only: halaman form hanya dibuka; interaksi Simpan hanya memakai nilai
 * invalid yang ditolak client-side. Aksi bisnis yang memang mengubah state
 * (validasi perjanjian dan ganti jadwal) ada di spec trigger terpisah.
 */

const fixture = {
  inputMuatan: {
    order: '20260829-06504',
    path: '/home/inputmuatan/MHZROHFLSlBlKyswU0p3SlpBRm5Idz09',
    detail: '/order/orderdetail/MHZROHFLSlBlKyswU0p3SlpBRm5Idz09',
  },
  perjanjian: {
    order: '20260827-06503',
    path: '/order/kontrak_pengiriman/bXZMbnlNSjZjT0luOXFBaDN3bk41UT09',
    detail: '/order/orderdetail/bXZMbnlNSjZjT0luOXFBaDN3bk41UT09',
  },
  unit: {
    order: '20260929-06501',
    path: '/order/inputunit/T24zMmV3N3RlZVdPZGwybDlmUjdSdz09',
    upload: '/order/uploaddokumen/1469',
    biaya: '/order/biaya_tambahan/T24zMmV3N3RlZVdPZGwybDlmUjdSdz09',
    detail: '/order/orderdetail/T24zMmV3N3RlZVdPZGwybDlmUjdSdz09',
  },
  tracking: {
    order: '20260904-06501',
    lihatUnit: '/order/lihatdataunit/MWhTQXZlTFZHM1lXZmlFSkJqUm5Gdz09',
    detail: '/order/orderdetail/MWhTQXZlTFZHM1lXZmlFSkJqUm5Gdz09',
  },
  selesai: {
    order: '20260827-06502',
    rating: '/order/order_rating/dmVSUnFiaGxwdU9oYjJnZHhEY0cyUT09',
    detail: '/order/orderdetail/dmVSUnFiaGxwdU9oYjJnZHhEY0cyUT09',
  },
  ditolak: {
    order: '20260826-06506',
    detail: '/order/orderdetail/MGp0a1ZzY1piUG5DcGJaQmJhNDUyZz09',
  },
};

const ALL_STATUSES = [
  'ORDER DITOLAK', 'PROSES PERJANJIAN', 'PROSES VALIDASI', 'KONFIRMASI UNIT',
  'PROSES PENUGASAN', 'AMBIL KONTAINER', 'KAPAL BERLAYAR', 'KAPAL SANDAR',
  'RENCANA DOORING', 'SJ DITERIMA AGEN', 'DOKUMEN DIKIRIM', 'ORDER SELESAI',
  'DIBATALKAN', 'ORDER BARU', 'STUFFING', 'DOORING',
] as const;

interface OrderRow {
  nomor: string;
  status: string;
  text: string;
  actions: string[];
  actionDisabled: boolean;
}

let cachedRows: OrderRow[] | null = null;

async function bukaDaftar(page: Page, resetFilter = true): Promise<void> {
  await page.goto('/order/OrderList');
  const filter = page.getByRole('button', { name: /Filter/ }).first();
  await expect(filter).toBeVisible({ timeout: 30_000 });
  if (resetFilter) {
    // Filter disimpan pada sesi server. Submit eksplisit seluruh nilai kosong
    // membuat test independen dari filter yang ditinggalkan request sebelumnya.
    await submitFilterEksklusif(page, {});
  }
  await expect(page.getByRole('button', { name: 'Action Menu' }).first()).toBeVisible({ timeout: 60_000 });
}

async function bukaFilter(page: Page): Promise<void> {
  if (!(await page.locator('#nomor_lelang').isVisible().catch(() => false))) {
    await page.getByRole('button', { name: /Filter/ }).first().click();
  }
  await expect(page.locator('#nomor_lelang')).toBeVisible();
}

async function submitFilter(page: Page): Promise<void> {
  await page.locator('#nomor_lelang').evaluate((field) => {
    const button = field.closest('form')?.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!button) throw new Error('Tombol submit filter tidak ditemukan');
    button.click();
  });
}

async function submitFilterEksklusif(
  page: Page,
  values: { idOrder?: string; nomorLelang?: string },
): Promise<void> {
  await bukaFilter(page);
  await page.locator('#id_order').evaluate((field, requested) => {
    const form = field.closest('form');
    if (!form) throw new Error('Form filter tidak ditemukan');
    for (const control of form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
    )) {
      if (control instanceof HTMLInputElement && ['checkbox', 'radio'].includes(control.type)) {
        control.checked = false;
      } else {
        control.value = '';
      }
    }
    (form.querySelector<HTMLInputElement>('#id_order'))!.value = requested.idOrder ?? '';
    (form.querySelector<HTMLInputElement>('#nomor_lelang'))!.value = requested.nomorLelang ?? '';
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!button) throw new Error('Tombol submit filter tidak ditemukan');
    button.click();
  }, values);
}

async function bukaAksiOrder(
  page: Page,
  nomorOrder: string,
  namaAksi: string,
  polaUrl: RegExp,
): Promise<void> {
  await bukaDaftar(page, false);
  await submitFilterEksklusif(page, { idOrder: nomorOrder });
  const baris = page.locator('table tbody tr').filter({ hasText: nomorOrder }).first();
  await expect(baris).toBeVisible({ timeout: 60_000 });
  const tautan = baris.locator('a').filter({ hasText: new RegExp(`^\\s*${namaAksi}\\s*$`, 'i') }).first();
  await expect(tautan).toHaveAttribute('href', polaUrl);
  await page.goto((await tautan.getAttribute('href'))!);
  await expect(page).toHaveURL(polaUrl, { timeout: 30_000 });
}

async function barisOrderAktual(page: Page, nomorOrder: string, status: string): Promise<Locator> {
  await page.goto('/order/OrderList');
  await expect(page.getByRole('button', { name: /Filter/ }).first()).toBeVisible({ timeout: 30_000 });
  await submitFilterEksklusif(page, { idOrder: nomorOrder });
  const row = page.locator('table tbody tr').filter({ hasText: nomorOrder }).first();
  await expect(row).toBeVisible({ timeout: 60_000 });
  await expect(row).toContainText(status);
  return row;
}

async function klikAksiDanHarapkanAlert(
  page: Page,
  nomorOrder: string,
  status: string,
  action: string,
  message: RegExp,
): Promise<void> {
  const row = await barisOrderAktual(page, nomorOrder, status);
  const item = row.locator('.dropdown-menu > *').filter({ hasText: new RegExp(`^\\s*${action}\\s*$`, 'i') }).first();
  await expect(item).toBeAttached();
  await page.waitForTimeout(2_000);
  await row.getByRole('button', { name: 'Action Menu' }).click();
  await item.click({ force: true });
  await expect(page.locator('.swal2-container:visible')).toContainText(message, { timeout: 20_000 });
}

async function panenOrderAktual(page: Page): Promise<OrderRow[]> {
  if (cachedRows) return cachedRows;
  await bukaDaftar(page);
  let result: OrderRow[] = [];
  let statusTerbanyak = 0;
  for (let percobaan = 0; percobaan < 4 && statusTerbanyak < 8; percobaan += 1) {
    await page.locator('#valuelimit').selectOption('100');
    for (let poll = 0; poll < 40; poll += 1) {
      const current = await page.locator('table tbody tr').evaluateAll((trs, statuses) => trs
        .filter((tr) => tr.querySelector('button.btn_action_menu'))
        .map((tr) => {
          const text = (tr.textContent ?? '').replace(/\s+/g, ' ').trim();
          const status = statuses.find((candidate) => text.toUpperCase().includes(candidate)) ?? '';
          const button = tr.querySelector('button.btn_action_menu') as HTMLButtonElement | null;
          return {
            nomor: (text.match(/\d{8}-\d{5}/) ?? [''])[0],
            status,
            text,
            // Sejumlah action pembatasan dirender sebagai <span>, bukan <a>.
            // Wajib ikut dipanen agar menu tampil tidak salah dilaporkan hilang.
            actions: [...tr.querySelectorAll('a, button, .dropdown-menu > span')]
              .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
              .filter(Boolean),
            actionDisabled: Boolean(button?.disabled || button?.hasAttribute('disabled')),
          };
        })
        .filter((row) => row.nomor && row.status), ALL_STATUSES);
      const jumlahStatus = new Set(current.map((row) => row.status)).size;
      if (jumlahStatus > statusTerbanyak) {
        result = current;
        statusTerbanyak = jumlahStatus;
      }
      if (statusTerbanyak >= 8) break;
      await page.waitForTimeout(500);
    }
  }
  expect(statusTerbanyak, 'Minimal delapan status harus tertangkap dari tabel 100 order').toBeGreaterThanOrEqual(8);
  cachedRows = result;
  return result;
}

function rowFor(rows: OrderRow[], status: string): OrderRow | undefined {
  return rows.find((row) => row.status === status);
}

test.describe('Daftar Order — Administrator', () => {
  test.slow();

  test('tabel dan panel filter memuat seluruh kontrol utama; Nomor Kontainer disanitasi', async ({ page }) => {
    await bukaDaftar(page);
    for (const header of [
      'Lelang Status', 'Nama Kapal Permintaan Muat & Closing Time',
      'Pelabuhan Asal ETD', 'Pelabuhan Tujuan ETA', 'Transporter',
      'Harga Jumlah Order', 'Action',
    ]) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }

    await bukaFilter(page);
    for (const selector of [
      '#id_order', '#nomor_lelang', '#tgl_permintaan_muat',
      '#nomor_kontainer', '#ETD', '#ETA', '#kapal_connecting', '#kapal',
      '#tgl_order', '#jumlah', '#penerima_barang',
    ]) {
      await expect(page.locator(selector)).toBeVisible();
    }
    for (const selector of [
      '#container_data', 'select[name="id_bidder"]',
      'select[name="status_aksi"]', 'select[name="bidowner"]',
    ]) {
      await expect(page.locator(selector)).toHaveCount(1);
      await expect(page.locator(`${selector} + span.select2`)).toBeVisible();
    }

    const container = page.locator('#nomor_kontainer');
    await container.pressSequentially('abc 12!@#defgh456789', { delay: 10 });
    expect(await container.inputValue()).toMatch(/^[A-Za-z0-9]{11}$/);
    await expect(container).toHaveCSS('text-transform', 'uppercase');
  });

  test('filter Nomor Lelang tetap tersimpan setelah membuka Detail Order lalu Kembali', async ({ page }) => {
    await bukaDaftar(page);
    try {
      await submitFilterEksklusif(page, { nomorLelang: 'LELANGFCU/28082026IK' });
      await expect(page.getByText('LELANGFCU/28082026IK', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
      await page.getByRole('link', { name: 'Detail Order' }).first().click({ force: true, timeout: 30_000 });
      await expect(page).toHaveURL(/\/order\/orderdetail\//, { timeout: 30_000 });
      const kembali = page.getByRole('link', { name: /Kembali/ });
      await expect(kembali).toHaveAttribute('href', /\/order\/orderlist/i, { timeout: 30_000 });
      await page.goto((await kembali.getAttribute('href'))!);
      await expect(page).toHaveURL(/\/order\/orderlist/i, { timeout: 30_000 });
      await bukaFilter(page);
      await expect(page.locator('#nomor_lelang')).toHaveValue('LELANGFCU/28082026IK');
    } finally {
      if (!/\/order\/orderlist/i.test(page.url())) await page.goto('/order/OrderList');
      await submitFilterEksklusif(page, {}).catch(() => {});
    }
  });

  test('action utama dan submenu mengikuti tahap order yang tersedia pada 100 data aktual', async ({ page }) => {
    const rows = await panenOrderAktual(page);
    const expected: Record<string, string[]> = {
      'ORDER BARU': ['Input Muatan', 'Edit Data Order', 'Edit Harga', 'Batalkan Order', 'Ganti Jadwal'],
      'PROSES PERJANJIAN': ['Input Perjanjian', 'Edit Data Muatan', 'Edit Data Order', 'Batalkan Order'],
      'PROSES VALIDASI': ['Validasi Order', 'Alihkan Order', 'Edit Data Muatan', 'Edit Data Order'],
      'KONFIRMASI UNIT': ['Input Kelengkapan Unit', 'Upload Dokumen', 'Biaya Tambahan', 'Alihkan Order'],
      'PROSES PENUGASAN': ['Lihat Data Unit', 'Upload Dokumen', 'Biaya Tambahan', 'Edit Status Order'],
      'KAPAL SANDAR': ['Proses Invoice', 'Alihkan Order', 'Edit Data Muatan', 'Edit Data Order', 'Batalkan Order', 'Ganti Jadwal'],
      'RENCANA DOORING': ['Proses Invoice', 'Alihkan Order', 'Edit Data Muatan', 'Edit Data Order', 'Batalkan Order', 'Ganti Jadwal'],
      'SJ DITERIMA AGEN': ['Proses Invoice', 'Alihkan Order', 'Edit Data Muatan', 'Edit Data Order', 'Batalkan Order', 'Ganti Jadwal'],
      'ORDER SELESAI': ['Beri Nilai Pengerjaan Transporter', 'Proses Invoice', 'Alihkan Order', 'Edit Data Muatan', 'Edit Data Order', 'Batalkan Order', 'Ganti Jadwal'],
    };

    let checked = 0;
    for (const [status, actions] of Object.entries(expected)) {
      const row = rowFor(rows, status);
      if (!row) continue;
      checked++;
      for (const action of actions) expect(row.actions, `${status}: ${row.actions.join(', ')}`).toContain(action);
    }
    expect(checked, 'Minimal delapan status harus tersedia pada 100 order aktual').toBeGreaterThanOrEqual(8);

    for (const status of ['DIBATALKAN', 'ORDER DITOLAK']) {
      const row = rowFor(rows, status);
      if (!row) continue;
      expect(row.actionDisabled, `${status} harus menonaktifkan Action Menu`).toBeTruthy();
    }
  });

  test('action terbatas tetap tampil dan memberikan alert sesuai status aktual', async ({ page }) => {
    test.setTimeout(300_000);
    await klikAksiDanHarapkanAlert(
      page, '20260316-08501', 'KAPAL BERLAYAR', 'Batalkan Order',
      /Tidak bisa batal! Order sudah melewati tahap kapal berlayar/i,
    );
    await klikAksiDanHarapkanAlert(
      page, '20260316-08501', 'KAPAL BERLAYAR', 'Alihkan Order',
      /Tidak bisa alihkan! Order sudah melewati tahap kapal berlayar/i,
    );
    await klikAksiDanHarapkanAlert(
      page, '20260316-08501', 'KAPAL BERLAYAR', 'Edit Data Muatan',
      /Tidak bisa edit! Order sudah melewati tahap kapal berlayar/i,
    );
    const berlayar = await barisOrderAktual(page, '20260316-08501', 'KAPAL BERLAYAR');
    await expect(berlayar.locator('.dropdown-menu > *').filter({ hasText: /^\s*Ganti Jadwal\s*$/i }).first())
      .toHaveAttribute('href', /\/order\/ganti_jadwal\//i);

    await klikAksiDanHarapkanAlert(
      page, '20260929-06503', 'KAPAL SANDAR', 'Ganti Jadwal',
      /Tidak bisa ganti! Order sudah melewati tahapan kapal sandar/i,
    );

    const dokumen = await barisOrderAktual(page, '20260224-02606', 'DOKUMEN DIKIRIM');
    for (const action of [
      'Proses Invoice', 'Lihat Data Unit', 'Upload Dokumen', 'Biaya Tambahan',
      'Alihkan Order', 'Edit Data Muatan', 'Edit Data Order', 'Edit Harga',
      'Batalkan Order', 'Ganti Jadwal', 'Edit Status Order',
    ]) {
      await expect(
        dokumen.locator('.dropdown-menu > *').filter({ hasText: new RegExp(`^\\s*${action}\\s*$`, 'i') }).first(),
        `${action} harus tampil pada DOKUMEN DIKIRIM`,
      ).toBeAttached();
    }
    await klikAksiDanHarapkanAlert(
      page, '20260224-02606', 'DOKUMEN DIKIRIM', 'Batalkan Order',
      /Tidak bisa batal! Order sudah melewati tahap kapal berlayar/i,
    );
    await klikAksiDanHarapkanAlert(
      page, '20260224-02606', 'DOKUMEN DIKIRIM', 'Alihkan Order',
      /Tidak bisa alihkan! Order sudah melewati tahap kapal berlayar/i,
    );
    await klikAksiDanHarapkanAlert(
      page, '20260224-02606', 'DOKUMEN DIKIRIM', 'Edit Data Muatan',
      /Tidak bisa edit! Order sudah melewati tahap kapal berlayar/i,
    );
    await klikAksiDanHarapkanAlert(
      page, '20260224-02606', 'DOKUMEN DIKIRIM', 'Ganti Jadwal',
      /Tidak bisa ganti! Order sudah melewati tahapan kapal sandar/i,
    );

    const dokumenEdit = await barisOrderAktual(page, '20260224-02606', 'DOKUMEN DIKIRIM');
    const editDataOrder = dokumenEdit.locator('a.editdataorder').filter({ hasText: /^\s*Edit Data Order\s*$/i }).first();
    await expect(editDataOrder).toHaveAttribute('href', /\/order\/edit_inputpesanan\//i);
    await dokumenEdit.getByRole('button', { name: 'Action Menu' }).click();
    await editDataOrder.click();
    await expect(page).toHaveURL(/\/order\/edit_inputpesanan\//i, { timeout: 30_000 });
  });

  test('Edit Data Order pada ORDER SELESAI tetap tampil dan memberi alert sesuai rule', async ({ page }) => {
    await klikAksiDanHarapkanAlert(
      page, '20260827-06502', 'ORDER SELESAI', 'Edit Data Order',
      /Tidak bisa edit! Order sudah tahap selesai/i,
    );
  });

  test('form tahap awal tersedia untuk Input Muatan, Perjanjian, dan Kelengkapan Unit fixture', async ({ page }) => {
    await page.goto(fixture.inputMuatan.path);
    await expect(page.getByText(/^Input Muatan$/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(`Nomor Order : ${fixture.inputMuatan.order}`, { exact: true })).toBeVisible();
    await expect(page.locator('select[name="jenis_muatan[]"]')).toBeVisible();
    await expect(page.locator('input[name="jumlah[]"]')).toHaveAttribute('placeholder', 'Jumlah Barang');
    await expect(page.locator('#file_excel')).toHaveAttribute('accept', '.xls,.xlsx');

    await page.goto(fixture.perjanjian.path);
    await expect(page.getByText(/^Perjanjian Pengiriman$/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(`Nomor Order : ${fixture.perjanjian.order}`, { exact: true })).toBeVisible();
    await expect(page.locator('#terms')).not.toBeChecked();
    await expect(page.getByPlaceholder(/Masukkan catatan tambahan/)).toBeVisible();
    await expect(page.locator('#submitonce1')).toBeVisible();

    await page.goto(fixture.unit.path);
    await expect(page.getByText(/^Input Kelengkapan Unit$/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(`Nomor Order : ${fixture.unit.order}`, { exact: true })).toBeVisible();
    for (const selector of ['#nopol1', '#nama_sopir1', '#telp_sopir1', '#no_kontainer1', '#no_segel1']) {
      await expect(page.locator(selector)).toBeVisible();
    }
    const nomorKontainer = page.locator('#no_kontainer1');
    await nomorKontainer.pressSequentially('abc 12!@#defgh456789', { delay: 10 });
    expect(await nomorKontainer.inputValue()).toMatch(/^[A-Za-z0-9]{11}$/);
  });

  test('halaman Batalkan Order, Edit Data Muatan, dan Edit Status Order dapat dibuka tanpa mutasi', async ({ page }) => {
    await bukaAksiOrder(page, fixture.inputMuatan.order, 'Batalkan Order', /\/order\/(?:batal|cancel)[^/?]*(?:[/?]|$)/i);
    await expect(page.locator('body')).toContainText(/BATAL(?:KAN)? ORDER/i);

    await bukaAksiOrder(page, fixture.perjanjian.order, 'Edit Data Muatan', /\/home\/inputmuatan\//i);
    await expect(page.getByText(/^Edit Muatan$/i).filter({ visible: true }).first()).toBeVisible();

    await bukaAksiOrder(page, fixture.tracking.order, 'Edit Status Order', /\/order\/editstatusorder\//i);
    await expect(page.locator('body')).toContainText(/EDIT STATUS ORDER/i);
  });

  test('Upload Dokumen, Biaya Tambahan invalid, dan Lihat Data Unit mengikuti fixture', async ({ page }) => {
    await page.goto(fixture.unit.upload);
    await expect(page.getByText(/^Upload Dokumen$/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(`Nomor Order : ${fixture.unit.order}`, { exact: true })).toBeVisible();
    await expect(page.getByText(/Maksimal 10 file dan ukuran maksimal per file adalah 4MB/)).toBeVisible();
    await expect(page.getByText(/File berformat \.pdf \.jpg atau \.png/)).toBeVisible();
    await expect(page.locator('#upload_file')).toBeVisible();

    await page.goto(fixture.unit.biaya);
    await expect(page.getByText(/^Biaya Tambahan$/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Tambah Biaya' }).click();
    await page.locator('input[placeholder="Masukkan Nama Item"]:visible').fill('QA INVALID ZERO');
    await page.locator('input[placeholder="Masukkan Harga"]:visible').fill('0');
    await page.locator('#tombol_simpan_bank').click();
    await expect(page.getByText('Inputan Salah', { exact: true })).toBeVisible();
    await expect(page.getByText('Tidak ada data tersedia', { exact: true }).filter({ visible: true }).first()).toBeVisible();

    await page.goto(fixture.tracking.lihatUnit);
    await expect(page.getByText(/^Data Kelengkapan Unit$/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(`Nomor Order : ${fixture.tracking.order}`, { exact: true })).toBeVisible();
    for (const label of ['Nomor Polisi', 'Nama Sopir', 'Telp. Sopir', 'Nomor Kontainer', 'Nomor Segel']) {
      await expect(page.getByText(new RegExp(`^${label}\\s*:`)).filter({ visible: true }).first()).toBeVisible();
    }
  });

  test('rating Admin menolak nilai di atas 5.0 tanpa menyimpan', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(fixture.selesai.rating, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/^Rating$/i).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('body')).toContainText(`ID Order : ${fixture.selesai.order}`);
    await expect(page.getByText(/maksimal 5\.0/i)).toBeVisible();
    await page.waitForFunction(() => {
      const jq = (window as typeof window & { jQuery?: { _data?: (el: Element, key: string) => { click?: unknown[] } } }).jQuery;
      const button = document.querySelector('#btnRatingAdmin');
      return Boolean(button && jq?._data?.(button, 'events')?.click?.length);
    }, undefined, { timeout: 30_000 });
    await page.locator('#rating_admin').fill('5.1');
    let message = '';
    page.once('dialog', async (dialog) => {
      message = dialog.message();
      await dialog.dismiss();
    });
    await page.locator('#btnRatingAdmin').click();
    await expect.poll(() => message).toBe('Penilaian rating maksimal 5.0');
    await expect(page).toHaveURL(/\/order\/order_rating\//);
  });

  test('Detail Order membuka section default sesuai status fixture', async ({ page }) => {
    const cases = [
      [fixture.inputMuatan.detail, fixture.inputMuatan.order, 'PEMESANAN'],
      [fixture.perjanjian.detail, fixture.perjanjian.order, 'PEMESANAN'],
      [fixture.unit.detail, fixture.unit.order, 'PERJANJIAN PENGIRIMAN'],
      [fixture.tracking.detail, fixture.tracking.order, 'STATUS PENGIRIMAN'],
      [fixture.selesai.detail, fixture.selesai.order, 'PENILAIAN ORDER'],
      [fixture.ditolak.detail, fixture.ditolak.order, 'PEMESANAN'],
    ] as const;

    for (const [path, order, section] of cases) {
      await page.goto(path);
      await expect(page.getByText(`ID ORDER : ${order}`, { exact: true })).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(new RegExp(section, 'i')).filter({ visible: true }).first()).toBeVisible();
    }
  });
});
