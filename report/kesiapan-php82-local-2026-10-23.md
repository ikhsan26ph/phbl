# Kesiapan Pengujian Pasca-Pembaruan PHP 8.2.35 — Target LOKAL

Tanggal: Jumat, 23 Oktober 2026
Target: `TARGET_ENV=local` (`http://192.168.0.88:8102`)
Suite: commit `0fd24cd` + perubahan lokal belum di-commit (lihat § 2)
Cakupan tindakan: read-only. Tidak ada data bisnis yang dibuat, diubah, atau
dihapus. Tidak ada test ke demo/produksi, tidak ada perubahan backend/server.

> **Koreksi 2026-10-23 (lanjutan):** sebagian interpretasi di laporan ini
> dikoreksi di `report/tindak-lanjut-php82-local-2026-10-23.md` § 2. Koreksi
> itu mencakup: php -v CLI bukan bukti runtime web; phpinfo bukan alat
> verifikasi patch; display_errors belum diverifikasi; `--list` bukan
> type-check; tidak ada durasi monitoring baku. Angka "103 hasil / 78 passed"
> adalah tampilan turunan dari dua run, bukan satu run (rekonsiliasi per run
> di § 1 dokumen itu). Baris yang terdampak di bawah sudah diperbarui.

> **Status keputusan: BELUM SIAP untuk regresi alur bisnis maupun rilis.**
> Smoke read-only sudah siap dipakai sebagai gerbang awal. Alur bisnis kritis
> belum dapat diuji karena data lokal kosong, ada HTTP 500 di Penugasan
> Tracking, dan hak akses sub user belum dikonfirmasi. Bukti deployment patch
> juga belum ada. Hasil Playwright yang hijau **bukan** bukti bahwa kerentanan
> sudah tertutup.

Hasil lokal adalah **baseline pada versi tujuan (PHP 8.2.35)**, bukan baseline
sebelum upgrade. Demo **tidak** dapat dipakai sebagai pembanding
sebelum/sesudah: build, data, hak akses role, dan konfigurasinya terbukti
berbeda atau belum diketahui (§ 3).

Bukti mentah (sudah diredaksi, tanpa password/cookie/isi phpinfo):
`report/evidence-local-2026-10-23/`
- `readiness-sebelum-setup.json`: pemeriksaan kesiapan.
- `ringkasan-run.json`: status, error, dan metadata setiap run.
- `klasifikasi-skenario.json`: 529 skenario.

Laporan Excel: `report/kesiapan-php82-local-2026-10-23.xlsx` dan
`report/hasil-testing-2026-10-23-1446-local.xlsx` (run gabungan) /
`-1458-local.xlsx` (smoke final).

---

## 1. Kondisi yang terverifikasi vs belum diketahui

| Terverifikasi (dengan evidence) | Belum diketahui |
|---|---|
| Repo `main` @ `0fd24cd`; tidak ada file tracked yang berubah sebelum pekerjaan ini; `.env*` (kecuali `.env.example`) dan `.auth/` di-ignore | Build/commit aplikasi lokal, demo, dan kandidat rilis |
| `X-Powered-By: PHP/8.2.35` di lokal | SAPI/web server lokal (`php -S`? PHP-FPM?), daftar extension, `php.ini` |
| 7 akun lokal login lulus 7/7; sesi dipakai ulang lulus 7/7 (smoke) | Versi PHP CLI untuk cron/queue; ada tidaknya queue/worker |
| Cookie `PHPSESSID`: HttpOnly=false, Secure=false, SameSite tidak di-set | Versi database & dependency backend (SilverStripe, composer.lock) |
| `/user/tess` tanpa login → HTTP 200 + phpinfo | Ketersediaan log backend (tidak ada akses) |
| `/home/penugasantracking` → HTTP 500 (admin & transporter), dua run | Penyebab 500: defect kode, data setting, atau runtime |
| Master Provinsi: **HTTP 500 benar-benar diterima** setelah ±60 dtk dengan body `Fatal error: Maximum execution time of 30 seconds exceeded`; bukan timeout request/Playwright (request timeout 90 dtk) | Versi PHP produksi saat ini; versi PHP demo saat ini |
| Data lokal kosong (0 lelang/order/nego/master/notif) | Mail catcher / SMTP lokal |
| Pembanding pra-upgrade: pool demo & live memakai `php8.1-fpm` (konfigurasi server dibaca 2026-09-30, `report/hasil-pengecekan-demo-2026-09-30.md`) | Versi patch 8.1.x tersebut & apakah masih berlaku saat ini |

