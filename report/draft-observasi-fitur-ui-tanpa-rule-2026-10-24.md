# Draf Observasi — Fitur UI Tanpa Rule (Lokal, 2026-10-24)

**Status dokumen: DRAF OBSERVASI QA, BUKAN REQUIREMENT.** Isinya mencatat
perilaku yang **teramati** di UI lokal (`http://192.168.0.89:8102`, PHP 8.2.35)
untuk 13 halaman yang tidak punya rule di `docs/rules`. Expected result baru
dapat ditetapkan setelah BA mengonfirmasi atau menulis rule-nya. Perilaku yang
teramati **tidak** otomatis dianggap benar.

Metode: GET halaman dengan sesi admin/shipper. Field, kontrol, kolom, petunjuk,
dan XHR direkam tanpa klik aksi maupun submit. Halaman "Tambah" hanya dibuka untuk
melihat field form-nya. Bukti: `report/evidence-local-2026-10-23/eksplor-ui-tanpa-rule.json`
(skrip `skrip-sekali-pakai/eksplor-ui-tanpa-rule.cjs`). Data lokal kosong, sehingga
isi tabel, grafik, dan angka belum dapat diamati.

## Ringkasan per fitur

| ID | Fitur | Role | Route | Teramati | Pertanyaan untuk BA |
|---|---|---|---|---|---|
| UI-ADM-01 / UI-SHP-01 | Ringkasan Analitik | Admin, Shipper | `/dashboardanalitik/ringkasan` | Filter Dari/Sampai Tanggal (default 1 bulan terakhir: 24/09–24/10/2026), petunjuk "Maksimal range 12 bulan"; admin + select `#BidOwnerID` (shipper). Shipper: 4 elemen grafik + 4 tombol **Lihat Laporan** ke SCSR, Freight Cost, OTDR, Shipment Accuracy dengan parameter `session_get` (XHR `GET /dashboardanalitik/searchringkasan`) | Metrik apa yang ditampilkan dan rumusnya? Mengapa admin tidak punya grafik/Lihat Laporan saat belum memilih shipper? Berlaku jugakah defect #19 (`session_get` kedaluwarsa)? |
| UI-ADM-02 / UI-SHP-02 | Freight Cost | Admin, Shipper | `/analitik/analitikfcu` | Filter tanggal (12 bulan), multi-select Transporter (3), Pelabuhan Asal (1), Pelabuhan Tujuan (1); admin + Shipper (3); tombol Cari | Definisi freight cost (per kontainer/per order?), satuan, sumber harga (harga order vs edit harga)? |
| UI-ADM-03 / UI-SHP-03 | On Time Delivery Rate | Admin, Shipper | `/analitik/analitikotdr` | Filter tanggal (12 bulan), multi-select Pelabuhan Tujuan (POD), Transporter; admin + Shipper; tombol Cari | Definisi "tepat waktu" (ETA vs tanggal tracking mana?), ambang toleransi? |
| UI-ADM-04 / UI-SHP-04 | Shipment Accuracy | Admin, Shipper | `/home/analitikshipmentaccuracy` | Filter tanggal (12 bulan), Transporter, Pelabuhan Asal/Tujuan, **Pilih Shipment Accuracy (4 opsi)**; admin + Shipper | Apa 4 kategori akurasi dan cara penentuannya? |
| UI-ADM-05 | Biaya Layanan | Admin | `/adminprahu/biayalayanan` | Menu di Validasi Akun. Filter Shipper (multi-select), Jenis Biaya (4 opsi), page size; kolom ID, Tanggal Setting, Shipper, Jenis Biaya, Biaya Layanan, Masa Berlaku, Aksi (XHR `searchbiayalayanan` 200) | Jenis biaya apa saja, bagaimana masa berlaku memengaruhi harga/invoice, siapa yang dapat mengubah? |
| UI-ADM-06 | Master Jenis Muatan (admin) | Admin | `/analitik/masterjenismuatan` | Daftar per shipper: ID, Shipper, Email, Jml jenis Muatan, Aksi "Lihat Daftar Jenis Muatan" → `/analitik/datajenismuatan/<id>` (route yang sama dengan halaman shipper yang **HTTP 500**, D5; tidak dibuka) | Apakah admin boleh mengubah jenis muatan shipper atau hanya melihat? Relasi dengan master Kemasan? |
| UI-ADM-07 | Master Harga Barang (admin) | Admin | `/analitik/masterhargabarang` | Daftar per shipper: ID, Shipper, Email, Harga Terinput, Aksi "Lihat Daftar Harga Barang" → `/analitik/hargabarang/<id>` | Dipakai di analitik mana (SCSR "harga barang"?) dan bagaimana periode harga dipilih? |
| UI-ADM-08 | Master Free Time | Admin | `/adminprahu/masterfreetime` | Filter Pelabuhan (0 opsi, master kosong) & Status; kolom No, Pelabuhan Tujuan (POD), Storage (Hari), Status, Aksi; **Tambah Free Time** → `/adminprahu/tambahmasterfreetime` (field: pelabuhan [select], storage0, status) | Aturan validasi (duplikat POD, rentang hari), dampak ke order/invoice (demurrage?), edit/hapus saat terpakai? |
| UI-SHP-06 | Master Harga Barang (shipper) | Shipper | `/analitik/hargabarang` | Kolom No, Nama Jenis Muatan, Harga Terinput, Aksi; **Tambah Harga Barang** → `/analitik/tambahhargabarang/<id>` (field berulang: jenis_muatan[], harga_satuan[], tgl[], status[]). **XHR daftar `POST /analitik/searchdatajenismuatan` → HTTP 500** (terkait D5) | Sama dengan UI-ADM-07, plus perilaku saat jenis muatan belum ada |
| UI-SHP-05 | Master Jenis Muatan (shipper) | Shipper | `/analitik/datajenismuatan` | **HTTP 500 setelah ±60 dtk** (D5); tidak dieksplorasi ulang | Rule & perbaikan D5 |

## Pola yang terlihat lintas fitur

- Keempat halaman analitik non-SCSR memakai pola filter yang sama dengan SCSR:
  tanggal permintaan muat wajib (12 bulan), widget `.multi-select`, dan tombol
  Cari. Spec SCSR (`tests/*/analitik-scsr.spec.ts`) bisa dijadikan templat
  automation setelah rule tersedia.
- Opsi multi-select Pelabuhan bernilai 1 (kemungkinan hanya placeholder),
  sejalan dengan master Pelabuhan kosong. Transporter dan Shipper memuat akun QA
  (3 dan 2–3 opsi).
- Admin memilih shipper, sedangkan shipper melihat datanya sendiri. Pola ini
  sama dengan SCSR; isolasi data antar-shipper perlu diuji seperti di SCSR.

## Yang dibutuhkan agar fitur ini bisa diuji

1. Rule atau requirement dari BA per fitur (metrik, rumus, validasi, hak akses).
2. Data order lintas status dan periode untuk analitik.
3. Perbaikan D5 untuk Jenis Muatan dan Harga Barang shipper.
4. Master Pelabuhan untuk Free Time.
