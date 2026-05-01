<script lang="ts">
  import type { Actor, ActorId } from '../../game/types';
  import { ACTOR_LABELS, ACTOR_TOOLTIPS, stanceLabel } from '../../game/simulation/actors';

  interface Props {
    actorId: ActorId;
    actor: Actor;
    /** Sous-titre vivant : faction adverse incarnée, faction État, etc. */
    subtitle?: string;
  }
  let { actorId, actor, subtitle }: Props = $props();

  const ICONS: Record<ActorId, string> = {
    base: '★',
    adversaire: '✕',
    etat: '⚖',
    opinion: '☵'
  };

  /* Mood : 0 = hostile, 1 = méfiant, 2 = attentif, 3 = favorable.
     Combine trust et stance pour une lecture instantanée. */
  function moodScore(): 0 | 1 | 2 | 3 {
    const t = actor.trust;
    if (actor.stance === 'dur' || t <= 30) return 0;
    if (t <= 45) return 1;
    if (t <= 65) return 2;
    return 3;
  }

  function moodLabel(score: 0 | 1 | 2 | 3): string {
    return ['Hostile', 'Méfiant·e', 'Attentif·ve', 'Favorable'][score];
  }

  /* Risque imminent : patience basse OU pression haute. */
  function riskLabel(): string | null {
    if (actor.patience <= 22) return 'Rupture proche';
    if (actor.pressure >= 78) return 'Sous tension extrême';
    if (actor.patience <= 35) return 'Patience limite';
    if (actor.pressure >= 65) return 'Sous pression';
    return null;
  }

  const mood = $derived(moodScore());
  const risk = $derived(riskLabel());
</script>

<article
  class="actor-card"
  data-mood={mood}
  data-risk={risk ? 'true' : 'false'}
  title={ACTOR_TOOLTIPS[actorId]}
>
  <div class="actor-head">
    <span class="actor-icon" aria-hidden="true">{ICONS[actorId]}</span>
    <div class="actor-id">
      <span class="actor-name">{ACTOR_LABELS[actorId]}</span>
      {#if subtitle}
        <span class="actor-sub">{subtitle}</span>
      {/if}
    </div>
    <span class="actor-mood" aria-label={`Humeur : ${moodLabel(mood)}`}>
      {moodLabel(mood)}
    </span>
  </div>

  <!-- Posture textuelle + jauge patience -->
  <div class="actor-stance">
    <span class="stance-tag">{stanceLabel(actor.stance)}</span>
    <span class="patience-track" aria-label={`Patience ${Math.round(actor.patience)}`}>
      <i style="width: {Math.max(2, Math.min(100, actor.patience))}%"></i>
    </span>
  </div>

  {#if risk}
    <div class="actor-risk">⚠ {risk}</div>
  {/if}
</article>

<style>
  .actor-card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    border: 1px solid rgba(237, 228, 201, 0.12);
    border-radius: 0.55rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.5rem 0.6rem;
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .actor-card[data-mood='3'] {
    border-color: rgba(95, 181, 107, 0.35);
    background: rgba(95, 181, 107, 0.06);
  }

  .actor-card[data-mood='2'] {
    border-color: rgba(244, 213, 139, 0.28);
    background: rgba(201, 154, 64, 0.05);
  }

  .actor-card[data-mood='1'] {
    border-color: rgba(224, 122, 110, 0.22);
    background: rgba(224, 122, 110, 0.04);
  }

  .actor-card[data-mood='0'] {
    border-color: rgba(224, 122, 110, 0.5);
    background: rgba(224, 122, 110, 0.08);
  }

  .actor-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .actor-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(237, 228, 201, 0.2);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.45);
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    line-height: 1;
  }

  .actor-id {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .actor-name {
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .actor-sub {
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.62rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actor-mood {
    flex-shrink: 0;
    border-radius: 999px;
    padding: 0.12rem 0.5rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .actor-card[data-mood='3'] .actor-mood {
    background: rgba(95, 181, 107, 0.18);
    color: #aedab5;
  }

  .actor-card[data-mood='2'] .actor-mood {
    background: rgba(244, 213, 139, 0.15);
    color: #f4d58b;
  }

  .actor-card[data-mood='1'] .actor-mood {
    background: rgba(224, 122, 110, 0.14);
    color: #e8a09b;
  }

  .actor-card[data-mood='0'] .actor-mood {
    background: rgba(224, 122, 110, 0.28);
    color: #f3c4bf;
  }

  .actor-stance {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stance-tag {
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.66rem;
    font-style: italic;
    flex-shrink: 0;
  }

  .patience-track {
    flex: 1;
    height: 0.22rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.55);
  }

  .patience-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #e07a6e 0%, #f4d58b 50%, #aedab5 100%);
    transition: width 0.3s ease;
  }

  .actor-risk {
    color: #e8a09b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .actor-card[data-risk='true'] {
    box-shadow: 0 0 0 1px rgba(224, 122, 110, 0.3) inset;
  }
</style>