## 2. File yang diubah/ditambah

| File | Status | Tujuan |
|---|---|---|
| `scripts/targets.js` | baru | Sumber tunggal daftar 7 akun + status **wajib/opsional** per target (local: 7 wajib; demo: 6 wajib, admin-sub-read opsional) |
| `tests/auth.setup.ts` | ubah | Akun WAJIB yang kredensialnya kosong → **gagal** sebagai penghambat kesiapan (bukan skip); akun opsional tetap skip |
| `playwright.config.ts` | ubah | Run ID per run (`PW_RUN_ID`); output `test-results/<target>/runs/<runId>/` & HTML `playwright-report/<target>/<runId>/` agar bukti run sebelumnya/kegagalan pertama tidak terhapus; metadata run (target, runId, versi suite git, `APP_BUILD`/`APP_RUNTIME`/`DATASET` atau "Belum diketahui"); project baru `smoke` |
| `tests/smoke/read-only.spec.ts` | baru | 32 skenario smoke READ-ONLY: pemakaian ulang sesi 7 role, halaman inti akun utama tanpa 5xx/penolakan/request menggantung, penolakan Edit Akun Saya untuk sub user |
| `scripts/readiness-check.js` | baru | `npm run readiness`: TARGET_ENV wajib eksplisit; cek env/akun wajib/host/sesi + GET pasif `/user/login` & `/user/tess` (lokal saja); bukti JSON tanpa rahasia |
| `scripts/klasifikasi-skenario.js` | baru | Klasifikasi statis per skenario (6 kategori) + kolom hasil eksekusi |
| `scripts/generate-report.js` | ubah | Baca run terbaru (urut waktu, bukan nama) atau `PW_RUN_ID`; metadata run di sheet Ringkasan; catat **kegagalan pertama** pada test flaky; anotasi runtime (http-5xx) ikut tercatat; peran untuk project smoke |
| `package.json` | ubah | Script `readiness` |
| `CLAUDE.md` | ubah | Ringkasan tahap inventaris & kesiapan PHP 8.2 |
| `report/kesiapan-php82-local-2026-10-23.{md,xlsx}`, `report/evidence-local-2026-10-23/` | baru | Laporan & bukti tahap ini |

Tidak ada spec lama yang diubah. Tidak ada assertion yang dilonggarkan dan tidak
ada kegagalan yang diubah menjadi skip.

## 3. Matriks kesiapan & kebutuhan pembanding

