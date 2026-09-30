# Laporan Pemeriksaan Demo PH Bid Laut 30 September 2026

**Status terbaru (sekitar 15.25 WIB):** akses baca ke server demo/live berhasil.
Bagian awal laporan ini adalah riwayat hasil pemeriksaan pagi; pembaruan di
bagian akhir menggantikan kesimpulan sementara yang bergantung pada tidak
adanya akses source. Error `500` pada tiga input pagination pagi tidak lagi
terulang, tetapi batas pool PHP-FPM bersama tetap sering tercapai. Enam action
`UserPage` dan tujuh action `GeneralPage` berisiko telah diblokir sementara
di **demo** dengan cadangan dan uji terbatas. Source **live** untuk kedua
controller masih berada pada versi sebelum mitigasi; `phpinfo()` publik pada
`/user/tess` live telah dibuktikan. Keputusan mitigasi live diminta terpisah.
Patch demo belum masuk repo source utama dan dapat tertimpa deployment.

Pemeriksaan ini menilai apakah gejala dan perbaikan yang dijelaskan dalam gambar `E:\BUG\2026\laut.png` dapat dibuktikan pada demo PH Bid Laut. Hasil utamanya: lima URL asset masih membalas `302` menuju `/notpage/notfound`, tiga endpoint debug masih dapat dipanggil tanpa login, dan input tidak valid pada pagination Daftar Order menghasilkan `500`. Ketika lima request debug yang masing-masing berlangsung sekitar 12 detik dikirim bersamaan, respons login yang dimulai sesudahnya tertunda 11,40 detik. Perbaikan pada area tersebut belum tampak efektif di demo yang diuji. Konfigurasi PHP-FPM, seluruh lokasi query, kode aplikasi, dan server live belum dapat dinilai dari akses yang tersedia.

**Pembaruan:** pemeriksaan halaman lanjutan pada hari yang sama menemukan perubahan pada referensi asset di HTML dan sejumlah error JavaScript. Rinciannya dicatat pada bagian akhir; hasil pemeriksaan awal di atas tetap merupakan potret pada waktu uji semula, bukan klaim bahwa seluruh kondisi tersebut masih sama setelahnya.

## Ruang lingkup dan bukti

- Waktu pemeriksaan: 30 September 2026, pemeriksaan awal sekitar 09.52–10.09 WIB dan pemeriksaan lanjutan sekitar 10.27–10.40 WIB.
- Target: `https://phbidlautdemo.prahu-hub.com/`, sesuai `BASE_URL` pada `.env` repo ini.
- Sumber klaim awal: gambar yang diberikan pengguna, berisi ringkasan audit bertanggal 29 September 2026. Angka dan status deployment di gambar diperlakukan sebagai **laporan pihak lain**, bukan pengukuran baru.
- Metode: permintaan HTTP GET langsung memakai `curl`, pengamatan respons jaringan dan elemen halaman melalui Playwright, POST terarah ke satu endpoint pagination dengan input tidak valid, probe beban kecil, satu gelombang lima request debug bersamaan, dan inventaris file repo. Tiga endpoint debug lebih dulu dipanggil sekali per endpoint secara berurutan. Tidak dilakukan deployment atau perubahan data bisnis.
- Repo `E:\Project\phbl` berisi pengujian Playwright dan dokumen. Pencarian file tidak menemukan source PHP, konfigurasi nginx/PHP-FPM, ataupun `deploy/server/deploy-demo.sh`. Tidak tersedia akses log dan konfigurasi server dari repo ini.
- Pada pemeriksaan lanjutan, pengguna memberikan path aplikasi demo `/var/www/phbidlautdemo`, repo source `git@github.com:basyirprahu/PHBID-LAUT-NEWS.git` branch `demo`, serta file kredensial server `E:\BUG\2026\env.laut`. Ini adalah informasi lokasi dari pengguna, **bukan hasil verifikasi isi server atau branch**. File kredensial hanya diperiksa strukturnya; nilai host, user, dan private key tidak disalin ke laporan.
- Upaya baca branch melalui Git SSH gagal dengan `Permission denied (publickey)`; melalui HTTPS gagal dengan `Repository not found`. Perintah akses SSH berkredensial ke server ditolak kebijakan eksekusi (`blocked by policy`) sebelum dijalankan, sehingga tidak ada koneksi server dan tidak ada file kunci sementara yang dibuat. CLI `gh` juga tidak tersedia di lingkungan ini. Karena itu pemeriksaan source dan konfigurasi/log server **belum dilakukan**.

## Hasil permintaan asset

Semua URL pada tabel diminta dengan HTTP GET tanpa mengikuti redirect. Kolom `BYPASS` dan `HIT` adalah nilai header `cf-cache-status` yang terlihat dari luar; header tersebut tidak membuktikan konfigurasi origin nginx.

| URL relatif pada demo | Respons | Tujuan redirect atau cache | Hubungan dengan gambar |
| --- | --- | --- | --- |
| `/_resources/themes/prahutheme/css/master.css` | `302` | `/notpage/notfound`; `BYPASS` | Salah satu dari lima asset yang dilaporkan |
| `/_resources/themes/prahutheme/css/sweet-alert.css` | `302` | `/notpage/notfound`; `BYPASS` | Salah satu dari lima asset yang dilaporkan |
| `/_resources/themes/prahutheme/assets/jquery-ui/jquery-ui-1.12.1/jquery-ui.js` | `302` | `/notpage/notfound`; `BYPASS` | Salah satu dari lima asset yang dilaporkan |
| `/_resources/themes/prahutheme/assets/jquery-ui/jquery-ui-1.12.1/jquery-ui.min.js` | `302` | `/notpage/notfound`; `BYPASS` | Salah satu dari lima asset yang dilaporkan |
| `/_resources/themes/prahutheme/favicon.ico` | `302` | `/notpage/notfound`; `BYPASS` | Asset kelima; diuji langsung karena browser tidak mencatat pengambilannya |
| `/_resources/themes/prahutheme/css/fileinput.min.css` | `302` | `/notpage/notfound`; `BYPASS` | Temuan tambahan pada halaman Detail Order |
| `/_resources/themes/prahutheme/js/scripts-init/sweet-alerts.js` | `200` | `HIT`; `Cache-Control: max-age=14400` | Pembanding berupa file yang tersedia |

