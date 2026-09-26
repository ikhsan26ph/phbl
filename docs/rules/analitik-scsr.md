# Analitik — Shipping Cost Sales Ratio (SCSR)

Dokumen ini **bukan** hasil pecahan .docx sumber (modul Analitik tidak ada di
dokumen rule mana pun). Isinya hasil **kalibrasi langsung ke demo**
(2026-09-26) plus dua permintaan improve dari user, sama pola dengan
`docs/rules/open-stack.md`.

## Lokasi & akses

- Menu sidebar **ANALITIK** (dropdown) ada di **Shipper** dan **Admin**.
  - Shipper: 2 submenu — "Shipping Cost Sales Ratio" (`/home/analitikscsr`),
    "Freight Cost" (`/analitik/analitikfcu`).
  - Admin: 5 submenu analitik — "Ringkasan Analitik"
    (`/dashboardanalitik/ringkasan`), "Shipping Cost Sales Ratio"
    (`/home/analitikscsr`, route SAMA dgn shipper), "Freight Cost",
    "On Time Delivery Rate" (`/analitik/analitikotdr`), "Shipment Accuracy"
    (`/home/analitikshipmentaccuracy`) — plus submenu master
    (`/analitik/masterjenismuatan`, `/analitik/masterhargabarang`) yang sudah
    dicakup `tests/admin/master.spec.ts`.
- Transporter TIDAK punya menu Analitik.

## Form pencarian

- Field: **Dari Tanggal \*** (`#tglawal`), **Sampai Tanggal \*** (`#tglakhir`),
  **Pilih Provinsi**, **Pilih Consignee**, dan — khusus admin — **Shipper \***
  (wajib, pola sama dgn Laporan admin yang wajib `#BidOwnerID`).
- Hint: "Masukkan tanggal permintaan muat (Maksimal range 12 bulan)" →
  tanggal yang difilter = tanggal permintaan muat, bukan tanggal order.
- Dropdown Provinsi/Consignee/Shipper BUKAN `<select>` native, melainkan widget
  custom `.multi-select` (`.multi-select-header`, `.multi-select-option`,
  ada kotak "Search..."), sehingga `page.selectOption()` tidak bisa dipakai.
- Tombol **Cari**; setelah submit URL menjadi
  `/home/analitikscsr/?session_get=exp_<id>` — id sesi ini dibawa ke semua
  level drill-down.

## Tiga level drill-down

### Level 1 — ringkasan per provinsi tujuan (`/home/analitikscsr`)

- Heading tabel "DATA ANALITIK", ada tombol **Export Data By**.
- Kolom: No, **Provinsi Tujuan**, Total Biaya Pengiriman (Rp), Total Harga
  Barang (Rp), Logistic Cost Ratio (%), Aksi.
- TIDAK ada kolom Jumlah Order dan TIDAK ada kolom kota asal di level ini.
- Baris terakhir = baris TOTAL (tanpa nomor & tanpa tombol aksi).
- Aksi: textlink **Detail Kota** →
  `/home/analitikscsrbykota?kota=true&session_get=<exp>&PilihPropinsi=<id>&ShipperID=<id>`.

### Level 2 — detail kota (`/home/analitikscsrbykota`)

- Heading tabel "DATA ANALITIK : BY KOTA", ada tombol Export Data By.
- Kolom: No, **Kota / Kab. Asal**, **Kota / Kab. Tujuan**, **Jumlah Order**,
  Total Biaya Pengiriman (Rp), Total Harga Barang (Rp), Logistic Cost
  Ratio (%), Aksi.
- **Improve 2026-09 (poin 1 & 2)**: kolom "Kota / Kab. Asal" hanya ada di
  level ini (level 1 & 3 tidak punya), dan satu baris = satu **pasangan**
  Kota Asal → Kota Tujuan, sehingga "Jumlah Order" terbagi per pasangan
  tersebut. Diberlakukan ke semua shipper.
- Aksi: textlink **Detail Consignee** →
  `/home/analitikscsrconsignee?kota=true&kota=true&session_get=<exp>&PilihPropinsi=<id>&ShipperID=<id>&PilihKota=<idKotaTujuan>&PilihKotaAsal=<idKotaAsal>`
  (param `kota=true` sengaja/tak sengaja terkirim dua kali — temuan minor).

### Level 3 — detail consignee (`/home/analitikscsrconsignee`)

- Breadcrumb "… / Detail Data : Consignee", heading tabel "DETAIL DATA
  CONSIGNEE", ada blok "DATA BY PROVINSI" di atasnya.
- Kolom: No., **ID Order** (link `target` ke `/order/orderdetail/<hash>`),
  Consignee, Alamat Tujuan, Total Biaya Pengiriman (Rp), Total Harga Barang
  (Rp), Logistic Cost Ratio (%).
- **Improve 2026-09 (poin 3)**: baris yang tampil HANYA order milik pasangan
  kota asal + kota tujuan yang dipilih di level 2. Bukti kalibrasi 2026-09-26:
  1. Jawa Tengah: "Kota Surabaya → Kab. Semarang, Jumlah Order 20" → tepat 20
     baris order.
  2. **Sulawesi Tengah punya DUA pasangan dengan kota TUJUAN SAMA**
     (Kab. Banggai Kepulauan, `PilihKota=372`) tapi asal berbeda:
     Kab. Kepulauan Aru (`PilihKotaAsal=440`) = 5 order, Kab. Deli Serdang
     (`PilihKotaAsal=28`) = 9 order. Detail Consignee keduanya masing-masing
     menghasilkan 5 dan 9 baris, dan **daftar ordernya sepenuhnya disjoint**
     (14 order unik, tidak ada yang muncul di dua pasangan) → membuktikan
     filter kota ASAL benar-benar diterapkan, bukan hanya kota tujuan.
     Tanpa improve ini kedua baris akan menyatu menjadi 14 order.
- **Improve 2026-09 (poin 4)**: level ini TIDAK menampilkan kolom kota asal
  (maupun kota tujuan) — memang tidak diperlukan.
- Tidak ada pagination / pemilih page size di level ini: jumlah baris order =
  angka Jumlah Order dari level 2.

## Catatan kalibrasi teknis (untuk penulis spec)

- Header tabel memecah teks ke beberapa `<span>` tanpa spasi di antaranya
  (innerText jadi "Total BiayaPengiriman (Rp)") → assertion header WAJIB
  regex ber-`\s*`, jangan string persis.
- "Kota / Kab. Asal" berakhir titik → jangan pakai `\b` penutup (gotcha yang
  sama dengan "Nama Kota / Kab." & "Harga (Rp.)").
- `tbody` menyisipkan baris kosong (spacer) → selalu filter baris yang punya
  sel berisi, jangan mengandalkan `nth()`.
- Input tanggal memakai daterangepicker: `fill()` bisa ter-reset, pakai
  `pressSequentially` lalu Enter (sama seperti form jadwal Open Stack).

## Belum dicakup / pertanyaan terbuka

- Submenu analitik lain (Ringkasan Analitik, Freight Cost, On Time Delivery
  Rate, Shipment Accuracy) belum dikalibrasi sama sekali.
- Perilaku validasi range > 12 bulan, sortir kolom, dan isi file Export Data
  By belum diuji.
