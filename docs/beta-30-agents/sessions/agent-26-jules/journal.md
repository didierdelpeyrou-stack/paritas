# Journal — Jules O., lentille streamer Twitch

**Build** : HEAD `0813c75` (sans build local — lecture statique du code).
**Cadre demandé** : auditer la stage centrale, la couche notif et le ticker
causal sous lentille « rétention 30s, lisible 1080p, drôle ou marquant ».
Puis simuler 2 parties live-stream-style : 1 patron compulsif rapide, 1
salarié réfléchi long.

> Note de cadrage. La fiche d'agent dans `.claude/agents/agent-26-jules.md`
> me décrit en lycéen Sciences Po. Le brief de session m'envoie en
> streamer indie 1500 followers. Je joue le streamer comme demandé,
> mais je garde l'œil pédagogique du lycéen quand il pique.

---

## Audit froid — 3 composants, lentille streamer

### CockpitShell.svelte (1491 lignes — la stage)

Ce que je vois en survol : un layout viewport-fit 100dvh
(`CockpitShell.svelte:5-12`), une `time-strip` (timeline + ticker +
bandeau forcing) en haut (`325-340`), une `<main class="sky">` au centre
qui scrolle, un panneau d'actions à gauche, des rails à droite. Le
`{#key gameState.turn + ':' + gameState.phase + ':' + (scenario?.id ?? 'none')}`
ligne `372` joue un `fly y:14` à chaque tour : **chaque décision relance
visuellement la stage**. C'est exactement ce qu'il faut en stream — le
chat capte le tournant.

**Rétention 30s** : ✅ probable. Le `crisis-active` ligne `307` (data
attribute sur `.cockpit`) doit déclencher un overlay rouge — je vois le
hook mais je dois croire le CSS. Le `upcoming-forcing-banner`
ligne `330-339` est l'élément le plus streamable du shell : « ☄ dans
3 tours — Mai 1968 ». Sur Twitch, ce genre de countdown fait poser les
manettes. Garder.

**Lisible 1080p** : moyen. Trop d'infos simultanées en théâtre :
TheatrePersonalityPanel à droite + TheatreActionsPanel à gauche +
SceneCard au centre + timeline + ticker + status bar. Sur ma capture
mentale, je compte 6 zones de lecture concurrentes. Un viewer qui
arrive en milieu de stream a 3 secondes pour comprendre où regarder.
**Pas streamable sans réduire le bruit ou ajouter un mode « focus
narratif »** (le `dimmed` ligne `368` fait déjà 50% du job, mais
seulement quand un onglet est ouvert).

**Hint how-to-play** ligne `388-399` : auto-dismissed à la 1ʳᵉ action
(`135-139`). Bon réflexe, mais sur stream la première action arrive en
T2/T3, donc le hint reste affiché 2 minutes. C'est du temps de stream
brûlé. Je laisserais une option `Skip tutoriel` plus visible.

### ToastStack.svelte (375 lignes — les notifs)

C'est là que j'ai souri. La métaphore diégétique
(`ToastStack.svelte:26-40`) — cahier de doléances pour la Révolution,
télégramme pour le XIXᵉ, note polycopiée pour les Trente Glorieuses,
mémo pour le présent — c'est **screenshot material**. Un viewer voit
défiler le support graphique selon l'ère, il prend la photo.

**Aversion à la perte ψ≈2** ligne `74-78` (`negative: 5000ms`,
`positive: 3200ms`) : malin. Les pertes restent plus longtemps. Sur
stream, le chat va commenter les pertes plus que les gains, donc le
timing colle.

**Mais** : la fusion crossings ≥2 lignes `149-168` produit un toast à
deux lignes (`pre-line`, ligne `241`) avec liste de ressources concat
par virgules. Sur 1080p à `font-size 0.78rem` (ligne `211`), c'est
lisible mais c'est dense. À 720p (mes viewers low-bandwidth), je doute.
**P1**.

**Critique méchante** : 22rem max-width (`217`) + `position: fixed
bottom right` (`191-194`). Sur ma layout streamer (overlay webcam en
bas-droit), les toasts se font bouffer. **P2** — pas un bug du jeu mais
un truc à savoir.

### NewsTicker.svelte (392 lignes — le ticker causal)

C'est le composant le plus streamable du build. Items causaux
(`NewsTicker.svelte:317-343`) avec `tone='oppose'` rouge / `acquiesce`
vert + `fresh` pulse 1.6s 3 itérations (`337-343`) = **mini-feedback
loop visible chat**. Quand je fais un choix patronal dur, le monde
réagit en oppose rouge dans le ticker → mon viewer comprend
sans que je narre.

