import { expect, test, type Page } from '@playwright/test';
import path from 'path';
import { aliasTransporter, bukaKonteksAkun, namaPerusahaan } from '../push-notif.trigger';

/**
 * PRECONDITION alur bisnis kritis #1 — Buat Lelang normal (Shipper) → Pilih
 * Peserta (1 Transporter fixture) → submit → lelang tampil + Push Notif.
 * Spec alur: tests/shipper/buat-lelang.spec.ts ("alur penuh …").
 * Rencana & checkpoint: report/alur-kritis-buat-lelang-2026-10-23.md.
 *
 * READ-ONLY: hanya GET halaman, membuka dropdown select2 bawaan form (data
 * dirender server, tanpa AJAX — kalibrasi lokal 2026-10-23), dan filter
 * pencarian Validasi Transporter admin. Tidak ada submit, tidak membuat data.
 *
 * Setiap test GAGAL (bukan skip) dengan daftar data yang kurang, supaya
 * kekurangan precondition tercatat sebagai penghambat, bukan hilang diam-diam.
 *
 * Dasar (docs/rules/bid-owner/08-pengajuan-lelang.md § Buat Lelang & Pilih
 * Peserta): pelabuhan dari master pelabuhan AKTIF; jenis kontainer dari master
 * jenis kontainer AKTIF; lelang normal wajib pelabuhan asal/tujuan, alamat &
 * kota asal/tujuan; peserta = bidder AKTIF (tidak dikunci/hidden).
 */

const { fixture, targetName } = require('../../scripts/targets.js');

const TARGET: string = targetName();
const AUTH_DIR = path.resolve(__dirname, '..', '..', '.auth', TARGET);

/** Opsi non-placeholder tiap select sumber form Buat Lelang (lelang normal). */
async function opsiForm(page: Page): Promise<Record<string, string[]>> {
  return page.evaluate(() => {
    const ambil = (sel: string) => {
      const el = document.querySelector<HTMLSelectElement>(sel);
      if (!el) return ['__SELECT_TIDAK_ADA__'];
      return [...el.options].filter((o) => o.value !== '').map((o) => o.text.trim());
    };
    return {
      'Pelabuhan Asal (#pelabuhan_asal)': ambil('#pelabuhan_asal'),
      'Pelabuhan Tujuan (#pelabuhan_tujuan)': ambil('#pelabuhan_tujuan'),
      'Kota Asal (#id_kota_asal)': ambil('#id_kota_asal'),
      'Kota Tujuan (#id_kota_tujuan)': ambil('#id_kota_tujuan'),
      'Jenis Kontainer (#jenis_kontainer)': ambil('#jenis_kontainer'),
    };
  });
}

test.describe('CP0/CP1 shipper — form Buat Lelang & data master', () => {
  test.use({ storageState: path.join(AUTH_DIR, 'shipper.json') });

  test('CP1: form Buat Lelang terbuka untuk shipper tanpa 5xx', async ({ page }) => {
    const res = await page.goto('/lelang/buatlelang');
    expect(res?.status(), 'status /lelang/buatlelang').toBeLessThan(500);
    await expect(page).toHaveURL(/\/lelang\/buatlelang/);
    await expect(page.getByRole('textbox', { name: 'Masukkan Nomor Lelang' })).toBeVisible();
    await expect(page.locator('.alert_negatif').filter({ visible: true })).toHaveCount(0);
  });

  test('CP0: dropdown master wajib lelang normal berisi data (dan fixture target ada di dalamnya)', async ({ page }) => {
    await page.goto('/lelang/buatlelang');
    const opsi = await opsiForm(page);
    const kurang: string[] = [];
    for (const [nama, daftar] of Object.entries(opsi)) {
      if (daftar[0] === '__SELECT_TIDAK_ADA__') kurang.push(`${nama}: elemen select tidak ditemukan`);
      else if (daftar.length === 0) kurang.push(`${nama}: 0 opsi (master kosong/tidak aktif)`);
    }
    const fx = fixture('buatLelang');
    if (fx) {
      const cek: Array<[string, string]> = [
        ['Pelabuhan Asal (#pelabuhan_asal)', fx.pelabuhanAsal],
        ['Pelabuhan Tujuan (#pelabuhan_tujuan)', fx.pelabuhanTujuan],
        ['Kota Asal (#id_kota_asal)', fx.kotaAsal],
        ['Kota Tujuan (#id_kota_tujuan)', fx.kotaTujuan],
        ['Jenis Kontainer (#jenis_kontainer)', fx.jenisKontainer],
      ];
      for (const [nama, nilai] of cek) {
        if (!(opsi[nama] ?? []).some((t) => t.toLowerCase().includes(nilai.toLowerCase()))) {
          kurang.push(`${nama}: fixture "${nilai}" tidak ada di opsi`);
        }
      }
    }
    test.info().annotations.push({
      type: 'jumlah-opsi',
      description: Object.entries(opsi).map(([k, v]) => `${k}=${v[0] === '__SELECT_TIDAK_ADA__' ? 'tidak ada' : v.length}`).join('; '),
    });
    expect(kurang, `Data master Buat Lelang kurang di target ${TARGET}`).toEqual([]);
  });
});

test('CP0: fixture pilihan master alur Buat Lelang ditetapkan untuk target ini', () => {
  expect(
    fixture('buatLelang'),
    `FIXTURES.${TARGET}.buatLelang di scripts/targets.js masih null — isi setelah master tersedia & dikonfirmasi`,
  ).not.toBeNull();
});

test('CP0: transporter fixture terdaftar AKTIF beralias di Validasi Transporter admin', async ({ browser }) => {
  test.setTimeout(120_000);
  const transporterCtx = await bukaKonteksAkun(browser, 'transporter', process.env.TRANSPORTER_EMAIL);
  const adminCtx = await bukaKonteksAkun(browser, 'admin', process.env.ADMIN_EMAIL);
  try {
    let perusahaan = '';
    try {
      perusahaan = await namaPerusahaan(transporterCtx);
    } catch (e) {
      throw new Error(`Nama Perusahaan transporter fixture tidak terbaca di Akun Saya: ${(e as Error).message.split('\n')[0]}`);
    }
    test.info().annotations.push({ type: 'perusahaan-transporter', description: perusahaan || '(kosong)' });
    expect(perusahaan, 'Nama Perusahaan transporter fixture kosong').not.toBe('');
    // aliasTransporter: filter email exact di /home/bidder, wajib 1 baris AKTIF
    // milik perusahaan yang sama, alias tidak kosong (dipakai di Pilih Peserta).
    const alias = await aliasTransporter(adminCtx, process.env.TRANSPORTER_EMAIL!, perusahaan);
    test.info().annotations.push({ type: 'alias-transporter', description: alias });
  } finally {
    await transporterCtx.close();
    await adminCtx.close();
  }
});
