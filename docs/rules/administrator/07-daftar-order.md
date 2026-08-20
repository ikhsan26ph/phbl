# Daftar Order

  - Tanggal buat order diambil dari waktu saat order tersebut di create oleh sistem (saat konfirmasi pesanan)
  - Order muncul di list order admin saat sudah konfirmasi pesanan dan masuk ke proses input muatan dan status order nya ORDER BARU.
  - Jika pada order termasuk jadwal kapal connecting maka akan muncul button “kapal connecting nx”
  - Saat status order ORDER BARU maka pada action menu pilihannya :
    - Input Muatan
    - Edit Data Order : Jika di klik diarahkan ke halaman edit data order
    - Tolak Order  : jika diklik akan menolak order dan statusnya menjadi “ORDER DITOLAK”
  - Setelah input muatan maka status ordernya “PROSES PERJANJIAN”, Saat status order PROSES PERJANJIAN maka pada action menu pilihannya :
    - Input Perjanjian
    - Edit Muatan : Jika diklik akan diarahkan ke halaman edit muatan dan bisa edit muatan
    - Edit Data Order : Jika diklik diarahkan ke halaman edit data order
    - Tolak Order : jika diklik akan menolak order dan statusnya menjadi “ORDER DITOLAK”
  - Setelah input perjanjian maka status ordernya “PROSES VALIDASI”, saat status order PROSES VALIDASI maka pada action menu pilihannya :
    - Alihkan Order : Jika diklik akan diarahkan ke halaman alihkan order
    - Edit Muatan : Jika diklik akan diarahkan ke halaman edit muatan dan bisa edit muatan
    - Edit Data Order : Jika diklik diarahkan ke halaman edit data order
  - Setelah order divalidasi terima oleh admin , status nya adalah KONFIRMASI UNIT, saat status order KONFIRMASI UNIT maka pada action menu pilihannya :
    - Input Kelengkapan Unit : Jika diklik diarahkan ke halaman input unit. Pada field ini terdapat pembatasan input, yaitu hanya dapat memasukkan huruf dan angka dengan panjang maksimum 11 karakter. Input tidak diperbolehkan mengandung spasi atau karakter khusus
    - Alihkan Order : Jika diklik akan diarahkan ke halaman alihkan order
    - Upload Dokumen : Jika diklik diarahkan ke halaman upload dokumen
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan
  - Apabila admin validasi tolak order maka status order menjadi “ORDER DITOLAK”
  - Ketika bidder sudah melakukan konfirmasi unit maka status order menjadi “PROSES PENUGASAN”, saat status order PROSES PENUGASAN, maka pada action menu pilihannya :
    - Lihat Data Unit : Jika diklik diarahkan ke halaman data kelengkapan unit
    - Upload Dokumen : Jika diklik diarahkan ke halaman upload dokumen
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan
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
    - Upload Dokumen : Jika diklik diarahkan ke halaman upload dokumen
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan
  - Jika order sudah dikerjakan semua trackingnya dan dikunci penugasan selesai maka status berubah menjadi “ORDER SELESAI”, saat status order ORDER SELESAI, maka pada action menu pilihannya :
    - Beri Nilai Pengerjaan Bidder : Jika diklik diarahkan ke halaman rating admin
    - Lihat Data Unit : Jika diklik diarahkan ke halaman data kelengkapan unit
    - Upload Dokumen : Jika diklik diarahkan ke halaman upload dokumen
    - Biaya Tambahan : Jika diklik diarahkan ke halaman biaya tambahan dan dapat input,edit,hapus biaya tambahan
  - Terdapat filter status order yang digunakan untuk mencari data order berdasarkan status order
  - Terdapat filter by Nomor Kontainer yang digunakan untuk mencari data order berdasarkan nomor kontainer. Input field nomor kontainer auto kapital. Pada filed ini terdapat pembatasan field input nomor kontainer hanya huruf dan angka, maks 11 karakter  dan tidak bisa karakter dan tanpa spasi
  - Terdapat filter by Kapal Connecting berupa checkbox yang digunakan untuk mencari data order dengan jenis jadwal kapal connecting.
  - Saat order sudah dilakukan konfirmasi unit oleh bidder maka pada list order muncul textlink “Info Tracking” dan menampilkan nomor kontainer dan status tracking tiap kontainer
  - Jika bid owner atau admin input biaya tambahan pada order maka akan muncul di bagian list order dibawah jumlah dan jenis kontainer
  - Admin dapat memberi rating tidak ada Batasan waktu. Admin dapat beri rating ke bidder minimal 1.0 dan maksimal 5.0
  - Jika order dari satoria melalui system PNP maka ketika admin validasi order aka nada pilihan action menu “Lihat QR Code” dan ketika diakses akan menampilka kode qr code dan bisa download qr code nya
  - Jika order dari sistem PNP maka akan ada penanda label By PNP dibagian info order. Label ini tampil pada daftar order bid owner, bidder, admin.
  - Untuk edit tanggal permintaan muat order PNP saat ini dilepas. Ketika PNP / Admin edit tanggal permintaan muat, maka sistem otomatis akan mengirim notifikasi whatsapp kepada admin PHBID
  - Jika bid owner melakukan filter halaman daftar order, kemudian masuk ke beberapa halaman : Input Muatan, Input Perjanjian, Batalkan Order, Ganti Jadwal, Edit Data Muatan, Validasi Order, Input Kelengkapan Unit, Upload Dokumen, Alihkan Order, Proses Invoice, Lihat Data Unit, History Perubahan Data & Detail Order. setelah itu klik “Kembali”. posisi daftar order tetap terfilter.
  - Jika bid owner melakukan filter halaman daftar order, kemudian melakukan beberapa aksi : Edit Data Order, Batalkan Order, Ganti Jadwal, Edit Data Muatan, Validasi Order, Input Kelengkapan Unit, Alihkan Order, & Edit Status Order. setelah berhasil redirect ke halaman daftar order dengan posisi terfilter.
  - Jika bid owner ingin menghilangkan filter data halaman daftar order dengan cara klik reset kemudian filter kembali.

