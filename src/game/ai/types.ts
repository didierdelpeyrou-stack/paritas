export type StateStrategyId =
  | 'mediation'
  | 'decret'
  | 'repression'
  | 'cooptation'
  | 'cadrage_budgetaire'
  | 'temporisation';

export type OpponentStrategyId =
  | 'compromis_limite'
  | 'division'
  | 'campagne_media'
  | 'juridicisation'
  | 'ligne_dure'
  | 'deplacement_production';

/** Faction dominante à l'État. Activée à partir de la Ve République (~tour 25). */
export type StateFaction = 'unitaire' | 'bercy' | 'travail' | 'elysee';

/** Phase de cycle politique. Sert à arbitrer entre factions. */
export type PoliticalCycle =
  | 'pre_election'
  | 'post_election'
  | 'mid_term'
  | 'pre_plfss'
  | 'fin_mandat';

export interface WorldStrategy<TId extends string> {
  id: TId;
  label: string;
  intensity: number;
  signal: string;
}

export interface StateWorldStrategy extends WorldStrategy<StateStrategyId> {
  /** Quelle faction interne pousse cette stratégie. */
  faction: StateFaction;
  /** Phase de cycle politique au moment où l'État tranche. */
  cycle: PoliticalCycle;
}

export interface WorldAIState {
  state: StateWorldStrategy;
  opponent: WorldStrategy<OpponentStrategyId>;
  lastSignals: string[];
}
