# Audit awal performa PH Bid Laut dan rencana JMeter

Tanggal: 7 Oktober 2026. Target yang diperiksa: demo pada `BASE_URL` repo. Repo ini berisi pengujian Playwright dan dokumen produk, bukan source PHP aplikasi. Karena itu hubungan antara halaman dan query database di bawah adalah **hipotesis untuk diuji**, kecuali yang diberi bukti pengukuran atau dokumen pemeriksaan sebelumnya.

## Kesimpulan yang sudah didukung bukti

1. Audit server 30 September menemukan demo dan live memakai socket PHP-FPM yang sama, satu pool `www` dengan `pm.max_children=5`, serta 274 peringatan batas worker dalam log hari itu. Ini risiko kapasitas paling besar dan alasan stress test **tidak dijalankan pada demo bersama**. Status konfigurasi pada 7 Oktober belum diverifikasi ulang. Lihat [laporan pemeriksaan](../report/hasil-pengecekan-demo-2026-09-30.md).
2. Pada audit itu lima request debug sekitar 12 detik yang bersamaan membuat satu request login memerlukan 11,403 detik, sedangkan login sebelum gelombang 0,335 detik. Ini satu gelombang observasi, bukan kurva kapasitas atau bukti `pm.max_children` tertentu. Endpoint tersebut kemudian dibatasi di demo; jangan memakainya sebagai beban uji.
3. Suite Playwright memang memakai satu worker karena beberapa worker pada akun yang sama pernah membuat demo timeout. Waktu tunggu Playwright 60 detik mencampur waktu jaringan, render, dan kondisi fixture; angka tersebut **bukan** latency endpoint. Lihat [konfigurasi](../playwright.config.ts).
4. Probe HTTP serial pada 7 Oktober, setelah login segar untuk tiap peran, memberi hasil berikut. Ini sampel kecil dan **tidak boleh dibaca sebagai p95 atau kapasitas**. Perjalanan awal memakai `.auth/*.json` diarahkan ke login, sehingga dikeluarkan dari angka. Jalankan ulang [probe](../scripts/perf-probe.js) untuk pemeriksaan ringan sebelum JMeter.

   | Request | Sampel valid | Rentang waktu total klien | Pemeriksaan isi |
   | --- | ---: | ---: | --- |
   | `GET /user/login` | 3 | 0,959–3,174 detik | HTTP 200 |
   | Admin `GET /order/OrderList` | 3 | 1,171–1,679 detik | path tujuan, HTTP 200; HTML sekitar 299 KB pada sampel akhir |
   | Admin `POST /order/search_order_list` | 2 | **4,449–7,147 detik** | path tujuan, HTTP 200; respons terakhir memuat 20 nomor order |
   | Admin `GET /home/dashboardorder` | 3 | 0,864–1,202 detik | path tujuan, HTTP 200 |
   | Shipper `GET /home/analitikscsr` | 3 | 0,975–0,998 detik | path tujuan, HTTP 200 |
   | Shipper `POST /home/searchpushnotif` | 2 | 0,942–1,075 detik | HTTP 200, JSON punya `jumlah` dan `datatbl` |
   | Transporter `GET /lelang/listlelang` | 3 | 1,767–2,685 detik | path tujuan, HTTP 200 |

   Seluruh angka hanya request HTTP langsung dari mesin probe, termasuk jaringan; belum memuat asset, JavaScript, chart, unduhan, atau render browser. `search_order_list` kini kandidat pertama untuk profiling query dan load test terkontrol. Dua sampel belum cukup untuk menyimpulkan penyebabnya.
5. Analitik SCSR level 3 pernah memerlukan sekitar 6 detik untuk 43 order, sedangkan export memiliki varian Excel/PDF pada tiga level. Ini area prioritas pengukuran end to end; angka 6 detik berasal dari pengamatan UI 28 September, bukan hasil JMeter hari ini. Lihat [aturan SCSR](rules/analitik-scsr.md).

## Peta prioritas fitur

