# Tindak Lanjut Pengujian PHP 8.2.35 Lokal — Rekonsiliasi, Koreksi, Daftar Tindak Lanjut

Tanggal: Jumat, 23 Oktober 2026 · Target: `TARGET_ENV=local` (`http://192.168.0.88:8102`)
Melengkapi dan **mengoreksi** `report/kesiapan-php82-local-2026-10-23.md`.
Alur kritis terpilih: `report/alur-kritis-buat-lelang-2026-10-23.md`.
Versi Excel: `report/tindak-lanjut-php82-local-2026-10-23.xlsx`.

Read-only: tidak ada data bisnis yang dibuat/diubah/dihapus; tidak ada tiket
atau pesan yang dikirim ke pihak lain. Produk **tidak** dinyatakan siap rilis.

## 1. Rekonsiliasi hasil (dari evidence mentah)

Sumber: `test-results/local/runs/<runId>/results.json` (JSON reporter
Playwright, di-ignore git) dan salinan teredaksi
`report/evidence-local-2026-10-23/ringkasan-run.json`. Semua run: 1 worker,
retries 0, target local. Build aplikasi semua run: **Belum diketahui**.
`APP_RUNTIME` dan `DATASET` diisi **manual** dari header `X-Powered-By` dan
hasil inventaris. Keduanya bukan informasi build yang terkonfirmasi.

### 1.1 Per run (status native Playwright)

| Run ID | Mulai (UTC) | Durasi | Versi suite* | Isi | Test | Attempt | Retry | Lulus normal | `test.fail()` sesuai harapan | Placeholder lulus | Gagal | Skip |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `20261023-sesi-lama` | ±07:45 | 28,5 dtk | — | pra-cek sesi lama (7 test smoke) | 7 | 7 | 0 | 2† | 0 | 0 | 5† | 0 |
| `20261023-smoke-local` | 07:46:16 | 524 dtk | `0fd24cd+perubahan-lokal` | setup 7 + smoke 32 + 13 spec read-only | 103 | 103 | 0 | 74 | 2 | 1 | 22 | 4 |
| `20261023-smoke-carirute-fix` | 07:57:45 | 7 dtk | `0fd24cd+perubahan-lokal` | 1 smoke (setelah fix) | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| `20261023-smoke-final` | 07:58:03 | 103 dtk | `0fd24cd+perubahan-lokal` | smoke 32 (`--no-deps`) | 32 | 32 | 0 | 30 | 0 | 0 | 2 | 0 |
| `20261023-precondition-buatlelang` | 08:26:28 | 20,5 dtk | `0fd24cd+lokal-8c3d7af6` | precondition alur #1 (`--no-deps`) | 4 | 4 | 0 | 2 | 0 | 0 | 2 | 0 |
| `20261023-smoke-penolakan-sub` | 08:27:06 | 13,4 dtk | `0fd24cd+lokal-8c3d7af6` | 4 smoke penolakan sub user (assertion diperkuat) | 4 | 4 | 0 | 4 | 0 | 0 | 0 | 0 |

\* Pada tiga run pertama, label `+perubahan-lokal` **tidak membedakan isi
spec**. Spec smoke berubah antara `smoke-local` dan `carirute-fix`, tetapi
labelnya sama. Label versi sekarang memuat hash isi perubahan
(`+lokal-<hash>`).

† `sesi-lama` dijalankan dengan `--reporter=list` sehingga **tidak ada JSON**.
Angkanya berasal dari output konsol dan artefak `test-failed-*.png` /
`error-context.md` di folder run, bukan dari results.json.

Run `20261023-1444xx`, `list-*`: hanya `--list` (0 attempt) — bukan eksekusi.

### 1.2 Angka "103 hasil gabungan, 78 passed" di laporan sebelumnya

Angka itu adalah **tampilan turunan**, bukan satu run: hasil non-smoke dari
`smoke-local` (71 test) ditambah 32 hasil smoke dari `smoke-final`. Hitungan
diverifikasi ulang:

