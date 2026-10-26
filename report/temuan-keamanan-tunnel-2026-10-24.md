# Temuan keamanan — akses aplikasi via tunnel publik (2026-10-24)

**Untuk:** pemilik server / developer PHBID Laut
**Target:** BASE_URL tunnel Cloudflare `https://finger-convinced-ruby-ping.trycloudflare.com/`
(quick tunnel `trycloudflare.com` — dapat diakses siapa pun yang mengetahui URL-nya)
**Runtime teramati:** header `X-Powered-By: PHP/8.2.35`
**Metode:** GET pasif tanpa login dari luar (QA automation). Tidak ada login,
submit, atau perubahan data dalam pengecekan ini. Isi halaman phpinfo TIDAK
disimpan di bukti.

## Temuan

| # | Temuan | Tingkat | Bukti |
|---|---|---|---|
| 1 | `GET /user/tess` tanpa login → HTTP 200 dan menampilkan `phpinfo()` (versi PHP, modul, path server, konfigurasi, variabel environment) | **Tinggi** — pengintaian server terbuka untuk publik | readiness `test-results/local/readiness/2026-10-24T07-49-13-429Z.json`; test `tests/anon/diagnostik-publik.spec.ts` (run `20261024-tunnel-diagnostik`: HTTP 200, penanda phpinfo ada) |
| 2 | Cookie sesi `PHBIDLAUTLOCAL` tanpa `HttpOnly`, `Secure`, dan `SameSite` | Sedang — cookie bisa dibaca skrip (XSS) dan ikut terkirim lintas situs | readiness yang sama (hanya atribut, nilai cookie tidak dicatat) |

Konteks: temuan #1 sama dengan audit demo 2026-09-30
(`report/hasil-pengecekan-demo-2026-09-30.md`). Saat itu `tess` adalah action di
`UserPage.php` (SilverStripe), dan masih ada 5 action diagnostik/migrasi lain di
file yang sama serta 7 di `GeneralPage.php`. Di demo action-action itu sudah
diberi guard 404 langsung di server, tetapi patch-nya **belum masuk repo source**.
Server di balik tunnel ini terbukti masih membuka `/user/tess`. Belum
diverifikasi apakah action diagnostik lainnya juga terbuka di server ini; QA
tidak memanggil action lain karena sebagian bersifat migrasi/menulis.

## Rekomendasi

**Segera (tanpa ubah kode):**
1. Blok di web server origin di belakang cloudflared, mis. nginx
   `location = /user/tess { return 404; }`, untuk semua action diagnostik
   yang ditemukan di audit 2026-09-30.
2. Atau batasi akses tunnel: gunakan named tunnel + Cloudflare Access
   (login email/OTP) sebagai pengganti quick tunnel, atau matikan tunnel saat
   tidak dipakai. Quick tunnel tidak mendukung Cloudflare Access.

**Perbaikan permanen (kode):**
3. Hapus `tess` dan action diagnostik/migrasi lainnya dari `$allowed_actions`
   (lebih baik method-nya ikut dihapus). Bila masih diperlukan, gate dengan
   `Permission::check('ADMIN')` dan hanya saat `Director::isDev()`; selain itu
   404.
4. **Commit ke repo source** agar tidak tertimpa deploy berikutnya (patch demo
   2026-09-30 belum masuk repo).
5. Cookie sesi: set `HttpOnly`, `Secure`, dan `SameSite=Lax` (php.ini
   `session.cookie_*` atau konfigurasi Session SilverStripe).
6. Matikan `display_errors` di server yang dapat diakses dari luar (audit
   sebelumnya: halaman error membocorkan stack trace & potongan source).

## Verifikasi setelah perbaikan (QA)

- `TARGET_ENV=local npm run readiness` → baris `GET /user/tess` harus **OK**
  (bukan TEMUAN), dan atribut cookie harus menunjukkan HttpOnly/Secure/SameSite.
- `TARGET_ENV=local npx playwright test --project=anon tests/anon/diagnostik-publik.spec.ts`
  → test akan "lulus tak terduga" (ditandai gagal oleh runner). Itu tanda
  perbaikan berhasil; QA lalu menghapus `test.fail()` agar test menjadi
  regresi biasa.

## Batas kesimpulan

Pengecekan ini hanya membuktikan kondisi dua titik di atas pada 2026-10-24
dari luar. Ini bukan audit keamanan menyeluruh: route tulis lain, otorisasi
per action, dan konfigurasi server belum diaudit pada instance ini.
