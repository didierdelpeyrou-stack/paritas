/* ============================================================
   Paritas — déclencheurs SFX par mots-clés du texte
   ============================================================
   Quand un scénario charge (titre + sous-titre + contexte
   historique + setup), on scanne le texte pour des familles de
   mots et on déclenche :

   - une COUCHE PAD continue (boucle long fade) — atmosphère :
     pluie, vent, foule lointaine, oiseaux, feu de cheminée
   - des ONE-SHOTS — réactions ponctuelles : cri, applaudissement,
     cloche

   Conçu comme un "moteur narratif sonore" : le texte du jeu pilote
   l'audio sans que l'auteur du contenu ait à tagger explicitement
   chaque scène. Si plus tard on ajoute des balises explicites au
   format `[sfx:crowd-cheer]`, on peut les ajouter ici.
   ============================================================ */

import type { SfxFileId } from './audio';

/** Famille de SFX pad (loop continu en fond, faible volume). */
export interface PadTrigger {
  id: SfxFileId;
  /** Patterns regex à matcher dans le texte. */
  patterns: RegExp[];
  /** Volume du pad (0-1, multiplié par sfxVol). */
  gain: number;
  /** Priorité — 0 = défaut. Si plusieurs match, on prend le plus haut. */
  priority?: number;
}

/** SFX one-shot déclenché ponctuellement. */
export interface OneShotTrigger {
  id: SfxFileId;
  patterns: RegExp[];
  gain: number;
  /** Délai avant lecture (ms). 0 = immédiat. Permet d'étaler les
   *  one-shots si plusieurs matchent. */
  delay?: number;
}

/* === Règles pad — atmosphère longue durée === */

export const PAD_TRIGGERS: PadTrigger[] = [
  {
    id: 'rain-storm',
    patterns: [
      /\borag(e|euse|euses|eux)\b/i,
      /\btonnerre\b/i,
      /\béclair(s)?\b/i,
      /\baverse(s)?\b/i,
    ],
    gain: 0.45,
    priority: 3,
  },
  {
    id: 'rain-soft',
    patterns: [
      /\bpluie\b/i, /\bpleut\b/i, /\bpleuvait\b/i,
      /\bgouttes?\b/i,
      /\bbruine\b/i,
    ],
    gain: 0.35,
    priority: 2,
  },
  {
    id: 'wind-leaves',
    patterns: [
      /\bvent\b/i, /\bvent(eux|euse)?\b/i,
      /\bbrise\b/i, /\bbourrasque\b/i,
      /\bforêt\b/i, /\bbois\b/i, /\bcampagne\b/i,
      /\bfeuilles?\b/i, /\bsous-bois\b/i,
    ],
    gain: 0.32,
    priority: 1,
  },
  {
    id: 'birds-morning',
    patterns: [
      /\baube\b/i, /\baurore\b/i, /\bmatin(ée)?\b/i,
      /\boiseau(x)?\b/i, /\bmésange(s)?\b/i, /\bchant des oiseaux\b/i,
      /\bjardin\b/i, /\bparc\b/i, /\bcampagne\b/i,
    ],
    gain: 0.28,
    priority: 1,
  },
  {
    id: 'fire-crackle',
    patterns: [
      /\bcheminée\b/i, /\bfeu de bois\b/i, /\bbraises?\b/i,
      /\bsalon\b/i, /\bbureau cossu\b/i,
      /\bhiver\b/i, /\bglacial\b/i,
    ],
    gain: 0.30,
    priority: 1,
  },
  {
    id: 'river-stream',
    patterns: [
      /\brivière\b/i, /\bruisseau\b/i, /\beau (qui )?coule\b/i,
      /\bcanal\b/i, /\bquai(s)?\b/i, /\bSeine\b/, /\bRhône\b/, /\bMeuse\b/,
      /\bport\b/i,
    ],
    gain: 0.30,
    priority: 1,
  },
  {
    id: 'distant-crowd',
    patterns: [
      /\bbruit de fond\b/i, /\bbrouhaha\b/i,
      /\bclient(s|èle)?\b/i, /\bcafé\b/i, /\bbar\b/i, /\bcantine\b/i,
      /\bgare\b/i, /\bmarché\b/i, /\bplace publique\b/i,
      /\bbanquet\b/i, /\bréception\b/i,
    ],
    gain: 0.40,
    priority: 1,
  },
];

