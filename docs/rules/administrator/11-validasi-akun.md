# Validasi Akun

## Pre Register

- Data yang tampil di halaman pre register adalah akun bid owner maupun bidder yang sudah melakukan registrasi awal namun belum klik Aktifkan Akun pada notif email registrasi
- Tanggal yang tampil diambil dari waktu bid owner & bidder ketika registrasi pertama kali
- Setelah bid owner maupun bidder klik tombol Aktifkan Akun pada notif email Registrasi maka data nya akan pindah ke Validasi Bid Owner & Validasi Bidder
- Admin dapat melakukan hapus data pre register, dengan klik tombol hapus. Apabila admin berhasil menghapus data pre register,  maka user dapat melakukan registrasi kembali dengan akun yang sama

## Validasi Bid Owner

- Setelah bid owner klik tombol Aktifkan Akun pada notif email Registrasi, maka akun akan masuk ke halaman validasi bid owner dengan status MENUNGGU
- Apabila bid owner belum melengkapi kelengkapan registrasi maka ketika admin coba validasi akun ada label “Bid Owner belum mengisi kelengkapan pendaftaran”
- Jika bid owner sudah lengkapi kelengkapan registrasi maka ketika admin validasi akun tidak muncul label tersebut
- Tanggal register diambil dari waktu bid owner klik Aktivasi Akun dari notif email registrasi
- Apabila status akun nya aktif , disamping kanan penanda aktif terdapat waktu saat admin menyetujui validasi akun bid owner terkait
- Apabila status akunnya tidak aktif , disamping kanan penanda tidak aktif terdapat waktu saat admin menolak validasi akun bid owner terkait
- NPWP, SIUP, Identitas dan logo perusahaan dari bid owner terkait bisa didownload oleh admin
- Jika bid owner sudah registrasi namun belum isi kelengkapan registrasi maka admin dapat mengisi kelengkapan registrasi
- Data-data required harus diisi terlebih dahulu baru bisa simpan data
- Jika bid owner berhasil divalidasi admin maka bid owner dapat masuk ke akun dan masuk kedalam dropdown pilihan bid owner
- Jika admin berhasil validasi bid owner, bid owner akan mendapat notif bahwa akun berhasil diaktifkan
- Ketika bid owner aktif melakukan perubahan data akun saya maka admin mendapatkan notifikasi perubahan data bid owner
- Ketika bid owner aktif melakukan perubahan data akun saya maka pada list validasi bid owner muncul tombol Verifikasi Perubahan Data
- Jika admin belum konfirmasi perubahan data maka tombolnya berwarna orange, jika admin sudah verifikasi perubahan data maka tombolnya menjadi disable
- Pada halaman verifikasi data bid owner admin dapat melihat data apa saja yang diubah dan ketika validasi perubahan hanya data yang diubah saja yang fieldnya dapat diedit sedangkan data yang tidak diubah oleh bid owner fieldnya masih disable
- Admin masih dapat merubah data yang diedit oleh bid owner jika datanya yang diubah masih ada kesalahan
- Jika admin tolak perubahan data harus mengisi catatan menolak perubahan data, catatan ini akan tampil pada email perubahan data ditolak yang terkirim ke bid owner
- Jika bid owner melakukan perubahan data maka pada detail bid owner akan ada Riwayat perubahan data
- Admin dapat melakukan setting metode pembayaran pada bid owner ketika melakukan validasi bid owner. Metode pembayaran yang dapat di setting terdiri dari Direct dan Satu Pintu
- Ketika admin melakukan setting metode pembayaran bid owner sebagai bid owner Direct, maka pada proses create invoice informasi Rekening akan menampilkan informasi Rekening aktif dari bidder
- Ketika admin melakukan setting metode pembayaran bid owner sebagai bid owner Satu Pintu, maka bid owner tersebut akan terdaftar pada halaman Relasi Satu Pintu. Pada proses create invoice, informasi pembayaran akan menampilkan nomor virtual account yang telah ditambahkan
- Untuk bid owner pendaftar baru, metode pembayarannya belum terpilih. Maka pada field metode pembayaran tampil ‘Pilih Metode’. Admin dapat melakukan setting metode pembayaran ketika melakukan validasi akun
- Untuk bid owner pendaftar lama (data lama) dan belum di setting ulang metode pembayaran, maka metode pembayaran yang digunakan otomatis menjadi direct
- Admin dapat melakukan edit email bid owner, langsung melalui halaman validasi akun (field email enabled). Apabila admin melakukan edit email bid owner, maka informasi akun login bid owner akan berubah
- Jika admin telah melakukan edit email bid owner, maka ketika di klik simpan, akan menampilkan pop up konfirmasi ‘Apakah anda yakin mengubah email user?’ ketika di pilih Ya, maka sistem akan mengganti data email bid owner tersebut

