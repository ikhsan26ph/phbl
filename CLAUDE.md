# PHBID Laut — Automation Testing (Playwright + TypeScript)

Target: https://phbidlautdemo.prahu-hub.com (TMS lelang & pengiriman laut).
Rule aplikasi: `docs/rules/<peran>/<nn>-<modul>.md` (hasil pecahan dokumen .docx;
hanya 3 peran di dokumen: bid-owner, bidder, administrator — APK SOPIR &
ADMIN SILVERSTRIPE tidak ada di dokumen sumber).

## Pemetaan istilah (JANGAN tertukar)

- Bid Owner (istilah rule) = **Shipper** (UI: "Pemilik Barang")
- Bidder (istilah rule) = **Transporter** (UI: "Ekspedisi")

## Struktur

- `playwright.config.ts` — project `setup` (login 6 akun → `.auth/<peran>.json`),
  `anon` (tanpa login), dan `admin`, `admin-sub`, `shipper`, `shipper-sub`,
  `transporter`, `transporter-sub` (dependencies setup, testMatch `tests/<nama>/`).
- Kredensial HANYA dari `.env` (lihat `.env.example`). Dilarang hardcode.
- `ADMIN_PATH=/` — admin login lewat form publik yang sama (konfirmasi user).

## Konvensi kerja (wajib)

1. **Kalibrasi dulu, jangan menebak locator.** Sebelum menulis spec, jelajahi
   halaman asli dengan `playwright-cli` (sesi `-s=<nama>`, `state-load`/
   `state-save`; TIDAK memakai `--persistent`). Cari elemen dengan `find`
   (hemat konteks), lalu ambil locator via `generate-locator <ref>` dan pakai
   **persis** hasilnya. Locator CSS/XPath tanpa role/label → laporkan sebagai
   usulan data-testid ke developer, jangan dipakai diam-diam.
2. Bukti login = elemen pasca-autentikasi `getByRole('link', { name: 'KELUAR' })`,
   BUKAN cek URL (halaman pendaratan beda-beda per akun: carirute / listlelang /
   akunsaya).
3. `fullyParallel: false` itu SENGAJA — flash message disimpan di session server
   dan semua test satu peran berbagi session login; paralel = flaky (terbukti).
4. Berhenti dan tanya bila ambigu; jangan longgar-kan assertion untuk meloloskan
   test; tempel output runner apa adanya; akhiri sesi CLI dengan `close-all`.
5. Test dengan efek samping boleh memakai inbox **yopmail** (izin user).
   Reset kata sandi: sandi baru = sandi lama agar `.env` tetap valid.

## Fakta kalibrasi penting

- Alert aplikasi = native `window.alert` (event `dialog`), teks Title Case
  (rule menulis sentence case). Pesan not-found Cari Penawaran = elemen DOM
  `role=alert`.
- Tombol Konfirmasi kode lupa-sandi hanya enable via `pressSequentially`, bukan `fill`.
- Yopmail: `#login`, `#refresh`, iframe `#ifinbox` (baris `button.lm`), `#ifmail`.
  Link "Aktifkan Akun" (Mailjet) harus diklik DARI DALAM email — goto langsung = 404.
- Tabel popup daftar lelang: baris dimuat async + tbody menyisipkan baris kosong
  pertama → tunggu lalu filter baris yang punya tombol Pilih.
- reCAPTCHA registrasi sudah DIHILANGKAN dev dari demo (2026-08-13) — alur
  registrasi penuh terotomasi. Akun QA permanen hasil kalibrasi:
  qa-tms-reg1@yopmail.com / ValidSandi123, WA 089911224455 (dipakai test WA-duplikat).
- Sesi server TERIKAT User-Agent (temuan 2026-08-20): cookie `.auth/<peran>.json`
  hanya valid bila UA sama persis dengan saat login (`devices['Desktop Chrome']`).
  `state-load` di playwright-cli / context tanpa UA itu selalu ditolak (redirect
  login) — dulu salah didiagnosis "storage state cepat kadaluarsa". Kalibrasi
  CLI: login lewat form saja. Sesi juga TUNGGAL per akun: login baru (mis.
  project setup saat suite jalan) menendang sesi CLI lama akun yang sama.
