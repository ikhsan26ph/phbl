# Analitik — Shipping Cost Sales Ratio (SCSR)

Dokumen ini **bukan** hasil pecahan .docx sumber (modul Analitik tidak ada di
dokumen rule mana pun). Isinya hasil **kalibrasi langsung ke demo**
(2026-09-26, diperdalam pada audit 2026-09-28) plus permintaan improve dari
user, sama pola dengan `docs/rules/open-stack.md`.

## Lokasi & akses

- Menu sidebar **ANALITIK** (dropdown) ada di **Shipper** dan **Admin**.
  - Shipper: **4 submenu** — "Shipping Cost Sales Ratio" (`/home/analitikscsr`),
    "Freight Cost" (`/analitik/analitikfcu`), "On Time Delivery Rate"
    (`/analitik/analitikotdr`), "Shipment Accuracy"
    (`/home/analitikshipmentaccuracy`).
    (Kalibrasi 2026-09-26 yang menulis "2 submenu" **salah/kedaluwarsa**,
    diperbaiki 2026-09-28. DOM shipper juga memuat link
    `/dashboardanalitik/ringkasan`, `/analitik/datajenismuatan`,
    `/analitik/hargabarang`, tapi di grup menu lain yang tidak terbuka.)
  - Admin: 5 submenu analitik — "Ringkasan Analitik"
    (`/dashboardanalitik/ringkasan`), "Shipping Cost Sales Ratio"
    (`/home/analitikscsr`, route SAMA dgn shipper), "Freight Cost",
    "On Time Delivery Rate", "Shipment Accuracy" — plus submenu master
    (`/analitik/masterjenismuatan`, `/analitik/masterhargabarang`) yang sudah
    dicakup `tests/admin/master.spec.ts`.
- Transporter TIDAK punya menu Analitik.

## Form pencarian

- Field: **Dari Tanggal \*** (`#tglawal`), **Sampai Tanggal \*** (`#tglakhir`),
  **Pilih Provinsi** (`#ProvinsiID`), **Pilih Consignee** (`#Consignee`), dan —
  khusus admin — **Shipper \*** (`#BidOwnerID`, wajib; pola sama dgn Laporan
  admin yang wajib `#BidOwnerID`).
- Hint: "Masukkan tanggal permintaan muat (Maksimal range 12 bulan)" →
  tanggal yang difilter = tanggal permintaan muat, bukan tanggal order.
- Batas 12 bulan **ditegakkan secara senyap oleh datepicker**: dengan tglawal
  01/01/2025, mengetik 30/09/2026 pada tglakhir menghasilkan nilai
  **01/01/2026** (di-clamp) — tanpa alert/swal/pesan apa pun (uji 2026-09-28).
- Dropdown Provinsi/Consignee/Shipper BUKAN `<select>` native, melainkan widget
  custom `.multi-select` (`.multi-select-header`, `[role=option]` ber-`data-value`,
  ada kotak "Search..."), sehingga `page.selectOption()` tidak bisa dipakai.
  Setelah memilih, panel TETAP terbuka dan menutupi tombol Cari → wajib klik
  header sekali lagi (Escape tidak bekerja).
- Dropdown Shipper admin punya opsi **"Pilih Semua"** (data-value `null`) yang
  mencentang semua shipper; header berubah jadi "N Data Terpilih".
- Tombol **Cari** = `#lanjutcari`; setelah submit URL menjadi
  `/home/analitikscsr/?session_get=exp_<id>` — id sesi ini dibawa ke semua
  level drill-down.

## Tiga level drill-down

### Level 1 — ringkasan per provinsi tujuan (`/home/analitikscsr`)

- Heading tabel "DATA ANALITIK", ada tombol **Export Data By**.
- Kolom: No, (**Shipper** — hanya sisi admin, selalu ada walau shipper tunggal),
  **Provinsi Tujuan**, Total Biaya Pengiriman (Rp), Total Harga Barang (Rp),
  Logistic Cost Ratio (%), Aksi.
