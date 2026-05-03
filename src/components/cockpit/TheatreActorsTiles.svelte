<script lang="ts">
  /* ============================================================
     TheatreActorsTiles — panneau droit en mode Théâtre (CK3)
     ============================================================
     Inspiration : conseil CK3, factions Tropico (Vidal). Les acteurs
     sont visibles EN PERMANENCE comme des tuiles, avec leur ressenti
     écrit en français — pas en stats numériques.

     « Tu signes une convention. La Base te trouve crédible mais
     s'impatiente. L'Adversaire prépare la riposte. L'État écoute.
     L'Opinion se demande. »

     C'est ce que CK3 fait avec ses conseillers, et c'est ce qui
     manquait à Paritas : mettre le ressenti des acteurs au même
     plan visuel que le scénario.
     ============================================================ */
  import type { Actor, Actors } from '../../game/types';
  import type { Camp } from '$lib/types';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    actors: Actors;
    camp: Camp;
  }
  let { actors, camp }: Props = $props();

  /* ====== Sentiment narratif ====== */
  /* Phrases dynamiques par acteur, qui composent à partir de
     trust + pressure + patience + stance. Le but est de remplacer
     « Trust 68, Pressure 32 » par « te suit avec une certaine
     impatience » — du français parlable. */

  type ActorRole = 'base' | 'adversaire' | 'etat' | 'opinion';

  const ACTOR_LABEL: Record<ActorRole, (camp: Camp) => string> = {
    base: (c) => c === 'patron' ? 'Tes cadres' : 'La base',
    adversaire: (c) => c === 'patron' ? 'Le syndicat' : 'Le patronat',
    etat: () => 'L\'État',
    opinion: () => 'L\'opinion'
  };

  const ACTOR_GLYPH: Record<ActorRole, 'poing' | 'pupitre' | 'rouage' | 'parchemin'> = {
    base: 'poing',
    adversaire: 'pupitre',
    etat: 'rouage',
    opinion: 'parchemin'
  };

  /** Renvoie la phrase de sentiment selon les valeurs de l'acteur.
   *  Composée pour être lisible en français de salon. */
  function sentimentPhrase(role: ActorRole, a: Actor, c: Camp): string {
    const t = a.trust;
    const p = a.pressure;
    const pat = a.patience;
    const stance = a.stance;

    /* Modifieurs communs */
    const impatient = pat < 25 ? ' et perd patience' : '';
    const tendu = p > 75 ? ' au bord de la rupture' : p > 55 ? ' sous pression' : '';
    const dur = stance === 'dur' ? ' et durcit le ton' : '';

    if (role === 'base') {
      const isPatron = c === 'patron';
      if (t >= 75) return isPatron
        ? `Tes cadres te suivent sans réserve${tendu}.`
        : `La base te suit aveuglément${tendu}.`;
      if (t >= 55) return isPatron
        ? `Tes cadres te font confiance${impatient}.`
        : `La base te porte${impatient}.`;
      if (t >= 35) return isPatron
        ? `Tes cadres t'observent encore${impatient}.`
        : `La base t'observe, partagée${impatient}.`;
      if (t >= 18) return isPatron
        ? `Tes cadres doutent${dur}${impatient}.`
        : `La base décroche${dur}${impatient}.`;
      return isPatron
        ? `Tes cadres se détournent. Démissions probables.`
        : `La base te lâche. Risque de scission.`;
    }

    if (role === 'adversaire') {
      const isPatron = c === 'patron';
      const advName = isPatron ? 'Le syndicat' : 'Le patronat';
      if (t >= 70) return `${advName} joue franc-jeu${tendu}.`;
      if (t >= 50) return `${advName} négocie de bonne foi${impatient}.`;
      if (t >= 30) return `${advName} garde ses distances${dur}.`;
      if (t >= 15) return `${advName} prépare la riposte${dur}.`;
      return `${advName} appelle à la rupture totale.`;
    }

    if (role === 'etat') {
      if (t >= 70) return `L'État écoute attentivement${tendu}.`;
      if (t >= 50) return `L'État temporise, observe${impatient}.`;
      if (t >= 30) return `L'État prend ses distances${dur}.`;
      if (t >= 15) return `L'État menace, sanctionne${dur}.`;
      return `L'État intervient. Répression imminente.`;
    }

    /* opinion */
    if (t >= 70) return `L'opinion te porte${tendu}.`;
    if (t >= 50) return `L'opinion suit avec curiosité${impatient}.`;
    if (t >= 30) return `L'opinion se demande, hésite.`;
    if (t >= 15) return `L'opinion se détourne${dur}.`;
    return `L'opinion te rejette nettement.`;
  }

  /* Couleur de la jauge selon trust (du rouge au vert via or) */
  function trustColor(t: number): string {
    if (t >= 65) return '#7BCBA1';
    if (t >= 45) return '#C9B26A';
    if (t >= 25) return '#D9821C';
    return '#E08F92';
  }

  const ROLES: ActorRole[] = ['base', 'adversaire', 'etat', 'opinion'];
