<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  interface Props {
    onEnter: () => void;
  }
  let { onEnter }: Props = $props();
</script>

<div class="landing" in:fade={{ duration: 600 }}>
  <div class="ornament-top" aria-hidden="true">❦</div>

  <header class="hero">
    <p class="overline" in:fly={{ y: -8, duration: 500, delay: 80 }}>
      Une simulation historique française · 1789 — 2026
    </p>
    <h1 class="title" in:fly={{ y: 12, duration: 700, delay: 160 }}>
      Paritas
    </h1>
    <p class="subtitle" in:fly={{ y: 8, duration: 600, delay: 280 }}>
      La table des Ateliers
    </p>
    <div class="rule" in:fade={{ duration: 600, delay: 380 }}></div>
  </header>

  <section class="pitch" in:fade={{ duration: 600, delay: 440 }}>
    <p class="lead">
      Le patron et le salarié ne sont presque jamais d'accord.
      Parfois, ils acceptent de s'asseoir à la même table.
    </p>
    <p>
      Tu prends place — d'un côté ou de l'autre. Tu négocies les salaires,
      le chômage, la santé, la retraite. Tu rejoues deux siècles de luttes
      et de compromis : <em>cahiers de doléances</em>, <em>Le Chapelier</em>,
      <em>charte d'Amiens</em>, <em>Matignon</em>, <em>Sécurité sociale</em>,
      <em>Mai 68</em>, <em>retraites 2023</em>.
    </p>
    <p class="warn">
      Aucune décision n'est neutre. Chaque choix construit une trajectoire
      historique — c'est un exercice de mémoire collective.
    </p>
  </section>

  <section class="stats" in:fade={{ duration: 600, delay: 560 }}>
    <div class="stat">
      <span class="num">100</span>
      <span class="lbl">décisions</span>
    </div>
    <div class="stat-sep" aria-hidden="true">·</div>
    <div class="stat">
      <span class="num">2</span>
      <span class="lbl">camps</span>
    </div>
    <div class="stat-sep" aria-hidden="true">·</div>
    <div class="stat">
      <span class="num">15</span>
      <span class="lbl">ères</span>
    </div>
    <div class="stat-sep" aria-hidden="true">·</div>
    <div class="stat">
      <span class="num">∞</span>
      <span class="lbl">trajectoires</span>
    </div>
  </section>

  <section class="cta" in:fade={{ duration: 600, delay: 700 }}>
    <button type="button" class="cta-btn" onclick={onEnter}>
      Entrer dans l'histoire
    </button>
    <p class="cta-hint">
      Tu choisiras ton camp et ton personnage à l'écran suivant.
    </p>
  </section>

  <footer class="foot" in:fade={{ duration: 600, delay: 820 }}>
    <p>
      Inspiré du paritarisme français — la cogestion des caisses sociales
      par syndicats et patronat depuis 1945.
    </p>
  </footer>

  <div class="ornament-bot" aria-hidden="true">❦</div>
</div>

