/**
 * À partir des deltas d'un choix, génère 1 à 3 phrases concrètes qui
 * traduisent l'abstrait (« +5 confiance ») en matériel (« 380 cartes
 * neuves dans le bassin minier »). Les chiffres sont déterministes,
 * dérivés du delta + de l'id du choix, pour que la même décision
 * produise toujours le même rendu.
 */

import type { Camp } from '../../lib/types';
import type { Choice, ResourceKey } from '../types';

interface MeasureContext {
  camp: Camp;
  choice: Choice;
  era: string;
  /** Année historique au tour courant (ou null pour les ères pré-modernes). */
  year: number | null;
}

type Sign = 'plus' | 'minus';

function pickPhrase(
  resource: ResourceKey,
  sign: Sign,
  amount: number,
  ctx: MeasureContext
): string | null {
  const ag = (n: number) => Math.max(1, Math.round(n));
  const q = (factor: number) => ag(amount * factor);

  switch (resource) {
    case 'caisse':
      return sign === 'plus'
        ? ctx.camp === 'salarie'
          ? `${q(220).toLocaleString('fr-FR')} francs versés au fonds de solidarité.`
          : `${q(420).toLocaleString('fr-FR')} francs collectés auprès des fédérations.`
        : ctx.camp === 'salarie'
          ? `Les caisses de secours s'allègent de ${q(180).toLocaleString('fr-FR')} francs.`
          : `Les comptes accusent ${q(280).toLocaleString('fr-FR')} francs en moins.`;

    case 'confiance':
      return sign === 'plus'
        ? ctx.camp === 'salarie'
          ? `${q(70)} cartes neuves signées dans le bassin minier.`
          : `${q(40)} chefs d'entreprise réaffirment leur soutien.`
        : ctx.camp === 'salarie'
          ? `${q(55)} adhérents ne renouvellent pas leur cotisation.`
          : `${q(30)} fédérations envoient une note d'inquiétude.`;

    case 'rapportDeForce':
      return sign === 'plus'
        ? ctx.camp === 'salarie'
          ? `Préavis de grève déposé sur ${q(2)} sites.`
          : `Lock-out menacé sur ${q(2)} usines.`
        : `Le service d'ordre se réduit, ${q(15)} militants se retirent.`;

    case 'institution':
      return sign === 'plus'
        ? ctx.year !== null && ctx.year >= 1945
          ? `Un siège supplémentaire dans la commission paritaire.`
          : `Un nouveau règlement intérieur enregistré au greffe.`
        : `Une commission paritaire suspendue jusqu'à nouvel ordre.`;

    case 'legitimite':
      return sign === 'plus'
        ? ctx.year !== null && ctx.year >= 1900
          ? `Le Petit Journal titre en faveur du mouvement.`
          : `Trois feuilles de chou reprennent l'argument.`
        : `Un éditorial du grand quotidien retourne le récit.`;

    case 'santeSociale':
      return sign === 'plus'
        ? `Les médecins de quartier rouvrent leurs consultations gratuites.`
        : `${q(40)} familles attendent au bureau de secours.`;
  }
}

export function composeConcreteMeasures(
  state: { camp: Camp; era: string; turn: number },
  choice: Choice,
  yearForTurn: number | null
): string[] {
  const deltas = choice.effects.resources;
  if (!deltas) return [];

  const ctx: MeasureContext = {
    camp: state.camp,
    choice,
    era: state.era,
    year: yearForTurn
  };

  /* Trie par amplitude décroissante, ne garde que les deltas
     significatifs (≥ 4 en valeur absolue) — sinon on noie l'écran. */
  const significant = (Object.entries(deltas) as Array<[ResourceKey, number]>)
    .filter(([, v]) => typeof v === 'number' && Math.abs(v) >= 4)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3);

  return significant
    .map(([resource, value]) =>
      pickPhrase(resource, value > 0 ? 'plus' : 'minus', Math.abs(value), ctx)
    )
    .filter((p): p is string => p !== null);
}
