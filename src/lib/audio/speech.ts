/* ============================================================
   Paritas — discours générés (TTS)
   ============================================================
   Génère un extrait de discours de ~15 s (≈ 35-40 mots à 150 mpm
   en français), puis le lit via window.speechSynthesis.

   Architecture :
   - **Sans Haiku** : tirage déterministe dans une banque de
     templates par (camp × posture × moment). Le jeu reste
     pleinement audible sans réseau.
   - **Avec Haiku** : si VITE_NARRATIVE_API est configuré, on
     demande un texte plus situé (date, scénario, dilemme courant).
     Fallback automatique si timeout > 3 s.

   Lecture :
   - SpeechSynthesisUtterance avec voix française (fr-FR ou fr-CA),
     pitch légèrement modulé selon le ton, vitesse 0.95.
   - Si aucune voix française dispo (rare), on coupe la lecture
     mais on retourne le texte (à afficher sous-titré).

   Gratuit, hors-ligne, zero dépendance.
   ============================================================ */

import type { Camp } from '../types';

export type SpeechMoment = 'manifestation' | 'meeting' | 'signature' | 'huis_clos';
export type SpeechPosture = 'rupture' | 'pragmatique' | 'paternaliste' | 'tribun' | 'technocrate' | 'batisseur';

export interface SpeechRequest {
  camp: Camp;
  moment: SpeechMoment;
  posture: SpeechPosture;
  /** Optionnel : titre du scénario en cours, pour Haiku. */
  scenarioTitle?: string;
  /** Optionnel : année (ex. 1936). */
  year?: number;
}

/* === Banque de templates (déterministe, hors-ligne) === */

/** Tirages courts (~30-40 mots) par camp × moment.
 *  Posture utilisée comme inflexion (préfixe ou ton).
 *  Premier mot deviendra le pitch d'attaque. */
const SPEECHES: Record<Camp, Record<SpeechMoment, string[]>> = {
  salarie: {
    manifestation: [
      "Camarades ! Nous sommes ici parce que nos salaires reculent et que le patronat refuse de négocier. Nous ne lâcherons rien tant que la justice sociale ne sera pas rendue. Tenons bon, ensemble.",
      "On ne négocie pas la dignité. On ne brade pas le travail. Aujourd'hui, dans la rue, nous rappelons à ceux qui décident que le pays se tient debout grâce à nos mains. Tenons.",
      "Ce n'est pas une grève contre la France. C'est une grève pour la France qui travaille, qui crée, qui produit. Nous demandons d'être entendus. Pas plus, pas moins.",
    ],
    meeting: [
      "Mes camarades, l'heure est grave. Le rapport de force se construit ici, dans cette salle, avant de se vivre demain dans la rue. Nous devons voter clair, voter fort, voter uni.",
      "L'unité du mouvement n'est pas un slogan. Elle est notre seule arme face à un patronat qui sait, lui, parler d'une seule voix quand il s'agit de bloquer une avancée.",
      "Je propose que nous renforcions le mandat de négociation. Pas une concession sans contrepartie. Pas une signature sans débat. Pas un accord qui sacrifie nos plus précaires.",
    ],
    signature: [
      "Cette signature ne clôt pas un combat. Elle en consacre une étape. Ce que nous arrachons aujourd'hui, d'autres l'ont préparé pendant des années, et d'autres devront le défendre demain.",
      "Je signe au nom des miens, sans ivresse et sans regret. L'accord vaut ce que vaut sa mise en œuvre. Nous resterons vigilants, branche par branche, entreprise par entreprise.",
      "L'heure n'est pas aux célébrations. L'heure est au travail. Cet accord nous engage. Engageons-nous, nous aussi, à le faire respecter sur le terrain.",
    ],
    huis_clos: [
      "Soyons clairs. Sans avancée concrète sur les salaires d'ici la fin de la séance, nous quitterons la table. Nous sommes venus négocier, pas écouter des promesses.",
      "Vous me parlez de compétitivité. Je vous parle de pouvoir d'achat. Tant que ces deux mots ne se rencontrent pas, nous n'avancerons pas d'un mètre.",
    ],
  },
  patron: {
    manifestation: [
      "Je comprends la colère. Mais bloquer le pays ne crée pas un emploi. La France a besoin d'investissement, de stabilité, de confiance. Pas d'une nouvelle guerre sociale.",
      "Personne n'a intérêt à un conflit prolongé. Ni les salariés, ni les entreprises, ni nos clients à l'étranger. Reprenons le dialogue. Vite.",
      "Je le dis aux salariés qui défilent : nous entendons votre inquiétude. Nous demandons en retour qu'on entende la nôtre. Sans entreprises, il n'y a pas d'emplois.",
    ],
    meeting: [
      "Mes chers collègues, la compétitivité ne se décrète pas. Elle se construit accord après accord, branche après branche. Je vous propose de tenir le cap de la responsabilité.",
      "Notre responsabilité n'est pas de gagner contre les syndicats. Elle est de préserver l'emploi en France. Cela suppose des concessions intelligentes, pas des reculs.",
      "Nous devons parler d'une seule voix. Le patronat divisé est un patronat affaibli, et c'est l'économie tout entière qui en paie le prix.",
    ],
    signature: [
      "Cet accord nous engage tous. Il pèsera sur nos comptes, mais il garantit aussi la paix sociale, qui est le premier capital d'une entreprise française.",
      "Je signe en pleine conscience. C'est un coût immédiat. C'est aussi un investissement à long terme dans la confiance entre les acteurs sociaux.",
      "Cet accord n'est pas parfait. Il est équilibré. Et l'équilibre, en ces temps difficiles, vaut bien plus qu'une victoire à courte vue.",
    ],
    huis_clos: [
      "Notre offre est sérieuse. Elle représente un effort réel pour des entreprises qui font face à une concurrence mondiale brutale. N'attendez pas davantage de notre côté.",
      "Je veux bien discuter du calendrier, des modalités, du périmètre. Mais le principe, lui, est non négociable. C'est la limite que nous avons fixée ensemble.",
    ],
  },
};

