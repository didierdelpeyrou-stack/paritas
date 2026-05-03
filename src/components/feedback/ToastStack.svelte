<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import type { EraId, Resources } from '../../game/types';
  import { RESOURCE_LABELS } from '../../game/simulation/resources';
  import { currencyForEra } from '../../game/content/eras';
  import { sfx } from '../../game/audio/sfx';

  function resourceLabel(key: keyof Resources, era: EraId): string {
    if (key === 'caisse') {
      const c = currencyForEra(era);
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
    return RESOURCE_LABELS[key];
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

  function push(text: string, tone: Toast['tone']) {
    const t: Toast = { id: nextId++, text, tone };
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
        push(`${lbl} ${sign}${Math.round(delta)}`, delta > 0 ? 'positive' : 'negative');
      }
      /* Alerte de seuil critique sur transition descendante uniquement. */
      if (cur[key] <= 18 && previous[key] > 18) {
        const hint = CRITICAL_HINT[key];
        push(`${lbl} en zone critique${hint ? '  ' + hint : ''}`, 'warning');
        void sfx.play('criticalAlert');
      }
    }
    previous = { ...cur };
  });
</script>

<div class="toast-stack" aria-live="polite" aria-atomic="false">
  {#each toasts as t (t.id)}
    <div
      class="toast"
      data-tone={t.tone}
      in:fly={{ y: 12, duration: 220 }}
      out:fade={{ duration: 200 }}
    >
      {t.text}
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
    border: 1px solid rgba(244, 213, 139, 0.4);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.92);
    backdrop-filter: blur(2px);
    padding: 0.45rem 0.75rem;
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
    pointer-events: auto;
  }

  /* === UX-N1 — asymétrie pertes/gains ===
     Les pertes sont ~1.5x plus saillantes : taille, fond, shake.
     Cohérent avec coefficient d'aversion à la perte (Tversky). */
  .toast[data-tone='positive'] {
    border-color: var(--sem-positive);
    background: var(--sem-gain-bg);
    color: #d1fae5;
  }

  .toast[data-tone='negative'] {
    border-color: var(--sem-danger);
    background: var(--sem-loss-bg);
    color: #fecaca;
    /* Plus grand : padding et font weight bumped */
    padding: 0.6rem 0.95rem;
    font-size: 0.82rem;
    font-weight: 600;
    /* Shake initial très subtil pour attirer le coin de l'œil */
    animation: loss-shake 0.42s ease-out;
  }

  .toast[data-tone='warning'] {
    border-color: var(--sem-warning);
    background: var(--sem-warning-soft);
    color: #fef3c7;
  }

  @keyframes loss-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-3px); }
    40% { transform: translateX(3px); }
    60% { transform: translateX(-2px); }
    80% { transform: translateX(2px); }
  }
</style>
