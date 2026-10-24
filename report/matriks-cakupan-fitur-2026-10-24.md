# Matriks Cakupan Fitur — Pasca-Update PHP 8.2.35 (Lokal)

Tanggal: Sabtu, 24 Oktober 2026 · Target: `TARGET_ENV=local` (`http://192.168.0.88:8102`)
Acuan utama status fitur. Versi lengkap per baris:
`report/matriks-cakupan-fitur-2026-10-24.xlsx` (sheet **Matriks Fitur**, 1.331 baris).
Dibangun ulang dengan `node scripts/matriks-cakupan.js` dari
`report/evidence-local-2026-10-23/` (inventaris, pemetaan, katalog test, koreksi QA).

> **Kondisi hari ini (diperbarui):** pagi hari server lokal di 192.168.0.88 menolak
> koneksi (port 8102). User kemudian memberi alamat baru **http://192.168.0.89:8102/**;
> `BASE_URL` di `.env.local` sudah diganti. Host .89 = instance yang sama: PHP
> 8.2.35, header identik, readiness 0 penghambat, login 7/7 lulus, smoke & precondition
> identik (39 lulus, 4 gagal: D1 ×2, master kosong ×2; run `20261024-host89-smoke-precondition`).
> Upaya mutasi pertama (shipper ajukan perubahan akun sebagai trigger notifikasi)
> **ditolak pengaman otomatis Claude Code** sebelum terkirim; data tidak berubah.
> Eksekusi mutasi menunggu izin di pengaturan Claude Code.

Produk **tidak** dinyatakan siap rilis. Cakupan fitur dilaporkan terpisah dari
jumlah test/attempt (§ 3). Jumlah test **bukan** persentase cakupan fitur.

## 1. Sumber inventaris

| Sumber | Isi | Jumlah |
|---|---|---|
| `docs/rules/administrator/*.md` (17 file) | Fitur/aksi Admin per modul | 647 baris |
| `docs/rules/bid-owner/*.md` (13 file) | Fitur/aksi Shipper, termasuk Anon (login/registrasi/lupa sandi) | 339 baris |
| `docs/rules/bidder/*.md` (12 file), `open-stack.md`, `analitik-scsr.md` | Fitur/aksi Transporter, Open Stack, SCSR. Dua dokumen terakhir = **hasil kalibrasi QA, bukan dokumen resmi** | 331 baris |
| Sweep menu UI lokal (4 akun, 83 halaman, GET saja) | Halaman yang ada di UI tetapi **tidak punya rule** | 14 baris (`UI-*`) |
| Katalog test (`katalog-test-hasil-lokal.tsv`) | 533 test + hasil lokal terakhir | dipetakan ke fitur |
| Koreksi QA (`inventaris-fitur/koreksi-qa.tsv`) | Status yang dikoreksi manual, dengan alasan per ID | 27 baris |

Satu baris = satu aksi/perilaku. "Halaman terbuka" tidak membuat aksi
tambah/edit/hapus di halaman itu berstatus Berjalan.

## 2. Cara status ditetapkan

Aturan lengkapnya ada di header `scripts/matriks-cakupan.js`. Urutannya:

1. **Bermasalah**: test terkait lulus sebagai `test.fail()` (defect masih ada), test gagal karena defect produk, atau halaman fitur HTTP 500.
2. **Perlu clarification**: test gagal karena ekspektasi hak akses/konfigurasi belum dikonfirmasi, atau fitur UI tanpa requirement.
3. **Berjalan**: test lulus normal yang memang membuktikan **aksi itu**, dari **akun role yang sama** dan **halaman yang sama**.
4. **Blocked**: data lokal kosong, izin mutasi belum ada, atau defect hulu (D1/D5).
5. **Belum diuji**: sisanya.

Tiga penyaring dipasang setelah spot-check menemukan klaim berlebih:
- Spec bersama (`push-notif.shared.ts`) tidak lagi membuktikan fitur role lain.
- Test smoke (satu `file:line` untuk semua halaman) hanya berlaku untuk halaman yang judulnya cocok.
- Fitur yang isinya bergantung data tidak bisa "Berjalan" hanya karena strukturnya lulus selama DB kosong.

