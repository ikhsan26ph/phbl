# Pengajuan Lelang

- Pada daftar pengajuan lelang terdapat penambahan fitur Tab-Tab untuk mengelompokkan data lelang sesuai kondisi masing-masing
- Secara default, tab yang pertama kali aktif pada sisi admin saat membuka menu pengajuan lelang adalah tab 'Semua Lelang'
- Tab-tab lelang tersebut ialah :
    - Perlu Input Harga : Lelang yg perlu input harga / lelang yang belum lewat tanggal tutup lelang. Tab ini juga menampilkan daftar lelang yang sedang aktif diajukan permintaan harga oleh Bid Owner, namun dengan status harga ‘Belum Input Penawaran’ pada sisi Bidder.
    - Perlu Update Harga : Lelang yang perlu update harga. Status harga ‘Telah input penawaran’ dan ‘Telah input harga’ pada sisi bidder.
    - Lelang Tutup : Lelang yang melewati tanggal tutup lelang ataupun melewati tgl tutup request update / input harga
    - Telah Akhir Kirim : Lelang yang melewati tgl rencana akhir kirim
    - Lelang Batal : Lelang yang telah dibatalkan
    - Semua Lelang :  Semua data lelang tampil
- Pada tab Perlu Input Harga, pilihan action menunya ialah :
    - Detail Pengajuan Lelang
    - Lihat Harga Penawaran
    - Tambah Peserta Lelang
    - Edit Data Lelang
    - Batalkan Lelang
    - History Data Lelang
- Pada tab Perlu Update Harga, pilihan action menunya ialah :
  - Detail Pengajuan Lelang
  - Lihat Harga Penawaran
  - Tambah Peserta Lelang
  - Edit Data Lelang
  - Batalkan Lelang
  - Menuju Update Harga
  - History Data Lelang
  - History Update Harga
- Pada tab Lelang Tutup, pilihan action menunya ialah :
  - Detail Pengajuan Lelang
  - Lihat Harga Penawaran
  - Tambah Peserta Lelang
  - Edit Data Lelang
  - Batalkan Lelang
  - Minta Update Harga
  - History Data Lelang
  - History Update Harga
- Pada tab Telah Akhir Kirim , pilihan action menunya ialah :
  - Detail Pengajuan Lelang
  - Lihat Harga Penawaran
  - Tambah Peserta Lelang
  - Edit Data Lelang
  - Batalkan Lelang
  - Minta Update Harga
  - History Data Lelang
  - History Update Harga
- Pada tab Lelang Batal, pilihan action menunya ialah :
  - Detail Pengajuan Lelang
  - Lihat Harga Penawaran
  - Tambah Peserta Lelang
  - Edit Data Lelang
  - Batalkan Lelang
  - History Data Lelang
  - History Update Harga
- Jika lelang proses update harga dan ada harga yang diupdate maka pada bidder lelang tersebut masuk ke Tab Perlu Update Harga, Jika lelang melewati tgl tutup update harga maka akan berpindah ke Tab Lelang Tutup
  - Lelang yang telah dibuat oleh bid owner akan muncul di halaman ini
  - Data lelang yang telah dibatalkan masih muncul pada list pengajuan lelang
  - Admin juga bisa mendownload kembali dokumen lelang di halaman detail pengajuan lelang
  - Tanggal terkirim yang tampil diambil dari waktu saat bid owner submit lelang.
  - Status harga adalah informasi dari bidder yang telah diundang apakah sudah input harga atau belum. Ada 3 status yaitu Belum Input Penawaran, Telah Input Harga dan Telah Input Penawaran, Berikut penjelasannya :
    - Belum Input Penawaran => bidder belum input harga dan jadwal
    - Telah Input Harga => bidder sudah input harga namun belum input jadwal
    - Telah Input Penawaran => bidder sudah input harga dan jadwal
  - Pada daftar pengajuan lelang admin terdapat perubahan, Dimana tombol aksi jika diklik akan menampilkan pilihan :
