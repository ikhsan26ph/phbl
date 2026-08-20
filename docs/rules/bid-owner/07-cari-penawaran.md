# Cari Penawaran

- Beranda pada breadcrumb di halaman cari penawaran disable, karena halaman cari penawaran ialah halaman default pada bid owner
- Tombol “Cari Harga Penawaran” defaultnya disable, akan aktif apabila field Nomor Lelang telah diisi nomor lelang
- Bid owner bisa melakukan pencarian penawaran dengan memasukkan nomor lelang manual maupun dipilih dari daftar lelang yang ada.
- Pada list daftar lelang lelang yang ada, pilihan datanya ialah data lelang yang masih aktif (bukan dibatalkan), jika lelang dibatalkan maka tidak muncul pada list lelang ini
- Apabila nomor lelang yang dicari tidak ada, muncul alert “Nomor lelang tidak ditemukan”
- Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
- Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.
- Setelah mencari nomor lelang, akan muncul ringkasan lelang yang berisikan informasi data lelang , syarat dan ketentuan , informasi rute pengiriman, informasi kontainer & harga penawaran
  - Syarat dan ketentuan :
- Dokumen tambahan yang diupload bisa di download kembali oleh bid owner
  - Informasi rute pengiriman :
- Untuk rute normal , tempat asal dan tempat tujuan hanya 1
- Untuk rute multidrop , tempat asal hanya 1 namun tempat tujuan (drop off) berisi alamat drop lebih dari 1 (minimal 2)
  - Informasi kontainer :
- Menampilkan jenis kontainer yang dipilih saat buat lelang
- Untuk data lama (PHBL 1.2) ditampilkan dalam bentuk kombinasi

Misal PHBL 1.2 : ukuran => 20,40 | jenis => Dry, HC

Maka pada PHBL 1.3 ditampilkan : 20 Dry, 20 HC, 40 Dry, 40 HC

## Pop Up Daftar Lelang Yang Ada

- Semua lelang yang telah dibuat oleh bid owner akan muncul di popup ini, meskipun lelang tersebut sudah melewati tanggal rencana akhir kirim
- Lelang yang telah dibatalkan tidak muncul pada popup ini
- Rute yang tampil ialah pelabuhan asal – pelabuhan tujuan
- Pada daftar lelang yang ada terdapat dropdown masukkan nomor lelang yang dimana pilihan datanya ialah semua nomor lelang yang telah dibuat oleh bid owner mulai dari yang terbaru sampai paling lama.
- Pada dropdown nomor lelang tidak ada lelang yang dibatalkan

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
- Harga yang ditampilkan pada harga penawaran merupakan harga sebelum nilai PPN dan PPh dihitung (Harga DPP), sehingga pada kolom harga satuan juga akan menampilkan nilai PPN dan PPh-nya.
- Info harga apabila tidak diisi oleh bidder terkait , muncul keterangan : (Info harga tidak diinputkan oleh bidder)
- Pada info harga ada data biaya tidak termasuk : ialah data include yang saat buat lelang diikutkan namun saat bidder buat harga tidak mengikutkan include tersebut. Data ini ditampilkan warna merah. Data tidak termasuk
- Pada info harga, biaya termasuk dan biaya tidak termasuk, tidak mengikutkan PPN dan PPh
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
- Apabila harga penawaran ada yang telah dinego dan nego diterima oleh bidder, maka otomatis nominal harga satuan beserta nilai PPN dan PPhnya akan berubah di list harga penawaran nya.
- Button nego akan berubah menjadi disabled pada harga yang sudah tidak aktif (tanggal efektif tidak berlaku). Untuk ketentuan harga yang sudah tidak aktif dengan berdasarkan tanggal efektif tidak berlaku adalah seperti yang sudah dijelaskan sebelumnya.
- Jika harga yang sebelumnya N/A kemudian aktif kembali, maka untuk button NEGO akan berubah juga menjadi aktif
- Jika ada beberapa bidder yang sudah input harga pada lelang, kemudian harga dari salah satu bidder dipesan, maka bidder lainnya yang telah inputkan harga akan menerima notifikasi email penawaran belum terpilih (terkirim 1x ketika admin validasi terima order)
- Nantinya data harga penawaran lelang bid owner yang telah dibuat akan masuk kedalam penarikan data spreadsheet data penawaran :
  - Untuk data lelang yang dibatalkan akan masuk kedalam spreadsheet penarikan data penawaran.
  - Apabila pada 1 harga terdapat 3 jadwal maka pada spreadsheet penarikan data penawaran datanya hanya 1 baris saja.
  - Jika nominal harga mengalami perubahan maka pada spreadsheet juga ikut berubah harga satuannya
  - Jumlah order didapatkan dari jumlah order yang memakai harga tersebut
