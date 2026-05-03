/* ============================================================
   Paritas Cockpit — bibliothèque d'icônes SVG paritaires
   ============================================================
   Pictogrammes monochromes (currentColor) inspirés de l'univers
   syndical et paritaire français. Format viewBox 0 0 24 24, traits
   2px, optimisés pour 16-32 px.

   Direction artistique (panel V2 §9.13) :
   - Sobriété stricte (Vignelli #8)
   - Lisibilité immédiate (Norman #11, Nielsen #12)
   - Reconnaissance sémantique (Cooper #13 — modèle mental
     syndicaliste-paritarisme)
   - Compatibilité currentColor (Brad Frost #190 — design system)

   Chaque icône = un référent direct du paritarisme :
   - sceau     → cachet de cire d'un accord (paritarisme = signature)
   - urne      → vote interne (mandat, congrès)
   - carte     → carte syndicale (adhérent, mémoire collective)
   - hexagone  → carte de France stylisée (déploiement régional)
   - poing     → mobilisation, manifestation
   - pupitre   → tribune publique, meeting
   - balance   → justice sociale, droit du travail
   - epis      → blé / épis (symbolique CGT historique, social)
   - bourse    → fronton Bourse du Travail
   - plume     → signature, engagement écrit
   - rouage    → industrie, paritarisme institutionnel
   - parchemin → journal de partie, mémoire
   - cocarde   → reconnaissance, formation
   ============================================================ */

export type IconKey =
  | 'sceau'
  | 'urne'
  | 'carte'
  | 'hexagone'
  | 'poing'
  | 'pupitre'
  | 'balance'
  | 'epis'
  | 'bourse'
  | 'plume'
  | 'rouage'
  | 'parchemin'
  | 'cocarde'
  | 'horloge'
  | 'note'
  | 'masque'
  /* === Actions du moteur (vague β) === */
  | 'tract'
  | 'affiche'
  | 'petition'
  | 'delegation'
  | 'lockout'
  | 'recrutement'
  | 'boycott'
  | 'presse'
  | 'signature'
  | 'megaphone'
  | 'flamme'
  | 'porte'
  /* === Indicateurs de statut === */
  | 'alerte'
  | 'cle';

/** Path data SVG, viewBox 0 0 24 24, stroke="currentColor", fill optionnel.
 *  Pas de transformations dans le path : c'est le composant qui scale. */
