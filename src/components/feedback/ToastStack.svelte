<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import type { EraId, Resources, ResourceKey } from '../../game/types';
  import { RESOURCE_LABELS } from '../../game/simulation/resources';
  import { currencyForEra } from '../../game/content/eras';
  import { thresholdFor } from '../../game/simulation/resourceUtility';
  import { sfx } from '../../game/audio/sfx';

  function resourceLabel(key: keyof Resources, era: EraId): string {
    if (key === 'caisse') {
      const c = currencyForEra(era);
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
    return RESOURCE_LABELS[key];
  }

  /* Style diégétique du support de notification selon l'ère
     (immersion). Plutôt qu'un toast système 2024, une note glissée
     par ton secrétariat dans le support d'époque correspondant.
     - Révolution → billet manuscrit à la plume
     - XIXe / Belle Époque → télégramme imprimé
     - Entre-deux-guerres / Reconstruction → note dactylographiée
     - Trentes Glorieuses / Crise → note polycopiée
     - Mitterrand → présent → fax / mémo / mail intranet */
  function noteCarrierFor(era: EraId): { label: string; supportClass: string } {
    if (era === 'revolution') {
      return { label: 'Un cahier de doléances', supportClass: 'support-doleances' };
    }
    if (era === 'xixe' || era === 'belle_epoque') {
      return { label: 'Un télégramme', supportClass: 'support-telegramme' };
    }
    if (era === 'entre_deux_guerres' || era === 'reconstruction') {
      return { label: 'Une note dactylographiée', supportClass: 'support-tape' };
    }
    if (era === 'guerre_froide' || era === 'trente_glorieuses' || era === 'crise') {
      return { label: 'Une note polycopiée', supportClass: 'support-roneo' };
    }
    return { label: 'Un mémo', supportClass: 'support-memo' };
  }

  /* Suggestion d'action contextuelle quand une jauge bascule en
     critique (retour live test patronat P1 §2 — « le toast me dit
     que c'est critique mais je ne sais pas où aller »). */
  const CRITICAL_HINT: Partial<Record<keyof Resources, string>> = {
    caisse:          '→ Budget (Trésorerie)',
    confiance:       '→ Meeting public',
    cohesionInterne: '→ Tracts ou Congrès',
    rapportDeForce:  '→ Manifestation',
    legitimite:      '→ Presse ou Délégation',
    institution:     '→ Aménager le siège',
    santeSociale:    '→ Pétition'
  };

  /* Snapshot précédent des ressources — non réactif pour ne pas re-trigger
     l'effet sur écriture. */
  let previous: Resources | null = null;

  interface Toast {
    id: number;
    text: string;
    tone: 'positive' | 'negative' | 'warning';
    /** Support diégétique selon l'ère du tour où le toast naît. */
    carrier: { label: string; supportClass: string };
  }

  let toasts = $state<Toast[]>([]);
  let nextId = 0;

  /* UX-N1 : aversion à la perte (Kahneman-Tversky). Les pertes
     restent ~50% plus longtemps que les gains, en accord avec le
     coefficient ψ ≈ 2 du modèle prospect theory. Visuellement :
     toast plus large, fond rouge brûlé, micro-shake horizontal. */
  function durationFor(tone: Toast['tone']): number {
    if (tone === 'negative') return 5000;   // pertes : poids ressenti plus long
    if (tone === 'warning') return 4500;
    return 3200;                            // gains : poids plus court
  }

  function push(text: string, tone: Toast['tone'], era: EraId) {
    const t: Toast = { id: nextId++, text, tone, carrier: noteCarrierFor(era) };
    toasts = [...toasts, t];
    setTimeout(() => {
      toasts = toasts.filter(x => x.id !== t.id);
    }, durationFor(tone));
  }

  $effect(() => {
    const s = rebirth.state;
    if (!s) {
      /* Le joueur est sur StartScreen / a fait Rejouer : on remet
         le snapshot à zéro pour ne pas comparer une nouvelle partie
         avec la fin de l'ancienne. */
      previous = null;
      return;
    }
    const cur = s.resources;
    if (!previous) {
      previous = { ...cur };
      return;
    }
    /* Compare et émet pour les deltas significatifs (≥4). */
    for (const key of Object.keys(cur) as Array<keyof Resources>) {
      const delta = cur[key] - previous[key];
      const lbl = resourceLabel(key, s.era);
      if (Math.abs(delta) >= 4) {
        const sign = delta > 0 ? '+' : '';
        push(`${lbl} ${sign}${Math.round(delta)}`, delta > 0 ? 'positive' : 'negative', s.era);
      }
      /* Alerte de seuil critique sur transition descendante uniquement. */
      if (cur[key] <= 18 && previous[key] > 18) {
        const hint = CRITICAL_HINT[key];
        push(`${lbl} en zone critique${hint ? '  ' + hint : ''}`, 'warning', s.era);
        void sfx.play('criticalAlert');
      }
      /* Franchissement de palier (montée OU chute) — annonce ce qui
         s'ouvre / se ferme avec le texte d'unlock. Compétence (Deci &
         Ryan) : le joueur voit le franchissement comme un événement,
         pas comme un nombre qui change. */
      const prevPalier = thresholdFor(key as ResourceKey, previous[key]);
      const curPalier  = thresholdFor(key as ResourceKey, cur[key]);
      if (curPalier.level !== prevPalier.level) {
        const climbing = cur[key] > previous[key];
        if (climbing) {
          push(`${lbl} → palier ${curPalier.level.toUpperCase()}\n${curPalier.unlock}`, 'positive', s.era);
        } else {
          push(`${lbl} retombe en ${curPalier.level.toUpperCase()}\n${curPalier.unlock}`, 'warning', s.era);
        }
      }
    }
    previous = { ...cur };
  });
</script>

<div class="toast-stack" aria-live="polite" aria-atomic="false">
  {#each toasts as t (t.id)}
    <div
      class="toast {t.carrier.supportClass}"
      data-tone={t.tone}
      in:fly={{ x: 24, y: 6, duration: 320 }}
      out:fade={{ duration: 220 }}
    >
      <span class="carrier-tag">{t.carrier.label}</span>
      <span class="toast-body">{t.text}</span>
    </div>
  {/each}
</div>

<style>
  .toast-stack {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: flex-end;
    pointer-events: none;
  }

  .toast {
    /* Note diégétique : posée comme un papier sur le bureau. Les
       déclinaisons par ère viennent surcharger le fond / la fonte. */
    position: relative;
    border: 1px solid rgba(120, 95, 60, 0.55);
    border-radius: 0.15rem;
    padding: 0.6rem 0.85rem 0.55rem;
    color: #2A1A0E;
    font-size: 0.78rem;
    letter-spacing: 0.01em;
    line-height: 1.35;
    box-shadow:
      0 6px 14px rgba(0, 0, 0, 0.40),
      0 1px 0 rgba(255, 255, 255, 0.05) inset;
    pointer-events: auto;
    max-width: 22rem;
    /* Léger basculement papier — différent par toast pour ne pas
       avoir l'air mécanique */
    transform: rotate(-0.4deg);
    transform-origin: top right;
  }
  .toast:nth-child(2n) { transform: rotate(0.5deg); }
  .toast:nth-child(3n) { transform: rotate(-0.7deg); }

  .carrier-tag {
    display: block;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(60, 38, 21, 0.65);
    margin-bottom: 0.18rem;
  }

  .toast-body {
    display: block;
    font-family: 'Source Serif 4', Georgia, serif;
    /* Permet aux toasts de palier d'afficher leur unlock multi-lignes
       (ligne 1 = titre, ligne 2 = explication). */
    white-space: pre-line;
  }

  /* === Supports diégétiques par ère ===
     Chacun a sa texture, sa fonte, son grain. */

  /* Cahier de doléances — papier vergé crème, plume brune */
  .support-doleances {
    background:
      repeating-linear-gradient(0deg,
        rgba(180, 140, 90, 0.04) 0,
        rgba(180, 140, 90, 0.04) 1px,
        transparent 1px,
        transparent 4px),
      linear-gradient(180deg, #f4ead0 0%, #e8d8a8 100%);
    color: #4a2818;
    font-family: 'Cinzel', Georgia, serif;
    border-color: rgba(122, 70, 30, 0.5);
  }
  .support-doleances .carrier-tag { color: rgba(80, 40, 20, 0.7); }
  .support-doleances .toast-body { font-family: 'Cinzel', Georgia, serif; font-style: italic; }

  /* Télégramme — bandes horizontales, encre noire dense */
  .support-telegramme {
    background:
      repeating-linear-gradient(0deg,
        rgba(100, 80, 50, 0.06) 0,
        rgba(100, 80, 50, 0.06) 14px,
        transparent 14px,
        transparent 16px),
      linear-gradient(180deg, #f8f3e3 0%, #e8e0c8 100%);
    color: #1a1208;
    font-family: 'Courier Prime', 'Courier New', monospace;
    border-color: rgba(80, 60, 30, 0.55);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .support-telegramme .toast-body { font-family: inherit; }

  /* Note dactylographiée — papier blanc cassé, machine à écrire */
  .support-tape {
    background: linear-gradient(180deg, #f0e8d2 0%, #d8ceb0 100%);
    color: #1a1411;
    font-family: 'Courier Prime', 'Courier New', monospace;
    border-color: rgba(80, 60, 30, 0.5);
  }
  .support-tape .toast-body { font-family: inherit; }

  /* Note polycopiée — papier bleu pâle, encre violette ronéo */
  .support-roneo {
    background:
      repeating-linear-gradient(45deg,
        rgba(60, 40, 100, 0.025) 0,
        rgba(60, 40, 100, 0.025) 2px,
        transparent 2px,
        transparent 6px),
      linear-gradient(180deg, #e0e8f0 0%, #c8d2dc 100%);
    color: #1a1438;
    font-family: 'Courier Prime', 'Courier New', monospace;
    border-color: rgba(60, 40, 100, 0.4);
  }
  .support-roneo .toast-body { font-family: inherit; }
  .support-roneo .carrier-tag { color: rgba(60, 40, 100, 0.65); }

  /* Mémo intranet — fond gris clair, sans serif moderne */
  .support-memo {
    background: linear-gradient(180deg, #f4f4f0 0%, #e0e0d8 100%);
    color: #1a1411;
    font-family: 'Source Sans 3', 'Helvetica Neue', sans-serif;
    border-color: rgba(60, 60, 60, 0.4);
    border-radius: 0.3rem;
  }
  .support-memo .toast-body { font-family: inherit; }
  .support-memo .carrier-tag { color: rgba(40, 40, 40, 0.65); }

  /* === UX-N1 — asymétrie pertes/gains ===
     Les pertes sont ~1.5x plus saillantes : tampon URGENT en cachet,
     bordure latérale, micro-shake. La texture diégétique est
     préservée — on ajoute un cachet, on ne barbouille pas le fond.
     (Aversion à la perte — Tversky) */
  .toast[data-tone='positive']::after {
    content: '✓';
    position: absolute;
    top: 0.35rem; right: 0.55rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    color: #1f6638;
    opacity: 0.7;
  }

  .toast[data-tone='negative'] {
    /* Bordure latérale rouge encre + cachet « URGENT » */
    border-left: 4px solid #8b1f1b;
    padding-left: 0.95rem;
    padding-right: 1.1rem;
    font-weight: 600;
    animation: loss-shake 0.42s ease-out;
  }
  .toast[data-tone='negative']::after {
    content: 'URGENT';
    position: absolute;
    top: 0.35rem; right: 0.55rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.55rem;
    letter-spacing: 0.1em;
    color: #8b1f1b;
    border: 1px solid #8b1f1b;
    padding: 0.05rem 0.3rem;
    border-radius: 0.1rem;
    transform: rotate(-8deg);
    opacity: 0.85;
  }

  .toast[data-tone='warning'] {
    border-left: 4px solid #b07820;
    padding-left: 0.95rem;
  }
  .toast[data-tone='warning']::after {
    content: '⚠';
    position: absolute;
    top: 0.35rem; right: 0.55rem;
    color: #b07820;
    font-size: 0.95rem;
    opacity: 0.85;
  }

  @keyframes loss-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-3px); }
    40% { transform: translateX(3px); }
    60% { transform: translateX(-2px); }
    80% { transform: translateX(2px); }
  }
</style>
