# Inventaris Environment LOKAL — 2026-10-23

Target: `TARGET_ENV=local` (`http://192.168.0.88:8102`), 7 akun QA lokal.
Tahap 2 (pra-baseline), **read-only**: hanya GET halaman dan pencarian daftar
yang dipicu halaman sendiri. Tidak ada form yang disubmit dan tidak ada data
yang diubah atau dihapus. Kredensial tidak dicantumkan. Isi `phpinfo()` tidak
disimpan.

Metode: header diambil lewat `curl` dan Playwright. Inventaris per role dibuat
lewat `playwright-cli` (login form, satu skrip `run-code` read-only per akun,
`close-all` di akhir). Pemetaan spec memakai grep statis; belum ada spec yang
dijalankan ke lokal kecuali login `setup` (7/7 lulus) dan placeholder
`admin-sub-read` (1/1 lulus).

> Efek samping: login form di CLI menendang sesi `.auth/local/*.json` milik
> akun yang sama (sesi server tunggal per akun). Jalankan ulang
> `TARGET_ENV=local npx playwright test --project=setup` sebelum baseline.

## 1. Versi & fingerprint server

| Item | Hasil |
|---|---|
| `GET /user/login` (anon) | `200` |
| Halaman pasca-login (`/lelang/listLelang`, admin) | `200`, diarahkan ke `/lelang/listlelang?tab=semua-lelang` |
| `X-Powered-By` | `PHP/8.2.35` |
| `Server` | **tidak ada** |
| Pola header lain | `Host: 192.168.0.88:8102` dan `Connection: close` muncul di **respons**. Pola ini khas PHP built-in server (`php -S`), bukan nginx + PHP-FPM. Masih **indikasi**, belum terbukti. |
| `Set-Cookie` | `PHPSESSID=<…>; path=/` |
| Cookie `PHPSESSID` — HttpOnly | **tidak** |
| Cookie `PHPSESSID` — Secure | **tidak** (HTTP biasa) |
| Cookie `PHPSESSID` — SameSite | **tidak di-set eksplisit** (Chromium memakai default Lax) |
| Header keamanan (HSTS, X-Frame-Options, CSP, X-Content-Type-Options) | tidak ada |
| Asset hilang (`/_resources/tidakada.css`) | `302` ke `/notpage/notfound` (sama dengan demo) |

### Action diagnostik (catatan audit 2026-09-30)

| Route | Hasil | Keterangan |
|---|---|---|
| `GET /user/tess` (tanpa login) | **`200`, phpinfo TAMPIL** (±89 KB) | Isi tidak disimpan. Di demo route ini sudah diblokir (`404`); di lokal belum. |
| `/user/autologin` | **tidak dipanggil** | Bypass autentikasi berbasis sandi statis — di luar scope read-only. |
| `debugRachmad`, `user_lama`, 2 migrasi hak akses (`UserPage`) | **tidak dipanggil** | Berpotensi kirim push / tulis / hapus data. |
| `injectpassword`, `setToSubUserAdmin`, `update_last_status_order`, `modifyDataForRC`, `deleteFotoTracking`, `MBLoginDebug`, `killsleepprocess` (`GeneralPage`) | **tidak dipanggil** | Semuanya berpotensi menulis DB atau menghapus file. Status di lokal tidak diketahui; kemungkinan besar masih aktif (source lokal tampaknya belum di-patch). |

### Error server yang ditemukan saat inventaris

| Endpoint | Hasil | Dampak |
|---|---|---|
| `GET /home/penugasantracking` | **`500`** `[Emergency] Uncaught Error: Call to a member function FileApk() on null` | Halaman Penugasan Tracking mati untuk admin, shipper, dan transporter. Dugaan: record setting APK tidak ada di DB lokal. |
| `POST /adminprahu/searchMasterProvinsi` | **`500` setelah ±60 dtk** — `Fatal error: Maximum execution time of 30 seconds exceeded` (di monolog) | Master Provinsi menggantung di "Mohon tunggu sebentar". Pesan error memuat path absolut source (Windows), jadi `display_errors` aktif. |
| Efek antre | Saat request di atas menggantung, `GET /user/login` butuh **12 dtk** | Konsisten dengan server satu-worker: satu request lambat menahan semua request lain. **Penting untuk timeout & `workers: 1`.** |

Endpoint daftar lain merespons normal (±250–400 ms):
- `search_list_lelang`, `search_order_list`, `search_pengajuan_nego`
- `searchharga`, `searchpushnotif`, `searchpelabuhan`

