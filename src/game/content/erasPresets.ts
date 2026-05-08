/* Paritas Rebirth — erasPresets.ts
 *
 * Presets de ressources de démarrage par ère, pour le **mode "Séance prof"**
 * (P0 panel-30, agent-23 Aïcha, AAR ORDA-017).
 *
 * Permet à un enseignant de démarrer une partie focalisée sur une période
 * historique précise (ex : Front populaire 1936, Grenelle 1968, ordonnances
 * Macron 2017) sans devoir jouer les 17 ou 69 tours qui précèdent.
 *
 * Approche : pour chaque ère, on définit une "photographie" des 7 ressources
 * cohérente avec l'état historique du paritarisme à cette période. Les
 * valeurs sont délibérément **arrondies** et ne prétendent pas reproduire
 * exactement ce qu'aurait produit une partie complète — elles donnent au
 * prof un état de départ pédagogiquement crédible.
 *
 * Tendances générales (cf. 00_bibliographie_master.md §2) :
 * - **institution** : monte avec le temps (1789 ≈ 20 → 2026 ≈ 65). Les
 *   institutions paritaires s'accumulent : Sécu 1945, Unédic 1958, retraites
 *   complémentaires 1961, formation continue 1971, AGIRC-ARRCO 1947 puis
 *   fusion 2019, etc. Léger reflux post-2017 (ordonnances Macron, fusion
 *   forcée, ponction Action Logement).
 * - **rapportDeForce** : pic Front populaire (1936), apogée 1968, décrue
 *   sous la crise pétrolière, remonte 1995 (Juppé) puis effondrement
 *   continu 2007+.
 * - **cohesionInterne** : reflète la solidité de la base. Pic Reconstruction
 *   (CGT unitaire), scission FO 1948, divisions confédérales depuis.
 * - **legitimite** : opinion publique vis-à-vis du syndicalisme. Très haute
 *   1944-1947 (CNR), reflux Guerre froide, remontée 1968, érosion continue.
 * - **caisse** : trésorerie syndicale ou patronale. Plus haute après les
 *   grandes lois de financement (Auroux, formation continue).
 * - **santeSociale** : tissu social. Très bas dans les périodes de crise
 *   (Crise pétrolière, Plan Juppé, ordonnances Macron).
 * - **confiance** : la base te suit-elle ? Variable selon l'unité du
 *   moment.
 */

import type { EraId, Resources } from '../types';

/** Preset de ressources par ère pour le mode pédagogique.
 *  La preset 'revolution' correspond exactement à `freshResources()`
 *  (état par défaut tour 1) — c'est l'identité du démarrage normal. */