| Komponen | Lulus normal | `test.fail()` sesuai harapan | Placeholder lulus | Gagal | Skip |
|---|---|---|---|---|---|
| `smoke-local` tanpa smoke (71) | 45 | 2 | 1 | 19 | 4 |
| `smoke-final` (32) | 30 | 0 | 0 | 2 | 0 |
| **Turunan (103)** | **75** | **2** | **1** | **21** | **4** |

"78 passed" = 75 + 2 + 1. Hitungannya benar, tetapi menggabungkan dua versi
spec smoke dan dua waktu eksekusi. Untuk keperluan audit, acuannya tetap **per
run** (§ 1.1).

### 1.3 Jumlah skenario

| Ukuran | Jumlah | Sumber |
|---|---|---|
| Skenario tercatat (discovery) saat laporan sebelumnya | 529 | `--list` run `list-klasifikasi` |
| Skenario tercatat sekarang | 533 | `--list` run `list-tahap3` (+4 precondition) |
| Skenario unik yang pernah benar-benar dijalankan di lokal | 107 | 103 (`smoke-local`) + 4 precondition baru |
| Total attempt eksekusi seluruh run ber-JSON | 144 | 103 + 1 + 32 + 4 + 4 |
| Attempt di run tanpa JSON (`sesi-lama`) | 7 | output konsol |
| Retry | 0 | semua run (`retries: 0` lokal) |

### 1.4 Klasifikasi QA (terpisah dari status native)

Atas 21 gagal + 4 skip di tampilan turunan:

| Klasifikasi QA | Jumlah | Rincian |
|---|---|---|
| Defect produk/environment (HTTP 500 diterima) | 2 | Penugasan Tracking admin & transporter → satu finding D1 |
| Data/precondition tidak tersedia | 9 gagal + 4 skip | 6 Push Notif (0 notifikasi), 3 Akun Saya (file/rekening akun QA), 4 skip (lelang, NPWP/SIUP) |
| Perlu clarification hak akses | 10 | sub user admin 2 / shipper 4 / transporter 4 |
| Masalah automation | 1 (hanya di `smoke-local`) | loader tersembunyi carirute; diperbaiki, lulus ulang di 2 run berikutnya |
| `test.fail()` defect lama | 2 (status lulus) | #5 a11y ikon notifikasi, #10 Edit Akun Saya transporter |

## 2. Koreksi interpretasi teknis

| Pernyataan sebelumnya | Koreksi |
|---|---|
| "Verifikasi patch: `php -v` FPM dan CLI" | `php -v` (CLI) **bukan** bukti runtime web. Bukti runtime web/FPM perlu dari jalur web itu sendiri: versi binary FPM yang di-load pool aktif (`php-fpm -v` / unit service), header/`php_sapi_name()` dari request web yang sah, dan bukti restart pool. `X-Powered-By` hanya indikasi dan bisa dimatikan atau diubah. |
| `/user/tess` phpinfo dikaitkan dengan verifikasi patch | Dua hal **terpisah**. (a) phpinfo publik = temuan keamanan paparan informasi. (b) Verifikasi patch runtime = bukti deployment dari DevOps. phpinfo bukan alat verifikasi patch yang disetujui. Isinya sengaja tidak dibaca. |
| "`display_errors` aktif" | Yang **teramati**: response 500 memuat pesan error PHP/SilverStripe beserta path dan stack trace. Konfigurasi `display_errors` **belum diverifikasi**. Penyebabnya bisa ini, atau mode dev/debug framework, atau error handler aplikasi. |
| "TypeScript tidak terpasang; tipe dicek loader Playwright saat `--list`" | **Salah.** Loader Playwright hanya mentranspilasi, tanpa type-check. Tahap ini menjalankan `tsc --noEmit --strict` sementara (`npx -p typescript@5.6.3`, tanpa mengubah package.json): 6 file yang diubah lulus (exit 0). Seluruh `tests/**` → **1 error lama**, `admin/daftar-order-edit-harga.spec.ts:239` (TS2339, `innerText` pada `SVGElement`). Tidak diperbaiki karena di luar alur terpilih. |
| Smoke penolakan sub user hanya mencocokkan URL + alert | Diperkuat. Respons asli `/home/editakunsaya` wajib 3xx (kalibrasi: **302 → /home/akunsaya, body 0 byte** untuk 4 sub user) dan halaman akhir tanpa `form[action*=updateakunsaya]`. Endpoint tulis (POST) **tidak** dicoba karena itu mutasi; penolakan di endpoint tulis tetap belum teruji. |
| Spec sub user lama (`*-sub/akun-saya`) | **Tidak diubah.** Ekspektasinya berasal dari kalibrasi demo, sedangkan hak akses lokal belum dikonfirmasi BA. Mengubahnya sekarang sama dengan menyesuaikan expected result agar hijau. |
| Penyebab HTTP 500 / server satu-worker | Tetap **belum diketahui**. Tidak ada log backend. Antrean (login 12 dtk) hanya gejala, bukan bukti satu-worker. HTTP 500 tidak dapat dikaitkan dengan PHP 8.2 tanpa pembanding atau bukti backend. |
| Go/No-Go "pantau 24–72 jam" | Durasi monitoring **tidak ditetapkan** di sini. Durasi itu harus diturunkan dari penilaian risiko yang disepakati. Begitu juga tidak ada syarat "529 skenario lulus" otomatis. |

