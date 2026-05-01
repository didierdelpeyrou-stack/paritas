/**
 * Paritas — Cloudflare Worker template for narrative enrichment
 *
 * Deploy steps:
 *   1. npm i -g wrangler
 *   2. wrangler login
 *   3. wrangler secret put ANTHROPIC_API_KEY     (paste your key)
 *   4. wrangler deploy worker/narrative.ts
 *
 * Then set in your Pages build env:
 *   VITE_NARRATIVE_API=https://<your-worker>.workers.dev
 *
 * Security:
 *   - The Anthropic API key NEVER leaves the worker.
 *   - CORS is restricted via the ALLOWED_ORIGIN constant below.
 *   - Each request is rate-limited per IP (in-memory; replace by KV/D1 for prod).
 *   - Haiku output is enrichment only — the engine remains the source of
 *     truth on numeric effects.
 */

interface Env {
  ANTHROPIC_API_KEY: string;
}

const ALLOWED_ORIGIN = '*';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 350;
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
    try {
      const anthropic = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!anthropic.ok) return cors(new Response('Upstream Error', { status: 502 }));
      const data = (await anthropic.json()) as {
        content?: { type: string; text?: string }[];
      };
      const text = data.content?.find(b => b.type === 'text')?.text ?? '';
      const parsed = parseHaikuOutput(text);
      if (!parsed) return cors(new Response('Bad Upstream Output', { status: 502 }));
      return cors(
        new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      );
    } catch {
      return cors(new Response('Upstream Error', { status: 502 }));
    }
  }
};

const SYSTEM_PROMPT = `Tu es l'enrichisseur narratif de Paritas, un jeu sur l'histoire du paritarisme français.
Tu reçois en entrée: un scénario historique, l'état du joueur, le choix qu'il vient de prendre, et les effets numériques déjà calculés par le moteur.
Tu produis UNIQUEMENT du texte narratif. Tu ne décides JAMAIS d'effets numériques.
Format de sortie: un objet JSON valide avec exactement ces clés:
- "consequence": phrase ou paragraphe court (≤ 60 mots) qui réécrit la conséquence immédiate dans le ton donné, sans contredire les effets fournis.
- "innerVoice": phrase courte (≤ 25 mots) à la deuxième personne du singulier, qui exprime la voix intérieure du joueur en cohérence avec son trait dominant.
- "newspaperHeadline": titre de presse court (≤ 14 mots), sans guillemets, qui pourrait paraître le lendemain.
- "memoryLine": une seule phrase (≤ 25 mots) qui suggère ce que cette décision pourrait laisser comme trace longue.
Style: français soutenu, sobre, jamais ironique, jamais théâtral. Pas d'anglicismes. Pas de notes ou d'explications hors JSON.`;

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

function parseHaikuOutput(text: string): {
  consequence: string;
  innerVoice?: string;
  newspaperHeadline?: string;
  memoryLine?: string;
} | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    if (typeof obj?.consequence !== 'string') return null;
    return {
      consequence: obj.consequence,
      innerVoice: typeof obj.innerVoice === 'string' ? obj.innerVoice : undefined,
      newspaperHeadline: typeof obj.newspaperHeadline === 'string' ? obj.newspaperHeadline : undefined,
      memoryLine: typeof obj.memoryLine === 'string' ? obj.memoryLine : undefined
    };
  } catch {
    return null;
  }
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