- Jika lelang dilakukan request update harga, maka harga-harga sebelumnya akan jadi expired
- Jika lelang masih proses update harga maka di harga penawaran akan muncul informasi PROSES UPDATE HARGA
- Ketika lelang proses request harga maka ketika klik tombol Expired akan muncul alert “Harga sudah tidak berlaku, tunggu sampai update harga penawaran dari bidder berakhir”
- Ketika lelang proses update harga maka tombol Daftar Nego disable
- Ketika proses request harga berakhir maka ketika dilakukan filter ataupun sortir, data yang ditampilkan ialah harga baru terlebih dahulu baru harga-harga yang expired. Untuk rule filter dan sortir ini masih sama seperti sebelumnya
- Ketika proses request harga sedang berlangsung, harga tidak akan langsung expired sehingga kondisi harga/penawaran tidak berubah
- Ketika penawaran masih dalam kondisi aktif (belum expired) dengan button pesan aktif, maka ketika bid owner klik tombol Pesan tersebut, nantinya sistem akan menampilkan alert pengecekan tidak bisa lanjut order karena request harga masih berjalan
- Harga/penawaran aktif adalah harga/penawaran yang belum expired.
- Telah lama expired: Bidder peserta lelang telah input harga/telah input penawaran, tapi sudah tidak memiliki harga/penawaran aktif (sudah expired semua)
- Ketika harga sudah expired (Telah Lama Expired), maka update harga dilakukan melalui input karena dianggap tidak ada harga yang bisa diupdate (seperti input harga baru)
- Harga tidak langsung expired. Harga akan expired ketika tanggal tutup request harga berakhir
- Pada request harga yang sedang berlangsung, dapat dilakukan close request harga. Ini akan menghentikan proses request harga yang sedang dilakukan. Data tanggal request dan tutup request diambil dari tanggal mengajukan request dan field tanggal penutupan request harga Ketika close request harga.
- Pada halaman Lihat Harga Penawaran akan tampil harga-harga request yang sudah di inputkan sebelum dilakukan close request. Jika proses request harga di-close maka harga bidder yang lama akan tetap menjadi expired.
- Terdapat field tanggal penutupan request harga setelah klik Close Request Harga.
- Pada card daftar riwayat terdapat tambahan informasi data yang meliputi:
  - Close Request
  - Tanggal Close Request
- Untuk modul ini juga ada integrasi dengan API PNP, sehingga ketika lelang proses update harga maka di PNP juga nantinya harga-harga lama akan berubah menjadi tidak bisa dipesan dan muncul tooltip pada tombolnya “Harga sudah tidak berlaku, tunggu sampai update harga penawaran dari bidder berakhir”
- Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nana dokumen.
- Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.

## Export Harga Penawaran PDF

- Tanggal yang tampil diambil dari waktu saat export harga penawaran pdf
- Email yang tampil diambil dari email dari user yang melakukan export penawaran pdf
- Urutan hasil penawaran yang ada di export penawaran yaitu berdasarkan harga terendah, closing time terdekat, rating tertinggi, menang lelang terbanyak, nama kapal (default seperti di web)
- Harga yang ditampilkan pada export  pdf harga penawaran merupakan harga sebelum nilai PPn dan PPh dihitung (Harga DPP), sehingga pada label harga satuan terdapat informasi sebelum ppn dan menampilkan nilai PPn dan PPh-nya.
- Jika info harga tidak diisi oleh bidder pada harga terkait , maka akan muncul keterangan: Info harga tidak diinputkan oleh bidder
- Pada info harga ada data biaya tidak termasuk : ialah data include yang saat buat lelang diikutkan namun saat bidder buat harga tidak mengikutkan include tersebut. Data ini ditampilkan warna merah
- Pada info harga, biaya termasuk dan biaya tidak termasuk, tidak mengikutkan PPn dan PPh
- Terdapat penambahan atribut : sebelum PPN, ppn, dan pph
- Penyesuaian eksport PDF Perjanjian pengiriman (label) biaya tidak termasuk diganti menjadi biaya belum termasuk
- ID penawaran yang tampil adalah penomoran dari harga terkait yang muncul pada hasil penawaran
- Untuk harga baru respon dari update harga maka disamping nominal harga satuan muncul keterangan “(Request Harga dd/mm/yyyy)” yang menampilkan tanggal request harga