Placeholder dan `test.fail()` **tidak pernah** dihitung sebagai bukti fungsi.

**Keterbatasan pemetaan:**
- Pemetaan fitur → spec dikerjakan agen dengan membaca isi spec. Untuk sebagian spec Admin, pemetaan hanya berdasarkan judul test.
- Langkah manual Admin berupa templat.
- Semua 56 baris "Berjalan" sudah ditinjau satu per satu. Baris lain belum diaudit penuh.

## 3. Hasil

### 3.1 Cakupan FITUR (1.331 aksi)

| Role | Berjalan | Bermasalah | Blocked | Perlu clarification | Belum diuji | Total |
|---|---|---|---|---|---|---|
| Admin | 24 | 10 | 501 | 9 | 123 | 667 |
| Anon | 2 | 2 | 16 | 0 | 31 | 51 |
| Shipper (sub user) | 0 | 0 | 1 | 1 | 8 | 10 |
| Shipper | 20 | 6 | 262 | 4 | 44 | 336 |
| Transporter (sub user) | 1 | 0 | 1 | 2 | 2 | 6 |
| Transporter | 9 | 6 | 229 | 0 | 17 | 261 |
| **Total** | **56** | **24** | **1010** | **16** | **225** | **1331** |

| Kelompok dependensi | Berjalan | Bermasalah | Blocked | Perlu clarification | Belum diuji | Total |
|---|---|---|---|---|---|---|
| 1-Akun/Role/Master/Konfigurasi | 19 | 11 | 134 | 8 | 152 | 324 |
| 2-Transaksi | 17 | 7 | 570 | 0 | 40 | 634 |
| 3-Alur antar-role/antar-modul | 0 | 0 | 55 | 0 | 3 | 58 |
| 4-Notifikasi/Integrasi | 7 | 0 | 136 | 0 | 6 | 149 |
| 5-Laporan/Upload/Download/Lain | 13 | 6 | 115 | 8 | 24 | 166 |
| **Total** | **56** | **24** | **1010** | **16** | **225** | **1331** |

| Automation | Berjalan | Bermasalah | Blocked | Perlu clarification | Belum diuji | Total |
|---|---|---|---|---|---|---|
| Belum ada | 0 | 5 | 629 | 12 | 124 | 770 |
| Hanya test.fail | 0 | 11 | 5 | 0 | 7 | 23 |
| Perlu adaptasi | 0 | 2 | 129 | 0 | 27 | 158 |
| Placeholder | 0 | 0 | 3 | 0 | 1 | 4 |
| Tersedia | 56 | 6 | 244 | 4 | 66 | 376 |
| **Total** | **56** | **24** | **1010** | **16** | **225** | **1331** |

Keberadaan fitur di lokal: Terkonfirmasi **286** · Belum terkonfirmasi **741** · Terkonfirmasi (halaman) **251** · Halaman error **53**. "Belum terkonfirmasi" = aksi tidak terlihat di UI lokal (umumnya karena tidak ada data untuk dirender) dan tidak ada test lulus; fitur itu **tidak diasumsikan tersedia**.

**Penyebab Blocked (1.010 baris):**

| Penyebab | Baris |
|---|---|
| Data lokal kosong (master, lelang, order, notifikasi, data akun) | 618 |
| Izin mutasi belum ada (+data) | 347 |
| Defect hulu D1 (Penugasan Tracking HTTP 500) | 42 |
| Koreksi QA (data) | 3 |

**Bermasalah (24 baris), dikelompokkan:**

