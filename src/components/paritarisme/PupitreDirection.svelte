<script lang="ts">
  /**
   * Paritas — Pupitre "Direction" (Patron).
   *
   * Côté gauche du décor théâtral. Présente :
   *   1. KPI courants en haut
   *   2. Doctrine active (verrouillée après le tour 1)
   *   3. Manœuvre — allocation budget 100u sur 6 leviers + plan social latent
   *   4. Posture pour la table (Cession / Tenir / Échange)
   *   5. CTA "Déposer à la table"
   *
   * Émet via `onsubmit` un objet { doctrine, manoeuvre, posture } prêt
   * à être consommé par resolveTable() côté méta-moteur.
   */
  import type {
    PatronKPI,
    PatronPosture,
    PatronManoeuvre,
    Doctrine
  } from '../../game/paritarisme/dialectic';

  /* === Catalogues UI === */
  const PATRON_DOCTRINES: { id: Doctrine; label: string; punch: string }[] = [
    { id: 'paternalisme',    label: 'Paternalisme',    punch: 'climat ↑, marge ↓' },
    { id: 'neoliberal',      label: 'Néolibéral',      punch: 'marge ↑, conflits ↑' },
    { id: 'technocratique',  label: 'Technocratique',  punch: 'capPol ↑, légit ↓' },
    { id: 'corporatiste',    label: 'Corporatiste',    punch: 'climat ↑, innov ↓' }
  ];

  const POSTURES: { id: PatronPosture; label: string; tag: string }[] = [
    { id: 'cession',  label: 'Cession',         tag: '🤝 Céder sur l\'enjeu' },
    { id: 'tenir',    label: 'Tenir la ligne',  tag: '🛡 Refus catégorique' },
    { id: 'echange',  label: 'Échange croisé',  tag: '⚖ Marchandage' }
  ];

  const LEVIERS: { key: keyof Omit<PatronManoeuvre, 'planSocialLatent'>; label: string; hint: string }[] = [
    { key: 'salaires',       label: 'Salaires',         hint: 'Climat ↑ · Marge ↓' },
    { key: 'investissement', label: 'Investissement',   hint: 'Productivité T+3' },
    { key: 'lobbying',       label: 'Lobbying',         hint: 'CapPol ↑ · Réputation ↓' },
    { key: 'sousTraitance',  label: 'Sous-traitance',   hint: 'Marge ↑ · Climat ↓↓' },
    { key: 'communication',  label: 'Communication',    hint: 'Réputation ↑' },
    { key: 'reserve',        label: 'Réserve',          hint: 'Liquidité (rien)' }
  ];

  interface Props {
    /** KPI courants à afficher. */
    kpi: PatronKPI;
    /** Doctrine pré-choisie (verrouille la sélection si fournie). */
    lockedDoctrine?: Doctrine;
    /** Doctrine adverse silhouettée (info imparfaite). */
    silhouetteAdversaire?: { label: string; legitimite: string };
    /** Callback à la dépose. */
    onsubmit?: (input: {
      doctrine: Doctrine;
      manoeuvre: PatronManoeuvre;
      posture: PatronPosture;
    }) => void;
  }

  let { kpi, lockedDoctrine, silhouetteAdversaire, onsubmit }: Props = $props();

  /* === État UI === */
  let doctrine = $state<Doctrine>(lockedDoctrine ?? 'technocratique');
  let posture = $state<PatronPosture | null>(null);
  let planSocialLatent = $state(false);

  /* Manœuvre : 6 leviers, somme = 100. Initialisée équirépartie. */
  let alloc = $state<Record<keyof Omit<PatronManoeuvre, 'planSocialLatent'>, number>>({
    salaires: 15, investissement: 15, lobbying: 15,
    sousTraitance: 15, communication: 15, reserve: 25
  });

  const total = $derived(
    alloc.salaires + alloc.investissement + alloc.lobbying +
    alloc.sousTraitance + alloc.communication + alloc.reserve
  );
  const isValid = $derived(total === 100 && posture !== null);

  function setLevier(k: keyof typeof alloc, v: number) {
    alloc[k] = Math.max(0, Math.min(100, Math.round(v)));
  }
  function rebalance() {
    /* Met le surplus/déficit dans la réserve. */
    const others = total - alloc.reserve;
    alloc.reserve = Math.max(0, 100 - others);
  }

  function handleSubmit() {
    if (!isValid || !posture) return;
    const m: PatronManoeuvre = {
      ...alloc,
      planSocialLatent
    };
    onsubmit?.({ doctrine, manoeuvre: m, posture });
  }

  function tone(value: number): 'low' | 'mid' | 'high' {
    if (value < 35) return 'low';
    if (value > 65) return 'high';
    return 'mid';
  }
