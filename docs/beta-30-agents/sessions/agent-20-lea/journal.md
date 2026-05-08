# Journal — Léa K., 23 ans, caissière Carrefour CDI partiel, CFDT-Services

Session : MacBook Air 13", Chrome, mode Réfléchi, 2 parties simulées (1 salariée CFDT, 1 patron) sur HEAD `0813c75`.

## Première partie — côté salariée CFDT

J'ouvre PARITAS avec une question simple : « est-ce que ça parle de moi ? ». Je joue la base, la CFDT, comme dans la vraie vie. Les premiers tours (1789, ouvriers, mutuelles) je suis perdue mais curieuse — je n'ai jamais vu ça en cours. Tour 6 ou 7, je commence à comprendre la mécanique des jauges (`Confiance`, `Rapport de force`, `Légitimité`). OK.

Puis j'arrive à 1936. **Matignon**. C'est l'atelier qui m'a marquée — le sceau, les noms (Jouhaux, Blum), le poids. Je signe (`matignon-signe`, `1936-matignon.ts:117`). Je vois le flag `signe-matignon` apparaître. Je me dis : « cool, ça va revenir plus tard ».

**Spoiler : non.** J'ai fait `grep -r "signe-matignon" src/` (oui, je suis dev autodidacte). **Aucun autre scénario ne lit ce flag**. Le callback n'existe pas. Le sceau de cire que j'ai vu se fermer, il ne sert qu'à colorer ma fin de partie via `signedMajorAccords`. Pour une joueuse qui s'attendait à ce qu'un personnage en 1968 ou 1995 dise « tu te souviens de Matignon », c'est une promesse cassée.

Je continue. Tour 45, **Plan Juppé**. Là c'est dense, très politique, mais ça reste lisible. Tour 76, **algorithmisation** (`futur.ts:21-103`). Je tombe sur la phrase « l'algorithme Mosaic de Carrefour évalue 70 000 caissiers » (`futur.ts:35`). **Je m'arrête. Quelqu'un a pensé à moi.** C'est rare. C'est le moment marquant. Pour 30 secondes, le jeu m'a vue.

## Atelier NAO — la grosse déception

Je lance la NAO en mode standard (60 pts, 5 séances, `engine.ts:100-101`). Les 4 thèmes : **salaires, primes, télétravail, égalité pro** (`engine.ts:108-112`).

Je fais la liste de MA NAO chez Carrefour (j'ai été observatrice CSE l'an dernier) :
- **Salaires** : oui, ça colle.
- **Primes** : oui (prime transport, intéressement).
- **Télétravail 3 j/sem** : ??? **Je suis caissière**. Je ne télétravaille pas. Personne dans mon magasin ne télétravaille — sauf trois cadres au siège régional. Le thème pèse 25 % chez la CFDT et **40 % chez la CFE-CGC** (`engine.ts:135, 154`). Pour moi, les vrais thèmes manquants sont : **planning/temps partiel subi, pénibilité-caisse (mal de dos, RPS), prime de coupures**. Aucun de ces trois n'apparaît.
- **Égalité pro** : oui, mais le label « 5 mesures » (`engine.ts:111`) est trop abstrait — chez nous c'est concret : index Pénicaud, écart H/F sur les coefficients, congé second parent.

Je lance la partie. La CFDT est décrite « sensible au télétravail et à l'égalité pro » (`engine.ts:137`). Pour ma section CFDT-Services, **c'est faux** : on est sensibles aux salaires et au temps de travail. Léon pour la CFDT moderne, oui ; pour la CFDT-Services en grande distri, non.

Outcome : `accord_majoritaire`. Très bien réglé mécaniquement (les ORDA-001/008/009/010/011 sont visibles dans le code, c'est du soin). Mais **je n'ai rien ressenti** — c'est un puzzle d'optimisation budget, pas une NAO.

## Deuxième partie — côté patron

J'ai cliqué « partie patron » par curiosité (Argus dit que c'est intéressant). Surprise : les `campText` existent côté patron (`1936-matignon.ts:124, 163, 202`). C'est bien fait, le ton change, l'intent change. **Mais la NAO n'a pas de campText équivalent** — mêmes thèmes, même grille pour les deux camps. Côté patron, je joue une grande surface qui négocie le télétravail. Encore plus absurde.

## Trois différences NAO du jeu vs MA NAO Carrefour

1. **Thèmes** : le jeu a télétravail/égalité, ma NAO a planning/pénibilité/coupures. Le télétravail est un thème de cadre, pas de caissière.
2. **Acteurs** : le jeu = 4 confédérations + employeur centralisé. Chez Carrefour = négo de branche distri (FCD) **puis** négo d'entreprise par établissement, avec **CSE central + CSE local**. Le jeu skippe l'articulation branche/entreprise.
3. **Rythme** : 5 séances en quelques minutes. Ma NAO 2025 : 4 réunions étalées sur **7 mois**, plus 3 commissions techniques. Le jeu compresse à mort — fine pour la pédagogie, mais ça invisibilise la durée comme arme patronale.

## Ce que je note

Le préset TPE-PME (`engine.ts:71-94`, ORDA-008) montre que l'équipe **sait** que la NAO du jeu est calibrée grand groupe. Ce qui manque, c'est un **préset « grande distribution / services »** — où le télétravail disparaît et où apparaissent planning/pénibilité. Mon biais CFDT : j'ai sans doute été plus sévère sur les thèmes que sur le code IA, qui est solide.
