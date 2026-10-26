# Pengecekan plugin/library — PHBID Laut via tunnel (2026-10-25)

Target: `https://survival-nobody-character-plugin.trycloudflare.com/` (PHBID Laut,
build BETA 20260228 v1.3.28, PHP/8.2.35). Metode: browser Playwright, sesi 3 peran
utama + anon. **Read-only**: hanya GET halaman, membuka dropdown/kalender dan mengetik
di sisi klien; tidak ada submit/simpan. Bukti mentah: `report/evidence-plugin-2026-10-25/`.

## Cakupan & batas (baca dulu)

- Dicek: **87 halaman** (3 anon + 52 menu admin + 20 shipper + 12 transporter) +
  halaman editor S&K. Tidak dibuka: `do_logout`, Master Kota/Provinsi (membebani
  server), `datajenismuatan` (500 ±60 dtk, sudah diketahui).
- **Halaman aksi** (detail lelang, buat lelang, form order, tambah/edit master, lihat
  jadwal) TIDAK dipindai langsung — tautannya dimuat lewat XHR. Bukti untuk area itu
  diambil dari hasil suite test 2026-10-24 (heuristik: test yang menyentuh plugin & lulus).
- **Library backend (composer)** tidak bisa diakses; hanya terlihat tidak langsung dari
  pesan error server.
- "Tidak dipakai" di bawah = tidak ditemukan pemanggilan/instance di **87 halaman menu**;
  bisa saja dipakai di halaman aksi.

## Ringkasan

- **165 file JS/CSS** dimuat (`inventaris.txt`). Semua HTTP 200, kecuali **3 file JS lokal
  yang TIDAK ADA di server** (dialihkan 302 ke halaman HTML "Halaman Error").
- **Error JavaScript di 14 halaman** — semuanya ditelusuri ke akar masalahnya; **tidak ada
  yang terbukti merusak fitur** (lihat tabel B).
- **Tidak ada plugin yang terbukti rusak secara fungsional** di halaman yang dicek. Ada
  plugin yang belum dapat diverifikasi (tabel A, status "Belum terverifikasi").
