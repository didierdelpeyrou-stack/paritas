<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import type { Resources } from '../../game/types';
  import { RESOURCE_LABELS } from '../../game/simulation/resources';
  import { sfx } from '../../game/audio/sfx';

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

  function push(text: string, tone: Toast['tone']) {
    const t: Toast = { id: nextId++, text, tone };
    toasts = [...toasts, t];
    setTimeout(() => {
      toasts = toasts.filter(x => x.id !== t.id);
    }, 3500);
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
      if (Math.abs(delta) >= 4) {
        const sign = delta > 0 ? '+' : '';
        push(`${RESOURCE_LABELS[key]} ${sign}${Math.round(delta)}`, delta > 0 ? 'positive' : 'negative');
      }
      /* Alerte de seuil critique sur transition descendante uniquement. */
      if (cur[key] <= 18 && previous[key] > 18) {
        push(`${RESOURCE_LABELS[key]} en zone critique`, 'warning');
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

  .toast[data-tone='positive'] {
    border-color: rgba(95, 181, 107, 0.55);
    color: #aedab5;
  }

  .toast[data-tone='negative'] {
    border-color: rgba(224, 122, 110, 0.55);
    color: #e8a09b;
  }

  .toast[data-tone='warning'] {
    border-color: rgba(244, 213, 139, 0.7);
    background: rgba(201, 154, 64, 0.18);
    color: #f4d58b;
  }
</style>
