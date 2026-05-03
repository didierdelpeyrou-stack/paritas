<script lang="ts">
  /**
   * Radar stratégique — UX-#8.
   *
   * Graphique en araignée à 6 axes (les 6 ressources). Superpose ta
   * position actuelle à 3 trajectoires modèles tirées des figures
   * légendaires : Jouhaux 1947 (paritariste), Croizat 1945
   * (réformateur d'État), Maire 1968 (CFDT-autogestion).
   *
   * Le joueur voit en un coup d'œil de quel modèle il s'approche
   * et de quel autre il s'éloigne.
   *
   * Neuro : modèles de comparaison sociale (Festinger). Le radar
   * fournit un cadre interprétatif qui permet l'évaluation
   * proximale (« je suis devenu plus Jouhaux que Maire »).
   */
  import type { Resources, ResourceKey } from '../game/types';

  interface Props {
    resources: Resources;
  }
  let { resources }: Props = $props();

  /* L'ordre des axes définit la disposition radiale.
     Vague α (Omnès #88) : ajout cohesionInterne (force interne)
     en face de rapportDeForce (force externe) — la tension visuelle
     entre les deux est la signature de la relation syndicale. */
  const AXES: ResourceKey[] = [
    'institution',       // 0° (top)
    'legitimite',        // 51°
    'caisse',            // 102°
    'rapportDeForce',    // 154° (force externe)
    'cohesionInterne',   // 206° (force interne — diamétralement opposée)
    'confiance',         // 257°
    'santeSociale'       // 308°
  ];

  const AXIS_LABELS: Record<ResourceKey, string> = {
    institution: 'Inst.',
    legitimite: 'Légi.',
    caisse: 'Caisse',
    rapportDeForce: 'F. ext.',
    cohesionInterne: 'F. int.',
    confiance: 'Conf.',
    santeSociale: 'Santé soc.'
  };

  /* Trajectoires modèles — valeurs typiques estimées de figures
     historiques au pic de leur action. Toutes en 0-100.
     cohesionInterne : Jouhaux haut (cogestion CGT structurée),
     Croizat moyen (forte ligne mais base diverse), Maire haut
     (CFDT 1968 dialogue interne très soutenu). */
  const MODELS: Record<string, { name: string; values: Resources; color: string }> = {
    jouhaux: {
      name: 'Jouhaux 1947',
      values: { institution: 78, legitimite: 70, caisse: 55, rapportDeForce: 35, cohesionInterne: 65, confiance: 55, santeSociale: 60 },
      color: '#3b82f6'
    },
    croizat: {
      name: 'Croizat 1945',
      values: { institution: 88, legitimite: 75, caisse: 65, rapportDeForce: 60, cohesionInterne: 55, confiance: 70, santeSociale: 80 },
      color: '#10b981'
    },
    maire: {
      name: 'Maire 1968',
      values: { institution: 55, legitimite: 65, caisse: 45, rapportDeForce: 70, cohesionInterne: 70, confiance: 75, santeSociale: 60 },
      color: '#f59e0b'
    }
  };

  /* === Géométrie === */
  const SIZE = 220;
  const C = SIZE / 2;
  const R = SIZE / 2 - 26; // marge pour les labels

  function pointFor(value: number, axisIndex: number): [number, number] {
    const angle = (axisIndex / AXES.length) * Math.PI * 2 - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, value)) / 100) * R;
    return [C + Math.cos(angle) * r, C + Math.sin(angle) * r];
  }

  function pathFor(values: Resources): string {
    return AXES
      .map((axis, i) => {
        const [x, y] = pointFor(values[axis], i);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .concat(['Z'])
      .join(' ');
  }

  function labelPos(axisIndex: number): [number, number] {
    const angle = (axisIndex / AXES.length) * Math.PI * 2 - Math.PI / 2;
    return [C + Math.cos(angle) * (R + 14), C + Math.sin(angle) * (R + 14)];
  }

  /* État du sélecteur de modèle. */
  let activeModel = $state<keyof typeof MODELS | 'none'>('none');
  const overlayPath = $derived(activeModel === 'none' ? null : pathFor(MODELS[activeModel]!.values));
  const playerPath = $derived(pathFor(resources));

  /* Affinité : distance entre joueur et modèle (somme des |diffs|). */
  function affinityWith(model: Resources): number {
    let dist = 0;
    for (const axis of AXES) {
      dist += Math.abs(resources[axis] - model[axis]);
    }
    return Math.round(100 - dist / 6); // proche de 100 = très affine
  }

  const affinities = $derived<Record<string, number>>({
    jouhaux: affinityWith(MODELS.jouhaux!.values),
    croizat: affinityWith(MODELS.croizat!.values),
    maire: affinityWith(MODELS.maire!.values)
  });

  const closest = $derived.by<keyof typeof MODELS>(() => {
    const arr = Object.entries(affinities) as Array<[keyof typeof MODELS, number]>;
    arr.sort((a, b) => b[1] - a[1]);
    return arr[0]![0];
  });
</script>

<section class="bordered-card p-4 space-y-2.5">
  <header class="flex items-baseline justify-between gap-2">
    <h3 class="font-display text-gold text-base">Trajectoire stratégique</h3>
    <em class="text-[0.7rem] italic text-parchment-dim/65">
      Tu te rapproches de <b class="not-italic text-gold-soft">{MODELS[closest].name}</b>
    </em>
  </header>

  <div class="radar-wrap">
    <svg viewBox="0 0 {SIZE} {SIZE}" width={SIZE} height={SIZE} class="radar" aria-label="Radar stratégique">
      <!-- Cercles concentriques 25/50/75/100 -->
      {#each [0.25, 0.5, 0.75, 1] as r}
        <circle cx={C} cy={C} r={R * r}
                fill="none"
                stroke="rgba(237,228,201,0.08)"
                stroke-width="0.5" />
      {/each}

      <!-- Axes radiaux -->
      {#each AXES as _axis, i}
        {@const [x, y] = pointFor(100, i)}
        <line x1={C} y1={C} x2={x} y2={y}
              stroke="rgba(237,228,201,0.1)"
              stroke-width="0.5" />
      {/each}

      <!-- Modèle de comparaison (en arrière-plan) -->
      {#if overlayPath}
        <path d={overlayPath}
              fill={MODELS[activeModel === 'none' ? 'jouhaux' : activeModel].color}
              fill-opacity="0.12"
              stroke={MODELS[activeModel === 'none' ? 'jouhaux' : activeModel].color}
              stroke-width="1.2"
              stroke-dasharray="3 2" />
      {/if}

      <!-- Polygone joueur (au premier plan) -->
      <path d={playerPath}
            fill="rgba(244,213,139,0.22)"
            stroke="#f4d58b"
            stroke-width="1.6"
            stroke-linejoin="round" />

      <!-- Points joueur -->
      {#each AXES as axis, i}
        {@const [x, y] = pointFor(resources[axis], i)}
        <circle cx={x} cy={y} r="2" fill="#f4d58b" />
      {/each}

      <!-- Labels des axes -->
      {#each AXES as axis, i}
        {@const [x, y] = labelPos(i)}
        <text x={x} y={y}
              fill="rgba(237,228,201,0.7)"
              text-anchor="middle"
              dominant-baseline="middle"
              font-family="'Cinzel', Georgia, serif"
              font-size="9">
          {AXIS_LABELS[axis]}
        </text>
      {/each}
    </svg>
  </div>

  <!-- Sélecteur de modèles avec affinité -->
  <div class="model-bar">
    {#each (['jouhaux', 'croizat', 'maire'] as Array<keyof typeof MODELS>) as key}
      <button
        type="button"
        class="model-btn"
        data-active={activeModel === key}
        style="--c: {MODELS[key].color}"
        onclick={() => (activeModel = activeModel === key ? 'none' : key)}
        title={`${MODELS[key].name} — affinité ${affinities[key]}%`}
      >
        <span class="dot" aria-hidden="true"></span>
        <span class="lbl">{MODELS[key].name}</span>
        <em class="aff">{affinities[key]}%</em>
      </button>
    {/each}
  </div>
</section>

<style>
  .radar-wrap {
    display: flex;
    justify-content: center;
  }

  .radar {
    max-width: 100%;
    height: auto;
  }

  .model-bar {
    display: flex;
    flex-direction: column;
    gap: 0.32rem;
  }

  .model-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(237, 228, 201, 0.14);
    border-radius: 0.45rem;
    background: rgba(13, 16, 20, 0.32);
    padding: 0.4rem 0.65rem;
    color: rgba(237, 228, 201, 0.85);
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .model-btn:hover {
    border-color: rgba(244, 213, 139, 0.35);
  }

  .model-btn[data-active='true'] {
    border-color: var(--c);
    background: color-mix(in srgb, var(--c) 12%, transparent);
  }

  .model-btn .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: var(--c);
  }

  .model-btn .lbl {
    flex: 1;
    color: #ede4c9;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-align: left;
  }

  .model-btn .aff {
    color: var(--c);
    font-style: normal;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    font-weight: 700;
  }
</style>
