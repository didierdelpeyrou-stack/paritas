<script lang="ts">
  import { fly } from 'svelte/transition';
  import type { VoiceLine } from '../../game/types';
  import { TRAIT_LABELS } from '../../game/narrative/personalityEngine';

  interface Props {
    voices: VoiceLine[];
  }
  let { voices }: Props = $props();
</script>

{#if voices.length > 0}
  <div class="space-y-2">
    {#each voices as v, i}
      <div
        class="rounded-md border border-violet-500/30 bg-violet-500/5 px-3 py-2 text-sm italic text-parchment-dim"
        in:fly={{ y: 6, duration: 280, delay: i * 80 }}
      >
        <span class="text-xs uppercase tracking-wider text-violet-300/80 not-italic mr-2">
          Voix · {TRAIT_LABELS[v.trait]}
        </span>
        {v.text}
      </div>
    {/each}
  </div>
{/if}
