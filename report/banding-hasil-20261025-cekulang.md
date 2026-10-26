# Perbandingan hasil test — sebelum vs sesudah

- Sebelum: `report/baseline-php-8.2.35/results-gabungan.json` → 469 test {"lulus":358,"lulus-defect":26,"gagal":48,"skip":36,"defect-hilang?":1}
- Sesudah: `test-results/local/runs/20261025-cekulang-gabungan/results.json` → 469 test {"lulus":380,"lulus-defect":26,"gagal":32,"skip":30,"defect-hilang?":1}

| Kategori | Jumlah |
|---|---|
| REGRESI | 3 |
| PERLU CEK | 1 |
| GAGAL, ERROR BERUBAH | 2 |
| PERBAIKAN | 20 |
| PERUBAHAN LAIN | 5 |
| SAMA | 438 |

## REGRESI (3)

| Test | Sebelum | Sesudah | Error sesudah | Error sebelum |
|---|---|---|---|---|
| admin\|push-notif.shared.ts\|Push Notif (Admin) › ikon lonceng top bar membuka halaman Notifikasi dan indikator unread tampil (baris 91) | lulus | gagal | Error: expect(locator).toHaveCount(expected) failed |  |
| shipper\|push-notif.shared.ts\|Push Notif (Shipper/Bid Owner) › ikon lonceng top bar membuka halaman Notifikasi dan indikator unread tampil (baris 91) | lulus | gagal | Error: expect(locator).toHaveCount(expected) failed |  |
| transporter\|push-notif.shared.ts\|Push Notif (Transporter/Bidder) › ikon lonceng top bar membuka halaman Notifikasi dan indikator unread tampil (baris 91) | lulus | gagal | Error: expect(locator).toHaveCount(expected) failed |  |

## PERLU CEK (1)

| Test | Sebelum | Sesudah | Error sesudah | Error sebelum |
|---|---|---|---|---|
| transporter\|transporter/profil.spec.ts\|tab Ulasan menampilkan ulasan berlabel Shipper dengan tanggal, rute, isi, terbaru di atas (baris 111) | skip | gagal | Test timeout of 60000ms exceeded while running "beforeEach" hook. |  |

## GAGAL, ERROR BERUBAH (2)

| Test | Sebelum | Sesudah | Error sesudah | Error sebelum |
|---|---|---|---|---|
| anon\|anon/lupa-kata-sandi.spec.ts\|alur penuh: kode via email valid, diarahkan ke kata sandi baru, sandi berhasil diubah (baris 74) | gagal | gagal | Error: expect(received).not.toBeNull() | Error: expect(locator).toBeVisible() failed |
| admin\|admin/invoice-nama-item.spec.ts\|Nama item Invoice Jasa Pengiriman (Admin) › form invoice ditolak untuk order tahap awal (belum boleh diinvoice) (baris 396) | gagal | gagal | Error: expect(locator).toContainText(expected) failed | Error: expect(locator).toBeVisible() failed |

## PERBAIKAN (20)

