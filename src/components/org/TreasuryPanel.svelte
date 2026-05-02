<script lang="ts">
  import { fade } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { currencyForEra } from '../../game/content/eras';
  import type { RebirthGameState } from '../../game/types';
  import type { BudgetStrategy } from '../../game/org/types';
  import { computeBudget, strategyDescription, strategyLabel } from '../../game/org/treasury';

  interface Props {
    gameState: RebirthGameState;
  }
  let { gameState }: Props = $props();
  const gs = $derived(gameState);

  const budget = $derived(computeBudget(gs.organization, gs.turn));
  const strategies: BudgetStrategy[] = ['epargne', 'equilibre', 'distribution'];
  const currency = $derived(currencyForEra(gs.era));

  /* === Actions ponctuelles de gestion === */
  interface Action {
    id: string;
    label: string;
    blurb: string;
    cost: number;
    /** Nombre de tours avant nouvelle exécution possible. */
    cooldownTurns: number;
    effect: () => void;
    /** Disponibilité indépendante du cooldown (ressources, prérequis). */
    available: () => boolean;
  }

  /** Tours restants avant que l'action `id` redevienne jouable (0 = prête). */
  function remainingCooldown(id: string, cooldown: number): number {
    const last = gs.organization.treasuryActionTurns?.[id];
    if (last === undefined) return 0;
    const elapsed = gs.turn - last;
    return Math.max(0, cooldown - elapsed);
  }

  function runAction(a: Action) {
    a.effect();
    rebirth.recordTreasuryAction(a.id);
  }

  const ACTIONS: Action[] = $derived([
    {
      id: 'campagne-souscription',
      label: 'Lancer une campagne de souscription',
      blurb: `« Donnez vingt ${currency} pour la grève. » Lettres aux fédérations, presse interne. Net +10 sur la caisse.`,
      cost: 4,
      cooldownTurns: 5,
      available: () => gs.organization.treasury >= 4 && gs.organization.mediaRelay >= 1,
      effect: () => {
        rebirth.applyOperation({
          label: 'Campagne de souscription : appel au don.',
          organizationDelta: {
            treasury: 10,
            reputation: 1
          }
        });
      }
    },
    {
      id: 'augmenter-cotisations',
      label: 'Voter une hausse des cotisations',
      blurb: 'La trésorerie respire un peu mieux ; quelques adhérents claquent la porte, la cohésion en souffre.',
      cost: 0,
      cooldownTurns: 4,
      available: () => gs.organization.membership >= 50,
      effect: () => {
        rebirth.applyOperation({
          label: 'Hausse votée des cotisations.',
          organizationDelta: {
            treasury: 6,
            membership: -Math.max(3, Math.round(gs.organization.membership * 0.05)),
            cohesion: -3
          }
        });
      }
    },
    {
      id: 'aide-grevistes',
      label: 'Verser une aide exceptionnelle aux grévistes',
      blurb: 'Bourses militantes, paniers solidaires. La caisse fond mais la base se sent tenue.',
      cost: 12,
      cooldownTurns: 3,
      available: () => gs.organization.treasury >= 12 && gs.organization.militants >= 5,
      effect: () => {
        rebirth.applyOperation({
          label: 'Aide exceptionnelle versée aux grévistes.',
          resourceDelta: { confiance: 5, rapportDeForce: 2 },
          organizationDelta: {
            treasury: -12,
            cohesion: 3,
            mobilisationFatigue: -8
          }
        });
      }
    },
    {
      id: 'audit-comptes',
      label: 'Publier un audit des comptes',
      blurb: 'Cabinet externe, transparence intégrale. La presse note, l’adversaire patientera.',
      cost: 6,
      cooldownTurns: 6,
      available: () => gs.organization.treasury >= 6 && gs.turn >= 22,
      effect: () => {
        rebirth.applyOperation({
          label: 'Audit comptable publié — transparence intégrale.',
          resourceDelta: { legitimite: 5, institution: 3 },
          organizationDelta: {
            treasury: -6,
            reputation: 4
          },
          actorDelta: { opinion: { trust: 3 }, etat: { trust: 2 } }
        });
      }
    }
  ]);

  function setStrategy(s: BudgetStrategy) {
    rebirth.setBudgetStrategy(s);
  }

  function netClass(net: number): 'pos' | 'neg' | 'zero' {
    if (net > 0) return 'pos';
    if (net < 0) return 'neg';
    return 'zero';
  }
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Caisse</div>
    <h3 class="font-display text-gold text-base">Recettes & dépenses, ce tour</h3>
  </div>

  <!-- Stratégie active -->
  <div class="strategy-bar" role="radiogroup" aria-label="Stratégie budgétaire">
    {#each strategies as s}
      <button
        type="button"
        role="radio"
        aria-checked={budget.strategy === s}
        data-active={budget.strategy === s}
        onclick={() => setStrategy(s)}
        title={strategyDescription(s)}
      >{strategyLabel(s)}</button>
    {/each}
  </div>
  <p class="strategy-blurb">{strategyDescription(budget.strategy)}</p>

  <!-- Tableau des flux -->
  <div class="flow-grid">
    <div class="flow-side recettes">
      <div class="flow-head">
        <span>Recettes</span>
        <em>+{budget.totalRecettes}</em>
      </div>
      {#if budget.recettes.length === 0}
        <p class="empty">Aucune recette ce tour.</p>
      {:else}
        <ul>
          {#each budget.recettes as l}
            <li title={l.detail}>
              <span>{l.label}</span>
              <em>+{l.amount}</em>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="flow-side depenses">
      <div class="flow-head">
        <span>Dépenses</span>
        <em>{budget.totalDepenses}</em>
      </div>
      {#if budget.depenses.length === 0}
        <p class="empty">Aucune dépense ce tour.</p>
      {:else}
        <ul>
          {#each budget.depenses as l}
            <li title={l.detail}>
              <span>{l.label}</span>
              <em>{l.amount}</em>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <div class="net-line" data-sign={netClass(budget.net)}>
    <span>Solde du tour</span>
    <em>{budget.net >= 0 ? '+' : ''}{budget.net}</em>
  </div>

  <!-- Actions ponctuelles -->
  <div class="space-y-1.5">
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Actions de gestion</div>
    {#each ACTIONS as a}
      {@const cd = remainingCooldown(a.id, a.cooldownTurns)}
      {@const ok = cd === 0 && a.available()}
      <button
        type="button"
        class="action-btn"
        disabled={!ok}
        onclick={() => runAction(a)}
        in:fade={{ duration: 180 }}
      >
        <span class="lbl">{a.label}</span>
        <em>
          {#if cd > 0}
            relance dans {cd} tour{cd > 1 ? 's' : ''}
          {:else if a.cost > 0}
            {a.cost} {currency}
          {:else}
            gratuit
          {/if}
        </em>
        <small>{a.blurb}</small>
      </button>
    {/each}
  </div>
</section>

<style>
  .strategy-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 0.5rem;
    overflow: hidden;
    background: rgba(13, 16, 20, 0.32);
  }

  .strategy-bar button {
    border: 0;
    background: transparent;
    color: rgba(237, 228, 201, 0.7);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0.55rem 0.4rem;
    min-height: 44px;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
  }

  .strategy-bar button + button {
    border-left: 1px solid rgba(237, 228, 201, 0.07);
  }

  .strategy-bar button:hover {
    color: #ede4c9;
    background: rgba(201, 154, 64, 0.05);
  }

  .strategy-bar button[data-active='true'] {
    color: #f4d58b;
    background: rgba(201, 154, 64, 0.13);
    box-shadow: inset 0 -2px 0 0 #c89b3c;
  }

  .strategy-blurb {
    color: rgba(237, 228, 201, 0.78);
    font-size: 0.78rem;
    line-height: 1.35;
    font-style: italic;
    margin: 0;
  }

  .flow-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .flow-side {
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.5rem;
    padding: 0.6rem 0.55rem;
    background: rgba(13, 16, 20, 0.32);
  }

  .flow-side.recettes {
    border-color: rgba(95, 181, 107, 0.32);
    background: rgba(95, 181, 107, 0.05);
  }

  .flow-side.depenses {
    border-color: rgba(224, 122, 110, 0.3);
    background: rgba(224, 122, 110, 0.04);
  }

  .flow-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
    color: rgba(237, 228, 201, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .flow-head em {
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.95rem;
  }

  .flow-side.recettes .flow-head em {
    color: #aedab5;
  }

  .flow-side.depenses .flow-head em {
    color: #e8a09b;
  }

  .flow-side ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.32rem;
  }

  .flow-side li {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.4rem;
    color: rgba(237, 228, 201, 0.85);
    font-size: 0.78rem;
    line-height: 1.3;
  }

  .flow-side li em {
    color: rgba(237, 228, 201, 0.85);
    font-style: normal;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
  }

  .flow-side.recettes li em {
    color: #aedab5;
  }

  .flow-side.depenses li em {
    color: #e8a09b;
  }

  .empty {
    color: rgba(237, 228, 201, 0.45);
    font-size: 0.74rem;
    font-style: italic;
    margin: 0;
  }

  .net-line {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    border: 1px solid rgba(244, 213, 139, 0.4);
    border-radius: 0.5rem;
    background: rgba(201, 154, 64, 0.08);
    padding: 0.7rem 0.85rem;
  }

  .net-line[data-sign='pos'] {
    border-color: rgba(95, 181, 107, 0.55);
    background: rgba(95, 181, 107, 0.08);
  }

  .net-line[data-sign='neg'] {
    border-color: rgba(224, 122, 110, 0.55);
    background: rgba(224, 122, 110, 0.06);
  }

  .net-line span {
    color: rgba(237, 228, 201, 0.9);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .net-line em {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 1.4rem;
  }

  .net-line[data-sign='pos'] em {
    color: #aedab5;
  }

  .net-line[data-sign='neg'] em {
    color: #e8a09b;
  }

  .action-btn {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.3rem 0.6rem;
    width: 100%;
    border: 1px solid rgba(237, 228, 201, 0.16);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.6rem 0.7rem;
    text-align: left;
    color: rgba(237, 228, 201, 0.92);
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .action-btn:hover:not(:disabled) {
    border-color: rgba(244, 213, 139, 0.55);
    background: rgba(201, 154, 64, 0.07);
  }

  .action-btn:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  .action-btn .lbl {
    grid-column: 1;
    color: #ede4c9;
    font-size: 0.84rem;
    line-height: 1.3;
  }

  .action-btn em {
    grid-column: 2;
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.74rem;
    letter-spacing: 0.04em;
  }

  .action-btn small {
    grid-column: 1 / span 2;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.74rem;
    line-height: 1.35;
    font-style: italic;
  }
</style>
