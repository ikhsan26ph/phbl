# Cari Penawaran

- Tombol Cari Penawaran defaultnya disable, akan aktif apabila field Nomor Lelang telah diisi nomor lelang
- Admin bisa melakukan pencarian penawaran dengan memasukkan nomor lelang manual maupun dipilih dari daftar lelang yang ada.
- Apabila nomor lelang yang dicari tidak ada, muncul alert “Nomor lelang tidak ditemukan”
- Setelah mencari nomor lelang, akan muncul ringkasan lelang yang berisikan informasi data lelang, syarat dan ketentuan, rute pengiriman, informasi kontainer
  - Syarat dan ketentuan
- Dokumen lelang yang telah diupload saat bid owner buat lelang bisa di download kembali oleh bid owner
- Budget pengiriman menampilkan data budget pengiriman ketika buat lelang
  - Rute Pengiriman
    - Untuk rute normal , tempat asal dan tempat tujuan hanya 1
    - Untuk rute multidrop , tempat asal hanya 1 namun tempat tujuan berisi alamat drop lebih dari 1, minimal 2
  - Informasi Kontainer
- Untuk jenis kontainer ditampilkan semua jenis kontainer yang dipilih
- Data volume pengiriman, deskripsi barang jika tidak diisi ditampilkan strip

## Pop Up Daftar Lelang yang Ada

- Semua lelang yang telah dibuat oleh bid owner akan muncul di popup ini , meskipun lelang tersebut sudah melewati tanggal rencana akhir kirim
- Lelang yang telah dibatalkan bid owner tidak muncul pada popup ini
- Rute yang tampil ialah formatnya pelabuhan asal (UN Code) – pelabuhan tujuan (UN Code)
- Pada daftar lelang yang ada terdapat dropdown masukkan nomor lelang yang dimana pilihan datanya ialah semua nomor lelang yang telah dibuat oleh bid owner mulai dari yang terbaru sampai paling lama.

## Harga Penawaran

- Apabila belum ada bidder yang mengajukan harga pada lelang terkait, muncul keterangan “Mohon maaf, belum ada peserta lelang yang mengajukan penawaran. Apakah anda membutuhkan bantuan untuk mencari harga penawaran? Silahkan hubungi customer service PH Bid : csct@prahu-hub.com atau 081246665023”
  - Email & nomor CS diambil dari setting general admin
- Apabila nomor lelang yang dicari belum melewati tanggal tutup lelang , muncul keterangan : “Mohon maaf, nomor lelang yang anda cari belum melewati batas tutup lelang. Tunggu hingga nomor lelang melewati tanggal tutup lelang. Jika ada pertanyaan, silahkan hubungi customer service PH Bid : csct@prahu-hub.com atau 081246665023”
  - Email & nomor CS diambil dari setting general admin
- Default harga penawaran yang tampil adalah 20 data. Bid owner bisa melakukan filter berdasarkan data tertentu seperti jenis kontainer , bidder maupun etd & eta
- Default harga penawaran yang tampil urutannya adalah Tanggal Efektif Terbaru.
  - Jika ada efektif yang sama , maka pengurutan selanjutnya adalah dari harga (rendah ke tinggi)
  - Jika efektif dan harga yang sama , maka pengurutan selanjutnya adalah dari closing time yang terdekat
  - Jika efektif, harga, closing time sama , maka pengurutan selanjutnya adalah dari rating yang tertinggi
  - Jika efektif, harga, closing time, rating nya ada yang sama , maka pengurutan selanjutnya adalah dari jumlah menang lelang yang tertinggi
  - Jika efektif, harga, closing time, rating, jumlah menang sama , maka pengurutan selanjutnya adalah dari nama kapal nya
- Jika pada harga penawaran adalah termasuk jadwal kapal connecting maka akan muncul button “kapal connecting nx”
- Harga yang ditampilkan pada harga penawaran adalah semua harga dengan tanggal mulai berlaku kapanpun
- Harga yang ditampilkan pada harga penawaran merupakan harga sebelum nilai PPn dan PPh dihitung (Harga DPP), sehingga pada kolom harga satuan juga akan menampilkan nilai PPn dan PPh-nya.
- Info harga apabila tidak diisi oleh bidder terkait , muncul keterangan : (Info harga tidak diinputkan oleh bidder)
- Pada info harga ada data biaya tidak termasuk : ialah data include yang saat buat lelang diikutkan namun saat bidder buat harga tidak mengikutkan include tersebut. Data ini ditampilkan warna merah
- Pada info harga, biaya termasuk dan biaya tidak termasuk, tidak mengikutkan PPn dan PPh
- Apabila bidder belum pernah menang lelang , maka hanya muncul keterangan jumlah rating
  - Dan untuk bidder baru , default rating nya adalah 3.0
