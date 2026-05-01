/**
 * Paritas — Cloudflare Worker template for narrative enrichment
 *
 * Deploy steps:
 *   1. cd worker && npx wrangler login
 *   2. npx wrangler secret put ANTHROPIC_API_KEY     (paste your key)
 *   3. npx wrangler deploy
 *
 * Then set in your Pages build env:
 *   VITE_NARRATIVE_API=https://<your-worker>.workers.dev
 *
 * Streams Haiku's text deltas back to the client. The frontend reads
 * the body as a ReadableStream and parses bracketed sections
 * ([CONSEQUENCE] / [VOIX] / [JOURNAL] / [MEMOIRE]) progressively, so
 * the consequence text appears as Haiku writes it.
 */

interface Env {
  ANTHROPIC_API_KEY: string;
}

const ALLOWED_ORIGIN = '*';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 400;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

interface NarrativePromptInput {
  scenario: { id: string; title: string; subtitle?: string; era: string; date: string; premium: boolean };
  state: { camp: string; turn: number; dominantTrait: string; organizationName: string; organizationDoctrine: string };
  choice: { id: string; text: string; intent: string };
  numericOutcome: { resourceDeltas: Record<string, number>; immediate: string; longterm?: string };
  tone: 'calme' | 'tendu' | 'grave' | 'euphorique' | 'melancolique';
}

const rateBuckets = new Map<string, { count: number; reset: number }>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
    if (request.method !== 'POST') return cors(new Response('Method Not Allowed', { status: 405 }));

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!checkRate(ip)) return cors(new Response('Too Many Requests', { status: 429 }));

    let input: NarrativePromptInput;
    try {
      input = (await request.json()) as NarrativePromptInput;
    } catch {
      return cors(new Response('Bad Request', { status: 400 }));
    }
    if (!input?.scenario?.id || !input?.choice?.id) {
      return cors(new Response('Bad Request', { status: 400 }));
    }

    const prompt = buildPrompt(input);

    let upstream: Response;
    try {
      upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          stream: true,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }]
        })
      });
    } catch {
      return cors(new Response('Upstream Error', { status: 502 }));
    }

    if (!upstream.ok || !upstream.body) {
      return cors(new Response('Upstream Error', { status: 502 }));
    }

    const stream = textDeltaStream(upstream.body);
    return cors(
      new Response(stream, {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store'
        }
      })
    );
  }
};

const SYSTEM_PROMPT = `Tu es l'enrichisseur narratif de Paritas, un jeu sur l'histoire du paritarisme français.
Tu reçois en entrée un scénario historique, l'état du joueur, le choix qu'il vient de prendre, et les effets numériques déjà calculés par le moteur.
Tu produis UNIQUEMENT du texte narratif. Tu ne décides JAMAIS d'effets numériques.

FORMAT DE SORTIE OBLIGATOIRE — quatre sections délimitées par des balises entre crochets, dans cet ordre exact, sans aucune explication ni texte hors balises :

[CONSEQUENCE]
Phrase ou paragraphe court (≤ 60 mots) qui réécrit la conséquence immédiate dans le ton donné, sans contredire les effets fournis. Tutoiement, deuxième personne du singulier.

[VOIX]
Phrase courte (≤ 25 mots) à la deuxième personne du singulier, qui exprime la voix intérieure du joueur en cohérence avec son trait dominant.

[JOURNAL]
Titre de presse court (≤ 14 mots), sans guillemets, qui pourrait paraître le lendemain.

[MEMOIRE]
Une seule phrase (≤ 25 mots) qui suggère ce que cette décision pourrait laisser comme trace longue.

Style général : français soutenu, sobre, jamais ironique, jamais théâtral. Pas d'anglicismes. Tutoiement obligatoire.`;

function buildPrompt(input: NarrativePromptInput): string {
  const deltas = Object.entries(input.numericOutcome.resourceDeltas)
    .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
    .join(', ') || 'aucun delta significatif';
  return JSON.stringify({
    scenario: input.scenario,
    state: input.state,
    choice: input.choice,
    deltas,
    immediate: input.numericOutcome.immediate,
    longterm: input.numericOutcome.longterm ?? null,
    tone: input.tone
  });
}

/**
 * Reads the upstream Anthropic SSE stream and forwards only the
 * concatenated text_delta payloads as raw UTF-8 chunks. This keeps
 * the frontend protocol trivial: read body as text, append, parse.
 */
function textDeltaStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let pending = '';
  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += decoder.decode(value, { stream: true });
          const lines = pending.split('\n');
          pending = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const event = JSON.parse(payload) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                const text = event.delta.text ?? '';
                if (text) controller.enqueue(encoder.encode(text));
              }
            } catch {
              /* ignore malformed event */
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      } finally {
        reader.releaseLock();
      }
      controller.close();
    }
  });
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(response.body, { status: response.status, headers });
}

function checkRate(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.reset) {
    rateBuckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_MAX) return false;
  bucket.count += 1;
  return true;
}
