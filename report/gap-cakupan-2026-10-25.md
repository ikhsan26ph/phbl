# Celah cakupan — aksi tanpa test otomatis (2026-10-25)

Sumber: `report/evidence-local-2026-10-23/matriks-cakupan.json` (1.331 aksi dari docs/rules + fitur UI).
**752 aksi belum punya spec sama sekali**; regresi otomatis TIDAK menyentuhnya. Status di bawah = status matriks 2026-10-24 (belum diperbarui dengan run 2026-10-25).

| Role — Modul | Jumlah |
|---|---|
| Admin — Daftar Order | 79 |
| Shipper — Cari Penawaran | 74 |
| Admin — Cari Penawaran | 52 |
| Admin — Validasi Akun | 50 |
| Admin — Pengajuan Lelang | 39 |
| Shipper — Pengajuan Lelang | 39 |
| Shipper — Daftar Order | 39 |
| Admin — Harga & Jadwal | 35 |
| Admin — Pengaturan Akun | 26 |
| Transporter — Daftar Order - Invoice | 18 |
| Admin — Master | 15 |
| Admin — Penugasan Tracking | 14 |
| Transporter — Daftar Order | 13 |
| Transporter — Harga & Jadwal - Harga | 13 |
| Admin — Laporan | 12 |
| Admin — Setting | 12 |
| Shipper — Dashboard | 12 |
| Transporter — Pengajuan Nego | 11 |
| Admin — Dashboard | 10 |
| Transporter — Tracking Pengiriman | 10 |
| Shipper — Push Notif | 9 |
| Transporter — Harga & Jadwal - Jadwal | 8 |
| Admin — Push Notif | 7 |
| Shipper — Akun Saya | 7 |
| Shipper — Pengajuan Nego | 7 |
| Shipper — Preference Notif | 7 |
| Transporter — Registrasi - Kelengkapan | 7 |
| Anon — Lupa Kata Sandi | 6 |
| Transporter — Akun Saya | 6 |
| Transporter — Daftar Order - Input Unit | 6 |
| Transporter — Harga & Jadwal | 6 |
| Transporter — Harga & Jadwal - Update Harga | 6 |
| Transporter — Preference Notifikasi | 6 |
| Shipper — Registrasi | 5 |
| Shipper — Laporan | 5 |
| Transporter — Harga & Jadwal - Request Jadwal | 5 |
| Anon — Login | 4 |
| Anon — Registrasi | 4 |
| Shipper-Sub — Cari Penawaran | 4 |
| Transporter — Pengajuan Lelang | 4 |
| Transporter — Daftar Order - Detail | 4 |
| Transporter — Penugasan Tracking | 4 |
| Transporter — Open Stack | 4 |
| Shipper — Analitik SCSR | 4 |
| Transporter — Daftar Order - Data Unit | 3 |
| Admin — Riwayat Nego | 2 |
| Shipper-Sub — Push Notif | 2 |
| Shipper-Sub — Laporan | 2 |
| Anon — Registrasi - Konfirmasi Email | 2 |
| Transporter — Push Notif | 2 |
| Transporter — Pengajuan Lelang - Detail | 2 |
| Transporter — Lihat Data Tracking | 2 |
| Shipper — Open Stack | 2 |
| Admin — Open Stack | 2 |
| Admin — Login | 1 |
| Shipper-Sub — Pengajuan Nego | 1 |
| Shipper — Cek Jadwal | 1 |
| Transporter-Sub — Akun Saya | 1 |
| Transporter-Sub — Daftar Order | 1 |
| Transporter-Sub — Penugasan Tracking | 1 |
| Admin — Tracking Pengiriman | 1 |
| Shipper — Harga & Jadwal - Request Jadwal | 1 |
| Transporter — Analitik SCSR | 1 |
| Admin — Analitik - Ringkasan | 1 |
| Admin — Analitik - Freight Cost | 1 |
| Admin — Analitik - On Time Delivery Rate | 1 |
| Admin — Analitik - Shipment Accuracy | 1 |
| Admin — Validasi Akun - Biaya Layanan | 1 |
| Admin — Master - Jenis Muatan | 1 |
| Admin — Master - Harga Barang | 1 |
| Admin — Master - Free Time | 1 |
| Shipper — Analitik - Ringkasan | 1 |
| Shipper — Analitik - Freight Cost | 1 |
| Shipper — Analitik - On Time Delivery Rate | 1 |
| Shipper — Analitik - Shipment Accuracy | 1 |
| Shipper — Master - Jenis Muatan | 1 |
| Shipper — Master - Harga Barang | 1 |

## Admin — Daftar Order (79)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-07-001 | Tanggal buat order = waktu order dibuat sistem (konfirmasi pesanan) | Tidak | order ada | Blocked |
| ADM-07-002 | Order muncul di list admin setelah konfirmasi pesanan dengan status ORDER BARU | Tidak | order ORDER BARU | Blocked |
| ADM-07-003 | Tombol kapal connecting nx di list order connecting (popup detail kapal) | Tidak | order jadwal connecting | Blocked |
| ADM-07-005 | Input Muatan dari daftar order -> status PROSES PERJANJIAN | Ya | order ORDER BARU | Blocked |
| ADM-07-006 | Tolak Order -> status ORDER DITOLAK | Ya | order ORDER BARU / PROSES PERJANJIAN | Blocked |
| ADM-07-008 | Input Perjanjian -> status PROSES VALIDASI | Ya | order PROSES PERJANJIAN | Blocked |
| ADM-07-012 | Dokumen aanwijzing tampil sesuai nama; tidak muncul bila status tidak aktif | Tidak | bid owner dengan aanwijzing | Belum diuji |
| ADM-07-013 | Status order mengikuti update tracking (AMBIL KONTAINER s.d DOKUMEN DIKIRIM, termasuk SJ Diterima Agen) | Ya | order dalam tracking | Blocked |
| ADM-07-014 | Status global multi-kontainer = Kapal Sandar bila ada unit masih Kapal Sandar | Ya | order >1 kontainer beda tahap | Blocked |
| ADM-07-017 | Filter status order | Tidak | order berbagai status | Blocked |
| ADM-07-019 | Filter checkbox Kapal Connecting | Tidak | order jadwal connecting | Blocked |
| ADM-07-020 | Textlink Info Tracking menampilkan no kontainer & status tracking per kontainer | Tidak | order PROSES PENUGASAN+ | Blocked |
| ADM-07-021 | Biaya tambahan tampil di list di bawah jumlah & jenis kontainer | Tidak | order dengan biaya tambahan | Blocked |
| ADM-07-022 | Lihat QR Code order PNP (Satoria) dan download QR | Tidak | order dari PNP tervalidasi | Blocked |
| ADM-07-023 | Label By PNP di info order | Tidak | order dari PNP | Blocked |
| ADM-07-024 | Edit tgl permintaan muat order PNP mengirim WA ke admin PHBID | Ya | order dari PNP | Blocked |
| ADM-07-026 | Filter tetap aktif setelah aksi sukses redirect ke daftar order | Ya | order terfilter | Blocked |
| ADM-07-027 | Reset filter menghapus filter daftar order | Tidak | order terfilter | Blocked |
| ADM-07-030 | Edit Data Order: centang Edit Data per section (Detail Order, Pemuatan, Penerima) lalu simpan | Ya | order ORDER BARU s.d sebelum SELESAI | Blocked |
| ADM-07-031 | Perubahan Edit Data Order tercatat di History Perubahan Data | Ya | order diedit admin | Blocked |
| ADM-07-032 | Datepicker tanggal & jam permintaan muat di Edit Data Order | Tidak | order dapat diedit | Blocked |
| ADM-07-041 | Alasan Batal Order wajib: alert Masukkan Alasan Batal Order | Tidak | order ORDER BARU s.d STUFFING | Blocked |
| ADM-07-042 | Submit Batalkan Order; action menu order batal jadi disabled | Ya | order ORDER BARU s.d STUFFING | Blocked |
| ADM-07-045 | Simpan edit data muatan (rule mirip input muatan) | Ya | order PROSES PERJANJIAN s.d STUFFING | Blocked |
| ADM-07-052 | Status order baru per status asal (PROSES VALIDASI tetap; KONFIRMASI UNIT/PENUGASAN/STUFFING -> KONFIRMASI UNIT) | Ya | order PROSES VALIDASI s.d STUFFING | Blocked |
| ADM-07-054 | Konfirmasi order & data muatan saat alihkan bersifat read-only | Tidak | order dialihkan | Blocked |
| ADM-07-055 | Submit alihkan: order baru dibuat; order lama DIBATALKAN, keterangan strip, menu disable | Ya | order + harga alternatif aktif | Blocked |
| ADM-07-056 | Harga saat proses update harga: label PROSES UPDATE HARGA, alert Expired, urutan harga baru dulu | Tidak | lelang proses update harga | Blocked |
| ADM-07-057 | Validasi input unit: nopol & sopir wajib, kontainer & segel unik, no kontainer maks 11 alfanumerik, telp sopir angka & - | Tidak | order KONFIRMASI UNIT | Blocked |
| ADM-07-058 | Submit input kelengkapan unit -> PROSES PENUGASAN | Ya | order KONFIRMASI UNIT | Blocked |
| ADM-07-059 | Email notif kelengkapan data unit ke bid owner | Ya | input unit sukses | Blocked |
| ADM-07-060 | WA notif kelengkapan data unit ke bid owner | Ya | input unit sukses | Blocked |
| ADM-07-062 | Edit unit hanya sebelum tracking dikerjakan (aturan sama input unit) | Ya | order belum tracking | Blocked |
| ADM-07-064 | Upload dokumen tambahan pdf/jpg/png maks 4MB, maks 10 file sekaligus | Ya | order KONFIRMASI UNIT+ | Blocked |
| ADM-07-065 | Alert Ukuran File Melebihi 4 MB dan Format file tidak sesuai | Tidak | file invalid | Belum diuji |
| ADM-07-066 | Lihat & download dokumen tambahan | Tidak | dokumen terupload | Blocked |
| ADM-07-067 | Hapus dokumen tambahan | Ya | dokumen terupload | Blocked |
| ADM-07-068 | Tambah biaya tambahan (KONFIRMASI UNIT s.d SELESAI) | Ya | order KONFIRMASI UNIT+ | Blocked |
| ADM-07-069 | Edit biaya tambahan | Ya | biaya tambahan ada | Blocked |
| ADM-07-070 | Hapus biaya tambahan | Ya | biaya tambahan ada | Blocked |
| ADM-07-072 | Beri Nilai Pengerjaan Bidder pada ORDER SELESAI tanpa batas waktu | Ya | order ORDER SELESAI | Blocked |
| ADM-07-075 | Download dokumen packing list & penanganan khusus di Detail Order | Tidak | order dengan packing list | Blocked |
| ADM-07-076 | PROSES VALIDASI membuka PERJANJIAN PENGIRIMAN dengan tanggal Menunggu Validasi PH BID | Tidak | order PROSES VALIDASI | Blocked |
| ADM-07-078 | Export perjanjian pengiriman ke PDF | Tidak | order KONFIRMASI UNIT+ | Blocked |
| ADM-07-079 | PROSES PENUGASAN membuka STATUS PENGIRIMAN dengan Tidak ada data tersedia | Tidak | order PROSES PENUGASAN | Blocked |
| ADM-07-083 | Popup info harga: harga sebelum PPn + PPn & PPh; strip untuk data lama | Tidak | order baru & lama | Blocked |
| ADM-07-084 | Tombol kapal connecting nx di Detail Order | Tidak | order jadwal connecting | Blocked |
| ADM-07-085 | Dokumen aanwijzing di Detail Order (popup / strip) | Tidak | bid owner dengan aanwijzing | Belum diuji |
| ADM-07-088 | Form Ganti Jadwal Connecting: data global + pelabuhan/kapal/voyage/ETA/ETD connecting | Tidak | order jadwal connecting | Blocked |
| ADM-07-089 | Ubah jenis Direct -> Connecting: section connecting kosong, tambah/hapus kapal connecting, label ETD/ETA | Tidak | order jadwal direct | Blocked |
| ADM-07-090 | Ubah Connecting -> Direct menghilangkan section connecting; kembali ke Connecting memulihkan data sebelumnya | Tidak | order jadwal connecting | Blocked |
| ADM-07-092 | ETD aktif setelah closing time; ETA aktif setelah ETD | Tidak | order dapat ganti jadwal | Blocked |
| ADM-07-093 | Field pelayaran default disabled; aktif via checkbox edit pelayaran | Tidak | order dapat ganti jadwal | Blocked |
| ADM-07-094 | Email perubahan jadwal ke bid owner (detail bidder, lelang, rute, jadwal lama & baru) | Ya | ganti jadwal sukses | Blocked |
| ADM-07-095 | WA perubahan jadwal ke bid owner | Ya | ganti jadwal sukses | Blocked |
| ADM-07-097 | Mundurkan status (ORDER SELESAI s.d KONFIRMASI UNIT, termasuk SJ Diterima Agen); data tahap setelahnya hilang | Ya | order tahap tracking/selesai | Blocked |
| ADM-07-098 | Edit status order hanya admin & sub user admin dengan akses | Tidak | sub user admin | Belum diuji |
| ADM-07-100 | History perubahan data order hanya bisa dilihat admin | Tidak | order pernah diubah | Blocked |
| ADM-07-104 | Invoice yang sudah dibuat/diupload tetap tersimpan saat status dimundurkan | Tidak | order dengan invoice dimundurkan | Blocked |
| ADM-07-105 | Upload tagihan via popup: maks 10 file, 4MB/file, pdf/jpg/png | Ya | order KAPAL SANDAR+ | Blocked |
| ADM-07-106 | Tabel Invoice: nama dokumen, history Buat/Upload DD/MM/YYYY, urutan pengiriman-tambahan-upload | Tidak | order dengan invoice | Blocked |
| ADM-07-107 | Buat Invoice Jasa Pengiriman | Ya | order KAPAL SANDAR+ bid owner direct | Blocked |
| ADM-07-108 | Buat invoice biaya tambahan sebelum jasa pengiriman memunculkan alert | Tidak | order tanpa invoice jasa | Blocked |
| ADM-07-109 | Kesempatan buat invoice jasa & biaya tambahan masing-masing 3x | Tidak | order dengan invoice | Blocked |
| ADM-07-110 | Informasi perusahaan (bidder) & bid owner ter-draft dan dapat diedit; ID Order disabled | Tidak | order KAPAL SANDAR+ | Blocked |
| ADM-07-111 | Nomor invoice: huruf, angka, . - / ( ) spasi; otomatis uppercase | Tidak | order KAPAL SANDAR+ | Blocked |
| ADM-07-112 | Range tanggal invoice (>= tgl validasi admin) & jatuh tempo (>= tgl invoice) | Tidak | order KAPAL SANDAR+ | Blocked |
| ADM-07-113 | Informasi pembayaran: rekening aktif (bid owner direct) / VA relasi + label 1 pintu (satu pintu) | Tidak | bid owner direct & satu pintu | Belum diuji |
| ADM-07-114 | Catatan untuk bid owner opsional dan tampil di invoice | Tidak | order KAPAL SANDAR+ | Blocked |
| ADM-07-115 | Toggle setting buat invoice (on-disabled 3x, off-enable setelah buat, off-disabled saat 0x) | Ya | order dengan invoice | Blocked |
| ADM-07-116 | Bid owner satu pintu tanpa relasi: alert Akun bank Anda belum terdaftar! | Tidak | bid owner satu pintu tanpa relasi | Belum diuji |
| ADM-07-117 | Toggle off / kesempatan habis: alert Tidak bisa buat invoice! Silahkan hubungi Admin | Tidak | order dengan invoice + toggle off | Blocked |
| ADM-07-118 | Form invoice jasa: komponen PPn & PPh default tercentang disabled; diskon opsional | Tidak | order KAPAL SANDAR+ | Blocked |
| ADM-07-119 | PPn disabled bila order membawa PPn; enabled + rekomendasi setting pajak untuk order lama; PPh enabled | Tidak | order baru & lama | Blocked |
| ADM-07-120 | Rumus PPn, PPh & Grand Total dengan/tanpa diskon | Tidak | order KAPAL SANDAR+ | Blocked |
| ADM-07-122 | Tambah biaya Lainnya menambah baris nama item & harga | Tidak | order KAPAL SANDAR+ | Blocked |
| ADM-07-123 | Form invoice biaya tambahan: diskon default tercentang, PPn/PPh opsional & editable, label Biaya tambahan | Tidak | order dengan invoice jasa | Blocked |
| ADM-07-125 | Buat Invoice Biaya Tambahan | Ya | order dengan invoice jasa | Blocked |
| ADM-07-126 | Email Dokumen Tagihan Pengiriman saat upload (ID order, harga, bid owner, file kumulatif) | Ya | upload tagihan | Blocked |

