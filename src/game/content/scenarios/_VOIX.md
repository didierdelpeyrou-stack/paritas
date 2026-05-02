# Voix de Paritas — guide de rédaction

Ce document fixe le **ton de l'écriture** des scénarios après le pivot
de mai 2026. Toute nouvelle rédaction (ou reprise d'ancienne)
respecte ces 12 règles.

---

## Esprit, dans l'ordre

1. **Simulation politique vivante** — le joueur sent qu'il pilote un
   système réel, pas qu'on lui raconte une histoire.
2. **Pédagogie sur l'histoire du paritarisme** — chaque scénario
   apprend quelque chose de réel et sourcé.
3. **Poids dramatique** — la décision pèse, mais on n'écrase pas.

L'écriture sert ces trois en même temps : on **explique en faisant
sentir**, on ne fait pas sentir au prix de l'explication.

---

## Les 12 règles du FALC inspiré

### Forme

1. **Phrases courtes** : 8 à 15 mots idéal, 20 maximum.
2. **Une idée par phrase**. Si tu écris « et », demande-toi si une
   phrase à part ne servirait pas mieux.
3. **Présent simple par défaut**. Passé composé pour le rappel
   historique (« en 1864, Ollivier *a fait passer* la loi »).
4. **Voix active** : « le ministre annonce », pas « il est annoncé
   par le ministre ».
5. **Verbes concrets** : « il signe » > « il procède à la signature ».
6. **Pas d'inversion sujet-verbe** : « le patron arrive » > « arrive le
   patron ». Pas de subjonctif imparfait.
7. **Pas de double négation**. « Aucun » ou « ne… pas », jamais les
   deux ensemble.

### Vocabulaire

8. **Termes techniques en italique-glossaire**. C'est automatique via
   le composant `GlossaryText`. Si un terme syndical, paritaire, légal
   ou étatique apparaît, il sera enrobé. Tu n'as rien à faire dans le
   texte.
9. **Pas de termes techniques sans explication**. Si tu introduis un
   nouveau terme, ajoute une définition courte. Ou ajoute le mot au
   glossaire (`src/game/content/glossary.ts`).
10. **Métaphores familières acceptées** si elles aident à sentir :
    « la rue gronde », « le pays se fige », « la table devient un
    champ de bataille ». Évite les métaphores littéraires obscures.

### Structure

11. **Listes au maximum 5 items**. Au-delà, c'est un tableau ou un
    découpage en sous-paragraphes.
12. **Quote historique = phrase littérale**. On cite, on ne paraphrase
    pas. Source toujours nommée.

---

## Champs concernés et longueurs cibles

| Champ                     | Longueur cible       | Notes                        |
|---------------------------|----------------------|------------------------------|
| `title`                   | 2-4 mots             | nominal, pas de verbe        |
| `subtitle`                | 4-8 mots             | situe l'enjeu                |
| `historicalContext`       | 60-90 mots, 4-6 phrases | sourcé, pas de jugement   |
| `setup.reflechi`          | 70-110 mots, 5-7 phrases | explique l'angle           |
| `setup.compulsif`         | 50-80 mots, 4-5 phrases | sensoriel, présent          |
| `voices[].text`           | ≤ 18 mots, 1 phrase  | parlée, vivante              |
| `quotes[].text`           | citation littérale   | virgules / point final OK    |
| `choices[].text`          | 8-14 mots, 1 phrase  | verbe d'action + complément  |
| `choices[].intent`        | 2-5 mots, fragment OK | nominal, posture             |
| `choices[].theoryHint`    | ≤ 22 mots, 1 phrase  | concept stratégique          |
| `choices[].consequence.immediate` | 30-55 mots, 3-4 phrases | concret, factuel  |
| `choices[].consequence.longterm` | 40-70 mots, 3-4 phrases | conséquence à 5-15 ans |

---

## Trois exemples

### Avant (style ancien, dense)

> « Sous la Restauration et la Monarchie de Juillet, les sociétés de
> secours mutuel se multiplient malgré la loi Le Chapelier (1791)
> renforcée par les articles 414-416 du Code pénal de 1810 qui
> sanctionnent toute coalition. Officiellement caisses de
> bienfaisance, elles servent aussi de relais clandestins pour la
> coordination ouvrière. La police les tolère tant qu'elles ne
> dépassent pas vingt membres. »

### Après (FALC inspiré)

> « Entre 1820 et 1830, les ouvriers s'organisent en cachette.
> La loi *Le Chapelier* (1791) interdit toute coalition. Le *Code pénal*
> de 1810 sanctionne durement. Pourtant les sociétés de secours mutuel
> se multiplient. Officiellement, elles aident les veuves et les
> malades. En réalité, elles servent aussi à coordonner les ouvriers.
> La police ferme les yeux tant que la société compte moins de vingt
> membres. »

8 phrases au lieu de 4. Mots simples, italique automatique sur les
termes techniques, présent narratif. Même information, lecture en 30
secondes au lieu d'une minute.

### Voix intérieure — avant

> « On meurt mieux à plusieurs. C'est par là qu'on commence à vivre
> mieux. »

### Voix intérieure — après (déjà courte, garde la respiration)

Inchangé. C'est déjà du FALC inspiré : 14 mots, image familière, deux
phrases, un sens.

---

## Ce qu'on garde absolument

- Les **citations historiques littérales** : Babeuf, Pelloutier,
  Jouhaux, Clemenceau. On ne les modernise pas.
- Le **rythme dramatique** : un scénario pivot (Matignon, Sécu,
  Grenelle, Plan Juppé) peut s'autoriser une phrase plus longue à un
  moment-clé pour créer l'effet.
- L'**ironie** mesurée si elle sert la pédagogie politique.

## Ce qu'on jette

- Les phrases avec deux subordonnées. On coupe.
- Les inversions stylistiques (« arrive le ministre »).
- Le subjonctif imparfait.
- Les latinismes ou archaïsmes opaques.
- Les périphrases évitables (« procéder à la rédaction » → « écrire »).
- Les métaphores littéraires non-familières.