## Validasi Bidder

- Setelah bidder klik tombol Aktifkan Akun pada notif email Registrasi, maka akun akan masuk ke halaman validasi bid owner dengan status MENUNGGU
- Apabila bidder belum melengkapi kelengkapan registrasi maka ketika admin coba validasi akun ada label “Bidder belum mengisi kelengkapan pendaftaran”
- Jika bidder sudah lengkapi kelengkapan registrasi maka ketika admin validasi akun tidak muncul label tersebut
- Tanggal register diambil dari waktu bidder klik Aktivasi Akun dari notif email registrasi
- NPWP, SIUP dan logo perusahaan dari bidder terkait bisa didownload oleh admin
- Jika bidder sudah registrasi namun belum isi kelengkapan registrasi maka admin dapat mengisi kelengkapan registrasi bidder
- Data-data required harus diisi terlebih dahulu baru bisa simpan data
- Data alias bidder ini wajib diisi, inputanyya maksimal 8 karakter
- Admin bisa bantu bidder untuk lengkapi kelengkapan registrasi
- Jika bidder berhasil divalidasi admin maka bidder dapat masuk ke akun dan masuk kedalam dropdown pilihan bidder
- Jika admin berhasil validasi bidder, bidder akan mendapat notif bahwa akun berhasil diaktifkan
- Ketika bidder aktif melakukan perubahan data akun saya maka admin mendapatkan notifikasi perubahan data bidder
- Ketika bidder aktif melakukan perubahan data akun saya maka pada list validasi bidder muncul tombol Verifikasi Perubahan Data
- Jika admin belum konfirmasi perubahan data maka tombolnya berwarna orange, jika admin sudah verifikasi perubahan data maka tombolnya menjadi disable
- Pada halaman verifikasi data bidder admin dapat melihat data apa saja yang diubah dan ketika validasi perubahan hanya data yang diubah saja yang fieldnya dapat diedit sedangkan data yang tidak diubah oleh bidder fieldnya masih disable
- Admin masih dapat merubah data yang diedit oleh bidder jika datanya yang diubah masih ada kesalahan
- Jika admin tolak perubahan data harus mengisi catatan menolak perubahan data, catatan ini akan tampil pada email perubahan data ditolak yang terkirim ke bidder
- Jika bidder melakukan perubahan data maka pada detail bidder akan ada Riwayat perubahan data
- Admin dapat melakukan setting Rekening aktif pada akun bidder ketika melakukan validasi akun bidder dengan melakukan setting on-off pada button
- Untuk default Rekening aktif bidder sebelum dilakukan setting ulang adalah pada baris pertama Rekening
- Rekening bidder yang aktif minimal 1 dan maksimal 3
- Ketika melakukan setting off pada Rekening terakhir yang aktif, maka ketika di klik tombol simpan akan menampilkan alert ‘Rekening aktif minimal satu!’
- Ketika melakukan setting on pada Rekening keempat, maka ketika di klik tombol simpan akan menampilkan alert ‘Rekening aktif maksimal tiga!’
- Ketika admin menambahkan baris input Rekening bidder, maka default setting yang tampil adalah off
- Jika Rekening bidder dalam kondisi on, maka data Rekening tersebut akan tampil pada informasi pembayaran pada saat buat invoice
- Jika Rekening bidder dalam kondisi off, maka data Rekening tersebut tidak akan tampil pada informasi pembayaran pada saat buat invoice
- Yang dapat melakukan setting status Rekening aktif maupun tidak aktif hanya admin, bidder tidak memiliki akses untuk melakukannya
- Admin dapat melakukan edit email bidder, langsung melalui halaman validasi akun (field email enabled). Apabila admin melakukan edit email bidder, maka informasi akun login bidder akan berubah
- Jika admin telah melakukan edit email bidder, maka ketika di klik simpan, akan menampilkan pop up konfirmasi ‘Apakah anda yakin mengubah email user?’ ketika di pilih Ya, maka sistem akan mengganti data email bidder tersebut

