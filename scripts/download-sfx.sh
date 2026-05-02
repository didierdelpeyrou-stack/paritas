#!/usr/bin/env bash
# Télécharge les SFX vérifiés CC0 / DP pour Paritas dans
# public/audio/sfx/. URLs vérifiées HTTP 200 audio/mpeg le 2026-05-02.
#
# Sources :
# - The Designer's Choice UCS Collection (CC0 1.0) sur archive.org
# - "crowd-cheer-ii-6263" (Public Domain Mark 1.0)
# - Wikimedia Commons "manif-motards-belfort" (CC BY 4.0 — voir CRÉDITS)
#
# Usage : bash scripts/download-sfx.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/audio/sfx"
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
  if curl -fsSL --retry 2 -o "$DEST/$out.tmp" "$url"; then
    mv "$DEST/$out.tmp" "$DEST/$out"
    echo "     ✓ $(du -h "$DEST/$out" | cut -f1)"
  else
    rm -f "$DEST/$out.tmp"
    echo "     ✗ échec"
  fi
}

normalize() {
  # Convertit le fichier source en MP3 normalisé loop-friendly.
  # Args : in_path out_path duration_s
  local src="$1"
  local out="$2"
  local dur="${3:-15}"
  if ! command -v ffmpeg >/dev/null 2>&1; then return; fi
  local tmp="$out.norm.mp3"
  if ffmpeg -nostdin -loglevel error -y -i "$src" \
       -t "$dur" -ar 44100 -b:a 96k -ac 2 \
       -af "loudnorm=I=-16:LRA=11,afade=t=in:st=0:d=0.4,afade=t=out:st=$(awk "BEGIN{print $dur-0.6}"):d=0.6" \
       "$tmp" 2>/dev/null; then
    mv "$tmp" "$out"
  else
    rm -f "$tmp"
  fi
}

echo "Téléchargement des SFX dans $DEST"
echo

# CC0 1.0 — TDC UCS Collection
download "crowd-cheer.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Crowds/CROWDS%2FAPPLAUSE%2FCRWDApls-CU_Crowd%20Applause%2C%20Cheering%2C%20Yelling%2C%20Whooping_Nicholas%20Judy_TDC.mp3" \
  "Crowd applause + cheer (CC0)"

download "applause-soft.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Human/HUMAN%2FSKIN%2FHMNSkin-Blue%20Snowball%20Microphone%2C%20CU_Applause%2C%20Single%20Person%2C%20Clapping_Nicholas%20Judy_TDC.mp3" \
  "Applause soft (single person, CC0)"

download "shout-victory.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Voices/VOICES%2FFUTZED%2FVOXFutz-Samsung%20Galaxy%20Smartphone%2C%20CU_Megaphone%2C%20Talk%2C%20%27Thank%20You%21%27_Nicholas%20Judy_TDC.mp3" \
  "Megaphone shout (CC0)"

download "shout-anger.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Voices/VOICES%2FSCREAM%2FVOXScrm-CU_Scream%2C%20Angry%2C%20Man_Nicholas%20Judy_TDC.mp3" \
  "Angry man scream (CC0)"

download "whispers-assembly.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Voices/VOICES%2FWHISPER%2FVOXWhsp-Blue%20Snowball%20Microphone%2C%20MCU_Whispering_Nicholas%20Judy_TDC.mp3" \
  "Whispering (CC0)"

download "paper-rustle.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Paper/PAPER%2FHANDLE%2FPAPRHndl-Blue%20Snowball%20Microphone%2C%20CU_Paper%2C%20Crumple_Nicholas%20Judy_TDC.mp3" \
  "Paper crumple (CC0)"

download "pen-sign.mp3" \
  "https://archive.org/download/Designers-Choice-Collection-Paper/PAPER%2FIMPACT%2FPAPRImpt-Blue%20Snowball%20Microphone%2C%20CU_Pencil%2C%20Stab%20In%2C%20Out%20of%20Paper_Nicholas%20Judy_TDC.mp3" \
  "Pencil on paper (CC0)"

# Public Domain Mark 1.0
download "crowd-cheer-alt.mp3" \
  "https://archive.org/download/crowd-cheer-ii-6263/crowd-cheer-ii-6263.mp3" \
  "Crowd cheer alt (PD)"

# CC0 — COVID applause (sera utilisé comme crowd-whisper / ambiance)
download "crowd-whisper-raw.mp3" \
  "https://archive.org/download/COVID-19_applause/2020-03-30%20Ambience.mp3" \
  "Lobby ambience (CC0)"

# CC BY 4.0 — Wikimedia, attribution requise (voir CREDITS.md)
download "crowd-protest-raw.ogg" \
  "https://upload.wikimedia.org/wikipedia/commons/4/4a/2017-07-01_14-56-25_manif-motards-belfort.ogg" \
  "Manifestation Belfort (CC BY 4.0)"

# Normalisation + trim 15-20 s pour les fichiers trop longs.
echo
if command -v ffmpeg >/dev/null 2>&1; then
  echo "Normalisation ffmpeg…"
  [ -f "$DEST/crowd-whisper-raw.mp3" ] && normalize "$DEST/crowd-whisper-raw.mp3" "$DEST/crowd-whisper.mp3" 20 \
    && rm -f "$DEST/crowd-whisper-raw.mp3" && echo "  ✓ crowd-whisper.mp3"
  [ -f "$DEST/crowd-protest-raw.ogg" ] && normalize "$DEST/crowd-protest-raw.ogg" "$DEST/crowd-protest.mp3" 25 \
    && rm -f "$DEST/crowd-protest-raw.ogg" && echo "  ✓ crowd-protest.mp3"
  # Applause-strong = crowd-cheer trimmed plus court et plus fort
  [ -f "$DEST/crowd-cheer.mp3" ] && [ ! -f "$DEST/applause-strong.mp3" ] \
    && normalize "$DEST/crowd-cheer.mp3" "$DEST/applause-strong.mp3" 8 \
    && echo "  ✓ applause-strong.mp3 (extrait court de crowd-cheer)"
else
  echo "ffmpeg absent — fichiers bruts laissés tels quels."
fi

echo
echo "✅ Terminé. SFX disponibles dans $DEST"
ls -lh "$DEST" 2>/dev/null | tail -n +2
