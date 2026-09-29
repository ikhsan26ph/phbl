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

## Hasil uji trigger Pengajuan Lelang 2026-09-29

- Trigger nyata `AUTOTEST/1790650401972` menghasilkan salinan record baru pada
  inbox Admin `prahu.bid20@gmail.com` dengan kategori `Lelang`, judul
  `Pengajuan Lelang`, label penerima `to Transporter`, dan status `belum`.
- Isi salinan Admin identik dengan isi notifikasi Transporter dan memuat nomor
  lelang unik. Redirect tetap berada pada origin PHBID dan menuju tab
  `perlu-input-harga`; metadata expiry sekitar tiga bulan.
- Pembuktian memakai ID baseline sebelum submit dan polling ID baru setelah
  endpoint `/lelang/do_buat_lelang` sukses, bukan hanya memeriksa data lama di
  halaman Push Notif.

## Hasil uji trigger end-to-end 2026-09-29

- Admin menerima salinan identik untuk trigger Lelang, Order, dan Tracking yang
  berhasil. Label penerima cocok dengan target Shipper/Bid Owner atau
  Transporter/Bidder.
- Trigger yang terbukti mencakup buat/batal lelang, request harga/jadwal,
  respons jadwal, kelengkapan unit, serta enam tahap tracking sampai SJ
  Diterima Agen.
- Dua alur Admin masih terblokir defect submit: Pengajuan Nego dan Konfirmasi
  Perubahan Data. Rincian ada di
  `docs/PUSH-NOTIF-TRIGGER-REPORT-2026-09-29.md`.

## Hasil uji trigger Validasi Order dan Ganti Jadwal 2026-09-29

- Terima Perjanjian Pengiriman order fixture `20260929-06501` menghasilkan
  notifikasi baru ke Shipper dan Transporter serta dua salinan Admin dengan
  label `to Shipper` dan `to Transporter`; status order menjadi
  `KONFIRMASI UNIT`.
- Tolak Perjanjian Pengiriman order fixture `20260826-06506` menghasilkan
  notifikasi baru ke Shipper dan salinan Admin; status menjadi `ORDER DITOLAK`.
- Ganti Jadwal order fixture `20260829-06504` menghasilkan notifikasi baru ke
  Shipper dan salinan Admin. Nilai Open Stack dikembalikan ke nilai awal;
  submit perubahan dan revert masing-masing menghasilkan satu notifikasi.
- Semua record berkategori `Order`, berstatus belum dibaca, memiliki redirect
  detail order pada origin yang sama, dan expiry sekitar tiga bulan.