## Bidder Khusus

- Halaman ini digunakan untuk menambahkan bid owner yang ingin di setting pada bidder khusus tersebut
- Fitur yang dapat digunakan admin untuk melakukan setting penguncian bidder pada bid owner tertentu yang telah di setting
- Terdapat filter pada bidder khusus yang menampilkan kategori ID, Tanggal Setting, Alias, Bidder, dan Status Akun
- Tanggal setting yang tampil merupakan tanggal dilakukan setting oleh admin
- Alias akan terisi apabila bidder telah melengkapi form kelengkapan registrasi karena field tersebut required
- Terdapat Form untuk menambahkan bidder khusus dengan memilih bidder tersebut kemudian alias otomatis terisi
- Penambahan bid owner pada saat setting bidder khusus hanya dapat ditambahkan sampai 10 bid owner, apabila lebih dari 10 bid owner yang ditambahkan maka akan menampilkan alert “Lebih dari 10 data”
- Apabila menginputkan bid owner dengan data yang sama maka akan menampilkan alert “Input data ada yang sama”
- Terdapat alert “Apakah Anda yakin ingin membatalkan ?” ketika klik button batal pada penambahan bid owner di setting bidder khusus
- Terdapat setting bidder pada action menu yang digunakan untuk menambah bid owner (Bisa lebih dari 1 bid owner) dan dapat menghapus bid owner yang ditambahkan
- Terdapat action menu hapus bidder khusus pada aksi menu

## Profil Bidder

- Data list bidder yang tampil di profil bidder ini ialah bidder-bidder yang aktif & tidak aktif
- Data bergabung sejak diambil dari data tgl pertama kali bidder lakukan registrasi awal ke sistem phbid
- Data lokasi diambil dari data kota bidder
- Data detail rating diambil dari total rating yang didapatkan oleh bidder, ditampilkan dalam bentuk angka dan Bintang.
- Data menang lelang diambil dari jumlah order yang masuk pada list daftar order bidder (order bid owner yang diterima admin)
- Data tahun berdiri, jumlah karyawan, Jenis Pengiriman, Tentang Perusahaan jika belum disetting maka ditampilkan strip
- Data galeri Perusahaan jika belum disetting maka ditampilkan keterangan “Tidak Ada Data Tersedia” . Jika ada datanya maka foto-fotonya bisa dilihat ketika diklik
- Pada profil bidder juga muncul ulasan-ulasan dari bid owner, untuk nama bid owner tidak ditampilkan hanya ditampilkan label “Bid Owner”
- Pada ulasan ditampilkan tanggal bid owner beri ulasan, rute, dan isi ulasannya
- Data ulasan terbaru akan tampil paling atas
- Admin dapat hidden ulasan dan tampilkan ulasan
- Jika admin hidden ulasan maka ulasan tidak muncul pada halaman profil bidder di sisi bid owner & bidder
- Jika admin tampilkan ulasan Kembali maka pada halaman profil bidder di sisi bid owner & bidder muncul data ulasannya kembali

