import { expect, test, type Page } from '@playwright/test';

/**
 * Modul: Setting (Administrator) — project "admin" (storageState .auth/admin.json).
 * Rule: docs/rules/administrator/12-setting.md. Izin mutasi demo dari user
 * (2026-08-29): test mengubah nilai lalu MENGEMBALIKANNYA di finally
 * (flag mutasi di-set saat Simpan diklik).
 *
 * Kalibrasi ke halaman asli 2026-08-29 via playwright-cli (login admin):
 * - General /adminprahu/setting_general: 4 seksi (VERSI SISTEM, KONTAK,
 *   SOSIAL MEDIA, EMAIL ADMIN), semua input disabled (tampilan baca), link
 *   "Edit data" per seksi → /adminprahu/setting_versi_sistem (input
 *   versi_web, versi_apk, copyright_apk; Simpan #submit_kelas),
 *   /setting_kontak, /setting_sosmed. Textlink span.link_2 "List Email" →
 *   modal #modal_list_email_admin "LIST NOTIFIKASI EMAIL" (catatan Bcc,
 *   "Tanggal Setting Terakhir", daftar notif, label "Tidak Aktif" pada yang
 *   dimatikan), "List Push Notif" → #modal_list_email_admin_sistem, "Setting
 *   Preference" → /adminprahu/settingPreferenceAdmin (dua .tab-pane
 *   NOTIFIKASI SISTEM 26 checkbox & NOTIFIKASI EMAIL 27 checkbox saat
 *   kalibrasi; Kembali/Batal/Simpan). Versi Web tampil di footer semua
 *   halaman; WhatsApp CS di sidebar ("KONTAK KAMI").
 * - S&K Booking /adminprahu/syaratdanketentuan: isi S&K + tombol Setting →
 *   /adminprahu/settingsyaratdanketentuan ("Terakhir Update : dd/mm/yyyy
 *   hh:mm" atau "-", editor teks, tombol Preview #preview_booking, Batal,
 *   Simpan #submit_sub).
 * - Reminder /adminprahu/reminder: tabel Tugas Tracking | Berulang Setiap |
 *   Trigger by | Rule Trigger | Status Reminder | Aksi; baris di UI hanya 6
 *   (Stuffing, Kapal Berlayar, Kapal Sandar, Rencana Dooring, Dooring, SJ
 *   Diterima Agen) — rule menyebut 8 trigger (Ambil Kontainer & Dokumen
 *   Dikirim TIDAK ada di UI). Setting → /adminprahu/settingReminder/<hash>:
 *   Berulang Setiap & Trigger by disabled, Rule Trigger input number, Status
 *   select (aktif/tidak_aktif), Simpan #submitonce1 → alert "Anda berhasil
 *   setting Rule Reminder".
 * - Setting Notifikasi /adminprahu/settingNotifonof: 3 baris Push/Email/
 *   WhatsApp berstatus ON/OFF; tombol Setting (button.btn-blue, ada duplikat
 *   mobile hidden) → modal #modalEditProvinsi (id warisan) berisi 3 switch
 *   checkbox.switch_buat_invoice, Simpan #simpan.
 * - Setting Pajak /adminprahu/settingpajak: tabel Nama Item | Nilai | Aksi,
 *   baris PPN & PPh; tombol Setting (onclick settingpajak(id,nama,nilai);
 *   atribut href-nya sisa copy-paste ke settingReminder) → modal
 *   #modalEditProvinsi (#nama disabled, #nilai, Simpan #simpan) → alert
 *   "Anda berhasil setting pajak".
 *
 * TIDAK dicakup: efek versi/WA/sosmed pada email & APK, cron reminder jam 5,
 * pengiriman notif nyata, efek nilai pajak ke halaman harga (lintas peran).
 */

const alertSukses = (page: Page, teks: RegExp) => page.getByRole('alert').filter({ hasText: teks });

function pasangDialog(page: Page): void {
  page.on('dialog', (d) => d.accept());
}

