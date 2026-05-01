/* ============================================================
   Paritas — lecture expert: jeux, Harvard, perspectives, agence
   ============================================================ */

import { mentorForSkill, type LegendaryCharacter } from '../data/legendaryCharacters';
import type { Camp, Choice, ChoiceTag, Effects, GameEvent, GameState, SkillKey, StatKey } from '../types';

export type GameModel = 'zero_sum' | 'positive_sum' | 'prisoner' | 'chicken' | 'signaling';

export interface ExpertChoiceInsight {
  model: {
    key: GameModel;
    label: string;
    detail: string;
  };
  harvard: {
    mesore: string;
    interests: string;
    detail: string;
  };
  behavioral: {
    bias: 'aversion_perte' | 'ancrage' | 'cadrage';
    label: string;
    detail: string;
  };
  agency: {
    risk: string;
    detail: string;
  };
  skills: {
    primary: SkillKey | null;
    improves: string;
    trial: string;
  };
  mentor: LegendaryCharacter;
}

const GAME_LABELS: Record<GameModel, string> = {
  zero_sum: 'Somme nulle',
  positive_sum: 'Somme non nulle',
  prisoner: 'Dilemme du prisonnier',
  chicken: 'Chicken game',
  signaling: 'Signal strategique'
};

export function analyzeChoiceExpert(choice: Choice, state: GameState, camp: Camp, event: GameEvent): ExpertChoiceInsight {
  const modelKey = classifyGame(choice);
  const primary = choice.skillUp ?? inferSkill(choice);
  const mentor = mentorForSkill(camp, primary ?? undefined);

  return {
    model: {
      key: modelKey,
      label: GAME_LABELS[modelKey],
      detail: modelDetail(modelKey, choice, camp)
    },
    harvard: {
      mesore: computeMesore(state, camp),
      interests: inferInterests(choice, camp),
      detail: harvardDetail(choice)
    },
    behavioral: behavioralLens(choice, state),
    agency: agencyLens(choice, state, camp),
    skills: {
      primary,
      improves: primary ? `${skillLabel(primary)} progresse si l’epreuve reussit; elle sert ensuite de levier dans les dossiers proches.` : 'Choix sans competence principale.',
      trial: trialText(choice, event)
    },
    mentor
  };
}

function classifyGame(choice: Choice): GameModel {
  const tag = choice.tag;
  const eff = choice.effects;
  const socialGain = valueOf(eff, ['soutien', 'social', 'prestige', 'institutionnel']);
  const economicGain = valueOf(eff, ['caisse', 'economique', 'production', 'influence']);
  const healthCost = valueOf(eff, ['sante']);

  if (tag === 'greve' || tag === 'dur') return 'chicken';
  if (tag === 'refuse') return 'prisoner';
  if (tag === 'discours' || tag === 'lobbying') return 'signaling';
  if (socialGain > 4 && economicGain > 2 && healthCost >= -4) return 'positive_sum';
  if ((eff.caisse ?? 0) > 4 && (eff.soutien ?? 0) < 0) return 'zero_sum';
  if (tag === 'signe' || tag === 'negocie' || tag === 'institution') return 'positive_sum';
  return 'signaling';
}

function modelDetail(model: GameModel, choice: Choice, camp: Camp): string {
  if (model === 'zero_sum') return 'Le gain principal d’un camp est percu comme une perte par l’autre : utile a court terme, inflammable a long terme.';
  if (model === 'positive_sum') return 'Le choix elargit le gateau : il cherche un accord ou chaque camp obtient une valeur differente.';
  if (model === 'prisoner') return 'La defiance peut dominer meme si la cooperation serait meilleure collectivement.';
  if (model === 'chicken') return camp === 'salarie'
    ? 'La pression monte jusqu’a ce qu’un camp cede; tenir trop longtemps abime la sante collective.'
    : 'La ligne dure teste l’endurance adverse, mais une collision ouverte peut detruire la legitimite patronale.';
  return `Le choix envoie un signal public : ${choice.text.toLowerCase()}.`;
}

function computeMesore(state: GameState, camp: Camp): string {
  const r = state.resources;
  const c = state.capitaux;
  if (camp === 'salarie') {
    if (r.soutien > 58 && c.militant > 45) return 'MESORE forte : mobilisation credible hors accord.';
    if (r.caisse < 25 || r.sante < 35) return 'MESORE fragile : tenir le conflit coute cher.';
    return 'MESORE moyenne : pression possible, mais accord preferable.';
  }
  if (r.caisse > 58 && r.influence > 45) return 'MESORE forte : temporiser ou passer par la branche.';
  if (r.prestige < 25 || r.soutien < 30) return 'MESORE fragile : l’opinion peut imposer le compromis.';
  return 'MESORE moyenne : marge de manoeuvre, mais risque reputational.';
}