## Dokumen Aanwijzing

- Pada halaman dokumen aanwijzing menampilkan bid owner dengan status : waiting, aktif & tidak aktif
- Data nama dokumen aanwijzing tampil strip “-” pada bid owner yang statusnya “Waiting”
- Setting Dokumen Aanwijzing : Tanggal register tanggal sesuai waktu bid owner melakukan registrasi.
- Setting Dokumen Aanwijzing : Status dokumen defaultnya waiting, ketika statusnya aktif maka akan tampil pada halaman cari penawaran, request harga, pilih peserta lelang, detail lelang, batalkan lelang & detail order dan ketika statusnya tidak aktif maka hanya menampilkan data strip “-”.
- Setting Dokumen Aanwijzing : Dokumen aanwijzing batas ukuran filenya 4MB, untuk format filenya .PDF.
- Setting Dokumen Aanwijzing : Nama dokumen aanwijzing akan ditampilkan pada halaman pilih peserta lelang, detail lelang, batalkan lelang & detail order
- Detail Dokumen Aanwijzing : Default data nama dokumen aanwijzing, dokumen aanwijzing & tanggal setting terakhir tampil strip “-”

## Peserta Lelang

  - Pada list peserta lelang ialah data-data bid owner yang statusnya aktif dan tidak aktif
  - Default peserta lelang (bidder) yang terpilih pada bid owner ialah semua bidder yang statusnya aktif kecuali bidder yang dilakukan penguncian pada bid owner tertentu
  - Tiap bid owner masih bisa disetting peserta lelangnya siapa saja (checkbox peserta lelang masih bisa diunceklist sesuai keinginan bid owner)
  - Pada halaman setting peserta lelang untuk bidder yang dikunci pada bid owner tertentu maka tidak bisa diceklist checkboxnya pada bid owner lainnya
  - Sedangkan pada bid owner terkait bidder yang dikunci maka checkboxnya tidak bisa diunceklist karena sudah dikunci pada bid owner itu sendiri
  - Untuk penguncian bidder masih dilakukan di banckend (pgr)
  - Jika ada bidder baru yang aktif maka di setting peserta lelang semua bid owner akan otomatis bertambah peserta lelangnya (bidder baru default ikut / terpilih juga)

