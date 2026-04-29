<script lang="ts">
  /* ============================================================
     Sidebar.svelte v2 — avatar, lingots, ressources, capitaux,
     compteur de tirages, tensions, rival
     ============================================================ */
  import { fade } from 'svelte/transition';
  import { game } from '$lib/stores/game.svelte';
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
</script>

<aside class="bordered-card p-4 space-y-4 sticky top-4 self-start">
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
    Lis l'événement, choisis une option. En mode <b class="text-gold">Tirage</b>, la slot sort le brut, puis <b>tes lingots de compétence</b> renforcent le résultat.
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
  {#if game.state.rollStats.total > 0}
    <RollCounter />
  {/if}

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
