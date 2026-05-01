<script lang="ts">
  /* ============================================================
     Sidebar.svelte v2 — avatar, lingots, ressources, capitaux,
     compteur de tirages, tensions, rival
     ============================================================ */
  import { fade } from 'svelte/transition';
  import { game } from '$lib/stores/game.svelte';
  import { audio } from '$lib/audio/audio';
  import { PROFILS } from '$lib/data/profils';
  import type { SkillKey } from '$lib/types';
  import Gauge from './Gauge.svelte';
  import SkillIngot from './SkillIngot.svelte';
  import RollCounter from './RollCounter.svelte';

  /* Métadonnées des compétences pour les lingots */
  const SKILL_META: Array<{ key: SkillKey; ico: string; lbl: string }> = [
    { key: 'negociation', ico: '⚖️', lbl: 'Négociation' },
    { key: 'politique', ico: '♟️', lbl: 'Politique' },
    { key: 'baratin', ico: '🗣️', lbl: 'Baratin' },
    { key: 'production', ico: '📈', lbl: 'Production' },
    { key: 'mobilisation', ico: '✊', lbl: 'Mobilisation' },
    { key: 'expertise', ico: '📚', lbl: 'Expertise' }
  ];

  const RES_META: Record<string, { ico: string; lbl: string; target: [number, number] }> = {
    prestige: { ico: '🏆', lbl: 'Prestige', target: [35, 75] },
    caisse: { ico: '💰', lbl: 'Caisse', target: [30, 70] },
    soutien: { ico: '❤️', lbl: 'Soutien', target: [40, 75] },
    influence: { ico: '🏛️', lbl: 'Influence', target: [30, 75] },
    sante: { ico: '💪', lbl: 'Santé', target: [40, 90] }
  };
  const CAP_META: Record<string, { ico: string; lbl: string; target: [number, number] }> = {
    economique: { ico: '💼', lbl: 'Économique', target: [40, 75] },
    social: { ico: '🤝', lbl: 'Social', target: [40, 75] },
    militant: { ico: '🚩', lbl: 'Militant', target: [35, 75] },
    institutionnel: { ico: '⚙️', lbl: 'Institutionnel', target: [35, 80] },
    symbolique: { ico: '📜', lbl: 'Symbolique', target: [35, 75] }
  };

  let initial = $derived(game.state.name.trim().charAt(0).toUpperCase() || '?');
  let profil = $derived(game.state.profil ? PROFILS[game.state.profil] : null);
  let musicOn = $state(false);

  function toggleMusic() {
    musicOn = !musicOn;
    audio.setMusicEnabled(musicOn);
    if (musicOn) audio.setMusicVolume(0.08);
  }
</script>

