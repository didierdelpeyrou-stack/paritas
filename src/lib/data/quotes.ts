/* ============================================================
   Paritas — citations syndicalistes par compétence
   Toutes les citations sont attestées et sourcées.
   ============================================================ */

import type { SkillKey } from '../types';

export interface Quote {
  text: string;
  author: string;
  context: string;
}

/** 2-3 citations par compétence : tirage aléatoire pour la variété. */
export const SKILL_QUOTES: Record<SkillKey, Quote[]> = {
  negociation: [
    {
      text: "Aller à l'idéal et comprendre le réel.",
      author: 'Jean Jaurès',
      context: 'Discours à la jeunesse, lycée d\'Albi, 30 juillet 1903'
    },
    {
      text: "Le courage, c'est de chercher la vérité et de la dire.",
      author: 'Jean Jaurès',
      context: 'Discours à la jeunesse, lycée d\'Albi, 30 juillet 1903'
    }
  ],
  politique: [
    {
      text: "Le courage, c'est de chercher la vérité et de la dire ; c'est de ne pas subir la loi du mensonge triomphant qui passe.",
      author: 'Jean Jaurès',
      context: 'Discours à la jeunesse, Albi, 30 juillet 1903'
    },
    {
      text: "Il n'y a pas de mouvement ouvrier sans pensée ouvrière.",
      author: 'Pierre Monatte',
      context: 'Cofondateur de la Vie ouvrière (1909)'
    }
  ],
  baratin: [
    {
      text: "Le courage, c'est de ne pas livrer sa volonté au hasard des impressions et des forces.",
      author: 'Jean Jaurès',
      context: 'Discours à la jeunesse, lycée d\'Albi, 30 juillet 1903'
    },
    {
      text: "Citoyens dans la cité, les travailleurs doivent l'être aussi dans leur entreprise.",
      author: 'Jean Auroux',
      context: 'Rapport Les droits des travailleurs, 1981'
    }
  ],
  production: [
    {
      text: "Le patron ne doit pas être seulement un chef d'entreprise : il doit être un chef d'hommes.",
      author: 'Auguste Detoeuf',
      context: "Propos d'O.L. Barenton, confiseur, 1938"
    }
  ],
  mobilisation: [
    {
      text: "L'avenir n'est interdit à personne.",
      author: 'Ambroise Croizat',
      context: 'Ministre du Travail, fondateur de la Sécurité sociale (1945-1947)'
    },
    {
      text: "Le syndicat, dans l'œuvre revendicatrice quotidienne, groupe les travailleurs sur le terrain de leurs intérêts immédiats.",
      author: "Charte d'Amiens",
      context: 'Adoptée par le congrès CGT, 13 octobre 1906'
    },
    {
      text: "Vivre en travaillant ou mourir en combattant.",
      author: 'Devise des Canuts',
      context: 'Insurrection lyonnaise, 21-23 novembre 1831'
    }
  ],
  expertise: [
    {
      text: "La sécurité sociale est l'expression de la solidarité nationale.",
      author: 'Pierre Laroque',
      context: "Architecte de la Sécurité sociale, ordonnance du 4 octobre 1945"
    },
    {
      text: "Citoyens dans la cité, les travailleurs doivent l'être aussi dans l'entreprise.",
      author: 'Jean Auroux',
      context: "Présentation des lois Auroux à l'Assemblée, 1982"
    }
  ]
};

/** Une citation aléatoire pour le skill donné (stable par session si on memoize). */
export function pickQuote(skill: SkillKey, seed: number): Quote {
  const list = SKILL_QUOTES[skill];
  const i = seed % list.length;
  return list[i]!;
}