- Untuk rule  harga penawaran terkait pesan adalah sebagai berikut :
  - Jika ada harga yang sama (jenis kontainer, bidder) namun berbeda di tanggal mulai berlaku misal harga A tanggal mulai berlaku 18/03 dan harga B tanggal mulai berlaku 21/03.
    - maka apabila saat ini tanggal 19/03 , harga A masih bisa dipesan
    - namun jika saat ini masuk tanggal 21/03 ,  harga A tidak bisa dipesan karena sudah ada harga terbaru yaitu harga B karena tgl mulai berlaku harga B sejak tgl 21/03
    - Ketika ada update harga terbaru maka harga lama tidak bisa dipesan dan tombolnya berubah menjadi “N/A”
    - Ketika klik N/A maka muncul alert “Harga sudah tidak berlaku. Mohon pilih penawaran lain”
  - Jika harga melewati tgl closing time maka tidak bisa dan tombol menjadi N/A. Jika diklik akan tampil alert “Jadwal sudah melewati tanggal closing time. Mohon pilih penawaran lain”
  - Jika harga belum diinputkan jadwalnya maka tidak bisa dipesan dan tombol pesannya jadi disable dan ada tooltip “Tanyakan Ke CS PH Bid”
  - Jika lelang telah melewati tgl rencana akhir kirim maka tidak bisa pesan dan muncul tombol N/A. Jika diklik muncul alert “Nomor lelang sudah melewati tgl. rencana akhir kirim. Silahkan hubungi CS PH Bid”
- Apabila harga penawaran ada yang telah dinego dan nego diterima oleh bidder, maka otomatis nominal harga satuan beserta nilai PPn dan PPhnya harga satuan akan berubah di list harga penawaran nya.
- Jika ada beberapa bidder yang sudah input harga pada lelang, kemudian harga dari salah satu bidder dipesan, maka bidder lainnya yang telah inputkan harga akan menerima notifikasi email penawaran belum terpilih (terkirim 1x ketika admin validasi terima order)
- Jika lelang dilakukan request update harga, maka harga-harga sebelumnya akan jadi expired
- Jika lelang masih proses update harga maka di harga penawaran akan muncul informasi PROSES UPDATE HARGA
- Ketika lelang proses update harga maka ketika klik tombol Expired akan muncul alert “Harga sudah tidak berlaku, tunggu sampai update harga penawaran dari bidder berakhir”
- Ketika lelang proses update harga maka tombol Daftar Nego disable
- Ketika proses update harga berakhir maka ketika dilakukan filter ataupun sortir, data yang ditampilkan ialah harga baru terlebih dahulu baru harga-harga yang expired. Untuk rule filter dan sortir ini masih sama seperti sebelumnya
- Untuk modul ini juga ada integrasi dengan API PNP, sehingga ketika lelang proses update harga maka di PNP juga nantinya harga-harga lama akan berubah menjadi tidak bisa dipesan dan muncul tooltip pada tombolnya “Harga sudah tidak berlaku, tunggu sampai update harga penawaran dari bidder berakhir”
- Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
- Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.

## Request Jadwal

- Harga yang ditampilkan pada halaman Request Jadwal adalah harga penawaran yang masih aktif,  dalam artian mulai berlaku harga ini tidak nabrak dengan harga baru.
- Jika harga tersebut tidak ada jadwal yang diinputkan namun masih dalam kategori harga yang masih aktif, maka harga tersebut akan tampil pada halaman Request Jadwal
- Jika harga tersebut telah melewati tanggal closing time, namun masih dalam kategori harga aktif, maka harga tersebut akan tampil pada halaman Request Jadwal
- Jika lelang tersebut telah melewati tanggal rencana akhir kirim, maka harga penawaran lelang tersebut tidak akan tampil pada halaman Request Jadwal
- Untuk harga yang telah expired atau yang sebelumnya telah dilakukan Request Harga oleh bid owner, maka harga penawaran tersebut tidak akan tampil pada halaman Request Jadwal
- Admin dapat melakukan request jadwal secara berulang, pada harga penawaran yang sama. Tidak ada pembatasan maksimalnya.
- Ketika admin melakukan Request Jadwal, akan muncul pop up konfirmasi request jadwal untuk menerima email jika bidder melakukan respon dari request jadwal yang diajukan
- Jika izin menerima notifikasi tersebut diaktifkan, maka ketika bidder merespon request jadwal tersebut, admin akan menerima notifikasi push. Jika izin notifikasi tersebut tidak diaktifkan, maka admin tidak akan menerima notifikasi ketika bidder respon request jadwal
- Semua data harga yang telah diajukan request jadwal oleh admin akan tercatat pada halaman Daftar Request Jadwal
- Pada halaman Daftar Request Jadwal akan mencatat history pengajuan request jadwal admin mulai dari tanggal request, bidder, pelayaran, jenis, harga sebelum PPn, terima notif, dan status.
- Jika pada lelang tersebut pernah dilakukan request jadwal, maka pada halaman Harga Penawaran akan tampil informasi label ‘Daftar Request Jadwal : 1 Penawaran ( Lihat Request )’. Angka 1 menunjukkan jumlah berapa banyak request jadwal yang diajukan di lelang tersebut
- Setelah bid owner berhasil melakukan request jadwal, maka dari sisi Bidder akan menerima notifikasi whatsapp : Request Jadwal tersedia.

