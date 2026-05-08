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
  /** Discriminant Argus UX-3 : 'scene' (défaut, comportement
   *  historique) ou 'journal' (génération end-of-game ~600 mots). */
  kind?: 'scene' | 'journal';
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

/** Argus UX-3 : entrée dédiée au journal de fin de partie. */
interface JournalPromptInput {
  kind: 'journal';
  state: {
    name: string;
    camp: 'salarie' | 'patron';
    organizationName: string;
    finalDominantTrait: string;
  };
  ending: {
    id: string;
    title: string;
    score: number;
    text: string;
  };
  stats: {
    turnsPlayed: number;
    institutionsBuilt: number;
    refusedCompromise: number;
    betrayedBase: number;
    exhaustedMovements: number;
  };
  mandateBilan: { label: string; status: 'satisfied' | 'failed' | 'pending' }[];
  recentLog: string[];
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

/* Argus UX-3 — Journal personnalisé de fin de partie.
   ~500-700 mots, première personne, ton aligné sur le trait dominant.
   AUCUNE balise. AUCUN méta-commentaire. Le texte est le journal. */
const SYSTEM_JOURNAL = `Tu écris le journal personnel de fin de carrière du joueur de Paritas, simulation politique narrative sur le paritarisme français de 1789 à 2026.

ESPRIT :
1. Le joueur·se vient de finir 100 tours d'histoire syndicale ou patronale.
2. Le journal est sa réflexion privée le soir où il/elle pose la plume.
3. Pédagogie : le texte rappelle 2-3 décisions précises du parcours, sans réécrire l'histoire.
4. Émotion juste : ni triomphalisme, ni misérabilisme.

STYLE OBLIGATOIRE :
- Première personne du singulier (je, j'ai, ma).
- 500-700 mots. Pas plus, pas moins.
- Français littéraire mais lisible. Phrases majoritairement ≤ 25 mots.
- Le ton doit ÉPOUSER le trait dominant du joueur :
  • bâtisseur : sobre, institutionnel, amour des structures durables, hommage discret aux pierres posées.
  • rupture : brûlant, ironique, refus du compromis, invectives possibles, tutoiement de l'Histoire.
  • technocrate : précis, factuel, mémoire des chiffres et des dossiers, peu d'émotion en surface.
  • pragmatique : doux-amer, lucide, économe en mots, accepte les compromissions consenties.
  • paternaliste : protecteur, hiérarchique, patriarcal, pense en "miens" et "patrimoine".
  • tribun : oratoire, lyrique, grandes fresques, métaphores du fleuve et de la voix.

CONTRAINTES :
- N'utilise JAMAIS le mot du verdict (mutilation, capture, refondation, résistance, inachevé) tel quel — fais ressentir l'esprit autrement.
- Ne récite pas les statistiques ; intègre-les dans le récit ("j'ai bâti quatre caisses, peut-être cinq…").
- Cite 2-3 décisions précises tirées du log fourni — par leur contenu, pas par leur tag (Compromis/Rupture).
- Termine par une phrase tournée vers ce qui reste après — successeur, héritage, défaite acceptée, espoir transmis.

VOCABULAIRE TECHNIQUE :
Utilise au mot juste, sans guillemets : paritarisme, convention collective, Unédic, Agirc-Arrco, CGT, CFDT, FO, MEDEF, CNPF, CGPF, Le Chapelier, Ollivier, Waldeck-Rousseau, délégué syndical, CSE, Charte d'Amiens, ANI, Sécurité sociale, CNR, livret ouvrier, prud'hommes, branche, Auroux, Matignon, Grenelle, Plan Juppé, El Khomri, ordonnances Macron.

INTERDIT :
- Aucune balise [SECTION].
- Aucune introduction du type "voici le journal".
- Aucune signature finale ("Bien à toi", date répétée).
- Aucune méta-référence ("le jeu", "la partie", "le joueur"). Tu ÉCRIS le journal, tu n'es pas hors-cadre.

Réponse : un seul bloc de texte, le journal.`;

/* Argus UX-3 : prompt user pour le journal de fin de partie. */
function buildJournalPrompt(input: JournalPromptInput): string {
  const camp = input.state.camp === 'salarie' ? 'salariat' : 'patronat';
  const trait = input.state.finalDominantTrait;
  const mandateLines = input.mandateBilan
    .map(m => {
      const status =
        m.status === 'satisfied' ? 'atteint' : m.status === 'failed' ? 'manqué' : 'inachevé';
      return `- ${m.label} : ${status}`;
    })
    .join('\n');
  const logLines = input.recentLog.length > 0
    ? input.recentLog.map(l => `- ${l}`).join('\n')
    : '(log vide)';

  return `Joueur·euse : ${input.state.name}
Camp : ${camp}
Organisation : ${input.state.organizationName}
Tours joués : ${input.stats.turnsPlayed}/100
Score final : ${input.ending.score}/100
Verdict ressenti : ${input.ending.title} (ne pas écrire ce mot)
Trait dominant : ${trait}

Bilan du mandat :
${mandateLines || '(pas d\'objectifs)'}

Statistiques :
- Institutions paritaires bâties : ${input.stats.institutionsBuilt}
- Compromis refusés : ${input.stats.refusedCompromise}
- Base trahie : ${input.stats.betrayedBase}
- Mouvements épuisés : ${input.stats.exhaustedMovements}

Décisions récentes (12 dernières) :
${logLines}

Texte de l'épilogue (esprit, ne pas paraphraser) :
« ${input.ending.text} »

Écris maintenant le journal personnel de ${input.state.name}, dans le ton ${trait}, ~600 mots.`;
}

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

    let raw: NarrativePromptInput | JournalPromptInput;
    try {
      raw = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders() });
    }

    /* Argus UX-3 : dispatch sur le discriminant `kind`.
       - 'journal' (UX-3) : journal end-of-game, ~1200 tokens, prompt dédié.
       - 'scene' ou absent : comportement historique (4 sections). */
    let system: string;
    let userPrompt: string;
    let maxTokens: number;
    if (raw.kind === 'journal') {
      const j = raw as JournalPromptInput;
      system = SYSTEM_JOURNAL;
      userPrompt = buildJournalPrompt(j);
      maxTokens = 1200;
    } else {
      const input = raw as NarrativePromptInput;
      const mode = input.mode ?? 'falc';
      system = mode === 'litteraire' ? SYSTEM_LITTERAIRE : SYSTEM_FALC;
      userPrompt = buildUserPrompt(input);
      maxTokens = 600;
    }

    /* Appel Anthropic Messages API en streaming. On forward le flux
       directement au client (text/plain). */
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
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
