<script lang="ts">
  import { ERAS } from '../../game/content/eras';

  interface Props {
    currentTurn: number;
  }

  let { currentTurn }: Props = $props();

  /* On garde les ères modernes (avec firstYear) — l'Antiquité et le Moyen Âge
     sont juste l'introduction et déforment la frise. */
  const visible = ERAS.filter(e => e.firstYear !== undefined);

  function statusOf(fromTurn: number, idx: number): 'past' | 'current' | 'future' {
    const next = visible[idx + 1];
    if (currentTurn < fromTurn) return 'future';
    if (next && currentTurn >= next.fromTurn) return 'past';
    return 'current';
  }
</script>

<ol class="timeline" aria-label="Frise chronologique">
  {#each visible as era, i}
    {@const status = statusOf(era.fromTurn, i)}
    <li class="dot" data-status={status} title={`${era.name} · ${era.period}`}>
      <span class="dot-mark" aria-hidden="true"></span>
      <span class="dot-label">{era.firstYear}</span>
    </li>
  {/each}
</ol>

<style>
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
    font-size: 0.55rem;
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
</style>
