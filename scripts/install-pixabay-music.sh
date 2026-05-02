#!/usr/bin/env bash
# Mappe les 48 MP3 Pixabay du dossier ~/Downloads vers les 12 ères
# manquantes de Paritas, avec normalisation ffmpeg (40 s loop, -14 LUFS).
#
# Usage : bash scripts/install-pixabay-music.sh
#
# Si un fichier source manque, le script saute et continue (logue un
# warning). Idempotent : ne re-traite pas une ère déjà posée.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/audio/eras"
SRC="${1:-$HOME/Downloads}"

mkdir -p "$DEST"

# Mapping ère → fichier source (sans extension, le script ajoute .mp3)
declare -a MAPPING=(
  "xixe::jean-paul-v-naissance-dx27une-industrie-307237"
  "belle_epoque::sonican-happy-string-quartet-loop-optimistic-classical-music-513274"
  "guerre_froide::szegvaria-old-nuclear-factory-atmo-drone-thriller-9358"
  "trente_glorieuses::comastudio-inspiring-epic_comfort-106802"
  "crise::drmseq-dark-factory-sequence-514677"
  "mitterrand::alexgrohl-summer-wave-techno-wave-199179"
  "cohabitations::paulyudin-soft-518715"
  "sarkozy::leberch-suspense-516354"
  "hollande::music_for_video-please-calm-my-mind-125566"
  "macron_i::leberch-piano-516448"
  "macron_ii::solarflex-epic-cinematic-515509"
  "present::aicanvas-ride-through-time-caboose-mix-421631"
)

echo "Source : $SRC"
echo "Cible  : $DEST"
echo

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "✗ ffmpeg requis pour la normalisation. Installe-le (brew install ffmpeg)."
  exit 1
fi

ok=0; skip=0; fail=0
for entry in "${MAPPING[@]}"; do
  era="${entry%%::*}"
  file="${entry##*::}.mp3"
  src="$SRC/$file"
  dst="$DEST/$era.mp3"

  if [ -f "$dst" ]; then
    # Vérifie taille — si ~470 KB c'est déjà notre format, on saute
    size=$(stat -f%z "$dst" 2>/dev/null || stat -c%s "$dst" 2>/dev/null || echo 0)
    if [ "$size" -lt 800000 ] && [ "$size" -gt 100000 ]; then
      echo "⏭  $era.mp3 déjà présent et normalisé — saute"
      skip=$((skip+1))
      continue
    fi
  fi

  if [ ! -f "$src" ]; then
    echo "✗ $era ← $file MANQUE dans $SRC"
    fail=$((fail+1))
    continue
  fi

  echo "→ $era ← $(basename "$src")"
  if ffmpeg -nostdin -loglevel error -y -i "$src" \
       -ss 0:15 -t 40 -ar 44100 -b:a 96k -ac 2 \
       -af "loudnorm=I=-14:LRA=7,afade=t=in:st=0:d=2,afade=t=out:st=38:d=2" \
       "$dst" 2>&1; then
    echo "  ✓ $(du -h "$dst" | cut -f1)"
    ok=$((ok+1))
  else
    echo "  ✗ ffmpeg a échoué"
    fail=$((fail+1))
  fi
done

echo
echo "✅ $ok converti·s · $skip déjà présent·s · $fail échec·s"
echo
echo "Test : npm run dev → http://localhost:4321 → ♫"