## Daftar Request Jadwal

- Pada halaman Daftar Request Jadwal akan mencatat history pengajuan request jadwal Bid Owner mulai dari tanggal request, bidder, pelayaran, jenis, harga sebelum PPn, terima notif, dan status
- Tanggal request menampilkan informasi waktu kapan bid owner melakukan request jadwal. Format yang ditampilkan adalah DD/MM/YYYY HH:MM
- Data bidder, pelayaran, jenis, harga sebelum PPn tampil sesuai dengan data harga yang telah diajukan request jadwal oleh bid owner
- Terima notif akan mencatat apakah pada pengajuan request tersebut bid owner melakukan konfirmasi terima atau tidak. Jika bid owner melakukan konfirmasi terima notif jika bidder update, maka pada kolom terima notif akan tampil Ya. Namun sebaliknya, jika bid owner tidak melakukan konfirmasi terima notif, maka kolom terima notif akan tampil Tidak.
- Untuk penawaran pertama kali yang dilakukan request jadwal dan belum dilakukan respon oleh bidder, maka statusnya akan tampil ‘Menunggu Bidder’
- Jika request jadwal tersebut telah direspon oleh bidder, maka statusnya akan berubah menjadi Tersedia
- Respon update  jadwal yang dilakukan oleh bidder dapat dilihat oleh admin pada halaman Cari Penawaran.

## Export Penawaran PDF

- Tanggal yang tampil diambil dari waktu saat export harga penawaran pdf
- Email yang tampil diambil dari email dari user yang melakukan export penawaran pdf
- Urutan hasil penawaran yang ada di export penawaran yaitu berdasarkan harga terendah, closing time terdekat, rating tertinggi, menang lelang terbanyak, nama kapal (default seperti di web)
- Harga yang ditampilkan pada export pdf harga penawaran merupakan harga sebelum nilai PPn dan PPh dihitung (Harga DPP), sehingga pada label harga satuan terdapat informasi sebelum ppn dan menampilkan nilai PPn dan PPh-nya.
- Jika info harga tidak diisi oleh bidder pada harga terkait , maka akan muncul keterangan: Info harga tidak diinputkan oleh bidder
- Pada info harga ada data biaya tidak termasuk : ialah data include yang saat buat lelang diikutkan namun saat bidder buat harga tidak mengikutkan include tersebut. Data ini ditampilkan warna merah
- Pada info harga, biaya termasuk dan biaya tidak termasuk, tidak mengikutkan PPn dan PPh
- ID penawaran yang tampil adalah penomoran dari harga terkait yang muncul pada hasil penawaran
- Untuk harga baru respon dari update harga maka disamping nominal harga satuan muncul keterangan “(Request Harga dd/mm/yyyy)” yang menampilkan tanggal request harga

## Profil Bidder

- Cari Penawaran Lelang pada breadcrumb dan tombol Kembali apabila diklik , akan diarahkan menuju hasil pencarian nomor lelang sebelumnya
- Untuk data bergabung sejak dari bidder terkait , diambil dari tanggal saat akun bidder tersebut registrasi
- Pada profil bidder dapat melihat ulasan dari bid owner lainnya, nama bid owner disamarkan hanya ditampilkan sebagai “Bid Owner”

## Isi Data Pesanan

  - Hasil penawaran pada breadcrumb dan tombol Batal mengarah ke hasil penawaran pada nomor lelang yang dicari sebelumnya
  - Tanggal permintaan muat yang muncul mengacu pada tanggal mulai berlaku dan harga yang dipesan.
  - Jika tanggal mulai berlaku harga nya sudah lewat atau mulai hari ini , maka tanggal permintaan muat yang bisa dipilih ialah mulai per hari ini sampai sebelum tgl closing time
  - Jika tanggal mulai berlaku nya masih jauh , maka tanggal permintaan muat yang bisa dipilih adalah per tanggal sama dengan tanggal mulai berlaku sampai dengan sebelum tgl closing time
  - Jika ada harga terbaru yang berlaku dari 2 harga yang sama , maka tanggal permintaan muat yang bisa dipilih ialah seperti rule a sampai dengan sebelum tgl mulai berlaku harga yang terbaru
  - Pada sesi ini bid owner dapat memilih tanggal dan jam permintaan muat menggunakan datepicker, serta input yang disimpan sesuai dengan pilihan yang telah ditentukan.
  - Data pemuatan barang akan ngedraft di isi data pesanan apabila diisi saat buat lelang