## 2. Inventaris data lokal per role

### Akses & menu

| Akun (project) | Landing | Menu sidebar |
|---|---|---|
| ADMIN (`admin`) | `/lelang/listlelang?tab=semua-lelang` | Lengkap (60 item; sama dengan admin demo): Cari Penawaran, Dashboard, Analitik (5 submenu), Pengajuan Lelang, Pengajuan Nego, Daftar Order, Penugasan Tracking, Cek Jadwal, Laporan, Validasi Akun, Setting, Master, Pengaturan Akun, Akun Saya, Harga & Jadwal |
| SUB_ADMIN (`admin-sub`) | `/home/akunsaya` | **AKUN SAYA saja** |
| SUB_ADMIN_READ (`admin-sub-read`) | `/home/akunsaya` | **MASTER › Bank**, **AKUN SAYA** |
| SHIPPER (`shipper`) | `/lelang/carirute` | Cari Penawaran, Dashboard, Analitik (4 submenu), Pengajuan Lelang, Pengajuan Nego, Daftar Order, Master (Jenis Muatan, Harga Barang), Cek Jadwal, Laporan, Pengaturan Akun, Preference Notif, Akun Saya |
| SUB_SHIPPER (`shipper-sub`) | `/home/akunsaya` | **AKUN SAYA saja** |
| OPERATOR (`transporter`) | `/lelang/listlelang?tab=semua-lelang` | Pengajuan Lelang, Harga & Jadwal, Pengajuan Nego, Daftar Order, Penugasan Tracking, Profil, Pengaturan Akun, Preference Notif, Akun Saya |
| SUB_OPERATOR (`transporter-sub`) | `/home/akunsaya` | **AKUN SAYA saja** |

Ketiga sub user (selain SUB_ADMIN_READ) hanya punya **Akun Saya**. Semua
halaman lain di-redirect ke `/home/akunSaya` dengan alert `.alert_negatif`.
Di demo, sub user punya hak akses luas, jadi spec sub user demo tidak berlaku
di lokal. Halaman `/home/notification` tetap bisa dibuka semua akun.

### Jumlah data (akun yang punya akses)

| Data | admin | shipper | transporter |
|---|---|---|---|
| Lelang — Semua Lelang | 0 | 0 | 0 |
| Lelang — Perlu Input Harga | 0 | 0 | 0 |
| Lelang — Perlu Update Harga | 0 | 0 | 0 |
| Lelang — Lelang Tutup | 0 | 0 | 0 |
| Lelang — Telah Akhir Kirim | 0 | 0 | 0 |
| Lelang — Lelang Batal | 0 | 0 | 0 |
| Order (semua status, ORDER BARU s.d. ORDER SELESAI) | 0 | 0 | 0 |
| Pengajuan Nego | 0 | 0 | 0 |
| Harga & Jadwal tab 1–5 | 0 / 0 / 0 / 0 / 0 | (tidak punya akses) | 0 / 0 / 0 / 0 / 0 |
| Penugasan Tracking | **HTTP 500** | **HTTP 500** | **HTTP 500** |
| Push Notif (Belum Dibaca) | 0 | 0 | 0 |
| Analitik SCSR | 0 baris¹ | 0 baris¹ | (tidak punya akses) |
| Master Kemasan / Kontainer / DP / Include / Pelabuhan / Pelayaran / Petugas APK | 0 di semua master | — | — |
| Master Provinsi | gagal dimuat (timeout 500) | — | — |

¹ Field `tglawal`/`tglakhir` default kosong sehingga pencarian tidak memuat
apa pun. Dengan 0 order, data SCSR praktis juga nol. Push Notif sub user: 0.

"0" diverifikasi bukan kegagalan muat: XHR pencarian tiap daftar menjawab
`200` dalam <0,5 dtk dan tabel menampilkan "Tidak Ada Data yang tersedia".

### Fixture demo yang dipakai spec

| Fixture | Ada di lokal? |
|---|---|
| `AUTOTEST-FIXTURE-*` (Kemasan, Kontainer, DP, Include, Pelabuhan, Pelayaran, Petugas) | **Tidak** (semua master kosong) |
| Order `20260827-06503` | **Tidak** (0 order) |
| Lelang `LELANGFCU/28082026IK` | **Tidak** (filter nomor lelang → 0 baris) |
| Jadwal `AT-OS-1` / "AUTOTEST Kapal" | **Tidak** (Harga & Jadwal kosong; lelang induknya tidak ada) |
| Akun demo lain yang disebut spec (sub admin demo, bidder "(IK)", PT. Muda Jaya / Cipta Karya / Haier, akun yopmail QA) | Tidak diperiksa langsung; dianggap **tidak ada** karena DB lokal tanpa lelang/order. |

