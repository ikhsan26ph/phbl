# Pengajuan Lelang

  - Pada daftar pengajuan lelang terdapat penambahan fitur Tab-Tab untuk mengelompokkan data lelang sesuai kondisi masing-masing
  - Tab-tab lelang tersebut ialah :
    - Lelang Tersedia : Lelang yang melewati tgl tutup lelang
    - Lelang Diproses : Lelang belum melewati tgl tutup lelang / lelang yang masih proses update harga
    - Telah Akhir Kirim : Lelang yang melewati tgl rencana akhir kirim
    - Lelang Batal : Lelang yang telah dibatalkan
    - Semua Lelang : Semua data lelang tampil
  - Pada tab Lelang Tersedia, pilihan action menunya ialah :
    - Detail Pengajuan Lelang
    - Lihat Harga Penawaran
    - Batalkan Lelang
    - Minta Update Harga
    - History Update Harga (jika lelangnya pernah diajukan request)
  - Pada tab Lelang Diproses, pilihan action menunya ialah :
    - Detail Pengajuan Lelang
    - Lihat Harga Penawaran
    - Batalkan Lelang
    - History Update Harga (jika lelangnya pernah diajukan request)
  - Pada tab Telah Akhir Kirim, pilihan action menunya ialah :
    - Detail Pengajuan Lelang
    - Lihat Harga Penawaran
    - Batalkan Lelang
    - Minta Update Harga
    - History Update Harga (jika lelangnya pernah diajukan request)
  - Pada tab Lelang Batal, pilihan action menunya ialah :
    - Detail Pengajuan Lelang
    - Lihat Harga Penawaran
    - Batalkan Lelang
  - Jika lelang diajukan request update harga maka akan muncul di Tab Lelang Diproses, jika sudah lewat tgl tutup update harga akan Kembali ke Tab Lelang Tutup
  - Lelang yang telah dibuat oleh bid owner akan muncul di halaman ini
  - Data pada kolom Bidder diambil dari bidder yang sudah membuat harga pada nomor lelang terkait dari total bidder yang diundang.
  - Data lelang yang telah dibatalkan masih muncul pada list pengajuan lelang.
  - Bid owner juga bisa mendownload kembali dokumen lelang di halaman detail pengajuan lelang
  - Tanggal terkirim yang tampil diambil dari waktu saat bid owner submit lelang.
  - Status harga adalah informasi dari bidder yang telah diundang apakah sudah input harga atau belum. Ada 3 status yaitu Belum Input Penawaran, Telah Input Harga dan Telah Input Penawaran, Berikut penjelasannya :
    - Belum Input Penawaran => bidder belum input harga dan jadwal
    - Telah Input Harga => bidder sudah input harga namun belum input jadwal
    - Telah Input Penawaran => bidder sudah input harga dan jadwal
  - Pada daftar pengajuan lelang bid owner terdapat perubahan, Dimana tombol aksi jika diklik akan menampilkan pilihan :
- Detail Pengajuan Lelang => diarahkan ke halaman detail pengajuan lelang
- Lihat Harga Penawaran => diarahkan ke halaman cari penawaran dan ditampilkan harga penawarannya
- Batalkan Lelang => diarahkan ke halaman batalkan lelang
- Minta Update Harga => diarahkan ke halaman request update harga
- History Update Harga => diarahkan ke halaman Riwayat update harga
  - Pada detail pengajuan lelang, akan ditampilkan status lelang, macam-macam status lelang :
- BELUM BUKA : lelang belum memasuki waktu buka lelang
- LELANG DIBUKA : lelang belum melewati tgl tutup lelang
- LELANG DITUTUP : lelang sudah melewati tgl tutup lelang
- LELANG BATAL : lelang sudah dibatalkan
  - Pada detail pengajuan lelang dibagian Bidder Penerima Lelang, terdapat jumlah penawaran, jumlah penawaran menampilkan total bidder yang sudah input harga dari total bidder yang diundang
  - Pada daftar pengajaun lelang, jika lelang pernah diajukan request update harga maka aka nada tanda “#” nya. Contoh jika #1 berarti lelang tersebut pernah diajukan request update harga 1 kali. Jika #2 berarti lelang tersebut pernah diajukan request update harga 2 kali dan seterusnya
  - Nomor lelang akan berwarna hijau apabila lelang tersebut sudah lewat tgl rencana akhir kirim, sudah ada harganya namun belum ada order
  - halaman detail lelanTerdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
  - Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.

## Buat Lelang Pengiriman

