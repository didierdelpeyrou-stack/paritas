<script lang="ts">
  import { rebirth } from '../../game/engine/gameState.svelte';
  import { availableOrgActions, availableOrgAssets, assetById } from '../../game/org/catalog';
  import {
    canDevelopOrganization,
    expectedDuesIncome,
    expectedStaffCost,
    organizationUnlockLabel
  } from '../../game/org/organization';
  import type { ElectionCampaignMove } from '../../game/org/internalElections';
  import type { PlayerOrganization } from '../../game/org/types';

  interface Props {
    organization: PlayerOrganization;
    turn: number;
  }

  let { organization, turn }: Props = $props();

  const dues = $derived(expectedDuesIncome(organization));
  const staff = $derived(expectedStaffCost(organization));
  const upkeep = $derived(
    organization.assets
      .map(id => assetById(id)?.upkeep ?? 0)
      .reduce((sum, value) => sum + value, 0)
  );
  const net = $derived(dues - staff - upkeep);

  const unlocked = $derived(canDevelopOrganization(turn, organization.camp));
  const actions = $derived(availableOrgActions(turn, organization.camp).slice(0, 4));
  const assets = $derived(availableOrgAssets(turn, organization.camp, organization.assets).slice(0, 3));
  const ownedAssets = $derived(
    organization.assets
      .map(id => assetById(id))
      .filter(asset => !!asset)
  );

  function money(value: number): string {
    return `${Math.round(value)} caisse`;
  }

  const campaignMoves: Array<{ id: ElectionCampaignMove; label: string }> = [
    { id: 'rassembler', label: 'Rassembler' },
    { id: 'promettre_rupture', label: 'Promettre rupture' },
    { id: 'professionnaliser', label: 'Professionnaliser' },
    { id: 'terrain', label: 'Tournée terrain' }
  ];
</script>

