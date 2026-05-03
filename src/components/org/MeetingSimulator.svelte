<script lang="ts">
  import { fade } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { sfx } from '../../game/audio/sfx';
  import { currencyForEra } from '../../game/content/eras';
  import type { Camp } from '$lib/types';
  import type { ActorId, RebirthGameState, Resources } from '../../game/types';
  import MiniGameFuelHeader from '../cockpit/MiniGameFuelHeader.svelte';

  interface Props {
    gameState: RebirthGameState;
  }
  let { gameState }: Props = $props();
  /* alias local court — `state` est réservé par les runes Svelte */
  const gs = $derived(gameState);

  type ThemeId = 'salaires' | 'retraites' | 'conditions' | 'securite';
  type PostureId = 'mesuree' | 'offensive' | 'pedagogique';

  interface Theme {
    id: ThemeId;
    label: string;
    salarieFor: string;
    patronFor: string;
  }

  interface Argument {
    id: string;
    text: string;
    /** Audiences : impact attendu sur militants / opinion / État. */
    militants: number;
    opinion: number;
    etat: number;
    /** Réservé à un camp. */
    camp?: Camp;
  }

  const THEMES: Theme[] = [
    {
      id: 'salaires',
      label: 'Salaires & pouvoir d’achat',
      salarieFor: 'Indexer, rouvrir la grille, défendre le SMIC.',
      patronFor: 'Défendre la modération salariale par la compétitivité.'
    },
    {
      id: 'retraites',
      label: 'Retraites',
      salarieFor: 'Sauver le paritarisme Agirc-Arrco face à l’État.',
      patronFor: 'Plaider pour l’équilibre démographique.'
    },
    {
      id: 'conditions',
      label: 'Conditions de travail',
      salarieFor: 'Pénibilité, accidents, télétravail subi.',
      patronFor: 'Flexibilité, qualité de vie au travail comme levier RH.'
    },
    {
      id: 'securite',
      label: 'Sécurité de l’emploi',
      salarieFor: 'Lutter contre les licenciements et la sous-traitance.',
      patronFor: 'Défendre l’investissement et l’adaptation.'
    }
  ];

  const SALARIE_ARGS: Argument[] = [
    { id: 'salarie-chiffres', text: 'Avancer les chiffres : déficits, marges, bénéfices.', militants: 2, opinion: 5, etat: 1 },
    { id: 'salarie-temoignage', text: 'Faire monter à la tribune une déléguée de la base.', militants: 6, opinion: 3, etat: 0 },
    { id: 'salarie-histoire', text: 'Rappeler 1936, 1968, 1995 — la longue mémoire.', militants: 5, opinion: 2, etat: -1 },
    { id: 'salarie-tribunal', text: 'Annoncer une saisine du tribunal des prud’hommes.', militants: 3, opinion: 4, etat: 3 },
    { id: 'salarie-cible', text: 'Nommer un responsable patronal, frontalement.', militants: 7, opinion: -2, etat: -3 },
    { id: 'salarie-unitaire', text: 'Appeler à l’unité avec les autres confédérations.', militants: 4, opinion: 4, etat: 0 }
  ];

  const PATRON_ARGS: Argument[] = [
    { id: 'patron-investissement', text: 'Présenter le plan d’investissement à dix ans.', militants: 0, opinion: 5, etat: 4 },
    { id: 'patron-emploi', text: 'Annoncer des embauches en CDI dans les usines.', militants: 3, opinion: 6, etat: 3 },
    { id: 'patron-competitivite', text: 'Comparer les coûts du travail en Europe.', militants: -2, opinion: 3, etat: 4 },
    { id: 'patron-paritaire', text: 'Réaffirmer le paritarisme comme méthode.', militants: 4, opinion: 4, etat: 2 },
    { id: 'patron-rupture', text: 'Menacer un retrait des organismes paritaires.', militants: -3, opinion: -2, etat: 5 },
    { id: 'patron-reforme', text: 'Pousser une réforme structurelle de la branche.', militants: 1, opinion: 3, etat: 5 }
  ];

  const POSTURES: Array<{ id: PostureId; label: string; tone: string; trait: 'tribun' | 'pragmatique' | 'technocrate' }> = [
    { id: 'offensive', label: 'Offensive', tone: 'Voix qui claque, regards qui ne lâchent pas.', trait: 'tribun' },
    { id: 'mesuree', label: 'Mesurée', tone: 'Phrase courte, ton ferme, peu d’adjectifs.', trait: 'pragmatique' },
    { id: 'pedagogique', label: 'Pédagogique', tone: 'Tableau, comparaisons, deux exemples concrets.', trait: 'technocrate' }
  ];

  const argsForCamp = $derived(gs.camp === 'patron' ? PATRON_ARGS : SALARIE_ARGS);

  let theme = $state<ThemeId>('salaires');
  let selectedArgs = $state<string[]>([]);
  let slogan = $state('');
  let posture = $state<PostureId>('mesuree');
  let result = $state<MeetingResult | null>(null);

  interface MeetingResult {
    score: number;
    audience: { militants: number; opinion: number; etat: number };
    pressLine: string;
    cost: number;
  }

  function toggleArg(id: string) {
    if (selectedArgs.includes(id)) {
      selectedArgs = selectedArgs.filter(x => x !== id);
    } else if (selectedArgs.length < 3) {
      selectedArgs = [...selectedArgs, id];
    }
  }

  const treasury = $derived(gs.organization.treasury);
  const cost = 8;
  const canHold = $derived(treasury >= cost && selectedArgs.length >= 1 && !result);
  const currency = $derived(currencyForEra(gs.era));

  function compute(): MeetingResult {
    let militants = 0;
    let opinion = 0;
    let etat = 0;
    for (const id of selectedArgs) {
      const a = argsForCamp.find(x => x.id === id);
      if (!a) continue;
      militants += a.militants;
      opinion += a.opinion;
      etat += a.etat;
    }

    /* Bonus posture si elle correspond au trait dominant. */
    const postureDef = POSTURES.find(p => p.id === posture)!;
    const traitMatch = gs.dominantTrait === postureDef.trait;
    const postureBonus = traitMatch ? 5 : 0;
    militants += postureBonus;
    opinion += postureBonus;

    /* Bonus slogan : longueur idéale 30-80 chars, mots forts. */
    const sl = slogan.trim();
    let sloganBonus = 0;
    if (sl.length >= 12 && sl.length <= 100) sloganBonus = 4;
    if (/!|\?|—/.test(sl)) sloganBonus += 2;
    militants += sloganBonus;

    /* Mediarelay augmente la portée presse. */
    opinion += Math.min(4, gs.organization.mediaRelay);

    /* Le sloganBonus et le postureBonus sont déjà inclus dans `militants`
       et `opinion` ci-dessus — on ne les ré-ajoute pas. */
    const score = Math.max(0, Math.min(100, 35 + (militants + opinion) * 1.4));

    const pressLine = composePressLine(score, opinion);

    return {
      score: Math.round(score),
      audience: {
        militants: Math.round(militants),
        opinion: Math.round(opinion),
        etat: Math.round(etat)
      },
      pressLine,
      cost
    };
  }

  function composePressLine(score: number, opinionDelta: number): string {
    if (score >= 70) return 'Le meeting transforme la salle. La presse cite trois phrases avant minuit.';
    if (score >= 50) return 'Salle bien remplie, applaudissements nets. La presse retient le ton.';
    if (score >= 30) return 'Public attentif, conviction limitée. Les éditoriaux nuancent.';
    if (opinionDelta < 0) return 'Le meeting passe mal au-dehors : la presse souligne la cassure.';
    return 'Salle clairsemée, ton trop convenu. Personne n’en parlera demain.';
  }

  function hold() {
    if (!canHold) return;
    const r = compute();
    result = r;

    /* Effets numériques : la confiance et la légitimité bougent selon
       audiences ; l'État ne réagit qu'à grande échelle. */
    const resourceDelta: Partial<Resources> = {
      caisse: -r.cost,
      confiance: Math.round(r.audience.militants * 0.6),
      legitimite: Math.round(r.audience.opinion * 0.7),
      rapportDeForce: r.score >= 60 ? 2 : r.score < 25 ? -2 : 0
    };
    const actorDelta: Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>> = {
      base: { trust: Math.round(r.audience.militants * 0.5), patience: 3 },
      opinion: { trust: Math.round(r.audience.opinion * 0.6) },
      etat: { pressure: r.audience.etat < 0 ? Math.abs(r.audience.etat) : 0 }
    };

    const themeLabel = THEMES.find(t => t.id === theme)?.label ?? 'meeting';
    rebirth.applyOperation({
      label: `Meeting (${themeLabel}, score ${r.score}/100) — ${r.pressLine}`,
      resourceDelta,
      actorDelta
    });
    void sfx.play(r.score >= 65 ? 'success' : r.score < 30 ? 'fail' : 'click');
  }

  function reset() {
    result = null;
    slogan = '';
    selectedArgs = [];
  }
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Simulateur</div>
    <h3 class="font-display text-gold text-base">Tenir un meeting</h3>
    <p class="text-xs text-parchment-dim/85 mt-1">
      Choisis le thème, deux ou trois arguments, écris ton mot d’ordre. Coût : {cost} {currency}.
    </p>
  </div>

  <MiniGameFuelHeader ability="meeting" title="ton meeting" />

  {#if !result}
    <div in:fade={{ duration: 200 }} class="space-y-3">
      <!-- Thème -->
      <div>
        <div class="meta-label">Thème</div>
        <div class="grid grid-cols-2 gap-1.5 mt-1">
          {#each THEMES as t}
            <button
              type="button"
              class="theme-btn"
              data-active={theme === t.id}
              onclick={() => (theme = t.id)}
              title={gs.camp === 'patron' ? t.patronFor : t.salarieFor}
            >{t.label}</button>
          {/each}
        </div>
      </div>

      <!-- Arguments -->
      <div>
        <div class="meta-label">
          Arguments <span class="text-parchment-dim/55">— {selectedArgs.length}/3</span>
        </div>
        <ul class="space-y-1 mt-1">
          {#each argsForCamp as a}
            {@const sel = selectedArgs.includes(a.id)}
            <li>
              <button
                type="button"
                class="arg-btn"
                data-selected={sel}
                onclick={() => toggleArg(a.id)}
              >
                <span class="arg-mark" aria-hidden="true">{sel ? '✓' : '·'}</span>
                <span>{a.text}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Mot d'ordre -->
      <label class="block">
        <span class="meta-label">Mot d’ordre · ce que tu vas dire en première phrase</span>
        <textarea
          bind:value={slogan}
          rows="2"
          maxlength="120"
          placeholder="ex. Tout est possible ! · Ce que vous appelez le coût du travail, nous l’appelons la vie."
          class="slogan-input"
        ></textarea>
        <span class="text-[0.72rem] text-parchment-dim/65">{slogan.length}/120</span>
      </label>

      <!-- Posture -->
      <div>
        <div class="meta-label">Posture</div>
        <div class="grid grid-cols-3 gap-1.5 mt-1">
          {#each POSTURES as p}
            <button
              type="button"
              class="posture-btn"
              data-active={posture === p.id}
              onclick={() => (posture = p.id)}
              title={p.tone}
            >{p.label}</button>
          {/each}
        </div>
      </div>

      <button type="button" class="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canHold} onclick={hold}>
        Tenir le meeting · {cost} {currency}
      </button>
      {#if treasury < cost}
        <p class="text-[0.78rem] italic text-rose-300">Caisse insuffisante.</p>
      {/if}
    </div>
  {:else}
    <div in:fade={{ duration: 240 }} class="space-y-3">
      <div class="result-score" data-grade={result.score >= 70 ? 'high' : result.score >= 40 ? 'mid' : 'low'}>
        <div class="num">{result.score}<small>/100</small></div>
        <div class="lbl">Score du meeting</div>
      </div>

      <p class="result-line">{result.pressLine}</p>

      <div class="result-grid">
        <div class="result-cell" data-sign={result.audience.militants >= 0 ? 'pos' : 'neg'}>
          <span>Militants</span>
          <em>{result.audience.militants > 0 ? '+' : ''}{result.audience.militants}</em>
        </div>
        <div class="result-cell" data-sign={result.audience.opinion >= 0 ? 'pos' : 'neg'}>
          <span>Opinion</span>
          <em>{result.audience.opinion > 0 ? '+' : ''}{result.audience.opinion}</em>
        </div>
        <div class="result-cell" data-sign={result.audience.etat >= 0 ? 'pos' : 'neg'}>
          <span>État</span>
          <em>{result.audience.etat > 0 ? '+' : ''}{result.audience.etat}</em>
        </div>
      </div>

      <button type="button" class="btn-ghost w-full" onclick={reset}>Préparer un autre meeting</button>
    </div>
  {/if}
</section>

<style>
  .meta-label {
    display: block;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .theme-btn,
  .posture-btn {
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    color: rgba(237, 228, 201, 0.78);
    padding: 0.5rem 0.55rem;
    font-size: 0.74rem;
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
  }

  .theme-btn:hover,
  .posture-btn:hover {
    border-color: rgba(244, 213, 139, 0.45);
    color: #f4d58b;
  }

  .theme-btn[data-active='true'],
  .posture-btn[data-active='true'] {
    border-color: rgba(244, 213, 139, 0.7);
    background: rgba(201, 154, 64, 0.13);
    color: #f4d58b;
  }

  .arg-btn {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    width: 100%;
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.3);
    padding: 0.5rem 0.6rem;
    color: rgba(237, 228, 201, 0.85);
    text-align: left;
    font-size: 0.78rem;
    line-height: 1.35;
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .arg-btn:hover {
    border-color: rgba(244, 213, 139, 0.45);
  }

  .arg-btn[data-selected='true'] {
    border-color: rgba(95, 181, 107, 0.55);
    background: rgba(95, 181, 107, 0.08);
    color: #ede4c9;
  }

  .arg-mark {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(237, 228, 201, 0.25);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.5);
    color: #aedab5;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    line-height: 1;
  }

  .arg-btn[data-selected='true'] .arg-mark {
    border-color: rgba(95, 181, 107, 0.6);
  }

  .slogan-input {
    width: 100%;
    margin-top: 0.3rem;
    border: 1px solid rgba(237, 228, 201, 0.18);
    border-radius: 0.45rem;
    background: rgba(13, 16, 20, 0.45);
    color: #ede4c9;
    padding: 0.55rem 0.65rem;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
    line-height: 1.4;
    resize: vertical;
  }

  .slogan-input:focus {
    outline: none;
    border-color: rgba(244, 213, 139, 0.6);
  }

  .result-score {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    border: 1px solid rgba(244, 213, 139, 0.4);
    border-radius: 0.6rem;
    background: rgba(201, 154, 64, 0.08);
    padding: 0.85rem 1rem;
  }

  .result-score[data-grade='high'] {
    border-color: rgba(95, 181, 107, 0.5);
    background: rgba(95, 181, 107, 0.08);
  }

  .result-score[data-grade='low'] {
    border-color: rgba(224, 122, 110, 0.4);
    background: rgba(224, 122, 110, 0.06);
  }

  .result-score .num {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 2rem;
    color: #f4d58b;
    line-height: 1;
  }

  .result-score[data-grade='high'] .num {
    color: #aedab5;
  }

  .result-score[data-grade='low'] .num {
    color: #e8a09b;
  }

  .result-score .num small {
    font-size: 0.85rem;
    color: rgba(237, 228, 201, 0.55);
  }

  .result-score .lbl {
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .result-line {
    color: #ede4c9;
    font-style: italic;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }

  .result-cell {
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.45rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.5rem 0.55rem;
    text-align: center;
  }

  .result-cell span {
    display: block;
    color: rgba(237, 228, 201, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .result-cell em {
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 1rem;
    color: #f4d58b;
  }

  .result-cell[data-sign='pos'] em {
    color: #aedab5;
  }

  .result-cell[data-sign='neg'] em {
    color: #e8a09b;
  }
</style>
