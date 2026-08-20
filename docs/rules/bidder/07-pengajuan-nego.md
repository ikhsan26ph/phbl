# Pengajuan Nego

- Jika penawaran yang diajukan nego bid owner belum dikonfirmasi maka statusnya akan tampil ‘Waiting’
- Pada nego dengan status waiting, nantinya pada kolom aksi akan tampil 2 tombol, yaitu tombol Detail dan Aksi Nego
- Ketika dipilih tombol Aksi Nego, maka akan menampilkan 3 pilihan aksi respon nego yang terdiri dari Terima Nego, Tolak Nego, dan Negosiasi.
- Jika bidder memilih aksi respon nego ‘Terima Nego’, maka ketika diklik akan menampilkan halaman Terima Nego. Pada halaman ini, untuk Harga Penawarannya akan menampilkan nominal nego yang diajukan oleh bid owner dan field dalam kondisi disabled. Bidder tidak dapat mengedit harga penawaran di halaman ini.
- Jadi jika bidder memilih aksi respon nego ‘Terima Nego’, maka secara tidak langsung bidder menerima / menyetujui harga penawaran nego yang telah diajukan oleh bid owner
- Jika telah memilih ‘Terima Nego’ maka harga baru akan ter-created, sesuai dengan nominal nego yang diajukan oleh bid owner
- Jika bidder memilih aksi respon nego ‘Tolak Nego’,  maka ketika diklik akan menampilkan halaman Tolak Nego. Pada halaman ini bidder diminta untuk mengisikan Alasan Menolak Nego.
- Jadi jika bidder memilih aksi nego ‘Tolak Nego’, maka secara tidak langsung bidder menolak harga penawaran nego yang diajukan bid owner. Untuk harga penawaran tidak berubah, sesuai dengan harga penawaran awal dan tidak ter-created harga baru. Pada list pengajuan nego, harga baru ditampilkan strip (-)
- Jika bidder memilih aksi nego ‘Negosiasi’, maka ketika di klik akan menampilkan halaman Negosiasi Harga. Pada halaman ini bidder dapat melakukan edit harga penawaran karena field harga penawaran tampil aktif.
- Jadi jika bidder memilih aksi respon nego ‘Negosiasi’ maka secara tidak langsung bidder menerima pengajuan nego dengan melakukan proses negosiasi ulang kepada bid owner. Harga baru akan ter-created, sesuai dengan harga penawaran baru yang diajukan oleh bidder
- Harga penawaran yang bisa diinputkan tidak bisa lebih kecil dari harga nego
- Harga penawaran yang bisa diinputkan tidak bisa lebih besar dari harga awal
- Jika bidder terima nego maka akan mengirimkan notifikasi wa ke bid owner bahwa nego diterima dan harganya tetap.
- Jika bidder tolak nego maka akan mengirimkan notifikasi wa ke bid owner bahwa nego ditolak dan harganya tidak akan berubah
- Jika bidder negosiasi nego maka akan mengirimkan notifikasi wa ke bid owner bahwa nego di counter dan tersedia harga baru
- Pada halaman Bidder Respon Nego, terdapat field PPN dan PPh pada aksi Diterima dan Negosiasi. Nilai PPN dan PPh yang ditampilkan merupakan nilai yang mengikuti harga penawaran yang dinego. Field ini ditampilkan dalam kondisi non-editable (disabled), sehingga tidak dapat diubah oleh Bidder saat memberikan respon atas negosiasi.
- Pada section informasi detail pengajuan nego, nilai PPN dan PPh juga ditampilkan. Untuk data yang belum memiliki nilai PPN dan PPh, sistem akan menampilkannya dengan tanda strip (-) sebagai penanda ketiadaan nilai PPN dan PPh.
- Pada field Respon Nego untuk PPN dan PPh, data lama akan ditampilkan sebagai field kosong dengan placeholder nilai 0 dan dalam kondisi disabled. Meskipun demikian, aksi Respon Nego tetap dapat dilakukan.