- Detail Pengajuan Lelang => diarahkan ke halaman detail pengajuan lelang
- Lihat Harga Penawaran => diarahkan ke halaman cari penawaran dan ditampilkan harga penawarannya
- Tambah Peserta Lelang => diarahkan ke halaman tambah peserta lelang
- Edit Data Lelang => diarahkan ke halaman edit data lelang
- Batalkan Lelang => diarahkan ke halaman batalkan lelang
- Minta Update Harga => diarahkan ke halaman request update harga
- History Data Lelang => diarahkan ke halaman Riwayat perubahan data lelang
- History Update Harga => diarahkan ke halaman Riwayat update harga
  - Pada detail pengajuan lelang, akan ditampilkan status lelang, macam-macam status lelang :
- BELUM BUKA : lelang belum memasuki waktu buka lelang
- LELANG DIBUKA : lelang belum melewati tgl tutup lelang
- LELANG DITUTUP : lelang sudah melewati tgl tutup lelang
- LELANG BATAL : lelang sudah dibatalkan
  - Pada detail pengajuan lelang dibagian Bidder Penerima Lelang, terdapat jumlah penawaran, jumlah penawaran menampilkan total bidder yang sudah input harga dari total bidder yang diundang
  - Pada detail pengajuan lelang jika lelang pernah dilakukan edit data lelang ataupun tambah peserta lelang maka akan ada data Perubahan Terakhir dan jika klik History akan diarahkan ke halaman Riwayat perubahan data
  - Pada daftar pengajaun lelang, jika lelang pernah diajukan request update harga maka aka nada tanda “#” nya. Contoh jika #1 berarti lelang tersebut pernah diajukan request update harga 1 kali. Jika #2 berarti lelang tersebut pernah diajukan request update harga 2 kali dan seterusnya
  - Nomor lelang akan berwarna hijau apabila lelang tersebut sudah lewat tgl rencana akhir kirim, sudah ada harganya namun belum ada order

## Edit Data Lelang

  - Penyesuain rule edit data lelang :
    - Admin dapat edit tanggal rencana akhir kirim sampai kapan pun (dilepas)
    - Alamat asal, kota asal dan alamat tujuan, kota tujuan bisa di edit sampai rencana akhir kirim
    - Admin dapat tambah kontainer sampai rencana akhir kirim
  - Admin tidak dapat edit data lelang apabila lelang sudah dibatalkan, akan muncul alert “Tidak bisa edit! Lelang sudah dibatalkan”
  - Admin tidak dapat edit data lelang apabila lelang masih proses update harga, akan muncul alert “Tidak bisa edit! Lelang masih proses update harga”
  - Jika lelang sudah ada order maka admin masih bisa edit data lelang namun admin tidak bisa edit data nomor lelang, Tgl buka lelang, tgl tutup lelang dan akan muncul alert “Tidak bisa edit! Lelang sudah ada order”
  - Jika lelang sudah ada yang input harga maka data Alamat asal & Alamat tujuan tidak bisa diedit
  - Jika lelang di edit dari admin maka di history edit data lelang akan ada label by admin, generate dengan akun email admin yang melakukan edit
  - Jika admin edit data lelang, data yang bisa diedit ialah Nomor Lelang, Tanggal Buka Lelang, Tanggal Tutup Lelang, Tgl Rencana Mulai Kirim, Tgl Rencana Akhir Kirim, Kota Asal, Informasi Alamat Lengkap Asal, PIC Tempat Asal, Telp. PIC Tempat Asal, Kota Tujuan Informasi Alamat Lengkap Tujuan, PIC Tempat Tujuan, Telp. PIC Tempat Tujuan, Volume Pengiriman & Deskripsi Barang
  - Untuk nomor lelang hanya bisa diinputkan huruf dan karakter / - # ( ) +. Selain itu tidak bisa dan akan muncul alert “Tidak Bisa Input Simbol”
  - Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
  - Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.
  - Dokumen aanwijzing ditampilkan berupa popup.

