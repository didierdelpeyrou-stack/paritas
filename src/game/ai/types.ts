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

export interface WorldStrategy<TId extends string> {
  id: TId;
  label: string;
  intensity: number;
  signal: string;
}

export interface WorldAIState {
  state: WorldStrategy<StateStrategyId>;
  opponent: WorldStrategy<OpponentStrategyId>;
  lastSignals: string[];
}