- TIDAK ada kolom Jumlah Order dan TIDAK ada kolom kota asal di level ini.
- Baris terakhir = baris TOTAL (tanpa nomor & tanpa tombol aksi).
- Aksi: textlink **Detail Kota** →
  `/home/analitikscsrbykota?kota=true&session_get=<exp>&PilihPropinsi=<id>&ShipperID=<id>`.

### Level 2 — detail kota (`/home/analitikscsrbykota`)

- Blok info "DATA BY PROVINSI": (Shipper — admin), Tanggal Permintaan Muat,
  Provinsi Tujuan, Total Biaya Pengiriman, Total Harga Barang, Logistic Cost
  Ratio. Belum memuat kota asal.
- Heading tabel "DATA ANALITIK : BY KOTA", ada tombol Export Data By.
- Kolom: No, **Kota / Kab. Asal**, **Kota / Kab. Tujuan** (ada tooltip
  `fa-info-circle` "Kota / Kab. Rute Tujuan"), **Jumlah Order**, Total Biaya
  Pengiriman (Rp), Total Harga Barang (Rp), Logistic Cost Ratio (%)
  (tooltip "(Biaya pengiriman / harga barang) * 100%"), Aksi.
- **Improve 2026-09 (poin 1 & 2)**: kolom "Kota / Kab. Asal" hanya ada di
  level ini (level 1 & 3 tidak punya), dan satu baris = satu **pasangan**
  Kota Asal → Kota Tujuan, sehingga "Jumlah Order" terbagi per pasangan
  tersebut. Diberlakukan ke semua shipper (terverifikasi 3 shipper yang punya
  data: Cipta Karya/65, Haier/277, Katalisator/26).
- Semua kolom **sortable** (class `clicknya`, ikon `ikon-sort-<field>`);
  klik header mengirim POST `/home/searchanalitikscsrkota` dengan
  `limit=20&pageNow=1&sortBy=<field>&pencarian=&sortType=ASC|DESC`
  (`sortBy=kota_asal` untuk kolom baru).
- Aksi: textlink **Detail Consignee** →
  `/home/analitikscsrconsignee?kota=true&kota=true&session_get=<exp>&PilihPropinsi=<id>&ShipperID=<id>&PilihKota=<idKotaTujuan>&PilihKotaAsal=<idKotaAsal>`
  (param `kota=true` terkirim dua kali — temuan minor).

### Level 3 — detail consignee (`/home/analitikscsrconsignee`)

- Breadcrumb "… / Detail Data : Consignee", blok info "DATA BY PROVINSI" berisi
  (Shipper — admin), Tanggal Permintaan Muat, **Kota Asal `<nama> (Provinsi :
  <prov>)`**, **Kota Tujuan `<nama> (Provinsi : <prov>)`**, **Total Order**,
  Total Biaya Pengiriman, Total Harga Barang, Logistic Cost Ratio; lalu heading
  "DETAIL DATA CONSIGNEE" + Export Data By.
- Kolom: No., **ID Order** (link ke `/order/orderdetail/<hash>`), Consignee,
  Alamat Tujuan, Total Biaya Pengiriman (Rp), Total Harga Barang (Rp),
  Logistic Cost Ratio (%).
- **Improve 2026-09 (poin 3)**: baris yang tampil HANYA order milik pasangan
  kota asal + kota tujuan yang dipilih di level 2.
- **Improve 2026-09 (poin 4)**: level ini TIDAK menampilkan kolom kota asal
  (maupun kota tujuan) — cukup di blok info.
- Tidak ada pagination / pemilih page size: jumlah baris order = angka Jumlah
  Order dari level 2 (43 baris pun dirender sekaligus, butuh ±6 detik).

## Semantik data (hasil audit 2026-09-28)

- **"Kota / Kab. Asal" = field `kota_asal` milik ORDER**, bukan kota pelabuhan
  muat dan bukan hasil parsing teks alamat. Pembanding sumber kebenaran =
  halaman admin Edit Data Order (`/order/edit_inputpesanan/<hash>`):
  `select#kota_asal` dan `select[name="kota_tujuan[]"]`.
  Contoh terverifikasi: order 20260811-06501 berpelabuhan **Dobo (Kab.
  Kepulauan Aru) → Belawan (Kota Medan)** tetapi `kota_asal = 28 (Kab. Deli
  Serdang)` dan `kota_tujuan[] = 35 (Kab. Langkat), 372 (Kab. Banggai
  Kepulauan), 127 (Kab. Bangka Barat)` — persis yang ditampilkan SCSR.
  Jadi ketidaksinkronan alamat/pelabuhan di demo adalah **kualitas data**, bukan
  bug improve.
