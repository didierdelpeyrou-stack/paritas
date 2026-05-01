/* Paritas — narrativeClient.ts
 * Contract for the optional Haiku-powered narrative enrichment service.
 *
 * The frontend NEVER holds the Anthropic API key. A serverless backend
 * (Cloudflare Worker, Vercel/Netlify Function, small Node server) is
 * expected to expose POST /api/narrative and forward the prompt to
 * Haiku. The endpoint URL is read from VITE_NARRATIVE_API.
 *
 * Haiku is enrichment only — it never decides numeric effects, which
 * remain deterministic in the engine. A manual fallback is always used
 * if the endpoint is missing, slow (>2s), or fails.
 */

import type { Camp } from '../../lib/types';
import type { Choice, RebirthGameState, Scenario, SceneMood } from '../types';

export interface NarrativePromptInput {
  scenario: PublicScenarioSummary;
  state: PublicGameStateSummary;
  choice: PublicChoiceSummary;
  numericOutcome: ResolvedOutcome;
  tone: SceneMood;
}

export interface PublicScenarioSummary {
  id: string;
  title: string;
  subtitle?: string;
  era: string;
  date: string;
  premium: boolean;
}

export interface PublicGameStateSummary {
  camp: Camp;
  turn: number;
  dominantTrait: string;
  organizationName: string;
  organizationDoctrine: string;
}

export interface PublicChoiceSummary {
  id: string;
  text: string;
  intent: string;
}

export interface ResolvedOutcome {
  resourceDeltas: Record<string, number>;
  immediate: string;
  longterm?: string;
}

export interface NarrativePromptOutput {
  consequence: string;
  innerVoice?: string;
  newspaperHeadline?: string;
  memoryLine?: string;
}

const FETCH_TIMEOUT_MS = 4000;

function endpoint(): string | null {
  const url = import.meta.env.VITE_NARRATIVE_API;
  return typeof url === 'string' && url.length > 0 ? url : null;
}

export function isNarrativeEnrichmentEnabled(): boolean {
  return endpoint() !== null;
}

export async function fetchNarrativeEnrichment(
  input: NarrativePromptInput,
  signal?: AbortSignal
): Promise<NarrativePromptOutput | null> {
  const url = endpoint();
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal
    });
    if (!response.ok) return null;
    const data = (await response.json()) as unknown;
    return parseOutput(data);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseOutput(data: unknown): NarrativePromptOutput | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const consequence = record.consequence;
  if (typeof consequence !== 'string' || consequence.length === 0) return null;
  const out: NarrativePromptOutput = { consequence };
  if (typeof record.innerVoice === 'string') out.innerVoice = record.innerVoice;
  if (typeof record.newspaperHeadline === 'string') out.newspaperHeadline = record.newspaperHeadline;
  if (typeof record.memoryLine === 'string') out.memoryLine = record.memoryLine;
  return out;
}

export function buildNarrativePromptInput(
  state: RebirthGameState,
  scenario: Scenario,
  choice: Choice
): NarrativePromptInput {
  return {
    scenario: {
      id: scenario.id,
      title: scenario.title,
      subtitle: scenario.subtitle,
      era: scenario.era,
      date: scenario.date,
      premium: scenario.premium ?? false
    },
    state: {
      camp: state.camp,
      turn: state.turn,
      dominantTrait: state.dominantTrait,
      organizationName: state.organization.name,
      organizationDoctrine: state.organization.doctrine
    },
    choice: {
      id: choice.id,
      text: choice.text,
      intent: choice.intent
    },
    numericOutcome: {
      resourceDeltas: cleanDeltas(choice.effects.resources),
      immediate: choice.consequence.immediate,
      longterm: choice.consequence.longterm
    },
    tone: scenario.mood
  };
}

function cleanDeltas(deltas: Choice['effects']['resources']): Record<string, number> {
  if (!deltas) return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(deltas)) {
    if (typeof value === 'number' && value !== 0) out[key] = value;
  }
  return out;
}
