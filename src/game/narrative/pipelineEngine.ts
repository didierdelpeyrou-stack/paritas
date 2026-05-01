import type { Choice, RebirthGameState, Scenario } from '../types';
import type { ActivePipeline, PipelineId } from './pipelineTypes';

interface PipelineScenarioData {
  title: string;
  subtitle: string;
  mood: Scenario['mood'];
  historicalContext: string;
  reflechi: string;
  compulsif: string;
  voices: Scenario['voices'];
  choices: Choice[];
}

const LABELS: Record<PipelineId, string> = {
  institution: 'Institution',
  rupture: 'Rupture',
  capture: 'Capture',
  refondation: 'Refondation',
  declin: 'Déclin'
};

export function syncPipelines(state: RebirthGameState): RebirthGameState {
  const next = [...state.activePipelines];
  for (const id of detectPipelineIds(state)) {
    const existing = next.find(pipeline => pipeline.id === id);
    if (existing) {
      existing.pressure = Math.min(100, existing.pressure + pressureGain(state, id));
      continue;
    }
    next.push({
      id,
      label: LABELS[id],
      stage: 0,
      pressure: 35 + pressureGain(state, id),
      lastTurn: state.turn
    });
  }
  return { ...state, activePipelines: next };
}

export function buildPipelineScenario(state: RebirthGameState): Scenario | null {
  const candidates = state.activePipelines
    .filter(pipeline => pipeline.pressure >= 45)
    .filter(pipeline => state.turn - pipeline.lastTurn >= 3)
    .filter(pipeline => !state.memory.playedScenarios.includes(scenarioId(pipeline)));

  if (candidates.length === 0) return buildLongtermScenario(state);

  const pipeline = candidates.sort((a, b) => b.pressure - a.pressure)[0]!;
  return scenarioForPipeline(state, pipeline);
}

export function advancePipelineAfterScenario(state: RebirthGameState, scenario: Scenario): RebirthGameState {
  if (!scenario.id.startsWith('pipeline-')) return state;
  const [, id] = scenario.id.split('-') as ['pipeline', PipelineId, string, string];
  return {
    ...state,
    activePipelines: state.activePipelines.map(pipeline =>
      pipeline.id === id
        ? {
            ...pipeline,
            stage: pipeline.stage + 1,
            pressure: Math.max(10, pipeline.pressure - 35),
            lastTurn: state.turn
          }
        : pipeline
    )
  };
}

function detectPipelineIds(state: RebirthGameState): PipelineId[] {
  const ids: PipelineId[] = [];
  if (state.memory.builtInstitutions.length >= 2 || state.resources.institution >= 64) ids.push('institution');
  if (state.memory.exhaustedMovements > 0 || (state.resources.rapportDeForce >= 68 && state.resources.santeSociale <= 45)) ids.push('rupture');
  if (state.memory.betrayedBase > 0 || state.worldAI.state.id === 'cooptation') ids.push('capture');
  if (state.memory.refusedCompromise >= 2 && state.organization.reputation >= 48) ids.push('refondation');
  if (state.organization.treasury <= 14 || state.organization.cohesion <= 30 || state.resources.caisse <= 20) ids.push('declin');
  return ids;
}

function pressureGain(state: RebirthGameState, id: PipelineId): number {
  switch (id) {
    case 'institution':
      return Math.round(state.resources.institution / 18 + state.organization.legalTeam);
    case 'rupture':
      return Math.round(state.resources.rapportDeForce / 16 + (100 - state.resources.santeSociale) / 22);
    case 'capture':
      return Math.round((100 - state.resources.confiance) / 18 + state.actors.etat.trust / 28);
    case 'refondation':
      return Math.round(state.organization.reputation / 20 + state.memory.refusedCompromise * 2);
    case 'declin':
      return Math.round((100 - state.organization.cohesion) / 18 + (30 - Math.min(30, state.organization.treasury)) / 5);
  }
}

function scenarioId(pipeline: ActivePipeline): string {
  return `pipeline-${pipeline.id}-stage-${pipeline.stage}`;
}