## Shipper — Cari Penawaran (74)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-07-008 | Dokumen aanwijzing tampil sesuai nama dokumen; strip bila tidak aktif | Tidak | lelang dengan & tanpa aanwijzing aktif | Blocked |
| SHP-07-009 | Download dokumen tambahan pada Syarat dan Ketentuan | Tidak | lelang dengan dokumen tambahan | Blocked |
| SHP-07-010 | Info rute: normal 1 asal 1 tujuan; multidrop 1 asal minimal 2 drop off | Tidak | lelang normal & multidrop | Blocked |
| SHP-07-011 | Info kontainer sesuai jenis dipilih; data lama PHBL 1.2 tampil kombinasi ukuran x jenis | Tidak | lelang PHBL 1.2 | Blocked |
| SHP-07-012 | Keterangan belum ada peserta yang mengajukan penawaran + email/no CS dari Setting General | Tidak | lelang tutup tanpa penawaran | Blocked |
| SHP-07-013 | Keterangan nomor lelang belum melewati batas tutup lelang + kontak CS | Tidak | lelang belum tutup | Blocked |
| SHP-07-014 | Harga penawaran default 20 data | Tidak | lelang dengan >20 penawaran | Blocked |
| SHP-07-015 | Filter harga penawaran: jenis kontainer, bidder, ETD & ETA | Tidak | lelang tutup dengan penawaran | Blocked |
| SHP-07-016 | Urutan default: tanggal efektif terbaru, harga, closing time, rating, jumlah menang, nama kapal | Tidak | penawaran dengan nilai kembar | Blocked |
| SHP-07-017 | Tombol "kapal connecting nx" pada penawaran jadwal connecting | Tidak | penawaran jadwal connecting | Blocked |
| SHP-07-018 | Semua harga tampil (tanggal mulai berlaku kapanpun); harga DPP dengan nilai PPN & PPh | Tidak | lelang tutup dengan penawaran | Blocked |
| SHP-07-019 | Info harga: keterangan tidak diinput bidder; biaya tidak termasuk merah; tanpa PPN/PPh | Tidak | penawaran dengan info harga kosong & include berbeda | Blocked |
| SHP-07-020 | Rating: bidder belum pernah menang hanya jumlah rating; bidder baru default 3.0 | Tidak | bidder baru di penawaran | Blocked |
| SHP-07-021 | Harga lama tergantikan harga baru: tombol N/A + alert "Harga sudah tidak berlaku. Mohon pilih penawaran lain" | Tidak | 2 harga sama beda tanggal mulai berlaku | Blocked |
| SHP-07-022 | Lewat closing time: tombol N/A + alert "Jadwal sudah melewati tanggal closing time..." | Tidak | penawaran lewat closing | Blocked |
| SHP-07-023 | Harga tanpa jadwal: tombol Pesan disable + tooltip "Tanyakan Ke CS PH Bid" | Tidak | harga tanpa jadwal | Blocked |
| SHP-07-024 | Lelang lewat rencana akhir kirim: tombol N/A + alert "Nomor lelang sudah melewati tgl. rencana akhir kirim..." | Tidak | lelang lewat akhir kirim | Blocked |
| SHP-07-025 | Nego diterima bidder: harga satuan + PPN/PPh berubah di list | Ya | nego diterima bidder | Blocked |
| SHP-07-026 | Tombol Nego disable pada harga tidak aktif; aktif kembali bila harga N/A aktif lagi | Tidak | harga tidak aktif | Blocked |
| SHP-07-027 | Email penawaran belum terpilih ke bidder lain (1x saat admin validasi terima order) | Ya | lelang >1 bidder, order divalidasi admin | Blocked |
| SHP-07-028 | Data harga penawaran masuk spreadsheet penarikan data penawaran | Tidak | lelang dengan penawaran | Blocked |
| SHP-07-029 | Lelang proses update harga menampilkan info PROSES UPDATE HARGA | Tidak | lelang sedang request harga | Blocked |
| SHP-07-030 | Saat request harga: klik tombol Expired memunculkan alert "Harga sudah tidak berlaku, tunggu sampai update harga..." | Tidak | lelang sedang request harga | Blocked |
| SHP-07-031 | Saat request harga: tombol Daftar Nego disable | Tidak | lelang sedang request harga | Blocked |
| SHP-07-032 | Saat request harga: klik Pesan pada harga aktif memunculkan alert tidak bisa lanjut order | Tidak | lelang sedang request harga | Blocked |
| SHP-07-033 | Setelah request berakhir: harga lama expired; filter/sortir menampilkan harga baru dulu lalu expired | Tidak | request harga sudah ditutup | Blocked |
| SHP-07-034 | Close Request Harga dengan field tanggal penutupan menghentikan request berjalan | Ya | lelang sedang request harga | Blocked |
| SHP-07-035 | Card daftar riwayat menampilkan Close Request & Tanggal Close Request | Tidak | request harga yang di-close | Blocked |
| SHP-07-036 | Integrasi PNP: harga lama tidak bisa dipesan di PNP + tooltip saat update harga | Tidak | lelang sedang request harga | Blocked |
| SHP-07-037 | Export Harga Penawaran PDF: tanggal = waktu export, email = user yang export | Tidak | lelang tutup dengan penawaran | Blocked |
| SHP-07-038 | Isi PDF: urutan, harga DPP + PPN/PPh, info harga, biaya tidak termasuk merah, ID penawaran | Tidak | lelang tutup dengan penawaran | Blocked |
| SHP-07-039 | Harga respon update tampil keterangan "(Request Harga dd/mm/yyyy)" di samping harga satuan | Tidak | harga hasil request harga | Blocked |
| SHP-07-040 | Profil Bidder: data bergabung sejak = tanggal registrasi bidder | Tidak | penawaran dengan bidder | Blocked |
| SHP-07-041 | Profil Bidder: breadcrumb & Kembali ke hasil pencarian sebelumnya | Tidak | - | Belum diuji |
| SHP-07-042 | Profil Bidder: ulasan bid owner lain dengan nama disamarkan "Bid Owner" | Tidak | bidder dengan ulasan | Blocked |
| SHP-07-044 | Nego: maksimal 5 harga, lebih memunculkan alert "Ada 5 penawaran terpilih di daftar nego..." | Tidak | >=6 harga aktif | Blocked |
| SHP-07-045 | Nego ditolak: lewat akhir kirim / ada update harga / lewat closing time (alert masing-masing) | Tidak | harga dengan kondisi tsb | Blocked |
| SHP-07-046 | Nego: harga sudah ada di daftar memunculkan alert "Harga penawaran sudah ada di Daftar Nego" | Tidak | harga sudah di daftar nego | Blocked |
| SHP-07-047 | Popup info pengajuan nego: harga Sebelum PPn + PPN & PPh; strip bila tidak ada | Tidak | harga dengan & tanpa PPN | Blocked |
| SHP-07-048 | Tombol Nego menampilkan penanda jumlah submit nego | Tidak | harga pernah dinego | Blocked |
| SHP-07-051 | Submit Daftar Nego ditolak: lewat akhir kirim / update harga / lewat closing (alert) | Tidak | harga di daftar nego dengan kondisi tsb | Blocked |
| SHP-07-053 | Email pengajuan nego ke bidder setelah submit | Ya | submit nego | Blocked |
| SHP-07-054 | WA pengajuan nego ke bidder setelah submit | Ya | submit nego | Blocked |
| SHP-07-059 | Email ke shipper saat bidder respon request jadwal hanya bila izin aktif | Ya | request jadwal direspon bidder | Blocked |
| SHP-07-060 | WA "Request Jadwal tersedia" ke bidder setelah request jadwal | Ya | request jadwal diajukan | Blocked |
| SHP-07-061 | Label "Daftar Request Jadwal : n Penawaran (Lihat Request)" di Harga Penawaran | Tidak | lelang pernah request jadwal | Blocked |
| SHP-07-062 | Daftar Request Jadwal: kolom tgl request (DD/MM/YYYY HH:MM), bidder, pelayaran, jenis, harga sebelum PPn, terima notif, status | Tidak | request jadwal tercatat | Blocked |
| SHP-07-063 | Kolom Terima Notif Ya/Tidak sesuai konfirmasi saat request | Tidak | request dengan & tanpa izin notif | Blocked |
| SHP-07-064 | Status request jadwal Menunggu Bidder berubah Tersedia setelah direspon | Ya | request jadwal direspon bidder | Blocked |
| SHP-07-065 | Respon update jadwal bidder terlihat di Cari Penawaran | Tidak | request jadwal direspon bidder | Blocked |
| SHP-07-066 | Isi Data Pesanan: breadcrumb Hasil Penawaran & tombol Batal kembali ke hasil penawaran | Tidak | harga aktif dengan jadwal | Blocked |
| SHP-07-067 | Tanggal & jam permintaan muat via datepicker dalam rentang mulai berlaku/hari ini s.d sebelum closing atau harga baru | Tidak | harga aktif dengan jadwal | Blocked |
| SHP-07-068 | Data pemuatan & penerima barang ter-draft dari lelang (kecuali nama perusahaan); multidrop per drop off | Tidak | lelang dengan data alamat | Blocked |
| SHP-07-069 | Field alamat muat/terima, kota asal & tujuan disable (termasuk multidrop) | Tidak | harga aktif dengan jadwal | Blocked |
| SHP-07-070 | Rute tampil pelabuhan asal (UN code) - pelabuhan tujuan (UN code) | Tidak | - | Belum diuji |
| SHP-07-071 | Total harga default 0, dihitung jumlah dipesan x harga satuan | Tidak | - | Belum diuji |
| SHP-07-072 | S&K dari setting S&K booking admin; wajib diceklist sebelum submit | Tidak | - | Belum diuji |
| SHP-07-073 | Nama & nomor sales opsional; nomor hanya angka, maks 1; draft nomor pertama dari lelang lama | Tidak | lelang lama dengan nomor sales | Blocked |
| SHP-07-074 | Nomor sales hanya tampil di detail order shipper & admin, tidak di bidder | Tidak | order dengan nomor sales | Blocked |
| SHP-07-075 | Submit Isi Data Pesanan: popup Konfirmasi Pesanan lalu ke Input Muatan (order dibuat) | Ya | harga aktif dengan jadwal | Blocked |
| SHP-07-076 | Nomor consignee menerima WA Rencana Dooring saja | Ya | order dengan nomor consignee sampai rencana dooring | Blocked |
| SHP-07-077 | Integrasi PNP data nama & nomor sales form booking | Tidak | order via PNP | Blocked |
| SHP-07-078 | Input Muatan: alasan Lain-lain tampil "Lain-lain (alasan)" atau "Lain-lain" bila kosong | Tidak | order baru | Blocked |
| SHP-07-079 | Input Muatan: download template excel sesuai jenis rute | Tidak | order normal & multidrop | Blocked |
| SHP-07-080 | Upload packing list maks 10 file .pdf/.jpg/.png; format lain alert "Format File Tidak Sesuai" | Ya | order baru | Blocked |
| SHP-07-081 | Preview file packing list (foto/pdf) dalam popup | Tidak | packing list terupload | Belum diuji |
| SHP-07-082 | Import muatan excel; rute tidak sesuai alert "Format excel tidak sesuai"; data invalid tidak ditampilkan | Ya | order baru + file excel | Blocked |
| SHP-07-083 | Alamat excel tidak cocok: dropdown alamat kembali ke placeholder "Pilih Alamat Tujuan / Drop Off" | Tidak | file excel alamat salah | Belum diuji |
| SHP-07-084 | Dropdown alamat tujuan dari drop off isi data pesanan; multidrop default alamat 1 | Tidak | order multidrop | Blocked |
| SHP-07-085 | Kemasan dari master kemasan; total berat per kontainer | Tidak | order baru | Blocked |
| SHP-07-086 | Checkbox "isi data seperti unit 1": tambah/hapus muatan tambahan unit lain | Tidak | order >1 unit | Blocked |
| SHP-07-088 | Input Perjanjian: dokumen & catatan opsional; tanggal default hari ini | Tidak | order PROSES PERJANJIAN | Blocked |
| SHP-07-089 | Input Perjanjian: isi detail perjanjian sesuai data shipper & bidder; tombol kapal connecting nx | Tidak | order PROSES PERJANJIAN | Blocked |
| SHP-07-090 | Input Perjanjian: tombol Kembali ke halaman sebelumnya | Tidak | order PROSES PERJANJIAN | Blocked |

