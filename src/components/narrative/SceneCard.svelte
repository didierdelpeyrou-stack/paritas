<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Choice, PlayerTrait, RenderMode, Scenario } from '../../game/types';
  import type { Camp } from '$lib/types';
  import {
    POSTURE_STYLES,
    RESOURCE_SHORT_LABEL,
    derivePosture,
    previewResources,
    resourceGlyph
  } from '../../game/narrative/choicePosture';
  import { TRAIT_LABELS, TRAIT_ANTAGONISTS } from '../../game/narrative/personalityEngine';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { abilityFuelScore, ABILITY_SHORT_LABEL, fuelBreakdown } from '../../game/simulation/resourceUtility';
  import { scenePreview } from '$lib/stores/scenePreview.svelte';
  import VoicePanel from './VoicePanel.svelte';
  import HistoricalImage from '../HistoricalImage.svelte';
  import GlossaryText from '../GlossaryText.svelte';
  import { imageFor } from '../../game/content/historicalImages';
  import { sfx } from '../../game/audio/sfx';
  import { autoplay } from '$lib/stores/autoplay.svelte';

  interface Props {
    scenario: Scenario;
    mode: RenderMode;
    dominantTrait: PlayerTrait;
    /** Camp du joueur — filtre les choix `camp`-restreints et choisit
     *  les variantes `campText` quand elles existent. Optionnel pour
     *  rétrocompatibilité (les anciens callers continuent de marcher,
     *  on défaut à 'salarie'). */
    camp?: Camp;
    /** Nom du joueur — utilisé en mode compulsif pour ancrer
     *  l'identité avant le setup ("Toi, [Nom], ..."). Immersion. */
    playerName?: string;
    /** Nom de l'organisation du joueur — complète l'identity anchor. */
    organizationName?: string;
    onChoose: (choice: Choice) => void;
  }
  let {
    scenario, mode, dominantTrait, camp = 'salarie',
    playerName, organizationName, onChoose
  }: Props = $props();
  const hasImage = $derived(!!imageFor(scenario.id));

  function isLocked(choice: Choice): boolean {
    return !!choice.requiresTrait && choice.requiresTrait !== dominantTrait;
  }

  /** Filtre les choix dont le `camp` ne matche pas le joueur. Si pas
   *  de `camp` sur le choix, il est universel (visible aux deux). */
  function visibleChoices(scn: Scenario): Choice[] {
    return scn.choices.filter(c => !c.camp || c.camp === camp);
  }

  /** Texte effectif du choix : campText[camp] si défini, sinon text. */
  function effectiveText(c: Choice): string {
    return c.campText?.[camp] ?? c.text;
  }
  function effectiveIntent(c: Choice): string {
    return c.campIntent?.[camp] ?? c.intent;
  }

  /* ==== Mode auto-play (Cheng #194) ====
   * Si activé, on planifie un clic auto sur le premier choix non
   * verrouillé après autoplay.delayMs. Le timer est annulé si le
   * scénario change ou si l'auto-play est désactivé entre-temps. */
  let autoplayTimer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    /* Reactivité sur scenario.id + autoplay.enabled + autoplay.delayMs.
     * Un nouveau scénario = un nouveau timer. */
    const scenarioId = scenario.id;
    if (!autoplay.enabled) return;
    if (autoplayTimer) clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(() => {
      const pick = visibleChoices(scenario).find(c => !isLocked(c));
      if (pick) onChoose(pick);
    }, autoplay.delayMs);
    return () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
        autoplayTimer = null;
      }
    };
  });

  /**
   * Cohérence d'un choix avec le trait dominant du joueur (CK3-like).
   * - 'aligned' : pousse le trait dominant ≥+2 → renforce
   * - 'opposed' : pousse l'antagoniste ≥+2 OU diminue le dominant ≥-2
   *               → tension, le joueur agit contre lui-même
   * - 'neutral' : ne touche ni l'un ni l'autre fortement
   */
  function coherenceOf(choice: Choice): 'aligned' | 'opposed' | 'neutral' {
    const shift = choice.traitShift;
    if (!shift) return 'neutral';
    const dom = shift[dominantTrait] ?? 0;
    const ant = shift[TRAIT_ANTAGONISTS[dominantTrait]] ?? 0;
    if (ant >= 2 || dom <= -2) return 'opposed';
    if (dom >= 2) return 'aligned';
    return 'neutral';
  }

  /* === UX-#3 : swipe-to-decide sur mobile ===
     DÉSACTIVÉ PAR DÉFAUT — un scroll vertical était mal interprété
     comme un choix. Activable via Settings > « Swipe pour choisir ».
     Quand activé, recognition stricte :
       - Dead zone 25 px avant toute détection
       - Lock direction au premier dépassement (vertical / horizontal)
       - Si direction = vertical descendant : abandon (= scroll normal)
       - Threshold de commit : 160 px (vs 80 avant)
       - Cooldown 600 ms après commit pour éviter les double-fires
       - preventDefault uniquement quand le geste est verrouillé en
         "swipe choice", pas pendant un simple scroll */
  const SWIPE_DEAD_ZONE = 25;
  const SWIPE_COMMIT = 160;
  const SWIPE_VERTICAL_COMMIT = 180; // un peu plus haut pour swipe up
  const COOLDOWN_MS = 600;

  let swipeEnabled = $state<boolean>(loadSwipePref());
  let lastFireAt = 0;

  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeDX = $state(0);
  let swipeDY = $state(0);
  let swiping = $state(false);
  /* 'pending' = on attend le premier mouvement notable
     'choice' = verrouillé en mode swipe-to-choose
     'scroll' = verrouillé en mode scroll vertical, on ne fait rien */
  let swipeMode = $state<'pending' | 'choice' | 'scroll' | null>(null);

  function loadSwipePref(): boolean {
    try {
      return localStorage.getItem('paritas_swipe_enabled') === 'true';
    } catch {
      return false;
    }
  }

  const swipeable = $derived(
    swipeEnabled && (scenario.choices.length === 3 || scenario.choices.length === 2)
  );

  const swipeTarget = $derived.by<number | null>(() => {
    if (swipeMode !== 'choice') return null;
    const ax = Math.abs(swipeDX);
    const ay = Math.abs(swipeDY);
    if (scenario.choices.length === 3) {
      // Strict : haut requiert dy clairement négatif et |dx| limité
      if (swipeDY < 0 && ay > ax * 1.4) return 1;
      // Horizontal : |dx| > 1.5 × |dy|
      if (ax > ay * 1.5) return swipeDX < 0 ? 0 : 2;
      return null;
    }
    if (scenario.choices.length === 2) {
      if (ax > ay * 1.5) return swipeDX < 0 ? 0 : 1;
      return null;
    }
    return null;
  });

  function onTouchStart(e: TouchEvent) {
    if (!swipeable) return;
    if (Date.now() - lastFireAt < COOLDOWN_MS) return;
    const t = e.touches[0];
    if (!t) return;
    swipeStartX = t.clientX;
    swipeStartY = t.clientY;
    swipeDX = 0;
    swipeDY = 0;
    swiping = true;
    swipeMode = 'pending';
  }

  function onTouchMove(e: TouchEvent) {
    if (!swiping) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - swipeStartX;
    const dy = t.clientY - swipeStartY;
    swipeDX = dx;
    swipeDY = dy;

    if (swipeMode === 'pending') {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      // Reste en pending tant qu'on n'a pas dépassé la dead zone
      if (ax < SWIPE_DEAD_ZONE && ay < SWIPE_DEAD_ZONE) return;
      // Direction descendante = scroll normal, on libère
      if (dy > 0 && ay > ax) {
        swipeMode = 'scroll';
        return;
      }
      // Direction horizontale claire : choice mode
      if (ax > ay * 1.4) {
        swipeMode = 'choice';
        e.preventDefault();
        return;
      }
      // Direction ascendante claire : choice mode (uniquement si 3 choix)
      if (dy < 0 && ay > ax * 1.4 && scenario.choices.length === 3) {
        swipeMode = 'choice';
        e.preventDefault();
        return;
      }
      // Sinon : indéterminé, on attend encore
      return;
    }
    if (swipeMode === 'choice') {
      e.preventDefault();
    }
    // scroll : on ne fait rien, le navigateur scrolle normalement
  }

  function onTouchEnd() {
    if (!swiping) return;
    swiping = false;
    if (swipeMode !== 'choice') {
      swipeMode = null;
      return;
    }
    const ax = Math.abs(swipeDX);
    const ay = Math.abs(swipeDY);
    const target = swipeTarget;
    swipeMode = null;
    if (target === null) return;
    // Threshold de commit
    const horizontal = ax > ay;
    const reached = horizontal ? ax >= SWIPE_COMMIT : ay >= SWIPE_VERTICAL_COMMIT;
    if (!reached) return;
    const choice = scenario.choices[target];
    if (!choice || isLocked(choice)) return;
    lastFireAt = Date.now();
    onChoose(choice);
  }

  const setupText = $derived(
    mode === 'reflechi' ? scenario.setup.reflechi : scenario.setup.compulsif
  );

  /* === Identity anchor (mode compulsif uniquement) ===
     Voix intérieure brève qui ancre le joueur dans son corps,
     son rôle, son époque. S'affiche en exergue avant le setup
     en mode Compulsif. Pas affichée en Réfléchi (plus distancié). */
  const ERA_SENSORY: Record<string, string> = {
    revolution:         'la chandelle vacille, le grain du papier accroche ta plume',
    xixe:               'la machine à vapeur cogne deux étages plus bas',
    belle_epoque:       'le bec de gaz ronronne, ton col cassé te scie le cou',
    entre_deux_guerres: 'le téléphone à manivelle attend, les Gauloises planent',
    reconstruction:     'la radio joue Trenet en sourdine, le café est tiède',
    guerre_froide:      'la moquette épaisse mange les voix, la TV grésille',
    trente_glorieuses:  'la Remington cliquète à côté, le tabac brun te brûle les doigts',
    crise:              'le néon vacille, la photocopieuse bourdonne au fond du couloir',
    mitterrand:         'ta secrétaire glisse une note, le minitel clignote dans l\'angle',
    cohabitations:      'le fax crache une dépêche, la cafetière siffle',
    sarkozy:            'ton BlackBerry vibre, l\'open space bourdonne',
    hollande:           'ton iPhone vibre, l\'écran 27 pouces réchauffe la pièce',
    macron_i:           'trois écrans, deux notifications Slack, un café froid',
    macron_ii:          'Microsoft Teams sonne, Copilot suggère un brouillon',
    present:            'écouteurs dans les oreilles, ChatGPT propose une formulation'
  };
  const identityAnchor = $derived.by(() => {
    if (mode !== 'compulsif' || !playerName) return null;
    const sensor = ERA_SENSORY[scenario.era] ?? '';
    const orgPart = organizationName ? `, ${organizationName}` : '';
    return `Toi, ${playerName}${orgPart}. ${sensor}.`;
  });
  const showVoices = $derived(mode === 'compulsif' && (scenario.voices?.length ?? 0) > 0);
  const moodHue: Record<string, string> = {
    calme: 'border-cyan-500/40 bg-cyan-500/5',
    tendu: 'border-gold/40 bg-gold/5',
    grave: 'border-rose-500/40 bg-rose-500/5',
    euphorique: 'border-emerald-500/40 bg-emerald-500/5',
    melancolique: 'border-violet-500/40 bg-violet-500/5'
  };
  const moodClass = $derived(moodHue[scenario.mood] ?? 'border-line/40');