export const ICONS: Record<IconKey, string> = {
  /* Sceau de cire — disque festonné, point central */
  sceau: `
    <circle cx="12" cy="12" r="7.5" fill="currentColor" opacity="0.18"/>
    <path d="M12 4 L13.2 6.2 L15.5 5.5 L15.2 8 L17.5 9 L15.8 10.8
             L17 13 L14.5 13.4 L14.5 16 L12.4 14.8 L12 17 L11.6 14.8
             L9.5 16 L9.5 13.4 L7 13 L8.2 10.8 L6.5 9 L8.8 8 L8.5 5.5
             L10.8 6.2 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <circle cx="12" cy="11" r="1.4" fill="currentColor"/>
  `,

  /* Urne de vote — boîte avec fente, bulletin qui dépasse */
  urne: `
    <rect x="5" y="9" width="14" height="11" rx="0.6" stroke="currentColor"
          stroke-width="1.6" fill="none"/>
    <line x1="9" y1="6.5" x2="15" y2="6.5" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <rect x="11" y="2.5" width="2" height="6" rx="0.3" fill="currentColor"/>
    <line x1="5.5" y1="14" x2="18.5" y2="14" stroke="currentColor"
          stroke-width="1" opacity="0.45"/>
  `,

  /* Carte syndicale — rectangle avec bandeau + ruban */
  carte: `
    <rect x="3.5" y="6" width="17" height="12" rx="1.2" stroke="currentColor"
          stroke-width="1.6" fill="none"/>
    <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" stroke="currentColor"
          stroke-width="1.6"/>
    <line x1="6" y1="13" x2="13" y2="13" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <line x1="6" y1="15.5" x2="11" y2="15.5" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>
    <circle cx="17" cy="14.5" r="2" stroke="currentColor"
          stroke-width="1.2" fill="none"/>
  `,

  /* Hexagone (carte de France stylisée) */
  hexagone: `
    <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z"
          stroke="currentColor" stroke-width="1.6" fill="none"
          stroke-linejoin="round"/>
    <circle cx="12" cy="9" r="0.9" fill="currentColor"/>
    <circle cx="9" cy="13" r="0.9" fill="currentColor"/>
    <circle cx="15" cy="13" r="0.9" fill="currentColor"/>
    <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
  `,

  /* Poing levé — pictogramme silhouette */
  poing: `
    <path d="M9 11 L9 5.5 Q9 4.5 10 4.5 Q11 4.5 11 5.5 L11 9
             L11 5 Q11 4 12 4 Q13 4 13 5 L13 9
             L13 5.5 Q13 4.5 14 4.5 Q15 4.5 15 5.5 L15 10
             L15 7.5 Q15 6.5 16 6.5 Q17 6.5 17 7.5 L17 13
             Q17 19 12 19 Q7 19 7 14 L7 12 Q7 11 8 11 L9 11 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
  `,

  /* Pupitre — tribune avec micro */
  pupitre: `
    <path d="M6 19 L6 11 L18 11 L18 19" stroke="currentColor"
          stroke-width="1.6" fill="none" stroke-linejoin="round"/>
    <line x1="4.5" y1="19" x2="19.5" y2="19" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <line x1="12" y1="11" x2="12" y2="6" stroke="currentColor"
          stroke-width="1.4"/>
    <ellipse cx="12" cy="4.5" rx="1.6" ry="2.2" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <line x1="9.5" y1="14" x2="14.5" y2="14" stroke="currentColor"
          stroke-width="1" opacity="0.5"/>
  `,

  /* Balance — justice sociale */
  balance: `
    <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <path d="M4 7 L1.5 12 L6.5 12 Z" stroke="currentColor"
          stroke-width="1.4" fill="none" stroke-linejoin="round"/>
    <path d="M20 7 L17.5 12 L22.5 12 Z" stroke="currentColor"
          stroke-width="1.4" fill="none" stroke-linejoin="round"/>
  `,

  /* Épis de blé — symbolique CGT/social */
  epis: `
    <line x1="12" y1="20" x2="12" y2="6" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <path d="M12 7 Q9 7.5 8.5 10 Q11 9.5 12 10
             M12 9 Q9 9.5 8.5 12 Q11 11.5 12 12
             M12 11 Q9 11.5 8.5 14 Q11 13.5 12 14
             M12 7 Q15 7.5 15.5 10 Q13 9.5 12 10
             M12 9 Q15 9.5 15.5 12 Q13 11.5 12 12
             M12 11 Q15 11.5 15.5 14 Q13 13.5 12 14"
          stroke="currentColor" stroke-width="1.2" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 6 Q10 4.5 9.5 3 Q11 4.5 12 5
             M12 6 Q14 4.5 14.5 3 Q13 4.5 12 5"
          stroke="currentColor" stroke-width="1.2" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
  `,

  /* Bourse du Travail — fronton à colonnes */
  bourse: `
    <path d="M3 9 L12 3.5 L21 9" stroke="currentColor" stroke-width="1.6"
          fill="none" stroke-linejoin="round"/>
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor"
          stroke-width="1.6"/>
    <line x1="6" y1="9" x2="6" y2="18" stroke="currentColor"
          stroke-width="1.4"/>
    <line x1="10" y1="9" x2="10" y2="18" stroke="currentColor"
          stroke-width="1.4"/>
    <line x1="14" y1="9" x2="14" y2="18" stroke="currentColor"
          stroke-width="1.4"/>
    <line x1="18" y1="9" x2="18" y2="18" stroke="currentColor"
          stroke-width="1.4"/>
    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <line x1="3" y1="20.5" x2="21" y2="20.5" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
  `,

  /* Plume d'oie — signature */
  plume: `
    <path d="M5 19 L9 15 M9 15 Q12 12 15 9 Q18 6 19.5 4.5
             Q19 7 17 9.5 Q15 12 12 14 Q10 16 9 15 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round" stroke-linecap="round"/>
    <line x1="11.5" y1="11.5" x2="13.5" y2="13.5" stroke="currentColor"
          stroke-width="1" opacity="0.5"/>
    <line x1="13.5" y1="9.5" x2="15.5" y2="11.5" stroke="currentColor"
          stroke-width="1" opacity="0.5"/>
  `,

  /* Rouage — industrie / institution */
  rouage: `
    <path d="M12 4 L13 6 L15.2 5.2 L15.5 7.5 L17.8 7.8 L17 10
             L19 11 L17 12 L17.8 14.2 L15.5 14.5 L15.2 16.8 L13 16
             L12 18 L11 16 L8.8 16.8 L8.5 14.5 L6.2 14.2 L7 12
             L5 11 L7 10 L6.2 7.8 L8.5 7.5 L8.8 5.2 L11 6 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <circle cx="12" cy="11" r="2.5" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
  `,

  /* Parchemin déroulé */
  parchemin: `
    <path d="M5 5 L18 5 Q19.5 5 19.5 7 Q19.5 9 18 9 L17 9
             L17 17 Q17 19 18 19 L7 19 Q5 19 5 17 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <path d="M18 5 Q16.5 5 16.5 7 Q16.5 9 18 9"
          stroke="currentColor" stroke-width="1.4" fill="none"/>
    <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round"/>
    <line x1="8" y1="14.5" x2="14" y2="14.5" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
    <line x1="8" y1="17" x2="11" y2="17" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
  `,

  /* Cocarde tricolore stylisée — formation, reconnaissance */
  cocarde: `
    <circle cx="12" cy="11" r="6.5" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <circle cx="12" cy="11" r="4" stroke="currentColor"
          stroke-width="1.2" fill="none" opacity="0.7"/>
    <circle cx="12" cy="11" r="1.6" fill="currentColor"/>
    <path d="M9 16.5 L7.5 21 L10 19 L12 21.5 L14 19 L16.5 21 L15 16.5"
          stroke="currentColor" stroke-width="1.2" fill="none"
          stroke-linejoin="round"/>
  `,

  /* Horloge analogique simple */
  horloge: `
    <circle cx="12" cy="12" r="8" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <line x1="12" y1="12" x2="12" y2="7" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <line x1="12" y1="12" x2="15.5" y2="12" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="0.7" fill="currentColor"/>
  `,

  /* Note de musique (toggle audio) */
  note: `
    <path d="M9 19 Q9 17 11 17 Q13 17 13 19 Q13 21 11 21
             Q9 21 9 19 Z M13 6 L13 17"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <path d="M13 6 Q17 6 18 9 Q17 8 13 8 Z"
          stroke="currentColor" stroke-width="1.4" fill="currentColor"/>
  `,

  /* Masque de théâtre — Honte/Fierté Ernaux */
  masque: `
    <ellipse cx="12" cy="11" rx="7" ry="8" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <circle cx="9.5" cy="10" r="0.9" fill="currentColor"/>
    <circle cx="14.5" cy="10" r="0.9" fill="currentColor"/>
    <path d="M9 14.5 Q12 17 15 14.5" stroke="currentColor"
          stroke-width="1.4" fill="none" stroke-linecap="round"/>
  `,

  /* === Actions du moteur (vague β) === */

  /* Tract — feuille pliée avec lignes */
  tract: `
    <path d="M6 4 L17 4 Q19 4 19 6 L19 19 Q19 20.5 17.5 20.5 L8 20.5
             Q6 20.5 6 18.5 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <path d="M6 4 L8 6 L6 8" stroke="currentColor"
          stroke-width="1.2" fill="none" stroke-linejoin="round"/>
    <line x1="9" y1="9" x2="16" y2="9" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round"/>
    <line x1="9" y1="12" x2="16" y2="12" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round"/>
    <line x1="9" y1="15" x2="14" y2="15" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  `,

  /* Affiche — rectangle avec punaises et titre stylisé */
  affiche: `
    <rect x="4.5" y="4.5" width="15" height="15" rx="0.4"
          stroke="currentColor" stroke-width="1.4" fill="none"/>
    <circle cx="6" cy="6" r="0.7" fill="currentColor"/>
    <circle cx="18" cy="6" r="0.7" fill="currentColor"/>
    <circle cx="6" cy="18" r="0.7" fill="currentColor"/>
    <circle cx="18" cy="18" r="0.7" fill="currentColor"/>
    <line x1="7.5" y1="9" x2="16.5" y2="9" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <line x1="7.5" y1="12" x2="14" y2="12" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round"/>
    <line x1="7.5" y1="14.5" x2="13" y2="14.5" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
    <line x1="7.5" y1="17" x2="11" y2="17" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
  `,

  /* Pétition — feuille avec lignes de signatures */
  petition: `
    <path d="M5 3.5 L17 3.5 Q18.5 3.5 18.5 5 L18.5 20.5 L5.5 20.5
             Q4 20.5 4 19 L4 5 Q4 3.5 5 3.5 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <line x1="7" y1="7" x2="15.5" y2="7" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round"/>
    <path d="M7 10 Q9 9 10 10 Q11 11 12 10 Q13 9 14.5 10"
          stroke="currentColor" stroke-width="1" fill="none"
          stroke-linecap="round" opacity="0.85"/>
    <path d="M7 13 Q9 12 10 13 Q11 14 12 13 Q13 12 15 13"
          stroke="currentColor" stroke-width="1" fill="none"
          stroke-linecap="round" opacity="0.7"/>
    <path d="M7 16 Q9 15 10.5 16 Q12 17 13.5 16"
          stroke="currentColor" stroke-width="1" fill="none"
          stroke-linecap="round" opacity="0.55"/>
    <path d="M7 19 Q8.5 18 10 19" stroke="currentColor"
          stroke-width="1" fill="none" stroke-linecap="round" opacity="0.35"/>
  `,

  /* Délégation — 3 silhouettes en marche */
  delegation: `
    <circle cx="6" cy="7" r="1.6" stroke="currentColor"
          stroke-width="1.3" fill="none"/>
    <path d="M4.5 12 Q6 10 7.5 12 L7.5 16 L6.5 16 L6.5 19
             L5.5 19 L5.5 16 L4.5 16 Z"
          stroke="currentColor" stroke-width="1.3" fill="none"
          stroke-linejoin="round"/>
    <circle cx="12" cy="6.5" r="1.7" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <path d="M10 12 Q12 9.5 14 12 L14 16.5 L13 16.5 L13 20
             L11 20 L11 16.5 L10 16.5 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <circle cx="18" cy="7" r="1.6" stroke="currentColor"
          stroke-width="1.3" fill="none"/>
    <path d="M16.5 12 Q18 10 19.5 12 L19.5 16 L18.5 16 L18.5 19
             L17.5 19 L17.5 16 L16.5 16 Z"
          stroke="currentColor" stroke-width="1.3" fill="none"
          stroke-linejoin="round"/>
  `,

  /* Lock-out — porte avec cadenas */
  lockout: `
    <rect x="5" y="6" width="14" height="14" rx="0.4"
          stroke="currentColor" stroke-width="1.4" fill="none"/>
    <line x1="5" y1="9.5" x2="19" y2="9.5" stroke="currentColor"
          stroke-width="1" opacity="0.55"/>
    <rect x="9.5" y="11" width="5" height="6" rx="0.4"
          stroke="currentColor" stroke-width="1.4" fill="none"/>
    <path d="M10.5 11 L10.5 9.5 Q10.5 7.5 12 7.5 Q13.5 7.5 13.5 9.5 L13.5 11"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <circle cx="12" cy="14" r="0.7" fill="currentColor"/>
    <line x1="12" y1="14" x2="12" y2="15.5" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round"/>
  `,

  /* Recrutement — silhouette avec + */
  recrutement: `
    <circle cx="10" cy="7" r="2.4" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <path d="M5 18 Q5 13 10 13 Q15 13 15 18"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linecap="round"/>
    <circle cx="17.5" cy="16.5" r="3.5" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <line x1="17.5" y1="14.8" x2="17.5" y2="18.2" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <line x1="15.8" y1="16.5" x2="19.2" y2="16.5" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
  `,

  /* Boycott — cercle barré */
  boycott: `
    <circle cx="12" cy="12" r="8.5" stroke="currentColor"
          stroke-width="1.6" fill="none"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="9.5" cy="10" r="1" fill="currentColor"/>
    <circle cx="14.5" cy="14" r="1" fill="currentColor"/>
  `,

  /* Presse — colonne de journal pliée */
  presse: `
    <rect x="4" y="5" width="13" height="14" rx="0.3"
          stroke="currentColor" stroke-width="1.4" fill="none"/>
    <rect x="17" y="8" width="3" height="11" rx="0.3"
          stroke="currentColor" stroke-width="1.3" fill="none" opacity="0.7"/>
    <line x1="6" y1="8" x2="15" y2="8" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <line x1="6" y1="11" x2="15" y2="11" stroke="currentColor"
          stroke-width="1" stroke-linecap="round" opacity="0.7"/>
    <line x1="6" y1="13" x2="15" y2="13" stroke="currentColor"
          stroke-width="1" stroke-linecap="round" opacity="0.7"/>
    <line x1="6" y1="15" x2="13" y2="15" stroke="currentColor"
          stroke-width="1" stroke-linecap="round" opacity="0.5"/>
    <line x1="6" y1="17" x2="11" y2="17" stroke="currentColor"
          stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  `,

  /* Signature — main qui signe avec stylo */
  signature: `
    <path d="M3 18 Q5 16 7 17 Q9 18 11 16 Q13 14 15 15 Q17 16 19 14"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linecap="round"/>
    <line x1="3" y1="20.5" x2="20" y2="20.5" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
    <path d="M16 6 L18.5 8.5 L13 14 L10 14 L10 11 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <line x1="14.5" y1="7.5" x2="17" y2="10" stroke="currentColor"
          stroke-width="1" opacity="0.5"/>
  `,

  /* Mégaphone — appel à mobilisation */
  megaphone: `
    <path d="M3 14 L3 10 L11 7 L11 17 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <path d="M11 7 L11 17 L17 19 L17 5 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <line x1="5" y1="14" x2="5" y2="20" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <line x1="7" y1="14" x2="7" y2="19" stroke="currentColor"
          stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
    <path d="M19 8 Q21 10 21 12 Q21 14 19 16"
          stroke="currentColor" stroke-width="1.2" fill="none"
          stroke-linecap="round" opacity="0.7"/>
  `,

  /* Flamme — symbole de tension/urgence */
  flamme: `
    <path d="M12 3 Q9 6 9 9 Q9 11 11 12 Q9 13 8 15 Q7 17 8 19
             Q9 21 12 21 Q15 21 16 19 Q17 17 16 15 Q15 13 13 12
             Q15 10 14 7 Q13 5 12 3 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round" stroke-linecap="round"/>
  `,

  /* Porte — entrée/sortie */
  porte: `
    <path d="M6 21 L6 4 L18 4 L18 21" stroke="currentColor"
          stroke-width="1.4" fill="none" stroke-linejoin="round"/>
    <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="14" cy="13" r="0.9" fill="currentColor"/>
  `,

  /* Alerte — triangle exclamation */
  alerte: `
    <path d="M12 4 L21 19 L3 19 Z"
          stroke="currentColor" stroke-width="1.4" fill="none"
          stroke-linejoin="round"/>
    <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="12" cy="16.5" r="0.9" fill="currentColor"/>
  `,

  /* Clé — déverrouillage */
  cle: `
    <circle cx="8" cy="12" r="3.5" stroke="currentColor"
          stroke-width="1.4" fill="none"/>
    <line x1="11" y1="12" x2="20" y2="12" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <line x1="17" y1="12" x2="17" y2="15" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
    <line x1="20" y1="12" x2="20" y2="14.5" stroke="currentColor"
          stroke-width="1.4" stroke-linecap="round"/>
  `
};