## Profil Bidder

- Cari Penawaran Lelang pada breadcrumb dan tombol Kembali apabila diklik , akan diarahkan menuju hasil pencarian nomor lelang sebelumnya
- Untuk data bergabung sejak dari bidder terkait , diambil dari tanggal saat akun bidder tersebut registrasi
- Pada profil bidder dapat melihat ulasan dari bid owner lainnya, nama bid owner disamarkan hanya ditampilkan sebagai “Bid Owner”

## Nego

- Bid owner dapat memilih harga untuk dinego sekaligus maksimal 5 harga dalam satu waktu, jika lebih dari itu maka muncul alert “Ada 5 penawaran terpilih di daftar nego. Silahkan dicek kembali”
- Jika lelang telah melewati tgl rencana akhir kirim maka tidak bisa nego dan muncul alert “Nomor lelang sudah melewati tgl. rencana akhir kirim. Silahkan hubungi CS PH Bid”
- Jika terdapat update harga terbaru maka ketika nego tidak bisa dan muncul alert “Harga sudah tidak berlaku. Mohon pilih penawaran lain”
- Jika melewati tgl dan waktu closing time maka tidak bisa nego dan muncul alert ““Jadwal sudah melewati tanggal closing time. Mohon pilih penawaran lain””
- Jika harga sudah ada pada daftar nego ketika dipilih Kembali maka muncul alert “Harga penawaran sudah ada di Daftar Nego”
- Jika harga berhasil dipilih nego maka akan masuk kedalam list daftar nego
- Pada pop info pengajuan nego, menampilkan informasi harga dengan label ‘Sebelum PPn’ serta nilai PPn dan PPh nya
- Untuk rule order yang tidak memiliki nilai PPn dan PPh maka akan tampil strip
- Pada tombol nego terdapat penanda jumlah berapa kali harga penawaran di submit nego oleh bid owner
- Custom sub user bid owner IMP dan TCI tidak bisa akses fitur ini

## Daftar Nego

- Harga yang ditampilkan pada daftar nego merupakan Harga Sebelum PPn
- Jika harga yang ada di list daftar nego telah melewati tgl rencana akhir kirim maka tidak bisa submit nego dan muncul alert “Nomor lelang sudah melewati tgl. rencana akhir kirim. Silahkan hubungi CS PH Bid”
- Jika harga yang ada di list daftar nego terdapat update harga terbaru maka ketika nego tidak bisa dan muncul alert “Harga sudah tidak berlaku. Mohon pilih penawaran lain”.
- Jika harga yang ada di list daftar nego melewati tgl dan waktu closing time maka tidak bisa submit nego dan muncul alert “Jadwal sudah melewati tanggal closing time. Mohon pilih penawaran lain””
- Jika klik submit maka akan mengirimkan notifikasi email dan wa pengajuan nego kepada bidder
- Custom sub user bid owner IMP dan TCI tidak bisa akses fitur ini

## Request Jadwal

