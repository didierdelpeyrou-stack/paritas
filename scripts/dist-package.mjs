#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════
   Argus IT — Packaging "executable" PARITAS
   ════════════════════════════════════════════════════════════════
   Pas de toolchain Rust/Tauri sur la cible — on emballe le dist/
   web en archive prête à servir, avec :
   1. Un README.md d'installation
   2. Un launcher `serve.sh` / `serve.bat` qui démarre un static server
   3. Un dist.tar.gz auto-extractible

   Usage : node scripts/dist-package.mjs
   ──────────────────────────────────────────────────────────────── */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

if (!existsSync(distDir)) {
  console.error('❌ dist/ inexistant. Lance "npm run build" d\'abord.');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  PARITAS — Packaging exécutable distribuable');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/* 1. Générer le README de distribution */
const readme = `# PARITAS — Édition portable

**Version distribuée le ${new Date().toISOString().slice(0, 10)}**

## Démarrer le jeu

### Option 1 — Installer comme application (recommandé)

1. Hébergez ce dossier sur n'importe quel serveur statique (Vercel, Netlify, GitHub Pages, ou \`./serve.sh\` local).
2. Ouvrez l'URL dans Chrome / Edge / Safari / Firefox.
3. Cliquez sur l'icône **« Installer »** dans la barre d'adresse (ou menu → Installer PARITAS).
4. Le jeu devient une application autonome avec icône sur le bureau, **utilisable hors-ligne**.

### Option 2 — Lancer le serveur local

\`\`\`bash
# macOS / Linux
./serve.sh

# Windows
serve.bat
\`\`\`

Le serveur se lance sur http://localhost:4321/portail/

### Option 3 — Servir directement avec npx

\`\`\`bash
npx serve -l 4321 dist
\`\`\`

## Contenu

- \`/\` — jeu principal (Svelte SPA)
- \`/portail/\` — page d'accueil avec les 10 ateliers
- \`/reglages/\` — accessibilité et préférences
- \`/mini/<atelier>/\` — chaque atelier en standalone

## Confidentialité

PARITAS ne collecte AUCUNE donnée par défaut. Toutes les sauvegardes
sont locales (\`localStorage\` du navigateur). Aucun envoi sur Internet.

Pour effacer toutes les données : Réglages → Effacer toutes mes données.

## Hors-ligne

Une fois la page chargée une première fois, le service worker met en
cache l'intégralité de l'application. Vous pouvez débrancher Internet,
le jeu continuera à fonctionner.

## Licence

Voir \`LICENSE\` ou \`docs/CREDITS.md\`.
`;

writeFileSync(join(distDir, 'README.md'), readme);
console.log('✓ README.md généré');

/* 2. Launcher Unix */
const serveSh = `#!/usr/bin/env sh
# PARITAS — launcher static server
PORT="\${PARITAS_PORT:-4321}"
DIR="\$(cd "\$(dirname "\$0")" && pwd)"
echo "PARITAS sur http://localhost:\$PORT/portail/"
echo "Ctrl+C pour arrêter"

if command -v python3 >/dev/null 2>&1; then
  cd "\$DIR" && python3 -m http.server "\$PORT"
elif command -v python >/dev/null 2>&1; then
  cd "\$DIR" && python -m SimpleHTTPServer "\$PORT"
elif command -v npx >/dev/null 2>&1; then
  npx -y serve -l "\$PORT" "\$DIR"
else
  echo "Aucun serveur trouvé. Installez Python 3 ou Node.js."
  exit 1
fi
`;
writeFileSync(join(distDir, 'serve.sh'), serveSh);
try { execSync(`chmod +x "${join(distDir, 'serve.sh')}"`); } catch {}
console.log('✓ serve.sh généré (Unix)');

/* 3. Launcher Windows */
const serveBat = `@echo off
REM PARITAS — launcher static server (Windows)
SET PORT=4321
echo PARITAS sur http://localhost:%PORT%/portail/
echo Ctrl+C pour arreter

where python >nul 2>nul
if %errorlevel% == 0 (
  python -m http.server %PORT%
  goto :eof
)
where npx >nul 2>nul
if %errorlevel% == 0 (
  npx -y serve -l %PORT% .
  goto :eof
)
echo Aucun serveur trouve. Installez Python 3 ou Node.js.
pause
`;
writeFileSync(join(distDir, 'serve.bat'), serveBat);
console.log('✓ serve.bat généré (Windows)');

/* 4. Tarball */
const archiveName = `paritas-${new Date().toISOString().slice(0, 10)}.tar.gz`;
const archivePath = join(root, archiveName);
console.log(`\nCompression → ${archiveName}`);
try {
  execSync(`tar -czf "${archivePath}" -C "${root}" dist`, { stdio: 'inherit' });
  const size = statSync(archivePath).size;
  console.log(`✓ Archive ${(size / 1024 / 1024).toFixed(2)} MB`);
} catch (err) {
  console.error('✗ Compression échouée:', err.message);
  process.exit(1);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ✅ PARITAS distribuable prêt`);
console.log(`     Archive : ${archiveName}`);
console.log(`     Local   : cd dist && ./serve.sh`);
console.log(`     Install : ouvrir l'URL → "Installer PARITAS"`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
