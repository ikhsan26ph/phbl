# Pengajuan Nego

  - Untuk status nego pertama kali yang tampil ketika belum dilakukan respon oleh Bidder, yaitu Waiting
  - Jika dari sisi bidder telah melakukan aksi respon nego, maka statusnya akan berubah menjadi Diterima, Ditolak, ataupun Di Negosiasi
  - Jika bidder melakukan aksi respon nego dengan memilih ‘Diterima’, maka status nego akan berubah menjadi Diterima dan akan terbentuk harga baru sesuai dengan nominal nego yang diajukan oleh bid owner
  - Jika bidder memilih aksi respon nego ‘Ditolak’, maka status nego akan berubah menjadi Ditolak dan harga baru tidak akan terbentuk. Pada kolom Harga Baru akan ditampilkan strip (-).
  - Jika bidder memilih aksi respon nego ‘Dicounter’, maka status nego akan berubah menjadi Negosiasi dan harga baru akan terbentuk sesuai dengan harga respon nego dari bidder.
  - Jika nego tersebut statusnya ‘Ditolak’ atau ‘Negosiasi’, maka bid owner dapat mengajukan nego kembali dengan klik tombol ‘Ajukan Nego Kembali’ pada halaman detail.
  - Rule ajukan nego kembali pada halaman detail sama seperti yang ada di halaman harga penawaran
  - Jika berhasil mengajukan nego kembali maka datanya akan ter created baru di daftar pengajuan nego dengan status waiting dan jumlah nego akan update, menyesuaikan dengan nego tersebut termasuk nego keberapa.
  - Jadi jika harga sudah melewati tgl selesai kontrak ataupun ada update harga dia gak bisa mengajukan nego lagi ketika klik submit muncul alert , untuk alertnya samakan seperti di halaman daftar nego (fitur ajukan nego kembali)
  - Inputan nego harga yang dimasukkan pada popup pengajuan nego, rule nominalnya tidak bisa dibawah harga nego yang pertama kali dan tidak bisa diatas harga awal / harga asli (fitur ajukan nego kembali)
  - Jadi inputan nominal harga yang dapat diinputkan diantara harga pengajuan nego awal dan harga asli (fitur ajukan nego kembali)
  - Ketika ajukan nego Kembali maka bidder mendapatkan notifikasi email dan wa pengajuan nego
  - Untuk bid owner yang memiliki akses satoria maka menu pengajuan nego ini di disable karena pada bid owner satoria tidak ada proses buat lelang
  - Untuk filter Nama Bidder, ditampilkan dalam bentuk free text.
  - Pada section informasi detail pengajuan nego, nilai PPN dan PPh juga ditampilkan. Untuk data yang belum memiliki nilai PPN dan PPh, sistem akan menampilkannya dengan tanda strip (-) sebagai penanda ketiadaan nilai PPN dan PPh
  - Custom sub user bid owner IMP dan TCI tidak bisa akses fitur ini
  - Untuk filter Nama Bidder, ditampilkan dalam bentuk free text. Bid owner dapat mencari data nama bidder dengan mengetikkan pada field filter Bidder
