<script lang="ts">
  import { fade } from 'svelte/transition';
  import { rebirth } from '../../game/engine/gameState.svelte';
  import type { ActorId, RebirthGameState, Resources } from '../../game/types';
  import type { OrganizationDelta } from '../../game/org/types';

  interface Props {
    gameState: RebirthGameState;
  }
  let { gameState }: Props = $props();
  const gs = $derived(gameState);

  type SubView = 'formation' | 'talents';
  let view = $state<SubView>('formation');

  /* === Cursus de formation === */
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

  /* === Talents recrutables (catalogue, sans persistance fine) === */
  interface Talent {
    id: string;
    nom: string;
    specialite: string;
    blurb: string;
    cost: number;
    organizationDelta: OrganizationDelta;
    resourceDelta?: Partial<Resources>;
  }

  const TALENTS_SALARIE: Talent[] = [
    {
      id: 'marie-leveque',
      nom: 'Marie Levêque',
      specialite: 'Juriste prud’hommale',
      blurb: 'Quinze ans aux prud’hommes de Bobigny. Lit les contrats comme on lit la pluie.',
      cost: 14,
      organizationDelta: { legalTeam: 2, reputation: 3 },
      resourceDelta: { legitimite: 3 }
    },
    {
      id: 'karim-benhamouda',
      nom: 'Karim Benhamouda',
      specialite: 'Organisateur de sections',
      blurb: 'Vient de la fédération des transports, sait tenir une AG sans micro.',
      cost: 12,
      organizationDelta: { permanentStaff: 1, militants: 5, cohesion: 3 },
      resourceDelta: { confiance: 4 }
    },
    {
      id: 'anne-dubois',
      nom: 'Anne Dubois',
      specialite: 'Écrivaine et tribune',
      blurb: 'Anciennement journaliste à L’Humanité. Sait choisir les mots qui restent.',
      cost: 10,
      organizationDelta: { mediaRelay: 1 },
      resourceDelta: { legitimite: 5, confiance: 2 }
    },
    {
      id: 'pierre-chassaigne',
      nom: 'Pierre Chassaigne',
      specialite: 'Vétéran de la métallurgie',
      blurb: 'A fait Renault-Billancourt 1973, Talbot 1983. Connu, redouté, respecté.',
      cost: 13,
      organizationDelta: { militants: 8, cohesion: 4 },
      resourceDelta: { rapportDeForce: 4 }
    }
  ];

  const TALENTS_PATRON: Talent[] = [
    {
      id: 'henri-bouvier',
      nom: 'Henri de Bouvier',
      specialite: 'Ancien préfet',
      blurb: 'Connaît tous les directeurs de cabinet. Ses dîners ouvrent des portes.',
      cost: 16,
      organizationDelta: { mediaRelay: 2, reputation: 4 },
      resourceDelta: { legitimite: 4 }
    },
    {
      id: 'marc-leblanc',
      nom: 'Marc Leblanc',
      specialite: 'DRH expérimenté',
      blurb: 'Vingt ans chez Saint-Gobain, sait écrire un accord d’entreprise sur un coin de table.',
      cost: 13,
      organizationDelta: { permanentStaff: 1, legalTeam: 1 },
      resourceDelta: { institution: 4 }
    },
    {
      id: 'jeanne-vidal',
      nom: 'Jeanne Vidal',
      specialite: 'Lobbyiste à Bruxelles',
      blurb: 'Comprend les dossiers BusinessEurope avant qu’ils n’atterrissent à Paris.',
      cost: 18,
      organizationDelta: { reputation: 5 },
      resourceDelta: { institution: 6, legitimite: 3 }
    },
    {
      id: 'sophie-martens',
      nom: 'Sophie Martens',
      specialite: 'Juriste social',
      blurb: 'Sait obtenir une suspension d’extension de convention en quarante-huit heures.',
      cost: 14,
      organizationDelta: { legalTeam: 2 },
      resourceDelta: { institution: 4, rapportDeForce: 2 }
    }
  ];

  const talentsForCamp = $derived(gs.camp === 'patron' ? TALENTS_PATRON : TALENTS_SALARIE);

  let lastFeedback = $state<string | null>(null);

  function takeCursus(c: Cursus) {
    if (gs.organization.treasury < c.cost) return;
    rebirth.applyOperation({
      label: `Formation : ${c.label} (${c.duree}, ${c.cost} caisse).`,
      resourceDelta: { ...c.resourceDelta, caisse: -c.cost },
      organizationDelta: c.organizationDelta,
      actorDelta: c.actorDelta
    });
    lastFeedback = `Promotion formée : ${c.label}.`;
  }

  function recruit(t: Talent) {
    if (gs.organization.treasury < t.cost) return;
    rebirth.applyOperation({
      label: `Engagement : ${t.nom} (${t.specialite}, ${t.cost} caisse).`,
      resourceDelta: { ...t.resourceDelta, caisse: -t.cost },
      organizationDelta: t.organizationDelta
    });
    lastFeedback = `${t.nom} rejoint l’équipe.`;
  }
</script>

<section class="bordered-card p-4 space-y-3">
  <div>
    <div class="text-xs uppercase tracking-wider text-parchment-dim/85">Capital humain</div>
    <h3 class="font-display text-gold text-base">Former, recruter, structurer</h3>
  </div>

  <!-- Sub-toggle Formation / Talents -->
  <div class="toggle-bar" role="tablist">
    <button type="button" data-active={view === 'formation'} onclick={() => (view = 'formation')}>Formation</button>
    <button type="button" data-active={view === 'talents'} onclick={() => (view = 'talents')}>Talents</button>
  </div>

  {#if lastFeedback}
    <div class="feedback" in:fade={{ duration: 220 }}>{lastFeedback}</div>
  {/if}

  {#if view === 'formation'}
    <div class="space-y-1.5">
      {#each CURSUS as c}
        {@const disabled = gs.organization.treasury < c.cost}
        <button type="button" class="card-btn" disabled={disabled} onclick={() => takeCursus(c)}>
          <div class="flex items-baseline justify-between gap-2">
            <b>{c.label}</b>
            <em>{c.cost} caisse · {c.duree}</em>
          </div>
          <small>{c.description}</small>
        </button>
      {/each}
    </div>
  {:else}
    <div class="space-y-1.5">
      {#each talentsForCamp as t}
        {@const disabled = gs.organization.treasury < t.cost}
        <button type="button" class="card-btn" disabled={disabled} onclick={() => recruit(t)}>
          <div class="flex items-baseline justify-between gap-2">
            <b>{t.nom}</b>
            <em>{t.cost} caisse</em>
          </div>
          <span class="spec">{t.specialite}</span>
          <small>{t.blurb}</small>
        </button>
      {/each}
    </div>
  {/if}
</section>

<style>
  .toggle-bar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
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
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.5rem 0.45rem;
    min-height: 38px;
    transition: background 0.18s ease, color 0.18s ease;
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

  .feedback {
    border: 1px solid rgba(95, 181, 107, 0.4);
    border-radius: 0.45rem;
    background: rgba(95, 181, 107, 0.07);
    color: #aedab5;
    font-size: 0.74rem;
    padding: 0.45rem 0.55rem;
    font-style: italic;
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
    font-size: 0.66rem;
    letter-spacing: 0.04em;
  }

  .card-btn .spec {
    color: rgba(244, 213, 139, 0.85);
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.62rem;
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
</style>
