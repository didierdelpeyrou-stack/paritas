/* ============================================================
   Paritas — module baston : factions s'affrontent à République
   ============================================================
   Se déclenche uniquement quand la manifestation passe par Paris
   (Place de la République) ET que la tension monte (adversaire dur,
   pression haute).

   La force du joueur dépend du nombre de manifestants effectivement
   mobilisés à Paris (foule République). Les factions adverses
   (police, sécurité privée, infiltrés) sont constituées selon le
   camp et l'ère.

   Système simple, narratif :
   - Chaque faction a un pouvoir = Σ (brawlers × force individuelle)
   - Combat sur 3 rounds, chaque round inflige des pertes
   - Outcome : Victoire / Draw / Défaite → effets résources + récit
   ============================================================ */

import type { Camp } from '../../lib/types';
import type { EraId } from '../types';

export type BrawlerType =
  | 'manifestant'      // salarié : foule, marteau de l'union
  | 'service-ordre'    // salarié : SO syndical, brassard CGT
  | 'pigeon'           // salarié : jeunes, agiles
  | 'coup-de-force'    // salarié : manche de pioche, capuche
  | 'securite-privee'  // patron : vigiles, gilet jaune fluo
  | 'bande-palis'      // patron : groupe d'intimidation
  | 'infiltre'         // patron : agent en civil
  | 'crs';             // état : matraques, boucliers

export interface Brawler {
  type: BrawlerType;
  /** Nom court affiché. */
  label: string;
  /** Force individuelle (1-10). */
  strength: number;
  /** Couleur primaire (hex). Pour le rendu canvas. */
  color: string;
  /** Description courte FALC. */
  description: string;
  /** Faction symbol pour le rendu. */
  glyph: string;
}

export const BRAWLER_CATALOG: Record<BrawlerType, Brawler> = {
  manifestant: {
    type: 'manifestant',
    label: 'Manifestants',
    strength: 1,
    color: '#B0181E',
    description: 'Foule en colère. Faibles seuls, redoutables en nombre.',
    glyph: '✊'
  },
  'service-ordre': {
    type: 'service-ordre',
    label: 'Service d\'ordre',
    strength: 4,
    color: '#7C1D17',
    description: 'Encadrement syndical. Discipline et expérience.',
    glyph: '◆'
  },
  pigeon: {
    type: 'pigeon',
    label: 'Pigeons',
    strength: 2,
    color: '#DA9221',
    description: 'Jeunes mobiles. Vifs, tactiques de harcèlement.',
    glyph: '✦'
  },
  'coup-de-force': {
    type: 'coup-de-force',
    label: 'Coup de force',
    strength: 6,
    color: '#3D1A14',
    description: 'Cagoulés et déterminés. Frappes ciblées.',
    glyph: '⚒'
  },
  'securite-privee': {
    type: 'securite-privee',
    label: 'Sécurité privée',
    strength: 3,
    color: '#1E5C8A',
    description: 'Vigiles d\'entreprise. Gilet fluo, ordres simples.',
    glyph: '◆'
  },
  'bande-palis': {
    type: 'bande-palis',
    label: 'Bande à Palis',
    strength: 5,
    color: '#0F2C4A',
    description: 'Bras armés du patronat. Manches de pioche.',
    glyph: '⚒'
  },
  infiltre: {
    type: 'infiltre',
    label: 'Infiltrés',
    strength: 4,
    color: '#2A1A0E',
    description: 'En civil dans la foule. Provocations et arrestations ciblées.',
    glyph: '✸'
  },
  crs: {
    type: 'crs',
    label: 'CRS',
    strength: 5,
    color: '#1A2F3D',
    description: 'Compagnies républicaines. Matraques, boucliers, gaz.',
    glyph: '▣'
  }
};

export interface FactionRoster {
  /** Camp politique de la faction. */
  side: 'joueur' | 'adversaire';
  /** Composition : type → nombre. */
  brawlers: Partial<Record<BrawlerType, number>>;
  /** Total de combattants. */
  total: number;
  /** Pouvoir composite (somme strength × count). */
  power: number;
  /** Étiquette affichée. */
  label: string;
}

/** Compose la faction du joueur en fonction de la foule à République,
 *  du camp, et de l'organisation. */
