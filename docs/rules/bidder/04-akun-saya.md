# Akun Saya

- Untuk bidder yang pertama kali login (setelah akun aktif), muncul notif “Selamat datang di PHBID”
- Apabila akun bidder dinonaktifkan , maka akses yang dimiliki oleh bidder hanya akun saya dan muncul notif  “Akun anda dinonaktifkan”
- NPWP dan SIUP yang telah diupload, bisa didownload kembali oleh bidder di halaman akun saya
- Berlaku juga untuk logo perusahaan yang telah diupload. Bisa download kembali
- Di sisi bidder, Beranda pada breadcrumb diarahkan ke halaman daftar pengajuan lelang
- Apabila saat edit akun saya, akan diganti dengan nomor WA yang sudah digunakan oleh akun lain (termasuk sub user) maka muncul alert “Nomor whatsapp sudah terdaftar di sistem”
- Ketika bidder aktif melakukan perubahan pada data akun saya maka perlu konfirmasi dari admin sehingga data akun yang diubah tidak otomatis terganti.
- Ketika perubahan data akun saya belum dikonfirmasi admin maka bidder tidak dapat mengedit akun saya kembali (tombol edit akun saya disable)
- Ketika admin validasi terima perubahan data maka data pada akun saya akan terganti sesuai data yang diubah sebelumnya dan tombol edit akun saya aktif kembali
- Ketika admin tolak perubahan data maka data akun bidder tetap tidak terganti dan bidder dapat mengedit akun saya kembali (tombol edit akun saya aktif kembali)
- Ketika admin terima ataupun tolak perubahan data akun saya bidder maka bidder akan mendapatkan notif email perubahan data diterima ataupun perubahan data ditolak
- Untuk custom sub user bidder halaman akun saya berbeda dengan bidder utama, pada sub user bidder halaman akun saya data yang ditampilkan ialah :
  - Nama
  - Email
  - Nomor Whatsapp
  - Bagian Staff
- Untuk sub user dengan custom hak akses notif email lelang baru, notif email order berhasil diverifikasi, notif email pengajuan nego maka hanya halaman akun saya saja yang terbuka
