# PHBID Laut — Automation Testing (Playwright + TypeScript)

Target: https://phbidlautdemo.prahu-hub.com (TMS lelang & pengiriman laut).
Rule aplikasi: `docs/rules/<peran>/<nn>-<modul>.md` (hasil pecahan dokumen .docx;
hanya 3 peran di dokumen: bid-owner, bidder, administrator — APK SOPIR &
ADMIN SILVERSTRIPE tidak ada di dokumen sumber).

## Pemetaan istilah (JANGAN tertukar)

- Bid Owner (istilah rule) = **Shipper** (UI: "Pemilik Barang")
- Bidder (istilah rule) = **Transporter** (UI: "Ekspedisi")

## Struktur

- `playwright.config.ts` — project `setup` (login 6 akun → `.auth/<peran>.json`),
  `anon` (tanpa login), dan `admin`, `admin-sub`, `shipper`, `shipper-sub`,
  `transporter`, `transporter-sub` (dependencies setup, testMatch `tests/<nama>/`).
- Kredensial HANYA dari `.env` (lihat `.env.example`). Dilarang hardcode.
- `ADMIN_PATH=/` — admin login lewat form publik yang sama (konfirmasi user).

## Konvensi kerja (wajib)

1. **Kalibrasi dulu, jangan menebak locator.** Sebelum menulis spec, jelajahi
   halaman asli dengan `playwright-cli` (sesi `-s=<nama>`, `state-load`/
   `state-save`; TIDAK memakai `--persistent`). Cari elemen dengan `find`
   (hemat konteks), lalu ambil locator via `generate-locator <ref>` dan pakai
   **persis** hasilnya. Locator CSS/XPath tanpa role/label → laporkan sebagai
   usulan data-testid ke developer, jangan dipakai diam-diam.
2. Bukti login = elemen pasca-autentikasi `getByRole('link', { name: 'KELUAR' })`,
   BUKAN cek URL (halaman pendaratan beda-beda per akun: carirute / listlelang /
   akunsaya).
3. `fullyParallel: false` itu SENGAJA — flash message disimpan di session server
   dan semua test satu peran berbagi session login; paralel = flaky (terbukti).
4. Berhenti dan tanya bila ambigu; jangan longgar-kan assertion untuk meloloskan
   test; tempel output runner apa adanya; akhiri sesi CLI dengan `close-all`.
5. Test dengan efek samping boleh memakai inbox **yopmail** (izin user).
   Reset kata sandi: sandi baru = sandi lama agar `.env` tetap valid.

## Fakta kalibrasi penting

- Alert aplikasi = native `window.alert` (event `dialog`), teks Title Case
  (rule menulis sentence case). Pesan not-found Cari Penawaran = elemen DOM
  `role=alert`.
- Tombol Konfirmasi kode lupa-sandi hanya enable via `pressSequentially`, bukan `fill`.
- Yopmail: `#login`, `#refresh`, iframe `#ifinbox` (baris `button.lm`), `#ifmail`.
  Link "Aktifkan Akun" (Mailjet) harus diklik DARI DALAM email — goto langsung = 404.
- Tabel popup daftar lelang: baris dimuat async + tbody menyisipkan baris kosong
  pertama → tunggu lalu filter baris yang punya tombol Pilih.
- reCAPTCHA registrasi sudah DIHILANGKAN dev dari demo (2026-08-13) — alur
  registrasi penuh terotomasi. Akun QA permanen hasil kalibrasi:
  qa-tms-reg1@yopmail.com / ValidSandi123, WA 089911224455 (dipakai test WA-duplikat).
- Storage state cepat kadaluarsa di server; project setup me-refresh tiap run.

## Laporan Excel

- `npm test` → JSON reporter menulis `test-results/results.json`;
  `npm run report` → `report/hasil-testing-<tanggal>.xlsx` (exceljs).
- Workbook: sheet Ringkasan (rekap per peran) + sheet Admin / Shipper /
  Transporter / Anon. Test `setup` (login) dipetakan ke sheet peran
  masing-masing dari judulnya (`login <akun>`). `test.fail()` tampil sebagai
  "LULUS (defect terdokumentasi)".

## Run penuh 2026-08-20 (report/hasil-testing-2026-08-20.xlsx)

- 83 test: 73 lulus, 7 lulus-defect (test.fail), 2 dilewati, **1 GAGAL**:
  `shipper/pengajuan-lelang.spec.ts:165` — modal `.modal-lg-aanwijzing` tetap
  hidden 90 dtk setelah klik nama dokumen (perlu investigasi: flaky vs defect).

## Status (2026-08-13) — semua suite hijau

- `tests/auth.setup.ts` — 6 login terkalibrasi.
- `tests/anon/` — login (5), registrasi (8, termasuk alur penuh e2e email
  aktivasi), lupa-kata-sandi (2 + alur penuh kode via email; 2 fixme berbasis
  waktu >5 menit, sudah diverifikasi manual).
- `tests/shipper/cari-penawaran.spec.ts` — 5 test.

## Defect aktif (dilaporkan ke developer; terdokumentasi via test.fail())

1. Semua alert validasi registrasi DIAM (kata sandi hanya-huruf, <6 karakter,
   WA duplikat). Kandidat akar masalah: `ReferenceError: dete is not defined`
   di /user/register baris 3098.
2. Radio registrasi berlabel "Shipper/Transporter"; rule menuntut
   "Pemilik Barang/Ekspedisi".
3. Typo tombol "Kirim Ulang Email Konfigurasi Registrasi" (harusnya Konfirmasi).
4. Halaman sandi baru (lupa kata sandi): submit sandi invalid diam tanpa alert;
   heading "HI, !" tanpa nama akun.
5. Ikon popup daftar lelang tanpa accessible name (hanya `#list_lelang`) —
   usulan data-testid/aria-label. Ikon notifikasi top bar juga tanpa nama.

## Langkah berikutnya (belum dikerjakan)

- Sisa modul shipper: Pengajuan Lelang (mutasi — TANYA user dulu boleh/tidak
  membuat data lelang di demo), Dashboard, Daftar Order, Cek Jadwal, Laporan, dll.
- Modul transporter (Harga & Jadwal, Daftar Order, Penugasan Tracking).
- Modul admin (Validasi Akun, Setting, Master, Pengaturan Akun — banyak mutasi).
- `.env.example` masih berisi kredensial asli — kosongkan sebelum git init.
- Folder `specs/` & `specs/_challenge/` masih kosong (tujuan belum dijelaskan user).