- **Order multidrop muncul sekali per kota tujuan (per drop)**: konsekuensinya
  satu order bisa tampil di beberapa provinsi. **Biaya pengirimannya DIBAGI per
  drop** (order 20260811-06501: Rp 4.230.000 → 3 × Rp 1.410.000), sehingga
  Σ semua provinsi tetap = total biaya order (tidak ada dobel hitung).
  "Total Harga Barang" dihitung per drop juga (nilai bisa sama antar drop bila
  muatannya identik).
- Kolom Consignee & Alamat Tujuan mengikuti drop yang dipilih (bukan drop
  pertama) — terverifikasi pada 14 order multidrop.
- Konsistensi berjenjang terverifikasi untuk seluruh provinsi shipper uji:
  level 1 = Σ level 2, level 2 = Σ level 3, Jumlah Order = jumlah baris level 3,
  dan **order tidak pernah dobel di dalam satu provinsi**.
- Contoh bukti improve yang paling kuat (data demo 2026-09): provinsi Sulawesi
  Tengah & Bangka Belitung punya DUA pasangan dengan kota tujuan sama
  (`PilihKota=372` / `127`) tapi asal berbeda — Kab. Kepulauan Aru (440) = 5
  order dan Kab. Deli Serdang (28) = 9 order; daftar ordernya disjoint.

## Export Data By

- Tombol `button.btn_action_menu` "Export Data By" → dropdown 2 item:
  **Export Excel** & **Export PDF**. Endpoint per level:
  - level 1: `/home/exportexcelanalitikscsrall` & `/home/exportpdfanalitikscsr`
  - level 2: `/home/exportexcelanalitikscsrkota` & `/home/exportpdfanalitikscsrkota`
  - level 3: `/home/exportexcelanalitikscsrconsignee` & `/home/exportpdfanalitikscsrconsignee`
  Semua memakai query yang sama dengan halamannya (termasuk `PilihKotaAsal`).
- Nama file: "Analitik Shipping Cost Sales Ratio **All|By Provinsi|By Kota**
  `<nama shipper>` `<dd.mm.yyyy - dd.mm.yyyy>` - Shipper.xlsx".
- **Kota asal ikut ke export** (improve sampai ke file): level 1 = kolom
  "Kota/Kab. Asal" pada daftar order datar (No, Kota/Kab. Asal, Provinsi Tujuan,
  Kota/Kab. Tujuan, Consignee, Alamat Tujuan, ID Order, biaya, harga, ratio);
  level 2 = kolom "Kota / Kab. Asal"; level 3 = baris info "Kota Asal".
- Angka export level 1 cocok dengan layar (terukur: 104 baris order-drop,
  Σ biaya per provinsi identik dengan level 1 di layar).

## Temuan / defect hasil audit 2026-09-28

