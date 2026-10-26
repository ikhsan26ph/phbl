# Regresi patch PHP — prosedur (disiapkan 2026-10-25)

Baseline: **PHP/8.2.35** (`report/baseline-php-8.2.35/`, dibekukan — jangan diubah).
Semua perintah dari root repo; Node 22 (`export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"`).

## 0. Sebelum mulai (setelah server di-patch)

- Bila URL tunnel berganti: ubah `BASE_URL` di `.env` — sesi lama otomatis tidak berlaku;
  tahap `cepat`/`penuh` menjalankan setup (login) lebih dulu, probe plugin menolak jalan
  bila sesi bukan milik host saat ini atau tidak login.
- Pastikan tidak ada run Playwright lain (repo ini) yang berjalan.
- `npm run readiness` → cek: `X-Powered-By` = versi PHP BARU (bukan 8.2.35), cookie
  `PHBIDLAUTLOCAL` (bukan aplikasi lain, mis. Prahu Roro), 0 penghambat.
  Bila versi masih 8.2.35 → patch belum aktif di web/FPM; STOP, konfirmasi ke DevOps.

## 1. Tahap cepat (±40 mnt; read-only kecuali uji ulang 3 tiket yang memuat mutasi ber-revert)

```bash
bash scripts/regresi-patch.sh cepat <label>     # mis. label = php8238
bash scripts/regresi-patch.sh banding <label>   # hasil probe plugin vs baseline
```

Isi: readiness, setup + smoke (6 akun, halaman inti tanpa 5xx), probe plugin 87 halaman,
uji ulang test 3 tiket (Ratchet / searchulasan / inputmuatan — mengandung trigger
request harga/jadwal & ganti jadwal = mutasi dgn revert, sama dgn baseline).
Gerbang: smoke gagal / login gagal → STOP dan laporkan sebelum tahap penuh.

## 2. Tahap penuh (±3,5 jam, MEMUAT MUTASI — izin user 2026-10-24)

```bash
bash scripts/regresi-patch.sh penuh <label>     # jalankan di latar belakang (nohup/setsid)
bash scripts/regresi-patch.sh banding <label>   # laporan report/banding-hasil-<label>.md
```

Daftar test & pengecualian identik baseline (`set-readonly-lengkap.txt`, `penuh-*.txt`,
`dikecualikan.txt`). Pasca-run WAJIB cek integritas data (Open Stack order uji, transporter
khusus, Setting Notifikasi ON, sisa AUTOTEST) seperti 2026-10-24.

## 3. Membaca hasil perbandingan

- **REGRESI** (lulus → gagal) dan **PERLU CEK** (skip → gagal): kandidat akibat patch —
  cek error & snapshot sebelum menyimpulkan.
- **GAGAL, ERROR BERUBAH**: test yang memang gagal di baseline tetapi pesannya berubah
  (mis. 500 Ratchet berganti error lain) — penting untuk 3 tiket.
- **PERBAIKAN / DEFECT HILANG?**: dicek ulang; bisa efek patch, bisa data.
- **Noise yang sudah diketahui**: `transporter/profil.spec.ts` & `admin/cari-penawaran.spec.ts:292`
  berubah acak karena defect #22 (kunci sesi searchulasan) — jangan dihitung regresi
  tanpa bukti lain. Data server berubah sejak baseline (test mutasi 2026-10-24) →
  perubahan pada test bergantung data dicek dulu.
- KOREKSI 2026-10-25 sore: klaim awal "81/87 identik" pada probe pra-patch SALAH —
  `bandingkan-plugin.js` versi awal tidak membandingkan `console.error`. Setelah diperbaiki:
  sejak host `lucy-workstation-hart-grad` (≥ 10.28) **WebSocket browser gagal handshake
  (HTTP 302/500) di 81–83/87 halaman**, baseline 0/87 → indikator notifikasi & refresh
  realtime tidak jalan (lihat CLAUDE.md defect #24). Noise yang benar-benar dikenal hanya:
  500 `searchulasan` (#22) & `searchdatajenismuatan` (D5) yang tertangkap/tidak tergantung
  waktu, serta lonjakan latensi (8 → 36–71 dtk).
- Patch PHP TIDAK diharapkan memperbaiki tiket Ratchet (ketidakcocokan versi library
  composer); bila masih muncul, itu bukan kegagalan patch.

## Alat

| Skrip | Fungsi |
|---|---|
| `scripts/plugin-probe.js` | probe plugin read-only, daftar halaman = baseline |
| `scripts/bandingkan-plugin.js` | beda per halaman: status, error JS, respons ≥400, file, plugin, instance |
| `scripts/bandingkan-hasil.js` | beda per test (gabung beberapa results.json, hasil terakhir per test) |
| `scripts/regresi-patch.sh` | pelaksana tahap cepat / penuh / banding |

Validasi alat (2026-10-25): baseline vs dirinya & vs 6 run asli → 468/468 SAMA; dua run
profil berbeda → REGRESI 1 (`profil:70`) & PERBAIKAN 2 (`profil:55`, `:84`) sesuai fakta.
