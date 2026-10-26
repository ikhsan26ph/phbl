# Uji ulang 3 tiket — 2026-10-25 ±12.00 WIB

Server: `https://lucy-workstation-hart-grad.trycloudflare.com/`, `X-Powered-By: PHP/8.2.35`,
footer build **BETA 20260228 v1.3.28** (label build TIDAK berubah dibanding baseline, sehingga
versi deploy hanya bisa dinilai dari perilaku). Run: `test-results/local/runs/20261025-retest-tiket/`
(13 lulus, 6 gagal, 1 skip — test sama persis dengan baseline 2026-10-24).

| Tiket | Status | Bukti |
|---|---|---|
| **1. HTTP 500 Ratchet — Ganti Jadwal & Request Harga/Jadwal** | **TERVERIFIKASI BERES** | 5/5 test kini LULUS (baseline: 5/5 gagal HTTP 500): `admin/open-stack-ganti-jadwal.spec.ts:126` (ganti → Detail Order & Riwayat → revert terverifikasi), `shipper/push-notif-trigger-request-harga.spec.ts:21`, `shipper/push-notif-trigger-request-jadwal.spec.ts:11`, `transporter/push-notif-trigger-aksi-inbox.spec.ts:47`, `transporter/push-notif-trigger-jadwal-tersedia.spec.ts:63` (aksi tersimpan + push notif baru diterima) |
| **2. searchulasan HTTP 500 + menahan request lain** | **BELUM BERES** (perilaku identik) | Probe langsung: `POST /home/searchulasan` → **HTTP 500 setelah 60,8 dtk**, "Fatal error: Maximum execution time of 30 seconds exceeded in …\vendor\monolog\…". Test Profil Transporter `:70`, `:101`, `:111` & `admin/cari-penawaran.spec.ts:292` masih timeout (request searchulasan belum berbalas saat test berakhir). |
| **3. Input Muatan HTTP 500** | **BELUM BERES** (perilaku identik) | `GET /home/inputmuatan/<id>` → **HTTP 500 setelah 61–76 dtk**, pesan max_execution_time yang sama (trace `daftar-order.spec.ts:353` & `:379`). |

Catatan:
- `transporter/profil.spec.ts:55` & `:84` lulus kali ini, tetapi test profil berubah acak
  karena tiket 2 (lihat `docs/REGRESI-PATCH-PHP.md` § noise) — bukan bukti perbaikan.
- Kemungkinan perbaikan tiket 2 & 3 belum ter-deploy ke server ini (perilaku & pesan error
  sama persis dengan 2026-10-24) — perlu konfirmasi tim developer.
- `/user/tess` masih menampilkan phpinfo tanpa login (temuan #21, belum ditangani).
