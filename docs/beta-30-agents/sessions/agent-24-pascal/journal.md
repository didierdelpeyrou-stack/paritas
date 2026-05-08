# Journal de session — Pascal M., 52 ans, dirigeant PME

> **Note de cadrage.** Le profil agent-24 archivé dans `.claude/agents/agent-24-pascal.md`
> décrit un comptable aveugle utilisant JAWS (38 ans, mutuelle). Le brief
> reçu pour cette session demande un Pascal différent : 52 ans, dirigeant
> PME 80 salariés à Lyon, adhérent CPME, regard patronal de terrain. Je
> joue le second profil (instruction explicite) en notant la dissonance.

## Identité de jeu

Je m'appelle Pascal M., 52 ans, je dirige une entreprise lyonnaise
de mécanique de précision — 80 salariés, dont 12 cadres et 4
apprentis. Je cotise à la CPME depuis dix ans, j'ai siégé deux ans
à la chambre patronale du Rhône. Je joue côté patron, build HEAD
0813c75. Build début : v2.2.2-prebeta après ORDA-014.

---

## Partie 1 — PME 80 salariés, doctrine « influence »

### Setup

Je choisis le camp patron. `freshOrganization` me donne une
trésorerie de 42, 90 membres, 4 permanents, 3 juristes, 3 relais
médias (`organization.ts:12-17`). Tout de suite je note :
**90 « membres », c'est l'union patronale, pas mes 80 salariés**.
Pour un patron, c'est un point d'entrée déroutant. La distinction
entre l'entreprise (mes 80 salariés) et l'organisation patronale
(l'union dont je suis membre) n'est jamais clairement faite à
l'écran d'accueil. Premier moment de flou.

### Tours 1-15 — la traversée du XIXe

Le tour 9, le scénario `comite-forges-1864` arrive
(`patron.ts:4-90`). Je suis maître de forge. La voix
« paternaliste » me parle vraiment : "une œuvre sociale ferme
bouche à mille discours". J'ai vécu ça à mon échelle quand j'ai
créé la mutuelle d'entreprise en 2018. Je choisis
`forges-paternaliste` (-7 caisse mais +8 patience base, +6 opinion).
Les conséquences sont fines, l'historique solide. Mais je grince
quand je vois `requiresTrait: 'paternaliste'` (`patron.ts:68`) —
au tour 9, je n'ai pas encore eu l'occasion de devenir
paternaliste. Le filtre laisse passer le choix mais le ton est
trompeur. **P1**.

### Tour 21 — CGPF-1936

Bon scénario (`patron.ts:91-177`). Je choisis `cgpf-tenir` (la
ligne Duchemin) : +8 institution, +6 etat-trust. Le flag
`cgpf-cogestion` est posé. ORDA-014 me dit qu'un callback
s'enclenchera turn+4 (1940 environ) — je ne le verrai pas, le jeu
ne montre pas explicitement le déclenchement avec le préfixe
"Mémoire (adversaire) :". Le texte annonce "communiqué
présidentiel" pour `mediation-elysee`, ici c'est `cgpf-cogestion`,
mais aucune trace dans le ticker au tour 25. **À vérifier — P1**.

### Tour 32 — Grenelle patronal

Excellent. `grenelle-patron-section` : la voix pragmatique me
fend. "Échanger reconnaissance contre stabilité" — c'est
exactement ce que je fais avec mon DS CGT depuis 2019. Je signe.
+5 institution, +7 trust adversaire. Bien.

### Tour 48 — Refondation MEDEF 1998

Là, je bute. Le scénario suppose que je suis Seillière ou son
adjoint (`patron.ts:266-352`). Je suis un patron de PME lyonnais.
Cette histoire de "claquer la porte de l'UNEDIC" n'est pas mon
récit. Je me sens projeté dans une posture CAC40. **Le scénario
manque d'une porte d'entrée PME : que fait l'adhérent CPME quand
le MEDEF claque la porte ? P0 narrative.**

### Tour 71 — CPME face aux ordonnances 2017

**Moment marquant.** `cpme-ordonnances-cse-2017`
(`cpme.ts:11-98`). Asselin tape un crayon contre son verre. Je
relis trois fois. La citation page 36 : "Pour une PME de 30
salariés, mettre en place un CSE c'est quatre jours de réunion
par an". C'est exactement ce que j'ai dit à mon expert-comptable
en 2018. **Première fois dans le jeu où je me reconnais.** Je
choisis `cpme-contre-projet` (livre blanc TPE-PME). +7 institution,
+7 légitimité, -5 caisse. Le flag `refondation-paritaire` est
posé. ORDA-013 dit qu'un callback se déclenche turn+4 — je
verrai. Bien écrit, fond solide, ton juste. **NPS pivot.**

### Tour 80 — Retraites 2023

`retraites-patron-2023` (`patron.ts:614-700`). Je choisis
`retraites-patron-retrait` (préserver le dialogue). Solide.

### Tour 82 — U2P artisanat 2024

`u2p-artisanat-2024` (`cpme.ts:99-186`). Le boulanger qui
raconte que son apprenti fait Excel en visio au lieu de tourner
une pâte — j'ai éclaté de rire et hoché la tête. C'est *vrai*.
Je choisis `u2p-coalition-cpme`. Bien.

### Atelier NAO depuis le siège patronal

Je teste l'atelier NAO côté employeur (`nao/engine.ts`). Préset
TPE-PME (24 pts, 3 séances) — `NAO_PRESET_META['tpe-pme']`
(`engine.ts:87-93`). Bien calibré, conforme à mon vécu. Mais
**l'IA `aiEmployeurMove` (`engine.ts:693-788`) joue *à ma place***
quand je laisse tourner. Le commentaire ORDA-011 explique le tri
par poids électoral, c'est intelligent — sauf que **moi, patron
joueur, je veux jouer mon propre move, pas regarder l'IA jouer
employeur**. Si la NAO côté patron fait jouer l'IA, alors
l'expérience patron est passive. **P0 si confirmé en UI.**

### Treasury — la rate 0.32

Inspection du code : `organization.ts:55` rate=0.32 patron vs
0.04 salarié (1:8). Mais `treasury.ts:87` rate=0.16 patron vs
0.05 salarié (1:3.2). **Deux fonctions divergent sur le même
concept.** Le test `organization.test.ts:114` valide 0.32, mais
le calcul de tour passe par `treasury.ts` (computeRecettes). Côté
expérience joueur, ma trésorerie monte plus lentement que ce que
le tooltip annonce. **P0 cohérence numérique.**

---

## Partie 2 — ETI 800 salariés type Sayanti

Je rejoue avec un mental d'ETI tech (Sayanti Mukherjee,
`legendaryCharacters.ts:462-484`). Je sélectionne sa figure —
"DRH d'ETI 800 salariés cyber Bordeaux". Bonus +pragmatique +3,
+technocrate +2. Bien.

