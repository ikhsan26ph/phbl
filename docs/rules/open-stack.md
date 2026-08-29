# Open Stack — field jadwal kapal baru (lintas peran)

> **Sumber: hasil kalibrasi & eksplorasi mutasi ke aplikasi demo
> (2026-08-29), BUKAN dokumen rule .docx.** Field ini rilis bersamaan rebrand
> kolom Daftar Order "Nama Kapal / Tgl Permintaan Muat" → "Nama Kapal /
> Permintaan Muat & Closing Time". Belum ada rule tertulis dari tim; butir di
> bawah adalah perilaku yang TERAMATI dan dijadikan acuan test
> (`tests/*/open-stack*.spec.ts`). Bila tim merilis rule resmi, samakan.

## Definisi & perilaku umum (teramati)

- Open Stack = tanggal (dd/mm/yyyy, TANPA jam) per jadwal kapal, mendampingi
  Closing Time (ber-jam). Input via daterangepicker single (format
  `DD/MM/YYYY`, `autoUpdateInput=false`, TANPA `minDate`/`maxDate`).
- **Opsional**: label tanpa asterisk, input tanpa atribut `pesan` (mekanisme
  popover "Masukkan …" hanya untuk Kapal, Voyage, Closing Time, ETD, ETA).
- **TIDAK ADA VALIDASI TANGGAL SAMA SEKALI** (teramati 2026-08-29, kandidat
  rule/defect): Open Stack setelah Closing Time / setelah ETA diterima saat
  Tambah Jadwal; tanggal lampau (01/01/2020) diterima saat Edit Jadwal; nilai
  tersebut tampil apa adanya ke shipper di Cari Penawaran. Bandingkan Closing
  Time yang dibatasi `minDate = sekarang`, ETD ≥ Closing, ETA ≥ ETD.
- Urutan tampil konsisten: **Kapal → Voyage → Open Stack → Closing (Time)**.
- Nilai kosong dirender **"-"** pada blok PELAYARAN order (label tetap
  tampil, termasuk order lama), kecuali ringkasan Alihkan Order (kosong).
- **Nilai di ORDER = snapshot saat order dibuat** (terbukti: order
  20260829-06504 dibuat dari jadwal ber-Open Stack 01/01/2020 → Detail Order
  menampilkan 01/01/2020). Perubahan jadwal master setelahnya TIDAK mengubah
  order; sebaliknya **Ganti Jadwal (admin) mengubah Open Stack order saja**
  (jadwal master transporter tetap) dan tercatat di Riwayat Perubahan Data
  "(Ganti Jadwal) … Open Stack : <tgl>". Ini menjelaskan order KM. Malay
  LELANGFCU yang "-" padahal jadwal masternya 07/09/2026.

## Bidder (Transporter)

- **Lihat Jadwal** (`/home/masterjadwal1/<hash>`): kolom "Open Stack"
  (sortable) di antara Voyage dan Closing Time. Baris connecting: sel kapal
  memuat span `(Connecting Nx)` (`span.modal_conecting`) → modal
  `#modal_transit` "JADWAL KAPAL CONNECTING" berisi "Open Stack - <tgl>"
  dan "Closing - <tgl jam>" (format strip, bukan titik dua).
