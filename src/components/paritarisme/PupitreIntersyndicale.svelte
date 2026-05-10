<script lang="ts">
  /**
   * Paritas — Pupitre "Intersyndicale" (Salarié).
   *
   * Côté droit du décor théâtral (symétrique du Pupitre Direction
   * mais pas identique : leviers militants au lieu de financiers,
   * posture & doctrine spécifiques au camp salarié).
   */
  import type {
    SalarieKPI,
    SalariePosture,
    SalarieManoeuvre,
    Doctrine
  } from '../../game/paritarisme/dialectic';

  const SALARIE_DOCTRINES: { id: Doctrine; label: string; punch: string }[] = [
    { id: 'reformiste',          label: 'Réformiste',          punch: 'accords ↑, radicalité ↓' },
    { id: 'syndicalismeLutte',   label: 'Syndicalisme de lutte', punch: 'pression ↑, caisse ↓' },
    { id: 'autogestionnaire',    label: 'Autogestionnaire',    punch: 'cohésion ↑, lent' },
    { id: 'juridiste',           label: 'Juridiste',           punch: 'légitimité ↑, lent' }
  ];

  const POSTURES: { id: SalariePosture; label: string; tag: string }[] = [
    { id: 'rapportForce',  label: 'Rapport de force',  tag: '✊ Exiger le maximum' },
    { id: 'compromis',     label: 'Compromis',         tag: '🤝 Proposition médiane' },
    { id: 'acquisCibles',  label: 'Acquis ciblés',     tag: '🎯 Mémoire longue' }
  ];

  const LEVIERS: { key: keyof Omit<SalarieManoeuvre, 'greveReconductible'>; label: string; hint: string }[] = [
    { key: 'tracts',            label: 'Tracts / AG',         hint: 'Adhésion ↑' },
    { key: 'preavisGreve',      label: 'Préavis grève',       hint: 'Pression ↑↑ · Caisse ↓' },
    { key: 'saisinePrudhomale', label: 'Saisine prud\'homale', hint: 'Légitimité ↑ T+4' },
    { key: 'coalitionInter',    label: 'Coalition intersyndicale', hint: 'Multiplicateur ×1.3' },
    { key: 'mediatisation',     label: 'Médiatisation',       hint: 'Opinion ↑ · Récup ↓' },
    { key: 'caisseSolidarite',  label: 'Caisse solidarité',   hint: 'Stocks (rien)' }
  ];

  interface Props {
    kpi: SalarieKPI;
    lockedDoctrine?: Doctrine;
    silhouetteAdversaire?: { label: string; marge: string };
    onsubmit?: (input: {
      doctrine: Doctrine;
      manoeuvre: SalarieManoeuvre;
      posture: SalariePosture;
    }) => void;
  }

  let { kpi, lockedDoctrine, silhouetteAdversaire, onsubmit }: Props = $props();

  let doctrine = $state<Doctrine>(lockedDoctrine ?? 'reformiste');
  let posture = $state<SalariePosture | null>(null);
  let greveReconductible = $state(false);

  let alloc = $state<Record<keyof Omit<SalarieManoeuvre, 'greveReconductible'>, number>>({
    tracts: 15, preavisGreve: 15, saisinePrudhomale: 15,
    coalitionInter: 15, mediatisation: 15, caisseSolidarite: 25
  });

  const total = $derived(
    alloc.tracts + alloc.preavisGreve + alloc.saisinePrudhomale +
    alloc.coalitionInter + alloc.mediatisation + alloc.caisseSolidarite
  );
  const isValid = $derived(total === 100 && posture !== null);

  function setLevier(k: keyof typeof alloc, v: number) {
    alloc[k] = Math.max(0, Math.min(100, Math.round(v)));
  }
  function rebalance() {
    const others = total - alloc.caisseSolidarite;
    alloc.caisseSolidarite = Math.max(0, 100 - others);
  }

  function handleSubmit() {
    if (!isValid || !posture) return;
    const m: SalarieManoeuvre = { ...alloc, greveReconductible };
    onsubmit?.({ doctrine, manoeuvre: m, posture });
  }

  function tone(value: number): 'low' | 'mid' | 'high' {
    if (value < 35) return 'low';
    if (value > 65) return 'high';
    return 'mid';
  }