export function buildPlayerFaction(opts: {
  camp: Camp;
  fouleParis: number;         // nombre de manifestants à Paris
  militants: number;          // total adhérents organisation
  cadres: number;             // permanentStaff
  cohesion: number;           // 0-100
}): FactionRoster {
  const { camp, fouleParis, militants, cadres, cohesion } = opts;

  if (camp === 'salarie') {
    /* La foule République = manifestants. Plus elle est grande, plus
       le joueur est fort. Service d'ordre = un cadre pour 200 manifs.
       Pigeons = 1 pour 800 manifs (jeunes mobiles). Coup de force =
       seulement si cohésion < 40 (mouvement en colère, plus radical). */
    const manifestants = Math.max(50, Math.round(fouleParis));
    const so = Math.max(2, Math.round(cadres * 0.6));
    const pigeons = Math.round(fouleParis / 800);
    const coupDeForce = cohesion < 40 ? Math.round(fouleParis / 2000) : 0;
    const brawlers = {
      manifestant: manifestants,
      'service-ordre': so,
      pigeon: pigeons,
      ...(coupDeForce > 0 ? { 'coup-de-force': coupDeForce } : {})
    };
    return finalizeFaction({
      side: 'joueur',
      brawlers,
      label: 'Cortège syndical'
    });
  }

  /* Camp patron : la foule République est défavorable. Le joueur
     mobilise sécurité privée + bande à Palis + infiltrés selon ses
     moyens. Pas de manifestants. */
  const securite = Math.max(5, Math.round(militants * 0.05));
  const bande = Math.round(cadres * 0.4);
  const infiltres = Math.round(cadres * 0.2);
  return finalizeFaction({
    side: 'joueur',
    brawlers: {
      'securite-privee': securite,
      'bande-palis': bande,
      infiltre: infiltres
    },
    label: 'Forces patronales'
  });
}

/** Compose la faction adverse selon l'ère et la pression policière.
 *  Pour camp salarié : CRS + parfois infiltrés.
 *  Pour camp patron : foule manifestants (les ouvriers s'organisent
 *  contre lui) + service d'ordre. */
export function buildAdversaryFaction(opts: {
  camp: Camp;
  fouleParis: number;
  era: EraId;
  policePressure: number;     // 0-100, état trust + stance
}): FactionRoster {
  const { camp, fouleParis, era, policePressure } = opts;

  if (camp === 'salarie') {
    /* Adversaire = CRS + infiltrés. Effectif scale avec la pression. */
    const crsBase = era === 'revolution' || era === 'xixe' ? 10 : 30;
    const crs = Math.round(crsBase + policePressure * 0.6);
    const infiltres = Math.round(policePressure / 12);
    return finalizeFaction({
      side: 'adversaire',
      brawlers: {
        crs,
        ...(infiltres > 0 ? { infiltre: infiltres } : {})
      },
      label: 'Forces de l\'ordre'
    });
  }

  /* Adversaire = manifestants en colère (côté patron, c'est la rue). */
  const manifestants = Math.max(80, Math.round(fouleParis));
  const so = Math.round(fouleParis / 250);
  return finalizeFaction({
    side: 'adversaire',
    brawlers: {
      manifestant: manifestants,
      'service-ordre': so
    },
    label: 'Cortège ouvrier'
  });
}

function finalizeFaction(args: {
  side: 'joueur' | 'adversaire';
  brawlers: Partial<Record<BrawlerType, number>>;
  label: string;
}): FactionRoster {
  let total = 0;
  let power = 0;
  for (const [t, n] of Object.entries(args.brawlers)) {
    if (typeof n !== 'number' || n <= 0) continue;
    total += n;
    power += n * BRAWLER_CATALOG[t as BrawlerType].strength;
  }
  return { ...args, total, power };
}

/* ====== Résolution du combat ====== */

export interface BrawlRound {
  roundNumber: number;
  /** Pertes côté joueur ce round. */
  joueurLosses: number;
  /** Pertes côté adversaire ce round. */
  adversaireLosses: number;
  /** Récit narratif court. */
  narrative: string;
}

export interface BrawlOutcome {
  /** Victoire = joueur tient, adversaire en déroute. */
  result: 'victoire' | 'nul' | 'defaite';
  rounds: BrawlRound[];
  /** Pertes finales. */
  totalJoueurLosses: number;
  totalAdversaireLosses: number;
  /** Effets sur les ressources. */
  effects: {
    rapportDeForce?: number;
    confiance?: number;
    cohesionInterne?: number;
    legitimite?: number;
    santeSociale?: number;
    caisse?: number;
  };
  /** Récit final affiché au joueur. */
  finalNarrative: string;
}

/** Résolution stochastique en 3 rounds.
 *  Chaque round : chaque side inflige des pertes ∝ pouvoir,
 *  modulé par la différence de pouvoir (rapport de force) et un dé. */