</script>

<aside class="theatre-actors-tiles" aria-label="Acteurs en présence">
  <header class="tiles-head">
    <span class="head-glyph" aria-hidden="true">⚭</span>
    <span class="head-label">Acteurs en scène</span>
  </header>

  <div class="tiles-list">
    {#each ROLES as role (role)}
      {@const actor = actors[role]}
      {#if actor}
        {@const sentiment = sentimentPhrase(role, actor, camp)}
        {@const trustC = trustColor(actor.trust)}
        <article class="actor-tile" data-stance={actor.stance ?? 'cooperatif'}>
          <header class="tile-head">
            <span class="actor-glyph" style:color={trustC}>
              <CockpitIcon name={ACTOR_GLYPH[role]} size={18} />
            </span>
            <span class="actor-name">{ACTOR_LABEL[role](camp)}</span>
            <span class="trust-num" style:color={trustC} title="Confiance / 100">
              {Math.round(actor.trust)}
            </span>
          </header>

          <div class="trust-bar" aria-hidden="true">
            <i style:width="{Math.max(0, Math.min(100, actor.trust))}%"
               style:background={trustC}></i>
          </div>

          <p class="tile-sentiment">{sentiment}</p>

          {#if actor.pressure > 75 || actor.patience < 25}
            <div class="tile-flags">
              {#if actor.pressure > 75}
                <span class="flag pressure" title="Pression élevée — actions intempestives possibles.">
                  ⚡ pression
                </span>
              {/if}
              {#if actor.patience < 25}
                <span class="flag patience" title="Patience entamée — bascule probable.">
                  ⌛ patience
                </span>
              {/if}
            </div>
          {/if}
        </article>
      {/if}
    {/each}
  </div>
</aside>

<style>
  .theatre-actors-tiles {
    width: 240px;
    flex-shrink: 0;
    padding: 1rem 0.7rem 1rem;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.04), transparent 70%),
      linear-gradient(180deg, #1F1813 0%, #110D0A 100%);
    border-left: 1px solid rgba(201, 178, 106, 0.25);
    color: #F4EFE2;
    font-family: 'Source Serif 4', Georgia, serif;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 178, 106, 0.25) transparent;
  }

  .tiles-head {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.18);
    color: #C9B26A;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .head-glyph { color: #C9B26A; font-size: 1rem; line-height: 1; }

  .tiles-list {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .actor-tile {
    padding: 0.55rem 0.65rem 0.6rem;
    background: rgba(13, 11, 8, 0.45);
    border: 1px solid rgba(201, 178, 106, 0.18);
    border-left: 2px solid rgba(201, 178, 106, 0.45);
    border-radius: 0.4rem;
    transition: border-color 0.2s ease;
  }

  .actor-tile[data-stance='dur'] {
    border-left-color: rgba(176, 24, 30, 0.7);
  }
  .actor-tile[data-stance='instable'] {
    border-left-color: rgba(217, 130, 28, 0.7);
  }
  .actor-tile[data-stance='cooperatif'] {
    border-left-color: rgba(58, 107, 71, 0.7);
  }
  .actor-tile[data-stance='opportuniste'] {
    border-left-color: rgba(91, 163, 200, 0.7);
  }

  .tile-head {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.3rem;
  }
  .actor-glyph {
    display: inline-flex;
    align-items: center;
    line-height: 1;
  }
  .actor-name {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    font-weight: 700;
    color: #F4D58C;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .trust-num {
    font-family: 'Courier Prime', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: help;
  }

  .trust-bar {
    height: 3px;
    background: rgba(13, 11, 8, 0.6);
    border-radius: 1.5px;
    overflow: hidden;
    margin-bottom: 0.4rem;
  }
  .trust-bar i {
    display: block;
    height: 100%;
    transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
    box-shadow: 0 0 6px currentColor;
  }

  .tile-sentiment {
    margin: 0;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.78rem;
    line-height: 1.35;
    color: rgba(244, 239, 226, 0.88);
    font-style: italic;
  }

  .tile-flags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.35rem;
  }
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 0.18rem;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: help;
  }
  .flag.pressure {
    background: rgba(217, 130, 28, 0.16);
    border: 1px solid rgba(217, 130, 28, 0.5);
    color: #F0B870;
  }
  .flag.patience {
    background: rgba(176, 24, 30, 0.16);
    border: 1px solid rgba(176, 24, 30, 0.5);
    color: #E08F92;
  }

  @media (max-width: 1280px) {
    .theatre-actors-tiles { display: none; }
  }
</style>
