# Master

## Provinsi

- Hanya menampilkan data provinsi. Datanya diambil dari master provinsi PH Bid Darat

## Kota

      - Hanya menampilkan data kota. Datanya diambil dari master kota PH Bid Darat

## Pelabuhan

      - Menampilkan data-data pelabuhan beserta UN Code dan nama kotanya
      - Nama UN Code atau nama pelabuhan tidak bisa sama antar data. Jika ada yang sama maka tidak bisa simpan dan muncul alert “UN Code atau Nama Pelabuhan Sudah Digunakan”
      - Jika data pelabuhan sudah digunakan pada lelang maka yang bisa diedit hanya statusnya saja untuk field UN Code, Nama Pelabuhan, Kota/Kab. Disable semua
      - Jika pelabuhan sudah digunakan pada lelang maka tidak bisa hapus dan muncul alert “Data sudah digunakan pada lelang”
      - Data pelabuhan dapat di export kedalam bentuk excel

## Bank

      - Menampilkan data-data bank yang telah dibuat
      - Nama bank tidak boleh ada yang sama, jika ada yang sama maka ketika simpan tidak bisa dan muncul alert “Nama Bank Sudah Digunakan”
      - Jika bank sudah digunakan pada registrasi akun maka statusnya saja yang bisa diedit untuk field nama bank disable
      - Jika bank sudah digunakan pada registrasi akun maka tidak bisa hapus dan muncul alert “Data sudah digunakan pada registrasi”

## Include

      - Menampilkan data-data include yang tela dibuat
      - Nama include tidak boleh ada yang sama, jika ada yang sama maka ketika simpan tidak bisa dan muncul alert “Nama Include Sudah Digunakan”
      - Jika include sudah digunakan pada lelang dan juga harga maka ketika edit :
        - Jika sudah digunakan pada lelang, hanya status saja yang bisa diedit dan muncul alert “Data sudah digunakan pada pengajuan lelang, yakin untuk mengedit?”
        - Jika sudah digunakan pada harga, hanya status saja yang bisa diedit dan muncul alert “Data sudah digunakan pada pengajuan harga, yakin untuk mengedit?”
        - Jika sudah digunakan pada lelang dan harga, hanya status saja yang bisa diedit dan muncul alert “Data sudah digunakan pada pengajuan lelang dan harga, yakin untuk mengedit?
      - Jika include sudah digunakan pada lelang dan juga harga maka ketika hapus :
        - Jika sudah digunakan pada lelang, tidak bisa hapus include dan muncul alert “Data sudah digunakan pada pengajuan lelang”
        - Jika sudah digunakan pada harga, tidak bisa hapus include dan muncul alert “Data sudah digunakan pada harga”
        - Jika sudah digunakan pada lelang dan harga, tidak bisa hapus include dan muncul alert “Data sudah digunakan pada pengajuan lelang dan harga”
      - Data include ini yang akan tampil di halaman buat lelang, buat harga, edit harga

## Kemasan

- Menampilkan data kemasan yang telah dibuat
- Nama kemasan tidak boleh ada yang sama, jika ada yang sama maka ketika simpan tidak bisa dan muncul alert “Nama Kemasan Sudah Digunakan”
- Jika kemasan sudah digunakan pada order maka hanya status saja yang bisa diedit
- Jika kemasan sudah digunakan pada order maka tidak bisa hapus dan muncul alert “Data sudah digunakan pada orderan”

## Pelayaran

- Menampilkan data pelayaran yang telah dibuat
- Nama pelayaran tidak boleh ada yang sama, jika ada yang sama maka ketika simpan tidak bisa dan muncul alert “Nama Pelayaran Sudah Digunakan”
- Jika pelayaran sudah digunakan pada harga maka hanya status saja yang bisa diedit
- Jika pelayaran sudah digunakan pada harga maka tidak bisa hapus dan muncul alert “Data Sudah digunakan pada master harga”

## Jenis Kontainer

      - Menampilkan data jenis kontainer yang telah dibuat
      - Nama jenis kontainer tidak boleh ada yang sama, jika ada yang sama maka ketika simpan tidak bisa dan muncul alert “Jenis Kontainer Sudah Digunakan”
      - Jika jenis kontainer sudah digunakan pada harga maka hanya status saja yang bisa diedit
      - Jika jenis kontainer sudah digunakan pada harga maka tidak bisa hapus dan muncul alert “Data sudah digunakan pada harga”

## Dokumen Penagihan

      - Menampilkan data dokumen penagihan yang telah dibuat
      - Nama dokumen penagihan tidak boleh ada yang sama, jika ada yang sama maka ketika simpan tidak bisa dan muncul alert “Nama Dokumen Penagihan Sudah digunakan”
      - Jika dokumen penagihan sudah digunakan pada lelang maka hanya status saja yang bisa diedit
      - Jika dokumen penagihan sudah digunakan pada lelang maka tidak bisa hapus dan muncul alert “Data sudah digunakan pada lelang”

## Iklan Berbayar

- Bidder yang telah ditambahkan pada master iklan akan tampil di halaman pilih peserta lelang
- Bidder akan muncul pada rekomendasi bidder di halaman buat lelang sesuai range waktu tanggal mulai sampai dengan tanggal berakhir
- Tanggal mulai defaultnya adalah tanggal & jam saat ini
- Saat bidder ditambahkan / diedit dengan bidder yang sudah ada di list , akan muncul alert “Ada nama bidder yang sama”

## Petugas APK

  - Menampilkan data-data petugas yang telah dibuat sebelumnya
  - 1 nomor petugas hanya untuk 1 bidder sehingga apabila ada data nomor yang sama maka tidak bisa disimpan dan muncul alert “Nomor Whatsapp Sudah Terdaftar”
  - Terdapat perubahan rule Jika petugas sudah ditugaskan dan penugasannya masih ada (belum dikerjakan) maka data yang dapat diedit ialah nama petugas, kota, status, alamat petugas dan bidder. Untuk no. whatsapp disable. Namun ketika edit bidder maka tidak bisa dan muncul alert “Petugas masih ada Pengerjaan Tracking ! Harap selesaikan penugasan terlebih dahulu”
  - Namun jika data petugas sudah tidak ada data penugasan maka data bidder bisa diubah ke bidder lainnya
  - Jika data bidder pada master petugas apk diubah maka akan berefek pada tampilan profil apps, data tracking pada apps dan di halaman penugasan tracking
  - Jika petugas sudah ditugaskan maka tidak bisa dihapus dan muncul alert “Petugas Sudah Ditugaskan”
  - Data petugas ini akan muncul pada halaman tracking pengiriman.
