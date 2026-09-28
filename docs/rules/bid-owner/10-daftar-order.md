# Daftar Order

  - Tanggal buat order diambil dari waktu saat order tersebut dicreate oleh sistem (saat konfirmasi pesanan)
  - Order muncul di list order bid owner saat sudah konfirmasi pesanan dan masuk ke proses input muatan dan status order nya ORDER BARU
  - Saat status order ORDER BARU maka pada action menu pilihannya :
    - Edit Data Order : Jika diklik edit data order, maka akan menampilkan halaman edit data order dan bisa edit muatan
    - Pada saat melakukan edit order tanggal permintaan muat PHBL harus mengisi jam
    - Batalkan Order : Jika diklik, maka akan mengarahkan ke halaman batal order, dmembatalkan order dan statusnya menjadi “DIBATALKAN”
    - Ganti Jadwal
  - Jika pada order termasuk jadwal kapal connecting maka akan muncul button “kapal connecting nx”
  - Setelah input muatan maka status ordernya “PROSES PERJANJIAN”, Saat status order PROSES PERJANJIAN maka pada action menu pilihannya :
    - Input Perjanjian
    - Edit Muatan : Jika diklik akan diarahkan ke halaman edit muatan dan bisa edit muatan
    - Batalkan Order : jika diklik membatalkan order dan statusnya menjadi “DIBATALKAN”
  - Setelah input perjanjian maka status ordernya “PROSES VALIDASI”, saat status order PROSES VALIDASI maka pada action menu pilihannya :
    - Edit Muatan : Jika diklik akan diarahkan ke halaman edit muatan dan bisa edit muatan
  - Setelah order divalidasi terima oleh admin , status nya adalah KONFIRMASI UNIT, saat status order KONFIRMASI UNIT maka pada action menu pilihannya :
    - Download Dokumen : Jika diklik menampilkan popup download dokumen yang diupload oleh bidder
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan. Biaya tambahan harga tiap item tidak bisa diinputkan 0
  - Apabila admin validasi tolak order maka status order menjadi “ORDER DITOLAK”
  - Ketika bidder sudah melakukan konfirmasi unit maka status order menjadi “PROSES PENUGASAN”, saat status order PROSES PENUGASAN, maka pada action menu pilihannya :
    - Lihat Data Unit : Jika diklik diarahkan ke halaman data kelengkapan unit
    - Download Dokumen : Jika diklik menampilkan popup download dokumen yang diupload oleh bidder
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan. Biaya tambahan harga tiap item tidak bisa diinputkan 0
  - Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nama dokumen.
  - Jika status dokumen aanwijzing tidak aktif maka dokumen aanwijzing tidak muncul.
  - Ketika order sudah update tracking ambil kontainer maka status order menjadi “AMBIL KONTAINER”
  - Ketika order sudah update tracking stuffing (semua unit) maka status order menjadi “STUFFING”
  - Ketika order sudah update tracking kapal berlayar maka status order menjadi “KAPAL BERLAYAR”
  - Ketika order sudah update tracking kapal sandar maka status order menjadi “KAPAL SANDAR”
  - Ketika order sudah update tracking rencana dooring maka status order menjadi “RENCANA DOORING”
  - Ketika order sudah update tracking dooring (semua unit) maka status order menjadi “DOORING”
  - Ketika order sudah update tracking surat jalan maka status order menjadi “SJ Diterima Agen”
  - Ketika order sudah update tracking dokumen dikirim maka status order menjadi “DOKUMEN DIKIRIM”
  - Terdapat penyesuaian pada kondisi satu order dengan lebih dari 1 container. Jika status order adalah Rencana Dooring atau Dooring namun ada kontainer lain yang status ordernya Kapal Sandar, maka status order secara globalnya untuk suatu ID order adalah Kapal Sandar.
  - Ketika status order tracking (ambil kontainer s.d dokumen dikirim) maka pada action menu pilihannya :
    - Lihat Data Unit : Jika diklik diarahkan ke halaman data kelengkapan unit
    - Download Dokumen : Jika diklik menampilkan popup download dokumen yang diupload oleh bidder
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan. Biaya tambahan harga tiap item tidak bisa diinputkan 0
  - Jika order sudah dikerjakan semua trackingnya dan dikunci penugasan selesai maka status berubah menjadi “ORDER SELESAI”, saat status order ORDER SELESAI, maka pada action menu pilihannya :
    - Beri Nilai Pengerjaan Bidder : Jika diklik diarahkan ke halaman rating
    - Lihat Data Unit : Jika diklik diarahkan ke halaman data kelengkapan unit
    - Download Dokumen : Jika diklik menampilkan popup download dokumen yang diupload oleh bidder
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan. Biaya tambahan harga tiap item tidak bisa diinputkan 0
  - Terdapat filter status order yang digunakan untuk mencari data order berdasarkan status order
  - Terdapat filter by Nomor Kontainer yang digunakan untuk mencari data order berdasarkan nomor kontainer. Input field nomor kontainer auto kapital. Pada field ini terdapat pembatasan input, yaitu hanya dapat memasukkan huruf dan angka dengan panjang maksimum 11 karakter. Input tidak diperbolehkan mengandung spasi atau karakter khusus
  - Terdapat filter by Kapal Connecting berupa checkbox yang digunakan untuk mencari data order dengan jenis jadwal kapal connecting.
  - Untuk filter Nama Bidder, ditampilkan dalam bentuk free text. Bid owner dapat mencari data nama bidder dengan mengetikkan pada field filter Bidder
  - Saat order sudah dilakukan konfirmasi unit oleh bidder maka pada list order muncul textlink “Info Tracking” dan menampilkan nomor kontainer dan status tracking tiap kontainer
  - Jika bid owner input biaya tambahan pada order maka akan muncul di bagian list order di bawah jumlah dan jenis kontainer
  - Bid owner dapat memberikan rating ke bidder apabila status order “ORDER SELESAI” dan maksimal h+7 dari order selesai. Jika lebih dari itu bid owner tidak bisa memberi rating dan pilihan “Beri Nilai Pengerjaan Bidder” akan hilang
  - Jika order dari satoria melalui system PNP maka ketika admin validasi order akan ada pilihan action menu “Lihat QR Code” dan ketika diakses akan menampilkan kode qr code dan bisa download qr code nya
  - Untuk edit tanggal permintaan muat order PNP saat ini dilepas. Ketika PNP / Admin edit tanggal permintaan muat, maka sistem otomatis akan mengirim notifikasi whatsapp kepada admin PHBID
  - Jika order dari sistem PNP maka akan ada penanda label By PNP dibagian info order. Label ini tampil pada daftar order bid owner, bidder, admin.
  - Nantinya data-data order bid owner yang telah ada akan masuk kedalam penarikan data spreadsheet data saving cost. Pada spreadsheet ini ditampilkan data order yang berjalan per jenis kontainer dan saving cost nya :
    - Data order yang dibatalkan ataupun ditolak admin tidak muncul pada spreadsheet penarikan data saving cost
    - Untuk Harga_Average_Tak_Terpilih apabila harga penawaran hanya 1 dan telah dipilih jadi order maka nominal yang ditampilkan ialah Rp 0
    - Apabila harga penawaran untuk jenis kontainer tesebut lebih dari satu maka data Harga_Average_Tak_Terpilih yang dihitung : average (nominal harga penawaran yang tidak terpilih)
    - Untuk Saving_Cost apabila harga penawaran hanya 1 dan telah dipilih jadi order maka nominal yang ditampilkan ialah Rp 0
    - Rumus saving cost ialah : Harga_Average_Tak_Terpilih -  Harga_Menang
  - Jika bid owner melakukan filter halaman daftar order, kemudian masuk ke beberapa halaman : Edit Data Muatan, Batalkan Order, Penilaian Bidder. setelah itu klik “Kembali”. posisi daftar order tetap terfilter.
  - Jika bid owner melakukan filter halaman daftar order, kemudian melakukan beberapa aksi : Edit Data Muatan, Batalkan Order, Penilaian Bidder. setelah berhasil redirect ke halaman daftar order dengan posisi terfilter.
  - Jika bid owner ingin menghilangkan filter data halaman daftar order dengan cara klik reset kemudian filter kembali.