| Kelompok | Fitur (ID) | Dasar |
|---|---|---|
| D1 Penugasan Tracking HTTP 500 | ADM-08-001/003/004/007/022, TRP-09-001/002/012/026 | Halaman 500, admin & transporter |
| D5 Master Jenis Muatan shipper HTTP 500 | UI-SHP-05, UI-SHP-06 | Jenis Muatan: 500 setelah 60,3 dtk (terisolasi); Harga Barang: XHR daftar `searchdatajenismuatan` 500 (eksplorasi 2026-10-24) |
| D3 / defect #10 Edit Akun Saya transporter | TRP-04-006, TRP-04-007 | `test.fail` lulus (500 masih terjadi) |
| Defect #14a: rentang 90 hari vs hint 12 Bulan | ADM-17-010/017, SHP-06-015/023 | `test.fail` lulus |
| Defect #13: jumlah preference notif shipper | ADM-11-073, SHP-13-003/004 | UI 16 push / 12 email vs rule 17/13 |
| Diskrepansi modul form hak akses | ADM-14-008, ADM-14-026 | `test.fail` lulus |
| Defect #2: label radio registrasi | SHP-02-001, TRP-02-001 | `test.fail` lulus |

**Fitur UI tanpa requirement (14 baris `UI-*`):** Analitik Ringkasan, Freight
Cost, On Time Delivery Rate, Shipment Accuracy (admin & shipper), Biaya Layanan,
Master Jenis Muatan & Harga Barang (admin & shipper), dan Free Time. Halaman
terbuka di lokal kecuali Jenis Muatan shipper (D5); daftar Harga Barang shipper
juga terkena D5. Sisanya Perlu clarification karena expected result belum bisa
ditetapkan tanpa rule. Hasil eksplorasi read-only per fitur:
`report/draft-observasi-fitur-ui-tanpa-rule-2026-10-24.md` (draf, bukan requirement).

### 3.2 Jumlah TEST dan attempt (terpisah dari cakupan fitur)

| Run ID | Waktu mulai (UTC) | Test | Attempt | Retry | Lulus normal | `test.fail` sesuai harapan | Placeholder | Gagal | Skip |
|---|---|---|---|---|---|---|---|---|---|
| 20261023-sesi-lama | ±07:45 | 7 | 7 | 0 | 2 | 0 | 0 | 5 | 0 |
| 20261023-smoke-local | 07:46:16 | 103 | 103 | 0 | 74 | 2 | 1 | 22 | 4 |
| 20261023-smoke-carirute-fix | 07:57:45 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| 20261023-smoke-final | 07:58:03 | 32 | 32 | 0 | 30 | 0 | 0 | 2 | 0 |
| 20261023-precondition-buatlelang | 08:26:28 | 4 | 4 | 0 | 2 | 0 | 0 | 2 | 0 |
| 20261023-smoke-penolakan-sub | 08:27:06 | 4 | 4 | 0 | 4 | 0 | 0 | 0 | 0 |
| 20261023-cakupan-readonly | 08:57:14 | 109 | 109 | 0 | 92 | 8 | 0 | 9 | 0 |

- `sesi-lama` tidak punya results.json; angkanya dari konsol dan artefak.
- Dari 533 test tercatat, **209 unik** pernah dieksekusi di lokal, dengan **260 attempt** dan 0 retry.

### 3.3 Fitur yang membutuhkan uji manual dan celah automation

| Automation | Baris | Arti |
|---|---|---|
| Tersedia | 376 | Spec ada & relevan; sebagian hanya mencakup sebagian aksi (Metode "Otomatis+Manual") |
| Perlu adaptasi | 158 | Spec ada tetapi hardcode data/akun demo (lelang `LELANGFCU/28082026IK`, order demo, fixture `AUTOTEST-FIXTURE-*`, yopmail, ekspektasi akun demo) |
| Hanya test.fail | 23 | Hanya terbukti sebagai defect; fungsi benar belum pernah terbukti |
| Placeholder | 4 | `test.fixme` / spec placeholder |
| Belum ada | 770 | Tidak ada automation, termasuk **Input Harga, Pesan Order, Input Muatan/Perjanjian, respon nego, input unit, penugasan, tracking, invoice** |

- **1.041 baris** punya Metode Uji Manual atau Otomatis+Manual, dan semuanya sudah berisi langkah, expected, serta evidence yang harus dikumpulkan (sheet **Uji Manual**).
- Langkah transaksi transporter (harga, jadwal, nego, unit, tagihan, invoice, penugasan) ditulis konkret.
- Langkah Admin masih berupa templat dan perlu dipertajam untuk baris prioritas.