</script>

<aside class="pupitre" data-side="patron">
  <header>
    <h2>Direction</h2>
    <p class="role">Pupitre patron · Conseil d'administration</p>
  </header>

  <!-- KPI section -->
  <section class="kpi-block">
    <h3>État actuel</h3>
    <div class="kpi-grid">
      <div class="kpi" data-tone={tone(kpi.marge)}>
        <span class="lbl">Marge</span>
        <span class="val">{Math.round(kpi.marge)}</span>
      </div>
      <div class="kpi" data-tone={tone(kpi.climat)}>
        <span class="lbl">Climat</span>
        <span class="val">{Math.round(kpi.climat)}</span>
      </div>
      <div class="kpi" data-tone={tone(kpi.capPol)}>
        <span class="lbl">Cap. politique</span>
        <span class="val">{Math.round(kpi.capPol)}</span>
      </div>
      <div class="kpi" data-tone={tone(kpi.reputation)}>
        <span class="lbl">Réputation</span>
        <span class="val">{Math.round(kpi.reputation)}</span>
      </div>
    </div>
    {#if silhouetteAdversaire}
      <p class="silhouette">
        🔭 Silhouette base salariée : <b>{silhouetteAdversaire.label}</b> ·
        légitimité <b>{silhouetteAdversaire.legitimite}</b>
      </p>
    {/if}
  </section>

  <!-- Doctrine -->
  <section class="doctrine-block">
    <h3>Doctrine {lockedDoctrine ? '🔒' : ''}</h3>
    <div class="doctrines">
      {#each PATRON_DOCTRINES as d}
        <button
          type="button"
          class="doctrine-btn"
          class:active={doctrine === d.id}
          disabled={!!lockedDoctrine && lockedDoctrine !== d.id}
          onclick={() => { if (!lockedDoctrine) doctrine = d.id; }}
        >
          <span class="d-label">{d.label}</span>
          <span class="d-punch">{d.punch}</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- Manœuvre budget -->
  <section class="manoeuvre">
    <h3>Manœuvre budget · {total}/100</h3>
    {#each LEVIERS as lev}
      <div class="levier" class:full={alloc[lev.key] >= 40}>
        <div class="lev-row">
          <label>
            {lev.label}
            <span class="hint">— {lev.hint}</span>
          </label>
          <span class="alloc-val">{alloc[lev.key]}</span>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          step="5"
          value={alloc[lev.key]}
          oninput={(e) => setLevier(lev.key, Number((e.target as HTMLInputElement).value))}
          onchange={rebalance}
        />
      </div>
    {/each}
    <label class="latent">
      <input type="checkbox" bind:checked={planSocialLatent} />
      <span>🔒 Poser un Plan Social <em>latent</em> (révélé si Tenir maintenu 3 tours)</span>
    </label>
    {#if total !== 100}
      <p class="warn">⚠ Total ≠ 100. Ajustez (ou la réserve sera recalibrée).</p>
    {/if}
  </section>

  <!-- Posture -->
  <section class="posture-block">
    <h3>Posture pour la table</h3>
    <div class="postures">
      {#each POSTURES as p}
        <button
          type="button"
          class="posture-btn"
          class:active={posture === p.id}
          onclick={() => (posture = p.id)}
        >
          <span class="p-label">{p.label}</span>
          <span class="p-tag">{p.tag}</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- CTA -->
  <button
    type="button"
    class="cta-deposer"
    disabled={!isValid}
    onclick={handleSubmit}
  >
    Déposer à la table →
  </button>
</aside>

<style>
  .pupitre {
    background: linear-gradient(180deg, #15100c 0%, #0d0908 100%);
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    padding: 1rem;
    border-right: 2px solid rgba(244, 213, 139, 0.25);
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }
  header { text-align: left; }
  h2 {
    font-family: 'Cinzel', Georgia, serif;
    color: #f4d58b;
    font-size: 1.4rem;
    margin: 0;
    letter-spacing: 0.04em;
  }
  .role {
    color: rgba(237, 228, 201, 0.55);
    font-style: italic;
    margin: 0.1rem 0 0;
    font-size: 0.85rem;
  }
  h3 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    color: #c9b26a;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.5rem;
  }

  /* KPI */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
  .kpi {
    background: rgba(13, 9, 8, 0.7);
    border: 1px solid rgba(237, 228, 201, 0.15);
    border-radius: 0.4rem;
    padding: 0.4rem 0.6rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .kpi[data-tone="low"] { border-color: #d96a5b; }
  .kpi[data-tone="high"] { border-color: #4ade80; }
  .kpi .lbl { font-size: 0.78rem; color: rgba(237, 228, 201, 0.7); }
  .kpi .val {
    font-family: 'Source Code Pro', monospace;
    font-weight: 700;
    color: #f4d58b;
    font-size: 1.05rem;
  }
  .silhouette {
    margin: 0.5rem 0 0;
    padding: 0.4rem 0.6rem;
    background: rgba(126, 180, 255, 0.08);
    border-left: 3px solid #7eb4ff;
    font-size: 0.82rem;
    color: rgba(237, 228, 201, 0.85);
    font-style: italic;
  }
  .silhouette b { color: #aac8ff; font-style: normal; }

  /* Doctrines */
  .doctrines {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;
  }
  .doctrine-btn {
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(237, 228, 201, 0.18);
    color: rgba(237, 228, 201, 0.78);
    padding: 0.45rem 0.55rem;
    border-radius: 0.35rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    font-family: inherit;
    text-align: left;
    transition: all 0.15s;
  }
  .doctrine-btn:hover:not(:disabled) {
    border-color: #c9b26a;
    color: #f4d58b;
  }
  .doctrine-btn.active {
    background: rgba(244, 213, 139, 0.12);
    border-color: #f4d58b;
    color: #f4d58b;
  }
  .doctrine-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .d-label {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.85rem;
    font-weight: 700;
  }
  .d-punch {
    font-family: 'Source Code Pro', monospace;
    font-size: 0.7rem;
    color: rgba(237, 228, 201, 0.6);
  }

  /* Manœuvre */
  .levier {
    margin-bottom: 0.5rem;
  }
  .lev-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.82rem;
    margin-bottom: 0.15rem;
  }
  .levier label {
    color: rgba(237, 228, 201, 0.85);
  }
  .hint {
    color: rgba(237, 228, 201, 0.45);
    font-style: italic;
    font-size: 0.75rem;
  }
  .alloc-val {
    font-family: 'Source Code Pro', monospace;
    font-weight: 700;
    color: #f4d58b;
  }
  .levier.full .alloc-val { color: #ffb09e; }
  .levier input[type="range"] {
    width: 100%;
    accent-color: #c89b3c;
  }
  .latent {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.4rem 0.6rem;
    background: rgba(217, 106, 91, 0.08);
    border-left: 3px solid #d96a5b;
    font-size: 0.82rem;
    color: rgba(237, 228, 201, 0.85);
    cursor: pointer;
  }
  .latent em { color: #ffb09e; }
  .warn {
    margin: 0.4rem 0 0;
    color: #ffb09e;
    font-size: 0.78rem;
    font-style: italic;
  }

  /* Postures */
  .postures {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .posture-btn {
    background: rgba(13, 9, 8, 0.85);
    border: 1px solid rgba(237, 228, 201, 0.18);
    color: rgba(237, 228, 201, 0.78);
    padding: 0.5rem 0.7rem;
    border-radius: 0.35rem;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.15s;
  }
  .posture-btn:hover {
    border-color: #c9b26a;
    color: #f4d58b;
  }
  .posture-btn.active {
    background: rgba(244, 213, 139, 0.15);
    border-color: #f4d58b;
    color: #f4d58b;
  }
  .p-label {
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.92rem;
  }
  .p-tag {
    font-size: 0.78rem;
    color: rgba(237, 228, 201, 0.55);
  }

  /* CTA */
  .cta-deposer {
    margin-top: auto;
    background: linear-gradient(135deg, #c89b3c, #d4a020);
    border: none;
    color: #0d0908;
    padding: 0.75rem 1rem;
    border-radius: 0.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .cta-deposer:hover:not(:disabled) { transform: translateY(-2px); }
  .cta-deposer:disabled {
    background: #555;
    color: rgba(13, 9, 8, 0.5);
    cursor: not-allowed;
  }
</style>