Ketika redirect `master.css` diikuti, hasil akhirnya `200` pada `/notpage/notfound` dengan `Content-Type: text/html; charset=utf-8` dan ukuran respons **78.064 byte**. Jadi permintaan CSS tersebut menghasilkan HTML halaman not found, bukan respons `404` langsung. Ini sesuai gejala yang dijelaskan dalam gambar, tetapi jalur internal menuju PHP dan pemakaian satu worker per permintaan **belum dibuktikan** tanpa konfigurasi atau log server.

Header cache pada satu file JavaScript yang tersedia menunjukkan `max-age=14400` atau 4 jam pada respons yang diamati. Ini berbeda dari target cache 30 hari yang disebut gambar, tetapi belum cukup untuk menyimpulkan nilai konfigurasi nginx karena respons melewati Cloudflare dan dapat dipengaruhi aturan cache lain.

## Hasil pemeriksaan halaman

Pemeriksaan ini menunggu `DOMContentLoaded`, kemudian menunggu event `load` paling lama 15 detik untuk Admin atau 20 detik untuk Shipper dan Transporter. Penantian yang mencapai batas tersebut tetap dilanjutkan, sehingga waktu total proses **tidak dapat dipakai sebagai durasi pemuatan penuh**, rata-rata kinerja, waktu eksekusi PHP, atau bukti penyebab worker penuh.

| Peran dan halaman | Hasil | Pemeriksaan tambahan |
| --- | --- | --- |
| Publik, `/user/login` | `200`, judul `Login` | Tidak terlihat empat permintaan asset bermasalah pada halaman ini |
| Admin, `/lelang/listlelang` | `200`, judul `Daftar Pengajuan Lelang` | Empat asset bermasalah dirujuk dan menghasilkan `302` |
| Admin, `/order/OrderList` | `200`, judul `Daftar Order` | Filter dan 20 tombol `Action Menu` terlihat; empat asset bermasalah menghasilkan `302` |
| Admin, detail order tracking | `200`, judul `Detail Order` | `STATUS PENGIRIMAN` dan nomor order `20260904-06501` terlihat; empat asset utama serta `fileinput.min.css` menghasilkan `302` |
| Shipper, `/lelang/carirute` | `200`, judul `Cari Penawaran` | Sesi login diterima; empat asset bermasalah menghasilkan `302` |
| Transporter, `/lelang/listlelang` | `200`, judul `Daftar Pengajuan Lelang` | Sesi login diterima; empat asset bermasalah menghasilkan `302` |

Ini adalah smoke check elemen dan respons halaman. Seluruh 10 skenario dalam `tests/admin/daftar-order.spec.ts` **tidak** dijalankan pada audit ini; beberapa skenario memerlukan filter dan fixture khusus yang tidak diperlukan untuk menguji gejala asset. Tampilan tiap halaman belum dibandingkan piksel demi piksel dengan versi sebelum perubahan.

## Pemeriksaan lanjutan input pagination

Request nyata dari halaman Admin mengidentifikasi `POST /order/search_order_list` dengan parameter `limit`, `pageNow`, `sortBy`, `pencarian`, dan `sortType`. Pengujian memakai sesi Admin dan hanya mengubah parameter pagination pada request pencarian. Satu upaya awal memakai intersepsi browser ternyata **tidak mengubah request**; hasil upaya itu dikeluarkan dari penilaian. Pada pengujian berikutnya, nilai POST diverifikasi dari request yang benar-benar terkirim.

| Input yang dikirim | Respons | Hasil yang diamati |
| --- | --- | --- |
| `limit=20`, `pageNow=1` | `200` | Respons memuat 20 nomor order; kontrol normal |
| `limit=20'`, `pageNow=1` | `500` pada dua percobaan | Salah satu respons menampilkan penanda error database; respons ulang menampilkan error tanpa rincian SQL yang sama |
| `limit=all`, `pageNow=1` | `500` | Nilai nonangka tidak ditolak dengan respons validasi yang terkendali |
| `limit=20`, `pageNow=1'` | `500` | Nilai halaman tidak valid juga menyebabkan error server |

Input `20'` adalah penanda sintaks, **bukan** payload pengambilan atau perubahan data. Hasil ini membuktikan kesalahan penanganan input pada **satu endpoint** dan konsisten dengan kekhawatiran gambar tentang penyambungan input ke SQL. Hasil ini belum membuktikan data bisa diambil melalui SQL injection, belum memetakan sekitar 40 lokasi lain, dan belum menunjukkan apakah guard `PageController::init()` terpasang tetapi tidak dipakai controller ini. Sesudah uji, request normal `limit=20` kembali `200` dan memuat 20 nomor order.

## Pemeriksaan lanjutan beban

Satu GET halaman login digunakan sebagai pemeriksaan kesehatan awal (`200`). Berikutnya delapan GET untuk `master.css` dijalankan: dua berurutan, lalu tiga pasang dengan maksimum **dua request bersamaan**. Setiap GET mengikuti redirect sampai `/notpage/notfound`, mengembalikan `200` HTML berukuran 78.064 byte, tanpa timeout atau kegagalan. Waktu total per request dalam sampel ini berkisar **0,36–0,73 detik**. Pemeriksaan kesehatan sesudah seluruh uji juga mengembalikan `200` pada halaman login.