test.describe('Setting General (Admin)', () => {
  // Mutasi + revert di finally: timeout default 60 dtk pernah memutus revert
  // (Rule Reminder tersisa +3 Hari, 2026-08-29) → beri 3x waktu.
  test.slow();
  test('menampilkan seksi versi, kontak, sosial media, dan satu email admin dalam mode baca', async ({ page }) => {
    await page.goto('/adminprahu/setting_general');
    for (const seksi of ['VERSI SISTEM', 'KONTAK', 'SOSIAL MEDIA', 'EMAIL ADMIN']) {
      await expect(page.getByText(seksi, { exact: true }).first()).toBeVisible();
    }
    for (const label of ['Versi Web', 'Versi APK Tracking', 'Copyright APK Tracking', 'WhatsApp CS', 'Telp. CS', 'Email CS', 'Facebook', 'Twitter', 'Instagram', 'Youtube', 'Linkedin']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }
    // Rule: email admin utama hanya satu; input lain tidak bisa diedit langsung.
    await expect(page.locator('input[name="email_admin"]')).toHaveCount(1);
    await expect(page.locator('input[name="email_admin"]')).toBeDisabled();
    await expect(page.locator('input[name="email_admin"]')).toHaveValue(process.env.ADMIN_EMAIL!);
    await expect(page.locator('input[name="wa"]:enabled')).toHaveCount(0);

    const editData = page.getByRole('link', { name: 'Edit data' });
    await expect(editData).toHaveCount(3);
    await expect(editData.nth(0)).toHaveAttribute('href', /\/adminprahu\/setting_versi_sistem$/);
    await expect(editData.nth(1)).toHaveAttribute('href', /\/adminprahu\/setting_kontak$/);
    await expect(editData.nth(2)).toHaveAttribute('href', /\/adminprahu\/setting_sosmed$/);
  });

  test('versi web tampil di footer dan WhatsApp CS tampil di sidebar', async ({ page }) => {
    await page.goto('/adminprahu/setting_general');
    const versiWeb = (await page.locator('input[name="wa"]').first().inputValue()).trim();
    const waCs = (await page.locator('input[name="wa"]').nth(3).inputValue()).trim();
    expect(versiWeb).not.toBe('');
    await expect(page.locator('footer, .app-footer').first()).toContainText(versiWeb);
    await expect(page.getByText(waCs).first()).toBeVisible();
  });

  test('textlink List Email dan List Push Notif membuka popup daftar notifikasi admin', async ({ page }) => {
    await page.goto('/adminprahu/setting_general');
    await page.locator('span.link_2', { hasText: 'List Email' }).click();
    const modalEmail = page.locator('#modal_list_email_admin');
    await expect(modalEmail).toBeVisible();
    await expect(modalEmail).toContainText('LIST NOTIFIKASI EMAIL');
    await expect(modalEmail).toContainText('Tanggal Setting Terakhir');
    await expect(modalEmail).toContainText(/Notif to Admin\s*:/);
    // Modal tidak menutup dengan Escape (backdrop static) → tombol tutup (×).
    await modalEmail.locator('[data-dismiss="modal"], button.close').first().click();
    await expect(modalEmail).toBeHidden();

    await page.locator('span.link_2', { hasText: 'List Push Notif' }).click();
    const modalPush = page.locator('#modal_list_email_admin_sistem');
    await expect(modalPush).toBeVisible();
    await expect(modalPush).toContainText(/NOTIFIKASI|Notif/i);
  });

  test('Setting Preference admin memuat seksi Notifikasi Sistem dan Email berisi checkbox', async ({ page }) => {
    await page.goto('/adminprahu/setting_general');
    await expect(page.getByRole('link', { name: 'Setting Preference' })).toHaveAttribute('href', /\/adminprahu\/settingPreferenceAdmin$/);
    await page.goto('/adminprahu/settingPreferenceAdmin');
    for (const judul of ['NOTIFIKASI SISTEM', 'NOTIFIKASI EMAIL']) {
      const pane = page.locator('.tab-pane').filter({ hasText: judul });
      expect(await pane.getByRole('checkbox').count()).toBeGreaterThan(0);
    }
    await expect(page.getByRole('button', { name: /Simpan/ })).toBeVisible();
  });

  test('Edit Versi Sistem: mengubah Versi Web tercermin di footer, lalu dikembalikan (mutasi)', async ({ page }) => {
    pasangDialog(page);
    await page.goto('/adminprahu/setting_versi_sistem');
    const input = page.locator('input[name="versi_web"]');
    const semula = await input.inputValue();
    expect(semula).not.toBe('');
    const baru = `${semula} AUTOTEST`;
    let bermutasi = false;
    try {
      await input.fill(baru);
      await page.locator('#submit_kelas').click();
      bermutasi = true;
      await expect(page).toHaveURL(/\/adminprahu\/setting_general$/, { timeout: 20_000 });
      await expect(alertSukses(page, /berhasil/i)).toBeVisible();
      await expect(page.locator('input[name="wa"]').first()).toHaveValue(baru);
      await expect(page.locator('footer, .app-footer').first()).toContainText('AUTOTEST');
    } finally {
      if (bermutasi) {
        await page.goto('/adminprahu/setting_versi_sistem');
        await input.fill(semula);
        await page.locator('#submit_kelas').click();
        await expect(page).toHaveURL(/\/adminprahu\/setting_general$/, { timeout: 20_000 });
        await expect(page.locator('input[name="wa"]').first()).toHaveValue(semula);
      }
    }
  });
});

