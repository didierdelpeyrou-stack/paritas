# Journal — Lukas K. (agent-28)
## Session bêta privée HEAD 0813c75 · 2026-05-08

> *Profil : ingénieur Bosch Stuttgart, 32 ans, IG-Metall, B2 français. Je viens chercher CE qui rend le modèle français spécifique — et CE que la cogestion allemande ne fait pas. Je pars du miroir Mitbestimmung pour lire PARITAS.*

---

### Setup et premier choc lexical (tours 1-10)

J'entre côté **salarié**, preset standard. Le mot « paritarisme » sans glossaire, c'est opaque — chez nous on dit *Sozialpartnerschaft* ou *Mitbestimmung*, jamais ce mot-là. Heureusement, `glossary.ts:34-37` définit *paritaire* comme « instance gouvernée à part égale par employeurs et salariés ». OK, je tiens le concept. Mais le titre du jeu reste froid pour un Allemand : il faudrait une accroche d'ouverture qui dise *« en France, on ne cogère pas l'entreprise, on cogère les caisses »*. Le glossaire l'explique (`historicalBase.ts:23` : « Cogestion d'organismes — Sécu, Agirc-Arrco, Unédic, Action Logement, AT-MP. Cœur historique français »), mais c'est planqué.

### CGT, CFDT, FO — la confusion s'allège tour 12

Je découvre `engine.ts:34` (NAO) : 4 unions distinctes. Le tableau `engine.ts:122-156` me donne enfin une grille — CGT revendicative seuil élevé, CFDT réformiste pivot, FO autonome centrée salaires, CFE-CGC cadres. **C'est ma première vraie lecture du syndicalisme français pluraliste.** Chez IG-Metall, on a UN syndicat de branche. Là je vois pourquoi le compromis français est plus dur à boucler — quatre signatures à arracher, pas une.

### Première NAO standard — l'inverse du DGB

Séance 1, CGT en `pression` (`engine.ts:816`). Séance 3, j'observe l'employeur jouer `communication` pour la faire glisser. Séance 5, accord majoritaire CFDT+FO+CFE-CGC à 62 %, CGT en retrait. **Sociologiquement juste**, mais je n'ai aucun écho à ma réalité Bosch. En Allemagne le *Tarifvertrag* se signe avec UN partenaire — ici, c'est une coalition à reconstruire à chaque tour. La finesse est là. Le problème : le jeu ne pose JAMAIS la question « pourquoi 4 syndicats et pas 1 ? ».

### Le moment marquant — side event Mitbestimmung 1992

Tour 67 : `sideEvents.ts:466-516`. **Klaus me tend la carte de visite à deux faces.** Je ris fort. C'est exactement le ton Stuttgart-Paris fin XXe. Trois choix s'offrent :
- `rejeter-cogestion` (`sideEvents.ts:478-489`) — Charte d'Amiens 1906, autonomie syndicale.
- `observer-cogestion` (`sideEvents.ts:491-502`) — inviter Klaus à la confédération.
- `cogestion-impossible` (`sideEvents.ts:504-514`) — « le patronat français préfère le bâton ».

Je joue **`observer-cogestion`**. L'outcome : « Vingt ans plus tard, certains s'en souviendront pour défendre les CHSCT. » Magnifique. Mais déception derrière — le flag `mitbestimmung-presented` n'est jamais rappelé. J'ai cherché dans `choiceResolver.ts` : 13 callbacks, dont `cgpf-cogestion` (ligne 178), mais RIEN sur `mitbestimmung-presented` ni `cogestion-rejetee`. **L'événement s'évapore.** En Allemagne on dirait *Strohfeuer* — feu de paille.

### Deuxième partie — patron CGPF 1936

Bascule côté patron, scénario `cgpf-1936-apres-matignon` (`patron.ts:97-176`). Le choix `cgpf-tenir` (ligne 122) déclenche le flag `cgpf-cogestion` — et là OUI, callback à T+4 (`choiceResolver.ts:178-185`) : « Une réunion CGPF restreinte refuse ton ouverture. Pas de cogestion. On garde la main, ou on perd tout. » **PARFAIT.** C'est l'explication du refus français de la cogestion — et c'est seulement côté patron que je l'entends. Le salarié, lui, ne voit jamais cette mécanique-là.

Ensuite scénario `cnpf-1946` (`patron.ts:178-244`) — je joue `cnpf-siege`, flag `cnpf-insertion`. Pas de callback. Dommage : c'est le tournant historique majeur (le patronat accepte la minorité dans la Sécu paritaire). Méritait un écho.

### Sécu, Unédic, Agirc-Arrco — la spécificité française enfin nommée

`institutionsRegistry.ts:23-30, 60` cite les trois piliers. `legendaryCharacters.ts:171-179` (Yves Veyrier FO) répète : « Quand l'État a besoin d'argent, il lorgne sur les réserves des institutions paritaires. » **C'est la phrase qui m'a fait comprendre.** En Allemagne le *Sozialstaat* est étatique-fédéral ; en France les caisses sont DES syndicats + DU patronat, pas l'État. C'est ça, le paritarisme — et c'est le SEUL endroit où je l'ai vraiment compris.

### Les 6 ateliers (pas 7) testés depuis le miroir allemand

Je trouve 6 ateliers dans `src/game/ateliers/` : confrontation, elections, greve, laplace, nao, table (le mission disait 7 — peut-être compte-t-il `matignon-main` séparément ?). NAO et Table fonctionnent. La grève me paraît très française — concept *Streikkultur* différent. Élections professionnelles : équivalent du *Betriebsrat*, mais le seuil de représentativité 8 % (`glossary.ts`) est plus politique chez nous. Atelier Laplace : je n'ai pas saisi en quoi il valorise le paritarisme. Confrontation : trop abstrait pour un débutant Mitbestimmung.

### Bilan comparatiste

3 spécificités françaises retenues :
1. Cogestion **des caisses** (Sécu, Unédic, Agirc-Arrco), pas de l'entreprise.
2. **Pluralisme syndical** (4 confédérations en compétition, pas 1).
3. **Charte d'Amiens 1906** — l'indépendance syndicale comme doctrine fondatrice (citée `sideEvents.ts:480`).

3 confusions persistantes :
1. Pourquoi le patronat français refuse la cogestion d'entreprise — réponse seulement côté patron, jamais côté salarié.
2. Pourquoi 1945 a fait Sécu **paritaire** plutôt qu'**étatique** comme la NHS britannique ou la Krankenkasse allemande post-Bismarck.
3. Articulation État / partenaires sociaux — la « lettre de cadrage » (`historicalBase.ts:43`) m'évoque la *konzertierte Aktion* allemande mais le jeu ne fait pas le lien.

Je sors du jeu informé, ému (Croizat), mais avec le sentiment que le **miroir allemand est sous-exploité** : il existe (side event 1992), il pose les bonnes questions — et il s'évapore sans callback.