- Untuk nomor lelang tidak bisa sama dengan data lelang lainnya
- Dibawah field Nomor Lelang terdapat text panduan penulisan nomor lelang, dengan Format Penulisan Nomor Lelang : [Inisial nama PT]/[Bulan]/[Tahun]/[Inisial kota tujuan]
- Format ini hanya bersifat sebagai panduan dalam penulisan nomor lelang, jadi jika bid owner menginputkan nomor lelang dengan format lain, tidak masalah
- Tanggal dan jam pada waktu buka lelang hingga tgl rencana akhir kirim defaultnya tanggal hari ini, aturannya seperti berikut :
  - Tanggal Buka Lelang : tanggal dan waktunya tidak bisa kurang dari tanggal dan waktu saat ini
  - Tanggal Tutup Lelang : tanggal dan waktunya tidak bisa kurang dari tanggal buka lelang
  - Tgl Rencana Mulai Kirim : tanggal dan waktunya tidak bisa kurang dari tanggal tutup lelang
  - Tgl Rencana Akhir Kirim : tanggal dan waktunya tidak bisa kurang dari tanggal rencana mulai kirim
- History data lelang yang dipilih akan mengisi semua data lelang mulai dari biaya termasuk, syarat ketentuan, dokumen penagihan, budget pengiriman, jenis lelang beserta data alamat nya (apabila ada), data sales dan informasi kontainer
- Jika admin buat lelang dengan data history, maka admin dapat memilih history data lelang by range tanggal
- Maksimal range tanggal yang aktif adalah 90 hari dihitung dari tanggal yang diinputkan di ‘Dari Tanggal’
- Data pada dropdown pilih data lelang akan tampil sesuai dengan range tanggal yang diinputkan, tanpa perlu mereload halaman terlebih dahulu. Maksimal data lelang yangisitampil adalah 200 data. Jika data yang ditampilkan lebih dari 200, maka akan tampil alert ‘Ada (n) data lelang tidak tampil karena melebihi limit lelang tersedia pada dropdown’. Nilai (n) menunjukkan jumlah data yang tidak ditampilkan
- Format data history lelang yang ditampilkan terdiri dari Nomor Lelang | Rute | PIC Tujuan
- Data biaya termasuk pilihannya diambil dari master include admin
- Data dokumen penagihan pilihan datanya diambil dari master dokumen penagihan admin
- Pelabuhan asal dan pelabuhan tujuan diambil dari master pelabuhan admin yang statusnya aktif
- Untuk lelang normal, yang required hanya pelabuhan asal & pelabuhan tujuan, informasi alamat lengkap asal&tujuan, dan Kota Asal&tujuan
- Pada saat input tanggal permintaan muat PHBL harus mengisi jam
- Untuk lelang multidrop, yang required adalah pelabuhan asal, pelabuhan tujuan, informasi alamat lengkap asal, kota asal, informasi alamat lengkap tujuan, kota tujaun dan defaultnya ada 2 alamat dan kota tujuan yang harus diisi
- Pada saat input tanggal permintaan muat PHBL harus mengisi jam
- Telp pic tujuan hanya dapat diinputkan angka, maksimal ada 1 nomor
- Jenis kontainer yang ada di halaman buat lelang diambil dari master jenis kontainer yang aktif
  - Apabila belum pilih kemudian klik Simpan, muncul alert “Pilih Jenis Kontainer”
- Untuk data lama (PHBL 1.2) maka ketika gunakan history lelang data yang tidak ada sebelumnya maka ditampilkan kosongan
- Pada form buat lelang untuk biaya laut ini dijadikan auto terceklist dan tidak bisa diunceklist, sehingga setiap lelang laut pasti ada freight kapal
- Untuk nomor lelang hanya bisa diinputkan huruf dan karakter / - # ( ) +. Selain itu tidak bisa dan akan muncul alert “Tidak Bisa Input Simbol”
- Nantinya data-data lelang bid owner yang telah dibuat akan masuk kedalam penarikan data spreadsheet data lelang. Pada spreadsheet ini ditampilkan data lelang yang telah dibuat oleh bid owner per jenis kontainernya. :
  - Untuk data lelang yang dibatalkan tidak masuk kedalam spreadsheet penarikan data lelang
  - Jika datanya multidrop maka pada kolom Alamat_Tujuan antar Alamat dipisahkan dengan beda baris dan tanda ;
  - Jenis kontainer yang ditampilkan ialah jenis kontainer yang dipilih dari lelang tersebut, jika jenis kontainer yg dipilih pada lelang ada 3 maka akan muncul 3 baris pada spreadsheet
  - Data Bidder_Respon, Jumlah_Penawaran, Bidder , Harga_Terendah, Harga_Tertinggi  diambil dari lelang khusus jenis kontainer tersebut
  - Status_Lelang jika lelang belum masuk waktu buka lelang ditampilkan “Belum Buka”, jika lelang sudah masuk buka lelang namun belum melewati tgl tutup lelang maka statusnya “On Going”. Jika lelang sudah melewati tutup lelang maka ditampilkan “Closed

