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

export type AttackKind = 'melee' | 'melee_push' | 'projectile' | 'thrown_arc';
export type SuperKind = 'rally' | 'cordon' | 'nuee' | 'molotov'
                     | 'lockdown' | 'vpush' | 'flip' | 'charge';

export interface Brawler {
  type: BrawlerType;
  /** Nom court affiché. */
  label: string;
  /** Couleur primaire (hex). Pour le rendu canvas. */
  color: string;
  /** Couleur sombre (ombre). */
  colorDark: string;
  /** Description courte FALC. */
  description: string;
  /** Faction symbol pour le rendu. */
  glyph: string;
  /* === Stats Brawl Stars-style (portées du build Phaser) === */
  /** Points de vie individuel. */
  hp: number;
  /** Dégâts par attaque. */
  atk: number;
  /** Vitesse de déplacement (px/s en réf, abstrait pour la sim). */
  speed: number;
  /** Portée d'attaque (px en réf). */
  range: number;
  /** Type d'attaque (mêlée, projectile, lancé en arc). */
  attackKind: AttackKind;
  /** Cooldown entre 2 attaques (ms). */
  cooldown: number;
  /** Vitesse projectile (si projectile). */
  bulletSpeed?: number;
  /** Force de répulsion (si melee_push). */
  pushForce?: number;
  /** Super activable. */
  super: SuperKind;
  /** Description du super (FALC). */
  superDesc: string;
  /** Cooldown du super (ms). Calibré ~12-25s. */
  superCooldown: number;
  /** Rétrocompat : force composite ancienne (Σ pour le résolveur legacy). */
  strength: number;
}

/* Stats portées du build Phaser arena (3242 lignes, calibrées par
   3 audits Argus + paritarisme historique). Ratios HP/ATK conservés,
   cooldowns en ms. Le supercooldown est dérivé : 12-25s selon l'impact. */
export const BRAWLER_CATALOG: Record<BrawlerType, Brawler> = {
  manifestant: {
    type: 'manifestant', label: 'Manifestants',
    color: '#D9291A', colorDark: '#7A0F0F', glyph: '✊',
    description: 'Pousse, intimide, occupe le terrain. Bonus de groupe.',
    hp: 4800, atk: 350, speed: 225, range: 90,
    attackKind: 'melee_push', pushForce: 380, cooldown: 480,
    super: 'rally', superCooldown: 14000,
    superDesc: 'Ralliement : soigne les manifestants alliés (+800 PV) et +25% vitesse 6s.',
    strength: 1
  },
  'service-ordre': {
    type: 'service-ordre', label: 'Service d\'Ordre',
    color: '#A52015', colorDark: '#5A0808', glyph: '◆',
    description: 'Tank mains nues. Cordon défensif. -50% dmg subi quand entouré.',
    hp: 8200, atk: 750, speed: 165, range: 100,
    attackKind: 'melee', pushForce: 120, cooldown: 720,
    super: 'cordon', superCooldown: 22000,
    superDesc: 'Cordon : invulnérable 3s + onde de choc qui inflige 600 dégâts.',
    strength: 4
  },
  pigeon: {
    type: 'pigeon', label: 'Dresseur de pigeons',
    color: '#FF7E68', colorDark: '#A53528', glyph: '🕊',
    description: 'Sniper léger longue portée. Nuée passive auto.',
    hp: 3000, atk: 600, speed: 240, range: 500,
    attackKind: 'projectile', bulletSpeed: 900, cooldown: 320,
    super: 'nuee', superCooldown: 16000,
    superDesc: 'Nuée aveuglante : zone qui ralentit -50% et empêche de tirer 4s.',
    strength: 2
  },
  'coup-de-force': {
    type: 'coup-de-force', label: 'Coup de force',
    color: '#7A0F0F', colorDark: '#3A0606', glyph: '⚒',
    description: 'Lance des cocktails molotov en arc. Zone de feu persistante.',
    hp: 4200, atk: 0, speed: 195, range: 280,
    attackKind: 'thrown_arc', cooldown: 900,
    super: 'molotov', superCooldown: 25000,
    superDesc: 'Cocktail géant : zone de feu, 350 dégâts/sec pendant 5s.',
    strength: 6
  },
  'securite-privee': {
    type: 'securite-privee', label: 'Sécurité d\'usine',
    color: '#1E5C8A', colorDark: '#0D3D5C', glyph: '🚧',
    description: 'Tank tireur défensif.',
    hp: 6800, atk: 850, speed: 170, range: 300,
    attackKind: 'projectile', bulletSpeed: 720, cooldown: 520,
    super: 'lockdown', superCooldown: 18000,
    superDesc: 'Lockdown : root l\'ennemi le plus proche pendant 2,5s.',
    strength: 3
  },
  'bande-palis': {
    type: 'bande-palis', label: 'Bande à Palis',
    color: '#0D3D5C', colorDark: '#062539', glyph: '👊',
    description: 'Mêlée brutale. Disperse au contact.',
    hp: 4800, atk: 950, speed: 215, range: 120,
    attackKind: 'melee_push', pushForce: 280, cooldown: 600,
    super: 'vpush', superCooldown: 15000,
    superDesc: 'Charge en V : dash et pousse les ennemis touchés.',
    strength: 5
  },
  infiltre: {
    type: 'infiltre', label: 'Infiltré',
    color: '#6FAFD6', colorDark: '#3D7BA0', glyph: '🕴',
    description: 'Fast. Stealth. Super flip puissant mais long cooldown.',
    hp: 3200, atk: 700, speed: 250, range: 250,
    attackKind: 'projectile', bulletSpeed: 800, cooldown: 420,
    super: 'flip', superCooldown: 60000,
    superDesc: 'Trahison : convertit 1 ennemi adjacent au camp adverse pour 4s.',
    strength: 4
  },
  crs: {
    type: 'crs', label: 'Matraques (CRS)',
    color: '#444444', colorDark: '#222222', glyph: '🛂',
    description: 'CRS pied. Mêlée brutale + dash super.',
    hp: 5500, atk: 950, speed: 200, range: 110,
    attackKind: 'melee_push', pushForce: 180, cooldown: 540,
    super: 'charge', superCooldown: 17000,
    superDesc: 'Charge : dash et 1,5x dégâts au prochain coup.',
    strength: 5
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
