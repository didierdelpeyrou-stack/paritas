<script lang="ts">
  /**
   * Interlude de restauration — UX-N4.
   *
   * Neuro : théorie de la restauration de l'attention (Kaplan 1995).
   * Une succession de scènes-décisions épuise l'attention dirigée
   * (cortex préfrontal). Une pause de soft fascination (image fixe
   * + citation) ramène les ondes alpha en ~3 minutes. Pour Paritas,
   * on programme un interlude tous les 5-7 tours.
   *
   * Pas de choix, pas de jauges, pas de chrome. Juste une image,
   * une citation, et un bouton « Continuer » optionnel après un
   * délai minimum de 6 secondes.
   */
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import type { EraId } from '../../game/types';

  interface InterludeContent {
    image: string; // emoji ou caractère, sera SVG plus tard
    quote: string;
    source: string;
  }

  interface Props {
    era: EraId;
    turn: number;
    onContinue: () => void;
  }
  let { era, turn, onContinue }: Props = $props();

  /* Pool d'interludes par ère. Chacun pioche une image symbolique
     et une citation historique du registre culturel adéquat. */
  const POOL: Record<string, InterludeContent[]> = {
    medieval: [
      {
        image: '⚒',
        quote: "Tour de France, mère des compagnons, table partagée — c'est par le pain qu'on apprend à se compter.",
        source: 'Tradition compagnonnique'
      }
    ],
    revolution: [
      {
        image: '⚖',
        quote: "Les hommes naissent et demeurent libres et égaux en droits.",
        source: 'Déclaration des Droits, août 1789'
      }
    ],
    xixe: [
      {
        image: '⛏',
        quote: "Vivre en travaillant ou mourir en combattant.",
        source: 'Canuts de Lyon, novembre 1831'
      }
    ],
    belle_epoque: [
      {
        image: '✊',
        quote: "Le syndicalisme se suffit à lui-même.",
        source: "Charte d'Amiens, 1906"
      }
    ],
    entre_deux_guerres: [
      {
        image: '☼',
        quote: "Tout est possible.",
        source: 'Front populaire, été 1936'
      }
    ],
    reconstruction: [
      {
        image: '⚕',
        quote: "Des jours heureux.",
        source: 'Programme du CNR, mars 1944'
      }
    ],
    guerre_froide: [
      {
        image: '◈',
        quote: "L'indépendance syndicale n'est pas négociable.",
        source: 'Léon Jouhaux, 1947'
      }
    ],
    trente_glorieuses: [
      {
        image: '◇',
        quote: "Les machines tournent. Le pays travaille. Le paritarisme veille.",
        source: 'Récit de l\'âge d\'or, 1958-1973'
      }
    ],
    crise: [
      {
        image: '◌',
        quote: "On savait que cela finirait. On ne savait pas comment.",
        source: 'Choc pétrolier, octobre 1973'
      }
    ],
    mitterrand: [
      {
        image: '✿',
        quote: "Ouvriers, tu as raison de te défendre. Mais tu as tort de croire qu'on défendra à ta place.",
        source: 'Maxime ouvrière, années 1980'
      }
    ],
    cohabitations: [
      {
        image: '◐',
        quote: "Ce que les uns nomment sauvegarde, les autres l'appellent restauration.",
        source: 'Plan Juppé, hiver 1995'
      }
    ],
    sarkozy: [
      {
        image: '◑',
        quote: "Le compromis n'est pas la compromission.",
        source: 'Refondation sociale, années 2000'
      }
    ],
    hollande: [
      {
        image: '☁',
        quote: "La hiérarchie des normes est l'ossature du droit social. La retourner, c'est en faire autre chose.",
        source: 'Loi Travail, été 2016'
      }
    ],
    macron_i: [
      {
        image: '◯',
        quote: "La concertation a duré le temps qu'elle a duré.",
        source: 'Édouard Philippe, septembre 2017'
      }
    ],
    macron_ii: [
      {
        image: '✦',
        quote: "Le dialogue social français est sorti abîmé de cette séquence.",
        source: 'Constat des partenaires sociaux, printemps 2023'
      }
    ],
    present: [
      {
        image: '✺',
        quote: "Le paritarisme n'a pas dit son dernier mot. Il dépend de qui le porte.",
        source: 'Constat ouvert, 2026'
      }
    ],
    antiquite: [
      {
        image: '◊',
        quote: "Collegium fabrorum — d'Ostie à Lugdunum, le métier se reconnaît au sceau et à la table.",
        source: "Inscriptions épigraphiques, IIe siècle"
      }
    ]
  };

  function pickContent(era: EraId, turn: number): InterludeContent {
    const pool = POOL[era] ?? POOL.present!;
    return pool[turn % pool.length]!;
  }

  const content = $derived(pickContent(era, turn));

  /* Le bouton ne devient cliquable qu'après 6 s — force la pause
     (méthodologie : un délai trop court annule l'effet restauratif). */
  let canContinue = $state(false);
  let timer: number | undefined;

  onMount(() => {
    timer = window.setTimeout(() => {
      canContinue = true;
    }, 6000);
  });

  onDestroy(() => {
    if (timer) window.clearTimeout(timer);
  });

  function maybeContinue() {
    if (canContinue) onContinue();
  }
</script>

<article
  class="interlude"
  in:fade={{ duration: 600 }}
  role="region"
  aria-label="Interlude — moment de pause"
>
  <div class="image" aria-hidden="true">{content.image}</div>
  <blockquote class="quote">
    « {content.quote} »
  </blockquote>
  <footer class="source">— {content.source}</footer>

  <button
    type="button"
    class="continue-btn"
    onclick={maybeContinue}
    disabled={!canContinue}
    aria-label={canContinue ? 'Reprendre la partie' : 'Patientez quelques secondes pour reprendre'}
  >
    {canContinue ? 'Reprendre' : 'Respirer…'}
  </button>
</article>

<style>
  .interlude {
    max-width: 38rem;
    margin: 0 auto;
    text-align: center;
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    /* Soft fascination : palette plus douce, moins contrastée */
    background: radial-gradient(
      ellipse at center,
      rgba(244, 213, 139, 0.04) 0%,
      transparent 70%
    );
  }

  .image {
    font-size: 5rem;
    line-height: 1;
    color: rgba(244, 213, 139, 0.55);
    font-family: 'Cinzel', Georgia, serif;
    user-select: none;
  }

  .quote {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 1.45rem;
    line-height: 1.5;
    color: rgba(237, 228, 201, 0.92);
    font-style: italic;
    max-width: 32rem;
    margin: 0;
  }

  .source {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.84rem;
    letter-spacing: 0.06em;
    color: rgba(244, 213, 139, 0.65);
  }

  .continue-btn {
    margin-top: 1rem;
    border: 1px solid rgba(244, 213, 139, 0.4);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.55);
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.86rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.6rem 1.4rem;
    cursor: pointer;
    transition: opacity 0.4s ease, border-color 0.18s ease, color 0.18s ease;
  }

  .continue-btn:disabled {
    opacity: 0.4;
    cursor: wait;
  }

  .continue-btn:not(:disabled):hover {
    border-color: #f4d58b;
    color: #fde68a;
    background: rgba(201, 154, 64, 0.13);
  }
</style>
