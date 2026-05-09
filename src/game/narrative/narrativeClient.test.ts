/* P3 ORDA-019 PARITAS — couverture résiduelle narrative/narrativeClient.ts.
   Client streaming Haiku, fallback offline, parser de sections.
   Couvre :
     - isNarrativeEnrichmentEnabled() : env-driven, type boolean,
       false par défaut sans VITE_NARRATIVE_API.
     - buildNarrativePromptInput() : shape complet (scenario/state/
       choice/numericOutcome/tone/mode/player), cleanDeltas zéro-strip.
     - streamNarrativeEnrichment() : null si endpoint absent ; sinon
       parsing + onUpdate/onComplete/onError, gestion abort signal.

   Limites documentées :
     - SectionParser est privé. Couverture indirecte via le stream.
     - FETCH_TIMEOUT_MS et IDLE_TIMEOUT_MS (8s/4s) ne sont pas
       déclenchés ici pour rester rapide ; on teste uniquement les
       cas synchrones et abort explicites. */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildNarrativePromptInput,
  isNarrativeEnrichmentEnabled,
  streamNarrativeEnrichment
} from './narrativeClient';
import { freshResources } from '../simulation/resources';
import { freshActors } from '../simulation/actors';
import { freshOrganization } from '../org/organization';
import { freshTraits } from './personalityEngine';
import { freshMemory } from './memoryEngine';
import type { RebirthGameState, Scenario, Choice } from '../types';

function mkState(): RebirthGameState {
  return {
    name: 'Léon',
    camp: 'salarie',
    mode: 'reflechi',
    legendaryId: 'jouhaux',
    turn: 17,
    era: 'paritarisme-fondateur',
    currentScenarioId: null,
    traits: freshTraits(),
    dominantTrait: 'pragmatique',
    personalityStress: 25,
    resources: freshResources(),
    actors: freshActors(),
    organization: freshOrganization('salarie', 'CGT'),
    activeStrategies: [],
    worldAI: { mode: 'neutral', aggression: 0, lastTrigger: null },
    activePipelines: [],
    memory: freshMemory(),
    objectives: [],
    objectiveProgress: [],
    phase: 'idle',
    lastChoice: null,
    lastConsequenceText: null,
    endingId: null
  } as unknown as RebirthGameState;
}

function mkScenario(over: Partial<Scenario> = {}): Scenario {
  return {
    id: 'matignon-1936',
    turn: 17,
    date: '7 juin 1936',
    era: 'paritarisme-fondateur',
    title: 'Hôtel Matignon',
    subtitle: 'Négociation au sommet',
    mood: 'tendu',
    historicalContext: '',
    setup: { reflechi: '', compulsif: '' },
    voices: [],
    choices: [],
    premium: false,
    ...over
  } as unknown as Scenario;
}

function mkChoice(over: Partial<Choice> = {}): Choice {
  return {
    id: 'signer',
    text: 'Signer.',
    intent: 'Compromis pragmatique',
    effects: {
      resources: { tresorerie: -5, militants: 0, mobilisation: 3 } as Choice['effects']['resources']
    },
    consequence: {
      immediate: 'L\'accord est signé.',
      longterm: 'La base murmure.'
    },
    ...over
  } as unknown as Choice;
}

/* ============================================================
   Helpers fetch mocking
   ============================================================ */

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[i]!));
      i += 1;
    }
  });
}

