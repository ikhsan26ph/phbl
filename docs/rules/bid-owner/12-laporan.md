# Laporan

## Laporan Daftar History Lelang

  - Data yang dicari di laporan daftar history lelang ini adalah 90 hari ke depan dari tanggal awal
  - Data history lelang yang ditampilkan ialah data-data lelang yang tanggal buatnya berdasarkan tanggal yang dicari
  - Untuk lelang yang dibatalkan tidak muncul pada pencarian ini
  - Jika rute multidrop maka ada label “Multidrop”
  - Daftar history lelang ini juga dapat diexport ke excel
  - Custom sub user bid owner IMP dan TCI tidak bisa akses fitur ini

## Laporan Logistik

  - Data yang dicari di laporan logistik ini adalah 31 hari ke depan dari tanggal awal permintaan muat yang diinputkan
  - Informasi total lelang di hasil pencarian laporan logistik menghitung dari data nomor lelang yg muncul , namun untuk nomor lelang sama hanya dihitung sebagai 1 nomor lelang saja
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
  - Pada file excel logistic tanggal export menampilkan:
    - Waktu saat melakukan export ke excel
    - Informasi total unit yang diambil dari total jumlah kontainer dipesan di bawah baris terakhir kolom “Jumlah”
    - Informasi Grand Total yang diambil dari jumlah Total Harga di laporan tersebut
  - Data yang ditampilkan sama seperti pada website
  - Pada rute multidrop tracking rencana dooring dan dooring tanggal tracking yang ditampilkan per unitnya
  - Custom sub user bid owner  TCI tidak bisa akses fitur ini