## Edit Data Order

- Pilihan menu ini akan muncul apabila status order nya mulai status ORDER BARU s.d status ORDER SELESAI
- Admin dapat melakukan edit status order Mulai dari status
- Namun jika admin klik Edit Data Order, dengan status ORDER SELESAI, maka akan menampilkan alert ‘Tidak bisa edit! Order sudah tahap selesai’
- Defaultnya adalah disable semua. Jika ada data yang ingin diedit, maka centang checkbox Edit Data pada bagian Detail Order, Pemuatan Barang dan Penerima Barang
- Perubahan yang dilakukan oleh admin ketika edit data order akan tercatat pada History Perubahan Data
- Pada sesi ini admin dapat memilih tanggal dan jam permintaan muat menggunakan datepicker, serta input yang disimpan sesuai dengan pilihan yang telah ditentukan.
- Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”

## Batal Order

      - Pilihan menu ini akan muncul pada status order ORDER BARU s.d status ORDER SELESAI
      - Namun Admin hanya dapat melakukan batal order dari status ORDER BARU s.d STUFFING
      - Jika admin klik BATALKAN ORDER dengan status order KAPAL BERLAYAR s.d. ORDER SELESAI, maka akan menampilkan alert ‘Tidak bisa batal! Order sudah melewati tahap kapal berlayar’
      - Ketika klik menu Batalkan Order, maka akan menampilkan halaman Batalkan Order
      - Pada halaman Batalkan Order, input Alasan Batal Order bersifat required
      - Jika admin tidak mengisi alasan batal order, maka akan tampil alert ‘Masukkan Alasan Batal Order’
      - Button action menu pada order yang telah di Batalkan akan disabled
      - Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”

## Edit Data Muatan

- Pilihan menu ini akan muncul pada status PROSES PERJANIAN s.d ORDER SELESAI
- Admin dapat melakukan edit data Muatan pada order dengan status PROSES PERJANJIAN s.d STUFFING
- Jika admin klik EDIT DATA MUATAN dengan status order KAPAL BERLAYAR s.d. ORDER SELESAI, maka akan menampilkan alert ‘Tidak bisa edit! Order sudah melewati tahap kapal berlayar’
- Jika diklik , admin bisa bantu untuk edit muatan pada order terkait dan rule nya hampir sama seperti di halaman input muatan