<section class="bordered-card p-4 space-y-3">
  <div class="flex items-start justify-between gap-2">
    <div>
      <div class="text-xs uppercase tracking-wider text-parchment-dim/60">
        {organization.camp === 'salarie' ? 'Développer ton syndicat' : 'Développer ton organisation'}
      </div>
      <h3 class="font-display text-amber-400 text-base leading-tight">{organization.name}</h3>
    </div>
    <div class="text-right">
      <div class="font-display text-amber-300 text-lg leading-none">{Math.round(organization.treasury)}</div>
      <div class="text-[0.65rem] text-parchment-dim/60 uppercase">caisse</div>
      <div
        class="text-[0.62rem] mt-0.5"
        class:text-emerald-300={net > 0}
        class:text-rose-300={net < 0}
        class:text-parchment-dim={net === 0}
        title={`Cotisations +${dues} · Permanents −${staff} · Actifs −${upkeep}`}
      >
        {net >= 0 ? `+${net}` : net}/tour
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-2 text-xs">
    <div class="org-chip"><b>{organization.membership}</b><span>{organization.camp === 'salarie' ? 'adhérents' : 'membres'}</span></div>
    <div class="org-chip"><b>{organization.militants}</b><span>{organization.camp === 'salarie' ? 'militants' : 'relais'}</span></div>
    <div class="org-chip"><b>{organization.localSections}</b><span>sections</span></div>
    <div class="org-chip"><b>{organization.legalTeam}</b><span>juristes</span></div>
    <div class="org-chip"><b>{organization.cohesion}</b><span>cohésion</span></div>
    <div class="org-chip"><b>{organization.reputation}</b><span>réputation</span></div>
  </div>

  <div class="fatigue-bar" data-burnout={organization.mobilisationFatigue >= 70}>
    <div class="fatigue-label">
      <span>Fatigue militante</span>
      <em>{Math.round(organization.mobilisationFatigue)}</em>
    </div>
    <div class="fatigue-track">
      <i style="width: {Math.max(2, Math.min(100, organization.mobilisationFatigue))}%"></i>
    </div>
    {#if organization.mobilisationFatigue >= 70}
      <div class="fatigue-warn">Désengagement en cours · militants se retirent.</div>
    {/if}
  </div>

  <details class="space-y-2">
    <summary class="cursor-pointer text-xs uppercase tracking-wider text-parchment-dim/70">
      Factions internes
    </summary>
    <div class="space-y-2 pt-2">
      {#each organization.factions as faction}
        <div class="faction-row">
          <div>
            <b>{faction.label}</b>
            <small>{faction.demand}</small>
          </div>
          <div class="faction-score">
            <span>{Math.round(faction.influence)}%</span>
            <em>{Math.round(faction.loyalty)} loy.</em>
          </div>
        </div>
      {/each}
    </div>
  </details>

  {#if !unlocked}
    <div class="rounded-md border border-line/70 bg-ink/35 px-3 py-2 text-xs text-parchment-dim/75 leading-snug">
      {organizationUnlockLabel(organization.camp)}
    </div>
  {:else}
    <details open={!!organization.election?.active} class="space-y-2">
      <summary class="cursor-pointer text-xs uppercase tracking-wider text-parchment-dim/70">
        Élection interne
      </summary>
      <div class="pt-2 space-y-2">
        {#if organization.election?.active}
          <div class="election-box">
            <b>{organization.election.issue}</b>
            <small>
              Reste {organization.election.roundsLeft} tour{organization.election.roundsLeft > 1 ? 's' : ''} ·
              toi {Math.round(organization.election.playerMomentum)} /
              opposition {Math.round(organization.election.oppositionMomentum)}
            </small>
            <div class="grid grid-cols-2 gap-1.5 mt-2">
              {#each campaignMoves as move}
                <button type="button" class="mini-action" onclick={() => rebirth.campaignInternalElection(move.id)}>
                  {move.label}
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <button type="button" class="org-button" onclick={() => rebirth.startInternalElection()}>
            <span>
              <b>Demander un mandat clair</b>
              <small>Ouvre une élection interne avant qu’une crise ne l’impose.</small>
            </span>
            <em>politique</em>
          </button>
        {/if}
      </div>
    </details>

    <details open class="space-y-2">
      <summary class="cursor-pointer text-xs uppercase tracking-wider text-parchment-dim/70">
        Actions d’organisation
      </summary>
      <div class="space-y-2 pt-2">
        {#each actions as action}
          {@const disabled = organization.treasury < action.cost}
          <button
            type="button"
            class="org-button"
            disabled={disabled}
            onclick={() => rebirth.performOrgAction(action.id)}
            title={action.description}
          >
            <span>
              <b>{action.label}</b>
              <small>{action.description}</small>
            </span>
            <em>{money(action.cost)}</em>
          </button>
        {/each}
      </div>
    </details>

    <details class="space-y-2">
      <summary class="cursor-pointer text-xs uppercase tracking-wider text-parchment-dim/70">
        Acheter / vendre
      </summary>
      <div class="space-y-2 pt-2">
        {#if assets.length === 0 && ownedAssets.length === 0}
          <div class="text-xs italic text-parchment-dim/60">Aucun actif disponible pour l’instant.</div>
        {/if}

        {#each assets as asset}
          {@const disabled = organization.treasury < asset.purchaseCost}
          <button
            type="button"
            class="org-button buy"
            disabled={disabled}
            onclick={() => rebirth.buyAsset(asset.id)}
            title={asset.description}
          >
            <span>
              <b>{asset.label}</b>
              <small>{asset.description}</small>
            </span>
            <em>{money(asset.purchaseCost)}</em>
          </button>
        {/each}

        {#each ownedAssets as asset}
          <button
            type="button"
            class="org-button sell"
            onclick={() => rebirth.sellAsset(asset.id)}
            title={`Entretien : ${asset.upkeep} par tour`}
          >
            <span>
              <b>Vendre : {asset.label}</b>
              <small>Entretien {asset.upkeep}/tour · valeur {asset.resaleValue}</small>
            </span>
            <em>+{asset.resaleValue}</em>
          </button>
        {/each}
      </div>
    </details>
  {/if}

  {#if organization.actionHistory.length > 0}
    <details class="text-xs">
      <summary class="cursor-pointer uppercase tracking-wider text-parchment-dim/60">Historique interne</summary>
      <ul class="mt-2 space-y-1 text-parchment-dim/75">
        {#each organization.actionHistory.slice(0, 4) as item}
          <li>{item}</li>
        {/each}
      </ul>
    </details>
  {/if}
</section>

<style>
  .org-chip {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.05rem;
    border: 1px solid rgba(237, 228, 201, 0.1);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.26);
    padding: 0.45rem 0.5rem;
  }

  .org-chip b {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    line-height: 1;
  }

  .org-chip span {
    overflow: hidden;
    color: rgba(237, 228, 201, 0.62);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .org-button {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr auto;
    gap: 0.65rem;
    align-items: center;
    border: 1px solid rgba(201, 154, 64, 0.25);
    border-radius: 0.55rem;
    background: rgba(201, 154, 64, 0.06);
    padding: 0.55rem 0.65rem;
    color: #ede4c9;
    text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
  }

  .org-button:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(244, 213, 139, 0.55);
    background: rgba(201, 154, 64, 0.11);
  }

  .org-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .org-button b,
  .org-button em {
    display: block;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .org-button small {
    display: block;
    margin-top: 0.16rem;
    color: rgba(237, 228, 201, 0.62);
    font-size: 0.68rem;
    line-height: 1.25;
  }

  .org-button em {
    color: #f4d58b;
    font-style: normal;
    white-space: nowrap;
  }

  .org-button.buy {
    border-color: rgba(95, 181, 107, 0.25);
  }

  .org-button.sell {
    border-color: rgba(224, 122, 110, 0.25);
    background: rgba(224, 122, 110, 0.05);
  }

  .faction-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem;
    align-items: center;
    border: 1px solid rgba(237, 228, 201, 0.1);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.22);
    padding: 0.5rem 0.55rem;
  }

  .faction-row b,
  .election-box b {
    display: block;
    color: #ede4c9;
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .faction-row small,
  .election-box small {
    display: block;
    margin-top: 0.14rem;
    color: rgba(237, 228, 201, 0.6);
    font-size: 0.66rem;
    line-height: 1.25;
  }

  .faction-score {
    text-align: right;
    white-space: nowrap;
  }

  .faction-score span,
  .faction-score em {
    display: block;
    font-size: 0.66rem;
    font-style: normal;
  }

  .faction-score span {
    color: #f4d58b;
  }

  .faction-score em {
    color: rgba(237, 228, 201, 0.55);
  }

  .election-box {
    border: 1px solid rgba(126, 180, 255, 0.24);
    border-radius: 0.6rem;
    background: rgba(46, 94, 138, 0.1);
    padding: 0.6rem;
  }

  .mini-action {
    border: 1px solid rgba(126, 180, 255, 0.24);
    border-radius: 0.45rem;
    background: rgba(13, 16, 20, 0.3);
    color: #b8d6ff;
    padding: 0.35rem 0.4rem;
    font-size: 0.66rem;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .mini-action:hover {
    border-color: rgba(126, 180, 255, 0.55);
    background: rgba(46, 94, 138, 0.18);
  }

  .fatigue-bar {
    border: 1px solid rgba(237, 228, 201, 0.12);
    border-radius: 0.5rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.45rem 0.55rem;
  }

  .fatigue-bar[data-burnout='true'] {
    border-color: rgba(224, 122, 110, 0.4);
    background: rgba(224, 122, 110, 0.06);
  }

  .fatigue-label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    color: rgba(237, 228, 201, 0.7);
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .fatigue-label em {
    color: #f4d58b;
    font-family: 'Cinzel', Georgia, serif;
    font-style: normal;
    font-size: 0.78rem;
  }

  .fatigue-track {
    margin-top: 0.4rem;
    height: 0.28rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(13, 16, 20, 0.6);
  }

  .fatigue-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #aedab5, #f4d58b 60%, #e0796f);
    transition: width 0.3s ease;
  }

  .fatigue-warn {
    margin-top: 0.4rem;
    color: #e8a09b;
    font-size: 0.66rem;
    font-style: italic;
  }
</style>
