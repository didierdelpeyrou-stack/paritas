<script lang="ts">
  /* ============================================================
     V2-1 — « Le Statut Juridique » (1864, Loi Ollivier)
     ============================================================
     Mini-jeu pivot dédié : le joueur déclare la coalition sous
     l'une de 4 formes juridiques (mutualité / chambre /
     résistance / union confraternelle), en remplissant 5 champs
     d'un formulaire ministériel. Chaque combinaison ouvre/ferme
     les formes possibles.

     Spec : V2_AVIS_MINIJEUX_TABLE.md §7.1.

     UI : papier vélin Second Empire, plume Sergent-Major,
     préfet en silhouette. Utilise la palette + le sceau du
     cockpit pour cohérence visuelle.
     ============================================================ */
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import CockpitIcon from './CockpitIcon.svelte';

  interface Props {
    /** Callback quand le scénario se termine (résultat final). */
    onComplete?: (outcome: StatutOutcome) => void;
  }
  let { onComplete }: Props = $props();

  /* ====== Modèle ====== */

  type FormeJuridique = 'mutualite' | 'chambre' | 'resistance' | 'union';

  interface FormeMeta {
    id: FormeJuridique;
    name: string;
    motto: string;
    coutCaisse: number;        // coût administratif initial
    plafondInterne: number;     // capacité de cohésion interne
    plafondExterne: number;     // capacité de force externe
    surveillance: 'faible' | 'moyenne' | 'forte';
    signed: boolean;            // peut être signée par le préfet
  }

  /* Champs du formulaire — 5 sélecteurs */
  type ObjetSocial = 'mutuelle-secours' | 'defense-metier' | 'resistance-greve' | 'fraternite';
  type Cotisation = 'hebdo' | 'mensuelle' | 'libre';
  type FrequenceAG = 'mensuelle' | 'trimestrielle' | 'annuelle';
  type Perimetre = 'atelier' | 'commune' | 'departement' | 'national';
  type CritereAdhesion = 'metier-strict' | 'metier-large' | 'tout-ouvrier';

  interface Formulaire {
    objet: ObjetSocial | null;
    cotisation: Cotisation | null;
    frequenceAG: FrequenceAG | null;
    perimetre: Perimetre | null;
    critere: CritereAdhesion | null;
  }

  let formulaire = $state<Formulaire>({
    objet: null, cotisation: null, frequenceAG: null,
    perimetre: null, critere: null
  });

  /* Calcule quelles formes sont compatibles avec le formulaire */
  function compatibilite(form: Formulaire): Record<FormeJuridique, boolean> {
    const f = form;
    return {
      mutualite: !!(
        f.objet === 'mutuelle-secours' || f.objet === 'fraternite'
      ) && f.perimetre !== 'national',

      chambre: !!(
        f.objet === 'defense-metier' && f.critere !== 'tout-ouvrier'
      ),

      resistance: !!(
        f.objet === 'resistance-greve'
        || (f.cotisation === 'hebdo' && f.objet === 'defense-metier')
      ),

      union: !!(
        f.objet === 'fraternite' && f.critere === 'tout-ouvrier'
      )
    };
  }

  /* Formes — coûts et caractéristiques */
  const FORMES_DATA: FormeMeta[] = [
    {
      id: 'mutualite',
      name: 'Société de mutualité',
      motto: 'Secours et fraternité ouvrière',
      coutCaisse: 25,
      plafondInterne: 60,
      plafondExterne: 25,
      surveillance: 'faible',
      signed: false
    },
    {
      id: 'chambre',
      name: 'Chambre syndicale',
      motto: 'Défense ostensible des intérêts',
      coutCaisse: 40,
      plafondInterne: 75,
      plafondExterne: 60,
      surveillance: 'moyenne',
      signed: false
    },
    {
      id: 'resistance',
      name: 'Société de résistance',
      motto: 'Préparation de la grève',
      coutCaisse: 55,
      plafondInterne: 80,
      plafondExterne: 90,
      surveillance: 'forte',
      signed: false
    },
    {
      id: 'union',
      name: 'Union confraternelle',
      motto: 'Tous les ouvriers, sans distinction de métier',
      coutCaisse: 35,
      plafondInterne: 70,
      plafondExterne: 55,
      surveillance: 'moyenne',
      signed: false
    }
  ];

  let formes = $derived.by(() => {
    const compat = compatibilite(formulaire);
    return FORMES_DATA.map(f => ({ ...f, signed: compat[f.id] }));
  });

  let formCompleted = $derived(
    formulaire.objet !== null && formulaire.cotisation !== null
    && formulaire.frequenceAG !== null && formulaire.perimetre !== null
    && formulaire.critere !== null
  );

  let availableForms = $derived(formes.filter(f => f.signed));

  /* Le préfet apparaît dès que 3 cases sont remplies */
  let filledCount = $derived(
    Object.values(formulaire).filter(v => v !== null).length
  );
  let prefetVisible = $derived(filledCount >= 3);

  /* État final */
  type Phase = 'forming' | 'choosing' | 'verdict';
  let phase = $state<Phase>('forming');
  let chosenForme = $state<FormeMeta | null>(null);

  export interface StatutOutcome {
    forme: FormeJuridique | null;
    legaliseed: boolean;
    cost: number;
    plafondInterne: number;
    plafondExterne: number;
    surveillance: 'faible' | 'moyenne' | 'forte' | 'illegal';
    /** Texte d'épilogue narratif. */
    epilogue: string;
    /** Effets sur le moteur principal. */
    effects: { caisse: number; legitimite: number; mémoire: number };
  }

  let outcome = $state<StatutOutcome | null>(null);

  function chooseForme(f: FormeMeta) {
    if (!f.signed) return;
    chosenForme = f;
    phase = 'choosing';
    setTimeout(() => deposer(), 800);
  }

  function deposer() {
    if (!chosenForme) {
      /* Aucune forme compatible : grève sauvage hors la loi */
      outcome = {
        forme: null,
        legaliseed: false,
        cost: 80,
        plafondInterne: 30,
        plafondExterne: 100,  // intense mais illégal
        surveillance: 'illegal',
        epilogue:
          'Aucune des quatre formes ne s\'aligne avec ton projet. ' +
          'La coalition se forme dans la clandestinité — grève ' +
          'sauvage à Rouen, le préfet dépêche les gendarmes. ' +
          'Tu paies fort, mais tu existes.',
        effects: { caisse: -80, legitimite: -30, mémoire: +15 }
      };
    } else {
      outcome = {
        forme: chosenForme.id,
        legaliseed: true,
        cost: chosenForme.coutCaisse,
        plafondInterne: chosenForme.plafondInterne,
        plafondExterne: chosenForme.plafondExterne,
        surveillance: chosenForme.surveillance,
        epilogue: epilogueFor(chosenForme),
        effects: {
          caisse: -chosenForme.coutCaisse,
          legitimite: chosenForme.surveillance === 'faible' ? +25 : chosenForme.surveillance === 'moyenne' ? +15 : +5,
          mémoire: +10
        }
      };
    }
    phase = 'verdict';
  }

  function epilogueFor(f: FormeMeta): string {
    if (f.id === 'mutualite') {
      return 'Le préfet hoche la tête, signe au bas du formulaire. ' +
        'La société de mutualité est déclarée légale — modeste, ' +
        'discrète, mais reconnue. Les premiers livres de comptes ' +
        's\'ouvrent.';
    }
    if (f.id === 'chambre') {
      return 'La chambre syndicale est reconnue par préfecture. ' +
        'Sept ouvriers du bâtiment signent en bas, plumes tremblantes. ' +
        'Pour la première fois, la défense du métier est dans la loi.';
    }
    if (f.id === 'resistance') {
      return 'Le préfet hésite longuement. Il signe — la société de ' +
        'résistance est déclarée. Mais une note manuscrite glissée ' +
        'à part avertit : la moindre grève publique sera surveillée ' +
        'par les services. Tu existes au seuil de la légalité.';
    }
    /* union */
    return 'L\'union confraternelle ouvrière est reconnue. Tous les ' +
      'corps de métier peuvent y entrer. Le préfet pose un tampon ' +
      'fatigué : « Voici donc une coalition légale. La République le ' +
      'permet. »';
  }

  function reset() {
    formulaire = { objet: null, cotisation: null, frequenceAG: null, perimetre: null, critere: null };
    phase = 'forming';
    chosenForme = null;
    outcome = null;
  }

  function complete() {
    if (outcome) onComplete?.(outcome);
  }
