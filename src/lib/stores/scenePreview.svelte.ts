/* ============================================================
   Paritas — préfiguration sépia (V3, post-critique designer)
   ============================================================
   Quand le joueur survole un choix dans SceneCard, on imprègne
   le sky central d'une silhouette sépia qui préfigure la
   conséquence : un bras qui signe (institution), une foule qui
   se disperse (rupture), un télégraphe qui pulse (opinion)…

   Référence : critique designer §Manie 1 — « la grande dalle
   beige vide ». Transformer 40% de viewport gaspillée en
   respiration narrative.

   Pré-figuration, pas spoiler : silhouette abstraite + un mot
   en filigrane Cinzel qui dit la nature du choix.
   ============================================================ */

import type { Posture } from '../../game/narrative/choicePosture';

export interface ScenePreview {
  posture: Posture;
  /** Étiquette affichée en filigrane (« Compromis », « Rupture »…). */
  label: string;
  /** Texte d'intent du choix survolé — affiché plus discret en bas. */
  intent: string;
}

class ScenePreviewStore {
  current = $state<ScenePreview | null>(null);

  set(p: ScenePreview) {
    this.current = p;
  }

  clear() {
    this.current = null;
  }
}

export const scenePreview = new ScenePreviewStore();