## Admin — Cari Penawaran (52)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-03-006 | Download dokumen lelang yang diupload saat buat lelang | Tidak | lelang dengan dokumen | Blocked |
| ADM-03-007 | Budget pengiriman tampil sesuai data buat lelang | Tidak | lelang dengan budget | Blocked |
| ADM-03-008 | Tampilan rute normal (1 asal-1 tujuan) vs multidrop (tujuan >=2) | Tidak | lelang normal & multidrop | Blocked |
| ADM-03-009 | Semua jenis kontainer tampil; volume/deskripsi kosong ditampilkan strip | Tidak | lelang tanpa volume/deskripsi | Blocked |
| ADM-03-010 | Popup Daftar Lelang memuat semua lelang (termasuk lewat rencana akhir kirim) kecuali lelang batal | Tidak | lelang batal & lelang lewat akhir kirim | Blocked |
| ADM-03-018 | Semua harga tampil apa pun tanggal mulai berlakunya | Tidak | harga dengan mulai berlaku berbeda | Blocked |
| ADM-03-020 | Info harga kosong tampil (Info harga tidak diinputkan oleh bidder) | Tidak | harga tanpa info | Blocked |
| ADM-03-021 | Biaya tidak termasuk tampil merah; biaya termasuk/tidak tanpa PPn/PPh | Tidak | harga yang tidak mengikutkan include lelang | Blocked |
| ADM-03-022 | Bidder belum pernah menang hanya tampil jumlah rating; bidder baru rating default 3.0 | Tidak | bidder baru | Belum diuji |
| ADM-03-025 | Harga tanpa jadwal: tombol Pesan disable + tooltip Tanyakan Ke CS PH Bid | Tidak | harga tanpa jadwal | Blocked |
| ADM-03-027 | Harga satuan + PPn/PPh berubah otomatis setelah nego diterima bidder | Tidak | nego DITERIMA | Blocked |
| ADM-03-028 | Email penawaran belum terpilih ke bidder lain saat admin validasi terima order | Ya | lelang >1 bidder input harga + order divalidasi terima | Blocked |
| ADM-03-029 | Request update harga membuat harga sebelumnya expired | Ya | lelang di-request update harga | Blocked |
| ADM-03-031 | Klik tombol Expired saat proses update harga memunculkan alert | Tidak | lelang proses update harga | Blocked |
| ADM-03-032 | Tombol Daftar Nego disable saat proses update harga | Tidak | lelang proses update harga | Blocked |
| ADM-03-033 | Setelah update harga berakhir, filter/sortir menampilkan harga baru dulu lalu harga expired | Tidak | lelang selesai update harga | Blocked |
| ADM-03-034 | Integrasi PNP: harga lama tidak bisa dipesan di PNP + tooltip saat proses update harga | Tidak | lelang proses update harga + akses PNP | Blocked |
| ADM-03-035 | Dokumen aanwijzing tampil sesuai nama; strip bila status tidak aktif | Tidak | bid owner dengan aanwijzing aktif & tidak aktif | Belum diuji |
| ADM-03-037 | Request jadwal pada harga yang sama dapat diulang tanpa batas | Ya | harga aktif | Blocked |
| ADM-03-038 | Popup konfirmasi request jadwal dengan opsi terima notifikasi respon bidder | Ya | harga aktif | Blocked |
| ADM-03-039 | Push notif ke admin saat bidder merespon request jadwal (hanya jika izin diaktifkan) | Ya | request jadwal dengan izin on & off | Blocked |
| ADM-03-042 | WA Request Jadwal tersedia ke bidder setelah request jadwal | Ya | request jadwal sukses | Blocked |
| ADM-03-043 | Kolom Terima Notif tampil Ya/Tidak sesuai konfirmasi | Tidak | request jadwal dengan izin on & off | Blocked |
| ADM-03-044 | Status request Menunggu Bidder berubah Tersedia setelah bidder respon | Ya | request jadwal + respon bidder | Blocked |
| ADM-03-045 | Respon update jadwal bidder tampil di halaman Cari Penawaran | Tidak | request jadwal sudah direspon | Blocked |
| ADM-03-046 | Export Penawaran PDF: tanggal export, email user pengekspor, urutan default | Tidak | lelang dengan harga | Blocked |
| ADM-03-047 | PDF menampilkan harga DPP + PPn/PPh, info harga kosong, biaya tidak termasuk merah, ID penawaran | Tidak | lelang dengan harga | Blocked |
| ADM-03-048 | PDF menampilkan label (Request Harga dd/mm/yyyy) pada harga hasil update harga | Tidak | harga hasil update harga | Blocked |
| ADM-03-049 | Profil Bidder: breadcrumb & Kembali kembali ke hasil pencarian sebelumnya | Tidak | hasil pencarian dengan harga | Blocked |
| ADM-03-051 | Isi Data Pesanan: breadcrumb & Batal kembali ke hasil penawaran | Tidak | harga dapat dipesan | Blocked |
| ADM-03-052 | Range tanggal permintaan muat (mulai berlaku/hari ini s.d sebelum closing time/harga terbaru) | Tidak | harga dengan jadwal | Blocked |
| ADM-03-053 | Data pemuatan & penerima barang ter-draft dari lelang (kecuali nama perusahaan; multidrop per drop) | Tidak | lelang dengan data pemuatan/penerima | Blocked |
| ADM-03-054 | Rute format UN Code; total harga = jumlah dipesan x harga satuan (default 0) | Tidak | harga dapat dipesan | Blocked |
| ADM-03-055 | S&K diambil dari setting S&K Booking | Tidak | S&K booking terisi | Belum diuji |
| ADM-03-056 | Submit isi data pesanan -> popup konfirmasi pesanan -> halaman Input Muatan (order dibuat) | Ya | harga aktif dengan jadwal | Blocked |
| ADM-03-057 | Nama & nomor sales opsional; nomor hanya angka, maks 1 nomor | Tidak | - | Belum diuji |
| ADM-03-058 | Nomor sales ter-draft dari lelang lama (hanya nomor pertama) | Tidak | lelang lama dengan nomor sales | Blocked |
| ADM-03-059 | Nomor sales tampil di detail order bid owner & admin, tidak di bidder | Tidak | order dengan nomor sales | Blocked |
| ADM-03-060 | WA tracking (ambil kontainer s.d dooring) ke nomor sales | Ya | order dengan nomor sales + update tracking | Blocked |
| ADM-03-061 | Alamat pemuatan/penerimaan, kota asal & tujuan disable di isi data pesanan admin (termasuk multidrop) | Tidak | harga dapat dipesan | Blocked |
| ADM-03-062 | Integrasi API PNP untuk nama & nomor sales | Tidak | akses PNP | Belum diuji |
| ADM-03-063 | Input Muatan: alasan Lain-lain tampil Lain-lain (alasan) atau Lain-lain saja | Tidak | order ORDER BARU | Blocked |
| ADM-03-064 | Download template Excel muatan sesuai jenis rute order | Tidak | order ORDER BARU | Blocked |
| ADM-03-065 | Upload packing list maks 10 file pdf/jpg/png; alert Format File Tidak Sesuai | Ya | order ORDER BARU | Blocked |
| ADM-03-066 | Preview file packing list dalam popup (foto & pdf) | Tidak | packing list terupload | Belum diuji |
| ADM-03-067 | Import muatan Excel sesuai jenis rute; alert Format excel tidak sesuai; data tidak sesuai tidak ditampilkan | Ya | order ORDER BARU + file excel | Blocked |
| ADM-03-068 | Dropdown alamat tujuan dari drop off; reset ke placeholder bila alamat excel tidak cocok | Tidak | order multidrop | Blocked |
| ADM-03-069 | Kemasan dari master kemasan; total berat dihitung per kontainer | Tidak | master kemasan aktif | Blocked |
| ADM-03-070 | Multidrop default menampilkan alamat 1 | Tidak | order multidrop | Blocked |
| ADM-03-071 | Checkbox isi data seperti unit 1 menambah/menghapus muatan tambahan di unit lain | Tidak | order >1 unit | Blocked |
| ADM-03-072 | Input Perjanjian: dokumen & catatan opsional, tanggal default hari ini, Kembali ke halaman sebelumnya | Ya | order PROSES PERJANJIAN | Blocked |
| ADM-03-073 | Isi detail perjanjian pengiriman hardcode menyesuaikan bid owner & bidder | Tidak | order PROSES PERJANJIAN | Blocked |

## Admin — Validasi Akun (50)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-11-002 | Pre Register: akun pindah ke Validasi Bid Owner/Bidder setelah Aktifkan Akun | Ya | akun registrasi baru | Blocked |
| ADM-11-004 | Validasi Bid Owner: akun aktivasi masuk status MENUNGGU | Ya | bid owner baru aktivasi | Blocked |
| ADM-11-005 | Validasi Bid Owner: label belum mengisi kelengkapan pendaftaran | Tidak | bid owner belum lengkap | Belum diuji |
| ADM-11-007 | Validasi Bid Owner: download NPWP, SIUP, identitas, logo | Tidak | bid owner dengan dokumen | Blocked |
| ADM-11-008 | Validasi Bid Owner: admin isi kelengkapan registrasi (field required wajib) | Ya | bid owner belum lengkap | Blocked |
| ADM-11-009 | Validasi Bid Owner: terima -> akun aktif & masuk dropdown bid owner | Ya | bid owner MENUNGGU | Blocked |
| ADM-11-010 | Validasi Bid Owner: tolak -> akun tidak aktif | Ya | bid owner MENUNGGU | Blocked |
| ADM-11-011 | Notif akun berhasil diaktifkan ke bid owner | Ya | bid owner divalidasi | Blocked |
| ADM-11-012 | Notif perubahan data bid owner ke admin | Ya | bid owner ubah akun saya | Blocked |
| ADM-11-013 | Tombol Verifikasi Perubahan Data (oranye belum, disable sudah) | Tidak | bid owner dengan perubahan data | Blocked |
| ADM-11-014 | Verifikasi perubahan bid owner: hanya field berubah editable, admin bisa koreksi, simpan | Ya | bid owner dengan perubahan data | Blocked |
| ADM-11-015 | Tolak perubahan bid owner wajib catatan | Tidak | bid owner dengan perubahan data | Blocked |
| ADM-11-016 | Email perubahan data ditolak (memuat catatan) ke bid owner | Ya | perubahan ditolak | Blocked |
| ADM-11-017 | Riwayat perubahan data di detail bid owner | Tidak | bid owner pernah ubah data | Blocked |
| ADM-11-018 | Setting metode pembayaran Direct/Satu Pintu (baru Pilih Metode; lama default Direct) | Ya | bid owner | Blocked |
| ADM-11-019 | Edit email bid owner + konfirmasi Apakah anda yakin mengubah email user? | Ya | bid owner uji | Blocked |
| ADM-11-020 | Validasi Bidder: akun aktivasi masuk status MENUNGGU | Ya | bidder baru aktivasi | Blocked |
| ADM-11-021 | Validasi Bidder: label belum mengisi kelengkapan pendaftaran | Tidak | bidder belum lengkap | Belum diuji |
| ADM-11-022 | Validasi Bidder: tanggal register dari aktivasi | Tidak | bidder ada | Belum diuji |
| ADM-11-023 | Validasi Bidder: download NPWP, SIUP, logo | Tidak | bidder dengan dokumen | Blocked |
| ADM-11-024 | Validasi Bidder: admin isi kelengkapan registrasi (field required wajib) | Ya | bidder belum lengkap | Blocked |
| ADM-11-026 | Validasi Bidder: terima -> akun aktif & masuk dropdown bidder | Ya | bidder MENUNGGU | Blocked |
| ADM-11-027 | Notif akun berhasil diaktifkan ke bidder | Ya | bidder divalidasi | Blocked |
| ADM-11-028 | Notif perubahan data bidder ke admin | Ya | bidder ubah akun saya | Blocked |
| ADM-11-029 | Tombol Verifikasi Perubahan Data bidder (oranye/disable) | Tidak | bidder dengan perubahan data | Blocked |
| ADM-11-030 | Verifikasi perubahan bidder: hanya field berubah editable, admin bisa koreksi, simpan | Ya | bidder dengan perubahan data | Blocked |
| ADM-11-031 | Tolak perubahan bidder wajib catatan | Tidak | bidder dengan perubahan data | Blocked |
| ADM-11-032 | Email perubahan data ditolak ke bidder | Ya | perubahan ditolak | Blocked |
| ADM-11-033 | Riwayat perubahan data di detail bidder | Tidak | bidder pernah ubah data | Blocked |
| ADM-11-034 | Setting rekening aktif bidder on/off (default baris pertama; baris baru default off) | Ya | bidder dengan >=2 rekening | Blocked |
| ADM-11-036 | Rekening on tampil di informasi pembayaran invoice, off tidak | Tidak | bidder dengan rekening on & off | Belum diuji |
| ADM-11-037 | Hanya admin dapat setting status rekening, bidder tidak | Tidak | akun bidder | Belum diuji |
| ADM-11-048 | Galeri perusahaan: Tidak Ada Data Tersedia / foto bisa dibuka | Tidak | bidder dengan & tanpa galeri | Belum diuji |
| ADM-11-050 | Hidden ulasan -> tidak tampil di profil sisi bid owner & bidder | Ya | bidder dengan ulasan | Blocked |
| ADM-11-051 | Tampilkan ulasan kembali -> tampil lagi di sisi bid owner & bidder | Ya | ulasan hidden | Blocked |
| ADM-11-053 | Setting status dokumen aanwijzing (waiting/aktif/tidak aktif) dan efek tampil di halaman terkait | Ya | bid owner | Blocked |
| ADM-11-054 | Upload dokumen aanwijzing PDF maks 4MB | Ya | bid owner | Blocked |
| ADM-11-055 | Nama dokumen aanwijzing tampil di pilih peserta, detail lelang, batalkan lelang, detail order | Tidak | aanwijzing aktif | Belum diuji |
| ADM-11-058 | Default peserta = semua bidder aktif kecuali yang dikunci bid owner lain | Tidak | bid owner | Belum diuji |
| ADM-11-059 | Setting peserta lelang bid owner (centang/uncentang bidder) | Ya | bid owner | Blocked |
| ADM-11-061 | Bidder baru aktif otomatis menjadi peserta semua bid owner | Ya | bidder baru divalidasi | Blocked |
| ADM-11-064 | Bid owner Direct di halaman relasi: tombol aksi & tambah relasi disabled | Tidak | bid owner diubah Direct dengan relasi | Belum diuji |
| ADM-11-069 | 1 bidder dapat jadi relasi di banyak bid owner | Ya | >=2 bid owner satu pintu | Blocked |
| ADM-11-070 | VA relasi aktif tampil di invoice; tidak aktif tidak | Tidak | relasi aktif & tidak aktif | Belum diuji |
| ADM-11-071 | Setting relasi satu pintu hanya oleh admin | Tidak | - | Belum diuji |
| ADM-11-072 | Preference Notifikasi: admin atur push & email notif bid owner dan bidder | Ya | bid owner & bidder | Blocked |
| ADM-11-074 | Centang/uncentang menentukan pengguna menerima notif tersebut | Ya | bid owner/bidder uji | Blocked |
| ADM-11-075 | Preferensi admin tersinkron dengan tampilan preferensi di sisi pengguna | Ya | bid owner/bidder | Blocked |
| ADM-11-076 | Notif dimatikan berlabel Tidak Aktif di halaman detail | Tidak | preferensi off | Belum diuji |
| ADM-11-077 | Email notif menampilkan nomor referensi atau strip (daftar notif admin terkait) | Ya | order dengan & tanpa no referensi | Blocked |

