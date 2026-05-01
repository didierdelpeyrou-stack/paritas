<script lang="ts">
  /* ============================================================
     Paritas — entrée principale
     Intro → boucle (Carte ou Dialogue selon format) → Épilogue
     ============================================================ */
  import { fade, fly } from 'svelte/transition';

  import { game } from '$lib/stores/game.svelte';
  import { fx } from '$lib/stores/fx.svelte';
  import { applyChoicePipeline } from '$lib/game/dialectic';
  import { rollDice, adjustEffectsByCriticals, type RollOutcome, type Bonus } from '$lib/game/dice';
  import { EventGenerator } from '$lib/game/EventGenerator';
  import { audio } from '$lib/audio/audio';

  import { eraForTurn } from '$lib/data/eras';
  import { FIGURES, FIG_BY_UNLOCK } from '$lib/data/figures';
  import { LEGENDARY_CHARACTERS, type LegendaryCharacter } from '$lib/data/legendaryCharacters';
  import type { GameEvent, Choice, Camp, GameMode, Difficulty, SkillKey } from '$lib/types';

  import Card from '$components/Card.svelte';
  import DialogueScene from '$components/DialogueScene.svelte';
  import Sidebar from '$components/Sidebar.svelte';
  import ObjectiveBar from '$components/ObjectiveBar.svelte';
  import SkillSlot from '$components/SkillSlot.svelte';
  import Confetti from '$components/Confetti.svelte';

  /* ============= state UI ============= */
  const eventGenerator = new EventGenerator();
  let started = $state(false);
  let currentEvent = $state<GameEvent | null>(null);
  let seenIds = $state<Set<string>>(new Set());

  /* tirage slot */
  let diceOpen = $state(false);
  let diceRolling = $state(false);
  let diceOutcome = $state<RollOutcome | null>(null);
  let diceLabel = $state('');
  let diceSkillVal = $state(0);
  let diceDc = $state(50);
  let diceBonuses = $state<Bonus[]>([]);
  let pendingChoice: Choice | null = null;
  let pendingEvent: GameEvent | null = null;

  /* confettis */
  let showConfetti = $state(false);
  let flashDeltas = $state<Array<[string, number]>>([]);

  /* form intro */
  let formName = $state('');
  let formCamp = $state<Camp | null>(null);
  let formMode = $state<GameMode>('compulsif');
  let formDifficulty = $state<Difficulty>(1);
  let formTrait = $state<SkillKey>('negociation');
  let formLegendaryId = $state<string | null>(null);
  let availableLegends = $derived(formCamp ? LEGENDARY_CHARACTERS.filter((character) => character.camp === formCamp) : []);
  let selectedLegend = $derived(availableLegends.find((character) => character.id === formLegendaryId) ?? null);

  $effect(() => {
    if (!formCamp) {
      formLegendaryId = null;
      return;
    }
    if (!availableLegends.some((character) => character.id === formLegendaryId)) {
      formLegendaryId = availableLegends[0]?.id ?? null;
    }
  });

  /* ============= sélection d'événement ============= */
  function pickEvent(): GameEvent {
    const ev = eventGenerator.next({
      turn: game.state.turn,
      era: eraForTurn(game.state.turn).id,
      camp: game.state.camp!,
      state: game.state,
      seenIds
    });
    seenIds.add(ev.id);
    return ev;
  }

  /* ============= démarrage ============= */
  function start() {
    if (!formName.trim() || !formCamp) return;
    game.start({ name: formName.trim(), camp: formCamp, mode: formMode, difficulty: formDifficulty, trait: formTrait, legendaryId: formLegendaryId });
    seenIds = new Set();
    currentEvent = pickEvent();
    started = true;
    audio.startMusic(0).catch(() => {});
  }

  function skillBonusText(character: LegendaryCharacter): string {
    return Object.entries(character.skillAffinity)
      .map(([key, value]) => `${skillLabel(key as SkillKey)} +${Math.round((value ?? 0) * 5)}`)
      .join(' · ');
  }

  function statBonusText(character: LegendaryCharacter): string {
    return Object.entries(character.statBias)
      .map(([key, value]) => `${statLabel(key)} ${(value ?? 0) >= 0 ? '+' : ''}${Math.round((value ?? 0) * 3)}`)
      .join(' · ');
  }

  function skillLabel(skill: SkillKey): string {
    return {
      negociation: 'Négociation',
      politique: 'Politique',
      baratin: 'Tribune',
      production: 'Production',
      mobilisation: 'Mobilisation',
      expertise: 'Expertise'
    }[skill];
  }

  function statLabel(stat: string): string {
    return {
      prestige: 'Prestige',
      caisse: 'Caisse',
      soutien: 'Soutien',
      influence: 'Influence',
      sante: 'Santé',
      economique: 'Cap. économique',
      social: 'Cap. social',
      militant: 'Cap. militant',
      institutionnel: 'Cap. institutionnel',
      symbolique: 'Cap. symbolique'
    }[stat] ?? stat;
  }

  /* ============= choix ============= */
  function onChoose(idx: number) {
    if (!currentEvent) return;
    const ch = currentEvent.choices[idx]!;
    pendingChoice = ch;
    pendingEvent = currentEvent;
    audio.click();

    /* mode tirage avec slot animé */
    if (game.state.mode === 'compulsif' && ch.skillUp) {
      const skillVal = game.state.skills[ch.skillUp];
      const dc = ch.dc ?? 50;
      diceLabel = ch.skillUp;
      diceSkillVal = skillVal;
      diceDc = dc;
      diceBonuses = computeBonuses(ch.skillUp);
      diceOutcome = null;
      diceRolling = true;
      diceOpen = true;
      audio.dice();

      setTimeout(() => {
        const out = rollDice(skillVal, dc, diceBonuses);
        diceOutcome = out;
        diceRolling = false;
        // Track des stats de jet
        game.recordRoll(ch.skillUp!, out.roll, out.success, out.jackpot, out.epicFail);
        if (out.jackpot) { showConfetti = true; setTimeout(() => (showConfetti = false), 2400); audio.fanfare(); }
        else if (out.epicFail) audio.fail();
        else if (out.success) audio.success();
        else audio.fail();
      }, 1400);
      return;
    }

    /* sinon : application directe */
    finalizeChoice(ch, /*success*/ true, /*jackpot*/ false, /*fail*/ false);
  }

  function onDiceContinue() {
    diceOpen = false;
    if (!pendingChoice || !diceOutcome) return;
    finalizeChoice(pendingChoice, diceOutcome.success, diceOutcome.jackpot, diceOutcome.epicFail);
  }

  function finalizeChoice(ch: Choice, success: boolean, jackpot: boolean, epicFail: boolean) {
    let eff = success ? { ...ch.effects } : { ...(ch.effectsFail ?? halve(ch.effects)) };
    if (jackpot) eff = adjustEffectsByCriticals(eff as Record<string, number>, true, false);
    if (epicFail) eff = adjustEffectsByCriticals(eff as Record<string, number>, false, true);

    const ev = pendingEvent!;
    const { deltas, tensions } = applyChoicePipeline({
      tag: ch.tag ?? null,
      success,
      effects: eff
    });

    /* Visual deltas (pops "+5" sur les jauges/lingots) */
    fx.pushDeltas(deltas);
    flashDeltas = deltas.filter(([, v]) => Math.round(v) !== 0).slice(0, 5);
    setTimeout(() => (flashDeltas = []), 1300);

    /* journal */
    const dStr = deltas.map(([k, v]) => `${k}${v >= 0 ? '+' : ''}${Math.round(v)}`).join(' · ');
    game.log(`<b>T${game.state.turn} — ${ev.title}.</b> ${ch.text}. <span class="text-emerald-400">${dStr}</span>`);
    if (tensions.length) game.log(`<i class="text-violet-300">⚠ ${tensions.join(' · ')}</i>`);

    /* flag */
    if (ch.flag) game.state.flags[ch.flag] = game.state.turn;
    if (ch.skillUp && success) {
      game.state.skills[ch.skillUp] = Math.min(100, game.state.skills[ch.skillUp] + 2);
    }

    /* compteurs */
    if (jackpot) game.state.jackpotCount++;
    if (epicFail) game.state.epicFailCount++;

    /* débloquer figure */
    if (ev.unlocks) {
      const fid = FIG_BY_UNLOCK[ev.unlocks];
      if (fid && !game.state.figures.includes(fid)) {
        game.state.figures.push(fid);
        const f = FIGURES.find(x => x.id === fid);
        if (f?.bonus) {
          for (const k in f.bonus) {
            const cur = game.getStat(k);
            game.setStat(k as any, cur + (f.bonus[k as keyof typeof f.bonus] ?? 0));
          }
        }
      }
    }

    /* trace décision */
    game.state.decisions.push({
      turn: game.state.turn,
      era: eraForTurn(game.state.turn).name,
      title: ev.title,
      choice: ch.text,
      tag: ch.tag,
      success
    });

    /* fin de partie ? */
    game.state.turn++;
    if (game.state.turn > 100) {
      game.state.ended = 'fin';
      audio.stopMusic();
      audio.fanfare();
      game.persist();
      return;
    }
    if (game.state.resources.soutien <= 5 && game.state.turn > 10) {
      game.state.ended = 'evince';
      audio.stopMusic();
      game.persist();
      return;
    }

    /* changement d'époque ? */
    const newEra = eraForTurn(game.state.turn);
    if (newEra.id !== game.state.era) {
      game.state.era = newEra.id;
      audio.startMusic(newEra.id).catch(() => {});
    }

    /* prochain événement */
    pendingChoice = null;
    pendingEvent = null;
    currentEvent = pickEvent();
    game.persist();
  }

  function halve(eff: Record<string, number>): Record<string, number> {
    const r: Record<string, number> = {};
    for (const k in eff) r[k] = Math.round(-eff[k]! / 2);
    return r;
  }

  function computeBonuses(skill: SkillKey): Bonus[] {
    const out: Bonus[] = [];
    for (const f of FIGURES) {
      if (game.state.figures.includes(f.id) && f.bonus?.[skill]) {
        out.push({ src: f.nom.split(' ').slice(-1)[0]!, v: f.bonus[skill]! });
      }
    }
    return out;
  }
