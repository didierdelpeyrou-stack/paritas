#!/usr/bin/env bash
# Télécharge les 3 fichiers musicaux DP vérifiés (Wikimedia Commons)
# pour Paritas. URLs vérifiées HTTP 200 le 2026-05-02.
#
# Usage : bash scripts/download-music.sh
#
# Pose dans public/audio/eras/ :
#   - revolution.ogg
#   - entre_deux_guerres.ogg
#   - reconstruction.ogg
#
# Pour les 12 autres ères, télécharge manuellement depuis Pixabay
# (voir src/lib/audio/_MUSIC_SOURCES.md pour les liens de recherche).

set -euo pipefail

# Cherche la racine du projet (le dossier qui contient package.json).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/audio/eras"

mkdir -p "$DEST"

download() {
  local out="$1"
  local url="$2"
  local label="$3"

  if [ -f "$DEST/$out" ]; then
    echo "  ⏭  $out déjà présent — saute"
    return
  fi

  echo "  ⬇  $label → $out"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL --retry 2 -o "$DEST/$out" "$url" \
      || { echo "     ✗ échec curl pour $url"; rm -f "$DEST/$out"; return 1; }
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$DEST/$out" "$url" \
      || { echo "     ✗ échec wget pour $url"; rm -f "$DEST/$out"; return 1; }
  else
    echo "     ✗ ni curl ni wget — installe l'un des deux"
    return 1
  fi
  echo "     ✓ $(du -h "$DEST/$out" | cut -f1)"
}

echo "Téléchargement des fichiers DP de Paritas dans $DEST"
echo

download "revolution.ogg" \
  "https://upload.wikimedia.org/wikipedia/commons/3/30/La_Marseillaise.ogg" \
  "La Marseillaise (Rouget de Lisle, 1792, DP)"

download "entre_deux_guerres.ogg" \
  "https://upload.wikimedia.org/wikipedia/commons/6/6e/L%27internationale.ogg" \
  "L'Internationale (Pottier/Degeyter, CC0/DP)"

download "reconstruction.ogg" \
  "https://upload.wikimedia.org/wikipedia/commons/f/f0/La_Marseillaise_Rouget_de_Lisle_Musique_de_la_Garde_R%C3%A9publicaine.ogg" \
  "Marseillaise Garde Républicaine (DP)"

echo

# Conversion .ogg → .mp3 (40 s loop-friendly, normalisé -14 LUFS, ~300 KB)
# si ffmpeg est disponible. Sinon les .ogg restent — Tone.Player les lit aussi.
if command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg détecté — conversion en MP3 normalisés (40 s, ~300 KB)…"
  for ogg in "$DEST"/*.ogg; do
    [ -e "$ogg" ] || continue
    mp3="${ogg%.ogg}.mp3"
    if [ -f "$mp3" ]; then
      echo "  ⏭  $(basename "$mp3") déjà présent — saute"
      continue
    fi
    if ffmpeg -nostdin -loglevel error -y -i "$ogg" \
         -ss 0:30 -t 40 -ar 44100 -b:a 96k \
         -af "loudnorm=I=-14:LRA=7,afade=t=in:st=0:d=2,afade=t=out:st=38:d=2" \
         "$mp3"; then
      rm -f "$ogg"
      echo "  ✓ $(basename "$mp3") ($(du -h "$mp3" | cut -f1))"
    else
      echo "  ✗ ffmpeg a échoué sur $(basename "$ogg") — .ogg conservé"
    fi
  done
else
  echo "ffmpeg absent — les .ogg restent (lus directement par Tone.Player)."
  echo "Pour réduire à ~300 KB, installe ffmpeg puis :"
  echo "   for f in $DEST/*.ogg; do"
  echo "     ffmpeg -i \"\$f\" -ss 0:30 -t 40 -ar 44100 -b:a 96k \\"
  echo "       -af 'loudnorm=I=-14:LRA=7,afade=t=in:st=0:d=2,afade=t=out:st=38:d=2' \\"
  echo "       \"\${f%.ogg}.mp3\" && rm \"\$f\""
  echo "   done"
fi

echo
echo "✅ Terminé. Pour les 12 ères restantes :"
echo "   ouvre src/lib/audio/_MUSIC_SOURCES.md et suis les liens Pixabay."
