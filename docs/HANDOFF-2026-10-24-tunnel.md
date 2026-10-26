# Handoff 2026-10-24 — migrasi `.env` tunggal + akses tunnel, DIJEDA

Dijeda atas permintaan user pukul ±15.20 WIB. Belum ada commit.

## Sudah selesai

1. **Env tunggal `.env`** (loader `scripts/env.js`) + label target default
   `local` — detail di CLAUDE.md § "Env tunggal `.env` + akses tunnel".
   `admin-sub-read` opsional (keputusan user: sub admin cukup via `ADMIN_SUB_EMAIL`).
2. **Verifikasi akses** BASE_URL tunnel: readiness 0 penghambat; setup 6 login
   lulus; smoke 30/30 (run `20261024-tunnel-smoke-full`: 36 lulus, 3 skip
   admin-sub-read, 0 gagal).
3. **Temuan keamanan** `/user/tess` phpinfo publik → defect #21,
   `tests/anon/diagnostik-publik.spec.ts` (test.fail), ringkasan untuk pemilik
   server `report/temuan-keamanan-tunnel-2026-10-24.md`.
4. **Izin user (2026-10-24)**: seluruh suite termasuk mutasi BOLEH di server
   tunnel; server uji, boleh kotor; email/WA hanya ke yopmail.

## Posisi saat dijeda — run read-only `20261024-tunnel-readonly`

Set 102 test read-only hasil tinjauan 2026-10-23 (101 lokasi,
`docs/resume-2026-10-24/set-readonly-lengkap.txt`; judul di tiap lokasi sudah
dicocokkan ulang dengan katalog → 101/101 sama). Dihentikan SIGINT (aman,
semuanya read-only):

- 73 lulus (67 normal + 6 lulus-defect `test.fail`), 1 skip (admin-sub-read),
  1 terputus (`shipper/dashboard.spec.ts:95`), 34 belum jalan, **0 gagal nyata**.
- Laporan parsial: `report/hasil-testing-2026-10-24-1509-local.xlsx`;
  JSON/HTML: `test-results/local/runs/20261024-tunnel-readonly/`,
  `playwright-report/local/20261024-tunnel-readonly/`.
- **Sisa 35 lokasi**: `docs/resume-2026-10-24/sisa-readonly.txt`.

## Dilanjutkan 2026-10-24 ±18.00

Tunnel berganti ke `survival-nobody-character-plugin` (PHBID Laut terverifikasi:
cookie `PHBIDLAUTLOCAL`, placeholder login cocok; sempat ke Prahu Roro — salah
aplikasi, tidak ada test dijalankan ke sana). Sisa read-only dijalankan sebagai
run `20261024-tunnel-readonly-lanjut`.

### Hasil & keputusan sesi ±18.00

- Sisa read-only `20261024-tunnel-readonly-lanjut`: 39 lulus, 2 gagal
  (`transporter/profil.spec.ts` timeout → defect #22 searchulasan 500 +
  kunci sesi; ulang `20261024-tunnel-profil-ulang`: 2 lulus/3 timeout acak).
- Setting Notifikasi server ini: Push/Email/WA SEMUA ON. Keputusan user:
  biarkan ON, tapi email/WA HANYA ke akun di `.env` → test yang membuat
  kontak baru (yopmail baru / WA acak / petugas fixture / update tracking)
  dikecualikan: `docs/resume-2026-10-24/dikecualikan.txt`.
- Run penuh dibagi per peran (`docs/resume-2026-10-24/penuh-{lain,admin,shipper,transporter}.txt`),
  run ID `20261024-tunnel-penuh-<peran>`, dijalankan berurutan (BUKAN
  paralel — sesi tunggal per akun).

### Run penuh berjalan otomatis (mulai 19.20)

- Selesai: `penuh-lain` (31 lulus, 2 gagal: CP0 precondition [by design] &
  lupa-kata-sandi:74 [form Kirimkan tak berpindah ≤5 dtk, sandi TIDAK berubah]).
- `penuh-admin` berjalan; rantai detached `/tmp/phbl-probe/chain.sh` (log
  `/tmp/phbl-chain.log`) menjalankan shipper → transporter + laporan setelah
  admin selesai. Perkiraan selesai ±21.45–22.00.
- WAJIB pasca-run: cek independen sisa data AUTOTEST & nilai setting yang harus
  kembali (PPN/PPh, Rule Reminder, Setting Notifikasi Push/Email/WA = ON
  [kondisi awal server ini], Versi Web tanpa "AUTOTEST").

### SELESAI 21.34 — hasil akhir

Semua run selesai; ringkasan, klasifikasi 49 kegagalan, dan cek integritas data:
`report/ringkasan-run-penuh-tunnel-2026-10-24.md`; Excel gabungan
`report/hasil-testing-2026-10-24-gabungan-local.xlsx` (2026-10-25). Sisa pekerjaan: klasifikasi 13
kegagalan kategori F (cek snapshot), konfirmasi kandidat defect VA relasi, dan
commit bila user meminta.

## Cara melanjutkan

```bash
cd ~/Project/phbl
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
# 0. Bila URL tunnel berganti: ubah BASE_URL di .env dulu.
TARGET_ENV=local npm run readiness
# 1. Lanjutkan sisa read-only (setup ikut jalan → sesi baru).
#    Bash tool Claude Code: WAJIB run_in_background (>10 mnt).
TARGET_ENV=local PW_RUN_ID=20261024-tunnel-readonly-lanjut \
  npx playwright test $(cat docs/resume-2026-10-24/sisa-readonly.txt)
TARGET_ENV=local PW_RUN_ID=20261024-tunnel-readonly-lanjut npm run report
```

## Langkah berikutnya (belum dikerjakan)

2. **Cek Setting Notifikasi admin** (read-only, `/adminprahu/settingNotifonof`,
   3 switch Push/Email/WhatsApp) SETELAH tidak ada run lain yang memakai sesi
   admin (flash message dibagi per sesi). Menentukan risiko WA/email ke pihak
   nyata di langkah 3.
3. **Run penuh mutasi** (534 test total; ±430 di luar set read-only), serial,
   run_in_background. Pengecualian WAJIB:
   - `tests/admin/master.spec.ts:211` — memuat Provinsi/Kota, membebani server.
   - `tests/anon/registrasi.spec.ts:107`, `:119` — validasi diam → bisa membuat akun.
   - Bila WhatsApp ON: `anon/registrasi.spec.ts:143` (WA `0899<timestamp>` bisa
     milik orang lain) dan `transporter/push-notif-trigger-kelengkapan-unit.spec.ts`
     (mengisi nomor sopir `081246665023` = nomor CS asli). Bila email ON: alur
     lelang/order/nego mengirim email ke akun gmail terdaftar — konfirmasi user.
   - Banyak spec dikalibrasi ke data DEMO (ID/nomor lelang/fixture AUTOTEST) →
     gagal/skip di server ini wajar; klasifikasikan penyebab (data vs produk vs
     locator) sebelum menyebutnya defect.
4. Setelah run: cek sisa data AUTOTEST & nilai setting yang wajib kembali
   (lihat pelajaran revert di CLAUDE.md), lalu bangun laporan & ringkasan.
5. Commit perubahan konfigurasi bila user meminta.
