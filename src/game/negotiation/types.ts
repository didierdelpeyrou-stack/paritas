export type NegotiationActor = 'salaries' | 'employeurs' | 'etat';

/* AgentIntent — importé depuis ai-runtime V3, dupliqué ici pour autonomie */
export type AgentActor = 'etat' | 'adversaire' | 'opinion' | 'base' | 'factions';
export type AgentStrategy =
  | 'mediation' | 'decret' | 'repression' | 'temporisation'
  | 'compromis' | 'durcissement' | 'division' | 'communication';
export interface AgentIntent {
  actor: AgentActor;
  strategy: AgentStrategy;
  pressure: number;
  justification: string;
  confidence: number;
}

export interface Mandate {
  objectives: MandateObjective[];
  redLines: RedLine[];
  acceptableConcessions: Concession[];
  baseTransparency: 0 | 25 | 50 | 75 | 100;
  internalSupport: number;
}

export interface MandateObjective {
  id: string;
  label: string;
  priority: 1 | 2 | 3 | 4 | 5;
}

export interface RedLine {
  id: string;
  label: string;
  visibility: 'public' | 'internal' | 'secret';
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface Concession {
  id: string;
  label: string;
  cost: 1 | 2 | 3 | 4 | 5;
}

export interface NegotiationOffer {
  from: NegotiationActor;
  claims: string[];
  concessions: string[];
  framing: 'cooperation' | 'pressure' | 'legal' | 'public' | 'technical';
}

export interface AgreementQuality {
  materialGain: number;
  legalStrength: number;
  internalAcceptability: number;
  publicLegibility: number;
  durability: number;
}

export interface NegotiationOutcome {
  agreementId: string | null;
  ruptureReason: string | null;
  quality: AgreementQuality;
  learningSignals: string[];
}

