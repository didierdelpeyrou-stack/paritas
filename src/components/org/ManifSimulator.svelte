<script lang="ts">
  import { fade } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { sfx } from '../../game/audio/sfx';
  import { currencyForEra } from '../../game/content/eras';
  import type { ActorId, RebirthGameState, Resources } from '../../game/types';
  import ManifMap from './ManifMap.svelte';
  import MiniGameFuelHeader from '../cockpit/MiniGameFuelHeader.svelte';
  import BrawlArena from './BrawlArena.svelte';
  import { MANIF_CITIES, findCombosFor } from '../../game/org/manifCities';
  import { abilityFuelScore, fuelMultiplier, fuelAttribution } from '../../game/simulation/resourceUtility';
  import {
    buildPlayerFaction, buildAdversaryFaction, resolveBrawl,
    type FactionRoster, type BrawlOutcome
  } from '../../game/org/factionBrawl';

  interface Props {
    gameState: RebirthGameState;
  }
  let { gameState }: Props = $props();
  const gs = $derived(gameState);

  /* === Inputs joueur === */
  let lead = $state<3 | 7 | 14>(7); // jours de préparation
  let cities = $state<string[]>(['paris']);
  let militantsAlloc = $state(0);
  let cadresAlloc = $state(0);
  let juristes = $state(0);
  let medias = $state(0);
  let motDOrdre = $state('');
  /* Combos activables */
  let preMeeting = $state(false);
  let tractMassif = $state(false);
  let saisineJuridique = $state(false);
  let caisseGreve = $state(false);

  let result = $state<ManifResult | null>(null);

  /* === Module baston : factions s'affrontent à République ===
     Le bouton « Place de la République » n'apparaît que si la manif
     passe par Paris + score ≥ 50 + tension forte. Le joueur décide. */
  interface BrawlState {
    joueur: FactionRoster;
    adversaire: FactionRoster;
    outcome: BrawlOutcome;
  }
  interface BrawlContext {
    fouleParis: number;
    policePressure: number;
    initialMomentum: number;
  }
  let brawl = $state<BrawlState | null>(null);
  let brawlContext = $state<BrawlContext | null>(null);
  /* Bloque le bouton après lancement (un brawl par manif). */
  let brawlConsumed = $state(false);

  /* Effets du brawl à appliquer quand le joueur referme l'arène. */
  let pendingBrawlEffects = $state<{ outcome: BrawlOutcome } | null>(null);

  interface ManifResult {
    score: number;
    foule: number;
    headline: string;
    storyline: string;
  }

  /* === Limites dérivées du state === */
  const maxMilitants = $derived(Math.max(5, gs.organization.militants));
  const maxCadres = $derived(gs.organization.permanentStaff);
  const maxJuristes = $derived(gs.organization.legalTeam);
  const maxMedias = $derived(gs.organization.mediaRelay);

  /* Sélection ville → cumul des coûts, des poids, et détection des combos. */
  const selectedCities = $derived(
    cities.map(id => MANIF_CITIES.find(c => c.id === id)).filter(c => !!c)
  );
  const cityCost = $derived(selectedCities.reduce((sum, c) => sum + c.cost, 0));
  const cityWeight = $derived(
    selectedCities.length === 0 ? 0 : selectedCities.reduce((sum, c) => sum + c.weight, 0)
  );
  const activeCombos = $derived(findCombosFor(cities));
  const comboScoreBonus = $derived(activeCombos.reduce((s, c) => s + c.scoreBonus, 0));

  /* Coût dynamique : caisse, plus élevé pour les manifs étendues et l'urgence. */
  const cost = $derived(
    Math.round(
      6 +
        cityCost +
        (lead === 3 ? 4 : 0) +
        (preMeeting ? 3 : 0) +
        (tractMassif ? 4 : 0) +
        (saisineJuridique ? 2 : 0) +
        (caisseGreve ? 6 : 0)
    )
  );

  function toggleCity(id: string) {
    if (cities.includes(id)) {
      cities = cities.filter(x => x !== id);
    } else {
      cities = [...cities, id];
    }
  }

  const treasury = $derived(gs.organization.treasury);
  const currency = $derived(currencyForEra(gs.era));
  const canRun = $derived(
    !result &&
      treasury >= cost &&
      cities.length >= 1 &&
      militantsAlloc >= 1 &&
      militantsAlloc <= maxMilitants &&
      cadresAlloc <= maxCadres &&
      juristes <= maxJuristes &&
      medias <= maxMedias
  );

  /* === Compute === */
  function compute(): ManifResult {
    /* Préparation : plus de jours = bonus, J+3 = malus. */
    const prep = lead === 14 ? 16 : lead === 7 ? 8 : -2;

    /* Mobilisation brute = militants × multiplicateur cadres. */
    const cadreBoost = 1 + cadresAlloc * 0.18;
    const baseFoule = militantsAlloc * cadreBoost;

    /* Multiplicateur selon les villes choisies : somme des poids
       (Paris 1.6, Lyon 1.1, etc.) + bonus combo. */
    const lieuMult = Math.max(0.8, cityWeight) + comboScoreBonus * 0.04;

    /* Combos */
    const comboBoost =
      (preMeeting ? 12 : 0) +
      (tractMassif ? 10 : 0) +
      (saisineJuridique ? 6 : 0) +
      (caisseGreve ? 14 : 0);

    /* Médias = portée presse, juristes = protection contre les charges. */
    const mediaBoost = medias * 5;
    const juristeBoost = juristes * 3;

    /* Slogan : bonus si présent et bien tourné. */
    const sl = motDOrdre.trim();
    const sloganBonus = sl.length >= 8 && sl.length <= 80 ? 6 : sl.length > 0 ? 2 : 0;

    /* Météo : variance ±8 vraiment aléatoire (sinon le joueur farme en
       ajustant militants pour optimiser la sin). */
    const meteo = Math.round(Math.random() * 16) - 8;

    /* Modulation par les ressources globales (autodétermination —
       le joueur sent que ses stats ont compté). Centré sur 1.0,
       borné à 0.8/1.2. */
    const fuel = abilityFuelScore('manifestation', gs.resources);
    const fuelMul = fuelMultiplier(fuel);

    const rawScore = (prep + baseFoule * lieuMult + comboBoost + mediaBoost + juristeBoost + sloganBonus + comboScoreBonus) * fuelMul + meteo;
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    const foule = Math.max(0, Math.round(baseFoule * lieuMult * 110 * fuelMul + comboBoost * 80 + comboScoreBonus * 60));

    /* Phrase d'attribution : explique au joueur quelles ressources ont
       fait la différence (ou ont manqué). */
    const attribution = fuelAttribution('manifestation', gs.resources, fuel);

    return {
      score,
      foule,
      headline: composeHeadline(score, foule),
      storyline: composeStoryline(score, prep, comboBoost) + (attribution ? ` ${attribution}` : '')
    };
  }

  function composeHeadline(score: number, foule: number): string {
    const lieuStr = composeLieuStr();
    if (score >= 75) return `${formatFoule(foule)} dans la rue, ${lieuStr} — la presse parle d’un tournant.`;
    if (score >= 55) return `${formatFoule(foule)} défilent à ${lieuStr}, cortèges longs, slogans repris.`;
    if (score >= 35) return `${formatFoule(foule)} mobilisés à ${lieuStr}, journée correcte sans débordement.`;
    if (score >= 20) return `${formatFoule(foule)} pour une manifestation que la presse jugera modeste.`;
    return `Faible mobilisation à ${lieuStr}. Les éditoriaux s’interrogent sur la suite du mouvement.`;
  }

  function composeLieuStr(): string {
    if (selectedCities.length === 0) return 'aucune ville';
    if (selectedCities.length === 1) return selectedCities[0]!.name;
    if (selectedCities.length === 2) return `${selectedCities[0]!.name} et ${selectedCities[1]!.name}`;
    if (selectedCities.length >= 5) return 'la France entière';
    const names = selectedCities.map(c => c.name);
    const last = names.pop();
    return `${names.join(', ')} et ${last}`;
  }

  function composeStoryline(score: number, prep: number, combo: number): string {
    if (score >= 70 && combo > 20) return 'La préparation s’est sentie : pré-meeting plein, tracts dans toutes les boîtes, juristes sur les charges. Le service d’ordre tient.';
    if (score >= 70) return 'La rue est dense, les militants disciplinés. La fatigue se voit dans le métro du retour.';
    if (score >= 40) return 'Bonne tenue d’ensemble, quelques moments creux. Les médias retiennent le ton.';
    if (prep < 0) return 'Préparation trop courte : la mobilisation a manqué de jours pour respirer.';
    return 'La manifestation passe, mais peu se souviendront de la date.';
  }

  function formatFoule(n: number): string {
    if (n >= 100_000) return `${Math.round(n / 1000)} 000`;
    if (n >= 10_000) return `${Math.round(n / 1000)} 000`;
    if (n >= 1000) {
      const milliers = Math.floor(n / 1000);
      const centaines = Math.round((n % 1000) / 100);
      return centaines === 0
        ? `${milliers} 000`
        : `${milliers},${centaines} 000`;
    }
    return `${n}`;
  }

  /* === Apply effects === */
  function run() {
    if (!canRun) return;
    const r = compute();
    result = r;

    /* Effets : rapport de force monte avec la foule, santé sociale baisse
       (mobilisation use les corps), confiance & légitimité variables. */
    const resourceDelta: Partial<Resources> = {
      caisse: -cost,
      rapportDeForce: Math.round(r.score * 0.18),
      santeSociale: -Math.round(r.score * 0.08 + (caisseGreve ? 2 : 0)),
      legitimite: Math.round(r.score >= 50 ? 4 : -2),
      confiance: Math.round((r.score - 35) * 0.18)
    };

    const repressionRisk = r.score >= 60 && juristes < 1 ? 5 : 0;
    const actorDelta: Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>> = {
      base: {
        trust: r.score >= 50 ? 4 : -3,
        pressure: -2
      },
      etat: { pressure: Math.round(r.score * 0.2), patience: -3, trust: -repressionRisk },
      adversaire: { patience: -Math.round(r.score * 0.12) },
      opinion: { trust: r.score >= 45 ? 3 : -2 }
    };

    /* Fatigue militante : mobilisation prolongée fatigue, surtout caisse de grève. */
    const fatigueGain = Math.round(8 + (caisseGreve ? 14 : 0) + (lead === 3 ? 6 : 0));

    rebirth.applyOperation({
      label: `Manifestation (score ${r.score}/100, ${r.foule} personnes) — ${r.headline}`,
      resourceDelta,
      actorDelta,
      organizationDelta: {
        mobilisationFatigue: fatigueGain,
        militants: r.score < 30 ? -2 : 0,
        cohesion: r.score >= 60 ? 2 : -1
      }
    });
    void sfx.play(r.score >= 70 ? 'fanfare' : r.score >= 45 ? 'impact' : 'fail');

    /* === Module baston : prépare le contexte si conditions remplies ===
       - Paris est dans les villes ciblées
       - Score ≥ 50 (manif significative)
       - Soit adversaire stance dur, soit score >= 75 (rue tendue)
       Le déclenchement reste à la main du joueur via le bouton
       « Place de la République ». Force du joueur : foule effective
       à Paris (proportionnelle à la part de Paris dans le multi-ville). */
    brawlContext = null;
    brawlConsumed = false;
    const includesParis = cities.includes('paris');
    const advStance = gs.actors.adversaire?.stance;
    const tensionForte = advStance === 'dur' || r.score >= 75;
    if (includesParis && r.score >= 50 && tensionForte) {
      const parisCity = MANIF_CITIES.find(c => c.id === 'paris');
      const parisWeight = parisCity?.cost ?? 1;
      const totalCityCost = selectedCities.reduce((s, c) => s + c.cost, 0);
      const parisRatio = totalCityCost > 0 ? parisWeight / totalCityCost : 1;
      const fouleParis = Math.round(r.foule * parisRatio);
      const policePressure = (gs.actors.etat?.pressure ?? 30) +
        (advStance === 'dur' ? 25 : 0);
      const initialMomentum = (r.score - 50) * 0.6;
      brawlContext = { fouleParis, policePressure, initialMomentum };
    }
  }

  /* Lance le brawl à la demande du joueur depuis l'écran de résultat. */
  function launchBrawl() {
    if (!brawlContext || brawlConsumed) return;
    const { fouleParis, policePressure, initialMomentum } = brawlContext;
    const joueur = buildPlayerFaction({
      camp: gs.camp,
      fouleParis,
      militants: gs.organization.militants,
      cadres: gs.organization.permanentStaff,
      cohesion: gs.organization.cohesion
    });
    const adversaire = buildAdversaryFaction({
      camp: gs.camp,
      fouleParis,
      era: gs.era,
      policePressure
    });
    const outcome = resolveBrawl({ joueur, adversaire, initialMomentum });
    brawl = { joueur, adversaire, outcome };
    pendingBrawlEffects = { outcome };
    brawlConsumed = true;
  }

  /* Quand le joueur referme l'arène : applique les effets du brawl
     en plus des effets de la manif. */
  function closeBrawl() {
    if (pendingBrawlEffects) {
      const out = pendingBrawlEffects.outcome;
      rebirth.applyOperation({
        label: `Affrontement Place de la République : ${out.result === 'victoire' ? 'victoire' : out.result === 'defaite' ? 'défaite' : 'nul'} (${out.totalJoueurLosses} blessés des nôtres, ${out.totalAdversaireLosses} en face)`,
        resourceDelta: out.effects,
        actorDelta: {
          /* Pression État monte fortement en cas d'affrontement direct. */
          etat: { pressure: out.result === 'defaite' ? +12 : +6, patience: -8 }
        },
        organizationDelta: {
          mobilisationFatigue: 12,
          militants: -Math.min(20, Math.round(out.totalJoueurLosses / 30))
        }
      });
      void sfx.play(out.result === 'victoire' ? 'fanfare' : out.result === 'defaite' ? 'fail' : 'impact');
      pendingBrawlEffects = null;
    }
    brawl = null;
  }

  function reset() {
    result = null;
    motDOrdre = '';
    militantsAlloc = 0;
    cadresAlloc = 0;
    juristes = 0;
    medias = 0;
    preMeeting = tractMassif = saisineJuridique = caisseGreve = false;
    brawlContext = null;
    brawlConsumed = false;
  }
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Simulateur</div>
    <h3 class="font-display text-gold text-base">Préparer une manifestation</h3>
    <p class="text-xs text-parchment-dim/85 mt-1">
      Choisis la date, le lieu, alloue les forces, active les combinaisons. Coût indicatif : {cost} {currency}.
    </p>
  </div>

  <MiniGameFuelHeader ability="manifestation" title="ta manif" />

  {#if !result}
    <div in:fade={{ duration: 200 }} class="space-y-3">
      <!-- Date / lead time -->
      <div>
        <div class="meta-label">Délai de préparation</div>
        <div class="grid grid-cols-3 gap-1.5 mt-1">
          {#each [3, 7, 14] as d (d)}
            <button
              type="button"
              class="opt-btn"
              data-active={lead === d}
              onclick={() => (lead = d as typeof lead)}
            >J+{d}</button>
          {/each}
        </div>
      </div>

      <!-- Carte stratégique : choix des villes -->
      <div>
        <div class="meta-label">
          Carte stratégique
          <em class="not-italic text-gold-soft/85">{cities.length} ville{cities.length > 1 ? 's' : ''}</em>
        </div>
        <div class="mt-1">
          <ManifMap selected={cities} onToggle={toggleCity} {currency} />
        </div>
        {#if activeCombos.length > 0}
          <div class="combo-list">
            {#each activeCombos as cb}
              <div class="combo-line">
                <b>★ {cb.label}</b>
                <small>{cb.description}</small>
                <em>+{cb.scoreBonus}</em>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Allocation -->
      <div class="grid grid-cols-2 gap-2.5">
        <label>
          <span class="meta-label">Militants <em class="not-italic text-gold-soft/85">{militantsAlloc}/{maxMilitants}</em></span>
          <input type="range" min="0" max={maxMilitants} bind:value={militantsAlloc} class="slider" />
        </label>
        <label>
          <span class="meta-label">Cadres expérimentés <em class="not-italic text-gold-soft/85">{cadresAlloc}/{maxCadres}</em></span>
          <input type="range" min="0" max={maxCadres} bind:value={cadresAlloc} class="slider" />
        </label>
        <label>
          <span class="meta-label">Juristes (anti-charges) <em class="not-italic text-gold-soft/85">{juristes}/{maxJuristes}</em></span>
          <input type="range" min="0" max={maxJuristes} bind:value={juristes} class="slider" />
        </label>
        <label>
          <span class="meta-label">Relais médias <em class="not-italic text-gold-soft/85">{medias}/{maxMedias}</em></span>
          <input type="range" min="0" max={maxMedias} bind:value={medias} class="slider" />
        </label>
      </div>

      <!-- Combos -->
      <div>
        <div class="meta-label">Combinaisons</div>
        <div class="grid grid-cols-2 gap-1.5 mt-1">
          <button type="button" class="combo-btn" data-active={preMeeting}
                  onclick={() => (preMeeting = !preMeeting)}>
            <b>Pré-meeting J-3</b><small>+ mobilisation, +3 {currency}</small>
          </button>
          <button type="button" class="combo-btn" data-active={tractMassif}
                  onclick={() => (tractMassif = !tractMassif)}>
            <b>Tractage massif</b><small>+ opinion, +4 {currency}</small>
          </button>
          <button type="button" class="combo-btn" data-active={saisineJuridique}
                  onclick={() => (saisineJuridique = !saisineJuridique)}>
            <b>Saisine juridique</b><small>pression État, +2 {currency}</small>
          </button>
          <button type="button" class="combo-btn" data-active={caisseGreve}
                  onclick={() => (caisseGreve = !caisseGreve)}>
            <b>Caisse de grève ouverte</b><small>tient les corps, +6 {currency}</small>
          </button>
        </div>
      </div>

      <!-- Mot d'ordre -->
      <label class="block">
        <span class="meta-label">Mot d’ordre · ce que disent les banderoles</span>
        <textarea
          bind:value={motDOrdre}
          rows="2"
          maxlength="120"
          placeholder="ex. Pas de retraite, pas de paix sociale · Vivre et travailler au pays"
          class="slogan-input"
        ></textarea>
      </label>

      <button type="button" class="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canRun} onclick={run}>
        Lancer la manifestation · {cost} {currency}
      </button>
      {#if treasury < cost}
        <p class="text-[0.78rem] italic text-rose-300">Caisse insuffisante.</p>
      {:else if cities.length < 1}
        <p class="text-[0.78rem] italic text-rose-300">Choisis au moins une ville.</p>
      {:else if militantsAlloc < 1}
        <p class="text-[0.78rem] italic text-rose-300">Place au moins un militant.</p>
      {/if}
    </div>
  {:else}
    <div in:fade={{ duration: 240 }} class="space-y-3">
      <div class="result-score" data-grade={result.score >= 70 ? 'high' : result.score >= 40 ? 'mid' : 'low'}>
        <div class="num">{result.score}<small>/100</small></div>
        <div class="lbl">Mobilisation</div>
      </div>

      <p class="result-line"><b>{result.headline}</b></p>
      <p class="result-line italic text-parchment-dim/90">{result.storyline}</p>

      {#if brawlContext && !brawlConsumed}
        <button type="button" class="btn-brawl w-full" onclick={launchBrawl}>
          <span class="brawl-icon" aria-hidden="true">⚔</span>
          <span class="brawl-stack">
            <b>Place de la République : ça chauffe</b>
            <small>{brawlContext.fouleParis.toLocaleString('fr-FR')} dans la rue · CRS en face · entrer dans la mêlée ?</small>
          </span>
        </button>
      {:else if brawlConsumed}
        <p class="text-[0.78rem] italic text-parchment-dim/70 text-center">
          Affrontement de République consommé pour cette manif.
        </p>
      {/if}

      <button type="button" class="btn-ghost w-full" onclick={reset}>Préparer une autre manifestation</button>
    </div>
  {/if}
</section>

<!-- Module baston : arène Place de la République, déclenchée si la
     manif passe par Paris + score ≥ 50 + tension forte. -->
{#if brawl}
  <BrawlArena
    joueur={brawl.joueur}
    adversaire={brawl.adversaire}
    outcome={brawl.outcome}
    onClose={closeBrawl}
  />
{/if}

<style>
  .meta-label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.4rem;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 0.2rem;
  }

  .opt-btn {
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    color: rgba(237, 228, 201, 0.78);
    padding: 0.5rem 0.4rem;
    font-size: 0.74rem;
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  }

  .opt-btn:hover {
    border-color: rgba(244, 213, 139, 0.45);
    color: #f4d58b;
  }

  .opt-btn[data-active='true'] {
    border-color: rgba(244, 213, 139, 0.7);
    background: rgba(201, 154, 64, 0.13);
    color: #f4d58b;
  }

  .slider {
    width: 100%;
    accent-color: #c89b3c;
    height: 1.4rem;
  }

  .combo-btn {
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.3);
    padding: 0.5rem 0.6rem;
    text-align: left;
    color: rgba(237, 228, 201, 0.85);
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .combo-btn b {
    display: block;
    color: #ede4c9;
    font-size: 0.74rem;
  }

  .combo-btn small {
    display: block;
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.74rem;
    line-height: 1.3;
  }

  .combo-btn[data-active='true'] {
    border-color: rgba(95, 181, 107, 0.55);
    background: rgba(95, 181, 107, 0.08);
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
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .combo-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: 0.5rem;
  }

  .combo-line {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.4rem;
    align-items: baseline;
    border: 1px solid rgba(244, 213, 139, 0.4);
    border-radius: 0.4rem;
    background: rgba(201, 154, 64, 0.08);
    padding: 0.4rem 0.55rem;
  }

  .combo-line b {
    grid-column: 1;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
  }

  .combo-line em {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    color: #aedab5;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.85rem;
  }

  .combo-line small {
    grid-column: 1;
    color: rgba(237, 228, 201, 0.78);
    font-size: 0.74rem;
    line-height: 1.3;
    font-style: italic;
  }

  /* Bouton « Place de la République » : déclenche l'arène. */
  .btn-brawl {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    border: 1px solid rgba(217, 41, 26, 0.55);
    border-radius: 0.55rem;
    background: linear-gradient(135deg, rgba(217, 41, 26, 0.15), rgba(122, 15, 15, 0.18));
    padding: 0.7rem 0.85rem;
    text-align: left;
    color: #ede4c9;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.12s ease;
    cursor: pointer;
  }

  .btn-brawl:hover {
    border-color: rgba(244, 213, 139, 0.7);
    background: linear-gradient(135deg, rgba(217, 41, 26, 0.22), rgba(122, 15, 15, 0.28));
    transform: translateY(-1px);
  }

  .btn-brawl:active {
    transform: translateY(0);
  }

  .brawl-icon {
    font-size: 1.5rem;
    color: #f4d58b;
    flex-shrink: 0;
  }

  .brawl-stack {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
  }

  .brawl-stack b {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
  }

  .brawl-stack small {
    color: rgba(237, 228, 201, 0.78);
    font-size: 0.74rem;
    line-height: 1.3;
    font-style: italic;
  }
</style>
