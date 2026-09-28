# Push Notif

- Daftar push notifikasi yang diterima dapat diakses dengan mengklik ikon lonceng yang berada pada bagian kanan atas (top bar), di sebelah profil pengguna.
- Indikator titik merah akan ditampilkan di atas ikon lonceng notifikasi apabila terdapat notifikasi yang baru masuk atau belum dibaca.
- Bidder menerima push notifikasi yang terdiri dari :
  - Perubahan data diterima
  - Perubahan data ditolak
  - Pengajuan lelang
  - Lelang dibatalkan
  - Pengajuan Nego
  - Request Update Harga
  - Bid Owner Request Jadwal
  - Validasi Perjanjian Bid Owner Diterima
- Push notifikasi yang diterima oleh Bidder terdiri dari kategori notif lelang, notif order, dan notif akun. Secara default notif Bidder tampil di “Semua Kategori”
- Apabila Bidder melakukan filter notif dengan kategori tertentu, maka sistem akan menampilkan daftar notifikasi sesuai dengan yang difilter
- Apabila Bidder pilih Cek Disini dari notifikasi tersebut, maka sistem akan menampilkan ke halaman detail yang sesuai. Contoh, jika Bidder klik Cek Disini pada notifikasi Perubahan Data Diterima, maka sistem akan menampilkan halaman Akun Saya dengan tampil perubahan data diterima
- Default notifikasi yang tampil adalah semua kategori notif dan notifikasi yang belum dibaca oleh Bidder. Apabila notifikasi tersebut sudah terbaca, maka otomatis akan hilang dari list notif
- Apabila Bidder melakukan filter tampil Semua Notif, maka semua notifikasi yang diterima (baik yang sudah dibaca maupun yang belum) akan ditampilkan pada list
- Fitur Hapus Notifikasi dan Tandai sebagai Dibaca secara default tidak aktif. Untuk mengaktifkan fitur ini, Bidder perlu mencentang notifikasi yang diinginkan atau memilih opsi Pilih Semua. Setelah notifikasi dipilih, tombol Hapus Notifikasi dan Tandai sebagai Dibaca akan otomatis aktif dan dapat digunakan.
- Daftar notifikasi akan secara otomatis terhapus selama 3 bulan

## Hasil kalibrasi automation 2026-09-28

- Halaman akun utama berada di `/home/notification`; daftar dimuat async
  melalui `POST /home/searchpushnotif`.
- Filter default adalah `Belum Dibaca` (`unread`) dan semua kategori (`all`).
  Opsi kategori aktual sesuai rule: Lelang, Order, Akun.
- Setiap baris menampilkan kategori, tanggal, waktu, badge unread, checkbox,
  serta tombol `Cek Disini` dengan tujuan detail yang masih berada di origin
  PHBID yang sama.
- Pilihan jumlah data adalah 20/30/50/100 dan default aktualnya 50.
- Aksi Hapus Notif dan Tandai Dibaca baru aktif setelah satu notifikasi atau
  Pilih Semua dicentang.
- Coverage automation akun utama bersifat read-only: Cek Disini, Hapus Notif,
  dan Tandai Dibaca tidak diklik agar data akun demo tidak berubah.