| Item | Evidence | Status | Dampak pengujian | Tindak lanjut | Pihak yang perlu mengonfirmasi |
|---|---|---|---|---|---|
| Versi PHP asal (sebelum upgrade) | Pool demo/live `php8.1-fpm` (dibaca 2026-09-30) | Sebagian: minor 8.1 diketahui, patch & kondisi kini belum | Tidak ada baseline perilaku pra-upgrade | Konfirmasi versi persis & tanggal upgrade per instance | DevOps |
| PHP lokal (tujuan) | `X-Powered-By: PHP/8.2.35` | Indikasi (header, bisa dimatikan/diubah) | Hasil lokal = baseline versi tujuan | Bukti runtime **web/FPM** (binary pool aktif, SAPI dari request web sah); `php -v` CLI hanya untuk cron/CLI, bukan bukti tunggal | DevOps |
| Build/commit aplikasi lokal, demo, kandidat rilis | Tidak ada penanda build di UI/header | Belum diketahui | Hasil tidak bisa dikaitkan ke rilis; demo tak bisa jadi pembanding | Sediakan commit/tag per instance; isi `APP_BUILD` saat run | Dev |
| Web server / SAPI | Respons tanpa `Server`, memuat `Host:` & `Connection: close`; login 12 dtk saat request lambat berjalan | Belum diketahui (indikasi `php -S`) | Satu request lambat menahan suite → wajib 1 worker; hasil performa lokal tak mewakili produksi | Konfirmasi SAPI & jumlah worker | DevOps |
| Extension & `php.ini` (max_execution_time, display_errors, session.cookie_*) | Pesan error menyebut batas 30 dtk; response memuat detail error + path (konfigurasi `display_errors` **belum diverifikasi**: bisa juga mode dev framework) | Sebagian/inferensi | Perbedaan ini mengubah perilaku error & cookie | Ekspor `php -m` + ini terkait (tanpa secret) dari lokal, staging, produksi | DevOps |
| Database & dependency backend | Halaman error menyebut SilverStripe & monolog | Belum diketahui | Kompatibilitas library dengan 8.2 belum terbukti | Versi DB, `composer.lock`, versi framework | Dev |
| Cron/queue/CLI | Demo: cron `/general/deletelogdata` (2026-09-30); lokal: tidak diketahui; halaman memanggil WebSocket | Belum diketahui | Job terjadwal bisa jalan di PHP CLI versi lain | Daftar cron/worker + versi PHP CLI-nya | DevOps |
| Data uji | Lokal: 0 lelang/order/nego/master/notif | Tidak tersedia | ±258 skenario menunggu data; 6 test Push Notif gagal precondition | Seed/dump tersanitasi atau izin membuat dataset lewat UI (§ 7) | Dev/BA + pemilik produk |
| Matriks role | 7/7 login; sub user hanya Akun Saya (admin-sub-read: + Master › Bank) | Tersedia, hak akses sub user belum dikonfirmasi | 10 test sub user gagal karena ekspektasi demo | Konfirmasi hak akses yang dimaksud per sub user | BA/Admin aplikasi |
| Kesetaraan demo ↔ lokal | Build, data, hak akses, konfigurasi berbeda/tidak diketahui | Tidak setara | Demo **tidak sah** sebagai pembanding sebelum/sesudah | Gunakan staging setara produksi untuk pembanding | DevOps/QA |
| Log backend | Tidak ada akses | Tidak tersedia | Penyebab HTTP 500 tidak bisa dibuktikan | Akses baca/ekspor log aplikasi & PHP untuk jendela run | DevOps |
| Mail (registrasi, lupa sandi) | Suite memakai yopmail publik | Belum diketahui | Alur email tidak teruji di lokal | Mail catcher lokal atau izin memakai inbox eksternal | DevOps |
| Bukti deployment patch | Lokal `/user/tess` masih menampilkan phpinfo (guard demo 2026-09-30 tidak ada di lokal) | Tidak ada | Tidak bisa dinyatakan patch terpasang | Bukti per instance: commit, waktu deploy, restart PHP-FPM/worker, `php -v` | Dev/DevOps |

## 4. Perintah yang dijalankan & hasil aktual

| Perintah (ringkas) | Hasil |
|---|---|
| `node --check scripts/{readiness-check,targets,generate-report,klasifikasi-skenario}.js` | Sintaks OK. **Koreksi:** `--list` hanya mentranspilasi, BUKAN type-check. Type-check `tsc --strict` baru dijalankan di tahap lanjutan (lulus untuk file berubah; 1 error lama di spec lain) |
| `TARGET_ENV=local npx playwright test --list` | `Total: 529 tests in 71 files` (32 smoke baru) |
| `TARGET_ENV=demo npx playwright test --list --project=setup` | 7 test terdaftar (discovery saja, tanpa koneksi ke demo) |
| `node scripts/readiness-check.js` tanpa TARGET_ENV | Ditolak, exit 2 (penjaga target eksplisit) |
| `TARGET_ENV=local npm run readiness -- --out=…` | 0 penghambat; 3 observasi (cookie HttpOnly, SameSite, phpinfo) |
| `TARGET_ENV=local … --project=smoke --no-deps -g "sesi hasil login"` (sesi lama) | **5 failed, 2 passed**: sesi admin & admin-sub-read masih diterima, 5 lainnya diarahkan ke login. Reporter di-override `--reporter=list` → tanpa JSON (bukti = artefak) |
| `TARGET_ENV=local PW_RUN_ID=20261023-smoke-local npx playwright test` (setup + smoke + 13 spec read-only terpilih) | **22 failed, 4 skipped, 77 passed (8,7 mnt)**, 103 test |
| Investigasi tunggal `/lelang/carirute` (shipper) | 0 request menggantung; teks loading ada di `div.loading` tersembunyi → false positive automation |
| `… -g carirute` (setelah fix) | 1 passed |
| `TARGET_ENV=local PW_RUN_ID=20261023-smoke-final … --project=smoke --no-deps` | **2 failed, 30 passed (1,7 mnt)** |
| `TARGET_ENV=local npm run report` (2 run) | `hasil-testing-2026-10-23-1446-local.xlsx` (103 baris), `…-1458-local.xlsx` (32 baris) |