## Admin — Pengajuan Lelang (39)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-04-009 | Lelang pindah Perlu Update Harga saat ada harga diupdate dan ke Lelang Tutup setelah lewat tgl tutup update | Ya | lelang proses update harga | Blocked |
| ADM-04-010 | Lelang batal tetap muncul di list pengajuan lelang | Tidak | lelang batal | Blocked |
| ADM-04-011 | Download dokumen lelang di halaman detail pengajuan lelang | Tidak | lelang dengan dokumen | Blocked |
| ADM-04-020 | Edit data lelang: rencana akhir kirim tanpa batas; alamat/kota & tambah kontainer s.d rencana akhir kirim | Ya | lelang aktif | Blocked |
| ADM-04-022 | Edit ditolak proses update harga: alert Tidak bisa edit! Lelang masih proses update harga | Tidak | lelang proses update harga | Blocked |
| ADM-04-023 | Lelang sudah ada order: nomor, tgl buka & tutup tidak bisa diedit + alert sudah ada order | Tidak | lelang dengan order | Blocked |
| ADM-04-024 | Lelang sudah ada input harga: alamat asal & tujuan tidak bisa diedit | Tidak | lelang dengan harga | Blocked |
| ADM-04-025 | History edit lelang berlabel by admin dengan email admin pengedit | Tidak | lelang diedit admin | Blocked |
| ADM-04-026 | Simpan edit field yang diizinkan (nomor, tanggal, kota, alamat, PIC, volume & deskripsi) | Ya | lelang aktif | Blocked |
| ADM-04-027 | Nomor lelang hanya huruf & / - # ( ) +; selain itu alert Tidak Bisa Input Simbol | Tidak | - | Belum diuji |
| ADM-04-028 | Dokumen aanwijzing di halaman edit tampil popup / strip bila tidak aktif | Tidak | bid owner dengan aanwijzing | Belum diuji |
| ADM-04-031 | Tambah peserta ditolak proses update harga (alert) | Tidak | lelang proses update harga | Blocked |
| ADM-04-034 | Simpan tambah peserta: bidder baru bisa input harga, tidak menerima notif pengajuan lelang | Ya | lelang aktif + bidder belum diundang | Blocked |
| ADM-04-035 | Dokumen aanwijzing di halaman tambah peserta (popup / strip) | Tidak | bid owner dengan aanwijzing | Belum diuji |
| ADM-04-039 | Batalkan ditolak proses update harga (alert) | Tidak | lelang proses update harga | Blocked |
| ADM-04-041 | WA lelang dibatalkan ke semua bidder diundang (batal sebelum tutup lelang) | Ya | lelang dibuka dibatalkan | Blocked |
| ADM-04-042 | Email lelang dibatalkan ke bidder yang sudah input harga (batal setelah tutup lelang) | Ya | lelang ditutup dengan harga dibatalkan | Blocked |
| ADM-04-043 | Lelang batal masih dapat dipakai pada history data lelang saat buat lelang | Tidak | lelang batal | Blocked |
| ADM-04-045 | Dokumen aanwijzing di halaman batalkan lelang (popup / strip) | Tidak | bid owner dengan aanwijzing | Belum diuji |
| ADM-04-047 | Request harga: kategori Request Update Harga (sudah ada harga) / Request Input Harga (belum) di bidder | Ya | lelang ditutup dengan & tanpa harga | Blocked |
| ADM-04-048 | Request harga ditolak untuk lelang batal | Tidak | lelang batal | Blocked |
| ADM-04-050 | Request ulang hanya setelah lewat tgl tutup request sebelumnya | Tidak | lelang pernah request harga | Blocked |
| ADM-04-051 | Tanggal Tutup Request Harga maksimal tgl rencana akhir kirim | Tidak | lelang ditutup | Blocked |
| ADM-04-053 | Default checkbox tercentang untuk Telah Input Penawaran/Harga dan dapat diubah | Tidak | lelang dengan variasi status | Blocked |
| ADM-04-054 | Label (No Respon) pada bidder yang tidak merespon request sebelumnya | Tidak | request sebelumnya tanpa respon | Belum diuji |
| ADM-04-055 | Request ulang tetap bisa walau semua peserta No Respon | Ya | request sebelumnya semua No Respon | Blocked |
| ADM-04-056 | Email request update/input harga ke bidder yang diundang saja | Ya | request harga sukses | Blocked |
| ADM-04-057 | WA request update/input harga ke bidder yang diundang saja | Ya | request harga sukses | Blocked |
| ADM-04-058 | Lelang di-request harga tampil di tab Perlu Update Harga (ada harga) / Perlu Input Harga (belum) | Ya | request harga sukses | Blocked |
| ADM-04-059 | Harga tidak langsung expired; expired saat tgl tutup request harga berakhir | Ya | request harga berjalan | Blocked |
| ADM-04-060 | Bid owner klik Pesan saat request harga berjalan memunculkan alert | Tidak | request harga berjalan | Blocked |
| ADM-04-061 | Harga Telah Lama Expired diupdate melalui input harga baru | Tidak | bidder dengan harga expired semua | Blocked |
| ADM-04-062 | Close Request Harga menghentikan request berjalan dengan field tanggal penutupan | Ya | request harga berjalan | Blocked |
| ADM-04-063 | Setelah close, harga request yang sudah masuk tampil; harga lama tetap expired | Tidak | request harga di-close | Blocked |
| ADM-04-064 | Card riwayat menampilkan Close Request & Tanggal Close Request | Tidak | request harga di-close | Blocked |
| ADM-04-065 | Dokumen aanwijzing di halaman request harga (popup / strip) | Tidak | bid owner dengan aanwijzing | Belum diuji |
| ADM-04-067 | Halaman History Request Harga: tgl request, tgl tutup, peserta diundang; terbaru di atas | Tidak | lelang pernah request harga | Blocked |
| ADM-04-068 | Riwayat request harga mencatat aksi close request | Tidak | request harga di-close | Blocked |
| TRP-06-027 | Penarikan data keaktifan bidder ke spreadsheet (tgl ikut lelang/order, total lelang/order/kontainer/customer/harga) | Tidak | Bidder Aktif/Tidak Aktif dgn histori lelang & order | Blocked |

## Shipper — Pengajuan Lelang (39)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-08-006 | Detail: download dokumen lelang | Tidak | lelang dengan dokumen | Blocked |
| SHP-08-014 | Nomor lelang tidak boleh sama dengan lelang lain | Tidak | lelang eksisting | Blocked |
| SHP-08-017 | Urutan tanggal buka/tutup lelang/rencana mulai/rencana akhir kirim (default hari ini) | Tidak | - | Belum diuji |
| SHP-08-018 | Pilih history data lelang mengisi seluruh data lelang | Tidak | lelang lama | Blocked |
| SHP-08-019 | History by range tanggal maks 90 hari; dropdown dinamis maks 200 + alert "Ada (n) data lelang tidak tampil..."; format Nomor/Rute/PIC | Tidak | >200 lelang dalam range (untuk alert) | Blocked |
| SHP-08-023 | Tanggal permintaan muat wajib mengisi jam | Tidak | - | Belum diuji |
| SHP-08-025 | Simpan tanpa jenis kontainer memunculkan alert "Pilih Jenis Kontainer" | Tidak | - | Belum diuji |
| SHP-08-027 | History dari data lama PHBL 1.2: field yang belum ada tampil kosong | Tidak | lelang PHBL 1.2 | Blocked |
| SHP-08-028 | Data lelang masuk spreadsheet penarikan data lelang (per jenis kontainer, tanpa lelang batal) | Tidak | lelang multi-kontainer | Blocked |
| SHP-08-030 | Kembali (tombol & breadcrumb) ke Buat Lelang dengan data tetap terisi | Tidak | form lelang valid | Blocked |
| SHP-08-031 | Urutan bidder default rating tertinggi & jumlah menang terbanyak | Tidak | >=2 bidder aktif | Belum diuji |
| SHP-08-032 | Checkbox Pilih Semua mencentang semua bidder; uncheck satu bidder melepas Pilih Semua | Tidak | >=2 bidder aktif | Belum diuji |
| SHP-08-033 | Rekomendasi bidder dari iklan berbayar aktif; klik mencentang bidder; hilang bila tidak ada | Tidak | iklan berbayar aktif | Belum diuji |
| SHP-08-034 | Bidder dikunci untuk shipper lain atau di-hidden untuk shipper ini tidak tampil | Tidak | bidder khusus/hidden | Belum diuji |
| SHP-08-035 | Card bidder aktif: nama alias, lokasi, rating, jumlah menang | Tidak | bidder aktif | Belum diuji |
| SHP-08-037 | Email undangan lelang ke bidder yang diundang | Ya | submit lelang | Blocked |
| SHP-08-038 | WA undangan lelang ke bidder yang diundang | Ya | submit lelang | Blocked |
| SHP-08-039 | Pilih Peserta: dokumen aanwijzing tampil (popup) atau strip | Tidak | lelang dengan aanwijzing | Blocked |
| SHP-08-041 | Lelang sudah batal: alert "Tidak bisa batal! Lelang sudah dibatalkan" | Tidak | lelang batal | Blocked |
| SHP-08-042 | Lelang proses update harga: alert "Tidak bisa batal! Lelang masih proses update harga" | Tidak | lelang sedang request harga | Blocked |
| SHP-08-043 | Alasan batal wajib dipilih; Lainnya + Catatan Lelang Dibatalkan | Tidak | lelang tanpa order | Blocked |
| SHP-08-044 | Batal sebelum tutup lelang: WA lelang dibatalkan ke semua bidder diundang | Ya | lelang dibuka tanpa order | Blocked |
| SHP-08-045 | Batal setelah tutup lelang: email lelang dibatalkan ke bidder yang input harga | Ya | lelang tutup dengan penawaran tanpa order | Blocked |
| SHP-08-046 | Lelang batal tetap tersedia di history data lelang saat buat lelang | Tidak | lelang batal | Blocked |
| SHP-08-048 | Halaman Batalkan Lelang: dokumen aanwijzing popup atau strip | Tidak | lelang dengan aanwijzing | Blocked |
| SHP-08-049 | Minta Update Harga hanya untuk lelang ditutup dan tidak batal | Tidak | lelang dibuka/batal | Blocked |
| SHP-08-051 | Lewat rencana akhir kirim: alert "Tidak bisa request harga! Lelang sudah melewati tgl. rencana akhir kirim" | Tidak | lelang lewat akhir kirim | Blocked |
| SHP-08-052 | Request ulang hanya setelah tutup request sebelumnya; tetap bisa bila semua peserta No Respon | Tidak | lelang pernah request harga | Blocked |
| SHP-08-053 | Tanggal Tutup Request Harga maksimal tanggal rencana akhir kirim | Tidak | lelang tutup | Blocked |
| SHP-08-055 | Label "(No Respon)" untuk bidder yang tidak merespon request sebelumnya | Tidak | request sebelumnya tanpa respon | Belum diuji |
| SHP-08-056 | Email request update/input harga ke bidder yang diundang | Ya | request harga diajukan | Blocked |
| SHP-08-057 | WA request update/input harga ke bidder yang diundang | Ya | request harga diajukan | Blocked |
| SHP-08-058 | Harga lama expired saat tanggal tutup request berakhir (bukan langsung) | Ya | request harga berjalan | Blocked |
| SHP-08-059 | Close Request Harga dengan field tanggal penutupan | Ya | request harga berjalan | Blocked |
| SHP-08-060 | Card daftar riwayat: Close Request & Tanggal Close Request | Tidak | request harga di-close | Blocked |
| SHP-08-061 | Halaman Request Harga: dokumen aanwijzing atau strip | Tidak | lelang dengan aanwijzing | Blocked |
| SHP-08-062 | Action menu History Request Harga muncul bila lelang pernah request harga | Tidak | lelang pernah request harga | Blocked |
| SHP-08-063 | History Request Harga: tanggal request, tanggal tutup, peserta diundang; terbaru di atas | Tidak | lelang >=2 kali request harga | Blocked |
| SHP-08-064 | History mencatat close request harga | Tidak | request harga di-close | Blocked |

## Shipper — Daftar Order (39)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-10-002 | Action menu ORDER BARU: Edit Data Order, Batalkan Order, Ganti Jadwal | Tidak | order ORDER BARU | Blocked |
| SHP-10-003 | Edit Data Order (edit muatan; tanggal permintaan muat wajib jam) | Ya | order ORDER BARU | Blocked |
| SHP-10-004 | Ganti Jadwal pada ORDER BARU | Ya | order ORDER BARU | Blocked |
| SHP-10-005 | Input muatan: status PROSES PERJANJIAN; menu Input Perjanjian, Edit Muatan, Batalkan Order | Ya | order ORDER BARU | Blocked |
| SHP-10-006 | Input perjanjian: status PROSES VALIDASI; menu Edit Muatan | Ya | order PROSES PERJANJIAN | Blocked |
| SHP-10-007 | Admin validasi terima: status KONFIRMASI UNIT; menu Download Dokumen, Biaya Tambahan | Ya | order PROSES VALIDASI | Blocked |
| SHP-10-008 | Admin validasi tolak: status ORDER DITOLAK | Ya | order PROSES VALIDASI | Blocked |
| SHP-10-009 | Bidder konfirmasi unit: status PROSES PENUGASAN; menu Lihat Data Unit, Download Dokumen, Biaya Tambahan | Ya | order KONFIRMASI UNIT | Blocked |
| SHP-10-010 | Download Dokumen: popup unduh dokumen yang diupload bidder | Tidak | order KONFIRMASI UNIT ke atas dengan dokumen | Blocked |
| SHP-10-011 | Biaya Tambahan: input, edit, hapus biaya tambahan | Ya | order KONFIRMASI UNIT ke atas | Blocked |
| SHP-10-012 | Biaya tambahan: harga per item tidak boleh 0 | Tidak | order KONFIRMASI UNIT ke atas | Blocked |
| SHP-10-013 | Biaya tambahan tampil di list order di bawah jumlah & jenis kontainer | Tidak | order dengan biaya tambahan | Blocked |
| SHP-10-014 | Lihat Data Unit membuka halaman kelengkapan unit | Tidak | order PROSES PENUGASAN ke atas | Blocked |
| SHP-10-015 | Status tracking: AMBIL KONTAINER, STUFFING (semua unit), KAPAL BERLAYAR, KAPAL SANDAR, RENCANA DOORING, DOORING (semua unit), SJ DITERIMA AGEN, DOKUMEN DIKIRIM | Ya | order dengan tracking oleh bidder | Blocked |
| SHP-10-016 | Multi kontainer: status global Kapal Sandar bila masih ada kontainer Kapal Sandar | Tidak | order multi-kontainer beda tahap | Blocked |
| SHP-10-017 | Action menu status tracking: Lihat Data Unit, Download Dokumen, Biaya Tambahan | Tidak | order tahap tracking | Blocked |
| SHP-10-018 | Penugasan selesai dikunci: ORDER SELESAI dengan menu Beri Nilai Pengerjaan Bidder | Ya | order semua tracking selesai | Blocked |
| SHP-10-019 | Beri Nilai Pengerjaan Bidder (rating) maks H+7 setelah selesai; setelahnya menu hilang | Ya | order ORDER SELESAI <=7 hari | Blocked |
| SHP-10-020 | Tombol "kapal connecting nx" pada order jadwal connecting | Tidak | order connecting | Blocked |
| SHP-10-021 | Dokumen aanwijzing tampil; tidak muncul bila tidak aktif | Tidak | order dengan aanwijzing | Blocked |
| SHP-10-027 | Order Satoria via PNP: menu Lihat QR Code & download QR | Tidak | order PNP tervalidasi | Blocked |
| SHP-10-028 | Edit tanggal permintaan muat order PNP oleh PNP/Admin mengirim WA ke admin PHBID | Ya | order PNP | Blocked |
| SHP-10-029 | Label "By PNP" di info order | Tidak | order PNP | Blocked |
| SHP-10-030 | Data order masuk spreadsheet saving cost (tanpa order batal/ditolak; rumus saving cost) | Tidak | order berjalan | Blocked |
| SHP-10-031 | Filter dipertahankan setelah Kembali / aksi Edit Muatan, Batalkan Order, Penilaian Bidder | Tidak | daftar order terfilter | Blocked |
| SHP-10-034 | Detail Order: download packing list & dokumen penanganan khusus | Tidak | order dengan packing list | Blocked |
| SHP-10-035 | Detail Order PROSES VALIDASI: tanggal validasi "Menunggu Validasi PH BID" | Tidak | order PROSES VALIDASI | Blocked |
| SHP-10-036 | Detail Order KONFIRMASI UNIT: export PDF perjanjian pengiriman; tanggal validasi admin | Tidak | order KONFIRMASI UNIT | Blocked |
| SHP-10-037 | Detail Order PROSES PENUGASAN: card tracking "Tidak ada data tersedia" | Tidak | order PROSES PENUGASAN | Blocked |
| SHP-10-038 | Detail Order tahap tracking: textlink data detail menampilkan rincian & foto tracking | Tidak | order tahap tracking | Blocked |
| SHP-10-039 | Detail Order ORDER SELESAI: Belum ada penilaian / Tidak ada penilaian (>7 hari) / bintang & ulasan | Tidak | order selesai dinilai & belum | Blocked |
| SHP-10-040 | Detail Order: popup info harga sebelum PPn + PPN/PPh; strip untuk data lama | Tidak | order lama & baru | Blocked |
| SHP-10-041 | Detail Order: dokumen aanwijzing popup atau strip | Tidak | order dengan aanwijzing | Blocked |
| SHP-10-042 | Batalkan Order (ORDER BARU s.d PROSES PERJANJIAN) mengubah status DIBATALKAN | Ya | order ORDER BARU/PROSES PERJANJIAN | Blocked |
| SHP-10-043 | Batalkan Order pada PROSES VALIDASI s.d SELESAI: alert "Tidak bisa batal! Order sudah melewati tahap perjanjian" | Tidak | order PROSES VALIDASI ke atas | Blocked |
| SHP-10-044 | Alasan Batal Order wajib: alert "Masukkan Alasan Batal Order" | Tidak | order ORDER BARU | Blocked |
| SHP-10-045 | Action menu order dibatalkan disabled | Tidak | order DIBATALKAN | Blocked |
| SHP-10-046 | Edit Data Muatan pada PROSES PERJANJIAN s.d PROSES VALIDASI | Ya | order PROSES PERJANJIAN/VALIDASI | Blocked |
| SHP-10-047 | Edit Data Muatan pada KONFIRMASI UNIT s.d SELESAI: alert "Tidak bisa edit! Order sudah melewati tahap perjanjian" | Tidak | order KONFIRMASI UNIT ke atas | Blocked |