<style>
  .landing {
    max-width: 44rem;
    margin: 0 auto;
    padding: 2.4rem 1.5rem 3rem;
    text-align: center;
    color: #ede4c9;
    position: relative;
  }

  .ornament-top,
  .ornament-bot {
    color: rgba(244, 213, 139, 0.35);
    font-size: 1.4rem;
    line-height: 1;
    margin: 0.5rem 0;
  }

  .ornament-bot {
    margin-top: 2.2rem;
  }

  .hero {
    margin-top: 1.5rem;
  }

  .overline {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.78rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(244, 213, 139, 0.7);
    margin: 0 0 1.4rem;
  }

  .title {
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-size: clamp(3.4rem, 12vw, 7rem);
    line-height: 0.95;
    margin: 0;
    color: #c89b3c;
    text-shadow: 0 2px 20px rgba(200, 155, 60, 0.18);
    animation: title-glow 4.5s ease-in-out infinite;
  }

  @keyframes title-glow {
    0%, 100% { filter: drop-shadow(0 0 14px rgba(200, 155, 60, 0.18)); }
    50%      { filter: drop-shadow(0 0 28px rgba(244, 213, 139, 0.34)); }
  }

  .subtitle {
    font-family: 'Cinzel', Georgia, serif;
    font-size: clamp(1rem, 3.5vw, 1.4rem);
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: rgba(237, 228, 201, 0.9);
    margin: 0.55rem 0 0;
  }

  .rule {
    width: 6rem;
    height: 1px;
    margin: 1.6rem auto 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(244, 213, 139, 0.55) 50%,
      transparent 100%
    );
  }

  .pitch {
    margin: 2rem auto 0;
    max-width: 38rem;
    font-family: 'Source Serif 4', Georgia, serif;
    color: rgba(237, 228, 201, 0.9);
    font-size: clamp(0.95rem, 2.4vw, 1.05rem);
    line-height: 1.65;
    text-align: left;
  }

  .pitch p {
    margin: 0 0 0.85rem;
  }

  .pitch .lead {
    font-size: clamp(1.05rem, 2.7vw, 1.18rem);
    color: #ede4c9;
    font-style: italic;
    text-align: center;
    margin-bottom: 1.2rem;
  }

  .pitch em {
    color: #f4d58b;
    font-style: italic;
  }

  .pitch .warn {
    margin-top: 1.1rem;
    padding: 0.7rem 0.95rem;
    border-left: 2px solid rgba(220, 38, 38, 0.55);
    background: rgba(220, 38, 38, 0.06);
    color: rgba(237, 228, 201, 0.85);
    font-size: 0.94rem;
  }

  .stats {
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.6rem 0.9rem;
    margin: 2.2rem auto 0;
    padding: 1.1rem 1rem;
    border-top: 1px solid rgba(244, 213, 139, 0.18);
    border-bottom: 1px solid rgba(244, 213, 139, 0.18);
    max-width: 32rem;
  }

  .stat {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    min-width: 4rem;
  }

  .stat .num {
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: clamp(1.6rem, 5.5vw, 2.1rem);
    color: #f4d58b;
    line-height: 1;
  }

  .stat .lbl {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(237, 228, 201, 0.7);
  }

  .stat-sep {
    color: rgba(244, 213, 139, 0.35);
    font-size: 1.4rem;
    line-height: 1;
    align-self: center;
  }

  .cta {
    margin: 2.4rem auto 0;
  }

  .cta-btn {
    background: #c89b3c;
    color: #0d1014;
    border: none;
    border-radius: 0.55rem;
    padding: 1.05rem 2.4rem;
    font-family: 'Cinzel', Georgia, serif;
    font-weight: 700;
    font-size: clamp(0.95rem, 2.6vw, 1.05rem);
    letter-spacing: 0.10em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow:
      0 6px 24px rgba(200, 155, 60, 0.32),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
    transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
  }

  .cta-btn:hover,
  .cta-btn:focus-visible {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow:
      0 10px 32px rgba(200, 155, 60, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    outline: none;
  }

  .cta-btn:active {
    transform: translateY(0);
  }

  .cta-hint {
    margin: 0.85rem 0 0;
    font-size: 0.82rem;
    color: rgba(237, 228, 201, 0.55);
    font-style: italic;
  }

  .foot {
    margin: 2.4rem auto 0;
    max-width: 32rem;
    color: rgba(237, 228, 201, 0.5);
    font-size: 0.82rem;
    line-height: 1.5;
    font-style: italic;
  }

  .foot p {
    margin: 0;
  }

  /* Sur mobile très étroit, on resserre les padding pour ne pas
     écraser le titre. */
  @media (max-width: 380px) {
    .landing { padding: 1.6rem 1rem 2rem; }
    .stats { gap: 0.4rem 0.6rem; padding: 0.9rem 0.6rem; }
    .stat-sep { display: none; }
  }

  /* Respect des préférences réduites de mouvement. */
  @media (prefers-reduced-motion: reduce) {
    .title { animation: none; }
  }
</style>