| Prioritas | Modul dan peran | Request/halaman awal | Alasan dan hal yang harus diukur |
| --- | --- | --- | --- |
| P0 | Daftar Order, tiga peran | `GET /order/OrderList`, `POST /order/search_order_list` | Tabel utama, filter, paging, sortir, detail. POST memakai `limit`, `pageNow`, `sortBy`, `pencarian`, `sortType`. Uji halaman awal, filter kosong/terisi, halaman tengah/akhir, dan detail. Periksa jumlah query, indeks filter/sort, response size, serta p95 per variasi. |
| P0 | Analitik SCSR, Admin dan Shipper | `GET /home/analitikscsr`, `/home/analitikscsrbykota`, `/home/analitikscsrconsignee`, `POST /home/searchanalitikscsrkota` | Agregasi lintas order dan multidrop, tiga level drill-down. Bandingkan rentang tanggal kecil/besar, satu/banyak shipper, sort, dan 43+ baris level 3. Korelasikan `session_get`, provinsi, kota asal/tujuan. |
| P0 | Export laporan dan analitik | `GET /home/exportexcelanalitikscsrall`, `...scsrkota`, `...scsrconsignee`, varian `exportpdf...`, `/home/exportlaporanowner`, `/home/exportlaporanlogistik` | Query agregasi, serialisasi dan pembuatan file dapat menahan worker/memori. Ukur waktu unduh sampai selesai, ukuran file, RAM puncak, serta concurrency rendah. Gunakan data yang sama dengan layar. |
| P0 | Dashboard dan monitoring, Admin/Shipper | `GET /home/dashboardorder`, `/home/dashboardpengiriman` | Filter tanggal/shipper dan grafik/peta bisa memicu query atau AJAX tambahan. JMeter HTTP dokumen saja tidak mencakup chart; rekam waterfall browser, lalu ukur request data grafik secara terpisah. |
| P1 | Pengajuan lelang, penawaran, nego | `/lelang/listlelang`, `/lelang/carirute`, halaman daftar nego dan detail | Daftar berubah menurut status, rentang tanggal dan peserta; ukur paging/filter dan detail dengan ID berbeda. Aksi buat lelang, bid, pilih pemenang, pembatalan adalah skenario tulis terpisah. |
| P1 | Cek Jadwal, Harga Jadwal, Open Stack | `/lelang/carijadwal`, `/home/hargajadwal`, detail jadwal | Pencarian rute/jadwal dan integrasi eksternal Meratus/PNP berpotensi menambah latency. Pisahkan waktu PH Bid Laut, API pihak ketiga, dan cache; gunakan stub bila menguji batas kapasitas internal. |
| P1 | Tracking, unit, detail order, invoice | `/order/orderdetail/{hash}`, halaman tracking/unit/invoice | Detail dengan banyak unit, dokumen dan riwayat dapat meningkatkan jumlah query serta ukuran HTML/file. Ambil ID dari CSV yang memang tersedia untuk tiap peran. |
| P1 | Push Notif, tiga peran | `GET /home/notification`, `POST /home/searchpushnotif?status_read=unread&kategori=all` | Daftar notifikasi memakai AJAX, default limit 50, pilihan 20/30/50/100. Bandingkan akun dengan jumlah notif berbeda. Proses kirim/ulang notifikasi perlu profil tersendiri. |
| P2 | Laporan History Lelang/Owner/Logistik | `/home/history_lelang`, `/home/laporanowner`, `/home/laporanlogistik` | Filter tanggal dan shipper, total agregat, detail, export. Rentang aturan 31 atau 90 hari; uji batas yang sah, bukan filter tak terbatas. |
| P2 | Master, setting, validasi akun, akun saya, login/registrasi | menu Admin dan `/user/login` | Umumnya trafik lebih jarang, tetapi login penting sebagai health check saat profil lain berjalan. Perhatikan rate limit, session lock, dan batas pool. Registrasi/reset password perlu data uji terpisah. |

Prioritas di atas adalah urutan pengujian berdasarkan kompleksitas alur dan bukti historis, **bukan pernyataan bahwa setiap modul sekarang lambat**. Folder `tests/admin`, `shipper`, `transporter`, `anon`, dan akun sub mencakup modul di atas, namun 70 file spec tidak menyatakan cakupan performa atau seluruh fitur produk.

## Starter JMeter yang tersedia

[read-only-starter.jmx](../jmeter/read-only-starter.jmx) melakukan satu login segar per virtual user melalui `GET /user/login` dan `POST /user/do_login/`, menyimpan cookie per thread, lalu mengulang halaman baca sesuai `role` dari CSV. Login AJAX dengan field `email` dan `password` dikonfirmasi pada HTML demo 7 Oktober; probe HTTP berhasil memakai alur yang sama. Plan ini mencakup dokumen GET, pencarian order Admin, dan daftar notifikasi Shipper yang sudah diprobe. JavaScript, AJAX lain, asset, chart, serta export belum disimulasikan. Jika aplikasi mengembalikan halaman login, assertion menandainya sebagai kegagalan meskipun HTTP 200.