## Admin — Harga & Jadwal (35)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-16-006 | Update harga dari tab Perlu Update Harga (ikon pena) tampil popup | Tidak | harga perlu update | Blocked |
| ADM-16-007 | Perpindahan tab: harga lama ke Butuh Jadwal/Sudah Lengkap setelah update atau lewat tutup; harga baru ke Butuh Jadwal | Ya | harga perlu update | Blocked |
| ADM-16-009 | Update Jadwal (tombol aktif sebelum respon) ke halaman Update Jadwal | Ya | request jadwal belum direspon | Blocked |
| ADM-16-010 | Update jadwal ditolak harga expired: alert Tidak bisa update! Harga telah expired | Tidak | request jadwal harga expired | Blocked |
| ADM-16-011 | Update jadwal ditolak lewat rencana akhir kirim (aktif lagi bila diperpanjang) | Tidak | request jadwal lelang lewat akhir kirim | Blocked |
| ADM-16-012 | Update jadwal ditolak ada request jadwal terbaru ID harga sama | Tidak | request jadwal ganda | Blocked |
| ADM-16-014 | Tombol Update disable untuk harga yang dihapus admin | Tidak | harga dihapus | Blocked |
| ADM-16-015 | Tambah jadwal lagi setelah respon lewat halaman Tambah Jadwal | Tidak | request jadwal sudah direspon | Blocked |
| ADM-16-016 | Navigasi dari Pengajuan Lelang terfilter; filter tetap setelah aksi/kembali; reset filter | Tidak | harga terfilter | Blocked |
| ADM-16-017 | Tambah harga penawaran (buka lelang s.d sebelum rencana akhir kirim) | Ya | lelang aktif + bidder peserta | Blocked |
| ADM-16-018 | Input harga ditolak lewat rencana akhir kirim | Tidak | lelang lewat akhir kirim | Blocked |
| ADM-16-019 | Biaya Termasuk ter-draft dari lelang dan dapat diubah | Tidak | lelang dengan biaya termasuk | Blocked |
| ADM-16-020 | Pilihan lelang hanya yang aktif; lelang batal tidak muncul | Tidak | lelang aktif & batal | Blocked |
| ADM-16-023 | Kolom PPn/PPh tampil di semua rute; data lama strip | Tidak | harga lama & baru | Blocked |
| ADM-16-024 | PPn/PPh wajib: alert Masukkan Nilai PPn / Masukkan Nilai PPh | Tidak | - | Belum diuji |
| ADM-16-025 | Edit harga (PPn/PPh prefill, dapat diubah) | Ya | harga uji lelang aktif | Blocked |
| ADM-16-026 | Edit harga ditolak lewat rencana akhir kirim (alert) | Tidak | harga lelang lewat akhir kirim | Blocked |
| ADM-16-027 | Hapus harga | Ya | harga uji lelang aktif | Blocked |
| ADM-16-028 | Hapus harga ditolak lewat rencana akhir kirim (alert) | Tidak | harga lelang lewat akhir kirim | Blocked |
| ADM-16-029 | Halaman Update Harga: data lelang, harga sebelumnya, tgl request & tutup update | Tidak | harga perlu update | Blocked |
| ADM-16-030 | Checkbox Harga Seperti Sebelumnya: PPn/PPh ikut data sebelumnya (atau setting pajak untuk data lama), kolom disabled | Tidak | harga perlu update | Blocked |
| ADM-16-031 | Tgl mulai berlaku update harga disabled = hari ini | Tidak | harga perlu update | Blocked |
| ADM-16-032 | Harga sama tanpa ceklist alert Harga sama seperti sebelumnya! | Tidak | harga perlu update | Blocked |
| ADM-16-033 | Submit update harga membuat harga baru yang perlu jadwal ulang | Ya | harga perlu update | Blocked |
| ADM-16-034 | Tambah jadwal (buka lelang s.d sebelum rencana akhir kirim) | Ya | harga aktif | Blocked |
| ADM-16-035 | Tambah jadwal ditolak lewat rencana akhir kirim (alert) | Tidak | lelang lewat akhir kirim | Blocked |
| ADM-16-036 | Dropdown jenis jadwal wajib; form muncul tanpa reload | Tidak | harga aktif | Blocked |
| ADM-16-037 | Form jadwal connecting + tambah kapal connecting | Ya | harga aktif | Blocked |
| ADM-16-038 | Validasi tanggal jadwal direct (closing >= now/mulai berlaku, ETD >= closing, ETA >= ETD) | Tidak | harga aktif | Blocked |
| ADM-16-039 | Validasi tanggal jadwal connecting (termasuk ETA/ETD kapal connecting) | Tidak | harga aktif | Blocked |
| ADM-16-040 | Download template import jadwal | Tidak | - | Belum diuji |
| ADM-16-041 | Import jadwal dari Excel | Ya | harga aktif | Blocked |
| ADM-16-042 | Import jadwal maksimal 50 data | Tidak | file >50 baris | Belum diuji |
| ADM-16-043 | Edit jadwal sebelum H+2 ETA; closing boleh dimundurkan s.d mulai berlaku | Ya | jadwal belum lewat H+2 ETA | Blocked |
| ADM-16-044 | Hapus jadwal; ditolak bila sudah di-order (alert Jadwal sudah di order tidak bisa di hapus) | Ya | jadwal uji tanpa order | Blocked |

## Admin — Pengaturan Akun (26)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-14-004 | Hak Akses Bid Owner: edit | Ya | hak akses uji | Blocked |
| ADM-14-007 | Hak Akses Bid Owner: centang anak ikut centang induk; uncentang induk ikut uncentang anak | Tidak | - | Belum diuji |
| ADM-14-009 | Gating notif email sub user bid owner per akses (13 jenis) | Tidak | sub user bid owner + trigger email | Belum diuji |
| ADM-14-010 | Gating push notif sub user bid owner per akses (16 jenis) | Tidak | sub user bid owner + trigger push | Belum diuji |
| ADM-14-013 | Sub User Bid Owner: edit | Ya | sub user uji | Blocked |
| ADM-14-016 | Sub User Bid Owner: pilihan hak akses milik bid owner tsb, terbaru di atas | Tidak | bid owner dengan >=2 hak akses | Belum diuji |
| ADM-14-017 | Sub user tidak aktif tidak bisa login web | Tidak | sub user tidak aktif | Belum diuji |
| ADM-14-018 | Sub user bid owner menerima notif to bid owner utama sesuai akses (secara to) | Ya | sub user dengan akses notif | Blocked |
| ADM-14-022 | Hak Akses Bidder: edit | Ya | hak akses uji | Blocked |
| ADM-14-025 | Hak Akses Bidder: cascade centang induk/anak | Tidak | - | Belum diuji |
| ADM-14-027 | Gating notif email sub user bidder per akses (8 jenis) | Tidak | sub user bidder + trigger email | Belum diuji |
| ADM-14-028 | Gating push notif sub user bidder per akses (6 jenis) | Tidak | sub user bidder + trigger push | Belum diuji |
| ADM-14-031 | Sub User Bidder: edit | Ya | sub user uji | Blocked |
| ADM-14-034 | Sub User Bidder: pilihan hak akses milik bidder tsb, terbaru di atas | Tidak | bidder dengan >=2 hak akses | Belum diuji |
| ADM-14-035 | Sub user bidder tidak aktif tidak bisa login web | Tidak | sub user tidak aktif | Belum diuji |
| ADM-14-036 | Sub user bidder menerima notif to bidder utama sesuai akses (secara to) | Ya | sub user dengan akses notif | Blocked |
| ADM-14-040 | Hak Akses Admin: edit | Ya | hak akses uji | Blocked |
| ADM-14-044 | Gating sub user admin: Master, Setting, Validasi Akun per akses | Tidak | sub user admin dengan akses terbatas | Belum diuji |
| ADM-14-046 | Akses Harga Disembunyikan: budget pengiriman dihidden di detail/edit/tambah peserta/batalkan lelang | Tidak | sub user admin dengan akses ini | Belum diuji |
| ADM-14-047 | Gating sub user admin: Pengaturan Akun (hak akses & sub user bid owner/bidder/admin) | Tidak | sub user admin dengan akses terbatas | Belum diuji |
| ADM-14-048 | Gating notif email sub user admin per akses (28 jenis; bcc / to admin cc sub user) | Tidak | sub user admin + trigger email | Belum diuji |
| ADM-14-049 | Gating push notif sub user admin per akses (26 jenis) | Tidak | sub user admin + trigger push | Belum diuji |
| ADM-14-052 | Sub User Admin: edit | Ya | sub user uji | Blocked |
| ADM-14-055 | Sub User Admin: pilihan hak akses admin, terbaru di atas | Tidak | >=2 hak akses admin | Belum diuji |
| ADM-14-056 | Sub user admin tidak aktif tidak bisa login web | Tidak | sub user tidak aktif | Belum diuji |
| ADM-14-057 | Sub user admin menerima notif to bid owner utama sesuai akses secara BCC | Ya | sub user dengan akses notif | Blocked |

## Transporter — Daftar Order - Invoice (18)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-08-041 | Proses Invoice pada PROSES PENUGASAN–KAPAL BERLAYAR (termasuk dimundurkan) → alert 'Tidak Bisa! Proses invoice akan tersedia setelah tahap kapal sandar' | Tidak | Order tahap awal | Blocked |
| TRP-08-042 | Data invoice yg sudah dibuat/diupload tetap tersimpan setelah status dimundurkan | Ya | Order ber-invoice dimundurkan | Blocked |
| TRP-08-044 | Upload Tagihan via popup: maks 10 file/proses, 4 MB/file, pdf/jpg/png | Ya | Order KAPAL SANDAR+ | Blocked |
| TRP-08-045 | Tabel invoice: urutan invoice pengiriman, tambahan, upload + history Update Invoice Buat/Upload DD/MM/YYYY | Tidak | Order ber-invoice | Blocked |
| TRP-08-047 | Satu pintu tanpa relasi → alert 'Akun bank Anda belum terdaftar! Silahkan hubungi CS PH Bid' (jasa & biaya tambahan) | Tidak | Order shipper satu pintu tanpa relasi | Blocked |
| TRP-08-048 | Kesempatan buat invoice habis/setting admin off → alert 'Tidak bisa buat invoice! Silahkan hubungi Admin untuk mengaktifkan kembali' | Ya | Order yg invoice-nya sudah dibuat 1x | Blocked |
| TRP-08-049 | Buat Invoice Biaya Tambahan sebelum jasa pengiriman → alert 'Tidak bisa lanjut! Invoice jasa pengiriman harus dibuat terlebih dahulu!' | Tidak | Order tanpa invoice jasa | Blocked |
| TRP-08-051 | Form: info perusahaan & bid owner terdraft dan dapat diedit; ID Order otomatis disabled | Tidak | Order KAPAL SANDAR+ | Blocked |
| TRP-08-052 | Nomor invoice: hanya huruf, angka, titik, strip, garis miring, kurung, spasi; auto uppercase | Tidak | Form invoice | Blocked |
| TRP-08-053 | Tgl invoice default hari ini, range mulai tgl validasi admin; jatuh tempo ≥ tgl invoice | Tidak | Form invoice | Blocked |
| TRP-08-054 | Info pembayaran: direct = rekening aktif bidder; satu pintu = VA relasi + label 1 pintu; Catatan opsional tampil di invoice | Tidak | Shipper direct & satu pintu | Belum diuji |
| TRP-08-055 | Jasa pengiriman: PPn & PPh checked disabled, Diskon opsional, tambah Komponen Harga | Tidak | Form invoice jasa | Blocked |
| TRP-08-056 | Jasa pengiriman: PPn disabled bila order ber-PPn, enabled + rekomendasi setting pajak utk order lama; PPh dari order enabled | Tidak | Order ber-PPn & order lama | Blocked |
| TRP-08-057 | Perhitungan PPn, PPh, Grand Total dgn & tanpa diskon | Tidak | Form invoice | Blocked |
| TRP-08-060 | Tambah biaya Lainnya menambah baris nama item & harga | Tidak | Form invoice | Blocked |
| TRP-08-061 | Simpan/Generate Invoice Jasa Pengiriman → tampil di tabel invoice | Ya | Order KAPAL SANDAR+ dgn kesempatan invoice | Blocked |
| TRP-08-063 | Biaya tambahan: label "Biaya tambahan" & "Pembayaran ditransfer ke nomor tersebut" | Tidak | Form invoice biaya tambahan | Blocked |
| TRP-08-064 | Simpan/Generate Invoice Biaya Tambahan → tampil di tabel invoice | Ya | Order dgn invoice jasa | Blocked |

## Admin — Master (15)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-13-008 | Pelabuhan terpakai di lelang: hanya status yang bisa diedit | Tidak | pelabuhan terpakai | Blocked |
| ADM-13-009 | Pelabuhan terpakai: hapus ditolak alert Data sudah digunakan pada lelang | Tidak | pelabuhan terpakai | Blocked |
| ADM-13-010 | Pelabuhan: export Excel | Tidak | - | Belum diuji |
| ADM-13-025 | Data include tampil di buat lelang, buat harga, edit harga | Tidak | include aktif | Blocked |
| ADM-13-034 | Pelayaran: tambah | Ya | - | Blocked |
| ADM-13-035 | Pelayaran: edit | Ya | pelayaran uji | Blocked |
| ADM-13-036 | Pelayaran: hapus | Ya | pelayaran uji | Blocked |
| ADM-13-037 | Pelayaran: nama duplikat alert Nama Pelayaran Sudah Digunakan | Tidak | pelayaran ada | Belum diuji |
| ADM-13-045 | Jenis Kontainer terpakai di harga: hanya status editable | Tidak | jenis kontainer terpakai | Blocked |
| ADM-13-046 | Jenis Kontainer terpakai: hapus ditolak alert Data sudah digunakan pada harga | Tidak | jenis kontainer terpakai | Blocked |
| ADM-13-056 | Iklan Berbayar: edit | Ya | iklan uji | Blocked |
| ADM-13-059 | Bidder iklan tampil di pilih peserta lelang & rekomendasi buat lelang sesuai rentang tanggal | Tidak | iklan aktif | Belum diuji |
| ADM-13-066 | Petugas dengan penugasan aktif: WA disable, ganti bidder alert Petugas masih ada Pengerjaan Tracking! | Tidak | petugas ditugaskan belum dikerjakan | Blocked |
| ADM-13-067 | Petugas tanpa penugasan dapat dipindah ke bidder lain (efek profil APK & penugasan tracking) | Ya | petugas tanpa penugasan | Blocked |
| ADM-13-068 | Petugas sudah ditugaskan: hapus ditolak alert Petugas Sudah Ditugaskan | Tidak | petugas ditugaskan | Blocked |