## Tambah Peserta Lelang

  - Admin tidak dapat tambah peserta lelang apabila melewati tgl rencana akhir kirim, akan muncul alert “Tidak bisa tambah peserta! Lelang sudah melewati tgl. rencana akhir kirim”
  - Admin tidak dapat tambah peserta lelang apabila lelang sudah dibatalkan, akan muncul alert “Tidak bisa tambah peserta! Lelang sudah dibatalkan”
  - Admin tidak dapat tambah peserta lelang apabila lelang masih proses update harga, akan muncul alert “Tidak bisa tambah peserta! Lelang masih proses update harga”
  - Pada halaman Tambah Peserta Lelang, data peserta lelang yang ditampilkan diambil dari setting peserta lelang bid owner
  - Untuk bidder yang sudah diundang / dipilih sembelumnya maka pada halaman ini sudah dalam keadaan terceklis dan tidak bisa dihapus ceklistnya (tampilannya seperti disable namun terceklist)
  - Jika tidak ada bidder baru yang ditambahkan maka tombol simpan tidak bisa diklik dan tidak bisa simpan perubahan
  - Namun jika ada tambahan bidder baru maka tombol simpan enable Kembali
  - Bidder yang ditambahkan tidak diberi notif pengajuan lelang
  - Jika bidder berhasil ditambahkan maka nantinya bidder tersebut dapat menambah harga pada lelang tersebut
  - Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
  - Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.
  - Dokumen aanwijzing ditampilkan berupa popup.

## History Data Lelang

  - Jika data lelang pernah dilakukan edit data lelang ataupun tambah peserta lelang maka akan muncul History Data Lelang
  - Pada halaman Riwayat perubahan data lelang ini menampilkan data-data lelang apa saja yang dilakukan perubahan beserta tgl perubahannya
  - Perubahan terbaru akan ditampilkan paling atas, perubahan paling lama ditampilkan paling bawah

## Batalkan Lelang

      - Admin dapat batalkan lelang sampai kapanpun asalkan lelang tersebut belum ada order
      - Jika lelang sudah dibatalkan maka ketika klik Batalkan Lelang tidak bisa dan muncul alert “Tidak bisa batal! Lelang sudah dibatalkan”
      - Jika lelang proses update harga maka tidak bisa dibatalkan dan muncul alert “Tidak bisa batal! Lelang masih proses update harga”
      - Ketika batal lelang wajib pilih alasan lelang dibatalkan, jika tidak ada bisa pilih lainnya dan input Catatan Lelang Dibatalkan
      - Jika lelang dibatalkan sebelum tutup lelang maka akan kirim notifikasi wa lelang dibatalkan ke semua bidder yang diundang
      - Jika lelang dibatalkan setelah tutup lelang maka akan kirim notifikasi email lelang dibatalkan ke bidder yang sudah input harga
      - Ketika lelang berhasil dibatalkan maka lelang masih dapat digunakan pada history data lelang saat buat lelang Kembali
      - Ketika lelang berhasil dibatalkan maka di detail pengajuan lelang akan muncul card Lelang Batal
      - Jika lelang dibatalkan dari admin maka di detail pengajuan lelang admin samping Tanggal lelang batal aka nada penanda “(By Admin)”
      - Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
      - Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.
      - Dokumen aanwijzing ditampilkan berupa popup.

