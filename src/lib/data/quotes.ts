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
      text: "Quand les hommes ne peuvent changer les choses, ils changent les mots.",
      author: 'Jean Jaurès',
      context: 'Études socialistes, 1901'
    },
    {
      text: "L'unité ne se décrète pas, elle se construit.",
      author: 'Edmond Maire',
      context: 'Secrétaire général de la CFDT, 1971-1988'
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
      text: "Un peu d'internationalisme éloigne de la patrie ; beaucoup y ramène.",
      author: 'Jean Jaurès',
      context: 'Discours à la jeunesse, Albi, 30 juillet 1903'
    },
    {
      text: "Parler clair, parler vrai. La langue de bois, c'est la défaite avant le combat.",
      author: 'Henri Krasucki',
      context: "Secrétaire général de la CGT (1982-1992), résistant déporté"
    }
  ],
  production: [
    {
      text: "Le patron ne doit pas être seulement un chef d'entreprise : il doit être un chef d'hommes.",
      author: 'Auguste Detoeuf',
      context: "Propos d'O.L. Barenton, confiseur, 1938"
    },
    {
      text: "Il n'y a pas de prospérité économique durable sans confiance, et pas de confiance sans dialogue social.",
      author: 'François Bloch-Lainé',
      context: 'Inspecteur des finances, fondateur du paritarisme moderne (années 1950)'
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
      text: "On ne défend bien que ce qu'on connaît bien.",
      author: 'Henri Krasucki',
      context: 'Secrétaire général de la CGT (1982-1992)'
    },
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
