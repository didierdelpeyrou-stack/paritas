<script lang="ts">
  /* Argus UX-3 — Modale de génération du journal IA personnalisé.
     Affiche le streaming live + propose copie / téléchargement
     Markdown / réessai à la fin. Fallback explicite si le worker
     n'est pas configuré (VITE_NARRATIVE_API absent). */
  import { fade, scale } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import {
    streamJournalAI,
    buildJournalInput,
    isJournalAIEnabled
  } from '../../game/narrative/journalAI';
  import type { EndingRender } from '../../game/engine/endingEngine';
  import { rebirth } from '../../game/engine/gameState.svelte';

  interface Props {
    ending: EndingRender;
    onClose: () => void;
  }
  let { ending, onClose }: Props = $props();

  type Phase = 'idle' | 'streaming' | 'done' | 'error';
  let phase = $state<Phase>('idle');
  let text = $state<string>('');
  let errReason = $state<string>('');
  let copyFlash = $state(false);
  let abortCtl: AbortController | null = null;

  const enabled = isJournalAIEnabled();

  function start() {
    if (!enabled) return;
    const state = rebirth.state;
    if (!state) return;
    phase = 'streaming';
    text = '';
    errReason = '';
    abortCtl?.abort();
    abortCtl = new AbortController();

    const input = buildJournalInput(state, ending, rebirth.log ?? []);
    void streamJournalAI(
      input,
      {
        onChunk: (c) => {
          text = c;
        },
        onComplete: (final) => {
          text = final;
          phase = 'done';
        },
        onError: (reason) => {
          phase = 'error';
          errReason =
            reason === 'no-endpoint'
              ? "Aucun endpoint IA configuré (VITE_NARRATIVE_API)."
              : reason === 'timeout'
              ? 'Délai dépassé. Réseau lent ?'
              : reason === 'abort'
              ? 'Génération interrompue.'
              : 'Erreur réseau ou serveur.';
        }
      },
      abortCtl.signal
    );
  }

  function copyToClipboard() {
    if (!text) return;
    void navigator.clipboard?.writeText(text).then(() => {
      copyFlash = true;
      setTimeout(() => (copyFlash = false), 1400);
    });
  }

  function downloadMarkdown() {
    if (!text) return;
    const safeName = (rebirth.state?.name || 'partie').replace(/[^a-zA-Z0-9-_]/g, '_');
    const lines = [
      `# Journal de ${rebirth.state?.name || '—'}`,
      '',
      `*${ending.title} · ${ending.score}/100 · ${ending.stats.turnsPlayed} tours joués*`,
      '',
      text,
      '',
      '---',
      `*Généré par Paritas · IA Claude · ${new Date().toLocaleDateString('fr-FR')}*`
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paritas-journal-${safeName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  onMount(() => {
    document.addEventListener('keydown', handleKey);
    /* Auto-start au montage si le worker est dispo. */
    if (enabled) start();
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKey);
    abortCtl?.abort();
  });
</script>

<div
  class="ai-overlay"
  in:fade={{ duration: 240 }}
  out:fade={{ duration: 200 }}
  role="dialog"
  aria-modal="true"
  aria-label="Journal personnalisé généré par IA"
>
  <article class="ai-modal" in:scale={{ duration: 320, start: 0.94 }}>
    <header class="ai-head">
      <div class="ai-head-left">
        <span class="ai-badge" aria-hidden="true">✨ IA</span>
        <h2>Journal personnel — {rebirth.state?.name || '—'}</h2>
      </div>
      <button
        type="button"
        class="ai-close"
        onclick={onClose}
        aria-label="Fermer la modale"
      >×</button>
    </header>

    <div class="ai-meta">
      <span><strong>{ending.title}</strong></span>
      <span>·</span>
      <span>{ending.score}/100</span>
      <span>·</span>
      <span>{ending.stats.turnsPlayed} tours</span>
    </div>

    {#if !enabled}
      <!-- Aucun endpoint IA configuré : on l'explique. -->
      <div class="ai-disabled">
        <p>
          La génération IA nécessite un endpoint Cloudflare Worker
          configuré via la variable <code>VITE_NARRATIVE_API</code>.
        </p>
        <p>
          En attendant, l'export Markdown classique
          (<em>Exporter le journal</em>) reste disponible — il contient
          ton trajet complet, les statistiques et le bilan du mandat.
        </p>
        <p class="ai-doc-hint">
          Setup détaillé dans <code>docs/UX_AI_JOURNAL.md</code>.
        </p>
      </div>
    {:else if phase === 'streaming' || phase === 'done'}
      <!-- Texte streamé. On rend live, les sauts de ligne sont
           respectés via white-space: pre-wrap. -->
      <div class="ai-body" data-phase={phase}>
        <p class="ai-text">{text || '⋯'}</p>
        {#if phase === 'streaming'}
          <span class="ai-cursor" aria-hidden="true"></span>
        {/if}
      </div>

      {#if phase === 'done'}
        <footer class="ai-footer" in:fade={{ duration: 240 }}>
          <button type="button" class="btn-ghost" onclick={start}>
            ↻ Régénérer
          </button>
          <button
            type="button"
            class="btn-ghost"
            onclick={copyToClipboard}
            class:flash={copyFlash}
          >
            {copyFlash ? '✓ Copié' : '⧉ Copier'}
          </button>
          <button type="button" class="btn-primary" onclick={downloadMarkdown}>
            ⬇ Télécharger .md
          </button>
        </footer>
        <p class="ai-credits">
          Généré par Claude Haiku via le worker Paritas. Le moteur
          déterministe du jeu n'est pas affecté — ce texte n'est qu'un
          enrichissement narratif.
        </p>
      {/if}
    {:else if phase === 'error'}
      <div class="ai-error">
        <p><strong>Génération impossible.</strong></p>
        <p class="ai-error-reason">{errReason}</p>
        <button type="button" class="btn-primary" onclick={start}>
          ↻ Réessayer
        </button>
      </div>
    {/if}
  </article>
</div>

<style>
  .ai-overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 11, 16, 0.78);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .ai-modal {
    background: linear-gradient(160deg, rgba(40, 26, 14, 0.96) 0%, rgba(20, 14, 8, 0.96) 100%);
    border: 1px solid rgba(244, 213, 139, 0.32);
    border-radius: 0.75rem;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
    width: min(680px, 100%);
    max-height: 86vh;
    display: flex;
    flex-direction: column;
    color: #ede4c9;
    overflow: hidden;
  }

  .ai-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem 0.6rem;
    border-bottom: 1px solid rgba(244, 213, 139, 0.18);
  }
  .ai-head-left {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
  }
  .ai-head h2 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.05rem;
    color: #f4d58b;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ai-badge {
    background: rgba(244, 213, 139, 0.14);
    color: #f4d58b;
    border: 1px solid rgba(244, 213, 139, 0.4);
    border-radius: 999px;
    padding: 0.15rem 0.55rem;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
  }
  .ai-close {
    border: none;
    background: transparent;
    color: rgba(237, 228, 201, 0.6);
    font-size: 1.4rem;
    cursor: pointer;
    line-height: 1;
    padding: 0 0.4rem;
  }
  .ai-close:hover,
  .ai-close:focus-visible {
    color: #f4d58b;
    outline: none;
  }

  .ai-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    color: rgba(237, 228, 201, 0.65);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    border-bottom: 1px solid rgba(244, 213, 139, 0.1);
  }

  .ai-body,
  .ai-disabled,
  .ai-error {
    padding: 1rem 1.25rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .ai-text {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.95rem;
    line-height: 1.65;
    color: #ede4c9;
    white-space: pre-wrap;
    margin: 0;
  }

  .ai-cursor {
    display: inline-block;
    width: 0.55ch;
    height: 1.1em;
    background: #f4d58b;
    margin-left: 2px;
    vertical-align: -0.2em;
    animation: ai-blink 1s steps(2) infinite;
  }
  @keyframes ai-blink {
    50% { opacity: 0; }
  }

  .ai-disabled p,
  .ai-error p {
    margin: 0 0 0.5rem;
    line-height: 1.5;
    font-size: 0.9rem;
  }
  .ai-disabled code,
  .ai-doc-hint code {
    background: rgba(244, 213, 139, 0.1);
    color: #f4d58b;
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
  }
  .ai-doc-hint {
    color: rgba(237, 228, 201, 0.55);
    font-size: 0.78rem;
    font-style: italic;
  }

  .ai-error-reason {
    color: #e8a09b;
    font-size: 0.85rem;
    font-style: italic;
  }

  .ai-footer {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid rgba(244, 213, 139, 0.18);
    flex-wrap: wrap;
  }
  .ai-footer button {
    flex: 1;
    min-width: 6rem;
  }

  .ai-credits {
    padding: 0 1.25rem 1rem;
    margin: 0;
    font-size: 0.7rem;
    line-height: 1.4;
    color: rgba(237, 228, 201, 0.5);
    font-style: italic;
  }

  .flash {
    color: #aedab5 !important;
    border-color: rgba(95, 181, 107, 0.4) !important;
  }

  /* prefers-reduced-motion : pas de pulsation curseur */
  @media (prefers-reduced-motion: reduce) {
    .ai-cursor {
      animation: none;
    }
  }
</style>