## 5. Jumlah skenario

**Status native Playwright**: tampilan TURUNAN dari dua run (`20261023-smoke-local` tanpa smoke + `20261023-smoke-final`), BUKAN satu run. Rincian per run ada di `report/tindak-lanjut-php82-local-2026-10-23.md` § 1.

| Status | Jumlah |
|---|---|
| Dieksekusi | 103 (7 setup + 32 smoke + 64 spec lama) |
| Passed | 78 = 75 lulus normal + 2 `test.fail()` sesuai harapan + 1 placeholder (admin-sub-read) |
| Failed | 21 |
| Skipped | 4 |
| Belum dijalankan | 426 dari 529 |

**Klasifikasi penyebab QA** atas 25 hasil non-lulus. Ini klasifikasi QA, bukan
status Playwright:

| Penyebab | Jumlah | Rincian |
|---|---|---|
| Defect produk / environment (HTTP 500 diterima) | 2 | Smoke Penugasan Tracking admin & transporter |
| Data / precondition tidak tersedia | 13 | 6 Push Notif (0 notifikasi; test sengaja menuntut ≥1), 3 Akun Saya (akun QA lokal tanpa file identitas/logo & rekening — perlu konfirmasi), 4 skip (tanpa lelang, tanpa NPWP/SIUP) |
| Perlu clarification hak akses | 10 | admin-sub 2, shipper-sub 4, transporter-sub 4: ekspektasi menu/breadcrumb/redirect demo vs lokal yang hanya Akun Saya |
| Masalah automation | 0 tersisa | 1 false positive (loader tersembunyi) di run pertama, sudah diperbaiki dan lulus ulang; bukti kegagalan pertama dipertahankan |
| Sesi kedaluwarsa | 0 di run utama | Pra-cek sesi lama: 5 ditolak (diselesaikan dengan login setup ulang) |
| Timeout Playwright / timeout request | 0 | — |
| Placeholder | 1 (lulus) | `admin-sub-read/akun-saya.spec.ts` |

**Klasifikasi kesiapan statis 529 skenario** (`scripts/klasifikasi-skenario.js`,
heuristik yang perlu ditinjau QA):

| Kategori | Skenario |
|---|---|
| 1. Siap dijalankan tanpa mutasi bisnis | 178 |
| 2. Siap setelah data tersedia (dan/atau izin mutasi) | 258 |
| 3. Perlu adaptasi akun/ID/data demo yang di-hardcode | 80 |
| 4. Perlu clarification requirement/hak akses | 12 |
| 5. Placeholder/belum diimplementasikan | 1 |
| 6. Di luar cakupan perubahan | 0 (semua skenario menyentuh aplikasi PHP) |

Eksekusi membuktikan heuristik statis belum sempurna. 8 skenario berkategori 1
gagal karena data akun atau hak akses (contohnya breadcrumb sub user). Untuk
skenario yang sudah dijalankan, kolom "hasil lokal" dan penyebab QA adalah
acuan, bukan kategori statisnya.

## 6. Temuan

