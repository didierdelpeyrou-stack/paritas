/**
 * Cloudflare Worker — Paritas narrative enrichment.
 *
 * À déployer sur Cloudflare Workers via `wrangler deploy`.
 * NE PAS importer ce fichier dans le bundle front. C'est purement
 * documentation : le code à coller dans le worker.
 *
 * Variables d'environnement requises (via `wrangler secret put`) :
 *  - ANTHROPIC_API_KEY : clé API Anthropic
 *
 * Endpoint : POST /
 * Body : NarrativePromptInput (cf. narrativeClient.ts)
 * Réponse : stream text/plain avec [CONSEQUENCE]…[VOIX]…[JOURNAL]…[MEMOIRE]
 *
 * Mise à jour mai 2026 :
 *  - mode 'falc' / 'litteraire' lu depuis l'input
 *  - PlayerProfile passé pour adapter ton et difficulté
 *  - prompt système enrichi : esprit du jeu (3 priorités), glossaire,
 *    contraintes FALC quand activé
 */

interface NarrativePromptInput {
  scenario: { id: string; title: string; subtitle?: string; era: string; date: string; premium: boolean };
  state: { camp: 'salarie' | 'patron'; turn: number; dominantTrait: string; organizationName: string; organizationDoctrine: string };
  choice: { id: string; text: string; intent: string };
  numericOutcome: { resourceDeltas: Record<string, number>; immediate: string; longterm?: string };
  tone: 'calme' | 'tendu' | 'grave' | 'euphorique' | 'melancolique';
  mode?: 'falc' | 'litteraire';
  player?: {
    partiesPlayed: number;
    personalityStress: number;
    recentDifficulty: 'easy' | 'normal' | 'hard';
    anonId: string;
  };
}

interface Env {
  ANTHROPIC_API_KEY: string;
}

const SYSTEM_FALC = `Tu es l'écrivain de scènes de Paritas, un jeu narratif sur le paritarisme français de 1789 à 2026.

ESPRIT DU JEU, dans cet ordre :
1. SIMULATION POLITIQUE VIVANTE — le joueur sent qu'il pilote un système réel.
2. PÉDAGOGIE sur l'histoire du paritarisme — chaque scène apprend du vrai.
3. POIDS DRAMATIQUE — la décision pèse, sans écraser.

TON : FALC inspiré (Facile à Lire et à Comprendre).
- Phrases ≤ 15 mots, idéal 10-12.
- Une idée par phrase.
- Présent simple par défaut. Passé composé pour le rappel historique.
- Voix active. Pas d'inversion sujet-verbe. Pas de subjonctif imparfait.
- Verbes concrets : "il signe" pas "il procède à la signature".
- Pas de double négation. Pas de périphrase évitable.
- Métaphore familière OK ("la rue gronde"). Pas de métaphore littéraire obscure.

VOCABULAIRE TECHNIQUE :
Ces termes du paritarisme/syndicalisme/lois/État doivent être utilisés
au mot juste, sans guillemets ni explication intrusive — ils sont
auto-italisés et cliquables côté front via le glossaire :
paritarisme, convention collective, paritaire, Unédic, Agirc-Arrco,
CGT, CFDT, FO, MEDEF, CNPF, CGPF, Le Chapelier, Code pénal, Ollivier,
Waldeck-Rousseau, délégué syndical, CSE, CHSCT, CGT-Unitaire, Charte
d'Amiens, ANI, Sécurité sociale, CNR, livret ouvrier, corporation,
compagnonnage, prud'hommes, OPCO, GPEC, branche, pénibilité, Auroux,
Matignon, Grenelle, Plan Juppé, loi El Khomri, ordonnances Macron,
Bercy, Élysée, préfet, Conseil d'État, Conseil constitutionnel.

FORMAT DE SORTIE strict (chaque section commence par sa balise) :
[CONSEQUENCE]
3-4 phrases qui décrivent la suite immédiate du choix. Concret,
factuel, daté si possible.

[VOIX]
Une seule phrase, ≤ 18 mots, voix intérieure du joueur dans la posture
de son trait dominant. Familier, direct, pas pathétique.

[JOURNAL]
Un titre de presse de l'époque, ≤ 12 mots, ton du média de la période.

[MEMOIRE]
Une phrase qui pose la conséquence à 5-15 ans. Sobre, historique.

Aucune section n'est optionnelle. Aucune autre balise n'est autorisée.`;

