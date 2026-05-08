# Journal — Annette Jobert (agent-17)
## Session bêta privée v2.2.2-prebeta · 2026-05-08

> *Profil officiel : « Comparaison européenne — Mitbestimmung, Italie, Suède ». Mais je suis avant tout sociologue de la négociation collective. Je viens lire si les outcomes NAO et la mise en scène Matignon racontent VRAIMENT le dialogue social français, ou s'ils en jouent les apparences.*

---

### Première NAO — preset standard, IA vs IA, seed libre

J'entre par le launcher en mode « équilibré ». Je choisis l'atelier NAO. Surprise au tour 1 : je vois 4 unions, pas 3. CFE-CGC est là, poids 7 % (`engine.ts:149`). Honnête — c'est la moyenne nationale dans les CSE non-cadres. Le profil affiché — « Cadres et catégoriels » — sensible télétravail (40 % du poids `engine.ts:154`) — me fait sourire : c'est exactement ce qu'on lit dans les négociations télétravail post-2020.

Séance 1 : la CGT démarre en `pression` (`engine.ts:816`). C'est canonique. Le scénario est ancré dans une dramaturgie d'ouverture. Bien.

Séance 3 : l'employeur joue `communication` pour faire baisser la CGT. Je le vois faire — ça correspond à la rhétorique RH réelle (« on contourne les radicaux »). Score sociologique : juste.

Séance 5 : `accord_majoritaire`. CFDT + FO + CFE-CGC signent (62 %). CGT en `retrait`. **C'est le scénario type français post-2017** : une coalition réformiste-cadre majoritaire face à une CGT contestataire. Bien rendu.

### Deuxième NAO — preset TPE-PME

24 pts, 3 séances (`engine.ts:88-93`). C'est plus serré. Le rapport de force change : moins de marge, plus de tactique. À séance 2, l'employeur ne distribue que sur salaires + télétravail. La CGT se met en `retrait` (le roll 22 % a tiré, `engine.ts:817-822`). CFDT suit (50 %, couplage `engine.ts:843-845`). FO aussi (50 %, `engine.ts:869`). **PV de désaccord.** Logique : en TPE, sans coordination intersyndicale, ça casse vite.

### Atelier La Table

Zone 50 → 62 → 71 sur 3 rounds. Je joue `consulter` au round 1 (mandat renforcé), `mediatiser` au round 2 (presse), `ancrer` au round 3. **Accord ambitieux.** La mécanique du « beats » (`engine.ts:91-97`) est sociologiquement OK : la consultation de la base est valorisée comme ressource morale, ce qui est exactement la lecture de Reynaud sur la « régulation conjointe ».

### Matignon 1936

10-15 minutes. Métriques `baseTrust 72`, `employerPressure 68`, `statePatience 58` (`matignon.ts:300-305`). J'ouvre par `clarify-mandate`, puis `trade-face-for-rights`, puis `sign-balanced`. **C'est le geste Jouhaux.** L'engine restitue la dramaturgie de la médiation Blum : sauver la face patronale pour transformer le rapport de force en droits durables. Je ne suis pas sûre que les 18-30 ans saisiront le sens de « sauver la face » — mais le moteur, lui, l'a parfaitement modélisé.

### Ce qui me manque — mon biais de comparatiste

Aucune mention du Mitbestimmung allemand pendant la NAO. Le side event 1992 existe (cf. ORDA-009 §II), mais il est isolé. Je joue PARITAS et j'oublie qu'ailleurs on cogère. **C'est mon biais — je le reconnais.** Pour un public français lambda, ce n'est probablement pas un manque ; c'est moi qui veux mon comparatisme partout.
