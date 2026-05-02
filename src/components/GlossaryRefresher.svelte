<script lang="ts">
  /**
   * Rappel de glossaire — UX-N6.
   *
   * Neuro : effet d'espacement (Ebbinghaus, Bjork). La mémoire à
   * long terme se consolide par exposition espacée, pas par contact
   * unique. Ici on pioche un terme du glossaire que le joueur a soit
   * jamais vu, soit pas vu depuis 8+ tours, et on le présente en
   * tant que rappel doux dans la sidebar Mandat.
   *
   * Le composant gère lui-même la fenêtre de rappel via localStorage
   * (paritas_gloss_seen) — pas besoin de polluer le state engine.
   */
  import { GLOSSARY, type GlossaryEntry } from '../game/content/glossary';

  interface Props {
    /** Tour courant — utilisé pour calculer la fraîcheur. */
    turn: number;
  }
  let { turn }: Props = $props();

  type SeenMap = Record<string, number>; // term → turn last surfaced

  const KEY = 'paritas_gloss_seen';
  const COOLDOWN = 8; // tours minimum entre 2 expositions du même terme

  function loadSeen(): SeenMap {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return {};
      return JSON.parse(raw) as SeenMap;
    } catch {
      return {};
    }
  }

  function saveSeen(m: SeenMap) {
    try {
      localStorage.setItem(KEY, JSON.stringify(m));
    } catch {
      /* ignore */
    }
  }

  /* Pioche déterministe : on choisit le terme le moins récemment vu,
     déterminé par un hash sur le tour pour stabilité dans une session.
     Ne change qu'une fois par fenêtre de COOLDOWN tours. */
  function pickRefresher(turn: number): GlossaryEntry | null {
    const seen = loadSeen();
    const eligible = GLOSSARY.filter(e => {
      const last = seen[e.term];
      if (last === undefined) return true;
      return turn - last >= COOLDOWN;
    });
    if (eligible.length === 0) return null;
    /* Trier par fraîcheur (jamais vu d'abord, sinon plus ancien) */
    eligible.sort((a, b) => {
      const sa = seen[a.term] ?? -Infinity;
      const sb = seen[b.term] ?? -Infinity;
      return sa - sb;
    });
    return eligible[Math.min(eligible.length - 1, turn % 3)] ?? null;
  }

  const entry = $derived(pickRefresher(turn));

  /* Marque vu dès qu'un terme est affiché (et donc qu'on le voit
     vraiment dans la sidebar Mandat). */
  $effect(() => {
    if (!entry) return;
    const seen = loadSeen();
    if (seen[entry.term] === turn) return; // déjà noté ce tour
    seen[entry.term] = turn;
    saveSeen(seen);
  });
</script>

{#if entry}
  <section class="bordered-card p-3 space-y-1.5">
    <header class="flex items-baseline justify-between gap-2">
      <span class="text-xs uppercase tracking-wider text-parchment-dim/75">
        Lexique du jour
      </span>
      <em class="text-[0.7rem] italic text-parchment-dim/55">
        {entry.marker ?? ''}
      </em>
    </header>
    <div class="font-display text-gold-soft text-sm leading-tight">
      {entry.term}
    </div>
    <p class="text-xs text-parchment-dim/85 leading-relaxed">
      {entry.definition}
    </p>
  </section>
{/if}
