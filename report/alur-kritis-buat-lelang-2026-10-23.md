# Alur Bisnis Kritis #1 — Buat Lelang Normal (Lokal, PHP 8.2.35)

Tanggal: Jumat, 23 Oktober 2026 · Target: `TARGET_ENV=local`
Status: **CP0/CP1 dapat dieksekusi (read-only); CP2 dan seterusnya BELUM dapat
dieksekusi** (data master kosong, fixture lokal belum ada, izin mutasi belum ada).
Alur ini hanya langkah pertama rantai lelang → harga → order → penugasan →
tracking → invoice. Langkah setelahnya **belum** terbukti dapat dijalankan di
lokal dan tidak diasumsikan.

## 1. Alasan pemilihan

| Kandidat | Kesiapan automation | Ketergantungan data | Keputusan |
|---|---|---|---|
| **Buat Lelang normal → Pilih 1 peserta → submit** | Spec alur penuh ada (`tests/shipper/buat-lelang.spec.ts`), lulus end-to-end di demo 2026-09-29; peserta dipetakan dinamis dari email env | Master pelabuhan/kota/kontainer + 1 transporter aktif | **Dipilih**: langkah pertama rantai bisnis, data awal paling sedikit, pemetaan akun sudah tanpa hardcode |
| Pesan order dari Cari Penawaran | Belum ada spec (datepicker material belum terotomasi) | Butuh lelang + harga + jadwal | Ditunda |
| Input harga transporter | Belum ada spec mutasi | Butuh lelang | Ditunda (bergantung alur #1) |
| Penugasan & tracking | Spec read-only + trigger demo hardcode order | Butuh order; halaman **HTTP 500** (D1) | Blocked |

Variasi yang dipilih: lelang **Normal** (bukan Multidrop), 1 jenis kontainer, 1
peserta (transporter fixture), tanpa history lelang, tanpa dokumen tambahan.
Field opsional (Include, Dokumen Penagihan, budget, sales) dibiarkan kosong.

## 2. Checkpoint

Sumber expected result: **R** = `docs/rules/bid-owner/08-pengajuan-lelang.md`;
**K** = kalibrasi demo di header `tests/shipper/buat-lelang.spec.ts` (2026-08-14)
dan CLAUDE.md "Trigger Push Notif Pengajuan Lelang" (2026-09-29). K berasal dari
perilaku aplikasi yang teramati, **bukan** requirement tertulis.

| CP | Langkah | Role | Mutasi? | Expected result | Sumber | Status lokal 2026-10-23 |
|---|---|---|---|---|---|---|
| CP0 | Precondition data (lihat § 3) | admin/shipper/transporter | Tidak | Semua data wajib tersedia; fixture target terisi | R (sumber dropdown), K | **Gagal (blocker)**: 5 dropdown 0 opsi; fixture lokal `null`. Transporter fixture **lulus** (AKTIF, alias QAL3) |
| CP1 | Buka `/lelang/buatlelang` | shipper | Tidak | 200, form tampil, tanpa penolakan; email shipper tampil | K | **Lulus** (run `20261023-precondition-buatlelang`) |
| CP2 | Isi field wajib (nomor unik, 4 tanggal berurutan ≥ sekarang, POL, POD, alamat & kota asal/tujuan, jenis kontainer) → Lanjutkan | shipper | **Ya**: lelang sudah tercipta di langkah ini (K) | Pindah ke `/lelang/pilihpesertalelang/<hash>`, ringkasan memuat data yang diisi | R (field wajib, urutan tanggal, data tampil di Pilih Peserta), K (record tercipta di step 1) | Blocked (CP0, izin mutasi) |
| CP3 | Pilih tepat 1 peserta (alias transporter fixture) | shipper | Tidak (state klien) | Alias tampil (bidder aktif, tidak dikunci/hidden); jumlah terpilih = 1; "Pilih Semua" tidak tercentang | R (bidder aktif, card alias), K | Blocked. **Perlu konfirmasi**: apakah QAL3 tampil untuk shipper lokal (penguncian/hidden tidak diketahui) |
| CP4 | Submit (`POST /lelang/do_buat_lelang`) | shipper | **Ya** | Response OK; redirect `/lelang/listlelang`; pesan "Anda berhasil membuat pengajuan lelang"; nomor lelang di tab Semua Lelang | K; R: notifikasi email & WA ke bidder diundang | Blocked. **Perlu konfirmasi** efek samping email/WA (saklar lokal OFF, § 4) |
| CP5 | Verifikasi hasil simpan sisi transporter | transporter | Tidak | Lelang tampil di tab Perlu Input Harga transporter fixture | K (redirect notifikasi `tab=perlu-input-harga`); rule bidder pengajuan lelang (**perlu dicocokkan**) | Blocked |
| CP6 | Verifikasi Push Notif transporter & admin | transporter, admin | Tidak | Record baru kategori Lelang, judul "Pengajuan Lelang", isi = nomor lelang, unread, redirect `tab=perlu-input-harga`; admin berlabel "to Transporter" | K | Blocked. **Konflik setting**: saklar `push_notif` lokal **OFF** → expected ini mungkin tidak berlaku di lokal; perlu keputusan (§ 4) |
| CP7 | (Opsional) Batalkan lelang uji | shipper | **Ya** | Alasan wajib; konfirmasi "Apakah anda yakin membatalkan lelang ?"; status LELANG BATAL; notifikasi pembatalan | R (§ Batalkan Lelang), K | Blocked. Ini **bukan** cleanup: data tetap ada (status batal) |

Eksekusi bertahap yang disarankan setelah prasyarat terpenuhi: jalankan
`--project=precondition` dulu; CP2–CP4 baru dijalankan bila CP0 lulus dan izin
mutasi diberikan; CP5/CP6 diverifikasi terpisah setelah keputusan setting
notifikasi.

## 3. Dataset minimum

### 3.1 Wajib

| Data | Kebutuhan minimum | Dasar | Status lokal | Bukti |
|---|---|---|---|---|
| Master Pelabuhan aktif | ≥1 untuk POL & POD. **Perlu konfirmasi** apakah POL boleh = POD; aman: 2 pelabuhan | R | **0 opsi** di form shipper; 0 baris master admin | precondition CP0; inventaris |
| Master Kota (kota asal & tujuan) | ≥1 (aman 2) | R (kota asal/tujuan wajib) | **0 opsi** | precondition CP0 |
| Master Provinsi | Induk Kota (struktur master) | Struktur master admin | Daftar gagal dimuat (D2) | inventaris |
| Master Jenis Kontainer aktif | ≥1 | R | **0 opsi** | precondition CP0 |
| Akun shipper utama aktif & dapat buka form | 1 | K | **Tersedia** | CP1 lulus |
| Akun transporter utama aktif, beralias, terdaftar di Validasi Transporter | 1 | R (bidder aktif), K | **Tersedia**: "QA Laut OPERATOR" / alias QAL3 / AKTIF | precondition CP0 lulus |
| Relasi shipper ↔ transporter tidak dikunci/hidden | — | R | **Belum diketahui** (hanya terlihat di CP3) | — |
| Admin utama | Untuk pemetaan alias & verifikasi notifikasi | K | **Tersedia** | smoke |
| Fixture target | `FIXTURES.local.buatLelang` berisi nama opsi yang **benar-benar ada** | — | `null` | precondition CP0 |

### 3.2 Tambahan (tidak wajib untuk variasi ini)

Master Include (biaya termasuk), Master Dokumen Penagihan, Kemasan/Jenis Muatan,
Pelayaran, history lelang, dokumen aanwijzing, master Iklan Berbayar
(rekomendasi bidder), data sales, budget. Semuanya dibutuhkan untuk variasi atau
langkah lanjutan (multidrop, harga, order), bukan untuk alur #1.

### 3.3 Setting & integrasi

| Item | Status lokal | Dampak ke alur | Perlu |
|---|---|---|---|
| Setting Notifikasi admin (`/adminprahu/settingNotifonof`) | `push_notif` OFF, `notif_email` OFF, `notif_wa` OFF (DOM setelah render, 2026-10-23) | CP6 (push notif) kemungkinan tidak terjadi; arti OFF untuk email/WA **perlu konfirmasi** | Keputusan: uji dengan setting apa adanya (CP6 menjadi "tidak berlaku") atau izin mengubah setting (mutasi, revert wajib) |
| Email & WhatsApp ke bidder (R baris 108) | Tujuan email akun QA berdomain `example.invalid`; gateway lokal tidak diketahui | Potensi pengiriman nyata / error integrasi | Konfirmasi gateway lokal & mail catcher (E4) |
| Push notif internal (DB) | Saklar OFF | Lihat atas | — |
| Library PDF.js Express di halaman Pilih Peserta (K: submit menunggu resource ini) | Tidak diketahui apakah tersedia offline/lokal | CP4 bisa menggantung | Konfirmasi asal resource |
| Spreadsheet penarikan data lelang (R) | Tidak diketahui | Tidak diverifikasi di alur ini | Konfirmasi apakah aktif di lokal |

## 4. Opsi penyediaan data (perlu keputusan; tidak dijalankan)

| Opsi | Isi | Kelebihan | Risiko / prasyarat | Catatan lokal |
|---|---|---|---|---|
| A. Seed/dump tersanitasi | Dev menyediakan dump **master referensi** (Provinsi, Kota, Pelabuhan, Jenis Kontainer; opsional Include/DP) dari sumber sah, tanpa data pribadi/transaksi | Cepat, konsisten, bisa diulang; cocok untuk Provinsi/Kota yang **tidak punya tombol Tambah** | Butuh mekanisme impor & otorisasi DB; versi skema harus cocok dengan build lokal | **Direkomendasikan** minimal untuk Provinsi & Kota |
| B. Input melalui UI admin | Tambah Pelabuhan & Tambah Jenis Kontainer (tombol tersedia; spec CRUD `admin/master.spec.ts` sudah terkalibrasi di demo) | Menguji UI master sekaligus; tanpa akses DB | **Mutasi** (perlu izin). Kota & Provinsi **tidak punya tombol Tambah** (lokal & demo) → B saja tidak cukup. Form Pelabuhan memilih Kota | Bisa dipakai setelah A menyediakan Kota |
| C. Hybrid A + B | A untuk Provinsi/Kota, B untuk Pelabuhan & Jenis Kontainer | Data geografis dari sumber sah, sisanya lewat jalur produk | Kombinasi prasyarat A & B | Pilihan realistis bila dump penuh tidak tersedia |
| Snapshot/restore DB | **Usulan saja**: snapshot sebelum CP2, restore setelah run, supaya lelang/notifikasi uji tidak menumpuk | Hasil berulang; tanpa sisa data | Mekanisme & otorisasi **belum dikonfirmasi**; **tidak dijalankan** | Tanpa ini, setiap run CP2–CP4 meninggalkan 1 lelang (dapat dibatalkan, tidak terhapus) |

Setelah data tersedia: isi `FIXTURES.local.buatLelang` di `scripts/targets.js`
dengan nama opsi yang **benar-benar ada**, lalu jalankan
`TARGET_ENV=local npx playwright test --project=precondition` sampai 4/4 lulus.

## 5. Automation yang disiapkan

| File | Perubahan |
|---|---|
| `scripts/targets.js` | `FIXTURES` per target. Demo = literal lama (Tanjung Priok, Tanjung Perak, Jakarta Utara, Kota Surabaya, 20 DRY); local = `null` (tidak dikarang) |
| `tests/shipper/buat-lelang.spec.ts` | Alur penuh membaca fixture; tanpa fixture → **gagal eksplisit sebelum mutasi** (bukan skip). Perilaku demo identik |
| `tests/precondition/alur-buat-lelang.spec.ts` | 4 test read-only (CP0/CP1): form terbuka; opsi dropdown wajib + keberadaan nilai fixture; fixture terisi; transporter fixture AKTIF beralias. Gagal dengan daftar data yang kurang |
| `playwright.config.ts` | Project `precondition` (dependencies setup) |

Hasil run `20261023-precondition-buatlelang` (08:26 UTC, `0fd24cd+lokal-8c3d7af6`):
**2 passed, 2 failed**.
- Gagal (data):
  - Pelabuhan Asal/Tujuan, Kota Asal/Tujuan, Jenis Kontainer = 0 opsi;
  - `FIXTURES.local.buatLelang` masih null.
- Lulus:
  - form Buat Lelang terbuka;
  - transporter fixture AKTIF, alias QAL3.

## 6. Keputusan

**Checkpoint bisnis pertama yang memutasi data (CP2) BELUM dapat dieksekusi.**
CP0/CP1 dapat dieksekusi read-only dan sudah dijalankan. Syarat untuk lanjut:

1. master Pelabuhan, Kota (+Provinsi), dan Jenis Kontainer tersedia (opsi A/B/C);
2. `FIXTURES.local.buatLelang` diisi dari data itu;
3. izin mutasi di lokal (minimal 1 lelang uji per run, bersama kebijakan sisa
   data atau snapshot);
4. keputusan setting notifikasi untuk CP6 dan konfirmasi efek samping email/WA.