test.describe('Setting S&K Booking (Admin)', () => {
  test('halaman menampilkan isi S&K, tombol Setting menuju editor dengan Terakhir Update dan Preview', async ({ page }) => {
    await page.goto('/adminprahu/syaratdanketentuan');
    await expect(page.getByText('Syarat & Ketentuan tampil pada halaman input pesanan')).toBeVisible();
    // "Setting" juga nama menu sidebar & tombol dobel desktop/mobile → tombol a.btn pertama.
    const setting = page.locator('a.btn', { hasText: /^\s*Setting\s*$/ }).first();
    await expect(setting).toHaveAttribute('href', /\/adminprahu\/settingsyaratdanketentuan$/);
    await setting.click();
    await expect(page).toHaveURL(/\/adminprahu\/settingsyaratdanketentuan$/);
    // Rule: terakhir update = waktu admin mengubah; strip bila belum pernah.
    await expect(page.getByText(/Terakhir Update\s*:\s*(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}|-)/)).toBeVisible();
    await expect(page.locator('#preview_booking')).toBeVisible();
    await expect(page.locator('#submit_sub')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Batal' })).toBeVisible();
  });
});

test.describe('Setting Reminder (Admin)', () => {
  // Mutasi + revert di finally: timeout default 60 dtk pernah memutus revert
  // (Rule Reminder tersisa +3 Hari, 2026-08-29) → beri 3x waktu.
  test.slow();
  const TUGAS_UI = ['Stuffing', 'Kapal Berlayar', 'Kapal Sandar', 'Rencana Dooring', 'Dooring', 'SJ Diterima Agen'];

  test('tabel rule reminder memuat kolom dan tugas tracking yang tersedia di UI', async ({ page }) => {
    await page.goto('/adminprahu/reminder');
    for (const kolom of ['Tugas Tracking', 'Berulang Setiap', 'Trigger by', 'Rule Trigger', 'Status Reminder', 'Aksi']) {
      await expect(page.getByRole('columnheader', { name: kolom })).toBeVisible();
    }
    for (const tugas of TUGAS_UI) {
      const baris = page.locator('table tbody tr').filter({ hasText: tugas }).first();
      await expect(baris).toContainText(/\+ \d+ Hari/);
      await expect(baris).toContainText(/AKTIF|TIDAK AKTIF/);
      await expect(baris.getByRole('link', { name: 'Setting' })).toHaveAttribute('href', /\/adminprahu\/settingReminder\/.+/);
    }
  });

  test('rule menyebut 8 trigger reminder termasuk Ambil Kontainer dan Dokumen Dikirim (DEFECT: UI hanya 6)', async ({ page }) => {
    test.fail(true, 'DISKREPANSI 2026-08-29: rule 12-setting § Reminder mendaftar 8 tugas; UI hanya 6 — Ambil Kontainer & Dokumen Dikirim tidak ada');
    await page.goto('/adminprahu/reminder');
    await expect(page.locator('table tbody tr').filter({ hasText: 'Ambil Kontainer' })).toHaveCount(1);
    await expect(page.locator('table tbody tr').filter({ hasText: 'Dokumen Dikirim' })).toHaveCount(1);
  });

  test('halaman Setting Rule Reminder bisa dibuka langsung lewat URL (DEFECT: bergantung HTTP_REFERER)', async ({ page }) => {
    test.fail(true, 'DEFECT #12 2026-08-29: goto langsung /adminprahu/settingReminder/<hash> (tanpa referer) → "[Warning] Undefined array key HTTP_REFERER" + stack trace, form tidak dirender');
    await page.goto('/adminprahu/reminder');
    const href = await page.locator('table tbody tr').filter({ hasText: 'Stuffing' }).first().getByRole('link', { name: 'Setting' }).getAttribute('href');
    await page.goto(href!);
    await expect(page.getByText('Undefined array key')).toHaveCount(0);
    await expect(page.locator('input[type="number"]')).toBeVisible();
  });

  test('Setting: hanya rule trigger dan status yang bisa diubah; perubahan tersimpan lalu dikembalikan (mutasi)', async ({ page }) => {
    test.setTimeout(420_000);
    pasangDialog(page);
    await page.goto('/adminprahu/reminder');
    const baris = page.locator('table tbody tr').filter({ hasText: 'SJ Diterima Agen' }).first();
    await baris.getByRole('link', { name: 'Setting' }).click();
    await expect(page).toHaveURL(/\/adminprahu\/settingReminder\/.+/);

    // Atribut type input kosong di app ini → jangan filter [type=text].
    const disabled = page.locator('input:disabled').filter({ visible: true });
    await expect(disabled).toHaveCount(2); // Berulang Setiap & Trigger by (rule: tidak bisa diubah)
    const trigger = page.locator('input[type="number"]');
    const status = page.locator('select');
    await expect(trigger).toBeEditable();
    await expect(status).toBeEditable();
    const semula = await trigger.inputValue();
    const baru = String(Number(semula) + 1);
    const barisSJ = () => page.locator('table tbody tr').filter({ hasText: 'SJ Diterima Agen' }).first();
    /** Simpan nilai Rule Trigger lewat klik dari daftar (bukan goto — defect #12) & tunggu redirect. */
    const simpanTrigger = async (nilai: string) => {
      await page.goto('/adminprahu/reminder');
      await barisSJ().getByRole('link', { name: 'Setting' }).click();
      await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 30_000 });
      await page.locator('input[type="number"]').fill(nilai);
      await page.locator('#submitonce1').click();
      // Server demo kadang >20 dtk memproses simpan (run 2026-08-29: POST
      // tersimpan tapi redirect lewat 20 dtk) → tunggu lama.
      await expect(page).toHaveURL(/\/adminprahu\/reminder$/, { timeout: 90_000 });
    };
    let bermutasi = false;
    try {
      await trigger.fill(baru);
      await page.locator('#submitonce1').click();
      bermutasi = true;
      await expect(page).toHaveURL(/\/adminprahu\/reminder$/, { timeout: 90_000 });
      await expect(alertSukses(page, /Anda berhasil setting Rule Reminder/i)).toBeVisible();
      await expect(barisSJ()).toContainText(`+ ${baru} Hari`);
    } finally {
      if (bermutasi) {
        // Revert dgn verifikasi sungguhan (reload) + satu kali ulang bila
        // belum kembali — drift +3 Hari pernah terjadi 2x (2026-08-29).
        for (let percobaan = 1; percobaan <= 2; percobaan++) {
          await simpanTrigger(semula).catch(() => {});
          await page.goto('/adminprahu/reminder');
          if ((await barisSJ().innerText()).includes(`+ ${semula} Hari`)) break;
        }
        await expect(barisSJ()).toContainText(`+ ${semula} Hari`);
      }
    }
  });
});