## 4. Urutan eksekusi berdasarkan dependensi

Prinsip: kerjakan per kelompok. Bila satu checkpoint gagal: (1) catat checkpoint
terakhir yang lulus, (2) tandai turunannya Blocked dengan ID penyebab, (3)
lanjutkan kelompok/fitur lain yang tidak bergantung padanya. Status transaksi
**tidak boleh** diisi langsung (DB/API) untuk melompati langkah. Bila suatu saat
terpaksa memakai data seed transaksi, langkah sebelumnya tetap tercatat
"belum teruji".

| Urutan | Kelompok | Isi | Gerbang masuk | Bila gagal |
|---|---|---|---|---|
| 0 | Gerbang lingkungan | `npm run readiness`, login setup 7 role, smoke read-only | Server responsif (<3 dtk), 0 penghambat | Hentikan run; catat penyebab |
| 1 | Akun, role, master, konfigurasi | Akun Saya, hak akses & sub user, Validasi Akun, Master (Pelabuhan, Kota, Jenis Kontainer, Include, Kemasan, DP, Bank, Pelayaran, Free Time, Petugas APK, Iklan), Setting (General, S&K, Reminder, Notifikasi, Pajak), Preference Notif | Seed Provinsi/Kota tersedia; izin mutasi master | Master yang gagal → semua transaksi pemakainya Blocked |
| 2 | Transaksi inti (berurutan) | Buat Lelang → Input Harga & Jadwal (transporter) → Cari Penawaran (shipper) → Nego (ajukan/respon) → Pesan Order (Isi Data Pesanan → Input Muatan → Input Perjanjian) → Validasi Perjanjian (admin) → Input Unit (transporter) → Penugasan Petugas → Tracking per tahap → Proses Invoice → Order Selesai/rating | Kelompok 1 lulus untuk master yang dipakai | Langkah gagal → langkah sesudahnya Blocked; transaksi independen (mis. lelang kedua untuk nego) tetap jalan |
| 3 | Alur antar-role / antar-modul | Tampilan & aksi admin atas tiap tahap (Edit Harga, Ganti Jadwal, Alihkan, Batalkan, Edit Status), sub user per hak akses, request harga/jadwal, open stack | Transaksi pada tahap terkait ada | Blocked per tahap |
| 4 | Notifikasi & integrasi | Push internal, email, WhatsApp, reminder cron, WebSocket, APK tracking | Trigger dari kelompok 2/3; keputusan saklar & mail catcher | Dicatat per jenis; tidak memblokir kelompok 5 |
| 5 | Laporan, upload, download, lain | Dashboard, Laporan Owner/Logistik, History Lelang, Analitik (Ringkasan, SCSR, Freight Cost, OTDR, Shipment Accuracy), Export Excel/PDF, upload aanwijzing/dokumen, import jadwal, download APK/template | Ada data transaksi | Laporan tanpa data: tampilan saja yang bisa dinilai |

## 5. Kebutuhan data per kelompok fitur