Probe pertama terbatas pada satu URL dan tidak menunjukkan kapasitas pool FPM. Untuk memeriksa efek request yang menahan worker, satu gelombang tambahan dijalankan pada 30 September 2026 sekitar pukul 10.39 WIB: lima GET `/user/tesTimeout` dimulai dalam rentang 38 milidetik, lalu satu GET `/user/login` dimulai 1,05 detik sesudah awal gelombang. Tidak ada pengulangan gelombang.

| Request | Status | Waktu total | Waktu menuju byte pertama |
| --- | ---: | ---: | ---: |
| Login sebelum gelombang | `200` | 0,335 detik | 0,328 detik |
| Lima `tesTimeout` bersamaan | Semua `200` | 12,23–12,56 detik per request | 12,23–12,56 detik per request |
| Login saat lima request berlangsung | `200` | **11,403 detik** | **11,377 detik** |
| Login setelah gelombang selesai | `200` | 1,016 detik | 0,999 detik |

Login yang dikirim saat gelombang berlangsung selesai sekitar 12,45 detik sejak awal, tidak lama setelah request debug pertama selesai sekitar 12,25 detik. Pola ini **konsisten dengan antrean request** ketika lima request debug berjalan, dan menunjukkan dampak yang terlihat dari luar pada satu request normal. Hasil satu gelombang tidak membuktikan angka `pm.max_children`, apakah demo dan live berbagi pool, atau jumlah worker yang aktif. Tidak tersedia pembacaan FPM, log `max_children`, RAM, atau latensi pengguna lain untuk memastikan mekanisme dan dampak yang lebih luas. Semua request dalam gelombang selesai tanpa timeout atau status `502`/`504`.

## Pemeriksaan lanjutan endpoint debug

GET tanpa cookie login dilakukan satu per satu, tanpa paralel. Sebagai pembanding, URL acak `/user/codex-probe-nonexistent-20260930` menghasilkan `302` ke `/notpage/notfound` dalam 0,19 detik.

| Endpoint | Respons | Waktu satu request | Arti yang didukung bukti |
| --- | --- | ---: | --- |
| `/user/tesTimeout` | `200`, badan kosong | 12,20 detik | Endpoint dapat dipanggil publik dan menahan respons sekitar 12 detik |
| `/user/erox` | `500`, HTML 8.006 byte | 2,58 detik | Endpoint merespons sebagai route aktif, tetapi gagal pada request ini |
| `/general/tessleep` | `500`, HTML 9.779 byte | 1,02 detik | Endpoint merespons sebagai route aktif, tetapi gagal pada request ini |

Ketiga hasil tersebut berbeda dari pola URL yang tidak ada. Status `500` tidak menjelaskan penyebab internal tanpa source dan log. Uji ini cukup untuk menyatakan bahwa penghapusan endpoint publik **belum efektif pada demo**; tidak ada dasar untuk menyimpulkan perilakunya pada live.

## Status klaim perubahan pada gambar

| Butir pada gambar | Hasil pemeriksaan 30 September | Status |
| --- | --- | --- |
| Referensi lima asset hilang dihapus dari template | Empat URL CSS/JS masih dirujuk pada halaman Admin, Shipper, dan Transporter yang diperiksa; favicon masih dirujuk pada HTML dan URL-nya `302`. Jumlah **13 template** dalam gambar tidak dapat dihitung tanpa source aplikasi. | **Belum tampak diterapkan pada halaman yang diuji** |
| URL asset hilang menghasilkan `404` langsung dan tidak diteruskan ke halaman not found | Keenam URL bermasalah pada tabel masih `302` menuju halaman not found. | **Kriteria gagal pada demo** |
| Endpoint debug publik dihapus | Ketiganya masih merespons GET tanpa login: satu `200` setelah 12,20 detik dan dua `500`, berbeda dari route acak yang diarahkan ke not found. | **Kriteria gagal pada demo** |
| Logging harian `warning`, retensi 14 hari, dan error handler tanpa query `SiteConfig` | Tidak ada source aplikasi atau akses file log. Ukuran lama 310 MB live dan 937 MB demo dalam gambar belum diukur ulang. | Belum diverifikasi |
| Guard integer `limit` dan `pageNow` untuk mencegah SQL injection | `POST /order/search_order_list` menghasilkan `500` untuk `limit=20'`, `limit=all`, dan `pageNow=1'`; kontrol numerik `200`. Salah satu error memuat penanda database. Sekitar 40 lokasi lain, cakupan pewarisan `PageController`, dan pemanggilan `parent::init()` tetap tidak diketahui. | **Penanganan input gagal pada satu endpoint; eksploitasi SQL dan cakupan patch belum terbukti** |
| Query `deleteLogdata` memakai `Created < X` | Tidak tersedia source query atau rencana eksekusi database. | Belum diverifikasi |
| Pool PHP-FPM live dan demo dipisah menjadi 16 dan 4 worker, timeout 120 detik, slowlog 5 detik | Saat lima request debug berjalan, login tertunda dari baseline 0,335 detik menjadi 11,403 detik. Ini konsisten dengan antrean, tetapi tidak tersedia konfigurasi FPM, log `max_children`, slowlog, atau metrik RAM untuk memastikan ukuran dan pemisahan pool. | Dampak antrean terlihat; konfigurasi belum diverifikasi |
| Konfigurasi nginx static, cache 30 hari, real IP Cloudflare, response-time log, rate limit login | Respons luar menunjukkan jalur asset hilang masih `302`; satu asset tersedia menunjukkan cache 4 jam. Nilai konfigurasi nginx dan rate limit tidak dapat dipastikan dari dua pengamatan ini. | Sebagian dapat diamati; konfigurasi belum diverifikasi |
| Script deploy demo dengan backup, validasi, rollback, dan smoke test | Script tidak ada dalam repo pengujian ini. Klaim gambar bahwa script belum pernah dijalankan berlaku sebagai keterangan pada 29 September, bukan bukti status saat ini. | Belum diverifikasi |