test.describe('Setting Notifikasi (Admin)', () => {
  // Mutasi + revert di finally: timeout default 60 dtk pernah memutus revert
  // (Rule Reminder tersisa +3 Hari, 2026-08-29) → beri 3x waktu.
  test.slow();
  const barisStatus = (page: Page, nama: string) => page.getByText(new RegExp(`${nama}\\s+(ON|OFF)`)).first();

  test('menampilkan status ON/OFF untuk Push Notifikasi, Notifikasi Email, dan Notifikasi Whatsapp', async ({ page }) => {
    await page.goto('/adminprahu/settingNotifonof');
    await expect(page.getByText('Setting notifikasi email dan whatsapp untuk menghemat kuota saat simulasi sistem')).toBeVisible();
    for (const nama of ['Push Notifikasi', 'Notifikasi Email', 'Notifikasi Whatsapp']) {
      await expect(barisStatus(page, nama)).toBeVisible();
    }
    await page.locator('button.btn-blue', { hasText: 'Setting' }).click();
    const modal = page.locator('#modalEditProvinsi');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('SETTING NOTIFIKASI');
    await expect(modal.locator('input.switch_buat_invoice')).toHaveCount(3);
  });

  test('menonaktifkan Notifikasi Email via switch berubah menjadi OFF, lalu diaktifkan kembali (mutasi)', async ({ page }) => {
    pasangDialog(page);
    await page.goto('/adminprahu/settingNotifonof');
    const bukaModal = async () => {
      await page.locator('button.btn-blue', { hasText: 'Setting' }).click();
      await expect(page.locator('#modalEditProvinsi')).toBeVisible();
      return page.locator('#modalEditProvinsi input.switch_buat_invoice').nth(1); // urutan: Push, Email, WhatsApp
    };
    const switchEmail = await bukaModal();
    const semulaAktif = await switchEmail.isChecked();
    // Checkbox switch disembunyikan CSS; yang diklik adalah pembungkus/slider-nya.
    const toggle = async (sw: ReturnType<typeof page.locator>, target: boolean) => {
      if ((await sw.isChecked()) !== target) await sw.locator('..').click();
      await expect(sw).toBeChecked({ checked: target });
    };
    let bermutasi = false;
    try {
      await toggle(switchEmail, !semulaAktif);
      await page.locator('#modalEditProvinsi #simpan').click();
      bermutasi = true;
      await expect(alertSukses(page, /berhasil/i)).toBeVisible({ timeout: 20_000 });
      await expect(barisStatus(page, 'Notifikasi Email')).toHaveText(new RegExp(semulaAktif ? 'OFF' : 'ON'));
    } finally {
      if (bermutasi) {
        await page.goto('/adminprahu/settingNotifonof');
        const sw = await bukaModal();
        await toggle(sw, semulaAktif);
        await page.locator('#modalEditProvinsi #simpan').click();
        await expect(alertSukses(page, /berhasil/i)).toBeVisible({ timeout: 20_000 });
        await expect(barisStatus(page, 'Notifikasi Email')).toHaveText(new RegExp(semulaAktif ? 'ON' : 'OFF'));
      }
    }
  });
});