- Library backend **ratchet/pawl (WebSocket) RUSAK** — sudah dilaporkan (defect #23).

## A. Status per plugin yang DIPAKAI aplikasi

| Plugin | Bukti dipakai | Status | Bukti fungsi |
|---|---|---|---|
| jQuery 3.7.1 (anon: 3.6.0) | semua halaman | Berfungsi | aktif 86/86 |
| Bootstrap 4 (modal, tooltip, popover) | 118+ halaman | Berfungsi | 23 test modal & 3 test popover lulus |
| SweetAlert2 | 120 halaman | Berfungsi | 11 test lulus (konfirmasi hapus, dll.) |
| Select2 | 54 halaman ber-instance | **Berfungsi** | uji langsung: dropdown dashboard order terbuka, 69 opsi |
| bootstrap-datepicker | 39 halaman | **Berfungsi** | uji langsung: kalender tampil (42 sel hari) di Freight Cost |
| daterangepicker | 5 halaman | Berfungsi | 5 test lulus (rentang tanggal dashboard) |
| jQuery Mask | 40 halaman | **Berfungsi** | uji langsung: `08ab12-34cd56`→`08123456`; `01022026`→`01/02/2026` |
| MultiSelect (custom) | 16 halaman | Berfungsi | 2 test lulus (filter analitik SCSR) |
| Chart.js + datalabels | 3 halaman, 5 grafik | **Berfungsi** | uji langsung: kelima kanvas tergambar & berisi data |
| Leaflet (peta) | Dashboard Pengiriman | **Berfungsi** | uji langsung + tangkapan `peta.png`: poligon Indonesia, marker, zoom |
| PDF.js Express WebViewer | 7 halaman | Berfungsi | 6 test lulus (dokumen aanwijzing) |
| CKEditor 5 (44.0.0) | editor S&K | **Berfungsi** | uji langsung: bisa diedit, 19 tombol toolbar, ketikan masuk (tidak disimpan) |
| download.js (export) | 84 halaman | Berfungsi | 8 test export lulus |
| moment.js, mobile-detect | banyak | Aktif, tanpa error | tidak ada error JS terkait |
| floatThead | Dashboard Order | Aktif — **efek tak dapat diuji** | 6 baris data: tabel tak pernah keluar layar saat scroll |
| LoadingOverlay / blockUI | dipicu saat SIMPAN | Belum terverifikasi langsung | hanya muncul pada aksi simpan (mutasi); test simpan No. Referensi lulus tapi tak memeriksa overlay |
| bootstrap-material-datetimepicker | form Tanggal Permintaan Muat (order) | **Belum terverifikasi** | halaman form order tidak dibuka; di Master Iklan pemanggilnya dikomentari ("DIGANTI") |
| Inputmask (`.format_persen`), smooth-scrollbar | kode ada | Aktif bila elemennya ada | 0/1 instance di halaman menu |

## B. Error JavaScript — akar masalah & dampak (semua terbukti)

| Error | Halaman | Akar masalah | Dampak |
|---|---|---|---|
| `Unexpected token '<'` | Setting Notifikasi, S&K, editor S&K, Dashboard Order (admin & shipper), Profil Transporter | 3 file JS tidak ada (302 → HTML): `custom/masterjeniskendaraan.js`, `js/fileinput.min.js`, `js/jquery.mask.min.js` | Tidak ada: halaman tak memanggil `.fileinput()`; `$.fn.mask` tetap ada dari salinan lain |
| `$(...).datetimepicker is not a function` | Aanwijzing, Biaya Layanan, Master Iklan, Harga & Jadwal (admin & transporter) | memanggil plugin Eonasdan datetimepicker yang tidak dimuat (hanya dimuat di Pengajuan Lelang) | Tidak ada: elemen sasaran `.tgl`/`.paket`/`.tgll111` = 0 (kode mati copy-paste) |
| `editor-create-initial-data` (CKEditor 5) | S&K, Profil Transporter, editor S&K | `css/ckeditor/main.js` memanggil `ClassicEditor.create('#editor')`, elemen `#editor` tidak ada | Tidak ada: editor yang dipakai (`#ckeditor1`) terbentuk & berfungsi |
| `CKEDITOR.on is not a function` | editor S&K | halaman memuat CKEditor **4.14.0** dan **5** sekaligus; keduanya memakai global `CKEDITOR` | Tidak ada pada editor v5; CKEditor 4 dimuat tapi tidak dipakai |
| `Cannot read … 'replaceAll'` | Profil Transporter | `$("#panjang").val()` — elemen form muatan tidak ada (copy-paste) | Tidak ada: hanya kalkulasi volume yang tak relevan |

## C. Respons gagal (≥400)

- **404 gambar logo pelayaran** di Penugasan Tracking (admin & transporter): 10 file
  `/assets/pelayaran/*.png` (MERATUS-v2, SPIL, ASDP-FERRY, BELITUNG-JAYA-LINE…, tanto-v2,
  logo-valid, dll.) — logo tidak tampil.
- 404 `/assets/verif.png` (Validasi Transporter admin), `/assets/tombol_close.png` (Cari Penawaran).
- 500 XHR yang sudah tercatat: `searchulasan` (#22; juga dipanggil dari halaman Notifikasi
  transporter, 66 dtk), `searchdatajenismuatan` (Ringkasan Analitik shipper, 65 dtk),
  dokumen `editakunsaya` transporter (#10).

## D. Dimuat tetapi TIDAK dipakai (di halaman menu) — beban & risiko

- Tidak ditemukan pemanggilan maupun instance: bootstrap-multiselect, jquery.countdown,
  EasyAutocomplete, metisMenu, Adobe View SDK, leaflet-realtime, Leaflet.fullscreen,
  circle-progress, countUp, Cropper, ClipboardJS, noUiSlider, wNumb, bootstrap-toggle,
  textareaAutoSize, jquery-validation, smartWizard, Ladda, spin.js, GMaps, jVectorMap,
  barrating, PerfectScrollbar, Bootstrap Table, Fancytree + jQuery UI, intro.js, slick,
  sparkline, FullCalendar, bootstrap-gallery, Google platform.js, Facebook SDK (anon),
  CKEditor 4.14.0.
- Konfigurasi sisa template: `Dropzone.options.myGreatDropzone` (nama contoh dokumentasi,
  elemen tak ada → 0 instance); init `scripts-init/tables.js` memanggil `.DataTable()`
  padahal DataTables tidak dimuat (aman karena `#example` tidak ada); init treeview memuat
  data demo dari `cdn.rawgit.com`; peta `new L.TileLayer('')` (layer ubin kosong, ubin OSM
  dikomentari).
- **Dimuat ganda/bentrok**: jQuery 3.7.1 lalu 3.6.0 di halaman anon (plugin yang terdaftar
  di 3.7.1 hilang, mis. EasyAutocomplete — tidak dipakai di anon); SweetAlert2 2 salinan
  (lokal + CDN 11.26.3); Chart.js 2 salinan; moment.js 3 salinan; jQuery Mask 3 sumber;
  mobile-detect 1.4.3 & 1.4.5.
- **Sumber pihak ketiga yang perlu ditinjau dev**: `jquery.inputmask.bundle.js` dimuat dari
  bucket S3 CodePen (`s3-us-west-2.amazonaws.com/s.cdpn.io`), bukan CDN resmi; skrip dari
  `cdn.rawgit.com` (layanan rawgit sudah dihentikan, kini dialihkan ke jsDelivr);
  CKEditor 4.14.0 (rilis lama) dimuat walau tak dipakai.

## E. Library backend (bukti tidak langsung dari error server)

| Library | Status | Bukti |
|---|---|---|
| ratchet/pawl + ratchet/rfc6455 (WebSocket) | **Rusak** | TypeError `ClientNegotiator::__construct()` → HTTP 500 (defect #23) |
| guzzlehttp/psr7 | Terlibat dalam error di atas | `HttpFactory` dioper ke parameter yang salah |
| monolog | Aktif | muncul di pesan max_execution_time (searchulasan/inputmuatan) |
| silverstripe/framework | Aktif, mode debug | halaman error memuat `debug.css` + stack trace |

## F. Temuan sampingan

- Sesi server ini **tidak tunggal per akun** (berbeda dari catatan demo): login ulang tidak
  mengakhiri sesi lama.
- Kunci sesi akibat `searchulasan` juga membuat request GET biasa dari sesi yang sama timeout (30 dtk).