function scenarioForPipeline(state: RebirthGameState, pipeline: ActivePipeline): Scenario {
  const data = pipelineData(pipeline.id, state);
  return {
    id: scenarioId(pipeline),
    turn: state.turn,
    date: `Tour ${state.turn}`,
    era: state.era,
    title: data.title,
    subtitle: data.subtitle,
    mood: data.mood,
    premium: false,
    historicalContext: data.historicalContext,
    setup: {
      reflechi: data.reflechi,
      compulsif: data.compulsif
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    voices: data.voices,
    choices: data.choices
  };
}

function pipelineData(id: PipelineId, state: RebirthGameState): PipelineScenarioData {
  const isPatron = state.camp === 'patron';
  switch (id) {
    case 'institution':
      return {
        title: 'L’institution réclame sa part',
        subtitle: 'Le compromis devient gestion',
        mood: 'calme',
        historicalContext: 'Une institution sociale ne vit pas seulement par son texte fondateur : elle exige des administrateurs, des budgets et une légitimité renouvelée.',
        reflechi: 'Tes choix ont construit du capital institutionnel. Maintenant, la gestion quotidienne commence à peser sur le mandat.',
        compulsif: 'Les affiches promettaient la justice. Les dossiers demandent des signatures, des guichets, des heures.',
        voices: [{ trait: 'batisseur', text: 'Construire oblige ensuite à administrer.' }],
        choices: [
          pipelineChoice('institution-audit', 'Auditer publiquement l’institution.', 'Transparence contre soupçon.', { institution: 5, legitimite: 4, caisse: -2 }, 'La transparence coûte, mais elle rend l’institution défendable.'),
          pipelineChoice('institution-base', 'Rendre des comptes à la base.', 'Réarmer le mandat.', { confiance: 6, institution: 2, rapportDeForce: -1 }, 'La base entend enfin ce que la gestion produit concrètement.'),
          pipelineChoice('institution-technique', 'Professionnaliser la gestion.', 'Efficacité avant récit.', { institution: 6, confiance: -2, caisse: -3 }, 'La machine devient plus solide, mais plus lointaine.')
        ]
      };
    case 'rupture':
      return {
        title: 'La mémoire de la rupture',
        subtitle: 'Le conflit revient demander un prix',
        mood: 'grave',
        historicalContext: 'Les mouvements épuisés ne disparaissent pas : ils reviennent sous forme de fierté, de rancœur ou de prudence.',
        reflechi: 'Tes choix ont installé une mémoire de lutte. Elle peut remobiliser, ou empêcher tout compromis.',
        compulsif: 'Dans les réunions, quelqu’un rappelle les jours perdus. Personne ne sait s’il parle de courage ou de blessure.',
        voices: [{ trait: 'rupture', text: 'Une défaite peut devenir un mythe si tu sais la porter.' }],
        choices: [
          pipelineChoice('rupture-memoire', 'Transformer la défaite en récit mobilisateur.', 'Capital symbolique.', { confiance: 5, rapportDeForce: 5, santeSociale: -2 }, 'Le récit redonne une colonne vertébrale au mouvement.'),
          pipelineChoice('rupture-repos', 'Organiser une pause stratégique.', 'Soigner les forces.', { santeSociale: 7, rapportDeForce: -4, caisse: 2 }, 'La pause ressemble à un recul, mais elle évite de casser les corps.'),
          pipelineChoice('rupture-revanche', 'Chercher une revanche immédiate.', 'Tout remettre sur la table.', { rapportDeForce: 8, santeSociale: -8, legitimite: -3 }, 'La revanche rallume le feu. Elle brûle aussi les réserves.')
        ]
      };
    case 'capture':
      return {
        title: 'Le siège confortable',
        subtitle: 'Reconnaissance ou capture',
        mood: 'melancolique',
        historicalContext: 'La démocratie sociale vit d’une tension : être reconnu par l’État sans devenir son simple relais.',
        reflechi: 'Tes liens institutionnels ouvrent des portes. La base commence à demander ce que tu as laissé dehors.',
        compulsif: 'Le fauteuil est bon. Trop bon. Tu sens que la pièce te reconnaît à mesure que certaines voix s’éloignent.',
        voices: [{ trait: 'pragmatique', text: 'Être à la table ne vaut rien si tu oublies qui t’y envoie.' }],
        choices: [
          pipelineChoice('capture-retour-base', 'Soumettre le siège à un mandat explicite.', 'Réparer la représentation.', { confiance: 7, legitimite: 2, institution: -1 }, 'Le mandat rend la place moins confortable, donc plus légitime.'),
          pipelineChoice('capture-accord-opaque', 'Signer vite pour obtenir un gain concret.', 'Résultat contre transparence.', { institution: 5, caisse: 2, confiance: -7 }, 'Le gain existe. Le soupçon aussi.'),
          pipelineChoice('capture-refus-siege', 'Quitter la table publiquement.', 'Rupture symbolique.', { rapportDeForce: 6, legitimite: 3, institution: -5 }, 'La sortie réveille la base et ferme quelques portes.')
        ]
      };
    case 'refondation':
      return {
        title: 'Refaire autrement',
        subtitle: 'Expérimentation sociale',
        mood: 'euphorique',
        historicalContext: 'Quand les cadres classiques paraissent bloqués, des acteurs cherchent des formes nouvelles : mutuelles, caisses autonomes, alliances territoriales.',
        reflechi: 'Tes refus répétés ont créé un vide. Tu peux l’habiter par une expérimentation au lieu d’un simple non.',
        compulsif: 'Pour une fois, le refus n’est pas une porte fermée. C’est un terrain vague. Quelque chose peut y pousser.',
        voices: [{ trait: 'batisseur', text: 'Refuser ne suffit pas. Il faut donner une adresse à l’avenir.' }],
        choices: [
          pipelineChoice('refondation-caisse', 'Créer une caisse autonome expérimentale.', 'Pouvoir matériel.', { institution: 5, confiance: 5, caisse: -5 }, 'La caisse donne un corps à l’alternative.'),
          pipelineChoice('refondation-alliance', isPatron ? 'Nouer une alliance territoriale productive.' : 'Nouer une alliance avec mutuelles et associations.', 'Élargir le camp.', { legitimite: 6, institution: 3, rapportDeForce: 2 }, 'L’alliance rend la refondation plus difficile à caricaturer.'),
          pipelineChoice('refondation-manifeste', 'Publier un manifeste de refondation.', 'Cadrer le futur.', { legitimite: 5, confiance: 3, caisse: -2 }, 'Le manifeste ne règle rien seul, mais il donne une grammaire.')
        ]
      };
    case 'declin':
      return {
        title: 'Les comptes et la fatigue',
        subtitle: 'Risque de déclin',
        mood: 'grave',
        historicalContext: 'Les organisations sociales meurent rarement d’un seul échec. Elles s’usent par caisse basse, sections fragiles et mandats illisibles.',
        reflechi: 'Ton organisation entre dans une zone dangereuse. Il faut choisir ce qu’on sauve.',
        compulsif: 'Les factures sont petites. C’est leur nombre qui fait peur.',
        voices: [{ trait: 'pragmatique', text: 'Sauver tout, parfois, c’est tout perdre.' }],
        choices: [
          pipelineChoice('declin-vendre', 'Vendre un actif et sauver la caisse.', 'Respirer maintenant.', { caisse: 5, confiance: -3, institution: -2 }, 'La vente donne de l’air et laisse une trace de recul.'),
          pipelineChoice('declin-fusion', 'Chercher une fusion ou alliance défensive.', 'Survivre ensemble.', { institution: 4, legitimite: 2, rapportDeForce: -2 }, 'L’alliance sauve des forces mais dilue le nom.'),
          pipelineChoice('declin-cure', 'Réduire les ambitions pour reconstituer la base.', 'Repartir du terrain.', { confiance: 4, santeSociale: 4, rapportDeForce: -4 }, 'La modestie fait mal. Elle remet quelques visages autour de la table.')
        ]
      };
  }
}

function pipelineChoice(id: string, text: string, intent: string, resources: Choice['effects']['resources'], immediate: string): Choice {
  return {
    id,
    text,
    intent,
    theoryHint: 'Pipeline narratif : cette scène existe parce que tes décisions précédentes ont laissé une trace.',
    effects: { resources },
    consequence: { immediate },
    traitShift: { batisseur: 1, pragmatique: 1 }
  };
}

function buildLongtermScenario(state: RebirthGameState): Scenario | null {
  const pending = state.memory.pendingLongterm.find(item => state.turn - item.turnPosed >= 6);
  if (!pending) return null;
  const id = `pipeline-longterm-${pending.fromScenario}-${pending.turnPosed}`;
  if (state.memory.playedScenarios.includes(id)) return null;
  return {
    id,
    turn: state.turn,
    date: `Tour ${state.turn}`,
    era: state.era,
    title: 'Une conséquence revient',
    subtitle: 'Mémoire longue',
    mood: 'melancolique',
    premium: false,
    historicalContext: 'Certaines décisions ne produisent leur vrai sens qu’à distance.',
    setup: {
      reflechi: pending.text,
      compulsif: `Tu croyais cette décision derrière toi. Elle revient par une phrase, un visage, un dossier rouvert.\n\n${pending.text}`
    },
    actors: ['base', 'adversaire', 'etat', 'opinion'],
    choices: [
      pipelineChoice('longterm-assumer', 'Assumer publiquement cette conséquence.', 'Transformer la mémoire en mandat.', { legitimite: 4, confiance: 3 }, 'Tu assumes. Tout le monde n’approuve pas, mais le fil redevient visible.'),
      pipelineChoice('longterm-enterrer', 'Enterrer le sujet dans la procédure.', 'Éviter le coût immédiat.', { institution: 3, confiance: -4 }, 'La procédure absorbe le choc. La base, elle, comprend très bien ce silence.'),
      pipelineChoice('longterm-reparer', 'Ouvrir une réparation ciblée.', 'Payer pour refermer proprement.', { confiance: 5, caisse: -4, santeSociale: 3 }, 'La réparation ne supprime pas l’erreur. Elle dit que l’organisation l’a vue.')
    ]
  };
}