</script>

<svelte:head>
  <title>Paritas — luttes syndicales et paritarisme</title>
</svelte:head>

<main class="min-h-dvh px-4 py-6 max-w-7xl mx-auto">
  {#if !started}
    <!-- ============ INTRO ============ -->
    <div class="max-w-3xl mx-auto bordered-card p-8" in:fade={{ duration: 400 }}>
      <h1 class="font-display text-4xl uppercase tracking-widest text-amber-400 mb-1">Paritas</h1>
      <p class="text-parchment-dim italic mb-6">Naissance des luttes syndicales et du paritarisme — 100 tours, 4 époques</p>

      <div class="bg-ink/40 border-l-2 border-amber-500 px-4 py-3 my-4 italic text-parchment-dim leading-relaxed">
        Ce jeu ne transforme pas la lutte sociale en divertissement.<br>
        Il propose une simulation historique.<br><br>
        Le paritarisme n'est pas un décor.<br>
        C'est une forme fragile de civilisation sociale :<br>
        il naît quand des adversaires acceptent de se reconnaître comme interlocuteurs.
      </div>

      <h3 class="font-display text-amber-400 mt-6 mb-3 uppercase tracking-wider">🎯 Trois axes à équilibrer</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="rounded-lg p-4 text-center border border-amber-500/40 bg-amber-500/5">
          <div class="text-3xl">⚡</div>
          <div class="font-display text-amber-400 tracking-wider mt-2">PUISSANCE</div>
          <p class="text-xs text-parchment-dim/80 italic mt-1">Caisse · Influence · Mobilisation</p>
        </div>
        <div class="rounded-lg p-4 text-center border border-emerald-500/40 bg-emerald-500/5">
          <div class="text-3xl">🌿</div>
          <div class="font-display text-emerald-400 tracking-wider mt-2">LÉGITIMITÉ</div>
          <p class="text-xs text-parchment-dim/80 italic mt-1">Soutien · Prestige · Cap. social, symbolique</p>
        </div>
        <div class="rounded-lg p-4 text-center border border-violet-500/40 bg-violet-500/5">
          <div class="text-3xl">🏛</div>
          <div class="font-display text-violet-300 tracking-wider mt-2">DURABILITÉ</div>
          <p class="text-xs text-parchment-dim/80 italic mt-1">Santé · Expertise · Cap. institutionnel</p>
        </div>
      </div>
      <p class="text-xs italic text-parchment-dim/70 text-center my-4">
        ⚠ Désaligner ces 3 axes pénalise ton score final.
      </p>

      <!-- form -->
      <div class="space-y-3 mt-6">
        <label class="block">
          <span class="text-xs uppercase tracking-wider text-parchment-dim/70">Nom du protagoniste</span>
          <input bind:value={formName} placeholder="ex. Marguerite, Léon…"
                 class="mt-1 w-full px-3 py-2 bg-ink border border-line rounded-md text-parchment focus:border-amber-500 focus:outline-none" />
        </label>

        <div>
          <span class="text-xs uppercase tracking-wider text-parchment-dim/70">Camp</span>
          <div class="grid grid-cols-2 gap-3 mt-2">
            <button type="button" onclick={() => formCamp = 'salarie'}
                    class="rounded-lg p-4 text-center border-2 transition-all
                           {formCamp === 'salarie' ? 'border-rose-500 bg-rose-500/10' : 'border-line hover:border-line/80'}">
              <div class="font-display text-amber-400">Côté salarié 🚩</div>
              <div class="text-xs text-parchment-dim/70 mt-1">Délégué, syndicaliste</div>
            </button>
            <button type="button" onclick={() => formCamp = 'patron'}
                    class="rounded-lg p-4 text-center border-2 transition-all
                           {formCamp === 'patron' ? 'border-blue-500 bg-blue-500/10' : 'border-line hover:border-line/80'}">
              <div class="font-display text-amber-400">Côté patronal 🏛️</div>
              <div class="text-xs text-parchment-dim/70 mt-1">Industriel, dirigeant patronal</div>
            </button>
          </div>
        </div>

        {#if formCamp}
          <div>
            <span class="text-xs uppercase tracking-wider text-parchment-dim/70">Personnage légendaire</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {#each availableLegends as legend}
                <button type="button" onclick={() => formLegendaryId = legend.id}
                        class="rounded-lg p-3 text-left border-2 transition-all
                               {formLegendaryId === legend.id ? 'border-amber-500 bg-amber-500/10' : 'border-line hover:border-amber-500/60 bg-ink/20'}">
                  <div class="font-display text-amber-400 text-sm leading-tight">{legend.name}</div>
                  <div class="text-xs text-parchment-dim/70 mt-1">{legend.archetype}</div>
                  <div class="text-[0.68rem] text-parchment-dim/80 mt-2 leading-snug">{skillBonusText(legend)}</div>
                </button>
              {/each}
            </div>

            {#if selectedLegend}
              <div class="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div class="font-display text-amber-300 tracking-wider">{selectedLegend.name}</div>
                    <p class="text-sm italic text-parchment-dim mt-1">{selectedLegend.signature}</p>
                  </div>
                  <div class="text-xs text-emerald-300 sm:text-right">{statBonusText(selectedLegend)}</div>
                </div>
                <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {#each selectedLegend.phases as phase}
                    <div class="rounded-md border border-line/70 bg-ink/25 p-2">
                      <div class="text-[0.65rem] uppercase tracking-wider text-gold font-display">{phase.label}</div>
                      <div class="text-xs text-parchment-dim/80 mt-1 leading-snug">{phase.trial}</div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <label class="block">
          <span class="text-xs uppercase tracking-wider text-parchment-dim/70">Mode de jeu</span>
          <select bind:value={formMode}
                  class="mt-1 w-full px-3 py-2 bg-ink border border-line rounded-md text-parchment">
            <option value="reflechi">Réfléchi — induction, effets et rappels théoriques</option>
            <option value="compulsif">Compulsif — tirage de compétences, rythme RPG</option>
          </select>
        </label>

        <label class="block">
          <span class="text-xs uppercase tracking-wider text-parchment-dim/70">Trait dominant (+10)</span>
          <select bind:value={formTrait}
                  class="mt-1 w-full px-3 py-2 bg-ink border border-line rounded-md text-parchment">
            <option value="negociation">⚖️ Négociateur</option>
            <option value="politique">♟️ Politique</option>
            <option value="baratin">🗣️ Tribun</option>
            <option value="production">📈 Gestionnaire</option>
            <option value="mobilisation">✊ Mobilisateur</option>
            <option value="expertise">📚 Expert</option>
          </select>
        </label>

        <label class="block">
          <span class="text-xs uppercase tracking-wider text-parchment-dim/70">Difficulté</span>
          <select bind:value={formDifficulty}
                  class="mt-1 w-full px-3 py-2 bg-ink border border-line rounded-md text-parchment">
            <option value={0}>Apprenti</option>
            <option value={1}>Délégué</option>
            <option value={2}>Permanent syndical</option>
          </select>
        </label>

        <button type="button" class="btn-primary w-full mt-4" onclick={start}>
          Entrer dans l'histoire
        </button>
      </div>
    </div>

  {:else if game.state.ended === 'fin' || game.state.ended === 'evince'}
    <!-- ============ ÉPILOGUE ============ -->
    <div class="max-w-2xl mx-auto bordered-card p-8 text-center" in:fade>
      <h2 class="font-display text-3xl text-amber-400 mb-2">Épilogue</h2>
      <p class="italic text-parchment-dim mb-6">
        {game.state.name}, {game.state.turn - 1} tours, {game.state.camp === 'patron' ? 'patronat' : 'salariat'}
      </p>
      <div class="text-6xl font-display font-bold text-amber-400 mb-2">{game.scoreDialectic}<span class="text-2xl text-parchment-dim/60">/100</span></div>
      <p class="italic text-parchment-dim mb-6">Score dialectique</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-left mb-6">
        <div class="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
          <div class="text-parchment-dim/70 uppercase tracking-wider font-display text-[0.62rem]">Jets</div>
          <div class="text-2xl text-amber-300 font-display">{game.state.rollStats.total}</div>
        </div>
        <div class="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div class="text-parchment-dim/70 uppercase tracking-wider font-display text-[0.62rem]">Réussite</div>
          <div class="text-2xl text-emerald-300 font-display">
            {game.state.rollStats.total ? Math.round((game.state.rollStats.success / game.state.rollStats.total) * 100) : 0}%
          </div>
        </div>
        <div class="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
          <div class="text-parchment-dim/70 uppercase tracking-wider font-display text-[0.62rem]">Meilleur brut</div>
          <div class="text-2xl text-yellow-200 font-display">{game.state.rollStats.bestRoll || '—'}</div>
        </div>
        <div class="rounded-md border border-rose-500/30 bg-rose-500/5 p-3">
          <div class="text-parchment-dim/70 uppercase tracking-wider font-display text-[0.62rem]">Série max</div>
          <div class="text-2xl text-rose-200 font-display">{game.state.rollStats.longestStreak}</div>
        </div>
      </div>
      <button class="btn-primary" onclick={() => { game.reset(); started = false; }}>Rejouer</button>
    </div>

  {:else if currentEvent}
    <!-- ============ BOUCLE DE TOUR ============ -->
    <div class="grid lg:grid-cols-[320px_1fr] gap-4">
      <Sidebar />
      <div class="space-y-4">
        <ObjectiveBar />
        {#key currentEvent.id + '-' + game.state.turn}
          {#if currentEvent.format === 'suzerain'}
            <DialogueScene event={currentEvent} camp={game.state.camp!} mode={game.state.mode} gameState={game.state} onChoose={onChoose} />
          {:else}
            <Card event={currentEvent} camp={game.state.camp!} mode={game.state.mode} gameState={game.state} onChoose={onChoose} />
          {/if}
        {/key}

        <!-- Journal -->
        {#if game.state.log.length > 0}
          <div class="bordered-card p-3 max-h-48 overflow-y-auto text-xs space-y-1.5 text-parchment-dim/80"
               in:fade={{ duration: 300 }}>
            {#each game.state.log.slice(-10).reverse() as line}
              <div class="border-b border-line/50 pb-1 last:border-0">{@html line}</div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Slot de compétence -->
  <SkillSlot
    open={diceOpen}
    skillLabel={diceLabel}
    skillValue={diceSkillVal}
    dc={diceDc}
    bonuses={diceBonuses}
    rolling={diceRolling}
    outcome={diceOutcome}
    onClose={onDiceContinue}
  />

  {#if showConfetti}
    <Confetti count={50} colors={['#ffd700', '#c89b3c', '#ede4c9']} />
  {/if}

  {#if flashDeltas.length}
    <div class="choice-flash" aria-live="polite">
      {#each flashDeltas as [k, v]}
        <span class:up={v > 0} class:down={v < 0}>{k} {v > 0 ? '+' : ''}{Math.round(v)}</span>
      {/each}
    </div>
  {/if}
</main>

<style>
  .choice-flash {
    position: fixed;
    left: 50%;
    top: 18%;
    z-index: 60;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    width: min(720px, 92vw);
    transform: translateX(-50%);
    pointer-events: none;
  }

  .choice-flash span {
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 224, 144, 0.5);
    background: rgba(13, 16, 20, 0.88);
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 18px rgba(200, 155, 60, 0.18);
    animation: flash-burst 1.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .choice-flash span.up { color: #7ff0b2; }
  .choice-flash span.down { color: #ff9c91; }

  @keyframes flash-burst {
    0% { opacity: 0; transform: translateY(16px) scale(0.72); filter: brightness(1); }
    18% { opacity: 1; transform: translateY(0) scale(1.12); filter: brightness(1.45); }
    72% { opacity: 1; transform: translateY(-10px) scale(1); }
    100% { opacity: 0; transform: translateY(-26px) scale(0.96); }
  }
</style>
