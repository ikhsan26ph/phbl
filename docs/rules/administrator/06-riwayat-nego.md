# Riwayat Nego

- Proses nego yang dilakukan akan tercatat di halaman Riwayat Nego
- Riwayat Nego dapat dilihat oleh bid owner, admin, maupun bidder
- Halaman ini dapat diakses dari halaman Detail Nego, dengan klik textlink ‘Lihat Riwayat Nego’
- Pada halaman Riwayat Nego mencatat mulai dari Tanggal Nego diajukan, Nego Harga, Jumlah Nego, Tanggal Konfirmasi Bidder, Harga Baru, dan Status Nego
- Tanggal nego diajukan ditampilkan dalam format DD/MM/YYYY HH:MM. Tanggal nego diajukan menunjukkan informasi kapan nego tersebut diajukan oleh bid owner
- Nego Harga menampilkan informasi harga nego yang telah diajukan oleh bid owner
- Jumlah Nego, mencatat informasi berapa kali penawaran tersebut dilakukan proses nego
- Konfirmasi Bidder, mencatat informasi kapan bidder melakukan respon nego atas permintaan nego bid owner. Jika statusnya masih waiting, maka konfirmasi bidder akan tampil strip (-). Untuk konfirmasi bidder ditampilkan dalam format DD/MM/YYYY HH:MM
- Harga baru, menampilkan informasi harga baru yang tercreated dari proses nego tersebut. Untuk harga baru akan tampil jika statusnya Negosiasi dan Diterima. Untu status waiting dan nego ditolak, harga baru tampil strip (-).
- Untuk rule riwayat ini adalah, jika penawaran tersebut dilakukan ajuan nego kembali oleh bid owner, maka riwayat pada penawaran lama akan berhenti, dan pengajuan nego terbaru akan update riwayat pengajuan nego (lanjut nego berikutnya)
- Contoh, Jika penawaran pertama dilakukan nego dan berhenti pada nego ke 3. kemudian penawaran tersebut di nego kembali, maka pada detail history yang berikutnya akan menampilkan history nego mulai dari nego ke 1, 2, 3, 4, 5, dst. Data dari riwayat pertama juga akan ikut terbawa
- Untuk data lama, nego dibuatkan riwayatnya berdasarkan data yang telah tersedia
- Pada section informasi detail pengajuan nego, nilai PPN dan PPh juga ditampilkan. Untuk data yang belum memiliki nilai PPN dan PPh, sistem akan menampilkannya dengan tanda strip (-) sebagai penanda ketiadaan nilai PPN dan PPh
