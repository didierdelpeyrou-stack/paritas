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

/** Hard cap. Stream usually completes in ~2-3s. */
const FETCH_TIMEOUT_MS = 8000;
/** Time after which a stalled stream (no chunk) is considered dead. */
const IDLE_TIMEOUT_MS = 4000;

function endpoint(): string | null {
  const url = import.meta.env.VITE_NARRATIVE_API;
  return typeof url === 'string' && url.length > 0 ? url : null;
}

export function isNarrativeEnrichmentEnabled(): boolean {
  return endpoint() !== null;
}

export interface NarrativeStreamHandlers {
  /** Called every time any section's text grows. Snapshot is the current best parse. */
  onUpdate?: (snapshot: Partial<NarrativePromptOutput>) => void;
  /** Called once when the stream ends successfully. Output is the final parse, or null if no usable text was emitted. */
  onComplete?: (output: NarrativePromptOutput | null) => void;
  /** Called once on transport error, timeout, or abort. */
  onError?: () => void;
}

/**
 * Streams narrative enrichment from the worker. Returns a Promise that
 * resolves to the final parsed output (or null on failure / no usable
 * content). The onUpdate callback fires repeatedly as chunks arrive,
 * giving the UI live progress.
 */
export async function streamNarrativeEnrichment(
  input: NarrativePromptInput,
  handlers: NarrativeStreamHandlers,
  signal?: AbortSignal
): Promise<NarrativePromptOutput | null> {
  const url = endpoint();
  if (!url) return null;

  const controller = new AbortController();
  const hardTimeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let idleTimeout: ReturnType<typeof setTimeout> | null = null;
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const armIdle = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => controller.abort(), IDLE_TIMEOUT_MS);
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal
    });
    if (!response.ok || !response.body) {
      handlers.onError?.();
      return null;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = new SectionParser();
    armIdle();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      armIdle();
      const chunk = decoder.decode(value, { stream: true });
      if (parser.feed(chunk)) {
        handlers.onUpdate?.(parser.snapshot());
      }
    }

    const final = parser.finish();
    handlers.onComplete?.(final);
    return final;
  } catch {
    handlers.onError?.();
    return null;
  } finally {
    clearTimeout(hardTimeout);
    if (idleTimeout) clearTimeout(idleTimeout);
  }
}

type Section = 'consequence' | 'innerVoice' | 'newspaperHeadline' | 'memoryLine';

const SECTION_BY_TAG: Record<string, Section> = {
  CONSEQUENCE: 'consequence',
  VOIX: 'innerVoice',
  JOURNAL: 'newspaperHeadline',
  MEMOIRE: 'memoryLine'
};

const TAG_RE = /\[(CONSEQUENCE|VOIX|JOURNAL|MEMOIRE)\]/g;

class SectionParser {
  private buffer = '';
  private sections: Record<Section, string> = {
    consequence: '',
    innerVoice: '',
    newspaperHeadline: '',
    memoryLine: ''
  };
  private dirty = false;

  /** Append a chunk. Returns true if any visible change happened. */
  feed(chunk: string): boolean {
    if (!chunk) return false;
    this.buffer += chunk;
    this.reparse();
    const wasDirty = this.dirty;
    this.dirty = false;
    return wasDirty;
  }

  snapshot(): Partial<NarrativePromptOutput> {
    return prune({
      consequence: this.sections.consequence.trim() || undefined,
      innerVoice: this.sections.innerVoice.trim() || undefined,
      newspaperHeadline: this.sections.newspaperHeadline.trim() || undefined,
      memoryLine: this.sections.memoryLine.trim() || undefined
    });
  }

  finish(): NarrativePromptOutput | null {
    const snap = this.snapshot();
    if (!snap.consequence) return null;
    const out: NarrativePromptOutput = { consequence: snap.consequence };
    if (snap.innerVoice) out.innerVoice = snap.innerVoice;
    if (snap.newspaperHeadline) out.newspaperHeadline = snap.newspaperHeadline;
    if (snap.memoryLine) out.memoryLine = snap.memoryLine;
    return out;
  }

  private reparse() {
    /* Find every [SECTION] marker in the buffer and assign the slice
       up to the next marker (or end-of-buffer) to that section.
       Robust to markers split across chunks because we always
       re-scan the whole buffer. */
    const newSections: Record<Section, string> = {
      consequence: '',
      innerVoice: '',
      newspaperHeadline: '',
      memoryLine: ''
    };
    let lastSection: Section | null = null;
    let lastIndex = 0;
    TAG_RE.lastIndex = 0;
    const matches: { tag: string; start: number; end: number }[] = [];
    let match: RegExpExecArray | null;
    while ((match = TAG_RE.exec(this.buffer)) !== null) {
      matches.push({ tag: match[1]!, start: match.index, end: match.index + match[0].length });
    }

    for (let i = 0; i < matches.length; i += 1) {
      const m = matches[i]!;
      if (lastSection !== null) {
        newSections[lastSection] = this.buffer.slice(lastIndex, m.start);
      }
      lastSection = SECTION_BY_TAG[m.tag] ?? null;
      lastIndex = m.end;
    }
    if (lastSection !== null) {
      newSections[lastSection] = this.buffer.slice(lastIndex);
    }

    let changed = false;
    for (const k of Object.keys(newSections) as Section[]) {
      if (newSections[k] !== this.sections[k]) {
        changed = true;
        this.sections[k] = newSections[k];
      }
    }
    if (changed) this.dirty = true;
  }
}

function prune(obj: Partial<NarrativePromptOutput>): Partial<NarrativePromptOutput> {
  const out: Partial<NarrativePromptOutput> = {};
  if (obj.consequence) out.consequence = obj.consequence;
  if (obj.innerVoice) out.innerVoice = obj.innerVoice;
  if (obj.newspaperHeadline) out.newspaperHeadline = obj.newspaperHeadline;
  if (obj.memoryLine) out.memoryLine = obj.memoryLine;
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
