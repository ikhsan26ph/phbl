# Laporan

## Laporan Daftar History Lelang

  - Data yang dicari di laporan daftar history lelang ini adalah 90 hari ke depan dari tanggal awal
  - Data history lelang yang ditampilkan ialah data-data lelang yang tanggal buatnya berdasarkan tanggal yang dicari
  - Untuk lelang yang dibatalkan tidak muncul pada pencarian ini
  - Jika rute multidrop maka ada label “Multidrop”
  - Daftar history lelang ini juga dapat diexport ke excel

## Laporan Logistik

  - Data yang dicari di laporan logistik ini adalah 31 hari ke depan dari tanggal awal permintaan muat yang diinputkan
  - Informasi total lelang di hasil pencarian laporan logistik menghitung dari data nomor lelang yg muncul , namun untuk nomor lelang sama hanya terhitung sebagai 1 nomor lelang saja
  - Informasi total order di hasil pencarian laporan logistik menghitung dari data nomor order yg muncul
  - Informasi total unit di hasil pencarian laporan logistik menghitung dari semua unit dari data order yang muncul
  - Data yang muncul di hasil pencarian laporan logistik adalah order yang telah divalidasi oleh admin
  - Jika tg permintaan muat order dalam jangkauan range pencarian namun ordernya belum divalidasi admin maka tidak muncul pada list laporan logistik
  - Tanggal order diambil dari waktu saat nomor order dicreate (saat masuk step input muatan)
  - Harga yang tampil adalah perhitungan dari harga satuan dikali jumlah unit.
  - Apabila harga yang dipilih pada order terkait dinego , maka harga nya tidak berubah (tetap mengambil harga yang dipilih)
  - Urutan data order di hasil pencarian laporan logistik adalah yang terbaru berada di atas
  - Tahapan tracking yang muncul pada detail laporan logistic ialah tracking ambil kontainer, stuffing, kapal berlayar, kapal sandar, rencana dooring, dooring, SJ diterima agen, dokumen dikirim
  - Apabila tracking belum dikerjakan / tidak dikerjakan maka ditampilkan tanda strip
  - Detail laporan logistik setelah input unit yang tampil ialah Nomor Kontainer, Nomor Seal
  - Untuk multidrop, maka dibagian tracking rencana dooring dan dooring akan muncul textlink “Multidrop” dan saat dibuka akan menampilkan data Alamat drop dan tanggal update tracking per Alamat
  - Data Alamat drop ini diambil dari penentuan muatan di Alamat tujuan saat input muatan
  - jika alamat multidrop diinputkan dobel saat input muatan maka terbaca 1 alamat saja
  - Jika order ada biaya tambahan maka pada detail laporan logistic muncul nominal biaya tambahan, jika tidak ada maka tidak muncul
  - Pencarian laporan logistic dapat di export ke excel
  - Pada file excel logistic tanggal export menampilkan waktu saat melakukan export ke excel
  - Pada file excel logistic tanggal export menampilkan:
    - Waktu saat melakukan export ke excel
    - Informasi total unit yang diambil dari total jumlah kontainer dipesan di bawah baris terakhir kolom “Jumlah”
    - Informasi Grand Total yang diambil dari jumlah Total Harga di laporan tersebut
  - Data yang ditampilkan sama seperti pada website
  - Pada rute multidrop tracking rencana dooring dan dooring tanggal tracking yang ditampilkan per unitnya

## Laporan Owner

- Data yang dicari di laporan owner ini adalah 31 hari ke depan dari tanggal awal
- Informasi total lelang di hasil pencarian laporan owner menghitung dari data nomor lelang yg muncul , namun untuk nomor lelang sama hanya terhitung sebagai 1 nomor lelang saja
- Informasi total order di hasil pencarian laporan owner menghitung dari data nomor order yg muncul
- Data yang muncul di hasil pencarian laporan owner adalah data nomor lelang yg telah dibuat , meskipun belum ada data penawaran nya.
  - tampilan nya akan muncul tanda strip seperti pada kolom harga dipilih , nomor order , nama bidder
  - untuk kolom Penawaran tampil 0 harga
- Jika bid owner melakukan pemesanan lebih dari satu dalam 1 nomor lelang , maka akan muncul data nya lebih dari 1 untuk 1 nomor lelang tersebut
- Lelang yang dibatalkan tidak ditampilkan di hasil pencarian laporan owner
- Tanggal lelang diambil dari tanggal bid owner submit data lelang yg diajukan
- Periode lelang diambil dari tanggal buka dan tanggal tutup dari nomor lelang terkait
- Data penawaran dari setiap nomor lelang diambil dari harga yg sudah ditambahkan untuk nomor lelang tersebut.
  - Jika harga dihapus , maka perhitungan Penawaran akan berkurang
  - Jika admin yang menambahkan harga untuk bidder tertentu , maka perhitungan Penawaran nya bertambah
- Harga dipilih menghitung harga satuan dari unit yg dipesan pada nomor order terkait
  - Jika belum ada harga dipilih , maka muncul tanda strip
  - Jika harga penawaran yang dipilih dinego , maka tampilan nya tidak berubah (tetap mengambil harga penawaran yg awal sebelum dinego)
- Nomor order diambil dari data pesanan yang telah divalidasi oleh admin.
  - Jika belum ada penawaran yg dipesan , maka muncul tanda strip
- Data order terbaru berada di posisi atas pada hasil pencarian
- Di halaman detail laporan owner , untuk data rute, jenis kendaraan, deskripsi barang, budget pengiriman, volume unit diambil dari data nomor lelang terkait
- Bidder diundang adalah total bidder yg diundang pada nomor lelang terkait
- Untuk rule bidder respon adalah jumlah bidder yang telah input harga sebagai berikut :
  - bidder yang sudah submit harga maka akan terhitung 1
  - dan jika admin bantu menambahkan harga untuk bidder terkait , maka masuk perhitungan bidder submit harga (apabila bidder nya belum pernah submit harga)
    - Jika sudah pernah submit harga & admin bantu tambahkan harga , maka tetap dibaca 1 bidder (bukan 2)
- Penawaran bidder diambil dari harga yang telah diinputkan oleh bidder yang diundang pada lelang terkait
  - Jika harga dihapus maka jumlah penawaran bidder akan berkurang juga
- Harga terendah dan harga tertinggi menghitung dari total penawaran yg ada pada nomor lelang terkait
  - Jika belum ada penawaran , maka muncul 0 rupiah
  - Jika harga penawaran baik itu yang terendah maupun tertinggi dinego , maka harga tersebut akan berubah
- Harga pemenang diambil dari harga satuan pada unit yg dipesan oleh bid owner terkait pada nomor order terkait
  - Jika belum ada harga pemenang , maka muncul 0 rupiah
  - Jika harga terpilih dinego , maka tampilan harga pemenang nya tetap mengambil harga penawaran sebelum dinego (yang di daftar order)
- Bidder diambil dari data bidder yang penawaran nya dipesan oleh bid owner terkait
  - Jika belum ada penawaran bidder yg dipesan , maka muncul tanda strip
- Catatan memilih diambil dari data alasan memesan rute pada nomor order / pesanan terkait
  - Jika tidak ada alasan memesan rute pada orderan terkait , maka muncul tanda strip
- Tombol Kembali bisa digunakan untuk menuju ke hasil pencarian laporan owner sebelumnya
- Pada laporan owner ini juga bisa diexport dalam bentuk excel
