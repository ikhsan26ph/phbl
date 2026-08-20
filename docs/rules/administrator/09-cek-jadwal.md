# Cek Jadwal

  - Pada menu ini admin juga dapat cek jadwal pelayaran Meratus
  - Pada menu ini terdapat integrasi API antara PH Bid Laut dengan Pelayaran Meratus (web meratus)
  - Data pelabuhan asal & pelabuhan tujuan wajib dipilih untuk menampilkan data
  - Untuk sortir defaultnya by tanggal berangkat terdekat, namun masih bisa dipilih lainnya seperti tanggal tiba terdekat
  - Jika sortir by “tanggal berangkat terdekat” maka akan ditampilkan datanya urut mulai dari ETD terdekat
  - Jika sortir by “tanggal tiba terdekat” maka akan ditampilkan datanya urut mulai dari ETA terdekat
  - Untuk tanggal pengiriman defaultnya per hari ini, namun bisa dipilih tanggal sebelum dan sesudahnya
  - Terdapat hard code Liner : Spil, tanto, temas di sisi bid owner. Data Pelayaran liner diambil dari master
  - Ketika hasil pencarian ditemukan atau tidak, hard code Liner tetap muncul.
  - Data-data yang ditampilkan adalah : pelayaran, nama kapal, voyage, closing time, pelabuhan asal, etd, pelabuhan tujuan, eta
  - Untuk status jadwal tidak ditampilkan hanya tampil strip
  - Jika setting Koneksi UN Code pelabuhan PH Bid Laut berbeda dengan Meratus atau Kode Pelabuhan belum disetting maka data tidak bisa ditampilkan dan aka nada keterangan “Mohon maaf, jadwal yang anda cari belum tersedia di sistem. Apakah anda membutuhkan bantuan untuk mencari jadwal? Silahkan hubungi customer service PH Bid : csct@prahu-hub.com atau 081246665023”. Email dan nomor wa diambil dari setting general
  - Jika pada meratus memang tidak ada jadwal yang tersedia maka sama akan muncul alert seperti diatas juga
  - Setting UN Code integrasi Meratus ada di halaman Setting Pelabuhan, namun menunya dihidden, Untuk link aksesnya ialah : https://phbidlautdemo.prahu-hub.com/adminprahu/setting_pelabuhan
  - Pada halaman setting pelabuhan, diambil datanya dari master pelabuhan dan pada halaman ini bisa setting UN Code Meratus