## Admin — Penugasan Tracking (14)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-08-003 | List per order, urut terbaru ditugaskan di atas | Tidak | >=2 order ditugaskan | Bermasalah |
| ADM-08-006 | Status global multi-kontainer = Kapal Sandar | Ya | order >1 kontainer beda tahap | Blocked |
| ADM-08-008 | Kunci Penugasan Selesai -> order selesai; status list tetap status tracking terakhir | Ya | order tracking selesai | Blocked |
| ADM-08-009 | Label Kapal Connecting pada ID Order (popup); tampil kapal connecting terakhir | Tidak | order jadwal connecting | Blocked |
| ADM-08-010 | Tugaskan tracking ke petugas APK milik bidder | Ya | order PROSES PENUGASAN + petugas aktif | Blocked |
| ADM-08-011 | Edit petugas hanya sebelum tracking dikerjakan | Ya | order ditugaskan belum dikerjakan | Blocked |
| ADM-08-012 | Isi data tracking via web | Ya | order ditugaskan | Blocked |
| ADM-08-013 | Tracking harus berurutan: alert Harap Selesaikan Tracking Sebelumnya; per unit bisa lanjut | Tidak | order ditugaskan >1 tahap | Blocked |
| ADM-08-014 | Edit data tracking + upload foto tanpa batas waktu (walau order selesai) | Ya | order dengan tracking terisi | Blocked |
| ADM-08-015 | No kontainer Ambil Kontainer/Stuffing: auto kapital, alfanumerik maks 11, tanpa spasi (juga di edit) | Tidak | order tahap ambil kontainer | Blocked |
| ADM-08-016 | No telp sopir wajib, hanya angka & - | Tidak | order ditugaskan | Blocked |
| ADM-08-018 | WA penugasan tracking ke petugas | Ya | penugasan sukses | Blocked |
| ADM-08-019 | WA penugasan pertama ke petugas baru + link APK & kode verifikasi | Ya | petugas baru ditugaskan | Blocked |
| ADM-08-020 | Spreadsheet penarikan data order: label APK/ADMIN, strip dilewati, kosong belum diisi, kolom surat jalan | Ya | update tracking | Blocked |

## Transporter — Daftar Order (13)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-08-001 | Tanggal buat order = waktu order dibuat sistem (input muatan) | Tidak | Order | Blocked |
| TRP-08-002 | Order muncul di list bidder setelah divalidasi admin dgn status KONFIRMASI UNIT | Ya | Order divalidasi admin | Blocked |
| TRP-08-004 | Tombol "kapal connecting nx" pada order jadwal connecting | Tidak | Order jadwal connecting | Blocked |
| TRP-08-016 | Upload Dokumen order tanpa batas jumlah file | Ya | Order tervalidasi | Blocked |
| TRP-08-017 | Action Biaya Tambahan hanya muncul bila shipper/admin input biaya tambahan | Tidak | Order dgn & tanpa biaya tambahan | Blocked |
| TRP-08-020 | Dokumen aanwijzing di list sesuai nama; status tidak aktif → tidak muncul | Tidak | Order dari lelang ber-aanwijzing | Blocked |
| TRP-08-021 | Status order mengikuti tracking: AMBIL KONTAINER, STUFFING, KAPAL BERLAYAR, KAPAL SANDAR, RENCANA DOORING, DOORING, SJ Diterima Agen, DOKUMEN DIKIRIM | Ya | Order dgn tracking berjalan | Blocked |
| TRP-08-022 | Multi kontainer: status global Kapal Sandar bila ada kontainer masih Kapal Sandar | Ya | Order multi kontainer tahap campuran | Blocked |
| TRP-08-026 | Lihat QR Code order PNP dan download QR code | Tidak | Order PNP (satoria) tervalidasi | Blocked |
| TRP-08-027 | Label "By PNP" pada info order dari sistem PNP | Tidak | Order PNP | Blocked |
| TRP-08-028 | Filter tetap setelah Kembali dari Input Unit/Upload Dokumen/Biaya Tambahan/Proses Invoice/Detail Order | Tidak | Order hasil filter | Blocked |
| TRP-08-029 | Filter tetap setelah sukses Input Unit | Ya | Order KONFIRMASI UNIT hasil filter | Blocked |
| TRP-08-036 | Order DIBATALKAN & ORDER DITOLAK tidak tampil di list bidder | Tidak | Order batal/ditolak | Blocked |

## Transporter — Harga & Jadwal - Harga (13)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-10-024 | Tambah harga hanya antara buka lelang s.d. sebelum tutup lelang | Tidak | Lelang buka & tutup | Blocked |
| TRP-10-025 | Pilihan lelang hanya lelang aktif (bukan tutup/batal) | Tidak | Lelang aktif, tutup, batal | Blocked |
| TRP-10-026 | Biaya Termasuk terdraft dari data lelang, bisa diceklist/unceklist | Tidak | Lelang dgn biaya termasuk | Blocked |
| TRP-10-027 | Biaya laut auto terceklist & tidak bisa diunceklist (tambah & edit) | Tidak | Lelang aktif | Blocked |
| TRP-10-028 | Pilihan pelayaran & jenis kontainer dari master admin | Tidak | Master pelayaran & jenis kontainer | Blocked |
| TRP-10-029 | PPn/PPh rekomendasi dari setting pajak, editable, desimal koma, >100 auto reset 100 | Tidak | Setting pajak admin | Belum diuji |
| TRP-10-030 | PPn/PPh kosong saat simpan → alert 'Masukkan Nilai PPn' / 'Masukkan Nilai PPh' | Tidak | Lelang aktif | Blocked |
| TRP-10-031 | Kolom PPn/PPh tampil di rute normal & multidrop; data lama "-" | Tidak | Lelang normal & multidrop | Blocked |
| TRP-10-032 | Simpan Tambah Harga penawaran | Ya | Lelang aktif mengundang transporter | Blocked |
| TRP-10-033 | Edit harga sebelum tutup lelang (PPn/PPh terisi nilai tersimpan, bisa diubah) | Ya | Harga pada lelang aktif | Blocked |
| TRP-10-034 | Edit harga setelah tutup lelang → alert "Harga penawaran sudah melewati tanggal tutup lelang" | Tidak | Harga pada lelang tutup | Blocked |
| TRP-10-035 | Hapus harga sebelum tutup lelang | Ya | Harga pada lelang aktif | Blocked |
| TRP-10-036 | Hapus harga setelah tutup lelang → alert "Harga penawaran sudah melewati tanggal tutup lelang" | Tidak | Harga pada lelang tutup | Blocked |

## Admin — Laporan (12)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-10-004 | Export Excel Daftar History Lelang | Tidak | hasil pencarian | Belum diuji |
| ADM-10-007 | Logistik: hanya order tervalidasi admin | Tidak | order tervalidasi & belum | Blocked |
| ADM-10-008 | Logistik: tanggal order, harga = satuan x unit, harga nego tidak mengubah; terbaru di atas | Tidak | order nego | Blocked |
| ADM-10-010 | Detail Logistik multidrop: textlink Multidrop alamat drop & tgl tracking per alamat | Tidak | order multidrop | Blocked |
| ADM-10-011 | Detail Logistik: biaya tambahan tampil bila ada | Tidak | order dengan biaya tambahan | Blocked |
| ADM-10-012 | Export Excel Laporan Logistik (tgl export, total unit, grand total, data sama dengan web) | Tidak | hasil pencarian | Belum diuji |
| ADM-10-016 | Owner: >1 order per lelang tampil multi-baris; lelang batal tidak tampil | Tidak | lelang dengan >1 order | Blocked |
| ADM-10-017 | Owner: tanggal lelang & periode lelang | Tidak | lelang ada | Blocked |
| ADM-10-018 | Owner: perhitungan Penawaran berubah bila harga dihapus/ditambah admin | Tidak | lelang dengan harga | Blocked |
| ADM-10-019 | Owner: Harga dipilih (strip bila belum; nego tidak mengubah) | Tidak | order nego | Blocked |
| ADM-10-020 | Owner: nomor order tervalidasi (strip bila belum); terbaru di atas | Tidak | order tervalidasi | Blocked |
| ADM-10-024 | Export Excel Laporan Owner | Tidak | hasil pencarian | Belum diuji |

## Admin — Setting (12)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-12-002 | Versi & copyright APK tracking tampil di APK | Ya | - | Blocked |
| ADM-12-004 | Telp CS tampil di sidebar & footer | Ya | - | Blocked |
| ADM-12-005 | Sosial media kosong -> ikon tidak bisa diklik | Ya | - | Blocked |
| ADM-12-009 | Setting Preference admin akun utama (default aktif) menentukan notif email/push yang diterima | Ya | - | Blocked |
| ADM-12-010 | Notif dinonaktifkan berlabel Tidak Aktif di popup daftar notif | Tidak | preferensi off | Belum diuji |
| ADM-12-011 | Email: admin sebagai To; bid owner/bidder sebagai Bcc | Ya | trigger email | Blocked |
| ADM-12-012 | Push ke admin & bid owner bersamaan; masing-masing mengikuti preferensinya | Ya | trigger push | Blocked |
| ADM-12-013 | S&K Booking yang disetting tampil di halaman isi data pesanan | Ya | - | Blocked |
| ADM-12-019 | Cron reminder jam 05.00; rule trigger 0 hari = besok, 1 hari = lusa | Ya | order memenuhi trigger | Blocked |
| ADM-12-023 | Push Notifikasi OFF -> tidak ada push terkirim | Ya | - | Blocked |
| ADM-12-024 | Notifikasi WhatsApp OFF -> tidak ada WA terkirim | Ya | - | Blocked |
| ADM-12-027 | Order lama tanpa PPn/PPh menampilkan strip | Tidak | order lama | Blocked |

## Shipper — Dashboard (12)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-06-007 | Monitoring: consignee = nama perusahaan penerima barang | Tidak | order dalam rentang | Blocked |
| SHP-06-008 | Monitoring: stuffing per order (terbaru dari semua unit), dooring per unit | Tidak | order multi-unit ter-tracking | Blocked |
| SHP-06-009 | Monitoring: strip bila tracking stuffing/kapal sandar/dooring belum ada | Tidak | order belum ter-tracking | Blocked |
| SHP-06-010 | Monitoring: klik ID order membuka detail pesanan (tab baru) bagian status pengiriman | Tidak | order dalam rentang | Blocked |
| SHP-06-011 | Monitoring: sortir kolom ID order, stuffing, ETD, ETA, kapal sandar, bidder, pelabuhan tujuan | Tidak | >=2 order dalam rentang | Blocked |
| SHP-06-012 | Monitoring: auto update saat ada order baru input unit | Ya | bidder input unit saat dashboard terbuka | Blocked |
| SHP-06-013 | Monitoring: auto update tanpa refresh saat jadwal/tracking berubah | Ya | perubahan jadwal/tracking saat dashboard terbuka | Blocked |
| SHP-06-017 | Frekuensi: klik lokasi menampilkan jumlah pesanan & persentase | Tidak | order sudah input unit | Blocked |
| SHP-06-020 | Frekuensi: tanpa data hanya peta tanpa penanda | Tidak | rentang tanpa order | Blocked |
| SHP-06-021 | Frekuensi: auto update saat ada order baru input unit | Ya | bidder input unit saat dashboard terbuka | Blocked |
| SHP-06-025 | Grafik: tanpa data diagram batang tidak tampil | Tidak | rentang tanpa order | Blocked |
| SHP-06-026 | Grafik: auto refresh saat ada order baru input unit | Ya | bidder input unit saat dashboard terbuka | Blocked |

## Transporter — Pengajuan Nego (11)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-07-005 | Halaman Terima Nego: harga = nominal nego shipper, field disabled | Tidak | Nego Waiting | Blocked |
| TRP-07-006 | Submit Terima Nego → harga baru dibuat sesuai nominal nego | Ya | Nego Waiting | Blocked |
| TRP-07-007 | Halaman Tolak Nego: isi Alasan Menolak Nego | Tidak | Nego Waiting | Blocked |
| TRP-07-009 | Halaman Negosiasi Harga: field harga penawaran aktif (editable) | Tidak | Nego Waiting | Blocked |
| TRP-07-010 | Submit Negosiasi → harga baru dibuat sesuai harga counter bidder | Ya | Nego Waiting | Blocked |
| TRP-07-011 | Harga negosiasi tidak boleh < harga nego dan tidak boleh > harga awal | Tidak | Nego Waiting | Blocked |
| TRP-07-012 | WA ke bid owner: nego diterima, harga tetap | Ya | Terima nego | Blocked |
| TRP-07-013 | WA ke bid owner: nego ditolak, harga tidak berubah | Ya | Tolak nego | Blocked |
| TRP-07-014 | WA ke bid owner: nego di-counter, tersedia harga baru | Ya | Negosiasi | Blocked |
| TRP-07-015 | PPN & PPh tampil disabled mengikuti harga yang dinego pada respon Diterima & Negosiasi | Tidak | Nego dari harga ber-PPN/PPh | Blocked |
| TRP-07-016 | Data lama: PPN/PPh kosong placeholder 0 disabled, respon nego tetap bisa | Tidak | Nego dari harga lama tanpa PPN/PPh | Blocked |

## Admin — Dashboard (10)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-17-001 | Monitoring: data order status Proses Penugasan s.d Order Selesai | Tidak | order PROSES PENUGASAN+ | Blocked |
| ADM-17-004 | Monitoring: export Excel sesuai filter | Tidak | hasil filter | Belum diuji |
| ADM-17-008 | Monitoring: auto update untuk order baru & perubahan jadwal/tracking tanpa refresh | Tidak | order berubah saat halaman terbuka | Blocked |
| ADM-17-009 | Frekuensi: data jumlah order Proses Penugasan s.d Order Selesai | Tidak | order PROSES PENUGASAN+ | Blocked |
| ADM-17-012 | Frekuensi: zoom in/out map | Tidak | - | Belum diuji |
| ADM-17-014 | Frekuensi: tanpa data hanya map tanpa penanda | Tidak | rentang tanpa data | Blocked |
| ADM-17-015 | Frekuensi: auto refresh saat ada order baru input unit | Tidak | order baru | Blocked |
| ADM-17-016 | Grafik: data jumlah order Proses Penugasan s.d Order Selesai | Tidak | order PROSES PENUGASAN+ | Blocked |
| ADM-17-020 | Grafik: tanpa data diagram tidak tampil | Tidak | rentang tanpa data | Blocked |
| ADM-17-021 | Grafik: auto refresh saat ada order baru input unit | Tidak | order baru | Blocked |

