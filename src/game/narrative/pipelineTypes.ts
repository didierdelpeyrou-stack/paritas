export type PipelineId = 'institution' | 'rupture' | 'capture' | 'refondation' | 'declin';

export interface ActivePipeline {
  id: PipelineId;
  label: string;
  stage: number;
  pressure: number;
  lastTurn: number;
}
