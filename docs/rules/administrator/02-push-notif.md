# Push Notif

- Daftar push notifikasi yang diterima dapat diakses dengan mengklik ikon lonceng yang berada pada bagian kanan atas (top bar), di sebelah profil pengguna.
- Indikator titik merah akan ditampilkan di atas ikon lonceng notifikasi apabila terdapat notifikasi yang baru masuk atau belum dibaca.
- Admin menerima seluruh push notifikasi yang diterima oleh to Bidder, to Bid Owner, dan notif to admin itu sendiri.
- Untuk notif to admin terdiri dari :
  - Konfirmasi Perubahan Data
  - PNP Edit Permintaan Muat (TEP)
  - Penilaian Order ke Bidder
  - Dokumen Tagihan Pengiriman
- Push notifikasi yang diterima oleh Admin terdiri dari kategori notif lelang, notif order, notif tracking, dan notif akun. Secara default notif Admin tampil di “Semua Kategori”
- Apabila Admin melakukan filter notif dengan kategori tertentu, maka sistem akan menampilkan daftar notifikasi sesuai dengan yang difilter
- Apabila Admin pilih Cek Disini dari notifikasi tersebut, maka sistem akan menampilkan ke halaman detail yang sesuai. Contoh, jika Admin klik Cek Disini pada notifikasi Konfirmasi Perubahan Data, maka sistem akan menampilkan halaman verifikasi Perubahan Data Bid Owner / Bidder, sesuai dengan id yang ditampilkan
- Default notifikasi yang tampil adalah semua kategori notif dan notifikasi yang belum dibaca oleh Admin. Apabila notifikasi tersebut sudah terbaca, maka otomatis akan hilang dari list notif
- Apabila Admin melakukan filter tampil Semua Notif, maka semua notifikasi yang diterima (baik yang sudah dibaca maupun yang belum) akan ditampilkan pada list
- Fitur Hapus Notifikasi dan Tandai sebagai Dibaca secara default tidak aktif. Untuk mengaktifkan fitur ini, Admin perlu mencentang notifikasi yang diinginkan atau memilih opsi Pilih Semua. Setelah notifikasi dipilih, tombol Hapus Notifikasi dan Tandai sebagai Dibaca akan otomatis aktif dan dapat digunakan.
- Daftar notifikasi akan secara otomatis terhapus selama 3 bulan

## Hasil kalibrasi automation 2026-09-28

- Halaman aktual berada di `/home/notification`; daftar dimuat async melalui
  `POST /home/searchpushnotif`.
- Filter default adalah `Belum Dibaca` (`unread`) dan semua kategori (`all`).
- Opsi kategori aktual Admin: Lelang, **Order Baru**, Order, Akun, Tracking.
  `Order Baru` merupakan opsi tambahan yang tidak disebut terpisah pada rule.
- Setiap baris menampilkan kategori, tanggal, waktu, label penerima
  (`to Shipper`/`to Transporter`/`to Admin`), badge unread, checkbox, dan tombol
  `Cek Disini` dengan tujuan detail.
- Pilihan jumlah data adalah 20/30/50/100 dan default aktualnya 50.
- Aksi Hapus Notif dan Tandai Dibaca memakai state `item-disable` sampai minimal
  satu notifikasi dicentang; memilih satu atau Pilih Semua mengaktifkannya.
- Ikon lonceng memiliki link yang benar tetapi belum mempunyai accessible name
  (tanpa teks, `aria-label`, atau `title`); dicatat sebagai defect aksesibilitas.
- Coverage automation bersifat read-only: Cek Disini, Hapus Notif, dan Tandai
  Dibaca tidak diklik agar notifikasi akun demo tidak berubah.
