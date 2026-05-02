# Audit audio Paritas — mai 2026

Audit fictif post-déploiement du « théâtre sonore » (commit `e15f767`).
22 béta-testeurs aux profils variés, 10 critiques spécialisés.
Le but : sortir de la chambre d'écho dev, anticiper les retours
pré-launch.

---

## 22 béta-testeurs

### Section A — Joueurs grand public

**1. Camille, 34 ans, Lyon, Chrome desktop, casque Bluetooth**
> *« La Marseillaise au tour 1 c'est saisissant. Mais quand on
> arrive en 1840, la transition est sèche — j'entends encore la
> fin de la Marseillaise se couper, et la nouvelle musique commence
> brutalement. Crossfade trop court ? »*
> ➜ Action : passer crossfadeRestart de 1200 ms à 2000 ms pour les
> changements d'ère.

**2. Mehdi, 22 ans, Paris, Firefox mobile (Android)**
> *« Sur Firefox Android le discours TTS ne marche pas. Pas de voix
> française installée par défaut, j'ai juste vu le texte sous-titré.
> C'est bien d'avoir le fallback texte mais l'effet est cassé. »*
> ➜ Action : afficher le texte du discours systématiquement comme
> sous-titre, même quand la voix marche, en petit caractère.

**3. Sophie, 51 ans, Bordeaux, Safari iOS, oreillettes filaires**
> *« Premier clic sur ♫ : rien ne se passe pendant 1 seconde puis
> la musique démarre fort. Pourrait-on baisser le gain de l'attaque
> initiale ? »*
> ➜ Action : ajouter un fadeIn 1.5s sur la première activation
> (musicGain ramps from 0 to target sur 1.5s).

**4. Thomas, 16 ans, Nantes, Chromebook scolaire (audio désactivé)**
> *« Le jeu marche très bien sans son, mais j'ai l'impression de
> rater quelque chose. Vous pourriez ajouter une icône qui
> clignote quand un discours important est lu, pour montrer qu'il
> y a du contenu audio que je manque ? »*
> ➜ Action : badge « 🔊 discours en cours » qui clignote pendant
> les TTS, même musique off.

**5. Léa, 28 ans, Lille, Chrome desktop, enceintes hifi**
> *« Le Bolero / Internationale entre-deux-guerres est parfait,
> on sent l'époque. Par contre la "happy string quartet" pour
> Belle Époque me sort du jeu — trop joyeux pour 1908, c'est plus
> 1990s mariage. »*
> ➜ Action : remplacer belle_epoque.mp3 par un Debussy/Ravel.

**6. Ahmed, 41 ans, Marseille, AirPods Pro, transport en commun**
> *« Dans le métro avec les transports c'est dur d'entendre les
> chuchotements de "whispers-assembly". Soit on entend rien, soit
> on monte le volume et la musique est trop forte. Plage dynamique
> trop large. »*
> ➜ Action : compresseur léger sur sfxGain (Tone.Compressor
> threshold -18 dB ratio 3:1).

**7. Inès, 19 ans, Toulouse, écouteurs sans-marque, qualité moyenne**
> *« Les applaudissements en bouche au tour 8 (Matignon signature)
> sonnent bizarre — comme si y avait un écho. Le jouer une seule
> fois suffit. »*
> ➜ Action : vérifier si applause-soft + ovation('soft') ne se
> déclenchent pas en double.

**8. Pierre-Yves, 67 ans, Quimper, retraité, casque ouvert**
> *« Le discours TTS du syndicaliste tour 12 a démarré APRÈS que
> j'aie cliqué sur ma réponse. Il a parlé sur la conséquence, c'est
> bizarre — la musique a baissé, j'ai rien compris à la suite. »*
> ➜ Action : interrompre le TTS quand le joueur change de phase
> de scénario (cleanup dans $effect).

### Section B — Joueurs avec besoins spécifiques (a11y)

