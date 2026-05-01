/**
 * Donne un visage historique à l'adversaire. Selon le camp du joueur
 * et le tour courant, le camp opposé n'est pas une abstraction mais
 * une organisation nommée — Comité des Forges, CGPF, CNPF, MEDEF, ou
 * en miroir : compagnons, CGT, CGT/CGTU, intersyndicale.
 */

import type { Camp } from '../../lib/types';

export interface OpponentFactionDef {
  id: string;
  displayName: string;
  shortName: string;
  /** Pour quel camp joueur cette faction est l'adversaire. */
  forPlayerCamp: Camp;
  /** Tour d'apparition (inclus). */
  fromTurn: number;
  /** Tour de bascule vers la faction suivante (exclu). undefined = ouvert. */
  toTurn?: number;
  /** Une phrase qui caractérise la posture. */
  blurb: string;
}

const FACTIONS: OpponentFactionDef[] = [
  /* ============== Adversaires d'un joueur SALARIÉ (= le patronat) ============== */
  {
    id: 'maitres-des-forges',
    displayName: 'Maîtres des forges',
    shortName: 'Forges',
    forPlayerCamp: 'salarie',
    fromTurn: 1,
    toTurn: 14,
    blurb: 'Notables industriels, paternalisme dur, refus de la coalition.'
  },
  {
    id: 'comite-des-forges',
    displayName: 'Comité des Forges',
    shortName: 'Comité',
    forPlayerCamp: 'salarie',
    fromTurn: 14,
    toTurn: 19,
    blurb: 'Lobby sidérurgiste organisé. Fonde le patronat moderne.'
  },
  {
    id: 'cgpf',
    displayName: 'CGPF',
    shortName: 'CGPF',
    forPlayerCamp: 'salarie',
    fromTurn: 19,
    toTurn: 23,
    blurb: 'Confédération générale du patronat français (1919). Signe Matignon.'
  },
  {
    id: 'cnpf',
    displayName: 'CNPF',
    shortName: 'CNPF',
    forPlayerCamp: 'salarie',
    fromTurn: 23,
    toTurn: 36,
    blurb: 'Conseil national du patronat français (1946). Reconnaît le paritarisme.'
  },
  {
    id: 'medef',
    displayName: 'MEDEF',
    shortName: 'MEDEF',
    forPlayerCamp: 'salarie',
    fromTurn: 36,
    blurb: 'Mouvement des entreprises de France (1998). Refondation sociale.'
  },

  /* ============== Adversaires d'un joueur PATRON (= le mouvement ouvrier) ============== */
  {
    id: 'compagnons-clandestins',
    displayName: 'Compagnonnages',
    shortName: 'Compagnons',
    forPlayerCamp: 'patron',
    fromTurn: 1,
    toTurn: 12,
    blurb: 'Sociétés de secours et compagnonnages clandestins post-Le Chapelier.'
  },
  {
    id: 'chambres-syndicales',
    displayName: 'Chambres syndicales',
    shortName: 'Chambres',
    forPlayerCamp: 'patron',
    fromTurn: 12,
    toTurn: 14,
    blurb: 'Premières chambres syndicales tolérées (1864-1884).'
  },
  {
    id: 'cgt-naissante',
    displayName: 'CGT',
    shortName: 'CGT',
    forPlayerCamp: 'patron',
    fromTurn: 14,
    toTurn: 19,
    blurb: 'Confédération générale du travail (1895). Charte d’Amiens.'
  },
  {
    id: 'cgt-cgtu',
    displayName: 'CGT et CGTU',
    shortName: 'CGT/CGTU',
    forPlayerCamp: 'patron',
    fromTurn: 19,
    toTurn: 22,
    blurb: 'Scission communiste (1921), tension réformistes / révolutionnaires.'
  },
  {
    id: 'cgt-reunifiee',
    displayName: 'CGT réunifiée',
    shortName: 'CGT',
    forPlayerCamp: 'patron',
    fromTurn: 22,
    toTurn: 25,
    blurb: 'Réunification de 1936, signataire de Matignon.'
  },
  {
    id: 'intersyndicale-fo',
    displayName: 'CGT et FO',
    shortName: 'CGT/FO',
    forPlayerCamp: 'patron',
    fromTurn: 25,
    toTurn: 30,
    blurb: 'Scission FO (1947) sur fond de guerre froide.'
  },
  {
    id: 'intersyndicale-large',
    displayName: 'Intersyndicale',
    shortName: 'Intersyndicale',
    forPlayerCamp: 'patron',
    fromTurn: 30,
    blurb: 'CGT, CFDT, FO, CFTC, CFE-CGC. Cartel mouvant des grandes confédérations.'
  }
];

const FALLBACK: Record<Camp, OpponentFactionDef> = {
  salarie: {
    id: 'patronat',
    displayName: 'Patronat',
    shortName: 'Patronat',
    forPlayerCamp: 'salarie',
    fromTurn: 0,
    blurb: 'Camp adverse, sans organisation nommée.'
  },
  patron: {
    id: 'syndicats',
    displayName: 'Syndicats',
    shortName: 'Syndicats',
    forPlayerCamp: 'patron',
    fromTurn: 0,
    blurb: 'Camp adverse, sans organisation nommée.'
  }
};

export function currentOpponentFaction(turn: number, playerCamp: Camp): OpponentFactionDef {
  const candidates = FACTIONS.filter(
    f => f.forPlayerCamp === playerCamp && turn >= f.fromTurn && (f.toTurn === undefined || turn < f.toTurn)
  );
  return candidates[0] ?? FALLBACK[playerCamp];
}