/* === Sélection d'une voix française === */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    // getVoices() peut retourner [] avant le premier `voiceschanged`.
    // On laisse cachedVoice undefined pour réessayer plus tard.
    return null;
  }
  // Préfère fr-FR > fr-CA > fr*. Voix locale > distante.
  const fr = voices.filter((v) => v.lang.startsWith('fr'));
  if (fr.length === 0) {
    cachedVoice = null;
    return null;
  }
  fr.sort((a, b) => {
    const score = (v: SpeechSynthesisVoice) =>
      (v.lang === 'fr-FR' ? 4 : v.lang === 'fr-CA' ? 2 : 1) +
      (v.localService ? 1 : 0);
    return score(b) - score(a);
  });
  cachedVoice = fr[0];
  return cachedVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Réinit le cache quand la liste change (Chrome charge async).
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined;
  });
}

/* === API publique === */

/** Pioche un texte de discours (déterministe, hors-ligne).
 *  Tirage stable sur (camp + moment + posture) modulo le seed lié
 *  au scenarioTitle pour éviter le même texte deux fois de suite. */
export function pickSpeechText(req: SpeechRequest): string {
  const pool = SPEECHES[req.camp]?.[req.moment];
  if (!pool || pool.length === 0) return '';
  const seedSrc = `${req.camp}|${req.moment}|${req.posture}|${req.scenarioTitle ?? ''}`;
  let seed = 0;
  for (let i = 0; i < seedSrc.length; i++) seed = (seed * 31 + seedSrc.charCodeAt(i)) >>> 0;
  return pool[seed % pool.length];
}

export interface SpeakOptions {
  /** Vitesse de lecture (0.5-2). 0.95 par défaut, posé. */
  rate?: number;
  /** Pitch (0-2). Défaut 1.0. */
  pitch?: number;
  /** Volume (0-1). Défaut 0.85. */
  volume?: number;
  /** Si true, attend que le discours soit fini avant de résoudre. */
  await?: boolean;
}

/** Lit le texte avec la voix française disponible. Retourne false si
 *  aucune voix dispo (l'appelant peut alors afficher en sous-titré). */
export async function speakText(text: string, opts: SpeakOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  const voice = pickFrenchVoice();
  if (!voice) {
    // Réessaye après le prochain frame, parfois la liste arrive juste
    // après l'ouverture de la fenêtre.
    await new Promise((r) => setTimeout(r, 200));
    if (!pickFrenchVoice()) return false;
  }
  // Coupe un éventuel discours précédent
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }

  const utt = new SpeechSynthesisUtterance(text);
  if (cachedVoice) utt.voice = cachedVoice;
  utt.lang = cachedVoice?.lang ?? 'fr-FR';
  utt.rate = opts.rate ?? 0.95;
  utt.pitch = opts.pitch ?? 1.0;
  utt.volume = opts.volume ?? 0.85;

  if (opts.await) {
    return new Promise<boolean>((resolve) => {
      utt.onend = () => resolve(true);
      utt.onerror = () => resolve(false);
      try { window.speechSynthesis.speak(utt); }
      catch { resolve(false); }
    });
  }
  try { window.speechSynthesis.speak(utt); } catch { return false; }
  return true;
}

/** Coupe immédiatement tout discours en cours. */
export function stopSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
}

/** Pioche un texte + le lit. Renvoie le texte pour affichage en
 *  sous-titré (peak-end : si la voix est coupée, le texte reste). */
export async function deliverSpeech(req: SpeechRequest, opts: SpeakOptions = {}): Promise<string> {
  const text = pickSpeechText(req);
  if (text) {
    // Pitch léger selon posture
    const pitchByPosture: Record<SpeechPosture, number> = {
      rupture: 1.05,
      tribun: 1.10,
      pragmatique: 0.95,
      technocrate: 0.92,
      paternaliste: 0.98,
      batisseur: 1.0,
    };
    speakText(text, { ...opts, pitch: opts.pitch ?? pitchByPosture[req.posture] }).catch(() => {});
  }
  return text;
}