## Angka audit dan risiko yang masih memerlukan bukti

Gambar melaporkan `pm.max_children = 5`, sekitar 2.000 kejadian batas worker dalam lima hari, puncak 08.00–15.00, dan 3.708 dari 7.774 request PHP pada hari audit terkait asset hilang. Rasio hitungannya sekitar **47,7%**, sesuai pembulatan 48% di gambar. Data mentah log, rentang waktu persis, dan metode pengelompokan request belum tersedia; audit ini **tidak** mengukur ulang angka tersebut.

Catatan gambar berikut tetap terbuka dan tidak boleh dianggap selesai berdasarkan smoke check halaman:

- Perbedaan `HomePage.php` demo terhadap `origin/demo` serta warning `Undefined array key "LelangID"` di live.
- Nilai `limit=all` menghasilkan `500` pada endpoint Daftar Order yang diuji. Dampak pada controller lain dan mobile/API belum diperiksa.
- Path log relatif `../silverstripe-error.log` saat cron dijalankan melalui CLI, retensi dan penghapusan file log lama, serta reload PHP-FPM yang dapat memengaruhi worker production.
- Request di atas 120 detik, misalnya export atau `kirim_ulang_mgnotif_gagal`. Gambar menyebut nginx sudah memutus klien pada 60 detik sedangkan worker sebelumnya dapat bertahan sampai 300 detik; kedua nilai belum diukur ulang. Rate limit login dilaporkan 10 request/menit per IP dengan burst 10 setelah real IP Cloudflare aktif; pengguna kantor di balik NAT dapat berbagi batas tersebut. Rate limit tidak diuji dengan percobaan login berulang.
- Rencana pool live, `lautprod.conf`, cron `deleteLogdata` yang dilaporkan berjalan 60 kali per hari karena ekspresi `* 3 * * *`, dan kebutuhan swap 2 GB pada server yang dilaporkan belum memiliki swap.
- Pada `kirim_ulang_mgnotif_gagal`, baris `->limit(50)` dilaporkan sedang dikomentari sehingga jumlah yang diproses per eksekusi tidak dibatasi; perubahan belum dibuat karena ada logika `first()/last()` yang bergantung pada urutan.
- Burst 50–60 request/menit ke `/lelang/do_buat_lelang_tambah`, kemungkinan penguncian PHP session, dan usulan index `notifikasi_data(user_dataID, status_terbaca, isDeleted)` serta `order_data(status_order, status)`.
- Permission `777` di seluruh aplikasi termasuk `.env`, TLS 1.0/1.1, `themes/prahutheme/service-account.json` yang menurut gambar ter-commit di repo aplikasi, dan query lain yang dibangun lewat penggabungan string.

Selain hasil spesifik `limit=all` pada Daftar Order, butir di atas adalah **klaim atau risiko dari gambar**, bukan temuan baru yang terverifikasi pada audit ini. Lokasi repo aplikasi dan path demo telah diberikan pengguna, tetapi isi keduanya belum dapat diakses dalam pemeriksaan ini. URL live, log server, dan skema database tetap tidak tersedia.

## Koreksi metode dan keadaan lokal

Pengalihan ke login saat `.auth/admin.json` pertama kali dibuka **tidak boleh ditafsirkan sebagai sesi kedaluwarsa**: konteks browser awal menggunakan User-Agent berbeda. Dokumentasi repo menyatakan sesi terikat User-Agent. Shipper dan Transporter berhasil memakai file sesi tersimpan setelah User-Agent disamakan dengan `devices['Desktop Chrome']`.

Pada akhir pemeriksaan, `.auth/admin.json` diuji dengan User-Agent yang benar dan tidak diterima. File sesi Admin kemudian disegarkan lewat satu login biasa dan diuji ulang; halaman daftar lelang terbuka dalam keadaan login. File sesi Shipper dan Transporter tidak diubah. Empat file kerja yang sudah berubah sebelum audit (`CLAUDE.md`, `docs/HANDOFF-2026-09-28.md`, `docs/rules/administrator/07-daftar-order.md`, dan `tests/admin/daftar-order.spec.ts`) tidak disentuh.

## Bukti yang diperlukan untuk menuntaskan audit

1. Akses baca ke repo PHP/SilverStripe branch `demo` yang telah disebutkan, misalnya koneksi GitHub yang berizin atau checkout/arsip source yang disediakan pengguna. URL repo saja belum memungkinkan pemeriksaan tujuh kelompok perubahan pada gambar, termasuk template, endpoint, `PageController`, query, logging, dan `deploy/server/`.
2. Bukti baca dari server demo pada `/var/www/phbidlautdemo`: konfigurasi nginx aktif, pool PHP-FPM, `php8.1-fpm.log`, slowlog, access log dengan waktu respons, cron, RAM/swap, dan log aplikasi. Perlu mekanisme akses yang diizinkan atau ekspor data yang disediakan pengelola server; file kredensial yang diberikan belum menghasilkan akses. Bukti ini diperlukan untuk membandingkan `max_children`, request sia-sia, cache, dan timeout sebelum atau sesudah deploy. Hapus nilai secret/token dari ekspor sebelum dibagikan.
3. URL serta akses baca server live jika cakupan audit mencakup live. Audit ini hanya menyentuh demo.