<aside class="mobile-dash lg:hidden">
  <div class="mobile-head">
    <div class="mobile-avatar {game.state.camp === 'salarie' ? 'salarie' : 'patron'}">{initial}</div>
    <div class="mobile-id">
      <div class="mobile-name">{game.state.name || 'Joueur'}</div>
      <div class="mobile-era">{game.state.camp === 'patron' ? 'Patronat' : 'Salariat'} · T{game.state.turn}</div>
    </div>
    <div class="mobile-score">
      <span>{game.scoreDialectic}</span>
      <small>/100</small>
    </div>
  </div>

  <div class="mobile-sections">
    <section class="mobile-section">
      <div class="mobile-section-title">Compétences</div>
      <div class="mobile-grid skills">
      {#each SKILL_META as m}
        {@const value = game.state.skills[m.key]}
        <div class="mini-stat">
          <div class="mini-top"><span>{m.ico}</span><b>{Math.round(value)}</b></div>
          <div class="mini-label">{m.lbl}</div>
          <div class="mini-bar"><i style="width: {Math.max(2, Math.min(100, value))}%"></i></div>
        </div>
      {/each}
      </div>
    </section>

    <section class="mobile-section">
      <div class="mobile-section-title">Ressources</div>
      <div class="mobile-grid resources">
      {#each Object.entries(game.state.resources) as [k, v]}
        <div class="mini-stat">
          <div class="mini-top"><span>{RES_META[k]?.ico}</span><b>{Math.round(v)}</b></div>
          <div class="mini-label">{RES_META[k]?.lbl ?? k}</div>
          <div class="mini-bar resource"><i style="width: {Math.max(2, Math.min(100, v))}%"></i></div>
        </div>
      {/each}
      </div>
    </section>

    <details class="mobile-capitals">
      <summary>Capitaux et acquis</summary>
      <div class="mobile-grid capitals">
      {#each Object.entries(game.state.capitaux) as [k, v]}
        <div class="mini-stat">
          <div class="mini-top"><span>{CAP_META[k]?.ico}</span><b>{Math.round(v)}</b></div>
          <div class="mini-label">{CAP_META[k]?.lbl ?? k}</div>
          <div class="mini-bar capital"><i style="width: {Math.max(2, Math.min(100, v))}%"></i></div>
        </div>
      {/each}
      </div>
    </details>
  </div>

  {#if game.state.activeTensions.length > 0}
    <div class="mobile-alert">{game.state.activeTensions.slice(0, 2).join(' · ')}</div>
  {/if}
</aside>

<aside class="hidden lg:block bordered-card p-4 space-y-4 sticky top-4 self-start">
  <!-- Identité -->
  <div class="flex items-center gap-3">
    <div class="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-xl text-white shadow-lg ring-2 ring-gold
                {game.state.camp === 'salarie' ? 'bg-gradient-to-br from-syndical-deep to-syndical' : 'bg-gradient-to-br from-patronal-deep to-patronal'}">
      {initial}
    </div>
    <div class="leading-tight">
      <div class="font-bold text-parchment">{game.state.name || 'Joueur'}</div>
      <div class="text-xs text-parchment-dim/70 italic">
        {game.state.camp === 'patron' ? 'Côté patronal' : 'Côté salarié'}
      </div>
    </div>
  </div>

  <!-- Instruction claire -->
  <div class="rounded-md bg-amber-500/5 border border-amber-500/30 px-3 py-2 text-xs text-parchment-dim/85 leading-relaxed">
    <span class="text-gold font-display tracking-wider text-[0.65rem] uppercase">Comment jouer</span><br>
    Lis l'événement, choisis une action. Les <b class="text-gold">lingots</b> sont tes savoir-faire : négocier, mobiliser, produire, convaincre, gouverner, expertiser.
    <button type="button" class="audio-toggle" onclick={toggleMusic}>
      {musicOn ? 'Couper la musique' : 'Activer une ambiance discrète'}
    </button>
  </div>

  {#if profil}
    <div class="px-3 py-2 rounded-md bg-gradient-to-r from-gold/15 via-gold/5 to-transparent border border-gold/30 text-xs"
         in:fade>
      <span class="text-base mr-1">{profil.ico}</span>
      <b class="font-display text-gold tracking-wider">{profil.nom}</b>
      <div class="mt-1 text-parchment-dim/80 italic leading-snug">{profil.desc}</div>
    </div>
  {/if}

  <!-- Compétences en lingots -->
  <section>
    <h4 class="text-xs uppercase tracking-widest text-gold font-display mb-2 flex items-center justify-between">
      <span>Compétences</span>
      <span class="text-[0.6rem] text-parchment-dim/50 normal-case tracking-normal italic">clique pour citation</span>
    </h4>
    <div class="space-y-1.5">
      {#each SKILL_META as m}
        <SkillIngot skill={m.key} icon={m.ico} label={m.lbl} />
      {/each}
    </div>
  </section>

  <!-- Compteur de tirages -->
  <RollCounter />

  <!-- Ressources -->
  <section>
    <h4 class="text-xs uppercase tracking-widest text-gold font-display mb-1">Ressources</h4>
    {#each Object.entries(game.state.resources) as [k, v]}
      <Gauge statKey={k as any} value={v} label={RES_META[k]?.lbl ?? k} icon={RES_META[k]?.ico} target={RES_META[k]?.target} />
    {/each}
  </section>

  <!-- Capitaux -->
  <section>
    <h4 class="text-xs uppercase tracking-widest text-gold font-display mb-1">
      Capitaux <span class="text-parchment-dim/60 normal-case tracking-normal">— structures longues</span>
    </h4>
    {#each Object.entries(game.state.capitaux) as [k, v]}
      <Gauge statKey={k as any} value={v} label={CAP_META[k]?.lbl ?? k} icon={CAP_META[k]?.ico} target={CAP_META[k]?.target} />
    {/each}
  </section>

  <!-- Tensions -->
  {#if game.state.activeTensions.length > 0}
    <div class="rounded-md border border-purple/40 bg-purple/5 p-3 text-xs"
         in:fade={{ duration: 250 }}>
      <div class="font-display uppercase tracking-wider text-purple text-[0.65rem] mb-1.5">⚠ Alertes systémiques</div>
      <ul class="space-y-0.5 text-parchment-dim">
        {#each game.state.activeTensions as t}
          <li>• {t}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Rival -->
  {#if game.state.rival.name}
    <div class="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-xs">
      <div class="font-display uppercase tracking-wider text-rose-300 text-[0.65rem] mb-1.5">Rival</div>
      <div class="font-bold text-parchment">{game.state.rival.name}</div>
      <div class="h-1 bg-ink rounded-full mt-1 overflow-hidden">
        <div class="h-full bg-rose-400 transition-all duration-500"
             style="width: {game.state.rival.score}%"></div>
      </div>
      <div class="mt-1 text-parchment-dim/70 tabular-nums">
        Lui : <b class="text-rose-300">{Math.round(game.state.rival.score)}</b>
        · Toi : <b class="text-gold">{game.scoreClassic}</b>
        · Dialectique : <b class="text-emerald-400">{game.scoreDialectic}/100</b>
      </div>
    </div>
  {/if}
</aside>

<style>
  .mobile-dash {
    border: 1px solid rgba(42, 52, 65, 0.95);
    border-radius: 0.75rem;
    background: linear-gradient(180deg, rgba(26, 31, 38, 0.96), rgba(16, 20, 26, 0.96));
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    padding: 0.75rem;
  }

  .mobile-head {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    align-items: center;
    gap: 0.65rem;
  }

  .mobile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: white;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 800;
    border: 1px solid rgba(255, 224, 144, 0.55);
  }

  .mobile-avatar.salarie {
    background: linear-gradient(135deg, #7f1d1d, #dc2626);
  }

  .mobile-avatar.patron {
    background: linear-gradient(135deg, #1e3a8a, #2563eb);
  }

  .mobile-id {
    min-width: 0;
    line-height: 1.15;
  }

  .mobile-name {
    color: #ede4c9;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-era {
    margin-top: 0.18rem;
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.72rem;
    font-style: italic;
  }

  .mobile-score {
    min-width: 62px;
    text-align: right;
    color: #7ff0b2;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 800;
  }

  .audio-toggle {
    display: block;
    margin-top: 0.45rem;
    color: #f7c95c;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .mobile-score span {
    font-size: 1.75rem;
    line-height: 1;
  }

  .mobile-score small {
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.72rem;
    margin-left: 1px;
  }

  .mobile-sections {
    display: grid;
    gap: 0.7rem;
    margin-top: 0.7rem;
  }

  .mobile-section-title,
  .mobile-capitals summary {
    color: #ffd36d;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    line-height: 1;
    text-transform: uppercase;
  }

  .mobile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
    margin-top: 0.45rem;
  }

  .mobile-grid.skills {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .mobile-grid.resources {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .mobile-grid.capitals {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .mobile-capitals {
    border-top: 1px solid rgba(237, 228, 201, 0.08);
    padding-top: 0.65rem;
  }

  .mobile-capitals summary {
    cursor: pointer;
    list-style-position: outside;
    margin-left: 1rem;
  }

  .mini-stat {
    min-width: 0;
    border: 1px solid rgba(237, 228, 201, 0.09);
    border-radius: 0.55rem;
    background: rgba(13, 16, 20, 0.62);
    padding: 0.45rem 0.5rem;
  }

  .mini-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.35rem;
  }

  .mini-top span {
    font-size: 0.96rem;
    line-height: 1;
  }

  .mini-top b {
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .mini-label {
    margin-top: 0.2rem;
    color: rgba(237, 228, 201, 0.58);
    font-size: 0.66rem;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-bar {
    height: 4px;
    margin-top: 0.4rem;
    border-radius: 999px;
    background: rgba(7, 9, 13, 0.85);
    overflow: hidden;
  }

  .mini-bar i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #c89b3c, #ffd36d);
  }

  .mini-bar.resource i {
    background: linear-gradient(90deg, #5fb56b, #a7f3d0);
  }

  .mini-bar.capital i {
    background: linear-gradient(90deg, #8b5cf6, #c4b5fd);
  }

  .mobile-alert {
    margin-top: 0.55rem;
    border-radius: 0.45rem;
    border: 1px solid rgba(167, 139, 250, 0.28);
    background: rgba(109, 40, 217, 0.12);
    color: rgba(237, 228, 201, 0.76);
    padding: 0.4rem 0.55rem;
    font-size: 0.68rem;
    line-height: 1.25;
  }

  @media (max-width: 380px) {
    .mobile-grid.skills {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .mobile-grid.resources,
    .mobile-grid.capitals {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