test.describe('Setting Pajak (Admin)', () => {
  // Mutasi + revert di finally: timeout default 60 dtk pernah memutus revert
  // (Rule Reminder tersisa +3 Hari, 2026-08-29) → beri 3x waktu.
  test.slow();
  test('tabel menampilkan PPN dan PPh dengan nilai persen dan tombol Setting', async ({ page }) => {
    await page.goto('/adminprahu/settingpajak');
    for (const kolom of ['Nama Item', 'Nilai', 'Aksi']) {
      await expect(page.getByRole('columnheader', { name: kolom })).toBeVisible();
    }
    for (const item of ['PPN', 'PPh']) {
      const baris = page.locator('table tbody tr').filter({ hasText: new RegExp(`^\\s*${item}\\b`) }).first();
      await expect(baris).toContainText(/\d+(,\d+)?%/);
      await expect(baris.getByRole('button', { name: 'Setting' })).toBeVisible();
    }
  });

  test('Setting PPh: nama item terkunci, nilai bisa diubah dan tersimpan, lalu dikembalikan (mutasi)', async ({ page }) => {
    pasangDialog(page);
    await page.goto('/adminprahu/settingpajak');
    const barisPPh = () => page.locator('table tbody tr').filter({ hasText: /^\s*PPh\b/ }).first();
    const modal = page.locator('#modalEditProvinsi');
    const bukaModal = async () => {
      await barisPPh().getByRole('button', { name: 'Setting' }).click();
      await expect(modal).toBeVisible();
      await expect(modal.locator('#nama')).toBeDisabled();
      await expect(modal.locator('#nama')).toHaveValue('PPh');
    };
    await bukaModal();
    const semula = await modal.locator('#nilai').inputValue();
    const baru = `${semula},5`.replace(',5,5', ',5');
    let bermutasi = false;
    try {
      await modal.locator('#nilai').fill(baru);
      await modal.locator('#simpan').click();
      bermutasi = true;
      await expect(alertSukses(page, /Anda berhasil setting pajak/i)).toBeVisible({ timeout: 20_000 });
      await expect(barisPPh()).toContainText(`${baru}%`);
    } finally {
      if (bermutasi) {
        await page.goto('/adminprahu/settingpajak');
        await bukaModal();
        await modal.locator('#nilai').fill(semula);
        await modal.locator('#simpan').click();
        await expect(alertSukses(page, /Anda berhasil setting pajak/i)).toBeVisible({ timeout: 20_000 });
        await expect(barisPPh()).toContainText(`${semula}%`);
      }
    }
  });
});