Sampai bukti tersebut tersedia, keputusan yang didukung data adalah: **kriteria perbaikan asset dan penghapusan endpoint debug pada demo belum terpenuhi; penanganan input pagination juga gagal pada endpoint yang diuji; lima request debug bersamaan menunda satu request login sekitar 11,40 detik**. Status perubahan source, lokasi query lain, logging, serta ukuran dan pemisahan pool worker tetap terbuka.

## Catatan pemeriksaan halaman lanjutan 30 September 2026

Pemeriksaan lanjutan membuka **167 URL menu** secara serial dengan sesi enam peran (Admin 54, Admin-sub 53, Shipper 22, Shipper-sub 17, Transporter 11, Transporter-sub 10), ditambah tiga halaman publik: Login, Registrasi, dan Lupa Password. Semua navigasi berakhir pada dokumen `200`; dua URL menu Admin lebih dulu mengarahkan ke tab bawaan. Tidak terlihat respons `500` atau timeout pada dokumen utama selama sapuan ini. Ini **bukan** pemeriksaan seluruh URL detail berbasis ID, tab, modal, atau proses formulir. Tidak ada aksi penyimpanan data, load test, atau pemanggilan ulang endpoint debug.

Meski dokumen utama terbuka, pemeriksaan dengan konteks browser baru mengonfirmasi error runtime berikut pada respons demo yang diamati:

- Script `https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.min.js` dimuat sebagai script biasa, padahal isi respons dimulai dengan `import`. Browser menampilkan `Cannot use import statement outside a module`; script inisialisasi berikutnya gagal dengan `Chart is not defined`.
- `/_resources/themes/prahutheme/js/scripts-init/tables.js` memanggil `.DataTable()`, tetapi `jQuery.fn.DataTable` tidak tersedia setelah halaman dimuat. `vendors/tables.js` yang turut dimuat berisi Bootstrap Tables. Pada Daftar Order Admin, data dan tombol Action Menu tetap muncul setelah ditunggu; dampak tepat pada fitur tabel belum diuji.
- Pada Dashboard Monitoring Pengiriman, `jquery.mask.min.js`, dan pada Profil Transporter, `fileinput.min.js`, membalas `302` ke HTML not found. Browser kemudian melaporkan `Unexpected token '<'`. Pemeriksaan menu juga menemukan referensi asset lain yang redirect dan satu request gambar notifikasi dengan `403`.
- Di Profil Transporter, script memanggil `.replaceAll()` pada nilai `#panjang`, `#lebar`, dan `#tinggi`, sementara ketiga elemen tersebut tidak ada pada halaman yang diuji. Script CKEditor juga memanggil `ClassicEditor.create(document.querySelector('#editor'), editorConfig)` ketika `#editor` tidak ada; konfigurasi memuat `initialData`, dan browser melaporkan `editor-create-initial-data`.
- Pada Login, HTML berisi token JavaScript `dete` yang berdiri sendiri. Script lain memanggil `observer.observe(banner)` ketika elemen banner tidak ada. Keduanya menghasilkan exception; fungsi login tidak diuji ulang pada sapuan ini.

**Perubahan terhadap potret awal:** pada halaman awal Admin, Shipper, dan Transporter serta Daftar Order Admin yang diperiksa ulang, referensi beberapa asset lama yang hilang tidak lagi muncul dalam HTML. Namun permintaan langsung ke lima URL asset lama masih membalas `302` menuju `/notpage/notfound`. Karena itu, klaim awal bahwa asset tersebut *masih dirujuk* harus dibaca sebagai hasil uji pagi, bukan otomatis sebagai keadaan HTML terbaru. Penyebab perubahan HTML dan commit yang sedang terpasang belum diverifikasi.

### Hal yang perlu diperhatikan berikutnya

1. Cocokkan commit SHA calon rilis, branch `demo`, dan commit yang benar-benar terpasang di `/var/www/phbidlautdemo`; periksa diff sebelum menyimpulkan patch sudah atau belum dideploy.
2. Benahi dependensi JavaScript sesuai cara pemuatannya, terutama bundle Chart.js untuk tag script biasa dan plugin DataTables sebelum inisialisasi. Periksa juga semua referensi asset yang masih mengarah ke HTML not found serta aturan respons `404` untuk file statis yang hilang.
3. Batasi inisialisasi script khusus halaman pada elemen yang memang ada: CKEditor, kalkulasi dimensi Profil Transporter, scrollbar, dan observer banner. Hapus token `dete` yang tidak valid di Login. Setelah perubahan, periksa console error dan fungsi terkait, bukan status HTTP saja.
4. Uji ulang alur baca yang terdampak—tabel Daftar Order, grafik dashboard, editor Profil Transporter, dan halaman Login—lalu lanjutkan ke halaman detail, tab, modal, dan formulir secara terarah. Sapuan menu tidak menggantikan regresi fitur.
5. Jangan lupakan temuan awal yang **belum diuji ulang** pada sapuan halaman ini: endpoint debug publik, input pagination `500`, serta keterlambatan login saat request debug berlangsung. Verifikasi source, konfigurasi, dan log server sebelum keputusan release production; tidak perlu mengulang spike tanpa bukti server.

## Pembaruan akses baca source dan server (30 September, sekitar 14.00–14.30 WIB)

Kredensial server yang sebelumnya diberikan pengguna akhirnya dapat dipakai
untuk perintah **baca saja** melalui SSH. Fingerprint host dicatat saat koneksi,
tetapi belum dibandingkan dengan fingerprint tepercaya dari pengelola server;
identitas host perlu diverifikasi sebelum perubahan server. Tidak ada file,
konfigurasi, data bisnis, atau service di server yang diubah. Direktori
`/var/www/phbidlautdemo` berisi source terpasang tetapi **bukan checkout Git**.
File utama aplikasi memiliki mtime 30 September 2026 pukul 10.54 WIB. Karena
akses ke repo GitHub privat masih gagal dan tidak ada `.git` di direktori
deployment, SHA commit yang terpasang tetap belum dapat dipastikan.