/* === Règles one-shot — réactions ponctuelles === */

export const ONESHOT_TRIGGERS: OneShotTrigger[] = [
  // Cloche pour les moments solennels
  {
    id: 'church-bell',
    patterns: [
      /\bcloche(s)?\b/i, /\béglise\b/i, /\bcathédrale\b/i,
      /\benterrement\b/i, /\bobsèques\b/i, /\bservice religieux\b/i,
      /\bsonn(e|ent|ait|aient)\b/i,
    ],
    gain: 0.55,
  },
  // Applaudissements
  {
    id: 'applause-soft',
    patterns: [
      /\bapplaud\w+\b/i, /\bovation\b/i, /\bbravo(s)?\b/i,
      /\bsalut(s|ation)\b/i, /\bhommage\b/i,
    ],
    gain: 0.65,
    delay: 800,
  },
  // Cri de victoire
  {
    id: 'shout-victory',
    patterns: [
      /\bvictoire\b/i, /\bvictoire historique\b/i,
      /\b(le )?triomph(e|ant)\b/i,
      /\bvive (la|le)\b/i,
    ],
    gain: 0.5,
    delay: 400,
  },
  // Cri de colère
  {
    id: 'shout-anger',
    patterns: [
      /\b(en )?colère\b/i, /\bfurieux\b/i, /\bfureur\b/i,
      /\bhuée(s)?\b/i, /\bchahut(é|er)?\b/i, /\bcrié(s|e|es)?\b/i,
    ],
    gain: 0.45,
    delay: 200,
  },
  // Papier — discours/lettre
  {
    id: 'paper-rustle',
    patterns: [
      /\bdocument(s)?\b/i, /\blettre(s)?\b/i, /\bcahier(s)?\b/i,
      /\bpétition\b/i, /\bproclamation\b/i,
    ],
    gain: 0.4,
  },
];

/* === API === */

export interface TriggerResult {
  /** Pad à activer (ou null = stop tout pad). */
  pad: { id: SfxFileId; gain: number } | null;
  /** One-shots à déclencher (ordonnés par priorité). */
  oneshots: { id: SfxFileId; gain: number; delay: number }[];
}

/** Scanne le texte fourni et retourne les SFX à déclencher.
 *  Le texte concaténé (titre + sous-titre + contexte + setup) doit
 *  être passé d'un seul tenant — la recherche se fait globalement. */
export function analyzeText(text: string): TriggerResult {
  if (!text) return { pad: null, oneshots: [] };

  // Pad — on garde le matchant de plus haute priorité
  let bestPad: PadTrigger | null = null;
  for (const t of PAD_TRIGGERS) {
    if (t.patterns.some((re) => re.test(text))) {
      const cur = (bestPad?.priority ?? -1);
      const next = t.priority ?? 0;
      if (next > cur) bestPad = t;
    }
  }

  // One-shots — on garde tous ceux qui matchent (max 3 pour ne pas saturer)
  const oneshots: TriggerResult['oneshots'] = [];
  for (const t of ONESHOT_TRIGGERS) {
    if (t.patterns.some((re) => re.test(text))) {
      oneshots.push({ id: t.id, gain: t.gain, delay: t.delay ?? 0 });
    }
    if (oneshots.length >= 3) break;
  }

  return {
    pad: bestPad ? { id: bestPad.id, gain: bestPad.gain } : null,
    oneshots,
  };
}