## Validasi Order

- Tombol ini muncul pada order dengan status PROSES VALIDASI
- Tanggal yang muncul di detail perjanjian pengiriman adalah tanggal saat bid owner submit perjanjian
- Admin bisa terima order atau tolak order, jika tolak order maka akan input alasan menolak order
- Setelah submit terima order , mengirim notif kepada bid owner dan bidder terkait
- Setelah tolak order , mengirim notif kepad bid owner terkait bahwa perjanjain ditolak
- Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”

## Alihkan Order

- Pilihan menu ini akan muncul apabila status order nya PROSES VALIDASI s.d ORDER SELESAI
- Admin dapat melakukan alihkan order apabila status ordernya PROSES VALIDASI s.d STUFFING
- Ketika admin klik ALIHKAN ORDER pada status order setelah STUFFING maka akan tampil alert ‘Tidak bisa alihkan! Order sudah melewati tahap kapal berlayar’
- Jika admin melakukan alihkan order dari status PROSES VALIDASI maka order baru yang dibuat statusnya PROSES VALIDASI dan order lama menjadi DIBATALKAN dengan Keterangan di strip (-)
- Jika admin melakukan alihkan order dari status KONFIRMASI UNIT maka order baru yang dibuat statusnya KONFIRMASI UNIT dan order lama menjadi DIBATALKAN dengan Keterangan di strip (-)
- Jika admin melakukan alihkan order dari status PROSES PENUGASAN maka order baru yang dibuat statusnya KONFIRMASI UNIT dan order lama menjadi DIBATALKAN dengan Keterangan di strip (-)
- Jika admin melakukan alihkan order dari status STUFFING maka order baru yang dibuat statusnya KONFIRMASI UNIT dan order lama menjadi DIBATALKAN dengan Keterangan di strip (-)
- Harga penawaran yang lama tidak bisa dipilih jadi saat alihkan order harus memilih harga lainnya
- Pada harga penawaran yang tampil di halaman alihkan order , kurang lebih sama seperti rule-rule yang ada di cari penawaran bid owner (terkait update harga, closing time, belum ada jadwal, tgl rencana akhir kirim)
- Setelah admin klik Pesan pada harga lainnya akan diarahkan ke halaman konfirmasi order ,pada halaman ini admin  hanya bisa view data pemuatan barang dan penerima barang (tidak bisa diubah)
- Kemudian setelah konfirmasi order diarahkan ke halaman konfirmasi data muatan. Di halaman ini admin hanya dapat lihat data muatan (tidak bisa diubah)
- Setelah order dialihkan , order lama statusnya DIBATALKAN dan tombol action menu disable. Sedangkan order yang dialihkan akan tercreated order baru
- Jika lelang dilakukan request update harga, maka harga-harga sebelumnya akan jadi expired
- Jika lelang masih proses update harga maka di harga penawaran akan muncul informasi PROSES UPDATE HARGA
- Ketika lelang proses update harga maka ketika klik tombol Expired akan muncul alert “Harga sudah tidak berlaku, tunggu sampai update harga penawaran dari bidder berakhir”
- Ketika proses update harga berakhir maka ketika dilakukan filter ataupun sortir, data yang ditampilkan ialah harga baru terlebih dahulu baru harga-harga yang expired. Untuk rule filter dan sortir ini masih sama seperti sebelumnya

## Input Kelengkapan Unit

- Untuk step input unit data ada beberapa aturan :
  - Jika input data unit maka data nopol dan nama sopir wajib diisi
  - Untuk nomor container dan segel tidak bias sama antar data unit
  - Pada field input nomor kontaine terdapat pembatasan input, yaitu hanya dapat memasukkan huruf dan angka dengan panjang maksimum 11 karakter. Input tidak diperbolehkan mengandung spasi atau karakter khusus
  - Field input no. telp sopir wajib diisi . Karakter yang dapat dimasukkan adalah angka dan simbol "-" (tanda strip)
  - Jika berhasil input data unit maka akan mengirim notif kelengkapan data unit ke bid owner dalam bentuk email dan wa