## Detail Order

- Untuk status order ORDER BARU , yang terbuka adalah bagian PEMESANAN
  - Menampilkan data pemuatan barang dan penerima barang
- Untuk status order PROSES PERJANJIAN yang terbuka adalah bagian PEMESANAN
  - Apabila ada dokumen packing list & penanganan khusus , bid owner , bidder dan admin bisa mendownload dokumen tersebut
  - Menampilkan data muatan barang
- Untuk status order PROSES VALIDASI yang terbuka adalah bagian PERJANJIAN PENGIRIMAN
  - Menampilkan dokumen perjanjian pengiriman
  - Tanggal validasi Perjanjian Pengiriman yang muncul adalah “Menunggu Validasi PH BID”
- Untuk status KONFIRMASI UNIT , yang terbuka adalah bagian PERJANJIAN PENGIRIMAN
  - Menampilkan dokumen perjanjian pengiriman dan bisa export dalam bentuk pdf
  - Tanggal Validasi Perjanjian Pengiriman yang muncul adalah waktu saat admin validasi order terkait
- Untuk status PROSES PENUGASAN , yang terbuka adalah bagian STATUS PENGIRIMAN
  - Menampilkan card data tracking namun blank dan terdapat keterangan “Tidak ada data tersedia”
- Untuk status AMBIL KONTAINER s.d DOKUMEN DIKIRIM , yang terbuka adalah bagian STATUS PENGIRIMAN
  - Menampilkan taha[an status trackingnya dan textlink data detail
  - Jika klik data detail menampilkan rincian data tracking dan foto yang diupload saat tracking
- Untuk status ORDER SELESAI , yang terbuka adalah bagian PENILAIAN ORDER
  - Jika bid owner belum beri penilaian , keterangan yang muncul adalah Belum ada penilaian
  - Jika bid owner belum beri penilaian & telah lewat 7 hari , keterangan yang muncul adalah Tidak ada penilaian
  - Jika bid owner sudah beri penilaian , maka akan muncul jumlah Bintang dan ulasan yang telah diberikan untuk order tersebut
- Untuk status DIBATALKAN & ORDER DITOLAK , yang terbuka adalah bagian PEMESANAN
- Di halaman detail order, pada pop up info harga, menampilkan data harga sebelum PPn beserta nilai PPn dan PPh yang ada pada order tersebut.
- Jika pada detail order termasuk jadwal kapal connecting maka akan muncul button “kapal connecting nx”
- Untuk data lama yang tidak memiliki nilai PPn dan PPh maka akan menampikan strip (-)
- Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
- Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.
- Dokumen aanwijzing ditampilkan berupa popup.

## Batalkan Order

- Pilihan menu ini akan muncul pada status order ORDER BARU s.d status ORDER SELESAI
- Namun Bid Owner hanya dapat melakukan batal order dari status ORDER BARU s.d PROSES PERJANJIAN
- Jika bid owner klik BATALKAN ORDER dengan status order PROSES VALIDASI s.d. ORDER SELESAI, maka akan menampilkan alert ‘Tidak bisa batal! Order sudah melewati tahap perjanjian’
- Ketika klik menu Batalkan Order, maka akan menampilkan halaman Batalkan Order
- Pada halaman Batalkan Order, input Alasan Batal Order bersifat required
- Jika bid owner tidak mengisi alasan batal order, maka akan tampil alert ‘Masukkan Alasan Batal Order’
- Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”
- Button action menu pada order yang telah di Batalkan akan disabled

## Edit Data Muatan

- Pilihan menu ini akan muncul pada status PROSES PERJANIAN s.d ORDER SELESAI
- Bid Owner dapat melakukan edit data Muatan pada order dengan status PROSES PERJANJIAN s.d PROSES VALIDASI
- Jika admin klik EDIT DATA MUATAN dengan status order KONFRIMASI UNIT s.d. ORDER SELESAI, maka akan menampilkan alert ‘Tidak bisa edit! Order sudah melewati tahap perjanjian’
- Jika diklik , admin bisa bantu untuk edit muatan pada order terkait dan rule nya hampir sama seperti di halaman input muatan

## Input / Edit Nomor Referensi (temuan kalibrasi 2026-09-26)

Bagian ini TIDAK ada di dokumen rule sumber — hasil kalibrasi langsung ke demo.
Nilai inilah yang kemudian tampil sebagai baris kedua nama item invoice jasa
pengiriman (lihat `docs/rules/administrator/07-daftar-order.md` dan
`docs/rules/bidder/08-daftar-order.md`, "Improve 2026-09").

- Action menu Daftar Order di sisi Shipper punya item **"Input Nomor Referensi"**
  (order belum punya referensi) atau **"Edit Nomor Referensi"** (sudah punya).
  Sisi ADMIN TIDAK punya item ini (terverifikasi: 0 trigger pada 100 order yang
  dirender admin, sementara shipper merender 24 trigger untuk 12 order karena
  tiap order punya varian desktop + mobile).
- Status order yang menampilkan menu ini saat kalibrasi: ORDER BARU, PROSES
  VALIDASI, KONFIRMASI UNIT, PROSES PENUGASAN.
- Alur klik: POST `general/cekLoginAjax` → POST `order/cek_nomor_referensi`
  {OrderID}. Bila status != SUKSES muncul SweetAlert2 (dua baris pesan, tombol
  "Mengerti"); bila SUKSES modal `#modalNomorReferensi` terbuka memuat Nomor
  Order, Rute, Permintaan Muat, input `#input_nomor_referensi` (hint "Misal
  nomor dokumen inbound : 20210809-12092"), tombol Batal dan
  `#btn_simpan_nomor_referensi`.
- Nomor Referensi bersifat WAJIB di modal: simpan dengan input kosong
  memunculkan **popover Bootstrap transient ±2 detik** "Masukkan Nomor
  Referensi" (bukan window.alert), modal tetap terbuka dan tidak ada request
  simpan yang terkirim.
- Penyimpanan via POST `order/save_nomor_referensi` {OrderID, nomor_referensi};
  sukses → modal tertutup + SweetAlert2 pesan sukses + tabel di-refresh.
- TIDAK ada batasan panjang maupun karakter di sisi klien (field bebas teks).
  Order demo 20260811-06501 bahkan menyimpan `7100399697, 7100399697,
  7100399697` pada SATU field `#nomor_referensi` — nilai berulang itu ikut
  tampil apa adanya di nama item invoice. 4 order multidrop lain yang diperiksa
  justru ber-referensi kosong, jadi pengulangan itu BUKAN pola sistematis
  multidrop melainkan isi data order tersebut.
- Order tanpa nomor referensi: Detail Order menampilkan strip "-", sedangkan
  nama item invoice TIDAK menambahkan baris kedua sama sekali.

### Hasil audit mendalam 2026-09-28

- **Jendela ketersediaan menu (terukur pada 100 order shipper)**: menu Input /
  Edit Nomor Referensi ADA pada status ORDER BARU, PROSES VALIDASI, KONFIRMASI
  UNIT, PROSES PENUGASAN, AMBIL KONTAINER, STUFFING; **TIDAK ADA** pada KAPAL
  SANDAR, RENCANA DOORING, SJ DITERIMA AGEN, DOKUMEN DIKIRIM, ORDER SELESAI
  (0 dari 26 order di tahap-tahap itu).
- Karena Proses Invoice baru terbuka mulai **KAPAL SANDAR** (order tahap awal
  ditolak: `/order/buatinvoice/<id>` → redirect + alert "Anda Tidak Memiliki
  Akses Ke Halaman Tersebut"), **tidak ada satu tahap pun di mana shipper bisa
  mengisi/memperbaiki No. Referensi untuk order yang sudah bisa diinvoice**.
  Ini gap fungsional improve 2026-09 (didokumentasikan `test.fail()` di
  `tests/shipper/nomor-referensi.spec.ts`).
- **Admin punya jalur lain**: field `#nomor_referensi` tersedia di halaman
  admin Edit Data Order (`/order/edit_inputpesanan/<hash>`) dengan nilai sama
  seperti Detail Order — jadi pernyataan lama "admin tidak bisa mengubah nomor
  referensi" HANYA berlaku untuk action menu, bukan untuk field ini. Halaman itu
  sendiri ditolak untuk status ORDER SELESAI, sehingga setelah order selesai
  nilainya tidak bisa diubah siapa pun lewat UI.
- Shipper TIDAK punya menu Proses Invoice sama sekali (0 link
  `order/uploadinvoice` pada 100 order) — pembuatan invoice hanya di sisi admin
  & transporter.
