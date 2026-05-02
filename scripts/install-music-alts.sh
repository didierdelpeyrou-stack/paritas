#!/usr/bin/env bash
# Installe les 15 musiques alternatives ({era}-alt.mp3) qui composent
# la deuxième couche du système adaptatif. À chaque ère, l'engine
# peut choisir entre default (mood calme/melancolique) et alt (mood
# tendu/grave/euphorique) selon le scénario courant.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/audio/eras"
SRC="${1:-$HOME/Downloads}"

mkdir -p "$DEST"

# Mapping ère → fichier alt source
declare -a MAPPING=(
  "revolution-alt::ashot_danielyan-epic-heroic-short-version-2-117403"
  "xixe-alt::luis_humanoide-steampunk-victorian-orchestra-183196"
  "belle_epoque-alt::sonican-happy-string-quartet-loop-optimistic-classical-music-513274"
  "entre_deux_guerres-alt::vifotofreesounds-industrial-revolution-age-ambient-486676"
  "reconstruction-alt::music_unlimited-patriotic-theme-116620"
  "guerre_froide-alt::michael-x_studio-arts-of-psycho-hole-den-191407"
  "trente_glorieuses-alt::musicword-village-in-spring-318340"
  "crise-alt::4379051-the-madmanx27s-factory-163568"
  "mitterrand-alt::paulyudin-orchestral-518713"
  "cohabitations-alt::tim_kulig_free_music-if-i-only-had-a-soul-182720"
  "sarkozy-alt::paulyudin-action-518712"
  "hollande-alt::alanajordan-hot-yoga-485522"
  "macron_i-alt::sigmamusicart-epic-cinematic-background-music-434442"
  "macron_ii-alt::solarflex-orchestral-orchestral-music-515503"
  "present-alt::audioknap-industrial-516087"
)

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "✗ ffmpeg requis."
  exit 1
fi

ok=0; skip=0; fail=0
for entry in "${MAPPING[@]}"; do
  era="${entry%%::*}"
  file="${entry##*::}.mp3"
  src="$SRC/$file"
  dst="$DEST/$era.mp3"

  if [ -f "$dst" ]; then
    echo "⏭  $era.mp3 déjà présent — saute"
    skip=$((skip+1))
    continue
  fi

  if [ ! -f "$src" ]; then
    echo "✗ $era ← $file MANQUE"
    fail=$((fail+1))
    continue
  fi

  echo "→ $era ← $(basename "$src")"
  if ffmpeg -nostdin -loglevel error -y -i "$src" \
       -ss 0:15 -t 40 -ar 44100 -b:a 96k -ac 2 \
       -af "loudnorm=I=-14:LRA=7,afade=t=in:st=0:d=2,afade=t=out:st=38:d=2" \
       "$dst"; then
    echo "  ✓ $(du -h "$dst" | cut -f1)"
    ok=$((ok+1))
  else
    fail=$((fail+1))
  fi
done

echo
echo "✅ $ok converti·s · $skip déjà présent·s · $fail échec·s"
