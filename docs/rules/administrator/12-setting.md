# Setting

## General

- Versi web yang telah disetting akan tampil di tampilan web dan juga footer notif email
- Data Versi APK Tracking akan muncul pada splashscreen apk, profil apk, dan login apk
- Data Copyright APK Tracking akan muncul pada profil apk
- Whatsapp CS yang telah disetting akan tampil di tampilan sidebar, tombol Hubungi CS di halaman-halaman seperti maintenance, not found, dan semacamnya, profil APK dan juga notif email
- Telp CS yang telah disetting akan tampil di tampilan sidebar, dan footer
- Apabila sosial media tidak diisi saat setting general admin , maka tampilan icon sosial media seperti di sidebar , notif email , footer web dan lain-lain nya tidak bisa diklik / icon biasa
- Email admin utama hanya ditampilkan satu saja
- Jika ingin menambah email admin lainnya maka bisa ditambahkan pada sub user admin
- Pada field email admin terdapat textlink List Email, List Push Notif, dan Setting Preference.
- Klik pada List Email akan memunculkan pop-up berisi daftar notifikasi email yang diterima oleh Admin. Sedangkan List Push Notif akan menampilkan pop-up berisi daftar push notifikasi yang masuk ke Admin.
- Pengaturan notifikasi email dan push notifikasi untuk Admin akun utama dapat dilakukan melalui menu Setting Preference.
- Secara default, preferensi notifikasi sistem dan notifikasi email untuk Admin akun utama berada dalam kondisi aktif.
- Jika Admin akun utama mengaktifkan preferensi notifikasi (email atau push), maka Admin akan menerima notifikasi sesuai jenis yang dipilih.
- Jika Admin akun utama menonaktifkan preferensi notifikasi tertentu, maka Admin tidak akan menerima notifikasi tersebut.
- Apabila notifikasi email atau push dinonaktifkan, maka pada pop-up daftar notifikasi akan muncul label “Tidak Aktif” untuk menandai bahwa notifikasi tersebut tidak dikirim.
- Untuk notifikasi email ke Admin, Admin akan ditetapkan sebagai penerima utama.
- Untuk notifikasi email ke Bid Owner atau Bidder, alamat email mereka akan dimasukkan sebagai Bcc.
- Untuk push notifikasi yang ditujukan ke Admin dan Bid Owner, sistem akan mengirimkan ke keduanya secara bersamaan.
- Jika preferensi notifikasi untuk Bid Owner tidak aktif namun Admin aktif, maka hanya Admin yang menerima push notifikasi tersebut.
- Sebaliknya, jika Admin tidak aktif namun Bid Owner aktif, maka hanya Bid Owner yang akan menerima push notifikasi.

## S&K Booking

- S&K Booking yang sudah disetting akan tampil di halaman isi data pesanan
- Apabila S&K Booking belum pernah disetting , maka pada terakhir update tampilnya tanda strip
- Terakhir update diambil dari waktu admin mengubah data S&K Booking
- Di s&k booking juga bisa preview tampilan yang akan muncul di halaman isi data pesanan

## Reminder

  - Trigger Ambil Kontainer by tanggal permintaan muat jadi apabila sampai melewati tgl permintaan muat belum diupdate tracking ambil container maka akan terkirim notif reminder ke petugas untuk lakukan tracking ambil container
  - Trigger Stuffing by tanggal permintaan muat jadi apabila sampai melewati tgl permintaan muat belum diupdate tracking stuffing maka akan terkirim notif reminder ke petugas untuk lakukan tracking stuffing
  - Trigger Kapal Berlayar by ETD jadi apabila sampai melewati tgl ETD belum diupdate tracking kapal berlayar maka akan terkirim notif reminder ke petugas untuk lakukan tracking kapal berlayar
  - Trigger Kapal Sandar by ETA jadi apabila sampai melewati tgl ETA belum diupdate tracking kapal sandar maka akan terkirim notif reminder ke petugas untuk lakukan tracking kapal sandar
  - Trigger Rencana Dooring by ETA jadi apabila sampai melewati tgl ETA belum diupdate tracking rencana dooring maka akan terkirim notif reminder ke petugas untuk lakukan tracking rencana dooring
  - Trigger Dooring by ETA jadi apabila sampai melewati tgl ETA belum diupdate tracking dooring maka akan terkirim notif reminder ke petugas untuk lakukan tracking dooring
  - Trigger SJ DIterima Agen by ETA jadi apabila sampai melewati tgl ETA belum diupdate tracking SJ Diterima Agen maka akan terkirim notif reminder ke petugas untuk lakukan tracking SJ Diterima Agen
  - Trigger Dokumen Dikirim by ETA jadi apabila sampai melewati tgl ETA belum diupdate tracking dokumen dikirim maka akan terkirim notif reminder ke petugas untuk lakukan tracking dokumen dikirim
  - Notif reminder terkirim setiap jam 5 pagi (cron)
  - Jika missal ambil container rule trigger 0 hari maka ketika sudah melewati tgl permintaan muat maka esoknya jam 5 pagi akan terkirim notif reminder. Jika rule trigger 1 hari maka akan terkirim lusa jam 5 pagi
  - Admin dapat setting reminder hanya bagian rule trigger dan status reminder

## Setting Notifikasi

  - Admin memiliki kewenangan untuk mengatur status notifikasi (ON/OFF) guna menghemat penggunaan kuota notifikasi, terutama saat proses simulasi sistem.
  - Jenis notifikasi yang dapat diatur oleh Admin meliputi: Push Notifikasi, Notifikasi Email, dan Notifikasi WhatsApp.
  - Secara default, seluruh pengaturan notifikasi berada dalam kondisi ON.
  - Jika Notifikasi Email disetel ke OFF, maka seluruh email notifikasi dari sistem tidak akan dikirim. Sebaliknya, jika disetel ON, email notifikasi akan dikirim sesuai pengaturan.
  - Jika Push Notifikasi disetel ke OFF, maka seluruh push notifikasi dari sistem tidak akan dikirim. Jika disetel ON, push notifikasi akan dikirim sesuai pengaturan.
  - Jika Notifikasi WhatsApp disetel ke OFF, maka seluruh notifikasi WhatsApp dari sistem tidak akan dikirim. Jika disetel ON, maka notifikasi WhatsApp akan dikirim sesuai pengaturan.

## Setting Pajak

      - Admin dapat melakukan setting pajak untuk nilai PPn dan PPh
      - Untuk default nilai setting pajak PPn yang tampil adalah 1,1 % atau 11%
      - Sedangkan untuk default nilai setting pajak PPh yang tampil adalah 2%
      - Nilai setting pajak PPn dan PPh akan selalu terbawa pada harga. Efek adanya nilai PPn dan PPh akan tampil pada halaman berikut :
        - Lihat harga penawaran
        - Tambah harga penawaran
        - Edit harga penawaran
        - Update harga penawaran
        - Proses Nego
        - Card harga pada halaman detail order
        - Proses invoice
      - Data nilai PPn dan PPh pada setting pajak akan tampil sebagai rekomendasi pengisian nilai pajak pada kolom PPn dan PPh
      - Pada data order lama yang belum ditambahkan nilai PPn dan PPh maka akan menampilkan strip (-)