Struktur XML dan pasangan node JMX telah divalidasi; JMeter tidak tersedia di mesin audit ini, sehingga eksekusi runtime plan masih perlu smoke test pada mesin JMeter Anda.

### Runbook di Muse.ai

Status kesiapan: **akun uji sudah tersedia menurut pemilik proyek**, tetapi `jmeter/users.csv` tetap harus dibuat pada lingkungan Muse.ai karena file kredensial tidak masuk Git. JMX yang tersedia adalah **starter untuk sebagian endpoint baca**, bukan pengujian menyeluruh seluruh modul. Jangan menyebut hasil starter sebagai kapasitas keseluruhan PH Bid Laut.

1. Pastikan JMeter dan Java tersedia (`jmeter --version` dan `java -version`). Dari root repo, salin [users.csv.example](../jmeter/users.csv.example) ke `jmeter/users.csv`. Isi tanpa header dengan format `role,email,password`; `role` hanya `admin`, `shipper`, atau `transporter`. Sediakan **satu akun berbeda per virtual user** dan sedikitnya sebanyak nilai `threads`. Susun urutan baris agar N baris pertama pada setiap tahap mewakili campuran peran yang diinginkan. File CSV ini diabaikan Git; jangan menaruh password di command line atau JTL.
2. Pastikan `host` mengarah ke **staging yang terisolasi dari live**, dengan data representatif dan akses pemantauan server. Plan memiliki host demo sebagai nilai bawaan, maka selalu berikan `-Jhost=HOST_STAGING` secara eksplisit pada run di Muse.ai dan ganti `HOST_STAGING` dengan nama host sebenarnya **tanpa `https://`**. Verifikasi DNS/host dan perubahan konfigurasi PHP-FPM terbaru sebelum uji beban. Siapkan folder `jmeter/results` (`mkdir -p jmeter/results` pada Linux/macOS; `New-Item -ItemType Directory -Force jmeter/results` pada PowerShell).
3. Jalankan **smoke satu virtual user** dari root repo:

   ```bash
   jmeter -n -t jmeter/read-only-starter.jmx -Jhost=HOST_STAGING -Jthreads=1 -Jramp_seconds=1 -Jiterations=1 -Jusers_csv=jmeter/users.csv -l jmeter/results/smoke.jtl
   ```

   Pada Windows, ganti `jmeter` dengan `jmeter.bat`. Periksa semua sampel sukses, login benar, halaman tidak kembali ke form login, pencarian order Admin memuat nomor order, dan notifikasi Shipper memuat `datatbl`. Sampel Admin/Shipper hanya muncul jika akun dengan role itu ikut dalam run; gunakan smoke terpisah per role atau susun CSV agar role yang ingin dicek berada di baris pertama. HTTP 200 saja tidak cukup. Bila JMeter diblokir Cloudflare atau rate limit, catat responsnya dan atur akses staging, jangan menyimpulkan aplikasi lambat dari halaman blokir.
4. Jalankan **load test starter** bertahap pada staging: 2, 5, 10, lalu 20 virtual user, masing-masing sekitar 10–15 menit dengan jeda 2–5 detik yang sudah ada dalam JMX. Gunakan `-Jthreads=<N> -Jramp_seconds=<durasi> -Jiterations=<cukup-banyak>` dan nama JTL unik, misalnya `jmeter/results/load-05.jtl`. `iterations` mengendalikan jumlah putaran, **bukan durasi tetap**; pilih nilainya dari durasi smoke dan hentikan tahap sesuai jadwal pengujian. Lanjut ke tahap berikutnya hanya setelah metrik aplikasi dan server tahap sebelumnya stabil. Angka N adalah rancangan awal, bukan kapasitas yang sudah terbukti.
5. Jalankan **stress test hanya setelah smoke dan load test valid** pada staging terisolasi. Naikkan concurrency bertahap di atas beban normal, tahan 5–10 menit per tahap, lalu turunkan beban untuk mengukur pemulihan. Pakai akun tambahan yang unik untuk setiap thread. Hentikan sesuai stop rule di bagian *Metrik dan keputusan*. Mesin JMeter sendiri harus dipantau agar CPU, memori, atau jaringan generator tidak menjadi bottleneck.
6. Rekam pada waktu yang sama: hasil JTL per tahap, metrik nginx, PHP-FPM (active/idle/queue dan `max_children`), CPU/RAM, slow query/lock database, dan respons integrasi eksternal. Sinkronkan jam generator dan server. Simpan ringkasan p50/p95/p99, throughput, error %, serta titik jenuh dan waktu pulih. Pisahkan hasil per role dan endpoint, terutama `POST /order/search_order_list`.

