# Push Notif

- Daftar push notifikasi yang diterima dapat diakses dengan mengklik ikon lonceng yang berada pada bagian kanan atas (top bar), di sebelah profil pengguna.
- Indikator titik merah akan ditampilkan di atas ikon lonceng notifikasi apabila terdapat notifikasi yang baru masuk atau belum dibaca.
- Bid Owner menerima push notifikasi yang terdiri dari :
  - Perubahan data diterima
  - Perubahan data ditolak
  - Nego Diterima
  - Nego Ditolak
  - Nego Dicounter
  - Jadwal  tersedia
  - Perjanjian Diterima
  - Perjanjian Ditolak
  - Kelengkapan Data Unit
  - Perubahan Jadwal
  - Update Ambil Kontainer
  - Update Stuffing
  - Update Kapal Berlayar
  - Update Kapal Sandar
  - Update Rencana Dooring
  - Update Dooring
  - Update SJ Diterima Agen
  - Update Dokumen Dikirim
- Push notifikasi yang diterima oleh Bid Owner terdiri dari kategori notif lelang, notif order, notif tracking, dan notif akun. Secara default notif bid owner tampil di “Semua Kategori”
- Apabila Bid Owner melakukan filter notif dengan kategori tertentu, maka sistem akan menampilkan daftar notifikasi sesuai dengan yang difilter
- Apabila bid owner pilih Cek Disini dari notifikasi tersebut, maka sistem akan menampilkan ke halaman detail yang sesuai. Contoh, jika bid owner klik Cek Disini pada notifikasi Perubahan Data Diterima, maka sistem akan menampilkan halaman Akun Saya dengan tampil perubahan data diterima
- Default notifikasi yang tampil adalah semua kategori notif dan notifikasi yang belum dibaca oleh bid owner. Apabila notifikasi tersebut sudah terbaca, maka otomatis akan hilang dari list notif
- Apabila bid owner melakukan filter tampil Semua Notif, maka semua notifikasi yang diterima (baik yang sudah dibaca maupun yang belum) akan ditampilkan pada list
- Fitur Hapus Notifikasi dan Tandai sebagai Dibaca secara default tidak aktif. Untuk mengaktifkan fitur ini, bid owner perlu mencentang notifikasi yang diinginkan atau memilih opsi Pilih Semua. Setelah notifikasi dipilih, tombol Hapus Notifikasi dan Tandai sebagai Dibaca akan otomatis aktif dan dapat digunakan.
- Daftar notifikasi akan secara otomatis terhapus selama 3 bulan
- Khusus untuk akun Sub User dari Bid Owner, akan ditampilkan halaman khusus bernama Preferensi Notifikasi Sub User.
- Halaman ini berfungsi untuk menampilkan daftar notifikasi yang dapat diterima oleh sub user tersebut.
- Jenis notifikasi yang ditampilkan mencakup Notifikasi Email dan Notifikasi Sistem (push notifikasi).
- Daftar notifikasi yang muncul disesuaikan dengan hak akses notifikasi yang telah ditentukan dan diatur oleh Admin melalui panel pengelolaan.

## Hasil kalibrasi automation 2026-09-28

- Halaman akun utama berada di `/home/notification`; daftar dimuat async
  melalui `POST /home/searchpushnotif`.
- Filter default adalah `Belum Dibaca` (`unread`) dan semua kategori (`all`).
  Opsi kategori aktual sesuai rule: Lelang, Order, Akun, Tracking.
- Setiap baris menampilkan kategori, tanggal, waktu, badge unread, checkbox,
  serta tombol `Cek Disini` dengan tujuan detail yang masih berada di origin
  PHBID yang sama.
- Pilihan jumlah data adalah 20/30/50/100 dan default aktualnya 50.
- Aksi Hapus Notif dan Tandai Dibaca baru aktif setelah satu notifikasi atau
  Pilih Semua dicentang.
- Coverage automation akun utama bersifat read-only: Cek Disini, Hapus Notif,
  dan Tandai Dibaca tidak diklik. Preferensi/daftar khusus sub-user belum masuk
  scope suite ini.

## Hasil uji trigger end-to-end 2026-09-29

- Terverifikasi menerima record baru dari respons jadwal, kelengkapan data unit,
  serta update Tracking: Stuffing, Kapal Berlayar, Kapal Sandar, Rencana
  Dooring, Dooring, dan SJ Diterima Agen. Salinan Admin mempunyai isi identik.
- Aksi inbox Tandai Dibaca dan Hapus telah diuji pada satu notifikasi yang baru
  dipicu, dengan ID yang sama dari awal sampai record terhapus.
- Rincian trigger, akun, state fixture, dan blocker ada di
  `docs/PUSH-NOTIF-TRIGGER-REPORT-2026-09-29.md`.

## Hasil uji trigger Admin 2026-09-29

- Shipper fixture menerima record baru `Perjanjian Pengiriman Divalidasi`
  untuk order `20260929-06501` setelah Admin memilih Terima Order.
- Shipper fixture menerima record baru `Perjanjian Pengiriman Ditolak` untuk
  order `20260826-06506` setelah Admin memilih Tolak Order dan mengisi alasan.
- Shipper fixture menerima `Perubahan Jadwal` untuk order `20260829-06504`
  setelah Admin menyimpan Ganti Jadwal. Jadwal dikembalikan ke nilai semula;
  submit revert juga menghasilkan notifikasi baru sesuai perilaku server.