| Kelompok fitur | Data minimum | Disediakan dev (seed/import/konfigurasi) | Dibuat lewat produk (butuh izin mutasi) | Cara mengulang pengujian |
|---|---|---|---|---|
| Akun & role | 7 akun aktif (sudah ada); grup hak akses per sub user sesuai matriks BA | Matriks hak akses sub user (C1); akun QA lengkap dokumen/rekening bila disyaratkan (N4) | Grup hak akses & sub user uji (prefix `AUTOTEST-`) | Buat→verifikasi→hapus dalam satu test (pola spec admin yang sudah ada) |
| Master referensi | Provinsi, Kota (≥2), Pelabuhan aktif (≥2, beda kota), Jenis Kontainer aktif (≥1) | **Provinsi & Kota wajib seed** (tanpa tombol Tambah, lokal & demo); opsional Pelabuhan & Kontainer | Pelabuhan, Jenis Kontainer, Include, Kemasan, DP, Bank, Pelayaran, Free Time, Petugas APK, Iklan | Data referensi dipertahankan (dipakai transaksi); tulis nama/ID nyata ke `scripts/targets.js` `FIXTURES.local` setelah terbukti ada |
| Setting | Versi web, email/WA CS, S&K, rule reminder, pajak PPN/PPh, record setting APK (D1), saklar notifikasi | Record setting APK & nilai awal (Versi Web lokal kosong); keputusan saklar notifikasi | Ubah nilai lewat UI hanya dengan revert di `finally` (pola spec setting) | Revert wajib + cek nilai pasca-run |
| Lelang & harga | 1 lelang normal, 1 peserta (transporter QAL3), 1 harga + 1 jadwal kapal (butuh Pelayaran) | — | Buat Lelang (shipper), Input Harga & Jadwal (transporter) | Nomor lelang unik per run (`AUTOTEST/<timestamp>`); lelang ditinggalkan/dibatalkan (tidak terhapus) |
| Nego | Lelang tutup dengan penawaran | — | Ajukan nego (shipper), respon terima/tolak/nego (transporter) | Satu lelang/penawaran per varian respon |
| Order | Penawaran aktif; Tanggal Permintaan Muat (datepicker material); muatan; perjanjian | — (status order **tidak boleh** diisi langsung) | Pesan → Input Muatan → Input Perjanjian → validasi admin | Order uji tidak bisa dihapus; batasi jumlah, catat nomor order per run |
| Penugasan & tracking | Order tervalidasi + unit; Petugas APK; **D1 harus selesai** | Perbaikan/record untuk D1 | Input Unit, Penugasan, update tiap tahap tracking | Satu order per run sampai tahap yang diuji |
| Invoice | Order ≥ KAPAL SANDAR; No. Referensi (opsional); dokumen penagihan | — | Proses Invoice (1 dari 3 kesempatan per order — permanen) | Order khusus invoice; izin eksplisit karena kesempatan terbatas |
| Notifikasi | Trigger dari transaksi; status saklar; preference per akun | Mail catcher/stub WA (E4), keputusan saklar (N6) | Trigger via transaksi; ubah saklar hanya dengan izin + revert | Baseline ID notifikasi terakhir sebelum trigger (pola `push-notif.trigger.ts`) |
| Laporan, analitik, export | Order di beberapa status/provinsi/periode | — | Terbentuk dari kelompok 2 | Baca ulang setelah transaksi; bandingkan angka antar level (pola SCSR) |
| Upload/download | File uji PDF/XLSX kecil tanpa data pribadi | Template import yang bersih (defect #11) | Upload aanwijzing, dokumen registrasi, import jadwal | File uji disimpan di repo/evidence; hapus via UI bila tersedia |

## 6. Notifikasi: aspek yang diuji terpisah

Dasar rule: `docs/rules/administrator/12-setting.md:49-54` (saklar Push/Email/WA,
default ON, OFF = seluruh notifikasi jenis itu tidak dikirim) dan `:15-24`
(preferensi admin, label "Tidak Aktif", email ke admin sebagai penerima utama,
shipper/transporter sebagai Bcc). Preferensi per akun: `bid-owner/13-preference-notif.md`,
`bidder/12-preference-notifikasi.md`.

| Aspek | Expected (sumber) | Kondisi lokal 2026-10-23 | Status | Cara uji | Butuh izin/konfigurasi |
|---|---|---|---|---|---|
| Nilai default saklar | Semua ON (12-setting:51) | Push OFF, Email OFF, WA OFF | Perlu clarification (disengaja oleh admin lokal atau menyimpang) | Baca DOM `/adminprahu/settingNotifonof` (sudah) | — |
| Perilaku saat OFF — push internal | Tidak dikirim (12-setting:53) | Belum ada trigger | Belum diuji | Jalankan trigger (mis. Buat Lelang) dengan saklar apa adanya; bandingkan ID notifikasi terakhir penerima sebelum & sesudah | Izin mutasi transaksi (tanpa ubah setting) |
| Perilaku saat OFF — email | Tidak dikirim (12-setting:52) | Mail catcher tidak diketahui | Blocked (E4) | Trigger + periksa mail catcher/log mailer; tanpa catcher hanya log backend | Mail catcher atau akses log |
| Perilaku saat OFF — WhatsApp | Tidak dikirim (12-setting:54) | Gateway tidak diketahui | Blocked (E4) | Trigger + log/stub gateway | Stub/log gateway WA |
| Perilaku saat ON — push internal | Record terbentuk untuk penerima sesuai preferensi (12-setting:17,22-24) | Saklar OFF | Blocked (N6) | Ubah saklar ON (revert di finally) lalu trigger; pola `tests/push-notif.trigger.ts` | Izin ubah setting + izin mutasi |
| Perilaku saat ON — email/WA | Terkirim; admin penerima utama, shipper/transporter Bcc (12-setting:20-21) | — | Blocked (E4, N6) | Stub/mail catcher; **jangan** ke penerima nyata | Izin + stub; alamat uji `example.invalid` |
| Preferensi per akun | Akun yang menonaktifkan jenis tertentu tidak menerima; label "Tidak Aktif" di pop-up admin (12-setting:18-19) | Belum diuji (spec preference hanya toggle sisi klien) | Belum diuji | Simpan preference (mutasi + revert) lalu trigger | Izin mutasi |
| Tampilan inbox Push Notif | Filter, kategori, limit, tandai dibaca, hapus | 0 notifikasi; test struktur lulus, test data gagal (N3) | Blocked (data) untuk aksi; Berjalan untuk struktur | Spec `push-notif.shared.ts` setelah ada notifikasi | — |
| Reminder terjadwal (cron 05.00) | Notif reminder ke petugas per rule trigger (12-setting:35-44) | Cron lokal tidak diketahui | Blocked | Konfirmasi cron/CLI; jalankan job terkendali | DevOps |
| Stub/mock vs integrasi nyata | Hasil stub hanya membuktikan pemanggilan, bukan pengiriman | — | Dicatat terpisah per run | Kolom "mode integrasi" di evidence | Keputusan DevOps |

## 7. Rencana mutasi gelombang 1 (BELUM dijalankan — menunggu izin)

Ditampilkan sebelum eksekusi sesuai batas tahap. Semua di `TARGET_ENV=local`,
1 worker, data uji berprefiks `AUTOTEST`/`QA-LOKAL`, nomor/ID yang terbentuk
dicatat di evidence per run.

| No | Tindakan | Role | Dataset | Efek samping integrasi | Penanganan data uji | Prasyarat |
|---|---|---|---|---|---|---|
| M0 | Seed Provinsi & Kota (oleh dev, bukan QA) | Dev | Data geografis sah | — | Permanen (referensi) | Mekanisme seed dari dev |
| M1 | Tambah Pelabuhan ×2, Jenis Kontainer ×1 lewat UI admin; cek apakah Biaya Laut/Freight Kapal berasal dari master Include (perlu konfirmasi) lalu tambah bila iya | Admin | Nama `QA-LOKAL-…`, kota dari seed | Tidak ada | Dipertahankan sebagai referensi; isi `FIXTURES.local.buatLelang` | M0, izin mutasi master |
| M2 | Buat Lelang normal 1 peserta (CP2–CP4) dengan saklar notifikasi **apa adanya (OFF)** | Shipper | `AUTOTEST/<timestamp>`, peserta QAL3 | Rule: email/WA ke peserta — saklar OFF diharapkan mencegah (diverifikasi); alamat `example.invalid` | Lelang dipertahankan untuk M3; boleh dibatalkan setelah rangkaian selesai (tetap tersimpan berstatus batal) | M1, izin mutasi transaksi |
| M3 | Input Harga + Jadwal kapal untuk lelang M2 | Transporter | Harga uji, kapal `AUTOTEST Kapal`, Pelayaran master | Notifikasi ke shipper (rule) — saklar OFF | Dipertahankan untuk M4 | M2, master Pelayaran |
| M4 | Pesan Order dari Cari Penawaran (Isi Data Pesanan → Input Muatan → Input Perjanjian) | Shipper | Penawaran M3 | Notifikasi order — saklar OFF | Order dipertahankan; nomor dicatat | M3; cara otomasi datepicker material (manual bila belum) |
| M5 | Validasi perjanjian, Input Unit, Penugasan, Tracking, Invoice | Admin/Transporter | Order M4 | WA ke petugas (rule) — saklar OFF; APK | Order uji permanen; invoice memakan 1 dari 3 kesempatan | M4, D1 selesai, izin khusus invoice |

## 8. Pekerjaan yang dapat langsung dieksekusi

Dapat dikerjakan **tanpa mutasi dan tanpa data**, segera setelah server lokal hidup:

1. **2 test aman yang tertunda hari ini:** `anon/registrasi.spec.ts:92` dan `admin/harga-jadwal.spec.ts:174`.
2. **65 fitur Belum diuji tanpa mutasi dan tanpa prasyarat data** (sheet **Siap Eksekusi**). Contohnya:
   - registrasi (10): field wajib, format telepon, radio peran;
   - Master Admin (11): lihat daftar per master — **jangan** memakai `admin/master.spec.ts:211` karena test itu juga memuat Provinsi/Kota yang membuat server antre;
   - Pengaturan Akun (5), Cek Jadwal (4), Cari Penawaran shipper (4), Pengajuan Lelang shipper (4), menu Analitik (5).

   Sebagian bisa diotomasi dengan perluasan assertion kecil; sisanya manual.
3. **Uji manual read-only** untuk baris berstatus Belum diuji yang menyebut halaman sudah terbuka.

Tidak dapat dikerjakan sebelum keputusan atau prasyarat terpenuhi: seluruh
kelompok 2–4 (izin mutasi, seed Provinsi/Kota, D1/D5, keputusan saklar notifikasi,
mail catcher), registrasi dengan submit (`registrasi.spec.ts:107/119`, risiko
membuat akun karena validasi diam), dan perbaikan spec Perlu adaptasi
(menunggu fixture lokal yang sah).

## 9. Status pekerjaan

| Status | Pekerjaan |
|---|---|
| Selesai | Inventaris 1.331 fitur (rules + UI tanpa rule); pemetaan fitur → spec → hasil lokal → bukti UI; status per aksi dengan penyaring bukti dan 27 koreksi QA; celah automation; langkah manual 1.041 baris; urutan eksekusi; kebutuhan data per kelompok; matriks notifikasi; rencana mutasi gelombang 1; D5 masuk daftar tindak lanjut |
| Blocked | Eksekusi hari ini (server lokal mati); seluruh transaksi (izin mutasi + data); Penugasan Tracking (D1); Master Jenis Muatan shipper (D5); notifikasi ON & email/WA (N6, E4) |
| Butuh keputusan | Izin mutasi lokal (rencana M1–M5 § 7); seed Provinsi/Kota; saklar notifikasi; snapshot DB; izin submit registrasi negatif; matriks hak akses sub user (C1); requirement untuk 14 fitur UI tanpa rule |

**Keputusan:**
- Cakupan yang terbukti berjalan baru **56 dari 1.331 aksi (4,2%)**, semuanya pada tampilan, validasi, dan kontrol tanpa data.
- Di kelompok Transaksi baru validasi form dan kontrol yang terbukti (17 baris). Belum ada transaksi yang **tersimpan** (submit/create), belum ada alur antar-role (0 baris), dan belum ada **pembentukan/pengiriman** notifikasi (0 dari 96 baris Notifikasi-Internal/Email/WA). Yang terbukti dari notifikasi hanya struktur inbox Push Notif.
- Langkah paling bernilai berikutnya:
  1. hidupkan server lokal;
  2. eksekusi 65 fitur siap;
  3. dapatkan izin dan seed untuk M0–M2, sehingga alur Buat Lelang menjadi transaksi pertama yang terbukti.