## 3. Daftar tindak lanjut (digabung)

Severity dan akar masalah **tidak ditetapkan**. Evidence belum cukup tanpa
log backend dan pembanding.

### 3.1 Defect (perilaku produk menyimpang)

| No | Judul | Actual result | Expected result / dasar | Evidence | Klasifikasi | Dampak | Pihak | Prasyarat retest |
|---|---|---|---|---|---|---|---|---|
| D1 | Penugasan Tracking HTTP 500 | `GET /home/penugasantracking` → 500 `[Emergency] Uncaught Error: Call to a member function FileApk() on null`, **identik** untuk admin, transporter, dan shipper (±250–360 ms). Shipper tidak punya menu ini tetapi juga menerima 500, bukan penolakan akses | Halaman daftar penugasan terbuka untuk admin/transporter (docs/rules: administrator 08-penugasan-tracking, bidder penugasan tracking); role tanpa akses ditolak, bukan error | Run `smoke-local` & `smoke-final` (smoke admin/transporter); GET terkalibrasi 3 role tahap ini; inventaris | Defect produk **atau** data/setting hilang (penyebab belum terbukti) | Modul Penugasan Tracking (rantai order → tracking) tidak dapat diuji sama sekali | Dev (+ DevOps untuk log) | Fix/penjelasan + data setting terkait (bila penyebabnya data); rerun smoke project |
| D2 | Master Provinsi gagal setelah ±60 dtk | `POST /adminprahu/searchMasterProvinsi` → **HTTP 500 diterima** setelah ±60,3 dtk; body `Fatal error: Maximum execution time of 30 seconds exceeded`. Bukan timeout request (batas 90 dtk) maupun timeout Playwright. Selama itu request lain antre (login 12 dtk) | Daftar provinsi tampil (master admin); daftar master lain merespons <0,5 dtk | Inventaris 2026-10-23 (2 pengamatan; **tidak diulang** tahap ini) | Defect produk/performa atau environment | Master Provinsi tak terpakai; data Kota/Pelabuhan bergantung padanya; antrean mengganggu suite | Dev, DevOps | Perbaikan/penjelasan; satu pengamatan ulang terkendali (bukan berulang) |
| D3 | Edit Akun Saya transporter HTTP 500 (defect lama **#10**) | `GET /home/editakunsaya` (transporter utama) → 500 `DatabaseException … SELECT * FROM File where ID=`; halaman memuat stack trace | Form edit akun terbuka (rule bidder akun saya) | `test.fail` di `smoke-local` (lulus-defect); GET terkalibrasi tahap ini | Defect produk (sudah tercatat #10 sejak demo 2026-08-29) | Edit akun transporter tak bisa diuji; juga terlihat di demo → tidak spesifik runtime lokal | Dev | Fix #10; test `test.fail` akan gagal (tanda sudah diperbaiki) lalu dikembalikan menjadi test normal |
| D4 | Ikon notifikasi tanpa accessible name (defect lama **#5**) | `a.link-notifikasi` accessible name "" | Elemen interaktif punya nama aksesibel | `test.fail` Push Notif admin di `smoke-local` | Defect aksesibilitas | Rendah untuk alur bisnis | Dev | Fix; `test.fail` dibalik |
| D5 | Master Jenis Muatan shipper HTTP 500 setelah ±60 dtk | `GET /analitik/datajenismuatan` (shipper) → **HTTP 500 dokumen** setelah 60,3 dtk, body memuat "Fatal error" (pola sama dengan D2). Pada sweep, `POST /analitik/searchdatajenismuatan` juga tercatat 500. Eksplorasi 2026-10-24 (host .89): daftar **Master Harga Barang shipper** (`/analitik/hargabarang`) memanggil XHR yang sama dan menerima HTTP 500, sehingga D5 juga memengaruhi Harga Barang | Halaman Master › Jenis Muatan shipper terbuka (menu shipper; rule bid-owner master jenis muatan — **perlu dicocokkan**) | `isolasi-halaman-lambat.json` (2026-10-23, server dipastikan tenang sebelumnya); `sweep-ui-per-role.json` | Defect produk/performa **atau** environment (penyebab belum terbukti) | Master Jenis Muatan & Harga Barang shipper tak teruji; antrean menahan request lain | Dev, DevOps | Fix/penjelasan + satu pengamatan ulang terkendali |

### 3.2 Clarification

| No | Judul | Actual result | Expected result / dasar | Evidence | Klasifikasi | Dampak | Pihak | Prasyarat retest |
|---|---|---|---|---|---|---|---|---|
| C1 | Hak akses sub user lokal ≠ ekspektasi spec | SUB_ADMIN/SUB_SHIPPER/SUB_OPERATOR hanya menu Akun Saya; SUB_ADMIN_READ + Master › Bank. Breadcrumb Beranda tidak berupa link; akses preference/profil diarahkan ke `/home/akunSaya` | Spec dikalibrasi di **demo**, di mana sub user berhak akses luas. Rule hanya menetapkan sub user tanpa edit akun & tanpa preference notif. Hak menu per sub user tidak ditetapkan rule | 10 gagal di `smoke-local`; inventaris menu | Clarification | 10 skenario tak bisa dinilai benar/salah | BA / admin aplikasi | Matriks hak akses tertulis per sub user; bila beda dari demo, spec disesuaikan **berdasarkan matriks itu** |
| C2 | Perilaku sesi per akun tidak seragam | Setelah login lain dengan akun yang sama, sesi admin & admin-sub-read tetap diterima; 5 akun lain diarahkan ke login | Belum ada dasar rule; di demo teramati sesi tunggal per akun (CLAUDE.md) | Run `sesi-lama` (tanpa JSON; artefak per test) | Clarification | Rencana eksekusi (login paralel, setup ulang) bergantung pada ini | Dev | Kebijakan sesi per role tertulis |
| C3 | Penolakan di endpoint tulis untuk sub user | Hanya penolakan GET yang terbukti (302) | Sub user tidak boleh mengubah akun (rule) | — (sengaja tidak dicoba, mutasi) | Clarification/izin | Celah otorisasi endpoint tulis belum teruji | QA + pemilik produk | Izin uji negatif terkendali (POST ditolak, data dipastikan tidak berubah) |

### 3.3 Kebutuhan data

| No | Judul | Actual result | Expected result / dasar | Evidence | Klasifikasi | Dampak | Pihak | Prasyarat retest |
|---|---|---|---|---|---|---|---|---|
| N1 | Master referensi Buat Lelang kosong | Dropdown Buat Lelang shipper: Pelabuhan Asal/Tujuan, Kota Asal/Tujuan, Jenis Kontainer = **0 opsi** (dirender server, tanpa AJAX); master admin Pelabuhan/Kontainer/Kemasan/DP/Include/Pelayaran/Petugas = 0 baris | Opsi dari master **aktif** (rule bid-owner 08 § Buat Lelang) | Run `precondition-buatlelang`; inventaris | Kebutuhan data | Alur kritis #1 tidak dapat dimulai | Dev/BA (seed) atau izin input via UI | Data master tersedia; isi `FIXTURES.local.buatLelang`; rerun project precondition |
| N2 | Fixture alur lokal belum ditetapkan | `FIXTURES.local.buatLelang = null` | Nilai fixture = data master lokal yang terkonfirmasi | Run `precondition-buatlelang` | Kebutuhan data | Spec alur gagal eksplisit sebelum mutasi | QA (setelah N1) | N1 selesai |
| N3 | Push Notif tanpa data | 0 notifikasi di admin/shipper/transporter | Spec menuntut ≥1 notifikasi unread | 6 gagal `smoke-local` | Kebutuhan data | Fitur Push Notif tidak teruji | — (terbentuk dari alur bisnis) | Alur #1 dijalankan (menghasilkan notifikasi) |
| N4 | Kelengkapan data akun QA | Shipper/transporter tanpa file identitas/logo; transporter tanpa rekening ("Nama Bank 1"), tanpa NPWP/SIUP | Spec Akun Saya dikalibrasi pada akun demo berdokumen | 3 gagal + 2 skip `smoke-local` | Kebutuhan data (**perlu konfirmasi**: disengaja kosong?) | 5 skenario Akun Saya | BA/Dev | Akun QA dilengkapi atau dinyatakan sengaja kosong |
| N6 | Setting Notifikasi lokal OFF | `/adminprahu/settingNotifonof` (DOM setelah render): `push_notif` OFF, `notif_email` OFF, `notif_wa` OFF | Di demo ketiganya ON saat trigger Push Notif lulus (CLAUDE.md); arti OFF untuk email/WA belum tertulis | Pembacaan DOM read-only tahap ini | Kebutuhan data/setting (**perlu konfirmasi**) | CP6 alur #1 (Push Notif) kemungkinan tidak terjadi; N3 tidak akan terpenuhi selama OFF | Admin aplikasi / BA | Keputusan: biarkan OFF (CP6 = tidak berlaku) atau izin ubah + revert |
| N5 | Lelang untuk Cari Penawaran | 0 lelang | Popup daftar lelang berisi data | 2 skip `smoke-local` | Kebutuhan data | 2 skenario | — | Alur #1 |

### 3.4 Temuan keamanan (observasi pasif, terpisah dari verifikasi patch)

| No | Judul | Actual result | Expected result / dasar | Evidence | Klasifikasi | Dampak | Pihak | Prasyarat retest |
|---|---|---|---|---|---|---|---|---|
| S1 | phpinfo publik | `GET /user/tess` tanpa login → 200 + penanda phpinfo (isi tidak dibaca/disimpan) | Route diagnostik tidak dapat diakses publik (di demo sudah 404 sejak 2026-09-30) | `readiness-sebelum-setup.json` | Keamanan — paparan informasi | Konfigurasi server terpapar | Dev / security | Route dihapus/di-guard; readiness menunjukkan bukan 200 phpinfo |
| S2 | Atribut cookie sesi | `PHPSESSID` HttpOnly=false, Secure=false, SameSite tidak di-set | Praktik baik cookie sesi (OWASP) | readiness JSON | Keamanan — konfigurasi | Risiko pencurian sesi lebih tinggi | DevOps / Dev | Konfigurasi baru; readiness |
| S3 | Detail error tampil di response | Response 500 memuat pesan PHP/SilverStripe, path absolut, stack trace | Error detail tidak dikirim ke klien di lingkungan non-dev | D1, D2, D3 | Keamanan — paparan informasi (konfigurasi penyebab **belum diverifikasi**) | Struktur server terpapar | DevOps / Dev | Konfirmasi konfigurasi error & mode framework |
| S4 | Route diagnostik/migrasi lain | `UserPage` (autologin, debugRachmad, user_lama, 2 migrasi) & 7 action `GeneralPage` **tidak dipanggil** (berpotensi mutasi/bypass) | Tidak tersedia publik | Audit demo 2026-09-30 (source); tidak ada bukti lokal | Keamanan — belum terverifikasi | Tidak diketahui | Dev / security | Review source lokal; uji hanya dengan izin keamanan terpisah |

### 3.5 Environment / DevOps

| No | Judul | Actual result | Expected result / dasar | Evidence | Klasifikasi | Dampak | Pihak | Prasyarat retest |
|---|---|---|---|---|---|---|---|---|
| E1 | Bukti deployment patch & runtime web per instance | Hanya `X-Powered-By: PHP/8.2.35`; build Belum diketahui | Bukti per instance: build/commit, binary FPM pool aktif, waktu restart FPM/worker, opcache reset, CLI cron (terpisah dari FPM) | readiness JSON | Kebutuhan evidence | Patch tidak dapat dinyatakan terpasang | DevOps | Dokumen bukti; isi `APP_BUILD`/`APP_RUNTIME` saat run |
| E2 | SAPI & kapasitas worker lokal | Indikasi `php -S` (header), antrean saat request lambat | — (perlu konfirmasi) | readiness & inventaris | Belum diketahui | Interpretasi performa & paralelisme | DevOps | Konfirmasi tertulis |
| E2a | Antrean setelah membuka Master Kota (observasi tahap ini) | Setelah `/adminprahu/masterkota` dimuat ±2,5 dtk lalu ditinggalkan, halaman berikutnya (`settingNotifonof`) timeout 30 dtk dan `GET /user/login` 12,4 dtk; pulih sendiri (0,28 dtk) tanpa intervensi | Halaman master merespons cepat seperti master lain | Script read-only tahap ini (tidak diulang) | Belum diketahui. Mungkin XHR daftar Kota lambat seperti D2, **belum terbukti** (XHR tidak direkam) | Membuka Master Kota dapat menahan suite | Dev / DevOps | Log backend atau satu pengamatan terkendali dengan perekaman XHR |
| E3 | Akses log backend | Tidak ada | Log aplikasi/PHP untuk jendela run | — | Kebutuhan akses | D1/D2 tak bisa didiagnosis | DevOps | Ekspor log teredaksi |
| E4 | Mail catcher lokal | Tidak diketahui; suite memakai yopmail | Alur email teruji tanpa layanan publik | — | Kebutuhan environment | Registrasi/lupa sandi & notifikasi email lelang tak terverifikasi | DevOps | Mail catcher atau izin inbox eksternal |

### 3.6 Automation (internal QA, bukan untuk dev)

| No | Judul | Status |
|---|---|---|
| A1 | Smoke menghitung loader tersembunyi (carirute) | Diperbaiki (`filter({ visible: true })`), lulus 2 run |
| A2 | `--reporter=list` menghilangkan JSON | Dicatat di CLAUDE.md; jangan override reporter |
| A3 | Generator memilih run menurut nama | Diperbaiki (urut waktu results.json) |
| A4 | Label versi suite tidak membedakan isi spec | Diperbaiki (`+lokal-<hash>`) |
| A5 | TS2339 di `admin/daftar-order-edit-harga.spec.ts:239` | Terbuka (spec lama, di luar alur terpilih) |
| A6 | Literal master demo di alur Buat Lelang | Dipindah ke `FIXTURES` per target; lokal `null` → gagal eksplisit |

## 4. Status pekerjaan

| Status | Pekerjaan |
|---|---|
| Selesai | Rekonsiliasi per run; koreksi interpretasi; tabel tindak lanjut; pemilihan & checkpoint alur #1; fixture per target; spec precondition read-only; penguatan smoke penolakan; type-check `tsc --strict` file berubah; label versi suite berhash |
| Blocked | Eksekusi CP2+ alur #1 (butuh N1/N2 + izin mutasi); retest D1/D2 (butuh fix/log); C1 (butuh matriks BA); verifikasi patch (E1) |
| Butuh keputusan | Opsi penyediaan data (seed/dump vs input UI); izin mutasi di lokal; mekanisme & otorisasi snapshot/restore DB; izin uji negatif endpoint tulis (C3); penanganan efek samping email/WA saat submit lelang (E4) |