</script>

<aside class="pupitre" data-side="salarie">
  <header>
    <h2>Intersyndicale</h2>
    <p class="role">Pupitre salarié · AG &amp; sections</p>
  </header>

  <section class="kpi-block">
    <h3>État de la base</h3>
    <div class="kpi-grid">
      <div class="kpi" data-tone={tone(kpi.povAchat)}>
        <span class="lbl">Pouvoir d'achat</span>
        <span class="val">{Math.round(kpi.povAchat)}</span>
      </div>
      <div class="kpi" data-tone={tone(kpi.droits)}>
        <span class="lbl">Droits</span>
        <span class="val">{Math.round(kpi.droits)}</span>
      </div>
      <div class="kpi" data-tone={tone(kpi.cohesion)}>
        <span class="lbl">Cohésion</span>
        <span class="val">{Math.round(kpi.cohesion)}</span>
      </div>
      <div class="kpi" data-tone={tone(kpi.legitimite)}>
        <span class="lbl">Légitimité</span>
        <span class="val">{Math.round(kpi.legitimite)}</span>
      </div>
    </div>
    {#if silhouetteAdversaire}
      <p class="silhouette">
        🔭 Silhouette direction : <b>{silhouetteAdversaire.label}</b> ·
        marge <b>{silhouetteAdversaire.marge}</b>
      </p>
    {/if}
  </section>

  <section class="doctrine-block">
    <h3>Doctrine {lockedDoctrine ? '🔒' : ''}</h3>
    <div class="doctrines">
      {#each SALARIE_DOCTRINES as d}
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

  <section class="manoeuvre">
    <h3>Énergie militante · {total}/100</h3>
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
      <input type="checkbox" bind:checked={greveReconductible} />
      <span>🔥 Armer la <em>grève reconductible</em> (×2 sur marge si Rapport de force)</span>
    </label>
    {#if total !== 100}
      <p class="warn">⚠ Total ≠ 100. Ajustez (ou la caisse sera recalibrée).</p>
    {/if}
  </section>

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
    background: linear-gradient(180deg, #14140c 0%, #0d0908 100%);
    color: #ede4c9;
    font-family: 'Source Serif 4', Georgia, serif;
    padding: 1rem;
    border-left: 2px solid rgba(217, 106, 91, 0.25);
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }
  header { text-align: left; }
  h2 {
    font-family: 'Cinzel', Georgia, serif;
    color: #d96a5b;
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
    color: #ffb09e;
    font-size: 1.05rem;
  }
  .silhouette {
    margin: 0.5rem 0 0;
    padding: 0.4rem 0.6rem;
    background: rgba(244, 213, 139, 0.06);
    border-left: 3px solid #c9b26a;
    font-size: 0.82rem;
    color: rgba(237, 228, 201, 0.85);
    font-style: italic;
  }
  .silhouette b { color: #f4d58b; font-style: normal; }

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
    border-color: #d96a5b;
    color: #ffb09e;
  }
  .doctrine-btn.active {
    background: rgba(217, 106, 91, 0.15);
    border-color: #d96a5b;
    color: #ffb09e;
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
  .levier label { color: rgba(237, 228, 201, 0.85); }
  .hint {
    color: rgba(237, 228, 201, 0.45);
    font-style: italic;
    font-size: 0.75rem;
  }
  .alloc-val {
    font-family: 'Source Code Pro', monospace;
    font-weight: 700;
    color: #ffb09e;
  }
  .levier.full .alloc-val { color: #d96a5b; }
  .levier input[type="range"] {
    width: 100%;
    accent-color: #d96a5b;
  }
  .latent {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.4rem 0.6rem;
    background: rgba(217, 106, 91, 0.12);
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
    border-color: #d96a5b;
    color: #ffb09e;
  }
  .posture-btn.active {
    background: rgba(217, 106, 91, 0.18);
    border-color: #d96a5b;
    color: #ffb09e;
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

  .cta-deposer {
    margin-top: auto;
    background: linear-gradient(135deg, #c89b3c, #d96a5b);
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
