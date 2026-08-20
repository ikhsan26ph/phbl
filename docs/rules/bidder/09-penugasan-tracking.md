# Penugasan Tracking

  - Bidder bisa download APK tracking terbaru dengan klik “Download APK Tracking”.
  - Order yang belum ditugaskan sama sekali maka statusnya “PROSES PENUGASAN” dan terdapat tombol Tracking. Jika klik tombol Tracking maka diarahkan ke halaman tracking pengiriman
  - Yang tampil di list penugasan tracking adalah data per order
  - Jika order sudah mulai ditugaskan namun belum dikerjakan trackingnya maka status order di list penugasan tracking ialah “MENUNGGU PROSES” dan pada action menu muncul pilihan : Edit Penugasan & Lihat Data Tracking :
    - Jika klik Edit Penugasan diarahkan ke halaman tracking pengiriman
    - Jika klik Lihat Data Tracking maka diarahkan ke halaman Lihat Data Tracking
  - Jika order sudah mulai dilakukan tracking maka status order di list penugasan akan berubah menjadi status tracking AMBIL KONTAINER s.d DOKUMEN DIKIRIM
- Ketika order sudah update tracking ambil kontainer maka status order menjadi “AMBIL KONTAINER”
- Ketika order sudah update tracking stuffing (semua unit) maka status order menjadi “STUFFING”
- Ketika order sudah update tracking kapal berlayar maka status order menjadi “KAPAL BERLAYAR”
- Ketika order sudah update tracking kapal sandar maka status order menjadi “KAPAL SANDAR”
- Ketika order sudah update tracking rencana dooring maka status order menjadi “RENCANA DOORING”
- Ketika order sudah update tracking dooring (semua unit) maka status order menjadi “DOORING”
- Terdapat penambahan update status tracking terbaru yaitu SJ Diterima Agen. Ketika order sudah dilakukan update tracking surat jalan, maka status order akan berubah menjadi “SJ DITERIMA AGEN”
- Ketika order sudah update tracking dokumen dikirim maka status order menjadi “DOKUMEN DIKIRIM”
- Terdapat penyesuaian pada kondisi satu order dengan lebih dari 1 container. Jika status order adalah Rencana Dooring atau Dooring namun ada kontainer lain yang status ordernya Kapal Sandar, maka status order secara globalnya untuk suatu ID order adalah Kapal Sandar.
- Jika order sudah selesai dikerjakan tracking semuanya maka dibagian action menu nya muncul pilihan data : Penugasan Selesai & Lihat Data Tracking :
    - Jika klik Penugasan Selesai diarahkan ke halaman tracking pengiriman
    - Jika klik Lihat Data Tracking maka diarahkan ke halaman Lihat Data Tracking
- Jika order sudah dikunci penugasan dan sudah dikerjakan semua trackingnya maka status order di list penugasan tracking tetap menampilkan status tracking terakhirnya.
- Urutan data penugasan tracking adalah yang baru saja ditugaskan berada diatas
- Untuk sub user custom akses Daftar Pesanan maka mendapatkan akses halaman ini
- Terdapat penambahan label "Kapal Connecting" pada ID Order yang terdapat jadwal kapal connectingnya. Ketika di tap akan tampil pop up detail kapal connecting, sama seperti yang ada di halaman order.
- Pada tabel Daftar Penugasan Tracking, jika data kapal connecting dalam 1 order tersebut terdapat lebih dari satu, maka akan menampilkan data nama kapal dan voyage kapal connecting terakhir.

## Tracking Pengiriman

- Bidder dapat menugaskan tracking ke petugas
- Data petugas diambil dari master petugas apk milik bidder itu sendiri
- Bidder dapat edit petugas apabila tracking yang telah ditugaskan sebelumnya belum dikerjakan, jika tracking sudah dikerjakan (parsial maupun tidak) oleh petugas sebelumnya maka bidder tidak bisa edit petugas (pilihan edit petugas di action menu akan hilang)
- Pada action menu tracking pengiriman bidder, terdapat action baru yakni “Isi Data Tracking”
- Bidder dapat melakukan isi data tracking : Ambil Kontainer, Stuffing, Kapal Berlayar, Kapal Sandar, Rencana Dooring, Dooring, SJ Diterima Agen & Dokumen Dikirim.
- Bidder dapat isi data tracking melalui web, dimana ada beberapa aturan :
- Apabila bidder menugaskan tracking ambil kontainer & stuffing maka ketika bidder coba isi tracking stuffing terlebih dahulu maka tidak bisa dan muncul alert “Harap Selesaikan Tracking Sebelumnya”.
- Jadi tracking dikerjakan sesuai urutan, tidak bisa langsung loncat ke tracking berikutnya.
- Ketika tracking ambil kontainer & stuffing ditugaskan kemudian unit 1 sudah ambil kontainer maka unit 1 dapat langsung dikerjakan stuffing.
- Ketika tracking rencana dooring & dooring ditugaskan kemudian unit 1 sudah rencana dooring maka unit 1 dapat langsung dikerjakan dooring.
- Jika data unit sudah dilakukan isi data tracking maka admin dapat edit data tracking unit 1 tersebut.
- Pada field input nomor kontainer pada tahap Ambil Kontainer dan Stuffing, terdapat pembatasan input, yaitu hanya dapat memasukkan huruf dan angka dengan panjang maksimum 11 karakter. Input tidak diperbolehkan mengandung spasi atau karakter khusus. Berlaku juga pada halaman Edit Data Tracking.
- Field input no. telp sopir wajib diisi. Karakter yang dapat dimasukkan adalah angka dan simbol "-" (tanda strip)
- Jika akan melakukan update tracking SJ Diterima Agen, tahapan tracking sebelumnya harus diisi lengkap.
- Ketika input nomor kontainer pada penugasan Ambil Kontainer dan Stuffing semua huruf auto kapital
- Bidder dapat edit data tracking yang telah diisi sebelumnya, termasuk bisa upload foto
- Tidak ada Batasan waktu bidder untuk edit data tracking, walau order telah selesai masih bisa edit data tracking
- Tracking kapal berlayar & sandar tidak bisa dilewati dan wajib dikerjakan. Untuk tracking lain seperti ambil kontainer, stuffing, rencana dooring, dooring, SJ Diterima Agen, dokumen dikirim dapat dilewati
- Ketika bidder tugaskan tracking ke petugas maka akan mengirim notif wa ke petugas bahwa telah menerima penugasan tracking
- Jika petugas baru ditugaskan pertama kali akan mendapat notif wa penugasan pertama kali dan ada link download apk dan kode verifikasi untuk masuk ke akun
- Field input nomor kontainer pada tahap ambil kontainer dan stuffing, memiliki pembatasan karakter, yaitu hanya dapat menerima huruf dan angka dengan panjang maksimum 11 karakter. Input tidak boleh mengandung spasi atau karakter khusus. Berlaku juga untuk edit kontainer

## Lihat Data Tracking

- Pilihan Lihat Data Tracking muncul pada action menu list penugasan tracking ketika order sudah mulai ditugaskan, jika order belum ditugaskan sama sekali maka pilihan Lihat Data Tracking tidak muncul
- Ketika order sudah mulai penugasan namun belum dikerjakan tracking maka di halaman Lihat Data Tracking ini muncul keterangan “Tidak ada data tersedia” di bagian card status pengiriman
- Ketika order sudah ditugaskan dan sudah mulai dikerjakan tracking maka di halaman Lihat Data Tracking muncul tahapan trackingnya dan Lihat Detail
- Jika klik textlink Data Detail maka bidder dapat download foto yang diupload saat proses tracking