## Request Harga

      - Admin dapat mengajukan request harga hanya pada lelang yang sudah melewati tanggal tutup lelang (status : Lelang Ditutup)
      - Admin dapat mengajukan request harga di semua lelang, baik yang telah memiliki harga penawaran maupun yang belum memiliki harga penawaran
      - Jika admin mengajukan request harga pada lelang yang sudah memiliki harga, maka pada sisi bidder, request harga tersebut akan dikategorikan pada Request Update Harga
      - Namun jika admin mengajukan request harga pada lelang yang belum memiliki harga, maka pada sisi bidder, request harga tersebut akan dikategorikan menjadi Request Input Harga
      - Admin tidak dapat mengajukan request harga apabila lelangnya sudah dibatalkan
      - Admin tidak dapat mengajukan request harga apabila lelang sudah melewati tanggal rencana akhir kirim. Ketika di klik Request harga, maka akan muncul alert “Tidak bisa request harga! Lelang sudah melewati tgl. rencana akhir kirim”
      - Jika sebelumnya admin telah mengajukan request harga maka admin dapat mengajukan request kembali apabila request harga telah melewati tanggal tutup request harga yang ditambahkan.
      - Batas maksimal admin setting Tanggal Tutup Request Harga adalah tanggal rencana akhir kirim namun tidak dapat melewati / melebihi tanggal rencana akhir kirim
      - Data peserta lelang yang tampil pada halaman request harga dan dapat diundang oleh admin mencakup semua bidder yang terdaftar sebagai peserta lelang admin, baik yang telah menginputkan harga maupun yang belum menginputkan harga. Jadi pada request harga ini admin dapat mengundang seluruh bidder tanpa melihat status harganya.
      - Peserta lelang yang tampil pada halaman request harga akan ditampilkan informasi status harganya. Untuk status harga terdiri dari ‘Belum Input Penawaran’, ‘Telah Input Penawaran’, dan ‘Telah Input Harga’. admin dapat mengundang semua bidder di ketiga status harga tersebut
      - Bidder dengan status harga ‘Telah Input Penawaran’ adalah bidder yang telah merespons pengajuan lelang dari admin dengan menginputkan harga dan jadwal yang tersedia.
      - Bidder dengan status harga ‘Telah Input Harga’ adalah bidder yang telah merespons pengajuan lelang dari admin dengan hanya menginputkan harga, tanpa menginputkan jadwal yang tersedia.
      - Sedangkan untuk Bidder dengan status harga ‘Belum Input Penawaran’ adalah bidder yang tidak merespons pengajuan lelang dari admin (tidak menginputkan harga maupun jadwal).
      - Secara default, checkbox akan terpilih pada bidder dengan status harga ‘Telah Input Penawaran’ dan ‘Telah Input Harga’. Namun admin masih dapat melakukan setting peserta lelang yang akan diundang untuk request harga
      - Jika admin sebelumnya mengajukan request harga dan terdapat bidder yang tidak merespons, maka saat admin mengajukan permintaan ulang, di bagian peserta lelang akan muncul tulisan “(No Respon)” di samping nama bidder tersebut.
      - Jika pada request sebelumnya tidak ada bidder yang merespon (peserta lelang No respon semua) maka ketika admin mengajukan request harga kembali masih dapat dilakukan.
      - Ketika admin berhasil melakukan request harga maka sistem akan otomatis mengirim notifikasi email dan wa request update/input harga kepada bidder yang diundang request saja.
      - Lelang yang sedang diajukan permintaan harga, jika sudah terdapat harga penawaran, akan ditampilkan pada tab ‘Perlu Update Harga’. Jika belum ada harga penawaran, akan ditampilkan pada tab ‘Perlu Input Harga’.
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
      - Setelah lelang telah diajukan request harga, maka pada halaman pengajuan lelang akan tampil tambahan label (#1) yang letaknya di sebelah nomor lelang. Angka 1 akan terus bertambah sesuai dengan berapa kali lelang tersebut diajukan request harga
      - Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
      - Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.
      - Dokumen aanwijzing ditampilkan berupa popup.

## History Request Harga

  - Ketika lelang pernah dilakukan request harga maka pada lelang akan tampil pilihan action menu “History Request Harga”
  - Pada halaman ini akan ditampilkan data Tanggal Request, Tanggal Tutup Request Harga, dan Peserta Yang Diundang
  - Request harga terbaru akan ditampilkan paling atas, dan request harga yang paling lama akan ditampilkan dibawah
  - Pada halaman riwayat request harga yang dilakukan admin, terecord data bahwa telah melakukan close request harga.