- Setelah input unit, maka status ordernya ialah PROSES PENUGASAN
- Pada halaman lihat data unit akan menampilkan data unit yang telah diinputkan, jika saat input unit admin pilih lewati proses input unit maka pada halaman lihat data unit ditampilkan keterangan “*) Data unit menunggu bidder update pengiriman”
- Pada halaman lihat data unit ada tombol edit unit. Tombol edit unit aktif apabila order belum dikerjakan tracking, jika unit pada order sudah dikerjakan tracking maka tidak bisa dilakukan edit unit
- Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”
- Pada halaman edit data unit ketentuannya sama seperti saat input unit

## Upload Dokumen

- Pilihan menu ini akan muncul pada status order yang sudah divalidasi admin (KONFIRMASI UNIT hingga ORDER SELESAI)
- Admin dapat mengupload file dokumen tambahan dengan format pdf .jpg atau .png dan maksimal ukuran file 4mb
- Jika lebih dari 4mb muncul alert “Ukuran File Melebihi 4 MB”
- Jika file tidak sesuai format maka muncul alert “Format file tidak sesuai”
- Jumlah file yang dapat diupload bersamaan maksimal 10 file
- Admin dapat melihat, mendownload, menghapus file dokumen tambahan yang sudah diupload

## Biaya Tambahan

      - Admin dapat input, edit, hapus biaya tambahan mulai status order KONFIRMASI UNIT s.d ORDER SELESAI
      - Nominal harga per item yang ditambahkan pada biaya tambahan tidak bisa 0

## Beri Nilai Pengerjaan Bidder

      - Ketika status order ORDER SELESAI maka admin dapat beri rating ke bidder
      - Rating minimal 1.0 dan maksimal 5.0
      - Tidak ada Batasan waktu admin beri rating

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
- Untuk data lama yang tidak memiliki nilai PPn dan PPh maka akan menampilkan strip (-)
- Jika pada order termasuk jadwal kapal connecting maka akan muncul button “kapal connecting nx”
- Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nama dokumen.
- Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.
- Dokumen aanwijzing ditampilkan berupa popup.

## Ganti Jadwal

      - Pilihan menu ini akan muncul pada status order ORDER BARU s.d ORDER SELESAI
      - Namun admin dapat melakukan Ganti Jadwal hanya pada status order ORDER BARU s.d. KAPAL BERLAYAR
      - Jika admin klik GANTI JADWAL pada status order KAPAL SANDAR s.d. ORDER SELESAI, maka akan menampilkan alert ‘Tidak bisa ganti! Order sudah melewati tahapan kapal sandar’
      - Jika jenis jadwal yang ditampilkan adalah Kapal Direct / Transit, maka form Ganti Jadwal hanya tampil informasi kapal globalnya saja, yang terdiri dari :
        - Kapal
        - Voyage
        - Closing Time
        - Berangkat (ETD)
        - Tiba (ETA)
      - jika jenis jadwal kapal yang ditampilkan adalah Kapal Connecting, maka form Ganti Jadwal akan tampil informais data kapal global dan detail kapal connectingnya. Yang terdiri dari :
        - Kapal
        - Voyage
        - Closing Time
        - Berangkat (ETD)
        - Tiba (ETA)
        - Pelabuhan Connecting
        - Kapal Connecting
        - Voyage
        - ETA Kapal
        - ETD Kapal
      - Jika sebelumnya jadwal kapal tampil "Kapal Direct / Transit" kemudian diganti menjadi "Kapal Connecting", maka:
        - Data pelayaran dan data kapal global tetap tampil default
        - Pada section bawahnya tampil form untuk input data kapal connecting dengan default datanya adalah kosong / tampil placeholder. Admin dapat menambahkan data connectingnya langsung
      - Jika sebelumnya jenis jadwal kapal tampil "Kapal Connecting" kemudian diganti menjadi "Kapal Direct / Transit", maka:
        - Data pelayaran dan data kapal global tetap tampil default (data tetap tampil dan tidak hilang)
        - Untuk data connectingnya (satu div) akan hilang. Hanya sisa div kapal global saja
      - Jika sebelumnya kapal connecting, kemudian diubah kapal direct / transit, dan diubah lagi ke connecting, maka interaksi sistemnya akan tampil kembali section data kapal connectingnya dengan data sebelumnya
      - Jika jenis jadwal kapal sebelumnya direct / transit kemudian diganti ke kapal connecting maka:
        - Terdapat label "Berangkat (ETD) : Tanggal berangkat dari pelabuhan awal. Tiba (ETA) : Tanggal tiba pada pelabuhan paling akhir " di bagian bawah
        - Section Data Kapal Connecting tampil dengan kondisi kosong (tersedia tambah kapal connecting dan hapus connecting)
        - Data kapal global masih tampil sama
      - Ketika di klik Simpan dan terdapat perubahan jenis jadwal kapal, maka data connecting pada card pelayaran, daftar order, dan halaman lain yang menampilkan data connecting terkait order tersebut harus diperbarui atau dihapus sesuai perubahan.
      - Tanggal berangkat (ETD) yang aktif adalah setelah tanggal closing time hingga tidak terbatas kebelakang
      - Tanggal tiba (ETA) yang aktif adalah setelah tanggal berangkat (ETD) hingga tidak terbatas kebelakang
      - Default field pelayaran adalah disabled. Jika admin ingin edit data pelayaran, maka harus checklist checkbox edit pelayaran
      - Bid Owner akan menerima notifikasi email dan wa terkait perubahan jadwal di order tersebut
      - Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”
      - Jika admin mengganti jadwal, maka akan muncul notifikasi email yang menampilkan data detail bidder, nomor lelang, dan rute. Serta ada informasi Jadwal Lama dan Jadwal Baru.