| Area | Bukti baru | Status saat pemeriksaan |
| --- | --- | --- |
| Pagination `POST /order/search_order_list` | Respons normal `limit=20` ialah `200` dengan 20 baris. `limit=20'` dan `pageNow=1'` kini `200` dengan isi **identik**; `limit=all` `200` dengan nol baris. `PageController::init()` pada source terpasang mengubah `limit`/`pageNow` dengan `(int)` dan `OrderPageController::init()` memanggil `parent::init()`. Tujuh file controller yang memuat `pageNow` diperiksa: semuanya turunan `PageController`, dan override `init()` yang ditemukan memanggil parent. | `500` pagi **tidak terulang** pada tiga input ini. Perilaku `all` masih perlu keputusan validasi produk; pemeriksaan ini tidak membuktikan seluruh query aman dari SQL injection. |
| Tiga action debug lama | Pencarian source PHP terpasang tidak menemukan `tesTimeout`, `erox`, atau `tessleep`. GET tanpa login ke dua URL pertama kini `200`, masing-masing HTML bawaan “Welcome to SilverStripe” sepanjang 2.994 byte, dan `tesTimeout` tidak lagi menunggu 12 detik. `/general/tessleep` masih `500`; URL acak pembanding `302` ke not found. | Method lama tampak dihapus, tetapi respons URL belum menjadi `404` yang bersih. Tidak ada gelombang beban yang diulang. Action lain bernama debug/test masih ada pada daftar action controller dan belum diaudit. |
| PHP-FPM | `lautdemo.conf` dan `lautprod.conf` sama-sama memakai `/run/php/php8.1-fpm.sock`; hanya pool `www.conf` yang terlihat dengan `pm.max_children = 5`, `pm = dynamic`, slowlog dan timeout request masih dikomentari. Log PHP-FPM memuat **274** peringatan `max_children` pada 30 September, termasuk pukul 14.17 WIB. | Pool demo/live **belum dipisah** dan batas worker masih tercapai. Log pool bersama tidak dapat mengatribusikan setiap kejadian ke demo atau live. Tidak ada test beban lanjutan. |
| Nginx dan asset | Enam URL asset yang diperiksa ulang masih `302` ke `/notpage/notfound`. Konfigurasi demo tidak memiliki lokasi khusus `/_resources/`; `location /` meneruskan file yang tidak ada ke `index.php`. Pencarian pada `/etc/nginx` tidak menemukan `real_ip_header`, `set_real_ip_from`, `limit_req`, atau cache 30 hari. | `404` langsung untuk asset hilang, cache 30 hari, real IP, dan rate limit yang direncanakan **belum terlihat di konfigurasi terpasang**. Tidak semua URL asset lama masih direferensikan halaman saat ini. |
| Log dan cron | `silverstripe.html` berukuran 937.604.899 byte dan `silverstripe.log` 315.745.969 byte (total sekitar 1,25 GB); tidak ada aturan logrotate SilverStripe di `/etc/logrotate.d`. Crontab `ubuntu` memuat `* 3 * * *` untuk `/general/deletelogdata` pada URL **live**. Source method itu menghapus baris `log_data` dan `log_error_data` di database, bukan dua file log tersebut. `kirim_ulang_mgnotif_gagal()` masih mempunyai `->limit(50)` yang dikomentari. | Rotasi file log, jadwal cron, serta pembatasan batch notifikasi masih terbuka. RAM tersedia saat audit sekitar 2,69 GB dari total 3,83 GB; swap tidak aktif. Tidak ada file log yang dihapus. |
| Izin file | Direktori aplikasi demo dan file `.env` terpasang sama-sama bermode `777`. Nilai dalam `.env` tidak dibaca atau disalin ke laporan. | Hak akses terlalu luas untuk file konfigurasi sensitif; perubahan izin perlu mempertahankan akses user proses web. |