| No | Temuan | Evidence | Klasifikasi | Dampak | Tindak lanjut |
|---|---|---|---|---|---|
| 1 | `/home/penugasantracking` HTTP 500 `Call to a member function FileApk() on null` | Smoke admin & transporter (run `smoke-local` & `smoke-final`), inventaris | Defect produk **atau** data setting APK hilang. Penyebab belum terbukti; tidak bisa disimpulkan akibat PHP 8.2 | Modul Penugasan Tracking (alur kritis) tidak dapat diuji | Dev periksa log & record setting APK; bandingkan di staging 8.1 bila ada |
| 2 | Master Provinsi: HTTP 500 diterima setelah ±60 dtk, body `Maximum execution time of 30 seconds exceeded` | Inventaris 2026-10-23 (2 pengamatan); tidak diulang di tahap ini agar suite tidak antre | Defect/performa produk atau environment | Master Provinsi tak terpakai; request lain antre (login 12 dtk) | Dev analisis query; DevOps konfirmasi SAPI/worker |
| 3 | `/user/tess` menampilkan phpinfo tanpa login | `readiness-sebelum-setup.json` (status 200, penanda phpinfo; isi tidak disimpan) | Keamanan (observasi pasif) | Paparan konfigurasi server; guard demo 2026-09-30 tidak ada di source lokal | Hapus/guard route di source utama; bukti per instance |
| 4 | Cookie `PHPSESSID` tanpa HttpOnly & tanpa SameSite eksplisit | readiness JSON | Keamanan (konfigurasi) | Risiko pencurian sesi via XSS/CSRF lebih tinggi | Tetapkan `session.cookie_httponly`, `cookie_samesite` (+ `secure` di HTTPS) |
| 5 | Detail error (pesan, path absolut, stack trace) tampil di response; konfigurasi penyebabnya (`display_errors` / mode dev framework) belum diverifikasi | Respons Master Provinsi & halaman 500 | Keamanan/konfigurasi | Paparan struktur server | DevOps/Dev konfirmasi konfigurasi error & mode framework |
| 6 | Edit Akun Saya transporter HTTP 500 (defect #10) | `test.fail` transporter/akun-saya lulus-defect | Defect produk, teramati juga di demo 2026-08-29 | Tidak spesifik runtime lokal | Tetap di backlog defect #10 |
| 7 | Ikon notifikasi tanpa accessible name (defect #5) | `test.fail` Push Notif admin | Defect aksesibilitas | Rendah | Backlog |
| 8 | Perilaku sesi tidak seragam: setelah login lain, sesi admin & admin-sub-read tetap diterima, 5 akun lain ditolak | Pra-cek sesi lama (5 failed/2 passed) | Perlu clarification | Asumsi "sesi tunggal per akun" dari demo tidak berlaku seragam | Dev konfirmasi kebijakan sesi per role |
| 9 | Hak akses sub user lokal jauh lebih sempit daripada demo | 10 test sub user gagal; inventaris menu | Perlu clarification | Spec sub user belum bisa dinilai benar/salah | BA tetapkan hak akses yang diharapkan |
| 10 | Data lokal kosong; akun QA tanpa notifikasi, file identitas, dan rekening | 13 hasil data/precondition | Data/environment | Alur bisnis kritis tidak dapat diuji | Dataset minimum § 7 |
| 11 | Smoke menghitung teks loading tersembunyi | Run `smoke-local` (gagal), investigasi tunggal, run `carirute-fix` (lulus) | Masalah automation, **sudah diperbaiki** | — | — |
| 12 | `--reporter=list` menimpa reporter JSON → run tanpa results.json | Run `sesi-lama` | Masalah automation (cara menjalankan) | Bukti hanya artefak | Jangan override reporter; dicatat di CLAUDE.md |
| 13 | Generator memilih "run terbaru" menurut nama folder | `npm run report` memilih run lama | Masalah automation, **sudah diperbaiki** (urut waktu) | — | — |
| 14 | Antrean request saat ada request lambat (login 12 dtk) | Inventaris | Indikasi environment, **belum** bukti server satu-worker | Hasil lokal tidak mewakili performa produksi | Konfirmasi SAPI (lihat matriks) |

## 7. Rencana pengujian lanjutan (siap dieksekusi setelah prasyarat)

### 7.1 Dataset minimum: satu alur bisnis kritis lengkap

Alur: **lelang → harga → order → penugasan → tracking → invoice**. Fitur yang
belum terbukti ada di lokal ditandai *Perlu konfirmasi*.

| Langkah | Role | Data awal yang dibutuhkan | Expected result | Pemeriksaan hasil simpan | Reset/cleanup |
|---|---|---|---|---|---|
| 0. Master referensi | admin | Provinsi, Kota, Pelabuhan (≥2), Jenis Kontainer, Kemasan/Jenis Muatan, Include, Dokumen Penagihan, Bank, Pelayaran, Petugas APK, setting APK & general (email CS), pajak | Master tampil & dapat dipilih di form | List master memuat data (bukan "Tidak Ada Data") | Snapshot DB sebelum run; restore setelah run |
| 1. Buat lelang | shipper | Akun shipper tervalidasi + transporter peserta | Swal sukses; lelang di tab Perlu Input Harga (transporter) + push notif "Pengajuan Lelang" | Detail lelang = input; notifikasi tercatat 3 peran | Restore snapshot (hapus lelang = mutasi permanen) |
| 2. Input harga & jadwal | transporter | Lelang aktif, jadwal kapal (Open Stack opsional) | Harga tampil di Cari Penawaran shipper | Harga/jadwal tersimpan setelah reload | Restore snapshot |
| 3. Pesan order | shipper | Penawaran valid; Tanggal Permintaan Muat (datepicker material: *Perlu konfirmasi* cara otomasi) | Order ORDER BARU | Detail order (PELAYARAN, harga) = penawaran | Restore snapshot |
| 4. Validasi/proses order | admin/transporter | Order baru; dokumen perjanjian | Status maju sesuai rule | Riwayat status | Restore snapshot |
| 5. Penugasan & tracking | transporter/admin | Petugas APK; **HTTP 500 harus dibereskan dulu** | Tahap tracking berurutan; push notif per tahap | Lihat Data Tracking | Restore snapshot |
| 6. Invoice | transporter/admin | Order ≥ KAPAL SANDAR; No. Referensi | Item invoice = format rule (+ No. Referensi) | Dokumen invoice jadi (belum pernah terverifikasi di demo) | Restore snapshot |

Pembersihan yang disarankan: **snapshot/restore database lokal** per run.
Banyak mutasi (order, invoice, push notif) tidak punya jalur hapus di UI.

### 7.2 Regresi pasca-upgrade

| Area | Isi | Sumber spec / status |
|---|---|---|
| Autentikasi | Login 7 role, logout, lupa sandi, aktivasi, sesi & cookie | `auth.setup`, `anon/*`, smoke; email *Perlu konfirmasi* (mail catcher) |
| Otorisasi | Gating menu & URL langsung per role/sub user; hak akses granular | `*-sub/akun-saya`, `admin/pengaturan-akun*`; **perlu clarification** hak akses lokal |
| Transaksi | Lelang, harga, nego, order, edit harga, alihkan, batal | `pengajuan-*`, `daftar-order*`, `open-stack*`: kategori 2/3 |
| Validasi | Required/popover, duplikat, batas tanggal, mask angka | spec master/setting/validasi-akun |
| Upload/import | Dokumen aanwijzing, NPWP/SIUP, import jadwal xlsx | *Perlu konfirmasi* ketersediaan di lokal; sebagian belum ada spec |
| Export | Export Excel/PDF laporan, SCSR, penawaran | `analitik-scsr`, `laporan`: butuh data |
| Integrasi | Email, WhatsApp, push notif, WebSocket | *Perlu konfirmasi* endpoint/stub lokal |
| Cron/queue | Reminder, deletelogdata, notifikasi terjadwal | *Perlu konfirmasi*; uji di PHP CLI versi yang sama |
| Error handling PHP 8.2 | Deprecation dynamic property, `${}` interpolation, null ke fungsi internal | Pantau log selama regresi (butuh akses log) |

### 7.3 Verifikasi patch oleh Dev/DevOps (di luar Playwright)

Bukti per instance (lokal, staging, demo, produksi):
- commit/tag yang ter-deploy;
- runtime **web/FPM** dibuktikan dari jalur web (binary pool aktif, SAPI dari
  request web sah). `php -v` CLI hanya membuktikan runtime CLI/cron;
- daftar extension;
- ini terkait (`display_errors`, `session.cookie_*`, `max_execution_time`);
- waktu restart PHP-FPM, worker, queue, dan reset opcache;
- status route diagnostik dinilai sebagai temuan keamanan **terpisah**, bukan
  bukti patch runtime.

Playwright hanya bisa memeriksa gejala luar dan tidak membuktikan patch terpasang.

### 7.4 Penilaian keamanan terpisah

phpinfo publik, atribut cookie, display_errors, dan route diagnostik
UserPage/GeneralPage dinilai oleh pihak keamanan, dengan izin terpisah untuk
pemindaian aktif. Lulusnya suite ini tidak menutup temuan tersebut.

### 7.5 Performa & kestabilan

Dilakukan di **staging yang mewakili produksi** (PHP-FPM, jumlah worker, data
volume), bukan di lokal. Lingkupnya:
- uji beban bertahap di halaman daftar dan pencarian;
- pemantauan `max_children`, slowlog, dan error rate;
- dibandingkan dengan baseline 8.1 bila tersedia.

### 7.6 Deployment, monitoring, rollback

- Deploy bertahap. Pantau log error PHP (deprecation/fatal), 5xx rate, dan
  latensi p95; durasi pemantauan ditetapkan dari penilaian risiko yang
  disepakati (tidak ditetapkan di laporan ini).
- Rollback ke 8.1 berarti kembali ke runtime yang menjadi alasan upgrade.
  Utamakan **roll-forward/hotfix**. Rollback hanya bila ada fatal error luas,
  dengan persetujuan keamanan dan batas waktu.

### 7.7 Kriteria Go/No-Go (terukur)

| Kriteria | Go bila |
|---|---|
| Bukti patch | Tersedia untuk setiap instance dalam cakupan rilis (commit, runtime web/FPM dari jalur web, runtime CLI bila ada cron, bukti restart) |
| Smoke read-only | 32/32 lulus pada target rilis |
| Alur kritis § 7.1 | 1 alur lengkap lulus end-to-end tanpa intervensi manual |
| HTTP 5xx | 0 pada halaman inti & alur kritis; log tanpa fatal baru |
| Hak akses | Matriks role/sub user dikonfirmasi BA dan test-nya lulus |
| Defect | 0 defect Kritis/Tinggi terbuka terkait upgrade; temuan keamanan #3–#5 punya keputusan tertulis |
| Performa (staging) | p95 & error rate tidak lebih buruk dari baseline yang disepakati |

## 8. Kebutuhan data & pertanyaan terbuka (digabung, tanpa duplikat)

**DevOps:**
1. SAPI/web server dan jumlah worker lokal. Untuk staging/produksi: pool
   PHP-FPM, `pm.max_children`, dan apakah pool terpisah.
2. Versi PHP persis sebelum dan sesudah upgrade per instance (FPM & CLI),
   tanggal upgrade, extension, ini terkait, dan bukti restart.
3. Akses atau ekspor log aplikasi/PHP untuk jendela run (penyebab 500).
4. Mail catcher lokal, atau izin memakai inbox eksternal.
5. Cron/queue/WebSocket yang berjalan dan versi PHP-nya.

**Dev:**

6. Commit/build lokal, demo, dan kandidat rilis.
7. Penyebab `FileApk() on null` (data setting atau kode) dan timeout Master Provinsi.
8. Apakah guard route diagnostik (2026-09-30) masuk source utama.
9. Kebijakan sesi per role (temuan #8).
10. Seed/dump tersanitasi, atau izin membuat dataset lewat UI dengan snapshot DB.

**BA / pemilik produk:**

11. Hak akses yang diharapkan untuk SUB_ADMIN, SUB_ADMIN_READ, SUB_SHIPPER, dan SUB_OPERATOR.
12. Kelengkapan data akun QA (file identitas, logo, NPWP/SIUP, rekening): disengaja kosong atau perlu diisi?
13. Izin mutasi data bisnis di lokal (dibutuhkan ±258 skenario).

## 9. Coverage yang belum diuji

Semua alur mutasi:
- lelang, harga, nego, order, penugasan, tracking, invoice;
- master dan setting CRUD;
- hak akses CRUD.

Hal lain yang belum diuji:
- upload/import dan export;
- integrasi email, WhatsApp, dan WebSocket;
- cron/queue;
- lupa sandi dan registrasi lokal;
- 4 submenu analitik selain SCSR (juga belum ada spec di demo);
- performa;
- verifikasi keamanan aktif.

Dari 529 skenario, **426 belum dijalankan** di lokal.

## 10. Keputusan kesiapan tahap berikutnya

- **Lanjut (siap):** smoke read-only (`--project=smoke`) dipakai sebagai gerbang
  setiap run lokal. Login setup ketujuh role juga siap.
- **Belum siap:** regresi alur bisnis dan baseline lengkap. Penghambatnya:
  1. dataset lokal kosong dan izin mutasi belum ada;
  2. HTTP 500 Penugasan Tracking (alur kritis) belum dijelaskan;
  3. hak akses sub user belum dikonfirmasi;
  4. 80 skenario masih hardcode data demo.
- **Bukan keputusan rilis:** tidak ada bukti deployment patch dan alur kritis
  belum teruji, sehingga produk **tidak dapat dinyatakan siap rilis**.