## Edit Status Order

      - Pilihan menu ini akan muncul pada status order PROSES PENUGASAN s.d ORDER SELESAI
      - Admin dapat memundurkan status dari ORDER SELESAI – KONFIRMASI UNIT, termasuk tahapan tracking baru SJ DIterima Agen
      - Data order sebelumnya ketika setelah melakukan edit status order akan otomatis hilang
      - Edit status order hanya dapat dilakukan oleh admin, dan sub user admin jika ada akses
      - Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”

## History Perubahan Data Order

      - Pilihan menu ini akan muncul jika admin melakukan edit data order, ganti jadwal, atau edit status order
      - Edit by menampilkan email dari generate akun yang melakukan perubahan
      - History perubahan data order hanya bisa dilihat oleh admin
      - Jika admin melakukan perubahan data tanpa merubah jenis jadwalnya, maka di halaman ini mencatat SEMUA DATA yang telah diubah. Termasuk jika ada perubahan di section Data Kapal Connecting.
      - Jika admin mengganti jenis jadwal dari DIRECT to CONNECTING, maka akan tampil Jenis jadwal dan data connecting yang ditambahkan. Data connecting ditulis dengan 1, 2, dst
      - Jika ada perubahan data kapal global, maka data tersebut juga dicatat di riwayat perubahan data
      - Jika admin mengganti jenis jadwal dari CONNECTING to DIRECT, maka akan tampil jenis jadwalnya saja.
      - Jika ada perubahan data kapal global, maka data tersebut juga dicatat di riwayat perubahan data
      - Jika admin melakukan tambah data kapal connecting saja, maka akan tampil data kapal connecting yang ditambahkan. Pencatatan dilanjut ke 2, 3, dst (sesuai dengan jumlah connecting yang ditambahkan)
      - Jika admin melakukan hapus data connecting, maka akan tampil data kapal connecting yang dihapus oleh admin

## Proses Invoice

