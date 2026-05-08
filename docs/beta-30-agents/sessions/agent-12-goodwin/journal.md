# Journal — Agent 12 (Goodwin, lentille historienne)

## Note de cadrage

J'arrive au jeu avec deux casquettes : la procédure Kim Goodwin (3 personas)
demandée par mon profil, et la mission lentille Doris Kearns Goodwin
demandée par le PM (justesse historique, voix d'époque). Je joue les deux —
d'abord la traversée historique (la commande PM prime), puis je vérifie en
fin de session que les trois personas (lycéen / syndicaliste CFDT / DRH)
trouvent leur porte d'entrée. Je suis une historienne politique : je ne
juge pas la mécanique, je juge si 1789, 1936, 1947, 1968, 1995 et 2017
sonnent vrai. Je joue en JE.

---

## Partie 1 — 1789 → 1936, côté salarié

**T1, mars 1789, cahiers de doléances** (`early-period.ts:13`). Le réflexe
historien est immédiat : on cite Le Chapelier *avant* l'événement, parce
que le choix « exiger l'abolition pure et simple des maîtrises » est
flaggé `refuse-compromis` et porte une *conséquence longue* qui anticipe
la loi de 1791 (`early-period.ts:67-71`). C'est juste. C'est rare. Le
cahier des charpentiers de Paris cité (`early-period.ts:36`) est une
vraie source — j'ai lu ces cahiers il y a dix ans, le ton est exact.
Je signe la doléance « tarifs garantis et caisses de secours ». Le jeu
me dit « ton nom y figure » — c'est le bon registre, ni triomphal ni
nostalgique.

**T4, livret ouvrier 1803** (`early-period.ts:93`). La citation de
l'article 12 de la loi du 22 germinal an XI est exacte
(`early-period.ts:117`). Le mot « impertinent » dans le compulsif
(`early-period.ts:108`) — je l'ai vu dans des livrets réels du fonds des
Archives nationales. Bonne immersion. Je choisis la mutuelle.

**T5, sociétés de secours mutuel 1820-1830** (`early-period.ts:174`). Le
double mouvement « cheval de Troie » est historiquement défendable :
oui, les sociétés de secours servaient à coordonner. Le flag
`cree-mutuelle-1864` (`early-period.ts:221`) anticipe — bonne idée
narrative — mais 1864 c'est la loi Ollivier (droit de coalition), pas la
mutuelle. Le nommage du flag est ambigu pour un historien. **P2.**

**T7, procès des coalitions 1845-1850** (`early-period.ts:259`). Citation
Louis Blanc 1839 (`early-period.ts:283`) bien sourcée. Le détail « le
banc des accusés sent l'huile à machine » (`early-period.ts:274`) est
le genre d'image que Goodwin appelle « l'odeur du document ». Continue.

**T20, Matignon** (`1936-matignon.ts:18`). C'est l'angle pierre
angulaire. Je relis trois fois. Frachon est nommé à la table — exact :
la CGT vient de se réunifier en mars 1936, Frachon (ex-CGTU) y prend
des notes. Le quote « Tout est possible ! » de Jouhaux à la sortie
(`1936-matignon.ts:67`) est le mot historique le plus célèbre. Bonne
attribution. Lambert-Ribot délégué CGPF — exact, c'est lui (et non
Duchemin, président, qui était plus en retrait). Le scénario distingue
proprement Jouhaux/Frachon comme deux pôles internes CGT —
historiographiquement juste. La voix patronale `matignon-jouer-division-cgt`
(`1936-matignon.ts:244`) cite la stratégie réelle de Lambert-Ribot.
**Moment marquant** : le longterm de la signature
(`1936-matignon.ts:113`) qui dit « À la Libération, on s'en
souviendra » — c'est exactement la mémoire que les ordonnances de 1945
mobilisent. Je signe.

Le callback `signe-matignon` à T+5 (`choiceResolver.ts:107-114`) fait
*écrire Frachon* deux lignes de reconnaissance. Sentimentalement juste,
historiquement risqué : Frachon, en 1936, était *plus* dur que Jouhaux,
et la CGTU réunifiée pesait pour pousser. Une lettre privée de Frachon
applaudissant la signature serait improbable avant 1945. **P1.**

## Partie 2 — 1945 → 2025, côté patron

