# Baseline sebelum patch PHP — PHP/8.2.35 (X-Powered-By)

Dibekukan 2026-10-25 sebagai pembanding regresi patch PHP. JANGAN diubah.

- `results-gabungan.json` — hasil terakhir per test dari 6 run 2026-10-24
  (462 test + 7 setup; tunnel `survival-nobody-character-plugin`, build BETA 20260228 v1.3.28).
- `plugin-hasil.json` / `plugin-inst.json` — probe plugin 2026-10-25 (87 halaman).
- `set-readonly-lengkap.txt`, `run-penuh.txt`, `penuh-*.txt`, `dikecualikan.txt` — daftar
  test yang dijalankan & dikecualikan; run sesudah patch WAJIB memakai daftar yang sama.

Alur sesudah patch: `docs/REGRESI-PATCH-PHP.md`.