- Pada action menu dengan status ‘KAPAL SANDAR’ akan menampilkan submenu Proses Invoice. Ketika di klik maka akan menampilkan halaman Invoice
- Pada action menu dengan status ‘KONFIRMASI UNIT s.d. DOKUMEN DIKIRIM’ tidak menampilkan submenu Proses Invoice
- Terdapat penyesuaian nama button “upload invoice” menjadi upload tagihan. pabila di klik maka akan menampilkan pop up upload dokumen tagihan
- Terdapat penyesuaian rule untuk buat invoice. Bidder dan admin dapat melakukan proses invoice pada tahap KAPAL SANDAR - ORDER SELESAI
- Jika bidder klik menu Proses Invoice pada status order PROSES PENUGASAN - KAPAL BERLAYAR, maka akan menampilkan alert 'Tidak Bisa! Proses invoice akan tersedia setelah tahap kapal sandar'
- Efek penyesuaian ini, apabila order statusnya KAPAL SANDAR kemudian dimundurkan ke status KAPAL BERLAYAR, maka ketika di klik proses invoice tetap menampilkan alert 'Tidak Bisa! Proses invoice akan tersedia setelah tahap kapal sandar'
- Namun untuk data invoice yang telah di buat atau di upload pada order tersebut masih tetap tersimpan dan kesempatan invoice sama
- Nama dokumen yang terdapat pada tabel tersebut berasal dari upload tagihan
- Terdapat history hari dan waktu admin membuat proses invoice yang tampil pada tabel Update invoice
- Pada halaman invoice,   memiliki opsi untuk membuat invoice atau mengunggah invoice
- Invoice yang dapat dibuat oleh   meliputi Invoice Jasa Pengiriman dan Invoice Biaya Tambahan
- Invoice jasa pengiriman harus dibuat lebih dulu sebelum invoice biaya tambahan
- Kesempatan untuk membuat invoice jasa pengiriman atau biaya tambahan masing-masing 3x
- Data informasi Perusahaan diambil dari data bidder yang meliputi Nama Perusahaan, Alamat Perusahaan, Nomor Telepon, dan Alamat Email
- Data informasi bid owner diambil dari data bid owner yang meliputi Nama Bid Owner dan Alamat Bid Owner
- Semua data pada informasi Perusahaan dan informasi bid owner otomatis ngedraft dari data  bidder dan bid owner. Namun  admin masih dapat melakukan edit data tersebut
- Data pada kolom ID Order secara otomatis tampil sesuai dengan ID Order yang sedang dibuatkan invoicenya dan kolom tersebut disabled
- Pada kolom nomor invoice, admin dapat menginputkan inputan karakter yang diperbolehkan selain huruf dan angka adalah titik, strip, garis miring, kurung buka, kurung tutup, spasi, dan semua karakter otomatis uppercase
- Default tanggal invoice yang tampil adalah hari ini. Namun untuk range tanggal yang aktif adalah terhitung dari tanggal validasi order oleh admin hingga tidak terbatas kebelakang. Contoh : Tanggal validasi admin => 20/02/2023, maka range tanggal aktif mulai dari 20/02/2023 hingga tidak terbatas kebelakang
- Range tanggal aktif Jatuh tempo terhitung dari tanggal invoice hingga tidak terbatas ke belakang. Contoh : Tanggal invoice => 21/02/2023, maka range tanggal aktif dimulai dari 21/02/2023 hingga tidak terbatas kebelakang
- Data pada informasi pembayaran meliputi data nomor Rekening, nama bank, atas nama, dan Catatan untuk bid owner.
- Data pada informasi pembayaran diambil berdasarkan jenis bid owner. Jika bid owner tersebut termasuk kategori bid owner direct, maka informasi pembayaran yang tampil diambil dari data nomor Rekening   yang aktif.
- Sedangkan jika bid owner tersebut termasuk kategori bid owner satu pintu, maka informasi pembayaran yang tampil diambil dari data nomor virtual account yang terdaftar di relasi satu pintu dengan ketambahan label 1 pintu di sebelah tulisan Nomor Rekening
- Kolom Catatan untuk bid owner bersifat optional. Jika menambahkan Catatan maka akan tampil pada generate invoicenya
- Rule setting fitur buat invoice di sisi admin :
    - Jika belum dilakukan buat invoice, untuk default toogle buttonnya yaitu kondisi on dan disabled dengan sisa kesempatan 3x
    - Jika setelah membuat invoice jasa pengiriman atau biaya tambahan, maka toogle buttonnya menjadi off dan enable dengan sisa kesempatan 2x
    - Ketika toogle button dalam kondisi off, maka admin dan bidder tidak dapat membuat invoice jasa pengiriman atau biaya tambahan
    - Ketika toogle button dalam kondisi on, maka admin dan bidder dapat membuat invoice jasa pengiriman atau biaya tambahan
    - Jika sisa kesempatan sudah habis / (sisa 0x) maka toogle buttonnya menjadi off dan disabled
