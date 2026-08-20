# Registrasi

- Pada halaman registrasi, terdapat penyesuaian istilah Bid Owner dan Bidder. Untuk Bid Owner akan ditampilkan sebagai ‘Pemilik Barang’. Sedangkan untuk bidder, akan ditampilkan sebagai ‘Ekspedisi’
- Bid Owner dan Bidder yang ingin melakukan registrasi akun dapat memilih istilah yang sesuai dengan pembaruan terbaru.
- Untuk default radio button Pemilik Barang (Bid Owner) dan Ekspedisi (Bidder) adalah tidak terpilih, namun required (wajib dipilih salah satu)
- Semua field harus diisi ketika registrasi seperti field Nama, No. Telepon/ WhatsApp, Nama Perusahaan, Email, Kata Sandi, Ketik Ulang Kata Sandi dan captcha
- Nomor telepon / whatsapp hanya bisa diisi angka
- Ada pengecekan apabila nomor whatsapp yang didaftarkan sudah pernah digunakan oleh akun lain maka muncul alert “Nomor whatsapp sudah terdaftar di sistem” ketika klik tombol Registrasi
- Kata sandi yang diinputkan minimal 6 digit dan kombinasi dari huruf dan angka. Huruf yang diinputkan bisa uppercase maupun lowercase
- Jika kata sandi hanya huruf atau hanya angka saja maka akan muncul alert “Kombinasi Hanya Boleh Huruf dan Angka” ketika klik tombol Registrasi
- Jika kata sandi kurang dari 6 digit maka muncul alert “Kata Sandi Minimal 6 Digit” ketika klik tombol Registrasi
- Data-data yang ada di footer seperti sosial media, layanan email & whatsapp dan copyright diambil dari halaman setting general admin
- Setelah klik tombol Registrasi , bid owner akan menerima email untuk aktivasi akun dan lanjut mengisi kelengkapan registrasi bid owner

## Konfirmasi Email

- Ekspedisi (Bidder) dapat mengirim ulang notif registrasi dg klik tombol Kirim Ulang Notifikasi Registrasi
- Data-data yang ada di footer notif email seperti sosial media, layanan email & whatsapp dan copyright diambil dari halaman setting general admin

## Kelengkapan Registrasi

- Data nama, nama perusahaan dan nomor whatsapp yang tampil ngedraft dari halaman registrasi awal
- Semua field harus diisi untuk kelengkapan registrasi seperti field Provinsi, Kota, Alamat, Logo Perusaahan => yang bertanda bintang required
  - Logo perusahaan yang bisa diupload maksimal 4 MB dgn format.jpg, .jpeg, .png (dan juga rule ini berlaku untuk NPWP dan SIUP yang diupload, pada NPWP da SIUP format bisa .pdf juga)
  - Data bank pilihan datanya diambil dari master bank
- Setelah mengisi kelengkapan registrasi bidder , akan diarahkan ke halaman akun saya dan ada notif bahwa akun menunggu validasi dari admin PHBID.
  - Akses menu nya hanya AKUN SAYA