## Pilih Peserta Lelang

- Jika sudah isi data lelang halaman selanjutnya diarahkan ke halaman pilih peserta lelang
- Pada halaman pilih peserta lelang ditampilkan semua data-data lelang yang telah diisi sebelumnya
- Jika klik Kembali mengarah ke halaman buat lelang pengiriman dan data-data yg diinputkan sebelumnya masih tetap ada
- Urutan bidder di halaman pilih peserta lelang adalah default rating tertinggi dan jumlah menang lelang berada di atas
- Checkbox “Pilih Semua” akan mencentang semua bidder yang ada di list peserta lelang
  - Apabila checkbox pada salah satu bidder dihapus, maka checkbox di Pilih Semua akan hilang
- Cari Penawaran Lelang pada breadcrumb dan tombol Kembali mengarah ke halaman buat lelang pengiriman
- Rekomendasi bidder pengiriman yang tampil diambil dari master iklan berbayar yang masih dalam range waktu aktif
  - Apabila tidak ada bidder yang aktif di master iklan, rekomendasi bidder pengiriman hilang
  - Jika klik bidder pada rekomendasi bidder maka bidder akan terceklist di list pilih bidder
- Pada halaman pilih peserta lelang, apabila terdapat bidder yang dikunci untuk bid owner tertentu maka bidder tersebut tidak tampil pada bid owner lainnya
- Pada halaman pilih peserta lelang, apabila terdapat beberapa bidder yang di hidden pada bid owner tertentu, maka pada bid owner tersebut tidak muncul bidder yang di hidden tadi
- Pada pilih peserta lelang bid owner data yang ditampilkan ialah bidder-bidder yang aktif dan pada card peserta lelang ini ditampilkan nama alias bidder, lokasi bidder serta rating dan jumlah menang lelangnya
- Jika bid owner sudah pilih lelang dan submit maka mengirim notifikasi email dan wa  ke bidder-bidder yang diundang
- Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
- Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”
- Dokumen aanwijzing ditampilkan berupa popup

## Batalkan Lelang

      - Bid owner dapat batalkan lelang sampai kapanpun asalkan lelang tersebut belum ada order
      - Jika lelang sudah dibatalkan maka ketika klik Batalkan Lelang tidak bisa dan muncul alert “Tidak bisa batal! Lelang sudah dibatalkan”
      - Jika lelang proses update harga maka tidak bisa dibatalkan dan muncul alert “Tidak bisa batal! Lelang masih proses update harga”
      - Ketika batal lelang wajib pilih alasan lelang dibatalkan, jika tidak ada bisa pilih lainnya dan input Catatan Lelang Dibatalkan
      - Jika lelang dibatalkan sebelum tutup lelang maka akan kirim notifikasi wa lelang dibatalkan ke semua bidder yang diundang
      - Jika lelang dibatalkan setelah tutup lelang maka akan kirim notifikasi email lelang dibatalkan ke bidder yang sudah input harga
      - Ketika lelang berhasil dibatalkan maka lelang masih dapat digunakan pada history data lelang saat buat lelang Kembali
      - Ketika lelang berhasil dibatalkan maka di detail pengajuan lelang akan muncul card Lelang Batal
      - Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
      - Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”
      - Dokumen aanwijzing ditampilkan berupa popup.