- Ketika klik buat invoice jasa pengiriman terdapat beberapa rule pengecekan, antara lain :
    - Jika bid owner tersebut merupakan bid owner direct, maka ketika di klik buat invoice jasa pengiriman akan langsung diarahkan ke halaman form buat invoice
    - Jika bid owner tersebut merupakan bid owner satu pintu, yang belum ditambahkan relasi  nya, maka ketika klik buat invoice jasa pengiriman akan menampilkan alert ‘Akun bank Anda belum terdaftar! Silahkan hubungi CS PH Bid’
    - Jika bid owner tersebut merupakan bid owner satu pintu, yang telah ditambahkan relasi  nya, maka ketika klik buat invoice jasa pengiriman akan langsung diarahkan ke halaman form buat invoice
    - Jika telah menggunakan satu kali kesempatan untuk buat invoice, dan setting invoice di sisi admin dalam kondisi off  atau kesempatan invoice sudah habis, maka akan menampilkan alert ‘Tidak bisa buat invoice! Silahkan hubungi Admin untuk mengaktifkan kembali’
- Ketika klik buat invoice biaya tambahan (tanpa ppn) terdapat beberapa rule pengecekan, antara lain :
    - Jika invoice jasa pengiriman belum dibuat, dan   klik buat invoice biaya tambahan terlebih dahulu, maka akan menampilkan alert ‘Tidak bisa lanjut! Invoice jasa pengiriman harus dibuat terlebih dahulu!’
    - Jika invoice jasa pengiriman telah dibuat, dan bid owner tersebut termasuk bid owner direct, maka ketika klik buat invoice biaya tambahan, akan langsung diarahkan ke halaman form buat invoice biaya tambahan
    - Jika invoice jasa pengiriman telah dibuat, dan bid owner tersebut termasuk bid owner satu pintu yang belum ditambahkan relasi biddernya, maka ketika klik buat invoice biaya tambahan akan menampilkan alert ‘Akun bank Anda belum terdaftar! Silahkan hubungi CS PH Bid’
    - Jika relasi   terlah ditambahkan untuk bid owner tersebut, maka ketika klik buat invoice biaya tambahan akan langsung diarahkan ke halaman form buat invoice biaya tambahan
    - Jika   telah menggunakan satu kali kesempatan untuk buat invoice dan setting invoice di sisi admin dalam kondisi off atau kesempatan invoice sudah habis, maka ketika klik buat invoice biaya tambahan akan menampilkan alert ‘Tidak bisa buat invoice! Silahkan hubungi Admin untuk mengaktifkan kembali’
- Pada halaman form invoice jasa pengiriman, terdapat beberapa rule antara lain :
    - Komponen harga yang aktif defaultnya yaitu PPn dan PPh. Namun masih dapat melakukan edit Komponen harga yang aktif dengan klik tambah Komponen harga.
    - Default checbox pada Komponen harga PPn dan PPh adalah checklist dan disabled
    - Sedangkan default checkbox pada Komponen harga Diskon adalah unchecklist dan enabled. Jika checkbox diskon di checklist, maka Komponen harga diskon akan aktif
    - PPn bersifat menambahkan beban pembiayaan, sedangkan PPh bersifat mengurangi beban pembiayaan
    - Pada ID order yang membawa nilai PPn, maka untuk field PPn akan disabled dan tidak dapat diganti
    - Sedangkan pada ID order lama atau yang belum memiliki nilai PPn maka field PPn akan enabled dan menampilkan rekomendasi nilai PPn dari setting pajak admin
    - Untuk kolom PPh, nilai PPh juga diambil dari order tersebut, namun fieldnya enable.
    - Rumus PPn : (%PPn x Rp. Total Harga)
    - Jika ada diskon, rumus PPn : (Total harga - Diskon) x %PPn
    - Rumus PPh : (%PPh x Rp. Total Harga)
    - Jika ada diskon, rumus PPh : (Total harga - Diskon) x %PPh
    - Rumus Grand Total Jika Tidak Ada Diskon : Total + Jumlah PPn - Jumlah PPh
    - Rumus Grand Total Jika Ada Diskon : (Total - Diskon) + Jumlah PPn - Jumlah PPh
    - Pada data informasi harga di invoice jasa pengiriman, nama item dan harga otomatis tampil sesuai dengan jumlah unit di nomor order. Contoh : Jika jumlah unit, yang ada pada nomor order tersebut ada 3, maka juga akan tergenerate sejumlah 3 baris nama item juga
    - Format penamaan item yang tampil terdiri dari : Jenis Kontainer (Nomor Kontainer) | Rute. Contoh : 20 Dry (CICU8592181) | Tanjung Perak (SUB) - Belawan (BLW)
    - Ketika di klik tambah biaya Lainnya maka akan menambahkan kolom nama item dan harga baru