</script>

<article
  class="bordered-card p-5 space-y-4 {moodClass}"
  class:preview-active={scenePreview.current}
  data-preview-posture={scenePreview.current?.posture ?? ''}
  in:fade={{ duration: 240 }}
>
  <header class="space-y-1">
    <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs uppercase tracking-wider text-parchment-dim/85">
      <span>{scenario.date}</span>
      <span class="italic">{scenario.subtitle ?? ''}</span>
    </div>
    <h2 class="font-display text-xl sm:text-2xl text-gold leading-tight">{scenario.title}</h2>

    <!-- Badge POV (audit asymétrie patron, retour live test) :
         signale honnêtement quand un scénario est filtré pour un
         camp donné (campFilter), ou quand le cadrage est commun
         mais peut sembler tilté. -->
    <div class="pov-badge"
      data-camp={scenario.campFilter ?? 'shared'}
      title={scenario.campFilter
        ? (scenario.campFilter === camp
            ? `Scénario réservé au camp ${camp === 'patron' ? 'patronal' : 'syndical'} — tu y es seul(e).`
            : 'Tu ne devrais pas voir ce scénario, vérifie les filtres.')
        : 'Scénario commun aux deux camps. Si une option te paraît cadrée du point de vue adverse, ouvre les yeux : c\'est précisément le piège historique.'}
    >
      {#if scenario.campFilter === 'patron'}
        ◆ Vue patronale
      {:else if scenario.campFilter === 'salarie'}
        ✦ Vue syndicale
      {:else}
        ◇ Scène commune · vue depuis ton camp ({camp === 'patron' ? 'patronal' : 'syndical'})
      {/if}
    </div>

    {#if autoplay.enabled}
      <div class="autoplay-banner" title="L'auto-play va sélectionner le premier choix dans {(autoplay.delayMs / 1000).toFixed(1)}s. Désactiver dans Settings.">
        <span class="autoplay-dot" aria-hidden="true"></span>
        AUTO-PLAY · {(autoplay.delayMs / 1000).toFixed(1)}s
      </div>
    {/if}
  </header>

  {#if hasImage}
    <HistoricalImage id={scenario.id} shape="tableau" />
  {/if}

  {#if identityAnchor}
    <p class="identity-anchor" in:fade={{ duration: 240, delay: 80 }}>
      {identityAnchor}
    </p>
  {/if}

  <div class="text-parchment leading-relaxed whitespace-pre-line text-sm sm:text-base">
    <GlossaryText text={setupText} />
  </div>

  {#if mode === 'reflechi'}
    <div class="text-xs italic text-parchment-dim/85 border-l-2 border-line pl-3 py-1">
      <span class="not-italic uppercase tracking-wider text-parchment-dim/80 mr-1">
        Contexte —
      </span>
      <GlossaryText text={scenario.historicalContext} />
    </div>
  {/if}

  {#if showVoices && scenario.voices}
    <VoicePanel voices={scenario.voices} />
  {/if}

  {#if scenario.quotes && scenario.quotes.length > 0}
    <div class="space-y-1.5">
      {#each scenario.quotes as q}
        <blockquote class="historical-quote">
          <span class="quote-mark" aria-hidden="true">«</span>
          <p>{q.text}</p>
          <footer>— {q.source}</footer>
        </blockquote>
      {/each}
    </div>
  {/if}

  <ul
    class="space-y-2.5 mt-3 choices-list"
    data-swipe-on={swipeable}
    aria-label="Choix disponibles"
    ontouchstart={swipeable ? onTouchStart : null}
    ontouchmove={swipeable ? onTouchMove : null}
    ontouchend={swipeable ? onTouchEnd : null}
    ontouchcancel={swipeable ? onTouchEnd : null}
  >
    {#if swipeable}
      <div class="swipe-hint" aria-hidden="true">
        <span class="hint-text">
          {#if scenario.choices.length === 3}
            ← • ↑ • → · glisse pour choisir
          {:else}
            ← • → · glisse pour choisir
          {/if}
        </span>
      </div>
    {/if}
    {#each visibleChoices(scenario) as ch, i}
      {@const posture = derivePosture(ch)}
      {@const style = POSTURE_STYLES[posture]}
      {@const previews = mode === 'reflechi' ? previewResources(ch) : []}
      {@const locked = isLocked(ch)}
      {@const coh = coherenceOf(ch)}
      {@const txt = effectiveText(ch)}
      {@const intentTxt = effectiveIntent(ch)}
      <li>
        <button
          type="button"
          class="choice-btn"
          data-posture={posture}
          data-locked={locked}
          data-coh={coh}
          data-swipe-target={swipeTarget === i}
          disabled={locked}
          style="--accent: {style.accent}; --accent-soft: {style.accentSoft}; --accent-muted: {style.accentMuted};"
          onclick={() => { scenePreview.clear(); onChoose(ch); }}
          onpointerdown={locked ? () => void sfx.play('lock') : undefined}
          onmouseenter={() => !locked && scenePreview.set({
            posture, label: style.label, intent: intentTxt
          })}
          onmouseleave={() => scenePreview.clear()}
          onfocus={() => !locked && scenePreview.set({
            posture, label: style.label, intent: intentTxt
          })}
          onblur={() => scenePreview.clear()}
          in:fly={{ y: 8, duration: 240, delay: 60 + i * 40 }}
        >
          {#if coh === 'opposed' && !locked}
            <span class="coh-flag opposed" aria-label="Ce choix va contre ton trait dominant"
                  title={`Ce choix va contre ton ${TRAIT_LABELS[dominantTrait]}. Le faire crée de la tension intérieure.`}>⚠</span>
          {:else if coh === 'aligned' && !locked}
            <span class="coh-flag aligned" aria-label="Ce choix renforce ton trait dominant"
                  title={`Ce choix te ressemble — renforce ton ${TRAIT_LABELS[dominantTrait]}.`}>✓</span>
          {/if}
          <span class="glyph" aria-hidden="true">{style.glyph}</span>

          <span class="body">
            <span class="posture-tag" data-mode={mode}>
              {#if mode === 'reflechi'}{style.label} · {intentTxt}{:else}{style.label}{/if}
            </span>
            <span class="text">{txt}</span>
            {#if ch.camp === camp}
              <span class="camp-flag" title={camp === 'patron'
                ? 'Choix spécifique au camp patronal — branche alternative ouverte par ton positionnement.'
                : 'Choix spécifique au camp salarié — branche alternative ouverte par ton positionnement.'}
              >Branche {camp === 'patron' ? 'patronale' : 'syndicale'}</span>
            {/if}
            {#if locked && ch.requiresTrait}
              <span class="lock-hint">
                Réservé au trait <b>{TRAIT_LABELS[ch.requiresTrait]}</b>
              </span>
            {/if}
            {#if !locked && mode === 'reflechi' && ch.theoryHint}
              <span class="hint">{ch.theoryHint}</span>
            {/if}
            {#if !locked && ch.ability && rebirth.state}
              {@const fs = abilityFuelScore(ch.ability, rebirth.state.resources)}
              {@const tone = fs >= 65 ? 'high' : fs >= 35 ? 'mid' : 'low'}
              {@const pct = Math.round(((fs - 50) / 250) * 100)}
              {@const pctStr = pct >= 0 ? `+${pct}%` : `${pct}%`}
              {@const breakdown = fuelBreakdown(ch.ability, rebirth.state.resources)}
              <span class="ability-hint" data-tone={tone}
                title={
                  (fs >= 65 ? `Énergie ${ABILITY_SHORT_LABEL[ch.ability]} solide (${fs}/100) → effets AMPLIFIÉS de ${pctStr}.`
                   : fs >= 35 ? `Énergie ${ABILITY_SHORT_LABEL[ch.ability]} moyenne (${fs}/100) → effets nominaux (${pctStr}).`
                   : `Énergie ${ABILITY_SHORT_LABEL[ch.ability]} en panne (${fs}/100) → effets AFFAIBLIS de ${pctStr}.`)
                  + `\n\nCalcul : ${breakdown}`
                }
              >
                ◎ Énergie {ABILITY_SHORT_LABEL[ch.ability]} : EFFETS {pctStr}
              </span>
            {/if}
            {#if !locked && previews.length > 0}
              <span class="previews">
                {#each previews as p}
                  <span class="preview" data-direction={p.direction} data-magnitude={p.magnitude}>
                    <em>{resourceGlyph(p.resource)}</em>
                    <span>{RESOURCE_SHORT_LABEL[p.resource]}</span>
                    <i>{p.direction === 'up' ? '▲' : '▼'}{p.magnitude === 'major' ? p.direction === 'up' ? '▲' : '▼' : ''}</i>
                  </span>
                {/each}
              </span>
            {/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>
</article>

<style>
  /* === Préfiguration sépia : signal par halo posture, pas par
     transparence du card. Bug remonté : la transparence à 78% +
     blur composite faisait apparaître l'écran de lecture comme
     un rectangle blanc/gris illisible sur certains écrans
     (parchment .sky bleeding through trop fort).

     Le card RESTE opaque (lisible). Seul le halo bordure et le
     box-shadow tinté à la posture signalent l'état preview-active.
     La silhouette sépia reste visible dans la marge / gutter,
     OK pour viewports larges. */
  :global(article.bordered-card.preview-active) {
    transition:
      box-shadow 0.32s ease,
      border-color 0.28s ease;
  }
  :global(article.bordered-card.preview-active[data-preview-posture='rupture']) {
    border-color: rgba(217, 106, 91, 0.65);
    box-shadow: 0 0 0 1px rgba(217, 106, 91, 0.25), 0 12px 36px rgba(217, 106, 91, 0.15);
  }
  :global(article.bordered-card.preview-active[data-preview-posture='institution']) {
    border-color: rgba(126, 180, 255, 0.65);
    box-shadow: 0 0 0 1px rgba(126, 180, 255, 0.25), 0 12px 36px rgba(126, 180, 255, 0.15);
  }
  :global(article.bordered-card.preview-active[data-preview-posture='compromis']) {
    border-color: rgba(200, 155, 60, 0.65);
    box-shadow: 0 0 0 1px rgba(200, 155, 60, 0.25), 0 12px 36px rgba(200, 155, 60, 0.15);
  }
  :global(article.bordered-card.preview-active[data-preview-posture='expertise']) {
    border-color: rgba(141, 180, 168, 0.65);
    box-shadow: 0 0 0 1px rgba(141, 180, 168, 0.25), 0 12px 36px rgba(141, 180, 168, 0.15);
  }
  :global(article.bordered-card.preview-active[data-preview-posture='opinion']) {
    border-color: rgba(180, 151, 214, 0.65);
    box-shadow: 0 0 0 1px rgba(180, 151, 214, 0.25), 0 12px 36px rgba(180, 151, 214, 0.15);
  }
  :global(article.bordered-card.preview-active[data-preview-posture='paternaliste']) {
    border-color: rgba(122, 163, 122, 0.65);
    box-shadow: 0 0 0 1px rgba(122, 163, 122, 0.25), 0 12px 36px rgba(122, 163, 122, 0.15);
  }

  .choice-btn {
    display: grid;
    grid-template-columns: 2.4rem 1fr;
    gap: 0.75rem;
    align-items: stretch;
    width: 100%;
    border: 1px solid var(--accent-muted);
    border-left-width: 2px;
    border-radius: 0.55rem;
    background: var(--accent-soft);
    padding: 0.7rem 0.85rem 0.7rem 0.65rem;
    color: #ede4c9;
    text-align: left;
    transition:
      border-color 0.18s ease,
      background 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .choice-btn:hover,
  .choice-btn:focus-visible {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    transform: translateX(2px);
    box-shadow: -2px 0 0 0 var(--accent);
    outline: none;
  }

  /* === Coherence flags (CK3-like) ===
     Indicateur posé en haut-droite du bouton de choix. */
  .coh-flag {
    position: absolute;
    top: 0.4rem;
    right: 0.45rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.75rem;
    line-height: 1;
    cursor: help;
    z-index: 1;
  }

  .coh-flag.aligned {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }

  .coh-flag.opposed {
    background: rgba(220, 38, 38, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(220, 38, 38, 0.45);
  }

  .choice-btn[data-coh='opposed']:not([disabled])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    background: rgba(220, 38, 38, 0.45);
    border-radius: 2px 0 0 2px;
  }

  .choice-btn {
    position: relative;
  }

  /* === UX-#3 — visual feedback du swipe ===
     Pendant le glissement, la carte ciblée prend la couleur d'accent
     pleine et un halo plus ample. Animation lissée. */
  .choice-btn[data-swipe-target='true'] {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    transform: scale(1.02);
    box-shadow: 0 0 0 2px var(--accent), 0 0 18px 4px color-mix(in srgb, var(--accent) 35%, transparent);
  }

  .choices-list {
    position: relative;
    /* user-select uniquement quand swipe est actif, sinon le scroll
       du texte reste utilisable normalement. */
  }

  .choices-list[data-swipe-on='true'] {
    user-select: none;
    -webkit-user-select: none;
  }

  .swipe-hint {
    display: none;
    text-align: center;
    color: rgba(244, 213, 139, 0.45);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    margin-bottom: 0.4rem;
  }

  /* On affiche l'indication seulement sur écrans tactiles. */
  @media (hover: none) and (pointer: coarse) {
    .swipe-hint {
      display: block;
    }
  }

  .choice-btn[data-posture='rupture']:hover {
    transform: translateX(2px) skewX(-0.4deg);
  }

  .choice-btn[data-posture='institution']:hover {
    transform: translateX(2px) translateY(-1px);
  }

  .choice-btn[data-posture='compromis']:hover {
    transform: translateX(2px);
  }

  .choice-btn[data-posture='expertise']:hover {
    transform: translateX(1px) translateY(-0.5px);
  }

  .choice-btn[data-posture='opinion']:hover .glyph {
    transform: scale(1.1);
  }

  .choice-btn[data-locked='true'] {
    cursor: not-allowed;
    opacity: 0.45;
    filter: grayscale(0.3);
  }

  .choice-btn[data-locked='true']:hover {
    transform: none;
    box-shadow: none;
    background: var(--accent-soft);
    border-color: var(--accent-muted);
  }

  .choice-btn[data-locked='true']:hover .glyph {
    transform: none;
  }

  .choice-btn .lock-hint {
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.78rem;
    font-style: italic;
  }

  .choice-btn .lock-hint b {
    color: var(--accent);
    font-style: normal;
    font-weight: 600;
  }

  /* Voix intérieure — courte ligne qui ancre l'identité du joueur
     dans le mode Compulsif (immersion). Italique chaud, alignée à
     gauche, séparée du setup par un fin trait or. */
  .identity-anchor {
    margin: 0;
    padding: 0.5rem 0 0.6rem;
    border-bottom: 1px solid rgba(201, 178, 106, 0.22);
    color: rgba(244, 213, 140, 0.78);
    font-family: 'Cinzel', Georgia, serif;
    font-style: italic;
    font-size: 0.82rem;
    line-height: 1.4;
    letter-spacing: 0.02em;
  }

  /* Badge POV scénario — signale honnêtement le cadrage dont est
     vu le scénario (camp filter explicite ou cadrage commun). */
  .pov-badge {
    display: inline-block;
    margin-top: 0.2rem;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: help;
  }
  .pov-badge[data-camp='patron'] {
    background: rgba(30, 92, 138, 0.16);
    border: 1px solid rgba(30, 92, 138, 0.55);
    color: #7DB1D8;
  }
  .pov-badge[data-camp='salarie'] {
    background: rgba(176, 24, 30, 0.14);
    border: 1px solid rgba(176, 24, 30, 0.5);
    color: #E08F92;
  }
  .pov-badge[data-camp='shared'] {
    background: rgba(201, 178, 106, 0.10);
    border: 1px solid rgba(201, 178, 106, 0.35);
    color: rgba(201, 178, 106, 0.85);
  }

  /* Hint « énergie d'ability » : indique que ce choix sera modulé
     par l'énergie courante de la ressource sous-jacente. Le ton
     change selon le niveau d'énergie (high/mid/low) — autodétermination,
     le joueur sait s'il joue avec ou contre ses préparations. */
  .choice-btn .ability-hint {
    display: inline-block;
    align-self: flex-start;
    margin-top: 0.18rem;
    padding: 0.05rem 0.45rem;
    border-radius: 999px;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: help;
    border: 1px solid;
  }
  .choice-btn .ability-hint[data-tone='high'] {
    background: rgba(58, 107, 71, 0.18);
    border-color: rgba(58, 107, 71, 0.55);
    color: #7BCBA1;
  }
  .choice-btn .ability-hint[data-tone='mid'] {
    background: rgba(201, 178, 106, 0.12);
    border-color: rgba(201, 178, 106, 0.4);
    color: #C9B26A;
  }
  .choice-btn .ability-hint[data-tone='low'] {
    background: rgba(217, 130, 28, 0.18);
    border-color: rgba(217, 130, 28, 0.5);
    color: #F0B870;
  }

  /* Badge « branche patronale / syndicale » — signale au joueur que
     ce choix lui est spécifique (audit asymétrie patron). Discret
     pour ne pas surcharger, mais lisible. */
  .choice-btn .camp-flag {
    display: inline-block;
    align-self: flex-start;
    margin-top: 0.18rem;
    padding: 0.05rem 0.45rem;
    background: rgba(201, 178, 106, 0.14);
    border: 1px solid rgba(201, 178, 106, 0.45);
    border-radius: 999px;
    color: #C9B26A;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: help;
  }

  .choice-btn .glyph {
    align-self: center;
    justify-self: center;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--accent-muted);
    border-radius: 50%;
    background: rgba(13, 16, 20, 0.5);
    color: var(--accent);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    line-height: 1;
    transition: transform 0.2s ease, border-color 0.18s ease;
  }

  .choice-btn:hover .glyph {
    border-color: var(--accent);
  }

  .choice-btn .body {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.28rem;
  }

  .choice-btn .posture-tag {
    color: var(--accent);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .choice-btn .posture-tag[data-mode='compulsif'] {
    opacity: 0.55;
    font-size: 0.74rem;
  }

  .choice-btn .text {
    color: #ede4c9;
    font-size: 0.94rem;
    line-height: 1.35;
    transition: color 0.18s ease;
  }

  .choice-btn:hover .text {
    color: var(--accent);
  }

  .choice-btn .hint {
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.74rem;
    font-style: italic;
    line-height: 1.35;
  }

  .choice-btn .previews {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.2rem;
  }

  .choice-btn .preview {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.45);
    padding: 0.12rem 0.5rem;
    font-size: 0.74rem;
    color: rgba(237, 228, 201, 0.78);
  }

  .choice-btn .preview em {
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.78rem;
    color: rgba(237, 228, 201, 0.7);
  }

  .choice-btn .preview i {
    font-style: normal;
    font-size: 0.72rem;
    letter-spacing: -0.05em;
  }

  .choice-btn .preview[data-direction='up'] {
    border-color: rgba(95, 181, 107, 0.35);
    color: #aedab5;
  }

  .choice-btn .preview[data-direction='up'] em,
  .choice-btn .preview[data-direction='up'] i {
    color: #aedab5;
  }

  .choice-btn .preview[data-direction='down'] {
    border-color: rgba(224, 122, 110, 0.35);
    color: #e8a09b;
  }

  .choice-btn .preview[data-direction='down'] em,
  .choice-btn .preview[data-direction='down'] i {
    color: #e8a09b;
  }

  .choice-btn .preview[data-magnitude='major'] {
    font-weight: 600;
  }

  /* Citations historiques : esquisse de parchemin, sans renverser le mode sombre. */
  .historical-quote {
    position: relative;
    border: 1px solid rgba(200, 155, 60, 0.35);
    border-radius: 0.5rem;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(200, 155, 60, 0.16) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 80%, rgba(192, 57, 43, 0.08) 0%, transparent 50%),
      linear-gradient(180deg, rgba(237, 228, 201, 0.08), rgba(237, 228, 201, 0.04));
    padding: 0.85rem 1rem 0.75rem 2.2rem;
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    font-style: italic;
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .historical-quote .quote-mark {
    position: absolute;
    top: 0.4rem;
    left: 0.85rem;
    color: #c89b3c;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.6rem;
    font-style: normal;
    line-height: 1;
    opacity: 0.7;
  }

  .historical-quote p {
    margin: 0;
  }

  .historical-quote footer {
    margin-top: 0.4rem;
    color: rgba(237, 228, 201, 0.7);
    font-style: normal;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  /* Auto-play banner — discret, en haut du scénario */
  .autoplay-banner {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.4rem;
    padding: 0.2rem 0.55rem;
    background: rgba(201, 154, 64, 0.10);
    border: 1px solid rgba(201, 154, 64, 0.32);
    border-radius: 0.3rem;
    color: #c89b3c;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    letter-spacing: 0.10em;
    text-transform: uppercase;
  }

  .autoplay-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #c89b3c;
    animation: autoplay-pulse 1.2s ease-in-out infinite;
  }

  @keyframes autoplay-pulse {
    0%, 100% { opacity: 0.4; transform: scale(0.85); }
    50%      { opacity: 1;   transform: scale(1.1);  }
  }
</style>