**T23, Sécu 1945** (`premium.ts:313`). Je joue patron CGPF reconstitué.
Je choisis « confier à l'État » — historiquement, c'est l'option
défendue par les patrons inquiets de la cogestion. Le quote Croizat
Vélodrome d'hiver 1946 (`premium.ts:335`) est juste mais l'année est
1945 (le scénario l'admet : « date 4 et 19 octobre 1945 », mais le
discours Vél d'Hiv est avril 1946). Vérifié : Croizat parle au Vél
d'Hiv le 21 mars 1946 — donc « 1946 » dans le quote est correct, mais
le scénario T23 = octobre 1945. Légère dissonance temporelle. **P2.**

**T24, FO 1947** (`belle-epoque.ts:200`). Côté patron, je n'ai pas la
main — `campFilter: 'salarie'`. C'est cohérent : le patronat n'a pas à
arbitrer la scission CGT/FO. Bon design. Le quote « Manifeste des Douze
1940 » (`belle-epoque.ts:220`) — vérification : oui, manifeste signé en
novembre 1940 par Jouhaux et onze autres, document rare et juste. Le
scénario branche `fonde-fo` qui déclenche un callback `adversaire` à T+5
sur l'argent américain (`choiceResolver.ts:127-134`). C'est *exactement*
l'attaque CGT contre FO depuis 1948. Très bonne mémoire CK3.

**T29, Unédic 1958**, **T31, Grenelle 1968**, **T37, Auroux 1982** :
parcourus en patron. Le quote Séguy 27 mai 1968 (`premium.ts:446`) est
exact — annonce historique du rejet de Billancourt. Le longterm
`signe-grenelle` (`choiceResolver.ts:119-125`) qui fait dire à la base
« 35% du SMIG, c'est bien. Mais ce n'est pas la révolution. » — voix
parfaitement juste, c'est le cri de Billancourt.

**T45, Plan Juppé 1995** (`late-period.ts:16`). Quote Blondel FO
décembre 1995 (`late-period.ts:41`) : la formule « gagner c'est
freiner, pas inverser » — je n'arrive pas à la sourcer dans mes
souvenirs. Vraisemblable de Blondel sur le ton, mais sans citation
externe. **P1 — vérifier.** Le longterm « plus jamais sans 49.3 prêt »
est historiographiquement très juste : 2010, 2016, 2023 confirment.

**T67, El Khomri 2016** (`late-period.ts:107`). Quote Martinez
mars 2016 (`late-period.ts:131`) — paraphrase plausible mais je ne la
retrouve pas verbatim. **P2.**

**T70, Ordonnances Macron 2017** (`late-period.ts:198`). Quote Édouard
Philippe « la concertation a duré le temps qu'elle a duré »
(`late-period.ts:222`) — formule réelle, septembre 2017, exacte. Très
bien. Le compulsif « DRH-en-chef du gouvernement » (`late-period.ts:212`)
est savoureux et juste : Pénicaud venait du privé.

**T93-96, futur** (`futur.ts`). Marylise Léon citée 2026
(`futur.ts:46`) — citation prospective, je l'accepte comme pari.
L'AI Act 13 mars 2024 (`futur.ts:30`) — date juste. Directive
plateformes 2024/2831 (`futur.ts:115`) — j'ai vérifié : la directive
existe, numérotation correcte.

## Trois personas (rapide, fin de session)

- **Lycéen 16 ans** : T1 cahiers est une *bonne* porte (la matière scolaire
  des États généraux), mais le théoryHint « pari de l'institutionnalisation
  précoce » (`early-period.ts:45`) le décroche. **Hook** : « Tu vas
  pouvoir écrire une revendication ouvrière dans un texte royal. »
  **Friction** : le vocabulaire technique des effets (rapportDeForce,
  legitimite) en T1.
- **Syndicaliste CFDT 45 ans** : se reconnaît plutôt dans Auroux T37
  (`premium.ts:489`) que dans Frachon. **Hook** : « 1982, c'est ta
  matrice. » **Friction** : la voix Frachon est appuyée 1936 ET 1947 ET
  1968 — la CFDT (née 1964) n'a pas de figure aussi présente.
- **DRH 52 ans** : la branche patronale `matignon-jouer-division-cgt`
  (`1936-matignon.ts:244`) lui donne enfin une stratégie *intelligente*
  côté patron, pas caricaturale. **Hook** : « Tu peux jouer Lambert-Ribot
  sans honte. » **Friction** : aucune branche patronale équivalente sur
  Sécu 1945 — il joue salarié en miroir, ce que mon profil Goodwin
  appelle « persona mal servi ».