- Pada halaman form invoice biaya tambahan (tanpa PPn), terdapat beberapa rule antara lain :
    - Komponen harga yang aktif defaultnya yaitu Diskon. Namun masih dapat melakukan edit Komponen harga yang aktif dengan klik tambah Komponen harga.
    - Default checbox pada Komponen diskon adalah checklist dan disabled
    - Sedangkan default checkbox pada Komponen harga PPn dan PPh adalah unchecklist dan enabled. Jika checkbox di checklist, maka Komponen harga PPn atau PPh akan aktif
    - Terdapat penyesuaian label pada label harga pengiriman diganti menjadi Biaya tambahan
    - Terdapat penyesuaian Label 'Biaya pengiriman dibayarkan ke nomor tersebut' dibawah kolom Virtual Account diubah menjadi 'Pembayaran ditransfer ke nomor tersebut'
    - PPn bersifat menambahkan beban pembiayaan, sedangkan PPh bersifat mengurangi beban pembiayaan
    - Pada ID order yang membawa nilai PPn dan PPh, maka untuk field PPn dan PPh tetap enabled dan dapat melakukan edit
    - Rumus PPn : (%PPn x Rp. Total Harga)
    - Jika ada diskon, rumus PPn : (Total harga - Diskon) x %PPn
    - Rumus PPh : (%PPh x Rp. Total Harga)
    - Jika ada diskon, rumus PPh : (Total harga - Diskon) x %PPh
    - Rumus Grand Total Jika Tidak Ada Diskon : Total + Jumlah PPn - Jumlah PPh
    - Rumus Grand Total Jika Ada Diskon : (Total - Diskon) + Jumlah PPn - Jumlah PPh
    - Pada data informasi harga di invoice biaya tambahan, nama item dan harga defaultnya berupa form kosong (tidak membawa item)
    - Ketika di klik tambah biaya Lainnya maka akan menambahkan kolom nama item dan harga baru
- Untuk upload invoice, file yang dapat diupload maksimal 10 file dalam satu kali proses upload dan ukuran maksimal per file adalah 4MB. File yang dapat diterima adalah .pdf .jpg atau .png
- Invoice jasa pengiriman atau tambahan yang telah dibuat atau file invoice yang di uploadakan tampil pada tabel di halaman Invoice
- Urutan data yang tampil pada tabel, meliputi :
    - invoice pengiriman, dengan update invoice Buat : DD/MM/YYYY
    - Invoice tambahan , dengan update invoice Buat : DD/MM/YYYY
    - File invoice yang di upload, dengan update invoice Upload : DD/MM/YYYY
- Ketika upload dokumen pada proses invoice akan mengirimkan notifikasi email.
- Isi notifikasi “Dokumen Tagihan Pengiriman” : Id Order, Harga, Bid Owner & File yang diupload
- Jumlah file akan bertambah ketika dilakukan upload ulang. Contoh : upload pertama 1 dokumen, kemudian upload kedua 3 dokumen. maka email yang terkirim berisikan 4 dokumen.