function inferInterests(choice: Choice, camp: Camp): string {
  const eff = choice.effects;
  if ((eff.sante ?? 0) > 0) return 'Interet cache : securite et soutenabilite du travail.';
  if ((eff.caisse ?? 0) > 0 || (eff.economique ?? 0) > 0) return camp === 'patron' ? 'Interet cache : marge, continuite productive et predictibilite.' : 'Interet cache : autonomie materielle du mouvement.';
  if ((eff.soutien ?? 0) > 0 || (eff.social ?? 0) > 0) return 'Interet cache : reconnaissance, mandat et cohesion de la base.';
  if ((eff.institutionnel ?? 0) > 0) return 'Interet cache : rendre le compromis durable et opposable.';
  return 'Interet cache : reprendre l’initiative sans reveler toute la strategie.';
}

function harvardDetail(choice: Choice): string {
  if (choice.tag === 'signe' || choice.tag === 'negocie') return 'Harvard recommande de durcir les criteres objectifs, pas les personnes.';
  if (choice.tag === 'greve' || choice.tag === 'dur') return 'Avant d’escalader, verifier que la MESORE est vraiment meilleure qu’un accord imparfait.';
  if (choice.tag === 'institution') return 'Le conflit est converti en procedure : bon pour la duree, faible pour l’emotion.';
  return 'Chercher la position derriere la demande : prix, statut, reconnaissance ou securite.';
}

function behavioralLens(choice: Choice, state: GameState): ExpertChoiceInsight['behavioral'] {
  if ((choice.effects.caisse ?? 0) < -4 || (choice.effects.sante ?? 0) < -4) {
    return {
      bias: 'aversion_perte',
      label: 'Aversion a la perte',
      detail: 'La partie adverse reagira plus fort a ce qu’elle perd qu’a ce qu’elle gagne.'
    };
  }
  if (choice.dc && choice.dc >= 60) {
    return {
      bias: 'ancrage',
      label: 'Ancrage haut',
      detail: 'Une demande ambitieuse peut deplacer le centre du debat, meme si elle echoue partiellement.'
    };
  }
  return {
    bias: 'cadrage',
    label: 'Cadrage',
    detail: state.resources.prestige > 55
      ? 'Ton prestige rend le cadrage public plus credible.'
      : 'La presentation du choix comptera presque autant que son contenu.'
  };
}

function agencyLens(choice: Choice, state: GameState, camp: Camp): ExpertChoiceInsight['agency'] {
  if (camp === 'salarie' && (choice.tag === 'signe' || choice.tag === 'institution') && state.capitaux.militant > 58) {
    return {
      risk: 'Mandat sous tension',
      detail: 'Le negociateur peut sembler s’eloigner d’une base plus combative que lui.'
    };
  }
  if (camp === 'patron' && (choice.effects.caisse ?? 0) > 0 && (choice.effects.soutien ?? 0) < 0) {
    return {
      risk: 'Agent court-termiste',
      detail: 'La direction gagne en marge, mais ses representants locaux paient le cout social.'
    };
  }
  if (choice.tag === 'lobbying') {
    return {
      risk: 'Delegation opaque',
      detail: 'Le pouvoir passe par des representants moins visibles : efficace, mais suspect.'
    };
  }
  return {
    risk: 'Alignement surveille',
    detail: 'Verifier que le representant reste aligne avec son mandat, pas seulement avec sa tactique.'
  };
}

function trialText(choice: Choice, event: GameEvent): string {
  const dc = choice.dc ? `DC ${choice.dc}` : 'decision directe';
  return `${event.title} devient une epreuve ${dc}: elle transforme l’experience abstraite en competence rejouable.`;
}

function inferSkill(choice: Choice): SkillKey | null {
  const tagToSkill: Partial<Record<ChoiceTag, SkillKey>> = {
    signe: 'negociation',
    negocie: 'negociation',
    institution: 'expertise',
    mobilise: 'mobilisation',
    greve: 'mobilisation',
    refuse: 'politique',
    discours: 'baratin',
    lobbying: 'politique',
    production: 'production',
    dur: 'mobilisation',
    memoire: 'baratin'
  };
  return choice.tag ? tagToSkill[choice.tag] ?? null : null;
}

function valueOf(effects: Effects, keys: StatKey[]): number {
  return keys.reduce((sum, key) => sum + (effects[key] ?? 0), 0);
}

function skillLabel(skill: SkillKey): string {
  const labels: Record<SkillKey, string> = {
    negociation: 'Negociation',
    politique: 'Politique',
    baratin: 'Discours',
    production: 'Production',
    mobilisation: 'Mobilisation',
    expertise: 'Expertise'
  };
  return labels[skill];
}