| Test | Sebelum | Sesudah | Error sesudah | Error sebelum |
|---|---|---|---|---|
| precondition\|precondition/alur-buat-lelang.spec.ts\|CP0: fixture pilihan master alur Buat Lelang ditetapkan untuk target ini (baris 89) | gagal | lulus |  | Error: FIXTURES.local.buatLelang di scripts/targets.js masih null — isi setelah master tersedia & dikonfirmasi |
| admin\|admin/cek-jadwal.spec.ts\|Cek Jadwal Pelayaran (Admin) › pencarian jadwal menampilkan hasil atau pesan jadwal belum tersedia beserta kontak CS (baris 84) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| admin\|admin/master.spec.ts\|Master (Admin) — data yang sudah digunakan › Pelayaran terpakai: Edit meminta konfirmasi dan Hapus ditolak (baris 317) | gagal | lulus |  | Error: expect(received).toBe(expected) // Object.is equality |
| admin\|admin/open-stack-ganti-jadwal.spec.ts\|Open Stack — Ganti Jadwal (Admin, mutasi) › mengubah Open Stack order via Ganti Jadwal tercermin di Detail Order dan Riwayat Perubahan Data, lalu dikembalikan (baris 126) | gagal | lulus |  | Error: expect(page).toHaveURL(expected) failed |
| admin\|admin/push-notif-trigger-perubahan-jadwal.spec.ts\|Ganti Jadwal oleh Admin mengirim Push Notif baru ke Shipper dan salinan Admin (baris 52) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| admin\|admin/push-notif-trigger-validasi-perjanjian.spec.ts\|Push Notif — validasi Perjanjian Pengiriman oleh Admin › terima perjanjian mengirim notifikasi baru ke Shipper, Transporter, dan salinan Admin (baris 59) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| admin\|admin/push-notif-trigger-validasi-perjanjian.spec.ts\|Push Notif — validasi Perjanjian Pengiriman oleh Admin › tolak perjanjian mengirim notifikasi baru ke Shipper dan salinan Admin (baris 106) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| admin\|admin/validasi-akun-mutasi.spec.ts\|Transporter Khusus (Admin, mutasi) › tambah transporter khusus (alias otomatis) → setting: tambah shipper, shipper sama ditolak → hapus transporter khusus (baris 280) | gagal | lulus |  | Error: expect(page).toHaveURL(expected) failed |
| admin\|admin/validasi-akun-mutasi.spec.ts\|Relasi Satu Pintu (Admin, mutasi) › tambah relasi transporter (VA angka) → tampil, relasi sama ditolak "Data Relasi Sudah Ada", lalu dihapus (baris 344) | gagal | lulus |  | Error: expect(locator).toHaveValue(expected) failed |
| shipper\|shipper/buat-lelang.spec.ts\|alur penuh: buat lalu batalkan lelang memicu Push Notif Transporter dan Admin (baris 193) | gagal | lulus |  | Error: Fixture alur Buat Lelang untuk target local belum ditetapkan (scripts/targets.js FIXTURES.<target>.buatLelang) — data master belum tersedia/terkonfirmasi |
| shipper\|shipper/cek-jadwal.spec.ts\|pencarian jadwal menampilkan hasil atau pesan jadwal belum tersedia beserta kontak CS (baris 96) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| shipper\|shipper/push-notif-trigger-request-harga.spec.ts\|Request Update Harga hanya ke Transporter fixture memicu Push Notif Transporter dan Admin (baris 21) | gagal | lulus |  | Error: expect(received).toBeTruthy() |
| shipper\|shipper/push-notif-trigger-request-jadwal.spec.ts\|Request Jadwal ke Transporter fixture memicu Push Notif Transporter dan Admin (baris 11) | gagal | lulus |  | Error: expect(received).toBeTruthy() |
| transporter\|transporter/pengajuan-lelang.spec.ts\|Detail Pengajuan Lelang (Bidder) › lelang belum tutup: tombol Tambah Harga Penawaran tampil menuju halaman Tambah Harga (baris 194) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| transporter\|transporter/pengajuan-lelang.spec.ts\|Detail Pengajuan Lelang (Bidder) › belum ada harga penawaran: catatan merah dan keterangan daftar kosong tampil (baris 212) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| transporter\|transporter/pengajuan-lelang.spec.ts\|Detail Pengajuan Lelang (Bidder) › kontak dan nomor PIC muat disembunyikan dari bidder (baris 223) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| transporter\|transporter/pengajuan-nego.spec.ts\|Daftar Pengajuan Nego (Bidder) › setiap baris menampilkan salah satu status nego yang dikenal (baris 71) | gagal | lulus |  | Error: expect(locator).toBeVisible() failed |
| transporter\|transporter/pengajuan-nego.spec.ts\|Daftar Pengajuan Nego (Bidder) › nego yang sudah direspon hanya memiliki tombol Detail tanpa Aksi Nego (baris 114) | gagal | lulus |  | Error: expect(locator).toHaveCount(expected) failed |
| transporter\|transporter/push-notif-trigger-aksi-inbox.spec.ts\|notifikasi hasil trigger dapat ditandai dibaca lalu dihapus dari inbox Transporter (baris 47) | gagal | lulus |  | Error: expect(received).toBeTruthy() |
| transporter\|transporter/push-notif-trigger-jadwal-tersedia.spec.ts\|respons Request Jadwal memicu Jadwal Telah Tersedia ke Shipper dan Admin (baris 63) | gagal | lulus |  | Error: expect(received).toBeTruthy() |

## PERUBAHAN LAIN (5)

| Test | Sebelum | Sesudah | Error sesudah | Error sebelum |
|---|---|---|---|---|
| admin\|admin/cari-penawaran.spec.ts\|Request Jadwal & Daftar Request Jadwal (Admin) › halaman Request Jadwal memuat data lelang dan daftar harga dengan tombol Request (baris 313) | skip | lulus |  |  |
| admin\|admin/daftar-order-edit-harga.spec.ts\|Daftar Order — Edit Harga (Admin) › popup Edit Harga menampilkan Nomor Order dan Harga Saat Ini sesuai baris, dengan label dan placeholder sesuai rule (baris 150) | skip | lulus |  |  |
| admin\|admin/daftar-order-edit-harga.spec.ts\|Daftar Order — Edit Harga (Admin) › submit tanpa harga baru menampilkan pesan Masukkan Harga Baru (baris 184) | skip | lulus |  |  |
| admin\|admin/daftar-order-edit-harga.spec.ts\|Daftar Order — Edit Harga (Admin) › submit tanpa alasan menampilkan pesan Masukkan Alasan Edit Harga; input harga ber-mask ribuan (baris 197) | skip | lulus |  |  |
| admin\|admin/daftar-order-edit-harga.spec.ts\|Daftar Order — Edit Harga (Admin) › edit harga tersimpan, tercatat di History Perubahan Data, lalu dikembalikan ke harga semula (baris 215) | skip | lulus |  |  |
