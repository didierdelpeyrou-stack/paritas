<script lang="ts">
  /* Une "place" autour de la table — affiche l'acteur, son agenda
     public, ses ressources, et (s'il est le joueur) sa ligne rouge
     secrète. Indique si c'est son tour de parler. */
  import type { Actor } from '$lib/table/types';
  import CockpitIcon from '../cockpit/CockpitIcon.svelte';

  interface Props {
    actor: Actor;
    isCurrentSpeaker: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  }
  let { actor, isCurrentSpeaker, position }: Props = $props();

  /* Couleur d'accent par persona */
  const ACCENTS: Record<string, string> = {
    croizat: '#B0181E',  // CGT rouge
    laroque: '#1E5C8A',  // technique bleu
    parodi: '#5C2D5C',   // CFTC violet
    buisson: '#7A5C3A'   // ouvrier brun
  };
  let accent = $derived(ACCENTS[actor.persona.id] ?? '#C9B26A');
</script>

<article class="seat seat-{position}"
  class:current={isCurrentSpeaker}
  class:player={actor.isPlayer}
  style:--accent={accent}
>
  <header class="seat-head">
    <div class="seat-portrait" aria-hidden="true">
      {actor.persona.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
    </div>
    <div class="seat-id">
      <h3 class="seat-name">{actor.persona.name}</h3>
      <span class="seat-org">{actor.persona.organization}</span>
    </div>
    {#if actor.isPlayer}
      <span class="seat-tag tag-player">Toi</span>
    {/if}
    {#if isCurrentSpeaker}
      <span class="seat-tag tag-speaking" aria-label="C'est son tour de parler">
        <span class="speaking-dot"></span>
      </span>
    {/if}
  </header>

  <div class="seat-resources" aria-label="Ressources">
    <span title="Mandat — capacité à négocier">M {actor.resources.mandat}</span>
    <span title="Caisse — ressources matérielles">$ {actor.resources.caisse}</span>
    <span title="Légitimité publique">L {actor.resources.legitimite}</span>
  </div>

  <details class="seat-agenda">
    <summary>Agenda public</summary>
    <ul>
      {#each actor.publicAgenda as item}
        <li>{item}</li>
      {/each}
    </ul>
  </details>

  {#if actor.isPlayer}
    <div class="seat-redline" title="Ligne rouge — non négociable. Visible uniquement pour toi.">
      <strong>Ligne rouge :</strong>
      <span>{actor.redLine.topic}</span>
      <p class="seat-redline-desc">{actor.redLine.description}</p>
    </div>
  {/if}

  {#if actor.vote !== null}
    <div class="seat-vote vote-{actor.vote}">
      Vote :
      {actor.vote === 'oui' ? '✓ OUI'
        : actor.vote === 'non' ? '✗ NON'
        : '— Abstention'}
    </div>
  {/if}
</article>

<style>
  .seat {
    --accent: #C9B26A;
    background: linear-gradient(180deg, #F4EFE2 0%, #E8DCC8 100%);
    border: 1px solid #8C6E40;
    border-left: 4px solid var(--accent);
    border-radius: 0.5rem;
    padding: 0.7rem 0.85rem;
    color: #1A1411;
    font-family: 'Source Serif 4', Georgia, serif;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    transition: transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
                box-shadow 0.3s ease,
                border-color 0.3s ease;
    width: 100%;
    max-width: 320px;
  }

  .seat.current {
    border-color: var(--accent);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.25),
      0 0 18px color-mix(in srgb, var(--accent) 30%, transparent);
    transform: translateY(-2px);
  }

  .seat.player {
    background: linear-gradient(180deg, #FFF5D8 0%, #F4D58C 100%);
  }

  .seat-head {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .seat-portrait {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 65%, #1A1411));
    color: #F4EFE2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2),
                inset 0 -2px 3px rgba(0, 0, 0, 0.2);
  }

  .seat-id {
    flex: 1 1 auto;
    min-width: 0;
  }

  .seat-name {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.92rem;
    color: #1A1411;
    line-height: 1.1;
  }

  .seat-org {
    display: block;
    font-size: 0.72rem;
    color: rgba(26, 20, 17, 0.65);
    font-style: italic;
  }

  .seat-tag {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.45rem;
    border-radius: 0.3rem;
  }

  .tag-player {
    background: var(--accent);
    color: #F4EFE2;
    font-weight: 700;
  }

  .tag-speaking {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid var(--accent);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .speaking-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: speak-pulse 1.2s ease-in-out infinite;
  }

  @keyframes speak-pulse {
    0%, 100% { opacity: 0.5; transform: scale(0.85); }
    50%      { opacity: 1; transform: scale(1.15); }
  }

  .seat-resources {
    display: flex;
    gap: 0.55rem;
    font-family: 'Courier Prime', monospace;
    font-size: 0.78rem;
    color: rgba(26, 20, 17, 0.85);
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed rgba(140, 110, 64, 0.3);
  }

  .seat-resources span {
    cursor: help;
  }

  .seat-agenda {
    font-size: 0.78rem;
    margin-bottom: 0.4rem;
  }

  .seat-agenda summary {
    cursor: pointer;
    color: rgba(26, 20, 17, 0.75);
    font-style: italic;
    user-select: none;
  }

  .seat-agenda ul {
    margin: 0.4rem 0 0;
    padding-left: 1.1rem;
    list-style: '— ';
    line-height: 1.4;
    color: rgba(26, 20, 17, 0.85);
  }

  .seat-redline {
    margin-top: 0.5rem;
    padding: 0.45rem 0.6rem;
    background: rgba(176, 24, 30, 0.10);
    border-left: 2px solid #B0181E;
    border-radius: 0.25rem;
    font-size: 0.78rem;
    color: rgba(26, 20, 17, 0.9);
    line-height: 1.4;
  }

  .seat-redline strong {
    color: #B0181E;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .seat-redline-desc {
    margin: 0.2rem 0 0;
    font-size: 0.74rem;
    font-style: italic;
    color: rgba(26, 20, 17, 0.78);
  }

  .seat-vote {
    margin-top: 0.5rem;
    padding: 0.3rem 0.55rem;
    border-radius: 0.3rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .vote-oui          { background: rgba(58, 107, 71, 0.18); color: #1F4A2C; }
  .vote-non          { background: rgba(176, 24, 30, 0.18); color: #6B1014; }
  .vote-abstention   { background: rgba(140, 110, 64, 0.18); color: #5A4225; }
</style>