- Harga yang ditampilkan pada halaman Request Jadwal adalah harga penawaran yang masih aktif,  dalam artian mulai berlaku harga ini tidak nabrak dengan harga baru.
- Jika harga tersebut tidak ada jadwal yang diinputkan namun masih dalam kategori harga yang masih aktif, maka harga tersebut akan tampil pada halaman Request Jadwal
- Jika harga tersebut telah melewati tanggal closing time, namun masih dalam kategori harga aktif, maka harga tersebut akan tampil pada halaman Request Jadwal
- Jika lelang tersebut telah melewati tanggal rencana akhir kirim, maka harga penawaran lelang tersebut tidak akan tampil pada halaman Request Jadwal
- Untuk harga yang telah expired atau yang sebelumnya telah dilakukan Request Harga oleh Bid Owner, maka harga penawaran tersebut tidak akan tampil pada halaman Request Jadwal
- Bid owner dapat melakukan request jadwal secara berulang, pada harga penawaran yang sama. Tidak ada pembatasan maksimalnya.
- Ketika bid owner melakukan Request Jadwal, akan muncul pop up konfirmasi request jadwal untuk menerima email jika bidder melakukan respon dari request jadwal yang diajukan
- Jika izin menerima notifikasi tersebut diaktifkan, maka ketika bidder merespon request jadwal tersebut, bid owner akan menerima notifikasi email. Jika izin notifikasi tersebut tidak diaktifkan, maka bid owner tidak akan menerima notifikasi ketika bidder respon request jadwal
- Semua data harga yang telah diajukan request jadwal oleh Bid Owner akan tercatat pada halaman Daftar Request Jadwal
- Jika pada lelang tersebut pernah dilakukan request jadwal, maka pada halaman Harga Penawaran akan tampil informasi label ‘Daftar Request Jadwal : 1 Penawaran ( Lihat Request )’. Angka 1 menunjukkan jumlah berapa banyak request jadwal yang diajukan di lelang tersebut
- Setelah bid owner berhasil melakukan request jadwal, maka dari sisi Bidder akan menerima notifikasi whatsapp : Request Jadwal tersedia.

## Daftar Request Jadwal

- Pada halaman Daftar Request Jadwal akan mencatat history pengajuan request jadwal Bid Owner mulai dari tanggal request, bidder, pelayaran, jenis, harga sebelum PPn, terima notif, dan status
- Tanggal request menampilkan informasi waktu kapan bid owner melakukan request jadwal. Format yang ditampilkan adalah DD/MM/YYYY HH:MM
- Data bidder, pelayaran, jenis, harga sebelum PPn tampil sesuai dengan data harga yang telah diajukan request jadwal oleh bid owner
- Terima notif akan mencatat apakah pada pengajuan request tersebut bid owner melakukan konfirmasi terima atau tidak. Jika bid owner melakukan konfirmasi terima notif jika bidder update, maka pada kolom terima notif akan tampil Ya. Namun sebaliknya, jika bid owner tidak melakukan konfirmasi terima notif, maka kolom terima notif akan tampil Tidak.
- Untuk penawaran pertama kali yang dilakukan request jadwal dan belum dilakukan respon oleh bidder, maka statusnya akan tampil ‘Menunggu Bidder’
- Jika request jadwal tersebut telah direspon oleh bidder, maka statusnya akan berubah menjadi Tersedia
- Respon update  jadwal yang dilakukan oleh bidder dapat dilihat oleh bid owner pada halaman Cari Penawaran.

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
- Notif whatsapp saat ini dimatikan. Jika diisi nomor consignee, maka hanya akan menerima notifikasi whatsapp to consignee saja yaitu Rencana Dooring
- Pada halaman isi data pesanan bid owner, field Alamat Pemuatan Barang  dan field Alamat Penerimaan Barang, Kota Tujuan, dan Kota Asal dibuat disable diambil dari data lelang sehingga tidak bisa diedit kembali datanya oleh bid owner.  Berlaku untuk multidrop juga
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
- Custom sub user bid owner TCI tidak bisa akses fitur ini

## Input Perjanjian

  - Dokumen perjanjian dan catatan perjanjian opsional
  - Tanggal yang tampil di detail perjanjian adalah defaultnya hari ini
  - Jika klik Kembali mengarah ke halaman sebelumnya
  - Isi detail perjanjian pengiriman masih hardcode dan menyesuaikan data bid owner dan bidder pada order tersebut
  - Jika pada jadwal termasuk kapal connecting maka akan muncul button “kapal connecting nx”
  - Custom sub user bid owner TCI tidak bisa akses fitur ini