- **Tambah Jadwal** (`/home/tambahjadwal/<hash>?f=1`, form tampil setelah
  pilih Jenis Jadwal; sukses → redirect Lihat Jadwal + alert DOM "Anda
  berhasil menambah jadwal"):
  - Kapal Direct / Transit: field Open Stack (input `openstack`, placeholder
    DD/MM/YYYY) setelah Voyage, sebelum Closing Time; tombol `#submitonce`.
  - Kapal Connecting: field Open Stack hanya pada seksi kapal awal (input
    `openstack_awal_connecting`); seksi Data Kapal Connecting (Pelabuhan
    Connecting, Kapal Connecting, Voyage, ETD Connecting) tanpa Open Stack;
    tombol `#submitonce_connecting`.
  - Validasi required = popover Bootstrap (bukan alert), satu per satu:
    "Masukkan Nama Kapal" → "Masukkan Voyage" → "Masukkan Tanggal Closing
    Time" → "Masukkan Tanggal Berangkat" → "Masukkan Tanggal Tiba"; Open
    Stack dilewati (opsional).
  - Input tanggal WAJIB diketik per karakter + Enter (daterangepicker
    memantau keyup); `fill()` di-reset picker ke nilai lama/`minDate`.
- **Edit Jadwal** (`/home/editjadwal/<id>`, input `openstack_master`):
  Open Stack bisa diubah bebas (termasuk tanggal lampau); sukses → alert
  "Anda berhasil mengedit jadwal". Jadwal yang sudah di-order: klik Edit →
  alert native "Jadwal sudah di order, tidak dapat di edit".
- **Hapus Jadwal** (`button.delete_kelas`, atribut `sudahorder`): jadwal
  belum di-order → SweetAlert2 "Hapus?" [Hapus/Batal] → alert "Anda berhasil
  menghapus jadwal". Jadwal ter-order (`sudahorder=1`): rule menulis alert
  "Jadwal sudah di order tidak bisa di hapus" — BELUM diverifikasi (aksi
  diblokir kebijakan otomasi saat kalibrasi).
- **Import Jadwal** — template `assets/Format/Template Jadwal PH Bid.xlsx`
  (tombol "Download template disini"): kolom hanya Kapal, Voyage, Closing
  Time, Berangkat (ETD), Tiba (ETA) → **TIDAK ada kolom Open Stack** (gap
  fitur: jadwal hasil import tak bisa membawa Open Stack).
- **Detail Pengajuan Lelang**: sel kapal tabel harga penawaran memuat
  "Open Stack: <tgl>" di antara voyage dan "Closing: <tgl jam>"; urutan
  baris mengikuti Closing Time terdekat.
- **Detail Order** § 1. PEMESANAN blok PELAYARAN: "Open Stack : <tgl | ->".
- TIDAK tampil di: Daftar Order (list), tab Harga & Jadwal 1–5, detail nego,
  tracking.

## Bid Owner (Shipper)

- **Cari Penawaran** (hasil pencarian): sel kapal tiap penawaran memuat
  "Open Stack: <tgl>" di antara voyage dan Closing (termasuk nilai lampau —
  tidak difilter); baris connecting punya `span.modal_conecting` yang sama.
- **Isi Data Pesanan** (`/order/inputpesanan/<token>`, dari tombol Pesan):
  blok PELAYARAN "Open Stack : <tgl>" + "Closing Time : <tgl jam>".
- **Detail Order** blok PELAYARAN: sama seperti bidder (nilai snapshot).
- TIDAK tampil di: Cek Jadwal (`/lelang/carijadwal`), Daftar Order (list).

## Administrator (Daftar Order & Harga/Jadwal)

- **Detail Order**, **Ganti Jadwal**, **Edit Status Order**: blok PELAYARAN
  "Open Stack : <tgl | ->" lalu "Closing : …"; **Edit Data Order** memakai
  label pasangan "Closing Time :".
- **Ganti Jadwal** — form jadwal baru: `#open_stack` (form-group
  `#open_stack1`) opsional di antara Voyage dan Closing Time, PREFILL dari
  nilai order; pada order connecting tetap satu field. Simpan `#submitonce1`
  → SweetAlert2 konfirmasi "Apakah anda yakin melakukan ganti jadwal ?"
  [Batal/Ya] → redirect `/order/orderlist` + alert DOM "Anda berhasil ganti
  jadwal" → Detail Order & Riwayat Perubahan Data (`/order/historyupdateorder/
  <hash>`: "Tanggal Perubahan : <tgl jam> (Ganti Jadwal)", "Edit By", "Open
  Stack : <tgl>") ter-update; jadwal master transporter TIDAK berubah.
- **Alihkan Order** (wajib dari menu baris — URL polos redirect): ringkasan
  order (label "Open Stack :" + nilai; kosong dirender kosong) dan tiap baris
  harga pengganti memuat "Open Stack: <tgl>".
- **Harga & Jadwal admin** (`/home/hargajadwal` → Lihat Jadwal): halaman &
  gating edit/hapus SAMA dengan sisi bidder (jadwal ter-order tak bisa diedit).
- TIDAK tampil di master admin mana pun maupun detail/edit lelang admin.

## Data uji tersisa di demo (sengaja dibiarkan)

- Jadwal `AUTOTEST Kapal / AT-OS-1` (id 1870) pada harga LELANGFCU/28082026IK
  — Open Stack master 01/01/2020, Closing 30/09/2026 10:00, sudah di-order
  (tak bisa dihapus). Jadwal connecting uji sudah dihapus.
- Order `20260829-06504` (shipper pengirim.ph2021, ORDER BARU) dari jadwal
  itu — Open Stack order diubah admin via Ganti Jadwal → 15/09/2026
  (riwayat tercatat). Berguna sebagai fixture ORDER BARU ber-Open Stack.

## Temuan yang dilaporkan ke developer

1. Open Stack tidak divalidasi (setelah Closing/ETA, tanggal lampau
   diterima) — butuh keputusan rule.
2. Template Import Jadwal tanpa kolom Open Stack (gap fitur).
3. **Template Import Jadwal membocorkan data internal**: file
   `assets/Format/Template Jadwal PH Bid.xlsx` berisi 11 sheet — selain
   "Template Jadwal PH BID" ada Sheet13/18/19/15 (formula QUERY ke 'Lap
   Owner'/'Lap Logistik' dgn nama customer), KPI, PIVOT/CHART (nama shipper &
   partner, jumlah order per rute), "Annwijzing TCI" (tanya-jawab customer),
   **"LinkedIn" (data survei berisi nama, jenis kelamin, kota, NOMOR TELEPON
   responden)**, "Penelitian". Aset publik tanpa login → kebocoran data
   pribadi/internal. Didokumentasikan via test.fail() (template seharusnya
   1 sheet).
4. Ringkasan Alihkan Order merender nilai Open Stack kosong sebagai KOSONG
   (bukan "-" seperti field lain & blok PELAYARAN).
5. Label "Open Stack" di form Tambah Jadwal bidder ber-`for="exampleEmail11"`
   (id tak ada) — aksesibilitas.
6. Semua kemunculan display berbasis class/id tanpa role/label
   (`.heading_1`, `.text_label_regular`, `#tbody_hasil_penawaran`,
   `th.clicknya`, `#modal_transit`) — usulan `data-testid`.