const SYSTEM_LITTERAIRE = `Tu es l'écrivain de scènes de Paritas. Style littéraire dense — phrases longues OK, métaphores acceptées, références culturelles libres. Mais respecter le vocabulaire technique du paritarisme (auto-italisé côté front).

Format strict : [CONSEQUENCE], [VOIX], [JOURNAL], [MEMOIRE]. Aucune autre balise.`;

function buildUserPrompt(input: NarrativePromptInput): string {
  const { scenario, state, choice, numericOutcome, tone, player } = input;
  const deltas = Object.entries(numericOutcome.resourceDeltas)
    .map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`)
    .join(', ');

  const playerCtx = player
    ? `\nJoueur : ${player.partiesPlayed} partie(s) finie(s), tension intérieure ${player.personalityStress}/100, difficulté ressentie « ${player.recentDifficulty} ».`
    : '';

  const difficultyHint =
    player?.recentDifficulty === 'easy'
      ? '\nNote : ce joueur a 3+ défaites consécutives. Adoucis légèrement le ton, donne-lui une perspective d\'espoir crédible historiquement.'
      : '';

  return `Scénario : ${scenario.title}${scenario.subtitle ? ' — ' + scenario.subtitle : ''}
Date : ${scenario.date}
Ère : ${scenario.era}
Mood : ${tone}
Camp du joueur : ${state.camp === 'salarie' ? 'salariat' : 'patronat'}
Tour : ${state.turn}/100
Trait dominant : ${state.dominantTrait}
Organisation : ${state.organizationName} (doctrine : ${state.organizationDoctrine})${playerCtx}${difficultyHint}

Choix fait : « ${choice.text} »
Intention : ${choice.intent}
Effets numériques : ${deltas || '—'}
Conséquence écrite : ${numericOutcome.immediate}
${numericOutcome.longterm ? 'Longterm prévue : ' + numericOutcome.longterm : ''}

Génère les 4 sections [CONSEQUENCE], [VOIX], [JOURNAL], [MEMOIRE] selon le format défini.`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
    }
    if (!env.ANTHROPIC_API_KEY) {
      return new Response('Service unavailable', { status: 503, headers: corsHeaders() });
    }

    let input: NarrativePromptInput;
    try {
      input = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders() });
    }

    const mode = input.mode ?? 'falc';
    const system = mode === 'litteraire' ? SYSTEM_LITTERAIRE : SYSTEM_FALC;
    const userPrompt = buildUserPrompt(input);

    /* Appel Anthropic Messages API en streaming. On forward le flux
       directement au client (text/plain), qui assemble les sections. */
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        stream: true,
        system,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!upstream.ok || !upstream.body) {
      return new Response('Upstream error', { status: 502, headers: corsHeaders() });
    }

    /* Anthropic renvoie du SSE. On le convertit en text/plain en ne
       gardant que les `delta.text` des `content_block_delta`. */
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const raw of lines) {
              const line = raw.trim();
              if (!line || !line.startsWith('data: ')) continue;
              const json = line.slice(6);
              if (json === '[DONE]') continue;
              try {
                const evt = JSON.parse(json) as {
                  type?: string;
                  delta?: { type?: string; text?: string };
                };
                if (evt.type === 'content_block_delta' && evt.delta?.text) {
                  controller.enqueue(encoder.encode(evt.delta.text));
                }
              } catch {
                /* ignore line de parse */
              }
            }
          }
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        ...corsHeaders()
      }
    });
  }
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}