Untuk klaim **seluruh modul** selesai diuji, tambahkan skenario pada tabel berikut ke JMX/HAR yang sudah dikorelasikan dan divalidasi. Starter saat ini belum mencakup analitik bertingkat, export, chart, seluruh AJAX, atau transaksi tulis. Alur tulis memerlukan fixture dan rencana reset data sendiri.

### Skenario lanjutan yang perlu direkam dari browser

Gunakan Network tab/HAR atau HTTP(S) Test Script Recorder pada satu alur nyata per peran. Hapus cookie, password dan token dari artefak yang dibagikan. Korelasikan ID dinamis, `session_get`, dan parameter filter; pakai CSV berisi beberapa ID yang valid agar cache dan satu baris database tidak mendominasi. Tambahkan assertion isi bisnis dan status pada setiap request.

| Skenario | Variasi minimal | Ukuran keberhasilan |
| --- | --- | --- |
| `POST /order/search_order_list` | limit 20/100, page 1/tengah/akhir, pencarian kosong/terisi, ASC/DESC | JSON/HTML tabel benar, jumlah baris masuk akal, tidak redirect/login/500 |
| SCSR level 1 → 2 → 3 | rentang pendek/panjang yang sah, satu/banyak shipper, provinsi ramai/sepi | data tiap level konsisten, waktu agregasi dan TTFB tiap request tercatat |
| `POST /home/searchanalitikscsrkota` | `limit=20`, `pageNow=1`, `sortBy=kota_asal`, `sortType=ASC/DESC` | urutan dan paging benar, bukan hanya 200 |
| `POST /home/searchpushnotif` | unread/all, kategori, limit 20/50/100 | `jumlah` dan `datatbl` valid, sesi setiap akun tetap benar |
| Export Excel/PDF | tiga level SCSR dan laporan, data kecil/besar | file tidak kosong dan format benar; ukur total download dan RAM |
| Lelang → penawaran → order → tracking | hanya fixture/akun yang bisa direset | pembuatan dan status tepat, tidak dobel, cleanup setelah uji |

Jangan menjalankan alur tulis, kirim notifikasi, upload, export massal, login brute force, atau request diagnostik dalam profil umum. Untuk alur tulis, tentukan data uji unik per thread, batas volume, dan cara mengembalikan state lebih dulu. Jangan gunakan endpoint `tesTimeout`, `tessleep`, `kirim_ulang_mgnotif_gagal`, atau cron sebagai pengganti beban pengguna.

## Metrik dan keputusan

- Laporkan per transaksi: jumlah sampel, throughput (request/detik dan transaksi bisnis/menit), p50/p90/p95/p99, error %, connect time, latency/TTFB, ukuran respons, dan waktu unduh. Pisahkan login, dokumen, AJAX, export, dan alur bisnis end to end. Bandingkan warm/cold cache dan variasi data.
- Pantau serentak: `nginx request_time`/`upstream_response_time`, status 499/502/504, PHP-FPM active/idle/queue dan `max_children`, slowlog, CPU/RAM/swap, DB connections/slow query/locks, antrean notifikasi, serta respons API eksternal. Sinkronkan jam JMeter/server.
- Tetapkan SLO dari kebutuhan produk dan baseline yang berulang. Sebagai **stop rule awal** pada staging: error bisnis >2% selama 1 menit, 502/504 muncul beruntun, antrean FPM terus naik, atau p95 login >5 detik beberapa menit. Sesuaikan ambang dengan pemilik layanan sebelum stress test.
- Satu request 1–2 detik pada probe hari ini tidak menjawab kapasitas. Hasil JMeter tanpa pemantauan server hanya menunjukkan gejala dari luar; source PHP, query plan, dan log dibutuhkan untuk menunjuk akar masalah. Audit server 30 September perlu dicek ulang setelah setiap deploy karena patch saat itu sebagian langsung di demo dan bisa tertimpa.
