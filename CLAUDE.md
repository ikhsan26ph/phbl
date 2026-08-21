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
- Sesi server TERIKAT User-Agent (temuan 2026-08-20): cookie `.auth/<peran>.json`
  hanya valid bila UA sama persis dengan saat login (`devices['Desktop Chrome']`).
  `state-load` di playwright-cli / context tanpa UA itu selalu ditolak (redirect
  login) — dulu salah didiagnosis "storage state cepat kadaluarsa". Kalibrasi
  CLI: login lewat form saja. Sesi juga TUNGGAL per akun: login baru (mis.
  project setup saat suite jalan) menendang sesi CLI lama akun yang sama.
- Match REGEX getByText memakai teks mentah (TANPA normalisasi whitespace) —
  beda dgn match string. Label detail berpola `<div>Label <span>:</span></div>`
  → exact:true/anchor `$` gagal; pakai substring atau `\s*` di regex.
  Heading tampak kapital karena CSS text-transform, DOM-nya Title Case.

## Laporan Excel

- `npm test` → JSON reporter menulis `test-results/results.json`;
  `npm run report` → `report/hasil-testing-<tanggal>.xlsx` (exceljs).
- Workbook: sheet Ringkasan (rekap per peran) + sheet Admin / Shipper /
  Transporter / Anon. Test `setup` (login) dipetakan ke sheet peran
  masing-masing dari judulnya (`login <akun>`). `test.fail()` tampil sebagai
  "LULUS (defect terdokumentasi)".

## Run penuh 2026-08-20 (report/hasil-testing-2026-08-20.xlsx)

- 83 test: 73 lulus, 7 lulus-defect (test.fail), 2 dilewati, 1 gagal
  (aanwijzing — akar masalah ditemukan & test diperbaiki, lihat defect #6;
  pasca-perbaikan lulus 3/3 headless).

## Transporter (mulai 2026-08-20)

- `tests/transporter/pengajuan-lelang.spec.ts` — 24 test (23 lulus, 1 skip:
  tab Perlu Update Harga tanpa data demo, menu "Menuju Request Harga" belum
  terverifikasi). Read-only; kalibrasi lengkap ada di komentar spec (6 tab,
  kolom + "Shipper", penanda merah via toHaveCSS, tombol Tambah Harga
  Penawaran kondisional, PIC Muat hidden, aanwijzing retry-toPass).
- `tests/transporter/harga-jadwal.spec.ts` — 17 test (16 lulus, 1 skip: tab
  Perlu Update Harga tanpa data demo). Read-only; kalibrasi di komentar spec
  (5 tab numerik `?tab=1..5`, tombol tab duplikat desktop/mobile → `.first()`,
  kolom "Harga (Rp.)" butuh regex tanpa `\b` penutup, aksi per tab beda pola
  — beberapa via `title`/`data-original-title` [ikon tanpa teks], baris
  "Update" di tab Request Jadwal via teks polos tanpa atribut title).
  Gabungan kedua spec transporter: 41 test, 33 lulus, 2 skip, 0 gagal.
- Belum: Pengajuan Nego, Daftar Order, Penugasan Tracking, Akun Saya/Profil/
  Preference Notif (bidder), + semua alur mutasi harga & jadwal.

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
6. Detail lelang: handler klik dokumen aanwijzing (`span.modalwizing` →
   `$('#modalEditProvinsi').modal('show')`) baru di-bind setelah init WebViewer
   PDF.js Express (pihak ketiga, kadang detik-an) — klik user sebelum itu
   TERTELAN tanpa umpan balik. Test diatasi dengan retry klik (toPass);
   usulan dev: bind handler segera / beri loading state. Bonus: id modal
   `modalEditProvinsi` warisan copy-paste, bukan nama semantik.

## Langkah berikutnya (belum dikerjakan)

- Sisa modul shipper: Pengajuan Lelang (mutasi — TANYA user dulu boleh/tidak
  membuat data lelang di demo), Dashboard, Daftar Order, Cek Jadwal, Laporan, dll.
- Modul transporter (Harga & Jadwal, Daftar Order, Penugasan Tracking).
- Modul admin (Validasi Akun, Setting, Master, Pengaturan Akun — banyak mutasi).
- `.env.example` masih berisi kredensial asli — kosongkan sebelum git init.
- Folder `specs/` & `specs/_challenge/` masih kosong (tujuan belum dijelaskan user).