- Match REGEX getByText memakai teks mentah (TANPA normalisasi whitespace) —
  beda dgn match string. Label detail berpola `<div>Label <span>:</span></div>`
  → exact:true/anchor `$` gagal; pakai substring atau `\s*` di regex.
  Heading tampak kapital karena CSS text-transform, DOM-nya Title Case.

## Laporan Excel

- `npm test` → JSON reporter menulis `test-results/results.json`;
  `npm run report` → `report/hasil-testing-<tanggal>.xlsx` (exceljs).
- Workbook: sheet Ringkasan (rekap per peran) + sheet Admin / Shipper /
  Transporter / Anon. Test `setup` (login) dipetakan ke sheet peran
  masing-masing dari judulnya (`login <akun>`). `test.fail()` tampil sebagai
  "LULUS (defect terdokumentasi)".

## Run penuh 2026-08-20 (report/hasil-testing-2026-08-20.xlsx)

- 83 test: 73 lulus, 7 lulus-defect (test.fail), 2 dilewati, 1 gagal
  (aanwijzing — akar masalah ditemukan & test diperbaiki, lihat defect #6;
  pasca-perbaikan lulus 3/3 headless).

## Run penuh 2026-08-29 (report/hasil-testing-2026-08-29.xlsx) — registrasi s.d order, 3 peran

- Run pertama: 147 test, 139 lulus (termasuk lulus-defect test.fail()),
  4 skip, 4 gagal, 16,5 mnt. Ketiga gagal murni test.fail()-related TIDAK
  dihitung di sini (itu status "failed" di JSON results.json tapi LULUS
  sebagai defect terdokumentasi — baca outcome dari ringkasan runner
  "N failed" di baris akhir, BUKAN filter status per-hasil JSON mentah).
  4 kegagalan riil, semua sudah diperbaiki & diverifikasi ulang:
  1. `tests/admin/daftar-order-edit-harga.spec.ts` — mutasi 1 (edit harga uji)
     SEBENARNYA sukses di server, tapi SweetAlert2 sukses menampilkan teks
     "Anda berhasil edit harga order" (bukan "...mengubah harga order..."
     yang dikalibrasi 2026-08-28) → assertion locator gagal → flag
     `mutasi1Berhasil` (di-set SETELAH assertion toast) tak sempat `true` →
     blok `finally` revert TIDAK jalan. **Order demo 20260828-08503 (PT.
     United Family Food) tersisa ter-drift Rp. 19.500.000 → Rp. 19.500.111**
     sampai ditemukan & diperbaiki manual via UI admin (alasan History:
     "perbaikan manual drift, test gagal 2026-08-29"). Fix test: (a) toast
     dicocokkan regex `/Anda berhasil (mengubah|edit) harga order/i` (2
     varian teks pernah teramati); (b) `mutasi1Berhasil` kini di-set via
     callback SEGERA setelah klik Simpan (POST sudah terkirim), SEBELUM
     assertion toast — supaya finally tetap mencoba revert walau assertion
     toast gagal. **Pelajaran: test mutasi dengan revert-di-finally WAJIB
     set flag "sudah bermutasi" sedini mungkin (saat aksi terkirim), bukan
     setelah verifikasi sukses — verifikasi boleh gagal, mutasi tidak
     menunggu verifikasi.**
  2 & 3. `tests/shipper/daftar-order.spec.ts` & `tests/transporter/daftar-order.spec.ts`
     — kolom tabel Daftar Order berganti nama: **"Nama Kapal Tgl Permintaan
     Muat" → "Nama Kapal Permintaan Muat & Closing Time"** (perubahan UI
     aplikasi nyata per 2026-08-29, sejalan rilis fitur Open Stack/Closing).
     Test diupdate mengikuti teks baru.
  4. `tests/transporter/daftar-order.spec.ts` — test Info Tracking expand
     asumsi baris/order PERTAMA di list selalu berkontainer "Menunggu
     Proses"; tidak — kontainer order pertama saat run sudah berstatus
     lanjut ("Sj Diterima Agen"), data demo bersama & berubah. BUKAN bug
     locator (mekanisme klik `.tombol_info_tracking` → Bootstrap collapse
     `#info_tracking_collapse<idorder>` normal, terverifikasi manual). Fix:
     iterasi semua link Info Tracking sampai ketemu kontainer "Menunggu
     Proses" (skip test bila tak ada sama sekali), bukan `.first()`.
  - Re-run penuh pasca-fix (sama malam itu): 147 test, 143 lulus, 4 skip
    (data-dependent, sama seperti biasa), **0 gagal**, 18,3 mnt. Konfirmasi
    bersih end-to-end registrasi → lelang → order, ketiga peran.