</script>

<div class="statut-juridique">
  <header class="header">
    <h2>Le Statut Juridique</h2>
    <p class="subtitle">Rouen · Mai 1864 · Loi Ollivier — formulaire de déclaration</p>
  </header>

  {#if phase === 'forming' || phase === 'choosing'}
    <div class="layout">
      <!-- Formulaire papier vélin Second Empire -->
      <article class="formulaire" aria-label="Formulaire de déclaration">
        <div class="filigrane" aria-hidden="true">⚜</div>
        <header class="form-head">
          <small>République Française · Sous-préfecture de Rouen</small>
          <h3>DÉCLARATION DE COALITION OUVRIÈRE</h3>
          <small>(Application de la loi du 25 mai 1864)</small>
        </header>

        <div class="champ">
          <label for="champ-objet">Objet social</label>
          <select id="champ-objet" bind:value={formulaire.objet}>
            <option value={null}>— choisir —</option>
            <option value="mutuelle-secours">Mutuelle de secours et solidarité</option>
            <option value="defense-metier">Défense des intérêts du métier</option>
            <option value="resistance-greve">Préparation de la résistance</option>
            <option value="fraternite">Fraternité confraternelle</option>
          </select>
        </div>

        <div class="champ">
          <label for="champ-cotisation">Cotisation</label>
          <select id="champ-cotisation" bind:value={formulaire.cotisation}>
            <option value={null}>— choisir —</option>
            <option value="hebdo">Hebdomadaire (0,50 F)</option>
            <option value="mensuelle">Mensuelle (2 F)</option>
            <option value="libre">Libre (selon possibilités)</option>
          </select>
        </div>

        <div class="champ">
          <label for="champ-ag">Fréquence des assemblées générales</label>
          <select id="champ-ag" bind:value={formulaire.frequenceAG}>
            <option value={null}>— choisir —</option>
            <option value="mensuelle">Mensuelle</option>
            <option value="trimestrielle">Trimestrielle</option>
            <option value="annuelle">Annuelle</option>
          </select>
        </div>

        <div class="champ">
          <label for="champ-perim">Périmètre géographique</label>
          <select id="champ-perim" bind:value={formulaire.perimetre}>
            <option value={null}>— choisir —</option>
            <option value="atelier">Un atelier ou manufacture</option>
            <option value="commune">La commune (Rouen)</option>
            <option value="departement">Le département (Seine-Inférieure)</option>
            <option value="national">Tout le territoire</option>
          </select>
        </div>

        <div class="champ">
          <label for="champ-critere">Critère d'adhésion</label>
          <select id="champ-critere" bind:value={formulaire.critere}>
            <option value={null}>— choisir —</option>
            <option value="metier-strict">Strictement par métier (tisserands seuls)</option>
            <option value="metier-large">Métier élargi (textile)</option>
            <option value="tout-ouvrier">Tous les ouvriers, sans distinction</option>
          </select>
        </div>

        {#if prefetVisible}
          <aside class="prefet" in:fly={{ x: -10, duration: 320, easing: cubicOut }}>
            <div class="prefet-portrait" aria-hidden="true">
              <CockpitIcon name="balance" size={24} />
            </div>
            <div class="prefet-text">
              <strong>Le préfet observe.</strong>
              {#if availableForms.length === 0}
                <em>Aucune forme légale possible avec ces choix.</em>
              {:else if availableForms.length === 1}
                <em>Une forme s'aligne — vous voilà reconnus.</em>
              {:else}
                <em>Plusieurs formes possibles — à toi de choisir.</em>
              {/if}
            </div>
          </aside>
        {/if}
      </article>

      <!-- Vignettes des 4 formes — éteintes ou allumées selon compatibilité -->
      <aside class="vignettes" aria-label="Formes juridiques possibles">
        {#each formes as f}
          <button type="button"
            class="vignette"
            class:active={f.signed}
            class:chosen={chosenForme?.id === f.id}
            disabled={!f.signed || !formCompleted || phase === 'choosing'}
            onclick={() => chooseForme(f)}
            title={f.signed ? f.motto : 'Forme incompatible avec tes choix actuels'}
          >
            <h4>{f.name}</h4>
            <p class="vignette-motto">{f.motto}</p>
            <dl class="vignette-stats">
              <dt>Coût</dt>
              <dd>{f.coutCaisse} F</dd>
              <dt>Cohésion interne max</dt>
              <dd>{f.plafondInterne}</dd>
              <dt>Force externe max</dt>
              <dd>{f.plafondExterne}</dd>
              <dt>Surveillance</dt>
              <dd>{f.surveillance}</dd>
            </dl>
            {#if f.signed && phase !== 'choosing'}
              <span class="vignette-cta">Choisir</span>
            {/if}
          </button>
        {/each}
      </aside>
    </div>

  {:else if phase === 'verdict' && outcome}
    <div class="verdict" in:fade={{ duration: 360 }}>
      {#if outcome.legaliseed && chosenForme}
        <div class="sceau" in:scale={{ duration: 480, start: 0.6, easing: cubicOut }}>
          <div class="sceau-circle">SCEAU<br/>PRÉFECTORAL</div>
        </div>
        <h3>Coalition légalisée — {chosenForme.name}</h3>
      {:else}
        <h3 class="failed">Aucune forme légale.</h3>
      {/if}
      <p class="epilogue">{outcome.epilogue}</p>

      <div class="effects">
        {#each Object.entries(outcome.effects) as [k, v]}
          <span class="effect" class:positive={v > 0} class:negative={v < 0}>
            {k} {v > 0 ? '+' : ''}{v}
          </span>
        {/each}
      </div>

      <div class="actions">
        {#if onComplete}
          <button type="button" class="primary-btn" onclick={complete}>
            Valider et continuer
          </button>
        {/if}
        <button type="button" class="ghost-btn" onclick={reset}>
          Recommencer le formulaire
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .statut-juridique {
    color: #1A1411;
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .header {
    text-align: center;
    margin-bottom: 1rem;
  }

  .header h2 {
    margin: 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.2rem;
    letter-spacing: 0.06em;
    color: #5A2F1C;
  }

  .subtitle {
    margin: 0.2rem 0 0;
    font-size: 0.85rem;
    font-style: italic;
    color: rgba(26, 20, 17, 0.65);
  }

  .layout {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 1rem;
    align-items: start;
  }

  /* Formulaire papier vélin */
  .formulaire {
    position: relative;
    background:
      radial-gradient(ellipse at top right, rgba(140, 110, 64, 0.06), transparent 60%),
      linear-gradient(180deg, #FFF8E5 0%, #F4EDD8 100%);
    border: 1px solid rgba(140, 110, 64, 0.45);
    border-radius: 0.4rem;
    padding: 1rem 1.2rem 1.2rem;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      0 4px 14px rgba(90, 47, 28, 0.18);
  }

  .filigrane {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12rem;
    color: rgba(140, 110, 64, 0.06);
    pointer-events: none;
    user-select: none;
  }

  .form-head {
    text-align: center;
    margin-bottom: 1rem;
    padding-bottom: 0.7rem;
    border-bottom: 1px solid rgba(140, 110, 64, 0.3);
  }

  .form-head small {
    font-size: 0.72rem;
    color: rgba(26, 20, 17, 0.65);
    letter-spacing: 0.04em;
  }

  .form-head h3 {
    margin: 0.25rem 0;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.95rem;
    color: #5A2F1C;
    letter-spacing: 0.08em;
  }

  .champ {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.25rem;
    margin-bottom: 0.65rem;
  }

  .champ label {
    font-size: 0.78rem;
    color: rgba(26, 20, 17, 0.78);
    font-style: italic;
  }

  .champ select {
    background: rgba(255, 248, 229, 0.6);
    border: 1px solid rgba(140, 110, 64, 0.5);
    border-radius: 0.25rem;
    padding: 0.4rem 0.55rem;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.88rem;
    color: #1A1411;
    cursor: pointer;
  }

  .champ select:focus {
    outline: 2px solid #C9B26A;
    outline-offset: 1px;
  }

  /* Préfet — silhouette + commentaire */
  .prefet {
    margin-top: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.6rem 0.85rem;
    background: rgba(90, 47, 28, 0.08);
    border-left: 2px solid #5A2F1C;
    border-radius: 0.3rem;
  }

  .prefet-portrait {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5A2F1C, #1A1411);
    color: #C9B26A;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .prefet-text {
    font-size: 0.88rem;
    color: rgba(26, 20, 17, 0.85);
    line-height: 1.4;
  }

  .prefet-text strong {
    color: #5A2F1C;
  }

  /* Vignettes des formes */
  .vignettes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.55rem;
  }

  .vignette {
    background: rgba(20, 15, 12, 0.04);
    border: 1px solid rgba(140, 110, 64, 0.25);
    border-radius: 0.4rem;
    padding: 0.7rem 0.75rem;
    color: #1A1411;
    font-family: 'Source Serif 4', Georgia, serif;
    text-align: left;
    cursor: pointer;
    transition:
      transform 0.22s cubic-bezier(0.34, 1.2, 0.64, 1),
      border-color 0.22s ease,
      background 0.22s ease,
      filter 0.22s ease;
    filter: grayscale(0.9) opacity(0.55);
  }

  .vignette.active {
    background: rgba(255, 248, 229, 0.85);
    border-color: #8C6E40;
    filter: none;
    box-shadow: 0 2px 8px rgba(90, 47, 28, 0.18);
  }

  .vignette.active:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: #C9B26A;
    box-shadow: 0 4px 14px rgba(90, 47, 28, 0.28);
  }

  .vignette.chosen {
    border-color: #5A2F1C;
    box-shadow: 0 0 16px rgba(122, 30, 27, 0.25);
  }

  .vignette:disabled {
    cursor: not-allowed;
  }

  .vignette h4 {
    margin: 0 0 0.2rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.88rem;
    color: #5A2F1C;
    letter-spacing: 0.04em;
  }

  .vignette-motto {
    margin: 0 0 0.4rem;
    font-size: 0.78rem;
    font-style: italic;
    color: rgba(26, 20, 17, 0.7);
    line-height: 1.3;
  }

  .vignette-stats {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.05rem 0.6rem;
    margin: 0;
    font-size: 0.74rem;
    line-height: 1.3;
  }

  .vignette-stats dt {
    color: rgba(26, 20, 17, 0.65);
  }

  .vignette-stats dd {
    margin: 0;
    color: #1A1411;
    font-weight: 600;
    text-align: right;
  }

  .vignette-cta {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.2rem 0.55rem;
    background: #c89b3c;
    color: #0d1014;
    border-radius: 0.25rem;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Verdict — sceau de cire qui tombe */
  .verdict {
    text-align: center;
    padding: 2rem 1rem;
    background:
      radial-gradient(ellipse at top, rgba(244, 213, 140, 0.08), transparent 70%),
      linear-gradient(180deg, #FFF8E5 0%, #F4EDD8 100%);
    border: 1px solid rgba(140, 110, 64, 0.4);
    border-radius: 0.5rem;
  }

  .sceau {
    margin: 0 auto 1.2rem;
    width: 96px;
    height: 96px;
  }

  .sceau-circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #9B2A26 0%, #7A1E1B 60%, #5A1410 100%);
    color: #F4D58C;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.6rem;
    text-align: center;
    letter-spacing: 0.05em;
    line-height: 1.3;
    box-shadow:
      inset 0 4px 8px rgba(255, 255, 255, 0.18),
      inset 0 -6px 12px rgba(0, 0, 0, 0.3),
      0 6px 18px rgba(122, 30, 27, 0.4);
  }

  .verdict h3 {
    margin: 0 0 0.8rem;
    font-family: 'Cinzel', Georgia, serif;
    color: #5A2F1C;
    letter-spacing: 0.06em;
  }

  .verdict h3.failed {
    color: #6B1014;
  }

  .epilogue {
    max-width: 38rem;
    margin: 0 auto 1.2rem;
    line-height: 1.6;
    color: #1A1411;
  }

  .effects {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 1rem 0;
  }

  .effect {
    padding: 0.2rem 0.55rem;
    border-radius: 0.3rem;
    font-family: 'Courier Prime', monospace;
    font-size: 0.85rem;
    background: rgba(140, 110, 64, 0.18);
    border: 1px solid rgba(140, 110, 64, 0.4);
  }

  .effect.positive { background: rgba(58, 107, 71, 0.18); color: #1F4A2C; border-color: rgba(58, 107, 71, 0.4); }
  .effect.negative { background: rgba(176, 24, 30, 0.18); color: #6B1014; border-color: rgba(176, 24, 30, 0.4); }

  .actions {
    display: flex;
    justify-content: center;
    gap: 0.7rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .primary-btn,
  .ghost-btn {
    background: #c89b3c;
    color: #0d1014;
    border: 1px solid #c89b3c;
    padding: 0.55rem 1rem;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.88rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: filter 0.18s ease, transform 0.18s ease;
  }

  .primary-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

  .ghost-btn {
    background: transparent;
    color: rgba(26, 20, 17, 0.65);
    border-color: rgba(140, 110, 64, 0.4);
  }

  .ghost-btn:hover {
    background: rgba(140, 110, 64, 0.08);
    color: #1A1411;
  }

  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .vignettes {
      grid-template-columns: 1fr;
    }
  }
</style>