Le tour 38 (Auroux 1982) marche fort : `auroux-patron-drh`
(`patron.ts:511-528`) requiresTrait technocrate — je l'ai grâce à
Sayanti. "Internaliser dans une nouvelle doctrine RH". C'est
exactement la lecture managériale que Sayanti défend dans sa bio.
Là, le couplage figure-scénario fonctionne pour de vrai.

Tour 68, loi Travail 2016 (`patron.ts:531-611`) — je choisis
`loi-travail-patron-branche` (sécuriser concurrence loyale).
Cohérent ETI.

Tour 82 (U2P artisanat 2024) ne me concerne plus — je ne suis
plus patron de proximité. Le scénario reste joué avec moi mais
**aucun mécanisme ne le filtre par taille d'entreprise**.
`campFilter: 'patron'` est trop large : un dirigeant 800 salariés
ETI tech à Bordeaux ne porte pas l'artisanat. **P2 — feature
request : filtre ETI/PME/TPE.**

---

## Synthèse à chaud

Le jeu *me* parle quand il fait parler la CPME et l'U2P. Quand il
parle MEDEF/CNPF de Seillière ou Villiers, je suis spectateur d'un
récit qui n'est pas le mien. **Les deux scénarios CPME (cpme.ts)
sont les seuls moments où le patronat de terrain existe**.

Côté figures : Asselin, Mukherjee, Roux de Bézieux —
3 patrons modernes documentés. Manque : un patron CPME
provincial vivant (genre président chambre Auvergne ou Pays de la
Loire). Mukherjee (composite assumé) et Asselin tiennent le rôle.
C'est mince mais ça tient.

Côté mécanique : la treasury rate inconsistance est un bug réel.
La NAO en mode passif si IA joue à ma place est un bug d'UX. Le
reste tourne.