## Transporter (mulai 2026-08-20)

- `tests/transporter/pengajuan-lelang.spec.ts` — 24 test (23 lulus, 1 skip:
  tab Perlu Update Harga tanpa data demo, menu "Menuju Request Harga" belum
  terverifikasi). Read-only; kalibrasi lengkap ada di komentar spec (6 tab,
  kolom + "Shipper", penanda merah via toHaveCSS, tombol Tambah Harga
  Penawaran kondisional, PIC Muat hidden, aanwijzing retry-toPass).
- `tests/transporter/harga-jadwal.spec.ts` — 17 test (16 lulus, 1 skip: tab
  Perlu Update Harga tanpa data demo). Read-only; kalibrasi di komentar spec
  (5 tab numerik `?tab=1..5`, tombol tab duplikat desktop/mobile → `.first()`,
  kolom "Harga (Rp.)" butuh regex tanpa `\b` penutup, aksi per tab beda pola
  — beberapa via `title`/`data-original-title` [ikon tanpa teks], baris
  "Update" di tab Request Jadwal via teks polos tanpa atribut title).
- `tests/transporter/pengajuan-nego.spec.ts` — 7 test, semua lulus (status
  WAITING/DITERIMA/DITOLAK/NEGOSIASI tersedia di demo; aksi nego = link
  /lelang/terimaNego/<hash>?status=terima|tolak|nego; strip "-" Harga Baru
  di baris DITOLAK; detail /lelang/detailnego/<hash> dgn PPN/PPh).
- `tests/transporter/daftar-order.spec.ts` — 8 test, semua lulus (baris
  ganda per order [header info + data], filter No. Kontainer tolak
  spasi/simbol + maks 11 + uppercase via CSS, Info Tracking expand
  "Menunggu Proses", detail /order/orderdetail/<hash> per status; alert
  Proses Invoice TIDAK dicakup — link GET biasa, alert tak terpicu saat
  kalibrasi; rule-nya sendiri kontradiktif baris 70 vs 74).
