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
- 2026-08-29 (Akun Saya/Profil/Preference Notif bidder, read-only):
  `tests/transporter/akun-saya.spec.ts` (7 test: 4 lulus, 2 skip [akun demo
  tanpa file NPWP/SIUP], 1 lulus-defect test.fail — defect #10),
  `tests/transporter/profil.spec.ts` (5 test, lulus; baris ulasan #isitrayek
  dimuat ASYNC pasca-klik tab → wajib waitFor sebelum count, skip palsu
  terbukti), `tests/transporter/preference-notif.spec.ts` (6 test, lulus;
  pola pane sama dgn shipper, istilah UI Shipper/Transporter), dan project
  BARU `tests/transporter-sub/akun-saya.spec.ts` (6 test, lulus: sub user
  hanya Nama/Email/Nomor Whatsapp/Bagian Staff tanpa tombol edit, menu tanpa
  Preference Notif, akses langsung editakunsaya/preference → redirect +
  alert DOM role=alert ".alert_negatif" "Anda Tidak Memiliki Akses Ke
  Halaman Tersebut", Profil terbuka). Catatan dev non-defect: form Edit
  Profil memuat tgl_berdiri "20/00/0719" utk Tahun Berdiri "2000" (konversi
  tahun→tanggal salah); galeri profil = collapse berid `pengiriman_collapse`
  / `icon_pengiriman` (warisan copy-paste). Breadcrumb Beranda di halaman
  ini = LINK ke /lelang/listLelang (beda dgn list lelang yang SPAN).
- Config diperkeras 2026-08-20: `workers: 1` juga lokal (antar-file
  paralel satu akun → server demo timeout, terbukti) dan `timeout: 60s`
  (lonjakan latensi sporadis server demo).
- Belum: semua alur mutasi (harga, jadwal, respon nego, input unit,
  invoice, penugasan petugas). Akun Saya/Profil/Preference Notif selesai
  2026-08-29 (lihat butir di bawah).

## Admin — Master, Setting, Validasi Akun, Pengaturan Akun (2026-08-29, izin mutasi user)

- Spec baru (semua project `admin`): `tests/admin/master.spec.ts` (32 test:
  struktur 14 halaman master, CRUD tambah→edit modal→hapus utk Bank/Kemasan/
  Jenis Kontainer/Dokumen Penagihan/Include/Pelabuhan, popover required,
  alert duplikat nama, gating data terpakai), `tests/admin/setting.spec.ts`
  (20: General/S&K/Reminder/Notifikasi/Pajak + 4 mutasi revert, 2 lulus-
  defect), `tests/admin/pengaturan-akun.spec.ts` (13: struktur 6 halaman,
  hak akses admin [alert "Pilih Hak akses minimal 1", parent/child, CRUD],
  sub user admin tambah/hapus + duplikat), `tests/admin/validasi-akun.spec.ts`
  (21: struktur 10 daftar + halaman detail/setting read-only, 1 lulus-defect).
  Run gabungan final 2026-08-30 00:17 (4 spec + 6 setup): **87 test, 84
  lulus + 3 lulus-defect, 0 gagal, 15,0 mnt** → laporan
  `report/hasil-testing-2026-08-30-admin.xlsx` (nama file diganti manual —
  generator menamai per tanggal mulai run dan sempat menimpa laporan
  2026-08-29 yang lalu dipulihkan dari git; saran: tambahkan jam/suffix pada
  nama file report).
- Kalibrasi kunci Master: tambah = HALAMAN /adminprahu/tambah<x> (input
  name=nama | un [+kota/status], Simpan #tombol_simpan_bank di SEMUA master
  [Pelayaran #simpan, Petugas #tombol_simpan_petugas]); edit = MODAL
  (#modal_edit_bank utk Bank/Kontainer, #modalEditProvinsi utk Kemasan/
  Pelabuhan/Pajak/Notifikasi — id warisan copy-paste; atribut `type` input
  KOSONG → jangan filter [type=text], cari input by value); hapus =
  SweetAlert2 "Hapus?"; duplikat nama = native alert "Nama Bank Sudah
  Digunakan"; redirect pasca-simpan beda kapitalisasi path (/Kontainer,
  /masterinclude) → regex URL case-insensitive. Fixture demo
  `AUTOTEST-FIXTURE-<MASTER>-01` (sengaja disiapkan): Include (dipakai lelang
  & harga), Kemasan (Master Jenis Muatan), DP (lelang), Pelayaran (harga)
  TERPAKAI → Edit memicu native confirm "Data sudah digunakan pada …, yakin
  untuk mengedit?" / Kemasan: modal dgn nama READONLY; Hapus → swal "Data
  sudah digunakan pada …" [OK] (Kemasan: swal Hapus? lalu native alert
  "Data sudah digunakan pada master jenis muatan" — rule menulis "orderan").
  Fixture Kontainer & Pelabuhan TIDAK terpakai. JANGAN hapus fixture.
- Setting: Reminder UI hanya 6 tugas (rule 8; Ambil Kontainer & Dokumen
  Dikirim tak ada) → test.fail; halaman settingReminder/<hash> WAJIB dibuka
  via klik (defect #12: goto langsung → PHP Warning HTTP_REFERER tanpa form;
  revert test sempat gagal & Rule Trigger SJ Diterima Agen drift +3 Hari,
  sudah dikembalikan manual). Setting Notifikasi: switch checkbox
  .switch_buat_invoice tersembunyi → klik pembungkusnya. Pajak: modal
  #modalEditProvinsi #nilai, alert "Anda berhasil setting pajak".
  Pelajaran (drift Rule Trigger terjadi 2x, 2026-08-29/30): test mutasi+
  revert WAJIB (a) timeout test besar (test.setTimeout ≥ 5 mnt) — timeout
  60 dtk memutus finally; (b) tunggu redirect pasca-simpan ≥ 90 dtk — POST
  demo pernah tersimpan tapi redirect >20 dtk sehingga assertion gagal &
  revert ikut terpotong; (c) revert diverifikasi via reload + retry sekali.
  Bila run gabungan gagal di test mutasi, SELALU cek nilai di demo dan
  kembalikan manual (Rule Reminder SJ Diterima Agen harus "+ 2 Hari",
  PPN 1,1% / PPh 2%, ketiga Setting Notifikasi ON, Versi Web tanpa
  "AUTOTEST").
- Pengaturan Akun: hak akses admin checkbox id=<akses> (308) + Pilih Semua
  id=modul_<x>_pilih_semua (16); sub user admin tambah /adminprahu/
  tambahsubuseradmin (#email, #kata_sandi, #konfirm_kata_sandi, #nama,
  #bagian_staff, #no_wa, #status, multi-select #ukuran), hapus = link
  do_hapus_sub_user/<id> + native confirm (JANGAN daftarkan page.once bila
  handler page.on sudah ada → "already handled"). 10 grup sampah "QA TEST …
  - HAPUS" sisa run Edit Harga lama dibersihkan manual 2026-08-29.
- Validasi Akun: preference shipper di UI 16 push / 12 email vs rule 17 / 13
  (test.fail diskrepansi); transporter 8/8 sesuai. Halaman Peserta Lelang
  lambat (baris async, "Mohon tunggu sebentar" → timeout 60 dtk). Setting
  preference shipper = …NotifBidowner, transporter = …NotifBidder.
- 2026-08-30 lanjutan (mutasi sisa poin 1): `tests/admin/master-iklan-petugas.spec.ts`
  (Iklan Berbayar tambah/duplikat "Ada nama bidder yang sama"/hapus —
  tambah = halaman /adminprahu/tambahiklan [select BidderID, #tgl_mulai_1,
  #tgl_akhir_1 kosong saat load], edit = modal #modal; Petugas APK tambah/
  detail/edit/hapus + WA duplikat "Nomor Whatsapp Sudah Terdaftar" [fixture
  089900000001]), `tests/admin/pengaturan-akun-user.spec.ts` (hak akses &
  sub user shipper/transporter: tambah→detail→hapus, min 1 akses, email
  duplikat; hapus hak akses shipper = button.btn-delete, transporter =
  button.hapus_hak_akses; select hak akses sub user diisi AJAX setelah
  #pilihuser dipilih), `tests/admin/validasi-akun-mutasi.spec.ts` (pre
  register dibuat via form publik konteks baru → detail → hapus swal "Ya";
  rekening min 1 "Rekening aktif minimal satu!" + verifikasi reload; edit
  email → konfirmasi "Apakah anda yakin mengubah email user?" lalu batal;
  transporter khusus tambah→setting→shipper duplikat "Input data ada yang
  sama"→hapus; relasi satu pintu tambah [VA angka]→duplikat "Data Relasi
  Sudah Ada"→hapus). DISKREPANSI baru (test.fail): form Tambah Hak Akses
  Shipper memuat Modul Administrator/Master/Analitik, Transporter memuat
  Modul Administrator — tidak ada di rule. Diskrepansi teks (test menerima
  keduanya, dicatat di header spec): alert WA duplikat petugas "No.
  Whatsapp Sudah Terdaftar" (rule "Nomor …"), shipper duplikat di
  transporter khusus "Shipper Telah Ditambahkan" (rule "Input data ada yang
  sama"), rekening min 1 = SweetAlert2 "Rekening aktif minimal satu!"
  [Mengerti] (rule "alert"). Jebakan run pertama (semua sudah diperbaiki):
  edit petugas memicu swal konfirmasi "Apakah anda yakin mengganti data
  petugas APK ?" [Ya]; hapus transporter khusus memicu navigasi server →
  `goto` saat itu ERR_ABORTED (tunggu waitForURL/load dulu); form tambah
  transporter khusus merender DUA `select[name=nama]` (filter visible);
  listBidderKhusus dgn valuelimit=100 >6 menit (pakai 20 default); alert
  sukses tambah hak akses shipper TIDAK dirender (bukti = baris di list);
  3 baris cocok "partner.ph2021" di Validasi Transporter (pakai .first()).
  PELAJARAN PENTING (grup hak akses shipper AUTOTEST 2x tertinggal di demo,
  2026-08-30): SweetAlert2 konfirmasi muncul beberapa ratus ms setelah klik
  → `swal.isVisible()` seketika bisa false sehingga tombol Hapus/Ya tak
  pernah diklik dan data tak terhapus TANPA error. Helper hapus WAJIB
  `swal.waitFor({ state: 'visible', timeout: 8s }).catch()` dulu, lalu
  konfirmasi, lalu `waitForLoadState('load')` (konfirmasi memicu navigasi
  server → `goto` langsung = ERR_ABORTED), lalu verifikasi via poll reload.
  Bash tool maksimal 10 menit — run gabungan >8 mnt WAJIB run_in_background
  (run foreground pernah terbunuh di test terakhir → data relasi tertinggal).
  Run gabungan final 2026-08-30 ±07:40 (3 spec + 6 setup): **25 test, 22
  lulus + 2 lulus-defect, 0 gagal, 1 skip** (relasi satu pintu — skip palsu
  karena opsi transporter dimuat async; sudah diperbaiki dgn poll count opsi
  dan lulus standalone 7/7) → `report/hasil-testing-2026-08-30-admin-mutasi.xlsx`.
  Verifikasi CLI pasca-run: 0 sisa data AUTOTEST di hak akses/sub user/
  petugas/iklan/transporter khusus/relasi/pre register.
- Belum di admin: terima/tolak akun (mengubah akun demo permanen), rekening
  maks 3, verifikasi perubahan data, upload aanwijzing, hidden ulasan,
  gating petugas yang sudah ditugaskan, modul admin lain (Cari Penawaran,
  Pengajuan Lelang, Nego, Riwayat Nego, Penugasan Tracking, Cek Jadwal,
  Laporan, Akun Saya, Dashboard), admin-sub.

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

## Open Stack — test selesai 2026-08-29 (kalibrasi di bawah tetap berlaku)

- Spec: `tests/transporter/open-stack.spec.ts` (7 test: kolom & nilai Lihat
  Jadwal, form Tambah Jadwal direct/connecting [buka + pilih jenis saja,
  TANPA submit], sel kapal Detail Pengajuan Lelang, blok PELAYARAN Detail
  Order), `tests/shipper/open-stack.spec.ts` (3: hasil Cari Penawaran,
  Detail Order), `tests/admin/open-stack.spec.ts` (7: Detail Order, Ganti
  Jadwal [blok + form #open_stack], Edit Data Order [label "Closing Time"],
  Edit Status Order, Alihkan Order [ringkasan + tabel pengganti]). Rule
  acuan (hasil kalibrasi, bukan dokumen sumber): `docs/rules/open-stack.md`.
  Run 2026-08-29: 17 test semua LULUS (+6 setup), ±4 mnt.
- Data uji: lelang LELANGFCU/28082026IK (id 1089) dipilih dinamis dari list;
  test skip bila datanya hilang. Order KM. Layar tampil Open Stack
  29/08/2026; order KM. Malay (20260829-06501, 20260828-06506) tampil "-"
  walau jadwalnya ber-Open Stack 07/09/2026 → TEMUAN dilaporkan ke dev
  (by-design snapshot vs bug belum jelas), test mencari order ber-tanggal
  dengan iterasi, bukan asumsi baris pertama.
- Jebakan yang terbukti saat menulis spec ini: (1) teks MENTAH sel kapal
  tabel penawaran tanpa spasi antar-div ("KMLYR001Open Stack: …Closing: …")
  → regex `toHaveText` wajib `\s*` (bukan `\s+`) di batas div; (2)
  `getByText(nomorLelang).first()` menangkap duplikat mobile HIDDEN → filter
  `{ visible: true }`; (3) ringkasan Alihkan Order memakai markup lain
  (label "Open Stack :" + div nilai, class ter-obfuscate `_1pEVDa`) dan
  nilai kosong dirender KOSONG bukan "-" (temuan minor); (4) baris info
  order (link Detail Order) berada di BAWAH baris data (nextElementSibling),
  href relatif tanpa "/"; (5) klik Edit Jadwal pada jadwal yang sudah
  dipakai order → native alert "Jadwal sudah di order, tidak dapat di edit".

## Open Stack — eksplorasi MUTASI & modul baru (2026-08-29, izin user "lakukan apapun di demo")

- Rule hasil eksplorasi (satu-satunya acuan, tidak ada dokumen resmi):
  `docs/rules/open-stack.md` — WAJIB dibaca sebelum menyentuh modul ini.
- Spec mutasi: `tests/transporter/open-stack-jadwal.spec.ts` (6 test: popover
  required berurutan [Open Stack dilewati], siklus tambah→Lihat Jadwal→
  Detail Lelang→edit→hapus jadwal direct, "Open Stack tidak divalidasi"
  [perilaku teramati; bila dev menambah validasi test ini yang gagal],
  connecting + modal #modal_transit, template import [kolom tanpa Open Stack]
  + test.fail defect #11) dan `tests/admin/open-stack-ganti-jadwal.spec.ts`
  (1 test: ubah Open Stack order via Ganti Jadwal → Detail Order & Riwayat →
  revert di finally). Run 2026-08-29: 12/12 lulus (±3,5 mnt + 1,3 mnt).
- Fakta kunci: (1) nilai Open Stack di ORDER = snapshot saat order dibuat;
  Ganti Jadwal admin mengubah order saja, jadwal master transporter tetap
  (menjelaskan "-" pada order KM. Malay); (2) Open Stack TANPA validasi
  tanggal sama sekali (setelah Closing/ETA, lampau) — kandidat rule/defect;
  (3) daterangepicker: WAJIB `pressSequentially` + Enter, `fill()` di-reset;
  prefill form Edit Jadwal/Ganti Jadwal diisi JS SETELAH load → tunggu
  `toHaveValue(lama)` sebelum mengetik (terbukti ketikan tertimpa);
  (4) tombol Simpan beda per jenis: `#submitonce` (direct/edit),
  `#submitonce_connecting`, admin Ganti Jadwal `#submitonce1` + SweetAlert2
  konfirmasi "Ya"; (5) Hapus = SweetAlert2 "Hapus?"; jadwal ter-order
  (`sudahorder=1`) tak bisa edit (alert native) — hapusnya belum
  diverifikasi (klik diblokir kebijakan otomasi saat kalibrasi).
- Fixture tersisa di demo (sengaja): jadwal "AUTOTEST Kapal / AT-OS-1"
  (id 1870, harga LELANGFCU, Open Stack master 01/01/2020) yang sudah
  di-order oleh order uji 20260829-06504 (shipper, ORDER BARU, Open Stack
  order 15/09/2026 via Ganti Jadwal). Jangan hapus manual — dipakai test
  admin Ganti Jadwal sebagai target prioritas.
- Pembuatan order dari Cari Penawaran (tombol Pesan → Isi Data Pesanan →
  swal "Konfirmasi Pesanan" → Lanjutkan → Input Muatan) dieksplorasi manual
  saja: field Tanggal Permintaan Muat memakai bootstrapMaterialDatePicker
  (bukan daterangepicker; ketik tidak bekerja, butuh widget/API) — belum
  ada test-nya.

## Data baru "Open Stack" (kalibrasi awal 2026-08-29)

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
10. (2026-08-29) Transporter akun utama: link "Edit Akun Saya" →
    /home/editakunsaya menjawab **HTTP 500** "[Emergency] Uncaught
    SilverStripe\ORM\Connect\DatabaseException: Couldn't run query:
    SELECT * FROM File where ID=" (ID kosong — diduga akun tanpa file
    NPWP/SIUP, nilai "-" di Akun Saya). Halaman error membocorkan stack
    trace + potongan source code (mode debug aktif di demo). Sub user tidak
    kena (aksesnya ditolak lebih dulu). Didokumentasikan via test.fail() di
    tests/transporter/akun-saya.spec.ts.
11. (2026-08-29) Template Import Jadwal (`assets/Format/Template Jadwal PH
    Bid.xlsx`, tombol "Download template disini" di Tambah Jadwal) berisi
    11 sheet: selain sheet template, ada KPI/PIVOT/CHART (nama shipper &
    partner, order per rute), formula QUERY ke laporan internal, "Annwijzing
    TCI", **"LinkedIn" = data survei berisi nama, jenis kelamin, kota, NOMOR
    TELEPON responden**, "Penelitian". Aset publik → kebocoran data pribadi/
    internal. Sekalian: template TANPA kolom Open Stack (gap fitur).
    Didokumentasikan via test.fail() di tests/transporter/open-stack-jadwal.spec.ts.
12. (2026-08-29) Halaman Setting Rule Reminder `/adminprahu/settingReminder/
    <hash>` bergantung pada header Referer: dibuka langsung (tanpa referer)
    menampilkan "[Warning] Undefined array key HTTP_REFERER" + stack trace &
    form tidak dirender (mode debug aktif). Tombol Setting di Setting Pajak
    juga membawa atribut href ke path settingReminder (sisa copy-paste).
    Didokumentasikan via test.fail() di tests/admin/setting.spec.ts.
13. (2026-08-29) Diskrepansi rule vs UI (bukan crash): Reminder 6 tugas vs
    rule 8; preference notif shipper 16 push/12 email vs rule 17/13; alert
    hapus kemasan terpakai "…pada master jenis muatan" vs rule "…pada
    orderan". Semua test.fail() terdokumentasi.

## Langkah berikutnya (belum dikerjakan)

- Sisa modul shipper: Pengajuan Lelang (mutasi — TANYA user dulu boleh/tidak
  membuat data lelang di demo), Dashboard, Daftar Order, Cek Jadwal, Laporan, dll.
- Transporter: semua modul read-only SELESAI (termasuk Akun Saya/Profil/
  Preference Notif 2026-08-29); sisa = alur mutasi (harga, jadwal, respon
  nego, input unit, invoice, penugasan petugas) — butuh izin user.
- Modul admin lain (Validasi Akun, Setting, Master, Pengaturan Akun, sisa
  Daftar Order admin — banyak mutasi; Edit Harga sudah selesai 2026-08-28).
- `.env.example` masih berisi kredensial asli — kosongkan sebelum git init.
- Folder `specs/` & `specs/_challenge/` masih kosong (tujuan belum dijelaskan user).

## Setup environment (Linux, 2026-08-29 — repo dipindah dari Windows)

- Node **≥20** wajib (Playwright 1.62); sistem punya Node 18 → pakai nvm
  (`.nvmrc` = 22, `nvm use`). Alias `default` nvm sudah di-set ke 22.19.0
  dan `prefix` di `~/.npmrc` dihapus (bentrok dgn nvm).
- `npm install` → `npx playwright install chromium` (deps sistem sudah lengkap).
- `cp .env.example .env`, set `ADMIN_PATH=/`.
- `playwright-cli` (kalibrasi) global: `npm i -g @playwright/cli@latest`
  (terpasang di bin nvm Node 22, bukan `~/.npm-global`).
- Verifikasi: `npx playwright test --project=setup` → 6 login lulus, `.auth/` terisi.
- Shell Bash tool Claude Code = non-interaktif (`.bashrc` return di awal, nvm
  tak dimuat); bila `node -v` masih 18 di sesi ini, prefix
  `export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"` atau restart sesi.