- Data penerima barang akan ngedraft di isi data pesanan apabila diisi saat buat lelang, kecuali nama perusahaan
  - untuk multidrop , penerimaan barang yang tampil berdasarkan data drop off yang diinputkan saat buat lelang
- Rute pengiriman yang dipesan ditampilkan dalam bentuk pelabuhan asal (un code) – pelabuhan tujuan (un code)
- Total harga defaultnya 0 , akan mulai menghitung total harga apabila jumlah yang dipesan sudah diinputkan. Total harga diambil dari data jumlah yang dipesan x harga satuan
- Syarat dan ketentuan diambil dari setting S&K booking admin
- Ketika sudah ceklist dan isi data pesanan jika klik submit akan ditampilkan popup konfirmasi pesanan dan akan diarahkan ke halaman input muatan
- Pada halaman isi data pesanan terdapat data nama & nomor sales
- Nama dan nomor sales sifatnya optional sehingga jika tidak diisi bisa
- Nomor sales inputannya hanya bisa angka
- Nomor sales maksimal hanya 1 nomor
- Untuk data lama dimana lelangnya ada data nomor sales maka ketika isi data pesanan kembali maka data nomor sales ngedraft dari lelang lama namun hanya 1 nomor pertama
- Nomor sales yang diinputkan pada order hanya tampil pada detail order bid owner dan admin, pada bidder tidak tampil
- Jika nomor sales diisi maka ketika order diupdate tracking akan mendapatkan notif wa tracking ambil kontainer, stuffing, kapal berlayar, kapal sandar, rencana dooring, dooring
- Pada halaman isi data pesanan admin, field Alamat Pemuatan Barang  dan field Alamat Penerimaan Barang, Kota Tujuan, dan Kota Asal dibuat disable diambil dari data lelang sehingga tidak bisa diedit kembali datanya oleh bid owner.  Berlaku untuk multidrop juga
- Terdapat pengerjaan integrasi API antara PNP dan PH Bid Laut terkait data nama dan nomor sales yang ada pada form booking, sehingga nantinya datanya sama antara PNP dengan PH Bid Laut

## Input Muatan

- Apabila alasan memesan rute yang diinputkan Lain-lain & alasannya , maka tampilan nya : Lain-lain (alasan yg diinputkan)
  - Jika alasan tidak diinputkan , yang tampil hanya Lain-lain saja
- Template excel yang bisa didownload akan menyesuaikan jenis rute dari order yang dilakukan
- Untuk rule upload packing list adalah sebagai berikut :
  - maksimal 10 file sekali upload dan ekstensi nya .pdf, .jpg, .png. Jika tidak sesuai ekstensi yang ditentukan muncul alert “Format File Tidak Sesuai”
  - lihat file / preview file yang telah diupload berbentuk popup baik foto maupun pdf
- Import muatan dengan file excel harus sesuai dengan jenis rute dari harga yang dipesan. Jika tidak sesuai akan muncul alert “Format excel tidak sesuai”
- Jika input muatan menggunakan import excel maka apabila ada data yang tidak sesuai tidak akan ditampilkan datanya
- Apabila alamat pada file excel muatan tidak sesuai dengan alamat pada data order terkait, maka dropdown Alamat berubah menjadi default placeholder “Pilih Alamat Tujuan / Drop Off”
- Pilihan data Alamat tujuan diambil dari data Alamat-alamat drop off yang diinputkan saat isi data pesanan
- Data kemasan diambil dari master kemasan
- Total berat akan menghitung seluruh berat dari muatan yang ada per kontainer
- Untuk mutlidrop , defaultnya alamat yang ditampilkan adalah alamat 1
- Jika menggunakan checkbox isi data seperti unit 1, maka tampilan di unit 2 dan seterusnya ada tambahan muatan seperti unit 1
  - Apabila checkbox dihapus, maka muatan tambahan nya akan hilang
  - Apabila muatan tambahan nya dihapus semua , maka checkbox isi data seperti unit 1 akan hilang

## Input Perjanjian

  - Dokumen perjanjian dan catatan perjanjian opsional
  - Tanggal yang tampil di detail perjanjian adalah defaultnya hari ini
  - Jika klik Kembali mengarah ke halaman sebelumnya
  - Isi detail perjanjian pengiriman masih hardcode dan menyesuaikan data bid owner dan bidder pada order tersebut
