<script lang="ts">
  import { fade } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { currencyForEra } from '../../game/content/eras';
  import type { ActorId, RebirthGameState, Resources } from '../../game/types';
  import type { OrganizationDelta, TalentGroup } from '../../game/org/types';
  import { GROUP_BLURBS, GROUP_LABELS, talentsForCamp } from '../../game/org/talents';

  interface Props {
    gameState: RebirthGameState;
  }
  let { gameState }: Props = $props();
  const gs = $derived(gameState);

  type SubView = 'formation' | 'recruter' | 'groupes';
  let view = $state<SubView>('formation');

  /* === Cursus de formation (inchangé) === */
  interface Cursus {
    id: string;
    label: string;
    description: string;
    cost: number;
    duree: '1 semaine' | '2 semaines' | '4 semaines';
    resourceDelta: Partial<Resources>;
    organizationDelta?: OrganizationDelta;
    actorDelta?: Partial<Record<ActorId, { trust?: number; pressure?: number; patience?: number }>>;
  }

  const CURSUS: Cursus[] = [
    {
      id: 'droit-travail',
      label: 'Droit du travail',
      description: 'Code du travail, jurisprudence, prud’hommes. Forme tes juristes.',
      cost: 9,
      duree: '4 semaines',
      resourceDelta: { legitimite: 4, institution: 3 },
      organizationDelta: { legalTeam: 1 }
    },
    {
      id: 'economie-sociale',
      label: 'Économie sociale',
      description: 'Comptes des caisses, retraites, démographie. Pour décrypter les notes IGAS.',
      cost: 10,
      duree: '2 semaines',
      resourceDelta: { institution: 6, caisse: 2 },
      organizationDelta: { reputation: 2 }
    },
    {
      id: 'mobilisation',
      label: 'Méthodes de mobilisation',
      description: 'Service d’ordre, tractage, organisation de cortège, gestion de crise.',
      cost: 7,
      duree: '1 semaine',
      resourceDelta: { rapportDeForce: 5, confiance: 3 },
      organizationDelta: { militants: 4, cohesion: 2 }
    },
    {
      id: 'communication',
      label: 'Communication & médias',
      description: 'Travailler la posture caméra, le pitch presse, les réseaux sociaux.',
      cost: 8,
      duree: '2 semaines',
      resourceDelta: { legitimite: 5, confiance: 2 },
      organizationDelta: { mediaRelay: 1 },
      actorDelta: { opinion: { trust: 3 } }
    },
    {
      id: 'negociation',
      label: 'Négociation collective',
      description: 'Méthodes Harvard, BATNA, ANI : transformer la table en levier.',
      cost: 11,
      duree: '4 semaines',
      resourceDelta: { institution: 6, legitimite: 3, confiance: 2 },
      actorDelta: { adversaire: { trust: 2 } }
    }
  ];

  const catalog = $derived(talentsForCamp(gs.camp));
  const engaged = $derived(gs.organization.engagedTalents);
  const engagedIds = $derived(new Set(engaged.map(e => e.catalogId)));
  const currency = $derived(currencyForEra(gs.era));

  const groups: TalentGroup[] = ['reflexion', 'action', 'communication'];

  function inGroup(group: TalentGroup) {
    return engaged.filter(e => e.group === group);
  }
  const reserve = $derived(engaged.filter(e => e.group === null));

  function takeCursus(c: Cursus) {
    if (gs.organization.treasury < c.cost) return;
    rebirth.applyOperation({
      label: `Formation : ${c.label} (${c.duree}, ${c.cost} ${currency}).`,
      resourceDelta: { ...c.resourceDelta, caisse: -c.cost },
      organizationDelta: c.organizationDelta,
      actorDelta: c.actorDelta
    });
  }
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Capital humain</div>
    <h3 class="font-display text-gold text-base">Former, recruter, structurer</h3>
  </div>

  <!-- Sous-onglet Formation / Recruter / Groupes -->
  <div class="toggle-bar" role="tablist">
    <button type="button" data-active={view === 'formation'} onclick={() => (view = 'formation')}>Formation</button>
    <button type="button" data-active={view === 'recruter'} onclick={() => (view = 'recruter')}>Recruter</button>
    <button type="button" data-active={view === 'groupes'} onclick={() => (view = 'groupes')}>
      Groupes <em>{engaged.length > 0 ? `· ${engaged.length}` : ''}</em>
    </button>
  </div>

  {#if view === 'formation'}
    <div class="space-y-1.5" in:fade={{ duration: 180 }}>
      {#each CURSUS as c}
        {@const disabled = gs.organization.treasury < c.cost}
        <button type="button" class="card-btn" disabled={disabled} onclick={() => takeCursus(c)}>
          <div class="flex items-baseline justify-between gap-2">
            <b>{c.label}</b>
            <em>{c.cost} {currency} · {c.duree}</em>
          </div>
          <small>{c.description}</small>
        </button>
      {/each}
    </div>
  {:else if view === 'recruter'}
    <div class="space-y-1.5" in:fade={{ duration: 180 }}>
      {#each catalog as t}
        {@const already = engagedIds.has(t.id)}
        {@const disabled = already || gs.organization.treasury < t.cost}
        <button type="button" class="card-btn" disabled={disabled}
                onclick={() => rebirth.engageTalent(t.id)}>
          <div class="flex items-baseline justify-between gap-2">
            <b>{t.nom}</b>
            <em>{already ? 'engagé·e' : `${t.cost} ${currency}`}</em>
          </div>
          <span class="spec">{t.specialite}</span>
          <small>{t.blurb}</small>
        </button>
      {/each}
    </div>
  {:else}
    <div class="space-y-3" in:fade={{ duration: 180 }}>
      {#if engaged.length === 0}
        <div class="text-xs italic text-parchment-dim/85">
          Pas encore de talent engagé. Va dans l’onglet « Recruter » pour constituer ton équipe.
        </div>
      {:else}
        {#each groups as g}
          {@const members = inGroup(g)}
          <div class="group-box">
            <div class="group-head">
              <h4>{GROUP_LABELS[g]}</h4>
              <span>{members.length}</span>
            </div>
            <p class="group-blurb">{GROUP_BLURBS[g]}</p>
            {#if members.length === 0}
              <p class="group-empty">Aucun talent affecté.</p>
            {:else}
              <ul class="member-list">
                {#each members as m (m.catalogId)}
                  <li>
                    <div class="member-id">
                      <b>{m.nom}</b>
                      <span>{m.specialite}</span>
                    </div>
                    <button type="button" class="member-act"
                            onclick={() => rebirth.assignTalent(m.catalogId, null)}>
                      → Réserve
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/each}

        {#if reserve.length > 0}
          <div class="group-box reserve">
            <div class="group-head">
              <h4>Réserve</h4>
              <span>{reserve.length}</span>
            </div>
            <p class="group-blurb">Talents non affectés. Choisis un groupe pour activer leur bonus de tour.</p>
            <ul class="member-list">
              {#each reserve as m (m.catalogId)}
                <li>
                  <div class="member-id">
                    <b>{m.nom}</b>
                    <span>{m.specialite}</span>
                  </div>
                  <div class="member-actions">
                    {#each groups as g}
                      <button type="button" class="member-act"
                              onclick={() => rebirth.assignTalent(m.catalogId, g)}
                              title={GROUP_BLURBS[g]}>
                        → {GROUP_LABELS[g]}
                      </button>
                    {/each}
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</section>

<style>
  .toggle-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.45rem;
    overflow: hidden;
    background: rgba(13, 16, 20, 0.32);
  }

  .toggle-bar button {
    border: 0;
    background: transparent;
    color: rgba(237, 228, 201, 0.65);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.5rem 0.45rem;
    min-height: 38px;
    transition: background 0.18s ease, color 0.18s ease;
  }

  .toggle-bar button em {
    color: #f4d58b;
    font-style: normal;
    font-size: 0.72rem;
  }

  .toggle-bar button:hover {
    color: #ede4c9;
    background: rgba(201, 154, 64, 0.05);
  }

  .toggle-bar button[data-active='true'] {
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.13);
    box-shadow: inset 0 -2px 0 0 #c89b3c;
  }

  .toggle-bar button + button {
    border-left: 1px solid rgba(237, 228, 201, 0.07);
  }

  .card-btn {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.22rem;
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 0.55rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.6rem 0.7rem;
    color: rgba(237, 228, 201, 0.92);
    text-align: left;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }

  .card-btn:hover:not(:disabled) {
    border-color: rgba(244, 213, 139, 0.55);
    background: rgba(201, 154, 64, 0.08);
    transform: translateY(-1px);
  }

  .card-btn:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  .card-btn b {
    color: #ede4c9;
    font-size: 0.84rem;
  }

  .card-btn em {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
  }

  .card-btn .spec {
    color: rgba(244, 213, 139, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .card-btn small {
    color: rgba(237, 228, 201, 0.75);
    font-size: 0.74rem;
    line-height: 1.35;
    font-family: 'Source Serif 4', Georgia, serif;
    font-style: italic;
  }

  .group-box {
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.55rem;
    background: rgba(13, 16, 20, 0.3);
    padding: 0.65rem 0.75rem;
  }

  .group-box.reserve {
    border-color: rgba(244, 213, 139, 0.3);
    background: rgba(201, 154, 64, 0.06);
  }

  .group-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .group-head h4 {
    margin: 0;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .group-head span {
    color: rgba(237, 228, 201, 0.6);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
  }

  .group-blurb {
    margin: 0.25rem 0 0.5rem;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.78rem;
    font-style: italic;
    line-height: 1.35;
  }

  .group-empty {
    color: rgba(237, 228, 201, 0.45);
    font-size: 0.78rem;
    font-style: italic;
  }

  .member-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .member-list li {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.4rem;
    border: 1px solid rgba(237, 228, 201, 0.08);
    border-radius: 0.4rem;
    background: rgba(13, 16, 20, 0.4);
    padding: 0.45rem 0.55rem;
  }

  .member-id b {
    display: block;
    color: #ede4c9;
    font-size: 0.78rem;
  }

  .member-id span {
    color: rgba(237, 228, 201, 0.65);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .member-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .member-act {
    border: 1px solid rgba(244, 213, 139, 0.3);
    border-radius: 0.35rem;
    background: rgba(201, 154, 64, 0.05);
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .member-act:hover {
    border-color: rgba(244, 213, 139, 0.65);
    background: rgba(201, 154, 64, 0.13);
  }
</style>