export const ERA_START_PRESETS: Record<EraId, Resources> = {
  /* T1 — 1789. Décret d'Allarde, Le Chapelier. Le syndicalisme n'existe
     pas légalement. Institutions paritaires : néant. */
  revolution: {
    confiance: 50,
    caisse: 40,
    santeSociale: 60,
    legitimite: 40,
    rapportDeForce: 30,
    cohesionInterne: 50,
    institution: 20
  },

  /* T4 — 1800-1900. Ligues clandestines, Canuts, Ollivier 1864 (droit
     de coalition), Waldeck-Rousseau 1884 (légalisation des syndicats).
     Institutions paritaires balbutiantes : prud'hommes restaurés 1806. */
  xixe: {
    confiance: 45,
    caisse: 30,
    santeSociale: 45,
    legitimite: 35,
    rapportDeForce: 35,
    cohesionInterne: 45,
    institution: 22
  },

  /* T14 — 1900-1914. CGT (1895), Charte d'Amiens (1906). Syndicalisme
     révolutionnaire indépendant des partis. Institutions encore peu
     paritaires. */
  belle_epoque: {
    confiance: 50,
    caisse: 35,
    santeSociale: 45,
    legitimite: 45,
    rapportDeForce: 50,
    cohesionInterne: 55,
    institution: 28
  },

  /* T17 — 1919-1939. Conventions collectives 1919. Front populaire 1936.
     Matignon : congés payés, 40h, conventions étendues. Pic du rapport
     de force ouvrier. */
  entre_deux_guerres: {
    confiance: 55,
    caisse: 35,
    santeSociale: 50,
    legitimite: 55,
    rapportDeForce: 65,
    cohesionInterne: 60,
    institution: 35
  },

  /* T23 — 1944-1947. Programme du CNR « Les Jours heureux ». Ordonnances
     Sécu 1945. CGT unitaire (avant scission). Apogée légitimité syndicale. */
  reconstruction: {
    confiance: 65,
    caisse: 45,
    santeSociale: 55,
    legitimite: 70,
    rapportDeForce: 60,
    cohesionInterne: 70,
    institution: 50
  },

  /* T25 — 1947-1958. Scission CGT/FO 1947-48. Constitution de FO. Deux
     confédérations rivales. Cohésion interne ébranlée. */
  guerre_froide: {
    confiance: 55,
    caisse: 40,
    santeSociale: 50,
    legitimite: 55,
    rapportDeForce: 45,
    cohesionInterne: 50,
    institution: 50
  },

  /* T29 — 1958-1973. Unédic 1958, Jeanneney 1967, Grenelle 1968. Apogée
     du paritarisme. Institutions à leur sommet. */
  trente_glorieuses: {
    confiance: 60,
    caisse: 55,
    santeSociale: 65,
    legitimite: 60,
    rapportDeForce: 60,
    cohesionInterne: 55,
    institution: 65
  },

  /* T35 — 1973-1981. Crise pétrolière. Chômage de masse. Patronat cherche
     à réduire les coûts paritaires. Tissu social en chute. */
  crise: {
    confiance: 50,
    caisse: 40,
    santeSociale: 35,
    legitimite: 50,
    rapportDeForce: 45,
    cohesionInterne: 50,
    institution: 60
  },

  /* T37 — 1981-1995. Lois Auroux 1982 (4 lois). Abstention massive 1983.
     Cohabitations, désengagement progressif de l'État. */
  mitterrand: {
    confiance: 50,
    caisse: 50,
    santeSociale: 40,
    legitimite: 45,
    rapportDeForce: 40,
    cohesionInterne: 45,
    institution: 60
  },

  /* T45 — 1995. Plan Juppé : sursaut massif. 35h Aubry 1998. Refondation
     sociale MEDEF Seillière 1999. */
  cohabitations: {
    confiance: 55,
    caisse: 45,
    santeSociale: 35,
    legitimite: 50,
    rapportDeForce: 55,
    cohesionInterne: 45,
    institution: 60
  },

  /* T57 — 2007. Loi Larcher. Reprise étatique de la formation
     professionnelle. Le paritarisme commence à s'éroder. */
  sarkozy: {
    confiance: 45,
    caisse: 45,
    santeSociale: 35,
    legitimite: 40,
    rapportDeForce: 35,
    cohesionInterne: 40,
    institution: 58
  },

  /* T63 — 2012-2017. Loi El Khomri 2016. Premières inversions de la
     hiérarchie des normes. Hostilité de la rue. */
  hollande: {
    confiance: 45,
    caisse: 40,
    santeSociale: 30,
    legitimite: 40,
    rapportDeForce: 40,
    cohesionInterne: 40,
    institution: 55
  },

  /* T69 — 2017. Ordonnances Macron, CSE (fusion CE/DP/CHSCT), « lettre de
     cadrage » Unédic. Paritarisme fragilisé : institutions formelles
     toujours là, mais pression d'État. */
  macron_i: {
    confiance: 40,
    caisse: 40,
    santeSociale: 30,
    legitimite: 35,
    rapportDeForce: 40,
    cohesionInterne: 40,
    institution: 55
  },

  /* T79 — 2022-2026. Réforme retraites 2023. Triple ponction
     Agirc-Arrco / Action Logement / Unédic. Mobilisation massive
     mais sans inversion. */
  macron_ii: {
    confiance: 45,
    caisse: 40,
    santeSociale: 25,
    legitimite: 40,
    rapportDeForce: 50,
    cohesionInterne: 45,
    institution: 55
  },

  /* T91 — 2026 →. Bras de fer en cours. Le paritarisme à la croisée
     des chemins. */
  present: {
    confiance: 45,
    caisse: 40,
    santeSociale: 30,
    legitimite: 40,
    rapportDeForce: 45,
    cohesionInterne: 45,
    institution: 55
  }
};

/** Renvoie la preset de ressources pour une ère donnée. */
export function presetForEra(eraId: EraId): Resources {
  return { ...ERA_START_PRESETS[eraId] };
}