## Relasi Satu Pintu

  - Pada halaman relasi satu pintu berisi daftar / list data bid owner dengan jenis metode pembayaran satu pintu
  - Jika metode pembayaran bid owner yang sebelumnya satu pintu, kemudian diubah menjadi Direct namun masih memiliki relasi bidder terdaftar, maka bid owner tersebut akan tetap ditampilkan pada relasi satu pintu dengan metode pembayaran Direct
  - Jika metode pembayaran bid owner yang sebelumnya satu pintu, kemudian diubah menjadi metode pembayaran direct, tapi tidak memiliki relasi bidder yang terdaftar, maka bid owner tersebut tidak akan ditampilkan pada halaman relasi satu pintu
  - Data bid owner yang ditampilkan pada list relasi satu pintu meliputi data ID bid owner, tanggal melakukan setting metode pembayaran 1 pintu, nama perusahaan bid owner, email, jumlah relasi bidder yang ditambahkan, dan jenis metode pembayaran
  - Pada list relasi satu pintu, data tanggal 1 pintu ditampilkan dengan format DD/MM/YYYY. Sedangkan pada detail setting relasi, tanggal 1 pintu ditampilkan dengan format DD/MM/YYYY HH:MM
  - Default data relasi bidder yang tampil sebelum ditambahkan adalah 0 Bidder
  - Admin tidak dapat menambahkan relasi bidder baru dengan Bid owner jenis direct yang masih ada pada halaman relasi satu pintu. Button aksi dan tambah relasi di halaman setting relasi menjadi disabled
  - Admin dapat melakukan tambah relasi bidder melalui halaman setting relasi
  - Pada detail data bid owner di halaman setting relasi, menampilkan data ID, tanggal satu pintu, bid owner, email, jumlah relasi bidder, metode pembayaran, dan tanggal perubahan metode
  - Tanggal perubahan metode menunjukkan waktu perubahan metode yang dilakukan oleh admin dengan format DD/MM/YYYY HH:MM
  - Data yang ditambahkan meliputi nama perusahaan bidder, nomor virtual account, nama bank, atas nama, dan status
  - Data pada relasi bidder menampilkan daftar seluruh bidder dengan status aktif
  - Kolom nomor virtual account hanya dapat ditambahkan dengan data angka
  - Data nama bank diambil dari data master bank yang aktif pada sisi admin
  - 1 Bidder hanya dapat mempunyai 1 nomor virtual account yang ditambahkan dalam setting relasi
  - Jika relasi bidder yang sudah ada ditambahkan lagi pada bid owner yang sama, maka akan menampilkan alert 'Data Relasi Sudah Ada' ketika klik tombol simpan.
  - 1 bidder dapat ditambahkan sebagai relasi bider di banyak bid owner
  - Nomor virtual account dari relasi bidder dengan status aktif yang ditambahkan akan tampil pada informasi pembayaran ketika buat invoice
  - Data virtual account dari relasi bidder dengan status tidak aktif, tidak akan tampil pada informasi pembayaran ketika buat invoice
  - Setting relasi satu pintu hanya dapat dilakukan oleh admin

## Preference Notifikasi

  - Admin memiliki akses untuk mengatur preferensi notifikasi yang diterima oleh pengguna Bid Owner dan Bidder
  - Pengaturan ini mencakup dua jenis notifikasi, yaitu notifikasi sistem (push notifikasi) dan notifikasi email. Berikut jumlah jenis notifikasi yang tersedia
    - Notif email bid owner : 13 Notif
    - Notif email bidder : 8 Notif
    - Notif sistem bid owner : 17 Notif
    - Notif sistem bidder : 8 Notif
  - Jika Admin mencentang (checklist) notifikasi email atau push untuk Bid Owner atau Bidder, maka pengguna terkait akan menerima notifikasi tersebut.
  - Sebaliknya, jika Admin menghapus centang (unchecklist) pada notifikasi tertentu, maka pengguna terkait tidak akan menerima notifikasi tersebut.
  - Pengaturan preferensi notifikasi pada sisi Admin tersinkronisasi langsung dengan preferensi yang tampil pada sisi pengguna (Bid Owner dan Bidder). Artinya:
    - Jika notifikasi diaktifkan oleh Admin, maka statusnya juga aktif di tampilan pengguna.
    - Jika dinonaktifkan oleh Admin, maka notifikasi tersebut juga akan tampak tidak aktif di sisi pengguna.
  - Untuk notifikasi yang dimatikan, maka di halaman detail akan ditampilkan tambahan label “Tidak Aktif”
  - Notifikasi email akan menampilkan nomor referensi jika ada. Jika nomor referensi tidak diisikan maka pada email akan ditampilkan dengan tanda strip (-).
  - Pada ADMIN penambahan Nomor Referensi ini tampil pada notifikasi :
    - Order Baru
    - Bid Owner Submit Perjanjian
    - Perjanjian Diterima
    - Perjanjian Ditolak
    - Order Baru Telah Divalidasi Admin
    - Bidder Melengkapi Data Unit
    - Perubahan Jadwal
    - Notif Ambil Kontainer
    - Notif Stuffing
    - Notif Kapal Berlayar
    - Notif Kapal Sandar
    - Notif Rencana Dooring
    - Notif Dooring
    - Notif SJ Diterima Agen
    - Notif Dokumen Dikirim
    - Penilaian Order