1. **Drill-down mengabaikan shipper baris saat >1 shipper dipilih** (admin).
   Dengan "Pilih Semua", klik Detail Kota pada baris shipper A membuka halaman
   ber-`ShipperID=A` dengan blok info milik A, TAPI tabelnya memuat pasangan
   kota milik shipper lain. Terbukti: Haier + Kalimantan Timur → blok info
   Rp 7.000.000, tabel 2 baris dengan TOTAL Rp 52.800.000 (Rp 45.800.000 milik
   Katalisator). Drill ke level 3 pasangan "asing" menampilkan order
   20260829-02603 / 20260625-02604 / 20260625-02602 (pemesan Katalisator) di
   halaman yang blok infonya menulis "PT. Haier Sales Indonesia".
   Didokumentasikan 2 `test.fail()` di `tests/admin/analitik-scsr.spec.ts`.
   Catatan: sisi SHIPPER **aman** — ShipperID/PilihKota/PilihKotaAsal yang
   dipalsukan di URL tidak membuka data shipper lain ("Tidak Ada Data yang
   tersedia"), jadi ini soal akurasi laporan admin, bukan kebocoran antar tenant.
2. **Logistic Cost Ratio baris TOTAL di file export = pecahan mentah**
   (mis. `0.000015632293568188`) sedangkan baris data memakai "0.01 %" dan
   layar menampilkan "0%" — terjadi di ketiga level export.
3. **Kolom baru "Jumlah Order" tidak ditotal** di baris TOTAL level 2 (sel
   kosong), padahal biaya, harga barang, dan ratio ditotal. Sama di layar & export.
4. **Nomor urut tidak mengikuti hasil sortir**: setelah sortir kolom Kota Asal,
   baris pertama bisa bernomor 2 (nomor ikut record, bukan urutan tampil).
5. **`session_get` tak dikenal** (link lama/bookmark): blok info menulis
   "Tanggal Permintaan Muat : -" lalu menampilkan Total Order & total biaya
   SELURUH periode (247 order / Rp 2.176.696.260 saat uji) sementara tabelnya
   nol baris — halaman saling bertentangan, tanpa pesan kesalahan. Bila
   session_get masih ada formatnya tapi sudah kedaluwarsa, tabel bisa
   menggantung di "Mohon tunggu sebentar" tanpa batas.
6. **`PilihKotaAsal` bersifat opsional di server**: dihapus dari URL → level 3
   menampilkan seluruh order kota tujuan tersebut (baris "Kota Asal" hilang dari
   blok info). Diisi ngawur (`99999`) → "Tidak Ada Data yang tersedia" dan blok
   info menulis "Kota Asal : (Provinsi : -)" (nama kosong) serta baris
   Total Order/biaya hilang.
7. Kosmetik: header export "Kota/Kab. Asal" (tanpa spasi) vs layar
   "Kota / Kab. Asal"; blok info export level 3 memakai "Propinsi" sedangkan
   layar "Provinsi"; baris TOTAL export level 1 mengisi kata "TOTAL" di 7 kolom;
   setiap workbook export punya sheet kedua "Worksheet 1" yang kosong; kolom
   Kota Asal tidak punya tooltip padahal Kota Tujuan punya.

## Catatan kalibrasi teknis (untuk penulis spec)

- Header tabel memecah teks ke beberapa `<span>` tanpa spasi di antaranya
  (innerText jadi "Total BiayaPengiriman (Rp)") → assertion header WAJIB
  regex ber-`\s*` ANTAR KATA, jangan string persis.
- "Kota / Kab. Asal" berakhir titik → jangan pakai `\b` penutup (gotcha yang
  sama dengan "Nama Kota / Kab." & "Harga (Rp.)").
- Baris hasil dimuat ASYNC; selagi memuat, `tbody` berisi SATU baris
  "Mohon tunggu sebentar" → **"ada baris" bukan penanda selesai**; poll sampai
  ada baris ber-link aksi / ber-link `order/orderdetail`.
- `tbody` juga menyisipkan baris kosong (spacer) dan baris terakhir = TOTAL
  (tanpa nomor & tanpa aksi) → selalu filter baris yang punya link aksi.
- Input tanggal memakai daterangepicker: `fill()` bisa ter-reset, pakai
  `pressSequentially` lalu Enter (sama seperti form jadwal Open Stack).
- Tombol Cari TIDAK bisa diambil via `getByRole('button',{name:'Cari'})` —
  glyph Font Awesome ikut ke accessible name; pakai `#lanjutcari`.

## Belum dicakup / pertanyaan terbuka

- Submenu analitik lain (Ringkasan Analitik, Freight Cost, On Time Delivery
  Rate, Shipment Accuracy) belum dikalibrasi sama sekali.
- Isi file **Export PDF** belum diperiksa (baru href & Excel).
- Filter **Provinsi** dan **Consignee** pada form pencarian belum diuji
  efeknya terhadap hasil ketiga level.
- Paging/`limit` pada POST `searchanalitikscsrkota` (limit=20) belum diuji
  untuk provinsi dengan >20 pasangan kota — data demo belum punya kasusnya.