## 3. Pemetaan spec terhadap data lokal

Klasifikasi memakai grep statis (nomor order/lelang, fixture, hash URL, nama
perusahaan, email) ditambah hasil inventaris di atas. **Ini perkiraan sebelum
eksekusi**: belum ada spec yang dijalankan ke lokal.

### (A) Kemungkinan bisa jalan di lokal

Tidak bergantung data transaksi, hanya struktur halaman atau akun sendiri:

- `anon/login`
- `admin/akun-saya`, `shipper/akun-saya`
- `admin-sub-read/akun-saya` (placeholder, sudah lulus)
- `shipper/preference-notif`, `transporter/preference-notif`
- `admin/push-notif`, `shipper/push-notif`, `transporter/push-notif` (struktur; test yang butuh baris notifikasi kemungkinan skip)
- `admin/pengaturan-akun` (struktur + CRUD hak akses/sub user milik test sendiri)
- `admin/validasi-akun` (struktur; detail kemungkinan skip)
- `shipper/cari-penawaran` (struktur + pesan not-found)
- `admin/setting`: berisi **mutasi + revert** dan meng-assert nilai baseline demo (PPN 1,1%, PPh 2%, Rule SJ "+2 Hari"). Perlu cek nilai lokal dulu; di luar scope read-only.

### (B) Jalan, tapi kemungkinan besar skip karena data kosong

Punya `test.skip` berbasis data:

- `admin/pengajuan-lelang`, `shipper/pengajuan-lelang`, `transporter/pengajuan-lelang`
- `admin/pengajuan-nego`, `shipper/pengajuan-nego`¹, `transporter/pengajuan-nego`
- `admin/harga-jadwal`, `transporter/harga-jadwal`
- `shipper/daftar-order`, `transporter/daftar-order`
- `admin/laporan`, `shipper/laporan`
- `admin/dashboard`, `shipper/dashboard` (berisi 4 `test.fail` defect "90 hari", tetap terevaluasi)
- `shipper/analitik-scsr`
- `transporter/akun-saya` (skip file NPWP/SIUP; `test.fail` defect #10 HTTP 500 perlu dicek ulang di lokal)
- `transporter/profil`
- `admin/cek-jadwal`, `shipper/cek-jadwal`²

¹ `shipper/pengajuan-nego` juga memuat nama "PT. Bebas Ketik Apapun".
² Kedua spec Cek Jadwal meng-assert email CS `csct@prahu-hub.com` dari setting general; bisa gagal bila setting lokal berbeda.

### (C) Pasti gagal karena hardcode data/akun demo, error server, atau prasyarat

| Spec | Penyebab |
|---|---|
| `admin/daftar-order` | 9 nomor order + 8 hash `orderdetail`/`lihatdataunit`/`order_rating` demo |
| `admin/daftar-order-edit-harga` | akun sub admin demo `phbiddaratadmean@…`, OrderID 1454 |
| `admin/analitik-scsr` | order 20260625-02604 / 20260811-06501 / 20260829-02603; shipper Haier & Cipta Karya |
| `admin/invoice-nama-item`, `transporter/invoice-nama-item` | 4 + 1 nomor order demo |
| `admin/master` | 6 `AUTOTEST-FIXTURE-*` + bank terpakai "CIMB Niaga" |
| `admin/master-iklan-petugas` | `AUTOTEST-FIXTURE-PETUGAS-01`, WA fixture, PT. Muda Jaya |
| `admin/pengaturan-akun-user` | shipper/transporter demo (PT. Cipta Karya, PT. Muda Jaya) |
| `admin/validasi-akun-mutasi` | akun demo & yopmail; mutasi |
| `admin/open-stack`, `admin/open-stack-ganti-jadwal`, `shipper/open-stack`, `transporter/open-stack`, `transporter/open-stack-jadwal` | lelang `LELANGFCU/28082026IK` (id 1089), order KM. Layar/Malay, jadwal AT-OS-1 |
| `admin/cari-penawaran` | `LELANGFCU/28082026IK` + email CS |
| `admin/penugasan-tracking`, `transporter/penugasan-tracking` | **HTTP 500** `/home/penugasantracking` |
| `admin/push-notif-trigger-perubahan-jadwal`, `admin/push-notif-trigger-validasi-perjanjian` | order 20260829-06504 / 20260826-06506 / 20260929-06501 + perusahaan demo |
| `shipper/push-notif-trigger-nego` | `/home/daftarnego/991` + PT. Muda Jaya |
| `shipper/push-notif-trigger-request-harga`, `-request-jadwal`, `-perubahan-akun` | bergantung lelang/harga demo + helper `push-notif.trigger.ts` (pemetaan bidder demo) — perlu dicek |
| `transporter/push-notif-trigger-kelengkapan-unit` + 6 `push-notif-trigger-update-*` | order 20260904-06501 + `AUTOTEST-FIXTURE-PETUGASAPK-01` |
| `transporter/push-notif-trigger-jadwal-tersedia`, `-aksi-inbox` | bergantung data trigger lain — perlu dicek |
| `shipper/buat-lelang` | bidder "(IK)" + alur yopmail; mutasi |
| `shipper/nomor-referensi` | order 20210809-12092 / 20260811-06501 |
| `anon/registrasi`, `anon/lupa-kata-sandi` | inbox **yopmail** (email lokal kemungkinan tidak terkirim) + akun QA demo (`qa-tms-*`, WA 0899…) |
| `admin-sub/akun-saya`, `shipper-sub/akun-saya`, `transporter-sub/akun-saya` | meng-assert menu & Bagian Staff akun demo ("Software QC - Training", "Jumadi/Penjualan", "Sub User Bidder"); di lokal ketiganya hanya punya Akun Saya |

Tidak ada spec yang diubah pada tahap ini.

## 4. Pertanyaan untuk developer

1. **Versi PHP**: lokal `PHP/8.2.35`. Berapa versi PHP di demo dan live? Apakah lokal memang ditujukan setara?
2. **Server & pool**: apakah lokal berjalan dengan `php -S` (satu worker)? Kalau ya, adakah opsi nginx/Apache + PHP-FPM? Atau minimal `PHP_CLI_SERVER_WORKERS`? Satu request lambat (±60 dtk) menahan seluruh suite. Kalau sudah memakai PHP-FPM, berapa `pm.max_children`, dan apakah pool-nya terpisah?
3. **`max_execution_time` 30 dtk & `display_errors` aktif**: disengaja untuk lokal? Pesan error memuat path absolut source.
4. **Master Provinsi**: `searchMasterProvinsi` selalu timeout. Apakah ada query berat atau tabel besar tanpa index di DB lokal?
5. **Penugasan Tracking 500** (`FileApk() on null`): record setting APK apa yang harus ada di DB lokal?
6. **Mail catcher**: apakah ada Mailpit/MailHog/SMTP lokal? Test registrasi, lupa sandi, dan aktivasi memakai yopmail; dari lokal kemungkinan email tidak terkirim.
7. **Ketersediaan data**: DB lokal kosong (0 lelang, 0 order, 0 master). Apakah ada seed/dump (demo yang disanitasi) yang bisa dipakai? Atau QA diizinkan membuat data sendiri lewat UI (lelang → harga → order) sebagai fixture lokal?
8. **Master referensi**: apakah Provinsi, Kota, Pelabuhan, Bank, Kontainer, dan sejenisnya akan diisi? Pembuatan lelang/order butuh data ini.
9. **Hak akses sub user**: SUB_ADMIN, SUB_SHIPPER, dan SUB_OPERATOR hanya punya menu Akun Saya; SUB_ADMIN_READ hanya Master › Bank. Apakah ini konfigurasi yang dimaksud, atau grup hak aksesnya belum di-assign?
10. **Route diagnostik**: `/user/tess` menampilkan phpinfo tanpa login di lokal. Apakah patch guard yang diterapkan di demo (2026-09-30) akan dibawa ke source utama? Apakah action `UserPage`/`GeneralPage` lain juga aktif di lokal?
11. **Cookie sesi**: `PHPSESSID` tanpa HttpOnly dan tanpa SameSite eksplisit. Apakah sama di demo/live, dan apakah akan diperbaiki?
12. **reCAPTCHA**: `RECAPTCHA_SITE_KEY`/`SECRET_KEY` kosong di env lokal. Apakah registrasi lokal juga tanpa reCAPTCHA seperti demo?
