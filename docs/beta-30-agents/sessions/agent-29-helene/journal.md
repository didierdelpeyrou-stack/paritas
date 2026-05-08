# Journal — Hélène, 67 ans, infirmière retraitée (ex-CFDT hôpital)

Build HEAD `0813c75`, 8 mai 2026, soir, sur ma tablette posée sur la table de cuisine.
Mes lunettes de lecture, un thé. Je n'ai pas joué à un jeu vidéo depuis Solitaire.
Mais Eric (mon petit-fils, 19 ans) m'a dit « mamie, tu vas adorer, ça parle de
syndicalisme ». Voyons.

## Avant la partie — premier contact (15 min)

L'écran d'accueil propose 3 ambiances. Je clique « Pédagogique » — c'est moi, ça.
Je vois aussi un bouton **Réglages** : j'y vais d'instinct. Bonne nouvelle, il y a
**Taille de texte → Grand** et **Lecture aérée**. Je coche les deux. Je teste
**Voix renforcées** : ça baisse la musique, parfait, mes oreilles à 67 ans
n'aiment pas la concurrence (`Settings.svelte:398-406`).

Mais le « Grand », c'est seulement **18px** (`app.css:38` : `font-size: 18px`).
À mon âge, je lis confortablement à partir de 22-24px. Je dois faire pinch-zoom
sur la tablette. Je grogne.

## Partie 1 — Salariée, mode Réfléchi, 30 tours

Je choisis le camp salarié. Le **tutoriel** (`Tutorial.svelte`) est bien rythmé,
4 écrans, je peux revenir en arrière. Le pavé « 6 ressources » est joli mais
les libellés sont en `text-xs` (0.74rem, `Tutorial.svelte:242`) — illisible
sans pinch.

Tour 1, je suis dans le cockpit. Le **hint mécanique** apparaît en haut
(`CockpitShell.svelte:388-409`) : « Bienvenue Hélène. Lis le scénario, puis
clique l'une des options ». Très bon, ça me parle. Je le laisse, il disparaîtra
tout seul après ma 1ʳᵉ action libre (`CockpitShell.svelte:135-139`).

Le **rythme** est entièrement à moi. Aucun timer, aucun auto-advance. Je peux
poser ma tablette, aller chercher un biscuit, revenir. C'est rare. Excellent
pour une joueuse comme moi.

J'ai joué les 7 ateliers en 90 minutes :
- **La Table** — négociation paritaire, j'adore, c'est mon métier ancien.
- **La Place** — manif, ambiance bien retranscrite. Mais le ticker d'actu en
  haut bouge trop vite, j'ai dû chercher comment le mettre en pause
  (`NewsTicker.svelte:147` — bon, le bouton existe, mais l'icône est minuscule).
- **La Grève** — bien.
- **Les Élections** — texte trop dense, j'ai lu deux fois.
- **NAO Simulation** — mécanique chiffres, OK.
- **Confrontation** / **Arena** — trop nerveux pour moi, j'ai abandonné.

Le **mode Réfléchi** est-il vraiment lent ? Oui, en termes de **densité de texte**
et **pas de pression temporelle**. C'est lent au sens « calme », pas « long ».
Très bien.

## Partie 2 — Patron, mode Compulsif, 12 tours

Je teste le mode rapide. Le texte est plus court, plus elliptique, plus
« sentir que comprendre ». Pour moi c'est trop allusif — je perds les enjeux.
Je rebascule en Réfléchi via Réglages au tour 12.

Le camp patron est jouable, je n'ai pas eu de honte sur les choix proposés.

## Synthèse

Le jeu est **jouable sans hâte** — c'est sa grande qualité. Les vrais problèmes
seniors sont la **typographie** (Grand = 18px, insuffisant) et quelques
**libellés sous 14px** dans le tutoriel et le ticker. L'architecture
accessibilité est là, il manque de pousser les curseurs.
