#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════
# Installe les 30 agents bêta-testeurs en local (.claude/agents/).
# Source : docs/beta-30-agents/agent-NN-prenom.md (committables).
# Cible  : .claude/agents/agent-NN-prenom.md (gitignoré, local).
# ────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/docs/beta-30-agents"
DST_DIR="$REPO_ROOT/.claude/agents"

if [ ! -d "$SRC_DIR" ]; then
  echo "✗ $SRC_DIR introuvable. Lance d'abord :"
  echo "  node scripts/generate-beta-agents.mjs"
  exit 1
fi

mkdir -p "$DST_DIR"

count=0
for f in "$SRC_DIR"/agent-*.md; do
  [ -e "$f" ] || continue
  cp "$f" "$DST_DIR/"
  count=$((count + 1))
done

echo "✓ $count agents installés dans $DST_DIR"
echo "→ Invocation : @agent-NN-prenom dans Claude Code (ex. @agent-01-wroblewski)"
