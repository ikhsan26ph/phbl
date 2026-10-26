# Ringkasan run penuh — PHBID Laut via tunnel (2026-10-24)

Target: label `local`, BASE_URL tunnel `survival-nobody-character-plugin.trycloudflare.com`
(PHBID Laut terverifikasi: cookie `PHBIDLAUTLOCAL`; footer build **BETA 20260228 v1.3.28**;
`X-Powered-By: PHP/8.2.35`). Izin user: seluruh suite + mutasi; email/WA hanya ke akun `.env`.

## Angka (per test unik, tanpa login setup; hasil terakhir per test)

Koreksi 2026-10-25: rekap awal menulis 461/351 — `admin/pengaturan-akun-user.spec.ts:132`
berjalan dua kali (Hak Akses Shipper & Transporter, judul+baris sama) dan sempat terhitung satu.

| Peran | Lulus | Lulus-defect (test.fail) | Gagal | Skip |
|---|---|---|---|---|
| admin | 175 | 14 | 26 | 22 |
| shipper | 80 | 9 | 6 | 0 |
| transporter | 69 | 1 | 15 | 10 |
| anon | 9 | 2 | 1 | 2 |
| precondition | 3 | 0 | 1 | 0 |
| sub user (admin/shipper/transporter) | 16 | 0 | 0 | 0 |
| admin-sub-read | 0 | 0 | 0 | 1 (tanpa kredensial, opsional) |
| **Total 462** | **352** | **26** | **49** | **35** |

Ditambah smoke 30/30 lulus (tunnel sebelumnya). Login 6 akun lulus di setiap run.
Tidak dijalankan (sengaja): 19 test — lihat `docs/resume-2026-10-24/dikecualikan.txt`
(beban server, risiko membuat akun, kontak di luar akun `.env`).

## Akar masalah kegagalan (49)

- **A. HTTP 500 aplikasi — 11 test**
  - A1 (5): `Ratchet\RFC6455\…ClientNegotiator::__construct()` TypeError — versi library
    WebSocket tidak cocok (`vendor/ratchet/pawl`). Memukul `POST /order/do_ganti_jadwal`,
    `/lelang/do_request_update_harga`, `/lelang/doRequestJadwal`. Kandidat terkait upgrade PHP 8.2/composer.
  - A2 (4): `POST /home/searchulasan` → "Maximum execution time of 30 seconds exceeded" ±61 dtk +
    sesi PHP terkunci → halaman Profil Transporter timeout acak.
  - A3 (2): `GET /home/inputmuatan/<id>` → max_execution_time 30 dtk.
  - Semua pesan error membocorkan path `C:\MBROOMS\SourceCode\PHBID-LAUT-NEWS\…` (display_errors aktif).
- **B. Konfigurasi lingkungan QA — 3 test**: `LocalQaSafety.php` "Outbound integrations disabled
  for local QA" (email lupa sandi, pencarian jadwal pelayaran). Bukan defect produk; artinya
  email/integrasi keluar tidak terkirim dari server ini.
- **C. Data/fixture — 18 test**: fixture Buat Lelang `local` = null (by design, 2); data/fixture
  demo tidak ada (16: kandidat invoice 0, hanya 5 status order, opsi fixture dropdown jadwal/
  pelayaran tidak ada).
- **D. Belum diketahui — 3 test**: trigger push perubahan jadwal/validasi perjanjian gagal
  di langkah awal (email shipper tak tampil di Akun Saya ≤30 dtk), sebelum mutasi.
- **E. Kandidat defect — 1**: field VA relasi transporter menerima huruf (`ab12cd34`), di demo tersaring jadi angka.
- **F. Belum diklasifikasi — 13**: perlu cek snapshot satu per satu (data vs locator vs produk).

Rincian per test: tabel di bawah.

## Integritas data pasca-run (cek independen read-only)

- Order `20260827-06503` Open Stack kembali **29/08/2026** (Ganti Jadwal mutasi & revert sama-sama 500).
- Transporter khusus id 86 sudah terhapus; 0 baris AUTOTEST di daftar transporter khusus.
- Setting Notifikasi Push/Email/WA tetap **ON** (kondisi awal). Test mutasi Setting/Master/Hak akses lulus termasuk revert.
- Jadwal Open Stack AUTOTEST: tidak ada yang dibuat (gagal di form sebelum simpan).
- Password `shipper-sub` tidak berubah (lupa sandi gagal sebelum kode).