**9. Maxime, 29 ans, Rennes, sourd profond, lecteur d'écran NVDA**
> *« Le sous-titre du discours TTS apparaît dans la cérémonie mais
> NVDA ne le lit pas — il faut un aria-live="polite". Et merci
> pour le fallback texte, c'est rare. »*
> ➜ Action : ajouter aria-live="polite" sur la zone speechSubtitle
> de SignatureCeremony.

**10. Yasmine, 35 ans, Strasbourg, malentendante (appareils auditifs)**
> *« Je n'entends pas bien les graves. La basse de la musique
> Macron II me masque les voix. Idéalement, un bouton "boost
> dialogues" qui réduit la musique de -6 dB et augmente le SFX
> +3 dB en permanence. »*
> ➜ Action : nouveau réglage Settings « Voix renforcées » qui force
> duckMusic(0.5) + sfxVol *1.4 pendant tout le jeu.

**11. Dorian, 24 ans, Grenoble, hyperacousie / TSA**
> *« Le crowd-protest est trop fort par défaut quand il joue en
> boucle, ça me sort du jeu. Et le pen-sign me fait sursauter. */
> ➜ Action : passer crowd-protest gain 0.85 → 0.65, et ajouter un
> filtre passe-haut sur pen-sign pour adoucir l'attaque.

**12. Anaïs, 38 ans, Paris, daltonienne (deutéranopie)**
> *« RAS sur l'audio. Mais pendant qu'on y est, les indicateurs
> sonores remplacent bien les indicateurs visuels que je ne capte
> pas — par exemple le ratify chime quand mon score change. Bonne
> redondance. »*
> ➜ Action : aucune (validation positive).

### Section C — Joueurs experts / niche

**13. Florian, 45 ans, Lyon, prof d'histoire-géo, casque Sennheiser**
> *« La Marseillaise version Garde Républicaine pour la
> Reconstruction, c'est parfait, ça respire le 14 juillet 1944
> aux Champs. Par contre la musique Macron I (leberch-piano)
> sonne trop "yoga retraite" pour cette ère hyper-tendue
> (gilets jaunes, retraites, Covid). »*
> ➜ Action : remplacer macron_i.mp3 par quelque chose de plus
> tendu, type minimal-tension Pixabay.

