#!/bin/bash
# Regresi sesudah patch PHP — dibandingkan dengan baseline PHP/8.2.35.
# Pakai: bash scripts/regresi-patch.sh <tahap> [label]
#   tahap: cepat   = readiness + setup + smoke + probe plugin + uji ulang 3 tiket (±40 mnt)
#          penuh   = run penuh sama dgn baseline (read-only + lain + admin + shipper + transporter, ±3,5 jam)
#          banding = bandingkan hasil (test & plugin) dgn baseline, tulis laporan
#   label: penanda run (default: tanggal-jam saat ini), dipakai di PW_RUN_ID & nama laporan.
# Semua run SERIAL (sesi per akun). Tahap "penuh" memuat test mutasi (izin user 2026-10-24,
# daftar & pengecualian identik baseline: report/baseline-php-8.2.35/).
set -u
cd "$(dirname "$0")/.."
export PATH="$HOME/.nvm/versions/node/v22.19.0/bin:$PATH"
export TARGET_ENV=local
TAHAP="${1:-}"; LABEL="${2:-$(date +%Y%m%d-%H%M)}"
BL=report/baseline-php-8.2.35
RUNS=test-results/local/runs
LOG=test-results/local/regresi-$LABEL.log
mkdir -p test-results/local
say() { echo "$(date '+%F %H:%M:%S') $*" | tee -a "$LOG"; }

case "$TAHAP" in
  cepat)
    say "== readiness"; npm run -s readiness 2>&1 | tee -a "$LOG" | grep -E "X-Powered-By|GET /user|Cookie|Penghambat"
    say "== setup + smoke"; PW_RUN_ID=$LABEL-smoke npx playwright test --project=smoke >> "$LOG" 2>&1; say "smoke exit=$?"
    say "== probe plugin"; node scripts/plugin-probe.js --out=report/evidence-plugin-$LABEL >> "$LOG" 2>&1; say "probe exit=$?"
    say "== uji ulang 3 tiket"
    PW_RUN_ID=$LABEL-tiket npx playwright test --no-deps \
      tests/admin/open-stack-ganti-jadwal.spec.ts \
      tests/shipper/push-notif-trigger-request-harga.spec.ts tests/shipper/push-notif-trigger-request-jadwal.spec.ts \
      tests/transporter/push-notif-trigger-aksi-inbox.spec.ts tests/transporter/push-notif-trigger-jadwal-tersedia.spec.ts \
      tests/transporter/profil.spec.ts tests/admin/cari-penawaran.spec.ts:292 \
      tests/admin/daftar-order.spec.ts:353 tests/admin/daftar-order.spec.ts:379 >> "$LOG" 2>&1
    say "tiket exit=$?"
    ;;
  penuh)
    # Daftar baseline memakai file:baris; edit spec menggeser baris → sinkronkan dulu
    # (2026-10-25: tanpa ini run admin diam-diam memilih 181 dari 199 test).
    DT=test-results/local/daftar-terkini
    node scripts/sinkron-daftar.js --out=$DT >> "$LOG" 2>&1 || { say "STOP: ada test baseline tak ditemukan (lihat log)"; exit 1; }
    say "== read-only (daftar baseline, baris disinkronkan)"
    PW_RUN_ID=$LABEL-readonly npx playwright test $(cat $DT/set-readonly-lengkap.txt) >> "$LOG" 2>&1; say "readonly exit=$?"
    for g in lain admin shipper transporter; do
      say "== penuh-$g"
      PW_RUN_ID=$LABEL-penuh-$g npx playwright test $(cat $DT/penuh-$g.txt) >> "$LOG" 2>&1; say "penuh-$g exit=$?"
    done
    say "RUN PENUH SELESAI"
    ;;
  banding)
    S=""; for r in readonly penuh-lain penuh-admin penuh-shipper penuh-transporter; do
      f=$RUNS/$LABEL-$r/results.json; [ -f "$f" ] && S="$S${S:+,}$f"; done
    if [ -n "$S" ]; then
      node scripts/bandingkan-hasil.js --sebelum=$BL/results-gabungan.json --sesudah="$S" --out=report/banding-hasil-$LABEL.md | tee -a "$LOG"
    else say "tidak ada hasil run penuh untuk label $LABEL"; fi
    if [ -f "report/evidence-plugin-$LABEL/hasil.json" ]; then
      node scripts/bandingkan-plugin.js --sebelum=$BL/plugin-hasil.json --inst-sebelum=$BL/plugin-inst.json \
        --sesudah=report/evidence-plugin-$LABEL/hasil.json --out=report/banding-plugin-$LABEL.md | tee -a "$LOG"
    fi
    ;;
  *) echo "Pakai: bash scripts/regresi-patch.sh cepat|penuh|banding [label]"; exit 2 ;;
esac