## Transporter — Tracking Pengiriman (10)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-09-014 | Edit petugas hanya bila tracking belum dikerjakan; menu hilang setelah dikerjakan | Ya | Order ditugaskan belum & sudah dikerjakan | Blocked |
| TRP-09-016 | Isi tahap loncat → alert "Harap Selesaikan Tracking Sebelumnya" | Tidak | Order ditugaskan beberapa tahap | Blocked |
| TRP-09-017 | Per unit boleh lanjut tahap berikut (ambil→stuffing, rencana dooring→dooring) tanpa menunggu unit lain | Ya | Order multi unit | Blocked |
| TRP-09-018 | No. kontainer Ambil Kontainer/Stuffing: huruf+angka maks 11, tanpa spasi/simbol, auto kapital (juga edit) | Tidak | Order ditugaskan | Blocked |
| TRP-09-019 | No. telp sopir wajib, hanya angka & "-" | Tidak | Order ditugaskan | Blocked |
| TRP-09-020 | Update SJ Diterima Agen mensyaratkan tahap sebelumnya terisi lengkap | Tidak | Order tahap Dooring | Blocked |
| TRP-09-021 | Kapal berlayar & sandar wajib; tahap lain dapat dilewati | Ya | Order ditugaskan | Blocked |
| TRP-09-022 | Edit data tracking + upload foto, tanpa batas waktu (termasuk order selesai) | Ya | Order dgn tracking terisi | Blocked |
| TRP-09-024 | WA ke petugas saat ditugaskan tracking | Ya | Petugas dgn nomor WA | Blocked |
| TRP-09-025 | WA penugasan pertama petugas baru berisi link download APK & kode verifikasi | Ya | Petugas baru belum pernah ditugaskan | Blocked |

## Shipper — Push Notif (9)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-05-003 | Terima push Perubahan Data Diterima / Ditolak | Ya | perubahan akun diproses admin | Blocked |
| SHP-05-004 | Terima push Nego Diterima / Ditolak / Dicounter | Ya | pengajuan nego direspon bidder | Blocked |
| SHP-05-005 | Terima push Jadwal Tersedia | Ya | request jadwal direspon bidder | Blocked |
| SHP-05-006 | Terima push Perjanjian Diterima / Ditolak | Ya | order PROSES VALIDASI diproses admin | Blocked |
| SHP-05-007 | Terima push Kelengkapan Data Unit | Ya | order KONFIRMASI UNIT dikonfirmasi bidder | Blocked |
| SHP-05-008 | Terima push Perubahan Jadwal | Ya | order dengan ganti jadwal | Blocked |
| SHP-05-009 | Terima push update tracking (Ambil Kontainer, Stuffing, Kapal Berlayar, Kapal Sandar, Rencana Dooring, Dooring, SJ Diterima Agen, Dokumen Dikirim) | Ya | order dalam proses tracking | Blocked |
| SHP-05-016 | Hapus Notifikasi terpilih | Ya | notifikasi uji | Blocked |
| SHP-05-017 | Tandai sebagai Dibaca untuk notifikasi terpilih | Ya | notifikasi unread uji | Blocked |

## Transporter — Harga & Jadwal - Jadwal (8)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-10-043 | Tambah jadwal lewat rencana akhir kirim → alert "Lelang sudah melewati rencana akhir kirim. Tidak bisa tambah jadwal" | Tidak | Harga pada lelang lewat akhir kirim | Blocked |
| TRP-10-046 | Validasi tgl Direct: Closing ≥ sekarang/tgl mulai berlaku; ETD ≥ Closing; ETA ≥ ETD | Tidak | Harga aktif | Blocked |
| TRP-10-049 | Validasi tgl Connecting (Closing, ETD, ETA, ETA Kapal, ETD Kapal) | Tidak | Harga aktif | Blocked |
| TRP-10-051 | Import Jadwal dari template Excel | Ya | Harga aktif + file template terisi | Blocked |
| TRP-10-052 | Import > 50 data jadwal ditolak | Tidak | File template > 50 baris | Belum diuji |
| TRP-10-054 | Edit jadwal setelah H+2 ETA tidak bisa | Tidak | Jadwal lewat H+2 ETA | Blocked |
| TRP-10-055 | Edit jadwal connecting sebelum H+2 ETA dgn aturan tanggal connecting | Ya | Jadwal connecting belum lewat H+2 ETA | Blocked |
| TRP-10-057 | Hapus jadwal ter-order → alert "Jadwal sudah di order tidak bisa di hapus" | Tidak | Jadwal ter-order | Blocked |

## Admin — Push Notif (7)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-02-004 | Notif to Admin: Konfirmasi Perubahan Data | Ya | bid owner/bidder aktif mengubah Akun Saya | Blocked |
| ADM-02-005 | Notif to Admin: PNP Edit Permintaan Muat (TEP) | Ya | order dari PNP diedit tanggal muatnya | Blocked |
| ADM-02-006 | Notif to Admin: Penilaian Order ke Bidder | Ya | order ORDER SELESAI dinilai bid owner | Blocked |
| ADM-02-007 | Notif to Admin: Dokumen Tagihan Pengiriman | Ya | upload tagihan pada Proses Invoice | Blocked |
| ADM-02-009 | Klik Cek Disini membuka halaman detail sesuai notif (mis. verifikasi perubahan data) | Ya | notif dengan tujuan detail | Blocked |
| ADM-02-013 | Hapus notifikasi terpilih | Ya | notif hasil trigger uji | Blocked |
| ADM-02-014 | Tandai notifikasi terpilih sebagai dibaca | Ya | notif unread hasil trigger uji | Blocked |

## Shipper — Akun Saya (7)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-04-002 | Login pertama setelah akun aktif memunculkan notif "Selamat datang di PHBID" | Tidak | akun baru aktif belum pernah login | Belum diuji |
| SHP-04-003 | Akun dinonaktifkan hanya bisa akses Akun Saya + notif "Akun anda dinonaktifkan" | Tidak | akun shipper dinonaktifkan admin | Belum diuji |
| SHP-04-008 | Edit dengan nomor WA milik akun lain (termasuk sub user) memunculkan alert "Nomor whatsapp sudah terdaftar di sistem" | Tidak | nomor WA akun/sub user lain | Belum diuji |
| SHP-04-009 | Tombol Edit Akun Saya disable selama perubahan belum dikonfirmasi admin | Tidak | perubahan data pending | Blocked |
| SHP-04-010 | Admin terima perubahan: data terganti dan tombol edit aktif kembali | Ya | perubahan data pending | Blocked |
| SHP-04-011 | Admin tolak perubahan: data tetap dan tombol edit aktif kembali | Ya | perubahan data pending | Blocked |
| SHP-04-012 | Email perubahan data diterima / ditolak terkirim ke bid owner | Ya | perubahan data diproses admin | Blocked |

## Shipper — Pengajuan Nego (7)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-09-003 | Bidder terima: status Diterima, harga baru = nominal nego | Ya | nego Waiting | Blocked |
| SHP-09-005 | Bidder counter: status Negosiasi, harga baru = harga counter | Ya | nego Waiting | Blocked |
| SHP-09-007 | Nominal nego kembali harus di antara nego awal dan harga asli | Tidak | nego Ditolak/Negosiasi | Blocked |
| SHP-09-008 | Nego kembali ditolak bila lewat selesai kontrak / ada update harga (alert sama dengan Daftar Nego) | Tidak | nego dengan harga tidak berlaku | Blocked |
| SHP-09-009 | Email pengajuan nego ke bidder saat nego kembali | Ya | ajukan nego kembali | Blocked |
| SHP-09-010 | WA pengajuan nego ke bidder saat nego kembali | Ya | ajukan nego kembali | Blocked |
| SHP-09-013 | Bid owner berakses Satoria: menu Pengajuan Nego disable | Tidak | akun shipper Satoria | Belum diuji |

## Shipper — Preference Notif (7)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-13-005 | Default preference email & sistem Aktif | Tidak | akun utama tanpa ubahan preference | Belum diuji |
| SHP-13-007 | Notif nonaktif menampilkan label "Tidak Aktif" di sisi kanan | Tidak | preference dinonaktifkan | Belum diuji |
| SHP-13-008 | Efek preference email: hanya menerima email yang aktif | Ya | preference email diubah + pemicu notif | Blocked |
| SHP-13-009 | Efek preference push: hanya menerima push yang aktif | Ya | preference push diubah + pemicu notif | Blocked |
| SHP-13-010 | WA ke bid owner nonaktif kecuali Lupa Kata Sandi | Ya | pemicu notif selain lupa sandi | Blocked |
| SHP-13-011 | Email tracking (Ambil Kontainer s.d Dokumen Dikirim) aktif kembali untuk akun utama | Ya | order dalam proses tracking | Blocked |
| SHP-13-012 | Email menampilkan nomor referensi (strip bila kosong) pada 12 jenis notif perjanjian/unit/jadwal/tracking | Ya | order dengan & tanpa nomor referensi | Blocked |

## Transporter — Registrasi - Kelengkapan (7)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-02-013 | Nama, Nama Perusahaan, Nomor WA terisi otomatis dari registrasi awal | Tidak | Akun teraktivasi belum lengkap | Belum diuji |
| TRP-02-014 | Field bertanda bintang wajib (Provinsi, Kota, Alamat, Logo Perusahaan) | Tidak | Akun teraktivasi belum lengkap | Belum diuji |
| TRP-02-015 | Upload Logo Perusahaan maks 4 MB format jpg/jpeg/png | Ya | File uji valid & invalid | Blocked |
| TRP-02-016 | Upload NPWP & SIUP maks 4 MB format jpg/jpeg/png/pdf | Ya | File uji valid & invalid | Blocked |
| TRP-02-017 | Pilihan Data Bank diambil dari Master Bank | Tidak | Master Bank terisi | Blocked |
| TRP-02-018 | Simpan kelengkapan → redirect Akun Saya + notif akun menunggu validasi admin | Ya | Akun teraktivasi belum lengkap | Blocked |
| TRP-02-019 | Akun menunggu validasi hanya bisa akses menu AKUN SAYA | Tidak | Akun status menunggu validasi | Belum diuji |

## Anon — Lupa Kata Sandi (6)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-03-002 | Kode dikirim ke WhatsApp bila yang diinput nomor WA | Ya | akun dengan nomor WA yang dapat dipantau | Blocked |
| SHP-03-008 | Kata sandi baru minimal 6 digit kombinasi huruf & angka (huruf besar/kecil boleh) | Tidak | kode valid | Belum diuji |
| SHP-03-009 | Footer halaman diambil dari Setting General admin | Tidak | setting general terisi | Belum diuji |
| TRP-03-002 | Kode dikirim ke WhatsApp bila input nomor WA | Ya | Nomor WA akun dapat dipantau | Blocked |
| TRP-03-007 | Kata sandi baru minimal 6 digit dan kombinasi huruf & angka | Tidak | Kode valid | Belum diuji |
| TRP-03-009 | Footer diambil dari Setting General admin | Tidak | - | Belum diuji |

## Transporter — Akun Saya (6)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-04-001 | Notif "Selamat datang di PHBID" saat login pertama setelah akun aktif | Tidak | Akun baru aktif belum pernah login | Belum diuji |
| TRP-04-002 | Akun dinonaktifkan hanya akses Akun Saya + notif "Akun anda dinonaktifkan" | Tidak | Akun transporter nonaktif | Belum diuji |
| TRP-04-008 | Tombol Edit Akun Saya disable selama perubahan belum dikonfirmasi admin | Ya | Perubahan data pending | Blocked |
| TRP-04-009 | Admin terima perubahan → data terganti & tombol Edit aktif kembali | Ya | Perubahan data pending | Blocked |
| TRP-04-010 | Admin tolak perubahan → data tetap & tombol Edit aktif kembali | Ya | Perubahan data pending | Blocked |
| TRP-04-011 | Email notifikasi perubahan data diterima / ditolak | Ya | Perubahan data divalidasi admin | Blocked |

## Transporter — Daftar Order - Input Unit (6)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-08-005 | Nopol & nama sopir wajib diisi saat input data unit | Tidak | Order KONFIRMASI UNIT | Blocked |
| TRP-08-006 | No. kontainer & segel unik antar unit; no. kontainer auto kapital, huruf+angka maks 11 tanpa spasi/simbol | Tidak | Order multi unit | Blocked |
| TRP-08-007 | No. telp sopir wajib, hanya angka & "-" | Tidak | Order KONFIRMASI UNIT | Blocked |
| TRP-08-009 | Email kelengkapan data unit ke bid owner setelah input unit | Ya | Input unit sukses | Blocked |
| TRP-08-010 | WA kelengkapan data unit ke bid owner setelah input unit | Ya | Input unit sukses | Blocked |
| TRP-08-011 | Lewati Proses Input Data Unit → unit kosong, tanpa notif ke bid owner | Ya | Order KONFIRMASI UNIT | Blocked |

## Transporter — Harga & Jadwal (6)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-10-011 | Detail harga ber-# menampilkan info Request Harga (tgl request) | Tidak | Harga hasil update harga | Blocked |
| TRP-10-012 | Ikon pena di tab Perlu Update Harga membuka Update Harga berupa popup | Tidak | Harga di tab Perlu Update Harga | Blocked |
| TRP-10-013 | Harga lama pindah ke Butuh Jadwal/Sudah Lengkap setelah diupdate atau lewat tgl tutup update; harga baru masuk Butuh Jadwal Kapal | Ya | Harga dgn request update harga | Blocked |
| TRP-10-021 | Menuju Request Harga dari Pengajuan Lelang → tab Perlu Update Harga terfilter sesuai lelang | Tidak | Lelang di tab Perlu Update Harga | Blocked |
| TRP-10-022 | Filter tetap setelah update harga / update jadwal / lihat & tambah jadwal / aksi lain | Ya | Data hasil filter | Blocked |
| TRP-10-023 | Reset filter | Tidak | - | Belum diuji |

## Transporter — Harga & Jadwal - Update Harga (6)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-10-037 | Halaman Update Harga: data lelang, harga sebelumnya, tgl request & tutup update; tgl mulai berlaku disabled = hari ini | Tidak | Harga dgn request update harga | Blocked |
| TRP-10-038 | PPn/PPh update harga = rekomendasi setting pajak, dapat diedit | Tidak | Harga dgn request update harga | Blocked |
| TRP-10-039 | Checkbox "Harga Seperti Sebelumnya" mengisi harga & PPn/PPh sebelumnya (data lama: setting pajak) dan disable kolom | Tidak | Harga dgn request update harga | Blocked |
| TRP-10-040 | Harga sama tanpa ceklist → alert "Harga sama seperti sebelumnya! Silahkan gunakan ceklist harga seperti sebelumnya" | Tidak | Harga dgn request update harga | Blocked |
| TRP-10-041 | Simpan Update Harga → harga baru dibuat dan perlu input jadwal lagi | Ya | Harga dgn request update harga aktif | Blocked |
| TRP-10-042 | Selama proses update harga tetap bisa tambah & edit harga | Ya | Lelang dalam proses update harga | Blocked |

## Transporter — Preference Notifikasi (6)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-12-005 | Default preference email & sistem Aktif | Tidak | Akun belum pernah ubah preference | Belum diuji |
| TRP-12-007 | Notif nonaktif berlabel "Tidak Aktif" di sisi kanan | Ya | Preference dinonaktifkan | Blocked |
| TRP-12-008 | Email diterima/tidak diterima sesuai preference email | Ya | Pemicu notif + preference diubah | Blocked |
| TRP-12-009 | Push notif diterima/tidak diterima sesuai preference sistem | Ya | Pemicu notif + preference diubah | Blocked |
| TRP-12-010 | WhatsApp ke bidder hanya untuk Lupa Kata Sandi (WA lain dinonaktifkan) | Ya | - | Blocked |
| TRP-12-011 | Email Perjanjian Pengiriman Berhasil Divalidasi menampilkan Nomor Referensi ("-" bila kosong) | Ya | Order divalidasi dgn & tanpa No. Referensi | Blocked |