function mockFetchOk(chunks: string[]): typeof fetch {
  return vi.fn(async () => {
    const body = streamFromChunks(chunks);
    return {
      ok: true,
      status: 200,
      body
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

function mockFetchError(): typeof fetch {
  return vi.fn(async () => {
    return {
      ok: false,
      status: 500,
      body: null
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

function mockFetchThrows(): typeof fetch {
  return vi.fn(async () => {
    throw new TypeError('network down');
  }) as unknown as typeof fetch;
}

/* ============================================================
   Tests
   ============================================================ */

describe('narrativeClient — isNarrativeEnrichmentEnabled', () => {
  it('renvoie un booléen', () => {
    expect(typeof isNarrativeEnrichmentEnabled()).toBe('boolean');
  });

  it('renvoie false sans VITE_NARRATIVE_API (env de test)', () => {
    /* En env de tests vitest, VITE_NARRATIVE_API est typiquement
       absent — on vérifie le fallback offline. */
    if (!import.meta.env.VITE_NARRATIVE_API) {
      expect(isNarrativeEnrichmentEnabled()).toBe(false);
    } else {
      expect(isNarrativeEnrichmentEnabled()).toBe(true);
    }
  });
});

describe('narrativeClient — buildNarrativePromptInput', () => {
  it('shape : scenario / state / choice / numericOutcome / tone / mode / player', () => {
    const input = buildNarrativePromptInput(mkState(), mkScenario(), mkChoice());
    expect(input.scenario.id).toBe('matignon-1936');
    expect(input.scenario.title).toBe('Hôtel Matignon');
    expect(input.scenario.era).toBe('paritarisme-fondateur');
    expect(input.scenario.premium).toBe(false);
    expect(input.state.camp).toBe('salarie');
    expect(input.state.turn).toBe(17);
    expect(input.state.dominantTrait).toBe('pragmatique');
    expect(input.choice.id).toBe('signer');
    expect(input.choice.intent).toBe('Compromis pragmatique');
    expect(input.numericOutcome.immediate).toBe('L\'accord est signé.');
    expect(input.numericOutcome.longterm).toBe('La base murmure.');
    expect(input.tone).toBe('tendu');
    expect(input.mode).toMatch(/^(falc|litteraire)$/);
    expect(input.player).toBeDefined();
    expect(typeof input.player!.partiesPlayed).toBe('number');
    expect(typeof input.player!.anonId).toBe('string');
  });

  it('cleanDeltas : strip les valeurs nulles, garde les non-nulles', () => {
    const input = buildNarrativePromptInput(
      mkState(),
      mkScenario(),
      mkChoice({
        effects: {
          resources: {
            tresorerie: -5,
            militants: 0,
            mobilisation: 3
          } as Choice['effects']['resources']
        }
      })
    );
    /* militants:0 doit avoir été strippé */
    expect(input.numericOutcome.resourceDeltas).not.toHaveProperty('militants');
    expect(input.numericOutcome.resourceDeltas.tresorerie).toBe(-5);
    expect(input.numericOutcome.resourceDeltas.mobilisation).toBe(3);
  });

  it('resources absentes → resourceDeltas = {}', () => {
    const input = buildNarrativePromptInput(
      mkState(),
      mkScenario(),
      mkChoice({ effects: {} })
    );
    expect(input.numericOutcome.resourceDeltas).toEqual({});
  });

  it('premium scenario hérite du flag', () => {
    const input = buildNarrativePromptInput(
      mkState(),
      mkScenario({ premium: true }),
      mkChoice()
    );
    expect(input.scenario.premium).toBe(true);
  });
});

describe('narrativeClient — streamNarrativeEnrichment (sans endpoint)', () => {
  it('renvoie null immédiatement sans VITE_NARRATIVE_API', async () => {
    /* Sans endpoint configuré, court-circuit avant tout fetch. */
    if (import.meta.env.VITE_NARRATIVE_API) {
      /* Si configuré (cas production), on saute le test. */
      return;
    }
    const input = buildNarrativePromptInput(mkState(), mkScenario(), mkChoice());
    const result = await streamNarrativeEnrichment(input, {});
    expect(result).toBeNull();
  });
});

describe('narrativeClient — streamNarrativeEnrichment (fetch mocké)', () => {
  let originalFetch: typeof globalThis.fetch;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    /* On stubbe l'env pour activer l'endpoint. */
    originalEnv = import.meta.env.VITE_NARRATIVE_API;
    vi.stubEnv('VITE_NARRATIVE_API', 'https://test.example/api/narrative');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEnv === undefined) {
      vi.unstubAllEnvs();
    } else {
      vi.stubEnv('VITE_NARRATIVE_API', originalEnv);
    }
  });

  it('parse un stream avec sections [CONSEQUENCE]/[VOIX]/[JOURNAL]/[MEMOIRE]', async () => {
    globalThis.fetch = mockFetchOk([
      '[CONSEQUENCE]\nL\'accord change tout.\n',
      '[VOIX]\nJe doute.\n',
      '[JOURNAL]\nTitre presse\n',
      '[MEMOIRE]\nMémoire courte.'
    ]);

    const input = buildNarrativePromptInput(mkState(), mkScenario(), mkChoice());
    const onUpdate = vi.fn();
    const onComplete = vi.fn();
    const onError = vi.fn();

    const result = await streamNarrativeEnrichment(input, {
      onUpdate,
      onComplete,
      onError
    });

    expect(result).not.toBeNull();
    expect(result!.consequence).toContain('change tout');
    expect(result!.innerVoice).toContain('doute');
    expect(result!.newspaperHeadline).toContain('Titre');
    expect(result!.memoryLine).toContain('Mémoire courte');
    expect(onUpdate).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('renvoie null + onError sur réponse !ok', async () => {
    globalThis.fetch = mockFetchError();

    const input = buildNarrativePromptInput(mkState(), mkScenario(), mkChoice());
    const onError = vi.fn();
    const onComplete = vi.fn();

    const result = await streamNarrativeEnrichment(input, { onError, onComplete });
    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('renvoie null + onError sur exception réseau', async () => {
    globalThis.fetch = mockFetchThrows();

    const input = buildNarrativePromptInput(mkState(), mkScenario(), mkChoice());
    const onError = vi.fn();

    const result = await streamNarrativeEnrichment(input, { onError });
    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('renvoie null si stream sans [CONSEQUENCE] (parser refuse)', async () => {
    /* finish() refuse une sortie sans consequence. */
    globalThis.fetch = mockFetchOk(['[VOIX]\nVoix seule sans conséquence.\n']);

    const input = buildNarrativePromptInput(mkState(), mkScenario(), mkChoice());
    const onComplete = vi.fn();

    const result = await streamNarrativeEnrichment(input, { onComplete });
    expect(result).toBeNull();
    expect(onComplete).toHaveBeenCalledWith(null);
  });

  it('respecte un AbortSignal externe : fetch reçoit le signal et rejette → null + onError', async () => {
    /* On vérifie que le signal externe est propagé au fetch sous-
       jacent (via l'AbortController interne du client). Le mock
       fetch respecte signal.aborted et lève AbortError, ce que la
       fonction transforme en onError() + return null. */
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const sig = init?.signal;
        if (sig?.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        sig?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const input = buildNarrativePromptInput(mkState(), mkScenario(), mkChoice());
    const externalCtl = new AbortController();
    const onError = vi.fn();

    const promise = streamNarrativeEnrichment(input, { onError }, externalCtl.signal);
    /* Laisse l'event-loop poser le listener abort dans le client. */
    await Promise.resolve();
    externalCtl.abort();
    const result = await promise;

    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
