<script lang="ts">
  /**
   * Frise vivante — UX-#7.
   *
   * Au lieu d'une frise linéaire passive, on superpose les sceaux
   * des institutions construites (or) et des accords signés (or
   * brillant) à leur position chronologique réelle. La frise
   * devient un carnet de bord visuel — le joueur voit son œuvre
   * s'inscrire dans le temps au fil des tours.
   *
   * Neuro : effet de dotation (Thaler) + frise spatialisée comme
   * support à la mémoire épisodique. Voir ses sceaux apparaître
   * sur la timeline encode différemment qu'une simple liste.
   */
  import { ERAS } from '../../game/content/eras';
  import { institutionById } from '../../game/content/institutionsRegistry';
  import { rebirth } from '../../game/engine/gameState.svelte';

  interface Props {
    currentTurn: number;
  }

  let { currentTurn }: Props = $props();

  function statusOf(fromTurn: number, idx: number): 'past' | 'current' | 'future' {
    const next = ERAS[idx + 1];
    if (currentTurn < fromTurn) return 'future';
    if (next && currentTurn >= next.fromTurn) return 'past';
    return 'current';
  }

  /* Position relative (0..1) sur la frise pour une année donnée.
     On utilise le firstYear de chaque ère + interpolation linéaire. */
  function positionForYear(year: number): number {
    const firstEra = ERAS[0]!;
    const lastEra = ERAS[ERAS.length - 1]!;
    const minYear = firstEra.firstYear ?? 1789;
    const maxYear = (lastEra.firstYear ?? 2026) + 4;
    return (year - minYear) / (maxYear - minYear);
  }

  /* Extrait l'année d'une institution depuis son record (chaîne
     comme « 1945 » ou « 1864 » ; on prend le premier nombre 4-digit). */
  function yearOfInstitution(id: string): number | null {
    const inst = institutionById(id);
    if (!inst) return null;
    const m = inst.year.match(/(\d{4})/);
    return m ? parseInt(m[1]!, 10) : null;
  }

  /* Pour les accords majeurs signés (qui ne sont pas dans le registre
     des institutions), on a un mapping minimal. */
  const ACCORD_YEARS: Record<string, { year: number; label: string }> = {
    'matignon-1936': { year: 1936, label: 'Matignon' },
    'grenelle-1968': { year: 1968, label: 'Grenelle' }
  };

  const seals = $derived.by(() => {
    const s = rebirth.state;
    if (!s) return [];
    const out: Array<{ pos: number; label: string; tone: 'institution' | 'accord' }> = [];
    for (const id of s.memory.builtInstitutions) {
      const y = yearOfInstitution(id);
      const inst = institutionById(id);
      if (y === null || !inst) continue;
      out.push({ pos: positionForYear(y), label: `${inst.label} · ${inst.year}`, tone: 'institution' });
    }
    for (const id of s.memory.signedMajorAccords) {
      const def = ACCORD_YEARS[id];
      if (!def) continue;
      out.push({ pos: positionForYear(def.year), label: `${def.label} · ${def.year}`, tone: 'accord' });
    }
    return out;
  });
</script>

<div class="frise-wrap">
  <ol class="timeline" aria-label="Frise chronologique">
    {#each ERAS as era, i}
      {@const status = statusOf(era.fromTurn, i)}
      <li class="dot" data-status={status} title={`${era.name} · ${era.period}`}>
        <span class="dot-mark" aria-hidden="true"></span>
        <span class="dot-label">{era.firstYear}</span>
      </li>
    {/each}
  </ol>

  {#if seals.length > 0}
    <div class="seals-track" aria-hidden="true">
      {#each seals as seal}
        <span
          class="seal"
          data-tone={seal.tone}
          style="left: {(seal.pos * 100).toFixed(2)}%"
          title={seal.label}
        >★</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .frise-wrap {
    position: relative;
    padding-bottom: 0.9rem;
  }

  .timeline {
    display: flex;
    align-items: center;
    gap: 0.18rem;
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-x: auto;
  }

  .dot {
    flex: 1 1 0;
    min-width: 1.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.18rem;
    position: relative;
  }

  .dot:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 0.32rem;
    left: 50%;
    width: 100%;
    height: 1px;
    background: rgba(237, 228, 201, 0.18);
    z-index: 0;
  }

  .dot[data-status='past']:not(:last-child)::after,
  .dot[data-status='current']:not(:last-child)::after {
    background: rgba(244, 213, 139, 0.5);
  }

  .dot-mark {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    background: rgba(237, 228, 201, 0.18);
    z-index: 1;
    transition: transform 0.18s ease, background 0.18s ease;
  }

  .dot[data-status='past'] .dot-mark {
    background: rgba(244, 213, 139, 0.55);
  }

  .dot[data-status='current'] .dot-mark {
    background: #f4d58b;
    transform: scale(1.6);
    box-shadow: 0 0 6px 1px rgba(244, 213, 139, 0.55);
  }

  .dot-label {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.74rem;
    color: rgba(237, 228, 201, 0.45);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .dot[data-status='past'] .dot-label {
    color: rgba(244, 213, 139, 0.55);
  }

  .dot[data-status='current'] .dot-label {
    color: #f4d58b;
    font-weight: 700;
  }

  /* === Sceaux de la frise vivante === */
  .seals-track {
    position: absolute;
    bottom: 0;
    left: 0.4rem;
    right: 0.4rem;
    height: 0.85rem;
    pointer-events: none;
  }

  .seal {
    position: absolute;
    transform: translateX(-50%);
    pointer-events: auto;
    cursor: help;
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.75rem;
    line-height: 1;
    user-select: none;
    transition: transform 0.18s ease, color 0.18s ease;
  }

  .seal[data-tone='institution'] {
    color: #f4d58b;
    text-shadow: 0 0 4px rgba(244, 213, 139, 0.55);
  }

  .seal[data-tone='accord'] {
    color: #fde68a;
    text-shadow: 0 0 6px rgba(253, 230, 138, 0.7);
  }

  .seal:hover {
    transform: translateX(-50%) scale(1.4);
  }
</style>