## Laporan Excel

`report/hasil-testing-2026-10-24-{1509,1759,1837,1843,2030,2057}-local.xlsx`
(read-only, read-only lanjutan, lain, admin, shipper, transporter).

## Batas kesimpulan

Lulusnya test tidak membuktikan seluruh fitur produk berjalan: 35 skip & 18 kegagalan data
berarti fitur terkait BELUM teruji di dataset ini; 19 test sengaja tidak dijalankan.

## Rincian kegagalan

| Kategori | Test | Error ringkas | Run |
|---|---|---|---|
| A1 HTTP 500 — Ratchet WebSocket TypeError (terbukti di trace) | admin/open-stack-ganti-jadwal.spec.ts:126 — mengubah Open Stack order via Ganti Jadwal tercermin di Detail Order dan Riwayat Perubahan | Error: expect(page).toHaveURL(expected) failed | 20261024-tunnel-penuh-admin |
| A1 HTTP 500 — Ratchet WebSocket TypeError (terbukti di trace) | shipper/push-notif-trigger-request-harga.spec.ts:21 — Request Update Harga hanya ke Transporter fixture memicu Push Notif Transporter dan Admin | Error: expect(received).toBeTruthy() | 20261024-tunnel-penuh-shipper |
| A1 HTTP 500 — Ratchet WebSocket TypeError (terbukti di trace) | shipper/push-notif-trigger-request-jadwal.spec.ts:11 — Request Jadwal ke Transporter fixture memicu Push Notif Transporter dan Admin | Error: expect(received).toBeTruthy() | 20261024-tunnel-penuh-shipper |
| A1 HTTP 500 — Ratchet WebSocket TypeError (terbukti di trace) | transporter/push-notif-trigger-aksi-inbox.spec.ts:47 — notifikasi hasil trigger dapat ditandai dibaca lalu dihapus dari inbox Transporter | Error: expect(received).toBeTruthy() | 20261024-tunnel-penuh-transporter |
| A1 HTTP 500 — Ratchet WebSocket TypeError (terbukti di trace) | transporter/push-notif-trigger-jadwal-tersedia.spec.ts:63 — respons Request Jadwal memicu Jadwal Telah Tersedia ke Shipper dan Admin | Error: expect(received).toBeTruthy() | 20261024-tunnel-penuh-transporter |
| A2 HTTP 500 — searchulasan max_execution_time + kunci sesi (defect #22; cari-penawaran:292 = profil tab baru, dugaan sama) | admin/cari-penawaran.spec.ts:292 — Profil Transporter dibuka di tab baru: bergabung sejak, rating, tab Informasi/Ulasan | Test timeout of 60000ms exceeded. | 20261024-tunnel-penuh-admin |
| A2 HTTP 500 — searchulasan max_execution_time + kunci sesi (defect #22; cari-penawaran:292 = profil tab baru, dugaan sama) | transporter/profil.spec.ts:101 — Edit Profil membuka form tahun berdiri & jumlah karyawan tanpa menyimpan | Test timeout of 60000ms exceeded. | 20261024-tunnel-penuh-transporter |
| A2 HTTP 500 — searchulasan max_execution_time + kunci sesi (defect #22; cari-penawaran:292 = profil tab baru, dugaan sama) | transporter/profil.spec.ts:55 — header profil menampilkan bergabung sejak, lokasi, detail rating berbintang, dan jumlah me | Test timeout of 60000ms exceeded while running "beforeEach" hook. | 20261024-tunnel-readonly-lanjut |
| A2 HTTP 500 — searchulasan max_execution_time + kunci sesi (defect #22; cari-penawaran:292 = profil tab baru, dugaan sama) | transporter/profil.spec.ts:84 — galeri perusahaan menampilkan keterangan Tidak Ada Data Tersedia bila kosong, atau foto bi | Test timeout of 60000ms exceeded while running "beforeEach" hook. | 20261024-tunnel-readonly-lanjut |
| A3 HTTP 500 — GET /home/inputmuatan max_execution_time (terbukti di trace) | admin/daftar-order.spec.ts:353 — form tahap awal tersedia untuk Input Muatan, Perjanjian, dan Kelengkapan Unit fixture | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| A3 HTTP 500 — GET /home/inputmuatan max_execution_time (terbukti di trace) | admin/daftar-order.spec.ts:379 — halaman Batalkan Order, Edit Data Muatan, dan Edit Status Order dapat dibuka tanpa mutasi | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| B Lingkungan QA — LocalQaSafety: integrasi keluar dimatikan (terbukti di trace) | admin/cek-jadwal.spec.ts:84 — pencarian jadwal menampilkan hasil atau pesan jadwal belum tersedia beserta kontak CS | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| B Lingkungan QA — LocalQaSafety: integrasi keluar dimatikan (terbukti di trace) | anon/lupa-kata-sandi.spec.ts:74 — alur penuh: kode via email valid, diarahkan ke kata sandi baru, sandi berhasil diubah | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-lain |
| B Lingkungan QA — LocalQaSafety: integrasi keluar dimatikan (terbukti di trace) | shipper/cek-jadwal.spec.ts:96 — pencarian jadwal menampilkan hasil atau pesan jadwal belum tersedia beserta kontak CS | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-shipper |
| C1 By design — fixture Buat Lelang label local = null | precondition/alur-buat-lelang.spec.ts:89 — CP0: fixture pilihan master alur Buat Lelang ditetapkan untuk target ini | Error: FIXTURES.local.buatLelang di scripts/targets.js masih null — isi setelah master tersedia & dikonfirmasi | 20261024-tunnel-penuh-lain |
| C1 By design — fixture Buat Lelang label local = null | shipper/buat-lelang.spec.ts:193 — alur penuh: buat lalu batalkan lelang memicu Push Notif Transporter dan Admin | Error: Fixture alur Buat Lelang untuk target local belum ditetapkan (scripts/targets.js FIXTURES.<target>.buatLelang) —  | 20261024-tunnel-penuh-shipper |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/daftar-order.spec.ts:257 — action utama dan submenu mengikuti tahap order yang tersedia pada 100 data aktual | Error: Minimal delapan status harus tersedia pada 100 order aktual | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:176 — menu Proses Invoice memakai OrderID mentah dan halaman invoice menyediakan Buat Invoice | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:222 — nama item menampilkan No. Referensi order di baris bawah jenis kendaraan | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:248 — order dengan lebih dari satu kendaraan memakai No. Referensi yang sama di semua item | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:271 — order tanpa No. Referensi hanya menampilkan baris jenis kendaraan | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:296 — order MULTIDROP tetap satu item per unit: rute pelabuhan + No. Referensi, tanpa alamat dro | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:334 — Invoice Tambahan tidak membawa nama item sehingga tanpa No. Referensi | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:356 — admin bisa mengubah No. Referensi lewat Edit Data Order (field #nomor_referensi) | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:382 — Edit Data Order ditolak untuk ORDER SELESAI sehingga No. Referensi tak bisa lagi diubah | Error: Panen kandidat invoice terlalu sedikit — tabel tidak sempat menampilkan 100 order | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/invoice-nama-item.spec.ts:396 — form invoice ditolak untuk order tahap awal (belum boleh diinvoice) | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | admin/master.spec.ts:317 — Pelayaran terpakai: Edit meminta konfirmasi dan Hapus ditolak | Error: expect(received).toBe(expected) // Object.is equality | 20261024-tunnel-penuh-admin |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | transporter/open-stack-jadwal.spec.ts:178 — validasi required Tambah Jadwal berurutan lewat popover dan melewati Open Stack (opsional) | Test timeout of 180000ms exceeded. | 20261024-tunnel-penuh-transporter |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | transporter/open-stack-jadwal.spec.ts:379 — template berisi kolom jadwal (Kapal, Voyage, Closing Time, ETD, ETA) — belum ada kolom Ope | Test timeout of 180000ms exceeded. | 20261024-tunnel-penuh-transporter |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | transporter/open-stack-jadwal.spec.ts:396 — template hanya berisi satu sheet jadwal (DEFECT: sheet lain memuat data internal & data pr | Test timeout of 180000ms exceeded. | 20261024-tunnel-penuh-transporter |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | transporter/open-stack.spec.ts:189 — form Tambah Jadwal kapal direct/transit memuat field Open Stack opsional di antara Voyage  | Test timeout of 60000ms exceeded. | 20261024-tunnel-penuh-transporter |
| C2 Data/fixture demo tidak ada (bukti: pesan test — 0 kandidat / 5 status / opsi fixture tidak ada) | transporter/open-stack.spec.ts:212 — form Tambah Jadwal kapal connecting memuat field Open Stack opsional hanya pada kapal awal | Test timeout of 60000ms exceeded. | 20261024-tunnel-penuh-transporter |
| D Belum diketahui — email shipper tak tampil di Akun Saya dlm 30 dtk (sebelum mutasi) | admin/push-notif-trigger-perubahan-jadwal.spec.ts:52 — Ganti Jadwal oleh Admin mengirim Push Notif baru ke Shipper dan salinan Admin | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| D Belum diketahui — email shipper tak tampil di Akun Saya dlm 30 dtk (sebelum mutasi) | admin/push-notif-trigger-validasi-perjanjian.spec.ts:106 — tolak perjanjian mengirim notifikasi baru ke Shipper dan salinan Admin | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| D Belum diketahui — email shipper tak tampil di Akun Saya dlm 30 dtk (sebelum mutasi) | admin/push-notif-trigger-validasi-perjanjian.spec.ts:59 — terima perjanjian mengirim notifikasi baru ke Shipper, Transporter, dan salinan Admin | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| E Kandidat defect — field VA relasi menerima huruf ("ab12cd34"), demo menyaring jadi angka | admin/validasi-akun-mutasi.spec.ts:344 — tambah relasi transporter (VA angka) → tampil, relasi sama ditolak "Data Relasi Sudah Ada" | Error: expect(locator).toHaveValue(expected) failed | 20261024-tunnel-penuh-admin |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | admin/cari-penawaran.spec.ts:250 — aksi halaman: Request Jadwal, Request Harga, Export Harga Penawaran, dan tombol pesan/N-A  | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | admin/cari-penawaran.spec.ts:405 — lelang tutup: Request Harga membuka form dengan tanggal tutup request dan peserta beserta  | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | admin/pengajuan-lelang.spec.ts:273 — History Data Lelang hanya tampil pada lelang yang pernah diubah, menuju halaman riwayat | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | admin/pengajuan-lelang.spec.ts:292 — History Request Harga tampil pada lelang yang pernah request harga (nomor bertanda #n) | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-admin |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | admin/penugasan-tracking.spec.ts:124 — halaman memuat detail order dan form petugas per tahap; Lewati tidak tersedia untuk kapal  | Error: expect(locator).toHaveText(expected) failed | 20261024-tunnel-penuh-admin |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | admin/validasi-akun-mutasi.spec.ts:265 — tambah transporter khusus (alias otomatis) → setting: tambah shipper, shipper sama ditolak | Error: expect(page).toHaveURL(expected) failed | 20261024-tunnel-penuh-admin |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | shipper/akun-saya.spec.ts:50 — identitas, logo perusahaan, NPWP, dan SIUP masing-masing punya link download ke file asli | Error: expect(locator).toHaveAttribute(expected) failed | 20261024-tunnel-penuh-shipper |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | shipper/akun-saya.spec.ts:65 — Edit Akun Saya membuka form terisi data akun dengan Email disabled | Test timeout of 60000ms exceeded. | 20261024-tunnel-penuh-shipper |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | transporter/pengajuan-lelang.spec.ts:194 — lelang belum tutup: tombol Tambah Harga Penawaran tampil menuju halaman Tambah Harga | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-transporter |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | transporter/pengajuan-lelang.spec.ts:212 — belum ada harga penawaran: catatan merah dan keterangan daftar kosong tampil | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-transporter |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | transporter/pengajuan-lelang.spec.ts:223 — kontak dan nomor PIC muat disembunyikan dari bidder | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-transporter |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | transporter/pengajuan-nego.spec.ts:112 — nego yang sudah direspon hanya memiliki tombol Detail tanpa Aksi Nego | Error: expect(locator).toHaveCount(expected) failed | 20261024-tunnel-penuh-transporter |
| F Belum diklasifikasi — perlu cek snapshot (data vs locator vs produk) | transporter/pengajuan-nego.spec.ts:71 — setiap baris menampilkan salah satu status nego yang dikenal | Error: expect(locator).toBeVisible() failed | 20261024-tunnel-penuh-transporter |