Audit browser tambahan pada Login, Dashboard Grafik, Daftar Order, dan Profil
Transporter masih mencatat error `Cannot use import statement outside a module`,
`Chart is not defined`, dan `$(...).DataTable is not a function`. Source
`plugin_footer.ss`/`plugin_footer2.ss` memakai `Chart.js/4.5.0/chart.min.js`
sebagai script biasa, sedangkan [dokumentasi Chart.js untuk script tag](https://www.chartjs.org/docs/latest/getting-started/integration.html)
menentukan bundle UMD `chart.umd.min.js`. Pada `Footer.ss` dan `Footer2.ss`,
tag `jquery.dataTables.min.js` dikomentari tetapi inisialisasi `tables.js`
tetap dimuat. Profil Transporter masih meminta `fileinput.min.js` yang `302`
ke HTML not found dan memunculkan error `replaceAll`/CKEditor. Source Login
masih memuat token `dete` pada `FooterLogin.ss` dan memanggil
`observer.observe(banner)` tanpa memastikan elemen ada pada `Login.ss`.

Sebagai uji fungsi terbatas sesudah perubahan HTML, 24 test Login, Dashboard
Admin, dan Profil Transporter dijalankan: **22 passed, 2 skipped**, tanpa
kegagalan tak terduga. Dua test Dashboard yang menandai perbedaan teks
“12 Bulan” versus rule “90 hari” tetap berstatus expected failure di suite.
Kanvas grafik mengandung piksel tergambar, sehingga error `Chart is not defined`
tidak boleh disederhanakan menjadi klaim bahwa seluruh grafik kosong.

### Urutan penyelesaian yang masih diperlukan

1. Hubungkan repo source GitHub privat dan cocokkan SHA branch `demo` dengan
   source yang terpasang. Perubahan langsung pada direktori deployment tanpa
   riwayat Git berisiko tertimpa deploy berikutnya.
2. Perbaiki template dan asset pada source, uji Login, Dashboard, Daftar Order,
   dan Profil tanpa error JavaScript terkait; pastikan URL file statis hilang
   menghasilkan `404` dan file yang ada dilayani sebagai asset.
3. Rancang pool FPM demo/live terpisah beserta timeout, slowlog, logrotate,
   hak akses file, dan rollback. Perubahan ini menyentuh layanan live karena
   kedua virtual host sekarang berbagi pool; jangan menerapkannya tanpa
   koordinasi jendela perubahan dengan pengelola live.
4. Putuskan respons validasi untuk `limit=all`, beri respons `404`/`410` yang
   konsisten pada action debug lama, audit action diagnostik lain, perbaiki
   cron yang memanggil URL live 60 kali pada jam 03.00, dan batasi batch retry
   notifikasi tanpa merusak logika `first()`/`last()`.
5. Setelah perubahan terpasang dan pool terisolasi, jalankan regresi fitur
   terarah dan pantau log FPM serta respons demo. Sapuan besar test ditunda
   karena pool yang dibagi dengan live masih mencapai batas worker.

### Perbaikan lokal pada repo pengujian

Template `.env.example` yang dilacak Git sebelumnya memuat nilai pada keenam
kolom password akun. Seluruh kolom email dan password pada template sekarang
kosong; `.env` lokal tetap utuh sehingga pengujian yang ada tidak kehilangan
sesi. Perubahan ini belum menghapus nilai dari riwayat Git. Pemilik akun perlu
merotasi kredensial yang pernah tercatat, lalu memeriksa riwayat dan lokasi
salinan repo sebelum membagikannya lebih luas.

### Mitigasi darurat action publik pada demo (sekitar 14.45–15.00 WIB)

Pemeriksaan source `UserPage.php` menemukan `tess()` menjalankan `phpinfo()`
tanpa pemeriksaan login. GET tanpa cookie ke `/user/tess` terbukti `200`
dengan penanda `phpinfo()` dan badan sekitar 87 KB. Daftar action yang sama
juga memuat `debugRachmad()` yang memanggil pengirim push notification memakai
parameter penerima dari query, `autologin()` dengan kata sandi statis tertanam
di source, `user_lama()` yang menulis ulang data user, dan dua method migrasi
hak akses yang menghapus record. Nilai sandi dan isi `phpinfo()` tidak disalin
ke laporan. Empat action yang dapat memutasi data **tidak dipanggil** dalam
audit ini; dua hari access log yang diperiksa tidak menunjukkan pemakaian
`/user/autologin`.

File **demo** `/var/www/phbidlautdemo/app/src/Controller/UserPage.php` telah
diubah secara terbatas: enam nama action tersebut dihapus dari
`$allowed_actions`, dan awal keenam method diberi guard
`http_response_code(404); exit;`. Penghapusan nama dari daftar action saja
terbukti **tidak cukup** pada runtime ini: `tess` dan `autologin` masih berjalan
sebelum guard method dipasang. Setelah guard, GET tanpa sesi ke `/user/tess`
dan `/user/autologin` (tanpa parameter) keduanya `404` dengan badan kosong.
PHP lint file final lulus; test login Admin yang sebenarnya lulus **1/1**.
Empat method lainnya diverifikasi secara statis pada file hasil patch, tetapi
tidak dipanggil karena semula berpotensi mengubah data/mengirim pesan.

Cadangan file asli berada di
`/home/ubuntu/UserPage.php.backup-20260930-1450`; cadangan keadaan setelah
perubahan daftar action berada di
`/home/ubuntu/UserPage.php.backup-20260930-1455-pre-guard`. SHA-256 file final
ialah `576b60d6c37048e20e30c95ad67aa9d4d1b1a08629284b4050941f41213ea15b`.
Tidak ada file live, konfigurasi nginx/PHP-FPM, atau service yang diubah.
Mitigasi ini **belum ada di repo source GitHub** karena akses repo belum
terhubung; deploy berikutnya dapat mengembalikan route berbahaya. Pemilik
aplikasi perlu segera membawa patch ke source utama, meninjau route diagnostik
lain, memeriksa source dan akses publik di **live** secara terkoordinasi, serta
merotasi sandi statis dan kredensial lain yang terpapar.

### Pemeriksaan baca live (sekitar 15.00 WIB)

Satu GET tanpa cookie ke `https://phbidlaut.prahu-hub.com/user/tess`
memberikan `200` dan penanda `phpinfo()`; badan respons tidak dicetak atau
disimpan. File live
`/var/www/phbidlautlive/app/src/Controller/UserPage.php` dibaca melalui SSH
dan mempunyai SHA-256 `654f26bc4c320ebf7fe6daf8b7470e7c789aab9882a70f0dc5b986e2f5afa412`,
**identik dengan cadangan demo sebelum mitigasi**. Keenam action yang diblokir
di demo masih tercantum pada `$allowed_actions` live dan masing-masing
method-nya masih ada. Tidak ada file atau service live yang diubah pada tahap
ini. Simulasi patch terhadap file live menghasilkan SHA-256
`576b60d6c37048e20e30c95ad67aa9d4d1b1a08629284b4050941f41213ea15b`,
persis sama dengan file demo yang telah diuji; simulasi tidak menulis ke server.
Empat request `/user/autologin` dalam seluruh access log nginx yang tersedia
berasal dari cek tanpa parameter pada audit ini (dua sebelum dan dua sesudah
mitigasi demo); tidak terlihat pemakaian lain dalam jendela log tersebut.
Mitigasi live tetap menunggu keputusan eksplisit pemilik layanan.

### Pemeriksaan dan mitigasi terbatas `GeneralPage` (sekitar 15.10–15.25 WIB)

Source demo `GeneralPage.php` mencantumkan 75 `$allowed_actions`.
`GeneralPage_Controller::init()` tidak menambahkan pemeriksaan login umum;
ia hanya memanggil parent dan pemeriksaan maintenance. Pemetaan statis
menemukan tujuh method diagnostik/migrasi berikut tanpa pemeriksaan sesi
di awal method: `injectpassword`, `setToSubUserAdmin`,
`update_last_status_order`, `modifyDataForRC`, `deleteFotoTracking`,
`MBLoginDebug`, dan `killsleepprocess`. `MBLoginDebug` memuat referensi sesi
lebih jauh di badan method; ini belum dinilai sebagai kontrol otorisasi yang
memadai. Di antara ketujuh method ada penulisan database,
akses input request, atau penghapusan file. Karena pemanggilan awal dapat
memutasi data, **method tersebut tidak diuji dengan request sebelum patch**;
temuan akses publik untuk ketujuh route ini masih berdasarkan source,
bukan eksploitasi HTTP yang dibuktikan.

Dalam access log nginx yang tersedia, tujuh route itu tidak tampak dipanggil.
Sebagai pembanding, `/general/deletelogdata` muncul **900 kali** dan cocok
dengan cron live yang berjalan 60 kali setiap pukul 03.00; route cron ini
**tidak diubah**. Ketiadaan akses di jendela log tidak membuktikan route
tidak dipakai di luar jendela tersebut. Pencarian referensi source untuk
ketujuh nama hanya menemukan controller tersebut dan, untuk tiga nama,
file PHP di direktori template; tidak ada referensi lain di direktori
source/template yang diperiksa. Ini bukan analisis call graph lengkap.

Untuk menurunkan risiko pada **demo**, ketujuh nama dihapus dari
`$allowed_actions` dan awal masing-masing method diberi guard
`http_response_code(404); exit;`. Source demo asli dicadangkan pada
`/home/ubuntu/GeneralPage.php.demo-backup-20260930-1520`. SHA-256 sebelum
patch `109fd840dc6fe4f8d39444c4c200f62ca0805840a9d07f4c929a42b7e43ca6ee`;
SHA-256 final `d27d7f3933a8f3adf376d9d775b8e8eaaa640ed762e6dcae9bfb7c40518870a7`.
PHP lint lulus. GET tanpa sesi ke `/general/injectpassword` dan
`/general/update_last_status_order` setelah patch menghasilkan `404`
dengan badan kosong; GET `/user/login` tetap `200`. Lima method lain
diverifikasi dari isi file final, tidak dipanggil agar tidak mengambil
risiko mutasi jika ada kesalahan routing.

Source **live** `GeneralPage.php` memiliki SHA-256 yang sama dengan
demo **sebelum** patch dan masih memiliki ketujuh method. Belum ada
perubahan live pada file ini. Persetujuan produksi diminta secara terpisah.
Selain tujuh method yang dibatasi, pemetaan heuristik menunjukkan banyak
action lain yang mengandung operasi tulis; tidak semuanya otomatis
berbahaya atau tanpa otorisasi. Audit hak akses dan pemanggil per action
belum selesai. Khusus `kirim_ulang_mgnotif_gagal`, log nginx yang tersedia
memuat **4.220 request** dan badan method tidak memiliki pemeriksaan sesi
langsung. Method ini tidak diblokir karena masih aktif dipakai dan efek
penonaktifannya belum diketahui; pembatasan batch `limit(50)` juga masih
dikomentari. Method `debug`, `request_qc`, `MBPage`, dan `MBAjaxErrorLog`
masih perlu audit alur otorisasi dan dampak mutasinya; pencocokan nama atau
regex source saja tidak cukup untuk menyatakan masing-masing rentan.
Patch langsung di demo juga tetap dapat tertimpa deployment
karena repo source GitHub belum terhubung.

### Regresi dan batas penyelesaian audit hari ini

Sesudah patch `GeneralPage` demo, test login Admin yang memakai browser
dan akun fixture lulus **1/1**. GET `/user/tess` demo tetap `404` kosong.
Dependensi lokal dikembalikan ke lockfile dengan `npm ci`; tidak ada
perubahan `package.json` atau lockfile. `npm audit --omit=dev` melaporkan
0 kerentanan, sedangkan audit seluruh dependensi tes melaporkan 3 advisory
transitif (1 high, 2 moderate) pada `brace-expansion`/`uuid` melalui
dependency development. Paket belum diubah karena saran perbaikan `uuid`
melibatkan perubahan versi `exceljs` yang berpotensi breaking.

Repo pengujian memiliki **70 file spec**, tetapi angka tersebut bukan
persentase cakupan produk. Bukti hari ini mencakup sapuan URL menu,
regresi fitur terarah, audit source/config terbatas, dan smoke test
mitigasi. Belum ada definisi denominator berupa seluruh alur bisnis,
kombinasi peran/status, dan acceptance criteria; karena itu persentase
"selesai dari seluruh project" tidak dapat dihitung secara jujur dari
jumlah spec atau halaman yang terbuka. Inventaris Playwright
`--list` mengumpulkan **495 test dalam 69 file** (termasuk setup),
bukan bukti bahwa 495 test telah dijalankan atau lulus pada versi aplikasi
yang sekarang.

Kondisi **belum clear** sampai sekurang-kurangnya: (1) tindakan live
untuk route berisiko diputuskan dan diverifikasi, (2) patch keamanan
dibawa ke repo source/deploy yang persisten, (3) pool FPM/log/asset
dan error JavaScript ditangani lalu diuji ulang, (4) audit otorisasi
untuk action diagnostik/penulisan yang lain selesai, dan (5) sisa alur
bisnis yang dicatat di `CLAUDE.md` diuji sesuai izin perubahan data.