Le **bouton pause** ligne `145-151` (P0-2 ORDA-008) est le détail qui
me sauve la session : sur Twitch je peux mettre pause pour lire
tranquille, expliquer au chat, reprendre. Mention spéciale.

`prefers-reduced-motion` ligne `253-261` géré : le ticker devient
scroll-x manuel. Bon pour les viewers epileptiques que j'aurai
forcément un jour.

**Reproche** : `font-size: 0.74rem` (`281`) sur fond
`linear-gradient(180deg, #1A1108 0%, #120B07 100%)` (`196`) — texte
quasi noir sur noir pour les items neutres (`color: rgba(244, 239,
226, 0.7)`). À 1080p OBS x264, c'est limite WCAG AA. À 720p, c'est
illisible. **P1 — contraste**.

**Items historiques cliquables** (`isInteractive`, ligne `108`) :
super idée mais le `→` (`action-glyph` ligne `367-377`) défile, donc
mon viewer voit l'opportunité passer puis disparaître. Je pause, je
clique, je reprends — OK c'est jouable. Mais sans la pause ça serait
frustrant.

---

## Run 1 — Patron compulsif, vitesse stream (T1→T35)

J'ouvre en mode patron, choix Compulsif. Caisse forte, légitimité au
plancher dès T6. Je décide vite, je commente fort. Mes viewers
adorent : « grind capitaliste ». Le NewsTicker me crache du causal
oppose toutes les 2-3 décisions, c'est satisfaisant comme un combo.
Au T15, le `upcoming-forcing-banner` annonce une crise à 3 tours, je
hype le chat. Crise tombe au T18, ConsequenceScene plein écran, mon
chat post `F`.

**Moment marquant** : T22, je crash legitimite à 12, le toast en
support-roneo (note polycopiée) sort « Légitimité en zone critique →
Presse ou Délégation » (`ToastStack.svelte:46-53`, `CRITICAL_HINT`).
Le hint contextuel vers l'atelier qui sauve = **clip Twitter**.
Argument vente : « le jeu te dit où aller pour réparer ».

**Ateliers testés en run patron** : Trésorerie (rapide, bon),
Manifestation (côté patron c'est briser une grève — oklm narratif),
Mandat (ouvert T15, lourd à parser en mode rapide). **Organisation**
unlock T12 — pas testé en compulsif, trop de menu pour le rythme.

## Run 2 — Salarié réfléchi, format long (T1→T70)

Mode Réfléchi, je lis tout. Là, le jeu devient un podcast interactif.
Mon viewership chute (Twitch déteste le slow), mais ceux qui restent
sont engagés. C'est plus le profil YouTube long-form que stream.

**Ateliers testés** : Trésorerie (T5), Mandat (T8), Talents (T9),
Organisation (T14), Manifestation (T20), Meeting (T28), Monde (T34) —
**les 7**. Le rythme de déverrouillage (`CockpitShell.svelte:283-290`)
fonctionne : chaque atelier arrive quand j'ai épuisé la nouveauté du
précédent. **Ça c'est du game design solide, pas du ludo-pédagogique**.

**Manifestation** (cortège, `ManifSimulator`) : le mini-jeu, j'aime.
Visuellement plus pauvre que ce que j'attendais, mais le réflexe
« combien de monde je sors, à quelle date » est bon.

**Meeting** : ouvert T28, je l'ai snobé 2 tours puis j'ai testé. Le
simulateur est plus contemplatif qu'il en a l'air. Mes viewers
adorent voter « quelle ligne tu défends ? » dans le chat.

**Monde** : ouvert T34 — je découvre la carte. Trop tard pour un
streamer qui veut tout montrer dans la première heure. **P2 — unlock
trop tardif pour les sessions de découverte stream**.

**Moment screenshot** : T42, double callback (causal acquiesce sur
base + oppose sur etat dans le ticker), avec un fresh pulse sur les
deux. Trois jauges franchissent un palier d'un coup → toast condensé
ligne `155-158` ToastStack. **C'est ce moment où le jeu chante**. Je
clip.

## Verdict streamer

Le bandeau forcing + le ticker causal + les toasts diégétiques font
le boulot — il y a des moments cinéma. Le shell central est
encombré pour un viewer qui arrive en milieu de stream. Le mode
Compulsif est plus viable Twitch que Réfléchi (qui est plus YT).
Les 7 ateliers tiennent comme contenu shareable, mais Monde unlock
T30 c'est la moitié du jeu — trop tard pour une découverte stream.
