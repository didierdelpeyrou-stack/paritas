<script lang="ts">
  /* ============================================================
     ArenaStandalone — point d'entrée /mini/arena/
     Refonte 2026-05-10 : remplace l'ancien BrawlArena (sim auto
     passive 14s + bouton Rallier) par L'Émeute (vrai brawler 2D
     jouable seul comme à 4, 60fps, inputs claviers, IA CPU).

     Ancien fichier conservé en backup conceptuel : BrawlArena.svelte
     reste utilisé par ManifSimulator.svelte (sim auto post-manif).
     Le standalone /mini/arena/ pointe désormais sur le vrai brawler.
     ============================================================ */
  import Emeute from './Emeute.svelte';
</script>

<Emeute />