## Request Harga

      - Bid owner dapat mengajukan request harga hanya pada lelang yang sudah melewati tanggal tutup lelang (status : Lelang Ditutup)
      - Bid owner dapat mengajukan request harga di semua lelang, baik yang telah memiliki harga penawaran maupun yang belum memiliki harga penawaran
      - Jika bid owner mengajukan request harga pada lelang yang sudah memiliki harga, maka pada sisi bidder, request harga tersebut akan dikategorikan pada Request Update Harga
      - Namun jika bid owner mengajukan request harga pada lelang yang belum memiliki harga, maka pada sisi bidder, request harga tersebut akan dikategorikan menjadi Request Input Harga
      - Bid owner tidak dapat mengajukan request harga apabila lelangnya sudah dibatalkan
      - Bid owner tidak dapat mengajukan request harga apabila lelang sudah melewati tanggal rencana akhir kirim. Ketika di klik Request harga, maka akan muncul alert “Tidak bisa request harga! Lelang sudah melewati tgl. rencana akhir kirim”
      - Jika sebelumnya bid owner telah mengajukan request harga maka bid owner dapat mengajukan request kembali apabila request harga telah melewati tanggal tutup request harga yang ditambahkan.
      - Batas maksimal bid owner setting Tanggal Tutup Request Harga adalah tanggal rencana akhir kirim namun tidak dapat melewati / melebihi tanggal rencana akhir kirim
      - Data peserta lelang yang tampil pada halaman request harga dan dapat diundang oleh bid owner mencakup semua bidder yang terdaftar sebagai peserta lelang bid owner, baik yang telah menginputkan harga maupun yang belum menginputkan harga. Jadi pada request harga ini bid owner dapat mengundang seluruh bidder tanpa melihat status harganya.
      - Peserta lelang yang tampil pada halaman request harga akan ditampilkan informasi status harganya. Untuk status harga terdiri dari ‘Belum Input Penawaran’, ‘Telah Input Penawaran’, dan ‘Telah Input Harga’. Bid owner dapat mengundang semua bidder di ketiga status harga tersebut
      - Bidder dengan status harga ‘Telah Input Penawaran’ adalah bidder yang telah merespons pengajuan lelang dari Bid Owner dengan menginputkan harga dan jadwal yang tersedia.
      - Bidder dengan status harga ‘Telah Input Harga’ adalah bidder yang telah merespons pengajuan lelang dari Bid Owner dengan hanya menginputkan harga, tanpa menginputkan jadwal yang tersedia.
      - Sedangkan untuk Bidder dengan status harga ‘Belum Input Penawaran’ adalah bidder yang tidak merespons pengajuan lelang dari Bid Owner (tidak menginputkan harga maupun jadwal).
      - Secara default, checkbox akan terpilih pada bidder dengan status harga ‘Telah Input Penawaran’ dan ‘Telah Input Harga’. Namun bid owner masih dapat melakukan setting peserta lelang yang akan diundang untuk request harga
      - Jika bid owner sebelumnya mengajukan request harga dan terdapat bidder yang tidak merespons, maka saat Bid Owner mengajukan permintaan ulang, di bagian peserta lelang akan muncul tulisan “(No Respon)” di samping nama bidder tersebut.
      - Jika pada request sebelumnya tidak ada bidder yang merespon (peserta lelang No respon semua) maka ketika bid owner mengajukan request harga kembali masih dapat dilakukan.
      - Ketika bid owner berhasil melakukan request harga maka sistem akan otomatis mengirim notifikasi email dan wa request update/input harga kepada bidder yang diundang request saja. Lelang yang diajukan request harga akan tampil pada tab Lelang Diproses
      - Ketika proses request harga sedang berlangsung, harga tidak akan langsung expired sehingga kondisi harga/penawaran tidak berubah
      - Ketika penawaran masih dalam kondisi aktif (belum expired) dengan button pesan aktif, maka ketika bid owner klik tombol Pesan tersebut, nantinya sistem akan menampilkan alert pengecekan tidak bisa lanjut order karena request harga masih berjalan
      - Harga/penawaran aktif adalah harga/penawaran yang belum expired.
      - Telah lama expired: Bidder peserta lelang telah input harga/telah input penawaran, tapi sudah tidak memiliki harga/penawaran aktif (sudah expired semua)
      - Ketika harga sudah expired (Telah Lama Expired), maka update harga dilakukan melalui input karena dianggap tidak ada harga yang bisa diupdate (seperti input harga baru)
      - Harga tidak langsung expired. Harga akan expired ketika tanggal tutup request harga berakhir
      - Pada request harga yang sedang berlangsung, dapat dilakukan close request harga. Ini akan menghentikan proses request harga yang sedang dilakukan. Data tanggal request dan tutup request diambil dari tanggal mengajukan request dan field tanggal penutupan request harga Ketika close request harga.
      - Pada halaman Lihat Harga Penawaran akan tampil harga-harga request yang sudah di inputkan sebelum dilakukan close request. Jika proses request harga di-close maka harga bidder yang lama akan tetap menjadi expired.
      - Terdapat field tanggal penutupan request harga setelah klik Close Request Harga.
      - Pada card daftar riwayat terdapat tambahan informasi data yang meliputi:
        - Close Request
        - Tanggal Close Request
      - Setelah lelang telah diajukan request harga, maka pada halaman pengajuan lelang akan tampil tambahan label (#1) yang letaknya di sebelah nomor lelang. Angka 1 akan terus bertambah sesuai dengan berapa kali lelang tersebut diajukan request harga
      - Terdapat data baru yakni dokumen aanwijzing, tampil sesuai dengan nanam dokumen.
      - Jika status dokumen aanwijzing tidak aktif maka menampilkan tanda strip “-”.

## History Request Harga

  - Ketika lelang pernah dilakukan request harga maka pada lelang akan tampil pilihan action menu “History Request Harga”
  - Pada halaman ini akan ditampilkan data Tanggal Request, Tanggal Tutup Request Harga, dan Peserta Yang Diundang
  - Request harga terbaru akan ditampilkan paling atas, dan request harga yang paling lama akan ditampilkan dibawah
  - Pada halaman riwayat request harga yang dilakukan admin, terecord data bahwa telah melakukan close request harga.