## Shipper — Registrasi (5)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-02-013 | Kelengkapan Registrasi: nama, nama perusahaan, nomor WA terisi otomatis dari registrasi awal | Tidak | akun baru sudah aktivasi email | Belum diuji |
| SHP-02-014 | Kelengkapan Registrasi: field bertanda bintang wajib (Provinsi, Kota, Alamat, Identitas & Logo) | Tidak | akun baru sudah aktivasi email | Belum diuji |
| SHP-02-015 | Upload Identitas & Logo maks 4 MB .jpg/.jpeg/.png; NPWP & SIUP juga .pdf | Ya | file uji berbagai ukuran/format | Blocked |
| SHP-02-016 | Submit kelengkapan mengarahkan ke Akun Saya dengan notif menunggu validasi admin PHBID | Ya | akun baru sudah aktivasi email | Blocked |
| SHP-02-017 | Akun menunggu validasi hanya bisa mengakses menu Akun Saya | Tidak | akun menunggu validasi admin | Belum diuji |

## Shipper — Laporan (5)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-12-003 | History Lelang: lelang batal tidak muncul | Tidak | lelang batal dalam rentang | Blocked |
| SHP-12-004 | History Lelang: label "Multidrop" untuk rute multidrop | Tidak | lelang multidrop | Blocked |
| SHP-12-009 | Logistik: hanya order yang sudah divalidasi admin | Tidak | order tervalidasi & belum | Blocked |
| SHP-12-012 | Detail Logistik multidrop: textlink "Multidrop" alamat drop & tanggal per alamat; alamat dobel dihitung 1 | Tidak | order multidrop ter-tracking | Blocked |
| SHP-12-013 | Detail Logistik: nominal biaya tambahan bila ada | Tidak | order dengan biaya tambahan | Blocked |

## Transporter — Harga & Jadwal - Request Jadwal (5)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-10-015 | Harga expired → Update disabled + alert 'Tidak bisa update! Harga telah expired' | Tidak | Request jadwal pada harga expired | Blocked |
| TRP-10-016 | Lewat rencana akhir kirim → alert 'Tidak bisa update! Lelang telah melewati rencana akhir kirim'; aktif lagi bila diperpanjang | Tidak | Request jadwal pada lelang lewat akhir kirim | Blocked |
| TRP-10-017 | Ada request jadwal lebih baru ID harga sama → alert 'Tidak bisa update! Harga sudah ada request jadwal terbaru' | Tidak | ≥2 request jadwal harga sama | Blocked |
| TRP-10-018 | Sudah direspon → tombol Update tidak tampil | Tidak | Request jadwal sudah direspon | Blocked |
| TRP-10-019 | Harga dihapus admin → tombol Update disabled | Tidak | Request jadwal pada harga terhapus | Blocked |

## Anon — Login (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-01-004 | Login menggunakan nomor WA akun bid owner | Tidak | akun shipper dengan nomor WA terdaftar | Belum diuji |
| SHP-01-005 | Footer (sosmed, layanan email & WA, copyright) diambil dari Setting General admin | Tidak | setting general terisi | Belum diuji |
| TRP-01-003 | Footer (sosmed, layanan email & WA, copyright) diambil dari Setting General admin | Tidak | Setting General admin terisi | Belum diuji |
| TRP-01-004 | Login menggunakan nomor WA akun transporter | Tidak | Akun transporter aktif dgn nomor WA | Belum diuji |

## Anon — Registrasi (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-02-008 | Footer halaman registrasi diambil dari Setting General admin | Tidak | setting general terisi | Belum diuji |
| SHP-02-011 | Halaman Konfirmasi Email: tombol Kirim Ulang Notifikasi Registrasi mengirim ulang email | Ya | akun baru belum aktivasi | Blocked |
| SHP-02-012 | Footer email notifikasi registrasi diambil dari Setting General admin | Tidak | email aktivasi diterima | Belum diuji |
| TRP-02-008 | Footer halaman registrasi diambil dari Setting General admin | Tidak | Setting General admin terisi | Belum diuji |

## Shipper-Sub — Cari Penawaran (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-07-049 | Sub user custom IMP & TCI tidak bisa akses fitur Nego | Tidak | sub user IMP/TCI | Belum diuji |
| SHP-07-055 | Sub user custom IMP & TCI tidak bisa akses Daftar Nego | Tidak | sub user IMP/TCI | Belum diuji |
| SHP-07-087 | Sub user custom TCI tidak bisa akses Input Muatan | Tidak | sub user TCI | Belum diuji |
| SHP-07-091 | Sub user custom TCI tidak bisa akses Input Perjanjian | Tidak | sub user TCI | Belum diuji |

## Transporter — Pengajuan Lelang (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-06-011 | Request harga saat belum input → lelang di Perlu Input Harga; periode habis → Lelang Tutup | Ya | Shipper request harga | Blocked |
| TRP-06-012 | Request harga saat sudah input → lelang di Perlu Update Harga; periode habis → Lelang Tutup | Ya | Shipper request harga pada lelang sudah diinput | Blocked |
| TRP-06-013 | Lelang yang dibuat bid owner tampil di daftar pengajuan lelang | Tidak | Lelang mengundang transporter | Blocked |
| TRP-06-018 | Aksi Menuju Request Harga → Harga & Jadwal tab Perlu Update Harga | Tidak | Lelang di tab Perlu Update Harga | Blocked |

## Transporter — Daftar Order - Detail (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-08-032 | Download dokumen perjanjian pengiriman yg disetujui bid owner | Tidak | Order tervalidasi | Blocked |
| TRP-08-037 | Popup info harga: harga sebelum PPn, PPn, PPh; data lama "-" | Tidak | Order ber-PPn & order lama | Blocked |
| TRP-08-038 | Tombol "kapal connecting nx" di detail order connecting | Tidak | Order jadwal connecting | Blocked |
| TRP-08-039 | Dokumen aanwijzing: nama dokumen, "-" bila tidak aktif, dibuka popup | Tidak | Order dari lelang ber-aanwijzing | Blocked |

## Transporter — Penugasan Tracking (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-09-006 | Status list mengikuti tracking AMBIL KONTAINER s.d. DOKUMEN DIKIRIM (termasuk SJ DITERIMA AGEN) | Ya | Order dgn tracking berjalan | Blocked |
| TRP-09-007 | Multi kontainer: status global Kapal Sandar bila ada kontainer masih Kapal Sandar | Ya | Order multi kontainer | Blocked |
| TRP-09-009 | Penugasan dikunci & tracking selesai: status tetap status tracking terakhir | Ya | Order penugasan dikunci | Blocked |
| TRP-09-012 | Kapal connecting > 1: tabel menampilkan nama & voyage kapal connecting terakhir | Tidak | Order dgn >1 kapal connecting | Bermasalah |

## Transporter — Open Stack (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| OS-00-010 | Edit jadwal ter-order → alert "Jadwal sudah di order, tidak dapat di edit" | Tidak | Jadwal ter-order | Blocked |
| OS-00-012 | Hapus jadwal ter-order → alert "Jadwal sudah di order tidak bisa di hapus" | Tidak | Jadwal ter-order | Blocked |
| OS-00-016 | Open Stack tidak tampil di Daftar Order list, tab Harga & Jadwal, detail nego, tracking | Tidak | - | Belum diuji |
| OS-00-018 | Nilai Open Stack di order = snapshot saat order dibuat; perubahan jadwal master tidak mengubah order | Ya | Order + jadwal master diubah | Blocked |

## Shipper — Analitik SCSR (4)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SCSR-00-015 | Paging limit 20 level 2 untuk >20 pasangan kota | Tidak | Provinsi >20 pasangan kota | Blocked |
| SCSR-00-018 | Link ID Order level 3 → Detail Order | Tidak | Hasil level 3 | Belum diuji |
| SCSR-00-020 | Order multidrop tampil per drop dgn biaya dibagi; Consignee & Alamat mengikuti drop | Tidak | Order multidrop | Blocked |
| SCSR-00-023 | Export PDF ketiga level | Tidak | Hasil pencarian | Belum diuji |

## Transporter — Daftar Order - Data Unit (3)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-08-013 | Lihat Data Unit; unit dilewati → "*) Data unit menunggu bidder update pengiriman" | Tidak | Order dgn unit diinput & dilewati | Blocked |
| TRP-08-014 | Tombol Edit Unit aktif hanya bila unit belum dikerjakan tracking | Tidak | Order belum & sudah tracking | Blocked |
| TRP-08-015 | Simpan Edit Data Unit (aturan sama dgn input unit) | Ya | Order belum tracking | Blocked |

## Admin — Riwayat Nego (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-06-006 | Nego ulang melanjutkan riwayat (nego ke-4, 5, dst) dengan membawa riwayat lama | Tidak | penawaran dinego ulang | Blocked |
| ADM-06-007 | Data nego lama dibuatkan riwayat dari data tersedia | Tidak | nego data lama | Blocked |

## Shipper-Sub — Push Notif (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-05-019 | Halaman Preferensi Notifikasi Sub User menampilkan daftar notif email & sistem yang dapat diterima | Tidak | akun sub user shipper | Belum diuji |
| SHP-05-020 | Notif yang diterima sub user mengikuti hak akses notifikasi yang diatur admin | Tidak | sub user dengan hak akses notif tertentu | Blocked |

## Shipper-Sub — Laporan (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-12-006 | Sub user custom IMP & TCI tidak bisa akses Laporan History Lelang | Tidak | sub user IMP/TCI | Belum diuji |
| SHP-12-015 | Sub user custom TCI tidak bisa akses Laporan Logistik | Tidak | sub user TCI | Belum diuji |

## Anon — Registrasi - Konfirmasi Email (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-02-011 | Kirim ulang notif registrasi via tombol "Kirim Ulang Notifikasi Registrasi" | Ya | Akun terdaftar belum aktif | Blocked |
| TRP-02-012 | Footer email notifikasi registrasi diambil dari Setting General admin | Ya | Email registrasi diterima | Blocked |

## Transporter — Push Notif (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-05-003 | Terima push notif Perubahan Data Diterima | Ya | Admin terima perubahan akun | Blocked |
| TRP-05-004 | Terima push notif Perubahan Data Ditolak | Ya | Admin tolak perubahan akun | Blocked |

## Transporter — Pengajuan Lelang - Detail (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-06-019 | Daftar harga penawaran yang ditambahkan bidder di detail lelang | Tidak | Lelang dgn harga penawaran | Blocked |
| TRP-06-020 | Tombol "kapal connecting nx" pada harga dgn jadwal connecting | Tidak | Harga dgn jadwal connecting | Blocked |

## Transporter — Lihat Data Tracking (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-09-026 | Belum dikerjakan → "Tidak ada data tersedia" di card status pengiriman | Tidak | Order ditugaskan belum dikerjakan | Bermasalah |
| TRP-09-028 | Data Detail: download foto tracking | Tidak | Tracking dgn foto | Blocked |

## Shipper — Open Stack (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| OS-00-020 | Isi Data Pesanan: blok PELAYARAN Open Stack + Closing Time | Tidak | Penawaran ber-Open Stack | Blocked |
| OS-00-022 | Open Stack tidak tampil di Cek Jadwal & Daftar Order list shipper | Tidak | - | Belum diuji |

## Admin — Open Stack (2)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| OS-00-027 | Harga & Jadwal admin → Lihat Jadwal: gating edit/hapus sama dgn bidder | Tidak | Jadwal ter-order | Blocked |
| OS-00-028 | Open Stack tidak tampil di master admin & detail/edit lelang admin | Tidak | - | Belum diuji |

## Admin — Login (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| ADM-01-002 | Akun admin hanya dibuat via backend (tidak ada registrasi admin di UI) | Tidak | - | Belum diuji |

## Shipper-Sub — Pengajuan Nego (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-09-014 | Sub user custom IMP & TCI tidak bisa akses Pengajuan Nego | Tidak | sub user IMP/TCI | Belum diuji |

## Shipper — Cek Jadwal (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SHP-11-002 | Pelabuhan asal & tujuan wajib dipilih untuk menampilkan data | Tidak | - | Belum diuji |

## Transporter-Sub — Akun Saya (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-04-013 | Sub user dgn hak akses notif email saja (lelang baru, order terverifikasi, pengajuan nego) hanya bisa buka Akun Saya | Tidak | Sub user dgn hak akses tsb | Belum diuji |

## Transporter-Sub — Daftar Order (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-08-025 | Sub user dgn akses Daftar Pesanan dapat membuka halaman Daftar Order | Tidak | Sub user dgn akses Daftar Pesanan | Belum diuji |

## Transporter-Sub — Penugasan Tracking (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-09-010 | Sub user dgn akses Daftar Pesanan dapat membuka Penugasan Tracking | Tidak | Sub user dgn akses Daftar Pesanan | Blocked |

## Admin — Tracking Pengiriman (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-09-023 | Admin dapat edit data tracking unit yg sudah diisi | Ya | Order dgn tracking terisi | Blocked |

## Shipper — Harga & Jadwal - Request Jadwal (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| TRP-10-020 | Respon update jadwal tampil di Cari Penawaran shipper/admin | Ya | Respon update jadwal oleh transporter | Blocked |

## Transporter — Analitik SCSR (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| SCSR-00-003 | Transporter tidak punya menu Analitik | Tidak | - | Belum diuji |

## Admin — Analitik - Ringkasan (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-01 | Halaman Ringkasan Analitik | Tidak | - | Perlu clarification |

## Admin — Analitik - Freight Cost (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-02 | Halaman Freight Cost | Tidak | - | Perlu clarification |

## Admin — Analitik - On Time Delivery Rate (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-03 | Halaman On Time Delivery Rate | Tidak | - | Perlu clarification |

## Admin — Analitik - Shipment Accuracy (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-04 | Halaman Shipment Accuracy | Tidak | - | Perlu clarification |

## Admin — Validasi Akun - Biaya Layanan (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-05 | Halaman Biaya Layanan | Tidak | - | Perlu clarification |

## Admin — Master - Jenis Muatan (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-06 | Halaman Master Jenis Muatan (per shipper) | Tidak | - | Perlu clarification |

## Admin — Master - Harga Barang (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-07 | Halaman Master Harga Barang (per shipper) | Tidak | - | Perlu clarification |

## Admin — Master - Free Time (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-ADM-08 | Halaman Master Free Time | Tidak | - | Perlu clarification |

## Shipper — Analitik - Ringkasan (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-SHP-01 | Halaman Ringkasan Analitik (tombol Cari, Lihat Laporan) | Tidak | - | Perlu clarification |

## Shipper — Analitik - Freight Cost (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-SHP-02 | Halaman Freight Cost (tombol Cari) | Tidak | - | Perlu clarification |

## Shipper — Analitik - On Time Delivery Rate (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-SHP-03 | Halaman On Time Delivery Rate (tombol Cari) | Tidak | - | Perlu clarification |

## Shipper — Analitik - Shipment Accuracy (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-SHP-04 | Halaman Shipment Accuracy (tombol Cari) | Tidak | - | Perlu clarification |

## Shipper — Master - Jenis Muatan (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-SHP-05 | Halaman Master Jenis Muatan shipper | Tidak | - | Bermasalah |

## Shipper — Master - Harga Barang (1)

| ID | Fitur/Aksi | Mutasi | Prasyarat data | Status matriks |
|---|---|---|---|---|
| UI-SHP-06 | Halaman Master Harga Barang shipper (Filter, Tambah Harga Barang) | Tidak | - | Bermasalah |