export function resolveBrawl(opts: {
  joueur: FactionRoster;
  adversaire: FactionRoster;
  /** Rapport de force initial (-50..50, du joueur). */
  initialMomentum?: number;
}): BrawlOutcome {
  const { joueur, adversaire } = opts;
  const initialMomentum = opts.initialMomentum ?? 0;

  let jPower = joueur.power;
  let aPower = adversaire.power;
  let momentum = initialMomentum;

  const rounds: BrawlRound[] = [];
  let totalJoueurLosses = 0;
  let totalAdversaireLosses = 0;

  for (let r = 1; r <= 3; r++) {
    /* Force effective ce round : pouvoir + momentum (×0.3 max). */
    const jEffective = Math.max(0, jPower * (1 + momentum / 200));
    const aEffective = Math.max(0, aPower * (1 - momentum / 200));

    /* Pertes ∝ force adverse × random factor (0.10 à 0.20). */
    const jLossRatio = 0.10 + Math.random() * 0.10;
    const aLossRatio = 0.10 + Math.random() * 0.10;

    const jLossPower = Math.min(jPower, aEffective * jLossRatio);
    const aLossPower = Math.min(aPower, jEffective * aLossRatio);

    /* Convertir power perdu en nombre de combattants (approx). */
    const avgJStrength = jPower / Math.max(1, joueur.total);
    const avgAStrength = aPower / Math.max(1, adversaire.total);
    const jLossCount = Math.round(jLossPower / Math.max(1, avgJStrength));
    const aLossCount = Math.round(aLossPower / Math.max(1, avgAStrength));

    jPower = Math.max(0, jPower - jLossPower);
    aPower = Math.max(0, aPower - aLossPower);
    totalJoueurLosses += jLossCount;
    totalAdversaireLosses += aLossCount;

    /* Mise à jour du momentum selon le diff de pertes. */
    momentum += (aLossPower - jLossPower) * 0.5;
    momentum = Math.max(-50, Math.min(50, momentum));

    rounds.push({
      roundNumber: r,
      joueurLosses: jLossCount,
      adversaireLosses: aLossCount,
      narrative: composeRoundNarrative(r, jLossCount, aLossCount, momentum)
    });

    /* Side broken si power < 30% initial → fin anticipée. */
    if (jPower < joueur.power * 0.3) break;
    if (aPower < adversaire.power * 0.3) break;
  }

  /* Détermine le résultat. */
  const jSurvivePct = jPower / Math.max(1, joueur.power);
  const aSurvivePct = aPower / Math.max(1, adversaire.power);
  let result: 'victoire' | 'nul' | 'defaite';
  if (aSurvivePct < 0.4 && jSurvivePct > 0.5) result = 'victoire';
  else if (jSurvivePct < 0.4 && aSurvivePct > 0.5) result = 'defaite';
  else result = 'nul';

  return {
    result,
    rounds,
    totalJoueurLosses,
    totalAdversaireLosses,
    effects: composeEffects(result, totalJoueurLosses, totalAdversaireLosses),
    finalNarrative: composeFinalNarrative(result, joueur.label, adversaire.label, totalJoueurLosses, totalAdversaireLosses)
  };
}

function composeRoundNarrative(round: number, jLoss: number, aLoss: number, momentum: number): string {
  const prefix = ['Round 1 — l\'engagement', 'Round 2 — au cœur du choc', 'Round 3 — la décision'][round - 1] ?? `Round ${round}`;
  if (aLoss > jLoss * 2) return `${prefix} : tu prends le dessus. ${aLoss} reculent, ${jLoss} restent au sol côté tien.`;
  if (jLoss > aLoss * 2) return `${prefix} : tu encaisses. ${jLoss} blessés des tiens, ${aLoss} en face.`;
  return `${prefix} : choc équilibré. ${jLoss} et ${aLoss} de part et d'autre.`;
}

function composeFinalNarrative(
  result: 'victoire' | 'nul' | 'defaite',
  jLabel: string,
  aLabel: string,
  jLosses: number,
  aLosses: number
): string {
  if (result === 'victoire') {
    return `Place de la République est tenue. ${aLabel} se replie en désordre. Vous comptez ${jLosses} blessés, ${aLosses} dans les rangs adverses. La rue parle de cette journée pendant des mois.`;
  }
  if (result === 'defaite') {
    return `${aLabel} disperse le rassemblement. ${jLosses} blessés et arrêtés des vôtres, ${aLosses} en face. La presse commente la « capacité de l'État à maintenir l'ordre ». La base murmure.`;
  }
  return `Ni victoire ni défaite. Les deux camps se replient à la nuit tombée — ${jLosses} blessés vous concernent, ${aLosses} en face. Ce n'est pas fini.`;
}

function composeEffects(
  result: 'victoire' | 'nul' | 'defaite',
  jLosses: number,
  aLosses: number
): BrawlOutcome['effects'] {
  const lossPenalty = Math.min(8, Math.round(jLosses / 50));
  if (result === 'victoire') {
    return {
      rapportDeForce: +12,
      confiance: +8,
      cohesionInterne: +6,
      legitimite: -4,
      santeSociale: -6,
      caisse: -3 - lossPenalty
    };
  }
  if (result === 'defaite') {
    return {
      rapportDeForce: -10,
      confiance: -6 - lossPenalty,
      cohesionInterne: -8,
      legitimite: -3,
      santeSociale: -8,
      caisse: -5 - lossPenalty
    };
  }
  return {
    rapportDeForce: +2,
    confiance: -2,
    cohesionInterne: 0,
    legitimite: -2,
    santeSociale: -5,
    caisse: -3 - lossPenalty
  };
}
