<script lang="ts">
  /* ORDA-018 PARITAS — refacto CSS Confrontation (dette ORDA-006).
     Sous-composant 1/4 : Header + tutoriel diégétique.
     Extrait du monolithe Confrontation.svelte (1007 LoC). */

  interface Props {
    round: number;
    onskip?: () => void;
    showTuto: boolean;
    onDismissTuto: () => void;
  }

  const { round, onskip, showTuto, onDismissTuto }: Props = $props();
</script>

<div class="rue-header">
  <div>
    <span class="eyebrow">ATELIER · LA RUE</span>
    <h1>Police <span class="vs">VS</span> Manifestants</h1>
  </div>
  <div class="header-right">
    <span class="round-badge">ROUND {round}/3</span>
    {#if onskip}
      <button class="skip-btn" onclick={onskip}>Passer →</button>
    {/if}
  </div>
</div>

{#if showTuto}
  <aside class="atelier-tuto" role="note" aria-label="Comment ça marche">
    <div class="atelier-tuto-head">
      <span class="atelier-tuto-icon" aria-hidden="true">🪖</span>
      <h2 class="atelier-tuto-title">Premier round — la rue se tend</h2>
      <button type="button" class="atelier-tuto-close" onclick={onDismissTuto} aria-label="Fermer le tutoriel">×</button>
    </div>
    <ul class="atelier-tuto-list">
      <li><strong>Je joue trois rounds</strong> en simultané, mon adversaire et moi posons un coup en aveugle. Le <em>curseur</em> central glisse vers MANIFESTANTS ou POLICE.</li>
      <li><strong>Je calcule mes coups</strong> : tenir, charger, scander, contourner côté manif ; nasser, disperser, négocier côté police. Chaque coup a son meilleur contre.</li>
      <li><strong>Je gagne en faisant basculer la zone</strong> au-delà du seuil, sans m'épuiser. Une victoire à la Pyrrhus se paie en santé sociale.</li>
    </ul>
  </aside>
{/if}

<style>
  .rue-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .eyebrow {
    display: block;
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    color: #666;
    margin-bottom: 0.15rem;
  }

  .rue-header h1 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #fff;
    font-family: 'Georgia', serif;
  }

  .vs {
    color: #666;
    font-size: 1rem;
    font-family: 'Courier New', monospace;
    margin: 0 0.4rem;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .round-badge {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: #b8860b;
    border: 1px solid #4a3010;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
  }

  /* ORDA-015 (P0 Wroblewski) : tap-target WCAG 2.5.8 — préservé. */
  .skip-btn {
    background: transparent;
    border: 1px solid #222;
    color: #555;
    padding: 0.3rem 0.6rem;
    border-radius: 3px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    transition: all 0.2s;
  }

  .skip-btn:hover {
    border-color: #555;
    color: #888;
  }

  /* Tutoriel diégétique (ORDA-015 PARITAS) */
  .atelier-tuto {
    background: linear-gradient(135deg, rgba(196,74,26,0.12), rgba(51,68,102,0.06));
    border: 1px solid #2a2a2a;
    border-left: 3px solid #b8860b;
    border-radius: 0.4rem;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
  }
  .atelier-tuto-head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
  .atelier-tuto-icon { font-size: 1.05rem; }
  .atelier-tuto-title { flex: 1; font-size: 0.82rem; font-weight: 700; color: #b8860b; margin: 0; letter-spacing: 0.04em; }
  .atelier-tuto-close {
    background: transparent; border: 1px solid #2a2a2a; color: #888;
    width: 26px; height: 26px; border-radius: 4px; cursor: pointer;
    font-size: 1rem; line-height: 1;
  }
  .atelier-tuto-close:hover { border-color: #b8860b; color: #b8860b; }
  .atelier-tuto-list {
    margin: 0; padding-left: 1.1rem;
    font-size: 0.78rem; color: #b8b8b8; line-height: 1.55;
  }
  .atelier-tuto-list li { margin-bottom: 0.3rem; }
  .atelier-tuto-list li:last-child { margin-bottom: 0; }
  .atelier-tuto-list strong { color: #e0e0e0; }
  .atelier-tuto-list em { color: #b8860b; font-style: normal; }
</style>
