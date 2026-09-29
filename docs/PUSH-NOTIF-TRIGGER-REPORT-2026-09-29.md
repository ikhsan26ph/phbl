# Hasil Uji Trigger Push Notif — 29 September 2026

Pengujian dilakukan dari aksi bisnis yang memicu notifikasi, bukan hanya dari
halaman inbox. Setiap test mengambil ID notifikasi terakhir sebelum aksi,
menjalankan request UI yang sebenarnya, lalu memeriksa record baru pada akun
tujuan dan salinan Admin. Record juga diverifikasi belum dibaca, redirect tetap
di origin PHBID, dan tanggal kedaluwarsa sekitar tiga bulan.

## Akun fixture

| Peran | Akun utama | Sub-user |
|---|---|---|
| Admin | `prahu.bid20@gmail.com` | `phbiddaratadmean@gmail.com` |
| Shipper | `pengirim.ph2021@gmail.com` | `ikbidowner@yopmail.com` |
| Transporter | `partner.ph2021@gmail.com` | `ikbidder@yopmail.com` |

Transporter target adalah ID 66, perusahaan `PT. Muda Jaya Wijaya Karya
Sentosa Indah Elok (IK)`, alias `(IK)MJW`. Untuk prasyarat tracking hanya
digunakan petugas dummy `AUTOTEST-FIXTURE-PETUGASAPK-01` / `089900000001`;
tidak ada petugas nyata lain yang dipilih.

## Trigger yang terbukti

| Aksi pemicu | Penerima Push Notif | Judul/kategori | Bukti utama |
|---|---|---|---|
| Shipper submit lelang | Transporter + Admin | Pengajuan Lelang / Lelang | Lelang AUTOTEST dibuat hanya untuk Transporter fixture |
| Shipper membatalkan lelang | Transporter + Admin | Pembatalan Lelang / Lelang | Lelang hasil test dibatalkan kembali |
| Shipper request update harga | Transporter + Admin | Request Update / Input Harga / Lelang | Peserta terpilih hanya ID 66 |
| Shipper request jadwal | Transporter + Admin | Shipper Request Jadwal / Lelang | Checkbox kirim notifikasi dipilih |
| Transporter merespons request jadwal | Shipper + Admin | Jadwal Telah Tersedia / Lelang | Jadwal Direct disimpan dari UI |
| Transporter input kelengkapan unit | Shipper + Admin | Kelengkapan Data Unit / Order | Order `20260904-06501` |
| Transporter update Stuffing | Shipper + Admin | Update Stuffing / Tracking | Order `20260904-06501` |
| Transporter update Kapal Berlayar | Shipper + Admin | Update Kapal Berlayar / Tracking | Order yang sama |
| Transporter update Kapal Sandar | Shipper + Admin | Update Kapal Sandar / Tracking | Order yang sama |
| Transporter update Rencana Dooring | Shipper + Admin | Update Rencana Dooring / Tracking | Order yang sama |
| Transporter update Dooring | Shipper + Admin | Update Dooring / Tracking | Order yang sama |
| Transporter update SJ Diterima Agen | Shipper + Admin | Update SJ Diterima Agen / Tracking | Order yang sama |
| Admin menerima Perjanjian Pengiriman | Shipper + Transporter + Admin | Perjanjian Pengiriman Divalidasi / Order | Order `20260929-06501` berubah menjadi `KONFIRMASI UNIT`; Admin menerima salinan `to Shipper` dan `to Transporter` |
| Admin menolak Perjanjian Pengiriman | Shipper + Admin | Perjanjian Pengiriman Ditolak / Order | Order `20260826-06506` berubah menjadi `ORDER DITOLAK` |
| Admin mengganti jadwal | Shipper + Admin | Perubahan Jadwal / Order | Open Stack order `20260829-06504` diubah melalui UI lalu dikembalikan; kedua submit menghasilkan record baru |
| Pilih notifikasi baru → Tandai Dibaca → Hapus | Inbox Transporter | aksi inbox | Status berubah dari `belum`, lalu ID yang sama hilang |

Run konsolidasi trigger: **13 test lulus**, termasuk dua expected failure yang
mendokumentasikan defect server. Run terpisah buat/batalkan lelang: **7 test
lulus**. Run tambahan untuk validasi/penolakan perjanjian dan perubahan jadwal:
**3 test lulus**.

### Bukti trigger Admin

- Terima order `20260929-06501` menghasilkan record baru pukul 13:25:14-15:
  Shipper `Perjanjian Pengiriman Divalidasi`, Transporter `Perjanjian
  Pengiriman Berhasil Divalidasi`, dan dua salinan identik pada Admin.
- Tolak order `20260826-06506` menghasilkan record baru pukul 13:27:57 dengan
  judul `Perjanjian Pengiriman Ditolak` pada Shipper dan salinan Admin. Server
  demo mengembalikan response HTTP non-2xx setelah transaksi tersimpan;
  keberhasilan dibuktikan dari status `ORDER DITOLAK` dan kedua record baru.
- Ganti Jadwal order `20260829-06504` menghasilkan record baru pukul 13:28:53.
  Revert Open Stack pukul 13:29:11 juga menghasilkan record kedua; nilai akhir
  jadwal sudah kembali seperti semula.

## Terblokir defect server

- Pengajuan Nego: `POST /home/dosubmitnego` mengembalikan HTTP 500. Karena
  pengajuan baru tidak terbentuk, notifikasi `Pengajuan Nego`, `Nego Diterima`,
  `Nego Ditolak`, dan `Nego Dicounter` belum dapat diuji end-to-end.
- Perubahan data akun Shipper: `POST /home/doupdateakunsaya/65` mengembalikan
  HTTP 500. Karena data perubahan tidak masuk antrean, notifikasi `Konfirmasi
  Perubahan Data`, `Perubahan Data Diterima`, dan `Perubahan Data Ditolak`
  belum dapat diuji end-to-end.

## Belum tersedia pada state fixture

- `Update Ambil Kontainer` tidak dirender untuk order uji karena nomor
  kontainer sudah diisi pada tahap Input Unit.
- `Update Dokumen Dikirim` tidak dirender pada halaman Tracking Pengiriman
  aktual setelah tahap SJ Diterima Agen.
- Job retensi fisik tiga bulan tidak dipercepat; yang diverifikasi adalah
  metadata `expired` sekitar tiga bulan dan keterangan UI.

## Artefak

- Suite trigger: `tests/admin/push-notif-trigger-*.spec.ts`,
  `tests/shipper/push-notif-trigger-*.spec.ts`, dan
  `tests/transporter/push-notif-trigger-*.spec.ts`.
- Helper verifikasi payload: `tests/push-notif.trigger.ts`.
- Laporan Excel trigger konsolidasi:
  `report/hasil-testing-2026-09-29.xlsx`.
- Laporan khusus buat/batalkan lelang:
  `report/hasil-testing-2026-09-29-push-notif-trigger-lelang.xlsx`.
