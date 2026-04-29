/* Paritas — 4 âges des luttes sociales et du paritarisme (100 tours) */

export interface Era {
  id: number;
  name: string;
  arc: string;
  turns: [number, number];
  cinematic: string;
}

export const ERAS: Era[] = [
  { id: 0, name: 'Avant la première révolution industrielle', arc: "L'arc des coalitions interdites", turns: [1, 18],
    cinematic: "1791-1830. Le Chapelier interdit les coalitions, mais les premières solidarités ouvrières survivent dans les mutuelles, les compagnonnages et les sociétés clandestines." },
  { id: 1, name: 'Première révolution industrielle', arc: "L'arc des insurrections ouvrières", turns: [19, 42],
    cinematic: "1831-1870. La fabrique, la mine et le rail font naître un monde ouvrier concentré : les Canuts, les coalitions et les premières chambres professionnelles inventent le rapport de force moderne." },
  { id: 2, name: 'Deuxième révolution industrielle', arc: "L'arc du syndicalisme légal", turns: [43, 72],
    cinematic: "1884-1968. Les syndicats deviennent légaux, les conventions collectives s'installent, la Sécurité sociale et l'assurance chômage donnent au paritarisme ses grandes institutions." },
  { id: 3, name: 'Troisième révolution industrielle', arc: "L'arc du dialogue social recomposé", turns: [73, 100],
    cinematic: "Depuis les années 1970. Formation continue, lois Auroux, assurance chômage, représentativité, CSE et retraites : le paritarisme affronte la mondialisation, le numérique et les crises de légitimité." }
];

export function eraForTurn(turn: number): Era {
  for (const e of ERAS) if (turn >= e.turns[0] && turn <= e.turns[1]) return e;
  return ERAS[ERAS.length - 1]!;
}
