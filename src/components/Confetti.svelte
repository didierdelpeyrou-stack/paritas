<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    count?: number;
    colors?: string[];
    duration?: number;
  }

  let { count = 30, colors = ['#c89b3c', '#e07a3a', '#ede4c9', '#5fb56b'], duration = 2200 }: Props = $props();

  type Piece = { id: number; left: number; bg: string; dur: number; delay: number };
  let pieces = $state<Piece[]>([]);

  onMount(() => {
    pieces = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      bg: colors[Math.floor(Math.random() * colors.length)]!,
      dur: 1.6 + Math.random() * 1.4,
      delay: Math.random() * 0.4
    }));
    const t = setTimeout(() => { pieces = []; }, duration + 600);
    return () => clearTimeout(t);
  });
</script>

<div class="pointer-events-none fixed inset-0 z-40 overflow-hidden">
  {#each pieces as p (p.id)}
    <span class="absolute w-2 h-2 rounded-sm"
          style="left:{p.left}vw; top:-10px; background:{p.bg};
                 animation: fall {p.dur}s {p.delay}s linear forwards;"></span>
  {/each}
</div>

<style>
  @keyframes fall {
    0% { transform: translateY(0) rotate(0); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0.7; }
  }
</style>