- `tests/transporter/penugasan-tracking.spec.ts` — 7 test, semua lulus
  (Download APK, tombol Tracking [href RELATIF tanpa "/", resolve via
  <base>], menu per status, halaman lihatdatatracking; PENTING: teks
  status "Menunggu Proses" juga muncul di sub-baris Info Tracking →
  filter baris wajib `:text-is`, bukan `:has-text` [substring "Info
  Tracking" ikut cocok]).
- Gabungan transporter (5 spec): 49 test + 6 setup = 55 lulus, 2 skip,
  0 gagal (run serial 7,6 mnt, 2026-08-20).
- Config diperkeras 2026-08-20: `workers: 1` juga lokal (antar-file
  paralel satu akun → server demo timeout, terbukti) dan `timeout: 60s`
  (lonjakan latensi sporadis server demo).
- Belum: Akun Saya/Profil/Preference Notif (bidder), + semua alur mutasi
  (harga, jadwal, respon nego, input unit, invoice, penugasan petugas).

## Admin (mulai 2026-08-28)

- `tests/admin/daftar-order-edit-harga.spec.ts` — 11 test (9 lulus normal +
  2 lulus-defect via `test.fail()`; fitur BARU Edit Harga; rule ditambahkan
  ke docs/rules/administrator/07-daftar-order.md § "Edit Harga (fitur baru
  2026-08)"). Mutasi DIIZINKAN user (2026-08-28): test e2e mengubah harga
  order ORDER BARU (dipilih dinamis — order APAPUN yang sedang berstatus
  ORDER BARU saat run, bukan order tetap) lalu mengembalikannya via
  try/finally (revert WAJIB jalan meski assertion di antaranya gagal — efek
  permanen tersisa hanya entry History Perubahan Data, by design).
- Kalibrasi kunci (detail di komentar spec): trigger `a.btn_edit_harga_order`
  (atribut `idnya=<OrderID>`); klik → POST /order/cek_edit_harga_order →
  SUKSES buka `#modalEditHargaOrder` ATAU SweetAlert2 blokir "Tidak bisa
  mengubah harga! / Invoice pengiriman untuk order ini sudah dibuat".
  Validasi required = POPOVER Bootstrap transient ±2 dtk (bukan window.alert);
  sukses simpan = SweetAlert2 "Anda berhasil mengubah harga order !" (flash
  session, tombol "Mengerti"). Input harga ber-mask ribuan ("3100000" →
  "3.100.000"; "0" tunggal → kosong). Hak akses: checkbox `#edit_harga_order`
  di tambah/edit/detail HakAksesAdmin (AWAS: dua checkbox berlabel persis
  "Edit Harga" — modul Harga vs Daftar Order — wajib pakai id; checkbox ini
  child dari `lihat_daftar_order`, auto-tercentang saat parent-nya dicentang).
- Jebakan yang SUDAH terbukti: (1) alasan edit di test mutasi WAJIB unik per
  run (history menumpuk lintas run, tampil terbaru-dulu — alasan statis bikin
  locator nangkep entry lama); (2) jangan pakai `locator.or()` popup-vs-swal
  karena `#modalEditHargaOrder` selalu ada (hidden) di DOM → poll eksplisit;
  (3) baca nomor-order & harga baris dalam SATU `evaluate()` atomik, bukan
  dua panggilan Playwright terpisah — tabel Order List demo bersama & terus
  tumbuh (auto-refresh live, ribuan baris) bisa berubah di antara dua
  panggilan, bikin data "kepasang" dari baris berbeda; (4) assertion harga
  pasca-mutasi WAJIB timeout eksplisit ≥20dtk (bukan default ~5dtk) — reload
  tabel async pasca `goto()` kadang lambat, mutasinya sendiri SUDAH sukses
  (terverifikasi via History) tapi assert cepatnya keburu timeout; (5) cleanup
  hapus grup hak akses uji WAJIB pakai `waitFor({state:'visible'})` (polling),
  BUKAN `isVisible({timeout})` yang TIDAK benar2 menunggu/retry — versi lama
  salah simpul "sudah tak ada" sebelum tabel selesai render async, cleanup
  skip diam2 tanpa error (grup sampah nyangkut permanen di server, terbukti
  2x sebelum diperbaiki); verifikasi hapus WAJIB via reload halaman (server-
  side sungguhan), bukan cuma cek DOM pasca-klik (bisa optimistik di klien).
- Test absensi "hanya sisi admin" ditambahkan ke tests/shipper/daftar-order.spec.ts
  & tests/transporter/daftar-order.spec.ts (lulus). Catatan ke developer
  (bukan defect fungsional): markup modal + JS Edit Harga ikut ter-render di
  halaman non-admin (tersembunyi, tanpa trigger); server menolak dengan benar
  ("Anda tidak memiliki akses ke fitur tersebut").
- Baseline data demo: order 20260827-06503 (OrderID 1454) harga Rp. 3.000.000.
- Run 2026-08-28 (report/hasil-testing-2026-08-28.xlsx): 19 test — 6 setup
  login + 9 Edit Harga normal + 2 defect (test.fail) + 2 absensi shipper/
  transporter, semua LULUS (hijau atau lulus-defect terdokumentasi).

## Data baru "Open Stack" (kalibrasi 2026-08-29, belum ada test)

Field jadwal kapal baru berlabel "Open Stack" (tanggal dd/mm/yyyy), tampil
berdampingan dgn Closing/Closing Time. Sumber input: form Tambah/Edit Jadwal
transporter di halaman Lihat Jadwal `/home/masterjadwal1/<hash>` — label
"Open Stack" TANPA asterisk (opsional), input id `openstack`; varian connecting
`openstack_awal_connecting`. Data demo baru ada di lelang 1089
(LELANGFCU/28082026IK, kapal KMLYR001/KMMLY001) + ordernya.

Tampil di (scan outerHTML semua halaman menu 3 peran + halaman aksi):
- Transporter: (1) Lihat Jadwal — kolom tabel "Open Stack" (sortable) antara
  Voyage & Closing Time; (2) Detail Pengajuan Lelang /lelang/detaillistLelang/<id>
  — blok info kapal "Open Stack : <tgl>"; (3) Detail Order /order/orderdetail/<hash>
  — § 1. PEMESANAN blok PELAYARAN (Voyage, Open Stack, Closing).
- Shipper: (1) hasil Cari Penawaran (carirute?from=search) — info kapal per
  penawaran; (2) Detail Order — blok PELAYARAN sama.
- Admin: Detail Order saja (blok PELAYARAN sama). TIDAK ada di master admin
  mana pun / detail & edit lelang admin (view admin tak memuat blok jadwal).
- Semua kemunculan display dobel markup desktop+mobile (kartu `am-flex2`);
  label di detail order dirender juga utk order lama (nilai kosong).

TIDAK tampil di: Cek Jadwal /lelang/carijadwal (hasil Meratus hanya Closing),
list lelang semua tab, tab Harga & Jadwal 1–5, detail nego, tracking,
orderlist. Belum dicek: modal jadwal connecting (ajax/getJadwalConnecting) —
tak ada trigger `.modal_conecting` di data demo saat kalibrasi.

Lanjutan 2026-08-29 — 4 halaman aksi Daftar Order ADMIN (dicek atas
permintaan user; order uji 20260829-02602 / OrderID 1462, connecting,
Open Stack terisi; Edit Status Order dicek di order 20260828-02602 karena
item menu itu TIDAK tersedia utk status ORDER BARU):
- Ganti Jadwal /order/ganti_jadwal/<hash>: ADA — blok PELAYARAN order +
  FORM input jadwal baru berlabel "Open Stack" (input id `open_stack`,
  form-group id `open_stack1`, tanpa asterisk) termasuk seksi connecting.
- Edit Data Order /order/edit_inputpesanan/<hash>: ADA — blok PELAYARAN
  (di sini label pasangannya "Closing Time", bukan "Closing").
- Edit Status Order /order/editstatusorder/<hash>: ADA — blok PELAYARAN;
  nilai kosong dirender strip "-".
- Alihkan Order: ADA — ringkasan order (Open Stack di antara ETD-ETA &
  Closing Time) + tiap baris tabel harga penawaran pengganti ("Open Stack:
  <tgl>" di sel kapal). AWAS: URL /order/alihkanorder/<hash> polos
  me-redirect ke listlelang; wajib query dari klik menu baris
  (?idorder=<hash>&alihkan=yes&lelang=<hash>).

## Status (2026-08-13) — semua suite hijau

- `tests/auth.setup.ts` — 6 login terkalibrasi.
- `tests/anon/` — login (5), registrasi (8, termasuk alur penuh e2e email
  aktivasi), lupa-kata-sandi (2 + alur penuh kode via email; 2 fixme berbasis
  waktu >5 menit, sudah diverifikasi manual).
- `tests/shipper/cari-penawaran.spec.ts` — 5 test.

## Defect aktif (dilaporkan ke developer; terdokumentasi via test.fail())

1. Semua alert validasi registrasi DIAM (kata sandi hanya-huruf, <6 karakter,
   WA duplikat). Kandidat akar masalah: `ReferenceError: dete is not defined`
   di /user/register baris 3098.
2. Radio registrasi berlabel "Shipper/Transporter"; rule menuntut
   "Pemilik Barang/Ekspedisi".
3. Typo tombol "Kirim Ulang Email Konfigurasi Registrasi" (harusnya Konfirmasi).
4. Halaman sandi baru (lupa kata sandi): submit sandi invalid diam tanpa alert;
   heading "HI, !" tanpa nama akun.
5. Ikon popup daftar lelang tanpa accessible name (hanya `#list_lelang`) —
   usulan data-testid/aria-label. Ikon notifikasi top bar juga tanpa nama.
6. Detail lelang: handler klik dokumen aanwijzing (`span.modalwizing` →
   `$('#modalEditProvinsi').modal('show')`) baru di-bind setelah init WebViewer
   PDF.js Express (pihak ketiga, kadang detik-an) — klik user sebelum itu
   TERTELAN tanpa umpan balik. Test diatasi dengan retry klik (toPass);
   usulan dev: bind handler segera / beri loading state. Bonus: id modal
   `modalEditProvinsi` warisan copy-paste, bukan nama semantik.
7. Filter Daftar Order (bidder): label "Nomor Kontainer" ber-`for="jumlah"`
   (field Jumlah Order) sehingga dua label menunjuk #jumlah; input
   #nomor_kontainer sendiri TANPA label terasosiasi (aksesibilitas).
8. Halaman "Detail Hak Akses Admin" (/adminprahu/detailHakAksesAdmin/<id>)
   TIDAK merefleksikan status checkbox yang sebenarnya tersimpan — checkbox
   selalu tampil TIDAK tercentang di halaman Detail meski di halaman Edit
   (sumber kebenaran, terverifikasi) benar-benar tercentang. Diverifikasi
   dengan checkbox Edit Harga TAPI tampak general (checkbox lain seperti
   "Lihat Daftar Order" juga salah tampil), bukan spesifik fitur ini.
9. Grup hak akses admin baru dengan checkbox "Edit Harga" dicentang & sudah
   di-assign ke sub user admin (verifikasi pakai akun sungguhan
   phbiddaratadmean@gmail.com) TIDAK benar2 mengaktifkan fitur — trigger menu
   tetap absen DAN endpoint /order/cek_edit_harga_order tetap menjawab "Anda
   tidak memiliki akses ke fitur tersebut", bahkan setelah logout+login ulang
   (sesi baru, bukan cache lama). Catatan: item action-menu LAIN (Edit Data
   Order, Batalkan Order, Ganti Jadwal, dst.) tetap tampil untuk sub-admin ini
   walau checkbox terkait TIDAK dicentang di grup ujinya — mengindikasikan
   sebagian besar action-menu Daftar Order TIDAK digerbangi hak akses granular
   sama sekali (beda dari kasus Edit Harga yang justru menolak walau granted).

## Langkah berikutnya (belum dikerjakan)

- Sisa modul shipper: Pengajuan Lelang (mutasi — TANYA user dulu boleh/tidak
  membuat data lelang di demo), Dashboard, Daftar Order, Cek Jadwal, Laporan, dll.
- Modul transporter (Harga & Jadwal, Daftar Order, Penugasan Tracking).
- Modul admin lain (Validasi Akun, Setting, Master, Pengaturan Akun, sisa
  Daftar Order admin — banyak mutasi; Edit Harga sudah selesai 2026-08-28).
- `.env.example` masih berisi kredensial asli — kosongkan sebelum git init.
- Folder `specs/` & `specs/_challenge/` masih kosong (tujuan belum dijelaskan user).