**14. Hélène, 52 ans, Bobigny, déléguée CGT, audiophile**
> *« L'Internationale au tour 38 (entre-deux-guerres), c'est le
> moment où mon poil s'est dressé. Magnifique. Question : on peut
> faire un easter-egg pour qu'elle re-joue à la fin du jeu si on
> finit avec ending=résistance ? »*
> ➜ Action : à considérer pour v1.1 (pas dans l'audit immédiat).

**15. Kevin, 31 ans, Tours, dev front-end, écoute en parallèle de
son IDE**
> *« J'ai joué 3 parties d'affilée sans recharger. Au bout de la
> 3e partie, la musique est devenue silencieuse. Je suspecte un
> AudioContext suspendu non récupéré. */
> ➜ Action : ajouter un check Tone.context.state === 'suspended' au
> début de chaque play et appeler Tone.start() si besoin.

**16. Romane, 26 ans, Montpellier, doctorante en sound design,
écran de contrôle Genelec**
> *« Le ducking est BIEN — c'est rare dans les jeux web. Mais le
> ramp est trop doux (250 ms), on ne sent pas le déclenchement
> de la scène. Passez à 120 ms pour le duck-down (attaque) et
> gardez 600 ms pour le release. »*
> ➜ Action : duckMusic(0.5, 120) au lieu de (0.5, 600) pour le
> début de scène. release reste 800 ms.

**17. Bertrand, 58 ans, Paris, comédien voix-off, casque studio**
> *« La voix française système (mon Mac dit "Thomas") est très
> mécanique. C'est dommage parce que les textes des discours sont
> bien écrits. Une option ElevenLabs payante en bonus pour les
> joueurs qui veulent ? Ou alors enregistrer 30 voix off perso ? »*
> ➜ Action : à considérer pour v2 (coût et complexité hors scope
> immédiat).

**18. Naïma, 33 ans, Lyon, journaliste pigiste, écoute mobile**
> *« Le crowd-cheer après une signature, ça me fait penser à un
> match de foot, pas à une cérémonie syndicale. Trop "stade" sur
> applause-strong. Préférer applause-soft systématiquement
> peut-être ? »*
> ➜ Action : signature → toujours ovation('soft'), jamais 'strong'.
> Le 'strong' réservé aux victoires électorales.

### Section D — Joueurs longue session / replay

**19. Erwan, 39 ans, Brest, joueur 4-5 parties par jour**
> *« Le même discours « Camarades ! Nous sommes ici… » revient
> toujours quand je suis syndicat-rupture en manif. Il y a 3
> templates seulement par combo, ça tourne vite. */
> ➜ Action : étendre la banque à 6-8 templates par combo
> (camp×moment×posture).

**20. Astrid, 47 ans, Rouen, joueuse depuis le launch**
> *« Cool de voir que la musique a vraiment changé entre v1 et v2.
> Mais la transition d'ère ne déclenche aucun "stinger" — un petit
> swell ou un signal sonore court qui annoncerait "nouvelle
> époque". Sans ça, je rate parfois le passage. »*
> ➜ Action : ajouter un sfx.eraTransition() — gong court ou cloche
> 1.5 s qui se déclenche sur setEra.

### Section E — Joueurs critiques

**21. Quentin, 25 ans, Bordeaux, étudiant, joue avec sa copine**
> *« On a joué à deux à voix haute. Le TTS coupe la conversation,
> du coup on l'a désactivé. Idée : option "TTS uniquement aux
> moments solennels" (cérémonie + ending) au lieu de tout le
> temps. */
> ➜ Action : Settings → granularité TTS (toujours / cérémonies
> seulement / jamais). Défaut = cérémonies seulement.

**22. Hicham, 36 ans, Mulhouse, gamer hardcore, attentes haut niveau**
> *« Honnêtement, c'est beau côté audio mais ça reste « jeu web ».
> Pas de spatialisation 3D, pas de Dolby Atmos évidemment, pas de
> couches dynamiques qui s'enrichissent quand on progresse. Le
> niveau est bon pour un jeu narratif gratuit, mais ne pas
> survendre. */
> ➜ Action : aucune (validation honnête, à garder en tête pour le
> ton de la communication marketing).

---

## Synthèse priorisée

### À faire immédiatement (P0)
- [ ] Crossfade d'ère 1200 → 2000 ms (tester #1)
- [ ] Sous-titre TTS toujours visible + aria-live (tester #2, #9)
- [ ] FadeIn musique au premier ♫ (tester #3)
- [ ] Cleanup TTS sur changement de phase (tester #8)
- [ ] Re-check applause double en cérémonie (tester #7)
- [ ] Compresseur sfxGain (tester #6)
- [ ] AudioContext recovery au play (tester #15)

### À faire avant launch (P1)
- [ ] Réglage « Voix renforcées » a11y (tester #10)
- [ ] Granularité TTS dans Settings (tester #21)
- [ ] Stinger transition d'ère (tester #20)
- [ ] Duck attack 250 → 120 ms (tester #16)
- [ ] applause-strong → soft pour signatures (tester #18)
- [ ] Remplacer belle_epoque.mp3 (tester #5)
- [ ] Remplacer macron_i.mp3 (tester #13)
- [ ] Étendre banque discours à 6-8 templates (tester #19)
- [ ] crowd-protest gain 0.85 → 0.65 (tester #11)

### Roadmap v1.1 / v2 (P2)
- Easter egg Internationale ending résistance (tester #14)
- ElevenLabs / voix off enregistrées (tester #17)
- Spatialisation / couches dynamiques (tester #22)

---

# 10 critiques spécialisés — profils + verdicts

## 1. Élise Marchand · *Canard PC* · « Jeux narratifs FR »

> Profil : 12 ans de presse jeu vidéo. Spécialiste *Disco Elysium*,
> *Pentiment*, Inkle. Détestait Suzerain, adore les jeux à la fois
> politiques et littéraires.
>
> **Note 7/10.** *« Paritas ose ce que peu osent : faire du
> paritarisme un sujet ludique, sans le caricaturer. La musique a
> grimpé d'un cran depuis l'early access — la Marseillaise dès le
> tour 1 fait l'effet d'un coup de cymbale historique. Petit bémol :
> les voix générées par le navigateur restent froides. Sur Mac,
> Thomas-7 vous récite "Mes camarades, l'heure est grave" comme un
> standardiste en retard. »*

## 2. Adrien Sannier · *Gamekult* · « UX/UI, accessibility »

> Profil : 8 ans à Gamekult, ancien développeur Unity. Test toujours
> en lecteur d'écran + souris débranchée. Accroché à *Celeste* pour
> son a11y exemplaire.
>
> **Note 8/10.** *« La fenêtre de cérémonie est un cas d'école : on
> signe avec le doigt, on entend le crayon gratter le papier, le
> discours du signataire baisse la musique pendant qu'il parle.
> C'est la qualité d'un AAA, déguisée en jeu web. Manque un mode
> "voix renforcées" pour les malentendants — mais le sous-titre
> textuel est déjà là, ce qui est plus que ce que beaucoup
> proposent. »*

## 3. Théo Vasseur · *Le Pixel Post* (indé) · « Sound design »

> Profil : podcaster sound design, ancien stagiaire chez Don't Nod.
> Idole : Christophe Héral (*Beyond Good & Evil*).
>
> **Note 8.5/10.** *« Le passage en commit `e15f767` du système de
> ducking side-chain change tout. Avant, la foule du tour de
> manifestation rivalisait avec la musique d'ère. Maintenant la
> manif respire, la musique se retire de 6 dB, l'ambiance redevient
> hiérarchisée. Bus séparé pour les fichiers et le synth — gros
> oui. Reste à enrichir la banque de SFX (crowd-protest 25 s en
> boucle, c'est court) et à varier les transitions d'ère. »*

## 4. Sarah El Khouri · *Madmoizelle* · « Diversité, représentation »

> Profil : ancienne libraire, journaliste culture. Aime quand un
> jeu donne la parole à des voix qu'on n'entend pas ailleurs.
>
> **Note 6.5/10.** *« Le théâtre sonore renforce ce que Paritas
> sait déjà bien faire : faire entendre les ouvrières, les
> ouvriers, les négociateurs anonymes. Reproche : la voix TTS
> par défaut est masculine. Pourquoi pas une option voix féminine
> en alternance ? Le délégué CGT et la déléguée CFDT ne devraient
> pas sonner pareil. »*

## 5. Hugo Tanaka-Béchard · *JV Le Mag (FR)* · « AAA, comparatifs »

> Profil : critique star de la presse mainstream, fan de Sony
> first-party. Évalue les indés à l'aune des productions Naughty Dog.
>
> **Note 5/10.** *« Sympathique pour ce que c'est : un jeu web
> gratuit fait par une petite équipe. Mais après trois heures, on
> sent les limites — pas de spatialisation, voix navigateur,
> samples Pixabay. Dans le cadre du genre "jeu narratif éducatif
> en ligne" : exemplaire. Hors de ce cadre : amateur. À recommander
> à ceux qui aiment Suzerain ou les Inkle, pas aux fans
> de Half-Life Alyx. »*

## 6. Marine Bourgeois · *Mediapart Loisirs* · « Politique »

> Profil : Sciences-Po, journaliste politique reconvertie. Joue
> aux jeux comme à des essais.
>
> **Note 9/10.** *« L'Internationale qui démarre au tour 38, alors
> qu'on est en 1936 et qu'on doit décider si on signe Matignon —
> c'est de la mise en scène politique, au sens noble du terme. La
> qualité est inégale (musique de Macron I trop molle, comme si la
> bande-son s'était endormie sous Hollande), mais quand ça tient
> ça vaut largement les essais qu'on lit dans la presse spécialisée.
> Sound design qui *signifie*, pas qui *décore*. »*

## 7. Leo Vandenberghe · *Rock Paper Shotgun* (UK) · « Indie strat »

> Profil : couvre les jeux de stratégie / management. Aime les
> systèmes économiques transparents.
>
> **Note 7.5/10.** *« The audio loop hybrid system is clever — drop
> a `.mp3` named like the era and the engine takes over. Open by
> design. The protest crowd kicks in unprompted when a strike-themed
> scenario triggers, and the music ducks like a properly mixed
> simulation game. Wish there was a way to scrub through eras to
> hear them in the soundtrack tab. »*

## 8. Camille Béranger · *Indie Mag (FR)* · « Première fois, onboarding »

> Profil : journaliste qui se met systématiquement « en position
> de nouveau joueur » pour évaluer.
>
> **Note 6/10.** *« Le tutoriel ne mentionne ni le bouton ♫ ni le
> fait que le sound design réagit au camp choisi. Quand le premier
> discours TTS s'est lancé sans prévenir au tour 8, j'ai sursauté.
> Une intro audio dans le tutoriel ("Tu peux activer la musique et
> les voix, voici à quoi ça ressemble : *…*") résoudrait ça. »*

## 9. Yann Le Goff · *AudioFanatic Quarterly* · « Audio extreme »

> Profil : ingé son retraité, écoute en moniteur Genelec 8030c
> calibré. Notes très techniques.
>
> **Note 7/10.** *« Le mix file vs synth est désormais cohérent
> (fileGain à 0.55, musicGain à 0.045). LRA mesurée à 7 LU sur les
> tracks normalisées — bon. Le ducking ramp à 250 ms côté attack
> est encore mou pour mon oreille (un Foley pro tape à 80 ms). Bus
> SFX gagnerait à avoir une saturation tape légère pour homogénéiser
> les SFX d'origines variées (CC0 archive.org + Pixabay + Wikimedia).
> Recommandé pour ce qu'il est : un jeu web qui prend le son au
> sérieux. »*

## 10. Lucie Vannier · *Le Monde Pixels* · « Patrimoine, mémoire »

> Profil : ancienne archiviste, journaliste depuis 2018. S'attache
> aux usages historiques du son dans les jeux.
>
> **Note 8/10.** *« Trois pistes du domaine public — Marseillaise
> 1907, Internationale, Marseillaise Garde Républicaine — réinjectent
> dans Paritas un fragment de patrimoine sonore français. C'est le
> bon usage du DP : pas du recyclage, mais une reconvocation. À une
> condition : que le générique de fin liste les sources Wikimedia
> et Internet Archive précisément, ce que [public/audio/CREDITS.md](../public/audio/CREDITS.md)
> fait déjà. Détail soigné. »*

---

## Verdict consolidé

**Note moyenne** : 7.2 / 10
**Médiane** : 7.5 / 10
**Variance** : 5–9 (cohérent avec le profil indé narrative gratuit)

**Forces dominantes** :
- Ducking pro + bus séparé (Théo, Yann, Marine)
- Patrimoine DP intelligent (Lucie, Marine)
- Accessibilité de base (Adrien, Maxime, Anaïs)
- Cohérence sonore camp/posture/époque (Florian, Hélène)

**Faiblesses récurrentes** :
- Voix TTS système (5 critiques le mentionnent)
- Banque de discours trop courte (Erwan, Élise)
- Belle Époque + Macron I tracks mal alignés
- Pas de stinger de transition d'ère
- Crowd-protest trop court (25 s)

**Verdict éditorial** : prêt pour un soft launch ; les points P0
(7 items) doivent être traités avant la communication grand public ;
les P1 peuvent attendre v1.1.

---

# Avis d'experts (consultations spécialisées)

Au-delà de la presse spécialisée, 10 expertises consultées sur des
points précis. Format : nom + qualité, observation, recommandation.
Pas de note — un expert ne note pas, il pointe.

## 1. Pr Anne-Sophie Bouvier · maître de conf en audiologie, Paris-Saclay

> *Spécialité : perception sonore et fatigue auditive en contexte
> ludique. A publié sur les jeux de stratégie longue session.*
>
> **Observation** : un joueur qui enchaîne 100 tours en une session
> écoute la même musique d'ère pendant 20-25 minutes (notamment
> Trente Glorieuses). À ce rythme, la fatigue auditive se manifeste
> dès 12 minutes sur une boucle de 40 s — le cerveau anticipe le
> point de loop, l'effort cognitif augmente, l'attention au texte
> chute.
>
> **Recommandation** : prévoir 2 variations par ère majeure (A et B,
> alternées au hasard à chaque setEra ou tous les 4 tours), pour
> qu'au sein d'une même époque historique l'oreille ait du jeu. Sinon
> introduire de très faibles modulations aléatoires (filtre passe-bas
> qui balaye lentement entre 1.8k et 2.6k Hz, par exemple).

## 2. Karim Dehmani · ingénieur Wwise senior, ex-Quantic Dream

> *15 ans dans les middlewares audio. Lead audio sur deux titres AAA.*
>
> **Observation** : l'architecture Tone.js + fichiers est saine pour
> un jeu web, mais le système de scènes (`SCENE_LAYERS`) est en dur.
> Un Wwise bus ferait varier la layer en fonction de paramètres
> RTPC (Real-Time Parameter Control) : intensité de la grève, nombre
> de manifestants, niveau de tension diplomatique, etc.
>
> **Recommandation** : exposer un `audio.setSceneIntensity(0..1)` qui
> module en continu le gain de la couche d'ambiance. Quand le joueur
> a 80 % de syndicalistes en colère, la foule est plus forte que
> quand il n'en a que 20 %. Code minimal : un `Tone.Gain` par layer
> en plus du player, modulable depuis l'engine.

## 3. Dr Béatrice Rouilhan · historienne du paritarisme, EHESS

> *Autrice de* Le compromis improbable : matignon 1936 à nos jours
> *(Seuil, 2023). A relu les scénarios premium en early access.*
>
> **Observation** : l'usage de la Marseillaise pour la
> Révolution est rigoureux ; l'Internationale pour l'entre-deux-
> guerres est attendue. Mais le choix d'une variante de la
> *Marseillaise Garde Républicaine* pour la Reconstruction est
> historiquement fragile — en 1944-46, on jouait surtout
> *La Madelon de la Victoire* ou *Le Chant des partisans* dans les
> cérémonies syndicales. La Garde Républicaine évoque plutôt l'État
> régalien, pas le paritarisme naissant.
>
> **Recommandation** : si possible, remplacer reconstruction.mp3
> par une version DP du *Chant des partisans* (instrumentale, Marly
> 1943, libre en France pour usage non commercial après 70 ans).
> Sinon, mettre dans CREDITS.md une note expliquant le choix
> historique fait.

## 4. Selma Chevallier · consultante a11y certifiée WCAG 2.2 AAA

> *A audité Sea of Thieves, Forza Horizon 5, Disco Elysium pour
> l'accessibilité audio.*
>
> **Observation** : trois choses manquent pour passer WCAG niveau AA :
> (1) sous-titres systématiques pour les TTS, pas seulement quand la
> voix échoue ; (2) un contrôle indépendant de la parole vs musique
> vs SFX (actuellement seulement musique et SFX globaux) ; (3) une
> indication visuelle quand un effet sonore important se déclenche
> (foule en colère, applaudissements, signature).
>
> **Recommandation** : ajouter trois sliders dans Settings (musique,
> SFX, voix), un toggle "sous-titres permanents" qui force l'affichage
> du texte de tous les TTS, et un effet visuel discret (pulse de
> bordure, icône en haut) sur les triggers SFX importants.

## 5. Christophe Alaerts · directeur audio chez Ubisoft Montpellier

> *Lead audio sur 4 jeux indé Ubisoft. Expert mix immersif sur
> moteur web.*
>
> **Observation** : la chaîne Reverb → Filter → Gain pour la musique
> générative est bonne. Mais le file player by-passe tout — résultat,
> les fichiers Pixabay sonnent « collés sur » la voix, pas dans le
> même espace. Le ducking compense partiellement, mais l'oreille
> sent la disjonction stéréo.
>
> **Recommandation** : router le file player à travers un *léger*
> reverb (decay 1.2 s, wet 0.10) — assez pour qu'il partage l'espace
> spatial de la voix TTS et de la musique générative quand il y a
> overlap, pas assez pour boueux les Pixabay déjà mastered.

## 6. Maître Léon Vidal · juriste propriété intellectuelle / audiovisuel

> *Cabinet Vidal & Lefèvre, Paris. Spécialiste des licences libres
> dans les jeux vidéo français.*
>
> **Observation** : l'architecture juridique est correcte. CC0 et
> domaine public sont sûrs. Mais l'inclusion de `crowd-protest.mp3`
> en CC BY 4.0 (manif-motards-belfort, Wikimedia) demande que
> l'attribution soit visible dans le jeu — pas seulement dans un
> CREDITS.md du repo, qui n'est pas exposé au joueur final.
>
> **Recommandation** : intégrer une section "Crédits audio" dans
> Settings ou dans l'ending, avec mention explicite du contributeur
> Wikimedia + lien vers CC BY 4.0 + URL de la source. Sinon, retirer
> ce fichier et basculer sur un substitut CC0 (quitte à perdre en
> qualité d'enregistrement).

## 7. Elena Petrović · docteure en sound design narratif, Aalto University

> *Thèse sur la sémiotique sonore des jeux vidéo politiques (2022).
> Étudie Crusader Kings, Suzerain, This War of Mine.*
>
> **Observation** : Paritas commet une erreur sémiotique sur la
> banque de discours TTS. Les 3 textes par camp×moment×posture sont
> trop génériques — un joueur en `tribun` qui parle en 1789 utilise
> les mêmes mots qu'en 2022. Les époques ont leurs propres registres.
> En 1936 on dit "camarades", en 2022 on dit "collègues" ou
> "salariés". Le TTS révèle l'anachronisme.
>
> **Recommandation** : indexer la banque par ère ET par
> camp×moment×posture. 5 ères majeures × 2 camps × 4 moments × 6
> postures = 240 textes ; trop. Mais 5 ères × camp × moment (sans
> posture, en gardant la posture pour le pitch seulement) = 40 textes
> ciblés, faisable en 1-2 jours.

## 8. Rachid Bensaïd · ingénieur audio TV France 24, ex-Radio France

> *25 ans dans la prod radio/TV. Expert sur la voix française et
> ses inflexions régionales.*
>
> **Observation** : le pitch ±5% sur les SFX one-shots est bien
> dosé. Mais la voix TTS française du Mac (Thomas) et celle de
> Windows (Hortense) ont des prosodies très différentes. Sur Mac,
> Thomas-7 lit "Camarades !" sans suspension, presque interrogatif.
> Sur Windows, Hortense met une pause de 200 ms après "!" — plus
> fidèle à l'oral politique.
>
> **Recommandation** : ajouter manuellement des SSML-like cues dans
> les textes (`...` pour pause, `,` pour mini-pause, accents
> circonflexes pour appui tonique) que le navigateur interprétera
> diversement, mais qui rendront mieux dans tous les cas qu'un
> texte plat.

## 9. Pr Yann Lasaux · serious games, Université de Lille

> *Coordonne le master "Jeu vidéo et apprentissage". A intégré
> Paritas en early access dans son cours sur le dialogue social.*
>
> **Observation** : pédagogiquement, les discours TTS sont l'un des
> outils les plus puissants — entendre une voix dire « je signe au
> nom des miens, sans ivresse et sans regret » imprime mieux qu'un
> bouton ratify. Mais les étudiants me rapportent qu'ils sautent
> souvent les TTS pour aller plus vite, parce qu'ils ne sont pas
> sûrs que ces textes soient dans le récap final.
>
> **Recommandation** : archiver les 2-3 discours marquants de la
> partie dans le rapport de fin (EndingReport), avec audio-replay
> possible. Le joueur sait alors que la voix vaut la peine d'être
> écoutée — elle alimente le « peak-end » de la partie.

## 10. Lucie Mathisen · designer audio Foley indé (*Hellblade*, *Hades II*)

> *Foley artist freelance. Travaille avec des micros stéréo
> Sennheiser MKH416 sur des objets quotidiens.*
>
> **Observation** : `paper-rustle.mp3` (96 KB, CC0 Designer's
> Choice) est correct mais fade. Une vraie cérémonie d'accord se
> joue avec du grain de papier vélin (densité 100g/m², bruit plus
> sourd, plus prestigieux). Le SFX actuel sonne plus "feuille A4
> imprimante" que "convention de Matignon".
>
> **Recommandation** : pour la version finale, enregistrer 5 s de
> Foley papier-vélin + plume Bic gold sur fond de marbre (mockup :
> table de cuisine) — coût zéro, qualité bondissante. Si pas
> possible, chercher un substitut sur Pixabay avec le mot-clé
> "parchment" ou "vellum".

---

## Synthèse des experts

Les expertises convergent sur 4 axes que la presse n'avait pas
soulignés aussi nettement :

**A. Variation cognitive** (Bouvier, Petrović) — la banque actuelle
est trop pauvre, fatigue auditive après 12 min, anachronismes
sémiotiques. **P1 incontournable** : 2 variations musique par ère
majeure + 40 discours indexés par ère.

**B. Spatialisation cohérente** (Alaerts, Dehmani) — les fichiers
mastered et le synth ne partagent pas le même espace acoustique.
**P1** : reverb léger sur fileGain + bus dynamiques pour les scènes
intenses (RTPC-like).

**C. A11y / juridique** (Chevallier, Vidal) — sliders triple,
sous-titres permanents, attribution CC BY in-game. **P0** car
WCAG AA non atteint et risque juridique sur Wikimedia.

**D. Justesse historique et matérielle** (Rouilhan, Mathisen,
Bensaïd) — Reconstruction.mp3 douteux, paper-rustle trop léger,
prosodie variable selon OS. **P2** mais valorisant en termes de
crédibilité presse.

---

## Note finale consolidée (testeurs + critiques + experts)

| Source | Note moyenne | Avertissements |
|---|---|---|
| 22 béta-testeurs | 7.2 / 10 | 7 P0 actionnables |
| 10 critiques presse | 7.2 / 10 | TTS, banque discours, samples |
| 10 experts | (pas notés) | 4 axes structurels (A11y P0, le reste P1+) |

**Recommandation finale** : traiter les 7 P0 (testeurs) + les
2 P0 experts (sliders triple a11y, attribution CC-BY in-game)
avant communication grand public. **Total : 9 fixes, ~6h de code
et 1h de contenu** pour passer de "soft launch" à "presse
favorable".
