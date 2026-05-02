#!/usr/bin/env bash
# Télécharge les SFX nature/ambient pour la couche pad de Paritas.
# URLs vérifiées HTTP 200 le 2026-05-02.
# Sources :
# - The Designer's Choice UCS Collection sur archive.org (CC0 1.0)
# - aporee item dolina6mar2013 (PD Mark 1.0)
# - Wikimedia Commons Samariter Church Bell (CC BY-SA 4.0, attribution
#   visible dans Settings → Crédits audio)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/audio/sfx"
mkdir -p "$DEST"

download() {
  local out="$1" url="$2" label="$3"
  if [ -f "$DEST/$out" ]; then
    echo "  ⏭  $out déjà présent — saute"
    return
  fi
  echo "  ⬇  $label → $out"
  if curl -fsSL --retry 3 -o "$DEST/$out.tmp" "$url"; then
    mv "$DEST/$out.tmp" "$DEST/$out"
    echo "     ✓ $(du -h "$DEST/$out" | cut -f1)"
  else
    rm -f "$DEST/$out.tmp"
    echo "     ✗ échec (réessaye plus tard, archive.org throttle)"
  fi
}

echo "Téléchargement nature/ambient SFX…"
echo

download "birds-morning.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Birds/BIRDS/SONGBIRD/BIRDSong-Samsung%20Galaxy%20Smartphone%2C%20Distant_Northern%20Mockingbird%2C%20Florida_Nicholas%20Judy_TDC.mp3" \
  "Bird songs (CC0)"

download "rain-soft.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Rain/RAIN/GENERAL/RAIN-Samsung%20Galaxy%20Smartphone%2C%20CU_Raining_Nicholas%20Judy_TDC.mp3" \
  "Rain soft (CC0)"

download "rain-storm.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Weather/WEATHER/STORM/STORM-Samsung%20Galaxy%20Smartphone%2C%20CU_Heavy%20Rain%2C%20Loud%20Thunder%20Rumbles%2C%20Overlapped_Nicholas%20Judy_TDC.mp3" \
  "Rain storm + thunder (CC0)"

download "wind-leaves.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Wind/WIND/VEGETATION/WINDVege-Samsung%20Galaxy%20Smartphone%2C%20CU_Thru%20Trees%2C%20Rustling%2C%20Faint%20Crickets_Nicholas%20Judy_TDC.mp3" \
  "Wind through leaves (CC0)"

download "fire-crackle.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Fire/FIRE/BURNING/FIREBurn-Samsung%20Galaxy%20Smartphone%2C%20CU_Campfire%20Crackling_Nicholas%20Judy_TDC.mp3" \
  "Campfire crackling (CC0)"

download "river-stream.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Water/WATER/FLOW/WATRFlow-Samsung%20Galaxy%20Smartphone%2C%20MCU_Rapid%2C%20Rushing%2C%20Looped_Nicholas%20Judy_TDC.mp3" \
  "River stream (CC0)"

download "distant-crowd.ogg" \
  "https://archive.org/download/aporee_17008_19802/dolina6mar201317371.ogg" \
  "Distant crowd murmur (PD)"

download "church-bell.ogg" \
  "https://upload.wikimedia.org/wikipedia/commons/2/22/Samariter_Church_bell_I_%28Es%29_01.ogg" \
  "Church bell (CC BY-SA 4.0)"

echo
# Normalisation : trim et égalise les volumes pour qu'ils s'enchaînent
if command -v ffmpeg >/dev/null 2>&1; then
  echo "Normalisation ffmpeg (trim + loudnorm)…"
  for f in birds-morning rain-soft rain-storm wind-leaves fire-crackle river-stream distant-crowd; do
    src=""
    [ -f "$DEST/$f.mp3" ] && src="$DEST/$f.mp3"
    [ -f "$DEST/$f.ogg" ] && src="$DEST/$f.ogg"
    [ -z "$src" ] && continue
    out="$DEST/$f.norm.mp3"
    if ffmpeg -nostdin -loglevel error -y -i "$src" \
         -t 20 -ar 44100 -b:a 96k -ac 2 \
         -af "loudnorm=I=-18:LRA=10,afade=t=in:st=0:d=0.6,afade=t=out:st=19.4:d=0.6" \
         "$out" 2>/dev/null; then
      mv "$out" "$DEST/$f.mp3"
      [ -f "$DEST/$f.ogg" ] && rm "$DEST/$f.ogg"
      echo "  ✓ $f.mp3"
    fi
  done
  # church-bell on garde court (~5s), pas de loop
  if [ -f "$DEST/church-bell.ogg" ]; then
    ffmpeg -nostdin -loglevel error -y -i "$DEST/church-bell.ogg" \
      -t 5 -ar 44100 -b:a 96k -ac 2 \
      -af "loudnorm=I=-18,afade=t=out:st=4.5:d=0.5" \
      "$DEST/church-bell.mp3" 2>/dev/null && rm "$DEST/church-bell.ogg" && echo "  ✓ church-bell.mp3"
  fi
fi

echo
echo "✅ Terminé. SFX nature dans $DEST"
