import type { Choice, RebirthGameState, Scenario } from '../types';
import type { PipelineId } from './pipelineTypes';

export interface PipelineSceneData {
  title: string;
  subtitle: string;
  mood: Scenario['mood'];
  historicalContext: string;
  reflechi: string;
  compulsif: string;
  voices: Scenario['voices'];
  choices: Choice[];
}

type StageBuilder = (state: RebirthGameState) => PipelineSceneData;

const PIPELINE_STAGES: Record<PipelineId, StageBuilder[]> = {
  institution: [institutionStage0, institutionStage1, institutionStage2],
  rupture: [ruptureStage0, ruptureStage1, ruptureStage2],
  capture: [captureStage0, captureStage1, captureStage2],
  refondation: [refondationStage0, refondationStage1, refondationStage2],
  declin: [declinStage0, declinStage1, declinStage2]
};

export function pipelineSceneData(
  id: PipelineId,
  stage: number,
  state: RebirthGameState
): PipelineSceneData | null {
  const builders = PIPELINE_STAGES[id];
  const builder = builders[stage];
  if (!builder) return null;
  return builder(state);
}

export function pipelineMaxStage(id: PipelineId): number {
  return PIPELINE_STAGES[id].length - 1;
}

function pipelineChoice(
  id: string,
  text: string,
  intent: string,
  resources: NonNullable<Choice['effects']['resources']>,
  immediate: string,
  traitShift: Choice['traitShift'] = { batisseur: 1, pragmatique: 1 }
): Choice {
  return {
    id,
    text,
    intent,
    theoryHint: 'Pipeline narratif : cette scène existe parce que tes décisions précédentes ont laissé une trace.',
    effects: { resources },
    consequence: { immediate },
    traitShift
  };
}

/* ----------------------------- INSTITUTION ----------------------------- */

function institutionStage0(): PipelineSceneData {
  return {
    title: 'L’institution réclame sa part',
    subtitle: 'Le compromis devient gestion',
    mood: 'calme',
    historicalContext:
      'Une institution sociale ne vit pas seulement par son texte fondateur : elle exige des administrateurs, des budgets et une légitimité renouvelée.',
    reflechi:
      'Tes choix ont construit du capital institutionnel. Maintenant, la gestion quotidienne commence à peser sur le mandat.',
    compulsif:
      'Les affiches promettaient la justice. Les dossiers demandent des signatures, des guichets, des heures.',
    voices: [{ trait: 'batisseur', text: 'Construire oblige ensuite à administrer.' }],
    choices: [
      pipelineChoice(
        'institution-audit',
        'Auditer publiquement l’institution.',
        'Transparence contre soupçon.',
        { institution: 5, legitimite: 4, caisse: -2 },
        'La transparence coûte, mais elle rend l’institution défendable.'
      ),
      pipelineChoice(
        'institution-base',
        'Rendre des comptes à la base.',
        'Réarmer le mandat.',
        { confiance: 6, institution: 2, rapportDeForce: -1 },
        'La base entend enfin ce que la gestion produit concrètement.'
      ),
      pipelineChoice(
        'institution-technique',
        'Professionnaliser la gestion.',
        'Efficacité avant récit.',
        { institution: 6, confiance: -2, caisse: -3 },
        'La machine devient plus solide, mais plus lointaine.'
      )
    ]
  };
}

function institutionStage1(): PipelineSceneData {
  return {
    title: 'Une réforme cherche sa main',
    subtitle: 'L’institution doit bouger ou s’abîmer',
    mood: 'tendu',
    historicalContext:
      'Toute institution paritaire finit par devoir réécrire ses règles : démographie, financement, périmètre. Le moment de la réforme révèle qui tient vraiment le stylo.',
    reflechi:
      'Les chiffres disent la même chose depuis trois rapports. La question n’est plus s’il faut réformer, mais qui imposera la grammaire de la réforme.',
    compulsif:
      'Dans les couloirs, on parle de "modernisation". Tu sais ce que ce mot recouvre quand il sort d’un cabinet ministériel.',
    voices: [
      { trait: 'technocrate', text: 'Si tu n’écris pas la réforme, l’État l’écrira pour toi.' },
      { trait: 'rupture', text: 'Une réforme imposée vaut mieux qu’une réforme signée si elle laisse intacte la légitimité.' }
    ],
    choices: [
      pipelineChoice(
        'institution-stage1-piloter',
        'Déposer ton propre projet de réforme.',
        'Imposer la grammaire.',
        { institution: 6, legitimite: 4, caisse: -3 },
        'Le projet circule. Personne ne le signera tel quel, mais tout le monde devra se positionner par rapport à lui.',
        { batisseur: 2, technocrate: 1 }
      ),
      pipelineChoice(
        'institution-stage1-cogerer',
        'Co-écrire la réforme avec l’État.',
        'Assumer la cogestion.',
        { institution: 8, confiance: -4, caisse: 2 },
        'L’encre sèche vite. Les militants comprennent qu’on a sécurisé l’institution, peut-être au prix de quelques principes.',
        { pragmatique: 2, batisseur: 1 }
      ),
      pipelineChoice(
        'institution-stage1-bloquer',
        'Refuser toute réforme tant que la base ne tranche pas.',
        'Geler pour mandater.',
        { confiance: 7, institution: -3, rapportDeForce: 4 },
        'Le blocage est mal vu en haut. Il rappelle en bas qu’une institution sans mandat n’est qu’un guichet.',
        { rupture: 2, tribun: 1 }
      )
    ]
  };
}

function institutionStage2(): PipelineSceneData {
  return {
    title: 'La mémoire de l’institution',
    subtitle: 'Ce que l’histoire retient',
    mood: 'melancolique',
    historicalContext:
      'Les institutions sociales survivent par leur récit autant que par leurs textes. Sans mémoire vivante, elles deviennent des sigles que personne ne défend.',
    reflechi:
      'L’institution tient. La question est de savoir si quelqu’un saura encore raconter pourquoi elle a été créée, dans dix ans, dans vingt ans.',
    compulsif:
      'Quelqu’un, en réunion, n’a pas su dire la date fondatrice. Tu as compris à ce moment que la mémoire ne se transmet pas par décret.',
    voices: [{ trait: 'batisseur', text: 'Une institution sans récit perd ses gardiens avant ses bénéficiaires.' }],
    choices: [
      pipelineChoice(
        'institution-stage2-recit',
        'Lancer un travail collectif de mémoire.',
        'Réécrire le récit fondateur.',
        { legitimite: 6, confiance: 4, caisse: -3 },
        'Le récit ne sauve pas l’institution. Il rend coûteux pour les adversaires de la démanteler en silence.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'institution-stage2-relais',
        'Former une génération de gestionnaires militants.',
        'Transmettre le poste.',
        { institution: 5, confiance: 3, caisse: -4 },
        'Les nouveaux administrateurs savent lire un bilan. On leur a aussi appris pourquoi on est venu lire ce bilan.',
        { batisseur: 2, technocrate: 1 }
      ),
      pipelineChoice(
        'institution-stage2-acter',
        'Acter la mue : assumer la gestion comme métier.',
        'Devenir machine.',
        { institution: 8, confiance: -5, legitimite: 2 },
        'Le passage est net. L’institution gagne en efficacité ce qu’elle perd en chair militante.',
        { technocrate: 2 }
      )
    ]
  };
}

/* ------------------------------ RUPTURE ------------------------------- */

function ruptureStage0(): PipelineSceneData {
  return {
    title: 'La mémoire de la rupture',
    subtitle: 'Le conflit revient demander un prix',
    mood: 'grave',
    historicalContext:
      'Les mouvements épuisés ne disparaissent pas : ils reviennent sous forme de fierté, de rancœur ou de prudence.',
    reflechi:
      'Tes choix ont installé une mémoire de lutte. Elle peut remobiliser, ou empêcher tout compromis.',
    compulsif:
      'Dans les réunions, quelqu’un rappelle les jours perdus. Personne ne sait s’il parle de courage ou de blessure.',
    voices: [{ trait: 'rupture', text: 'Une défaite peut devenir un mythe si tu sais la porter.' }],
    choices: [
      pipelineChoice(
        'rupture-memoire',
        'Transformer la défaite en récit mobilisateur.',
        'Capital symbolique.',
        { confiance: 5, rapportDeForce: 5, santeSociale: -2 },
        'Le récit redonne une colonne vertébrale au mouvement.'
      ),
      pipelineChoice(
        'rupture-repos',
        'Organiser une pause stratégique.',
        'Soigner les forces.',
        { santeSociale: 7, rapportDeForce: -4, caisse: 2 },
        'La pause ressemble à un recul, mais elle évite de casser les corps.'
      ),
      pipelineChoice(
        'rupture-revanche',
        'Chercher une revanche immédiate.',
        'Tout remettre sur la table.',
        { rapportDeForce: 8, santeSociale: -8, legitimite: -3 },
        'La revanche rallume le feu. Elle brûle aussi les réserves.'
      )
    ]
  };
}

function ruptureStage1(): PipelineSceneData {
  return {
    title: 'Le mot d’ordre',
    subtitle: 'La colère cherche une grammaire',
    mood: 'tendu',
    historicalContext:
      'Une mobilisation devient mouvement quand un mot d’ordre clair circule. Trop large, il dilue ; trop étroit, il isole.',
    reflechi:
      'La pression monte des sections. Il faut nommer ce qu’on veut, ou laisser d’autres le faire à ta place.',
    compulsif:
      'Tu relis trois versions du tract. Aucune ne dit exactement ce qu’il faudrait. Toutes en disent quelque chose.',
    voices: [
      { trait: 'tribun', text: 'Un mot d’ordre est un test de température, pas une loi.' },
      { trait: 'pragmatique', text: 'Ne demande pas ce que tu ne sais pas obtenir.' }
    ],
    choices: [
      pipelineChoice(
        'rupture-stage1-large',
        'Lancer un mot d’ordre large et fédérateur.',
        'Élargir le camp.',
        { rapportDeForce: 5, confiance: 4, legitimite: -2 },
        'Le mot d’ordre rassemble. On verra plus tard ce qu’il signifie concrètement.',
        { tribun: 2, batisseur: 1 }
      ),
      pipelineChoice(
        'rupture-stage1-precis',
        'Cadrer une revendication précise et chiffrée.',
        'Cibler la victoire.',
        { rapportDeForce: 4, institution: 3, confiance: -1 },
        'La revendication est lisible, négociable, défendable. Certains la trouvent timide.',
        { pragmatique: 2, technocrate: 1 }
      ),
      pipelineChoice(
        'rupture-stage1-radicale',
        'Porter une revendication maximaliste.',
        'Forcer la rupture.',
        { rapportDeForce: 8, santeSociale: -3, institution: -3 },
        'La revendication ne sera pas signée. Elle redéfinit ce qu’il était permis de demander.',
        { rupture: 3 }
      )
    ]
  };
}

function ruptureStage2(): PipelineSceneData {
  return {
    title: 'Répression ou concession',
    subtitle: 'L’État tranche le moment',
    mood: 'grave',
    historicalContext:
      'À la fin d’un mouvement, le pouvoir choisit entre céder, négocier ou frapper. Le choix de l’adversaire détermine la mémoire que tu garderas.',
    reflechi:
      'La rumeur circule : on prépare soit une table, soit une charge. Tes prochains gestes décideront laquelle des deux deviendra réelle.',
    compulsif:
      'Une voiture de police passe lentement devant le local. Le téléphone du cabinet sonne. Les deux possibilités existent en même temps.',
    voices: [{ trait: 'rupture', text: 'Ce qui se joue ici sera raconté pendant trente ans.' }],
    choices: [
      pipelineChoice(
        'rupture-stage2-tenir',
        'Tenir la mobilisation jusqu’au bout.',
        'Forcer une concession nette.',
        { rapportDeForce: 7, santeSociale: -6, legitimite: 3 },
        'Le pouvoir cède sur un point dur. Le coût humain reste, gravé dans les corps.',
        { rupture: 2, tribun: 1 }
      ),
      pipelineChoice(
        'rupture-stage2-table',
        'Accepter la table avant la charge.',
        'Sauver l’acquis.',
        { institution: 5, rapportDeForce: -3, confiance: -2 },
        'La table existe. Une partie des militants la lit comme une trahison, une autre comme une victoire.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'rupture-stage2-symbole',
        'Transformer la fin du mouvement en symbole durable.',
        'Léguer la mémoire.',
        { confiance: 6, legitimite: 4, caisse: -3 },
        'Le mouvement finit, le récit commence. La mémoire devient une ressource pour la prochaine génération.',
        { tribun: 2, batisseur: 1 }
      )
    ]
  };
}

/* ------------------------------ CAPTURE ------------------------------- */

function captureStage0(): PipelineSceneData {
  return {
    title: 'Le siège confortable',
    subtitle: 'Reconnaissance ou capture',
    mood: 'melancolique',
    historicalContext:
      'La démocratie sociale vit d’une tension : être reconnu par l’État sans devenir son simple relais.',
    reflechi:
      'Tes liens institutionnels ouvrent des portes. La base commence à demander ce que tu as laissé dehors.',
    compulsif:
      'Le fauteuil est bon. Trop bon. Tu sens que la pièce te reconnaît à mesure que certaines voix s’éloignent.',
    voices: [{ trait: 'pragmatique', text: 'Être à la table ne vaut rien si tu oublies qui t’y envoie.' }],
    choices: [
      pipelineChoice(
        'capture-retour-base',
        'Soumettre le siège à un mandat explicite.',
        'Réparer la représentation.',
        { confiance: 7, legitimite: 2, institution: -1 },
        'Le mandat rend la place moins confortable, donc plus légitime.'
      ),
      pipelineChoice(
        'capture-accord-opaque',
        'Signer vite pour obtenir un gain concret.',
        'Résultat contre transparence.',
        { institution: 5, caisse: 2, confiance: -7 },
        'Le gain existe. Le soupçon aussi.'
      ),
      pipelineChoice(
        'capture-refus-siege',
        'Quitter la table publiquement.',
        'Rupture symbolique.',
        { rapportDeForce: 6, legitimite: 3, institution: -5 },
        'La sortie réveille la base et ferme quelques portes.'
      )
    ]
  };
}

function captureStage1(): PipelineSceneData {
  return {
    title: 'La base murmure',
    subtitle: 'Le doute remonte des sections',
    mood: 'tendu',
    historicalContext:
      'Quand l’appareil est trop proche du pouvoir, les sections n’envoient plus de motions. Elles envoient des silences, plus dangereux.',
    reflechi:
      'Plusieurs sections ne renouvellent pas leur cotisation. Aucune n’écrit pour expliquer pourquoi. C’est la forme la plus polie d’une rupture.',
    compulsif:
      'Une déléguée que tu connais depuis dix ans détourne le regard à l’assemblée. Tu sais ce que ce détour veut dire.',
    voices: [
      { trait: 'rupture', text: 'Ils ne crient plus. C’est qu’ils écrivent ailleurs.' },
      { trait: 'batisseur', text: 'On peut encore réparer si on parle vraiment.' }
    ],
    choices: [
      pipelineChoice(
        'capture-stage1-tournee',
        'Lancer une tournée d’écoute des sections.',
        'Renouer le fil.',
        { confiance: 6, santeSociale: 3, caisse: -3 },
        'Tu écoutes. Beaucoup ne demandent qu’à être pris au sérieux. Quelques-uns demandent une démission.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'capture-stage1-defense',
        'Défendre publiquement la stratégie d’institution.',
        'Assumer le siège.',
        { institution: 4, legitimite: 3, confiance: -4 },
        'La défense est claire. Ceux qui doutaient doutent désormais en silence — pour combien de temps.',
        { technocrate: 2, pragmatique: 1 }
      ),
      pipelineChoice(
        'capture-stage1-purge',
        'Marginaliser les voix dissidentes.',
        'Tenir l’appareil.',
        { institution: 5, confiance: -7, rapportDeForce: -2, santeSociale: -3 },
        'Le silence devient sécurité. Une scission lente commence à se chiffrer dans les permanences vides.',
        { pragmatique: 1, batisseur: -1 }
      )
    ]
  };
}

function captureStage2(): PipelineSceneData {
  return {
    title: 'Avant l’élection interne',
    subtitle: 'Le mandat va se rejouer',
    mood: 'grave',
    historicalContext:
      'Une organisation capturée par l’État se découvre vraiment au moment du mandat suivant : la base lit la facture.',
    reflechi:
      'L’élection interne approche. Tes adversaires internes ont compris qu’ils n’avaient même pas besoin d’attaquer ta gestion. Il leur suffit de la lire à voix haute.',
    compulsif:
      'On t’apporte une motion d’opposition. Elle est polie. C’est ce qui te fait peur.',
    voices: [{ trait: 'tribun', text: 'Il n’y a pas pire perte que celle qu’on a vue venir.' }],
    choices: [
      pipelineChoice(
        'capture-stage2-mandat',
        'Faire campagne sur un nouveau mandat clair.',
        'Reformuler la ligne.',
        { confiance: 7, legitimite: 4, caisse: -3 },
        'La campagne redevient un débat. Tu n’es plus inattaquable, tu es discutable. Et c’est mieux.',
        { tribun: 2, batisseur: 1 }
      ),
      pipelineChoice(
        'capture-stage2-integrer',
        'Intégrer un opposant à la direction.',
        'Désarmer la motion.',
        { confiance: 5, institution: 2, legitimite: 2 },
        'L’opposant entre. Sa critique aussi. La cohésion gagne ce que la pureté politique perd.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'capture-stage2-purger',
        'Verrouiller l’ordre du jour pour éviter le débat.',
        'Tenir au prix du soupçon.',
        { institution: 3, legitimite: -6, confiance: -8 },
        'Le verrou tient. Le mot "capture" sort officiellement dans une motion publiée.',
        { pragmatique: 1, batisseur: -1 }
      )
    ]
  };
}

/* ---------------------------- REFONDATION ----------------------------- */

function refondationStage0(state: RebirthGameState): PipelineSceneData {
  const isPatron = state.camp === 'patron';
  return {
    title: 'Refaire autrement',
    subtitle: 'Expérimentation sociale',
    mood: 'euphorique',
    historicalContext:
      'Quand les cadres classiques paraissent bloqués, des acteurs cherchent des formes nouvelles : mutuelles, caisses autonomes, alliances territoriales.',
    reflechi:
      'Tes refus répétés ont créé un vide. Tu peux l’habiter par une expérimentation au lieu d’un simple non.',
    compulsif:
      'Pour une fois, le refus n’est pas une porte fermée. C’est un terrain vague. Quelque chose peut y pousser.',
    voices: [{ trait: 'batisseur', text: 'Refuser ne suffit pas. Il faut donner une adresse à l’avenir.' }],
    choices: [
      pipelineChoice(
        'refondation-caisse',
        'Créer une caisse autonome expérimentale.',
        'Pouvoir matériel.',
        { institution: 5, confiance: 5, caisse: -5 },
        'La caisse donne un corps à l’alternative.'
      ),
      pipelineChoice(
        'refondation-alliance',
        isPatron ? 'Nouer une alliance territoriale productive.' : 'Nouer une alliance avec mutuelles et associations.',
        'Élargir le camp.',
        { legitimite: 6, institution: 3, rapportDeForce: 2 },
        'L’alliance rend la refondation plus difficile à caricaturer.'
      ),
      pipelineChoice(
        'refondation-manifeste',
        'Publier un manifeste de refondation.',
        'Cadrer le futur.',
        { legitimite: 5, confiance: 3, caisse: -2 },
        'Le manifeste ne règle rien seul, mais il donne une grammaire.'
      )
    ]
  };
}

function refondationStage1(state: RebirthGameState): PipelineSceneData {
  const isPatron = state.camp === 'patron';
  return {
    title: isPatron ? 'L’alliance des branches' : 'Mutuelles, ESS, branches : agréger',
    subtitle: 'Du laboratoire à la coalition',
    mood: 'tendu',
    historicalContext:
      'Une expérimentation devient politique quand elle se relie à d’autres. C’est le moment où la refondation cesse d’être marginale.',
    reflechi:
      'Le laboratoire fonctionne. Mais sans coalition, il restera un cas d’école que les institutions citeront sans le suivre.',
    compulsif:
      'Tu rencontres des gens qui ne te ressemblent pas. Ils ont les mêmes problèmes, et un vocabulaire à eux. La discussion est lente.',
    voices: [
      { trait: 'batisseur', text: 'Une seule expérimentation ne refonde rien. Trois en réseau, peut-être.' },
      { trait: 'pragmatique', text: 'Les alliances coûtent du temps. Sans elles, le projet meurt en silence.' }
    ],
    choices: [
      pipelineChoice(
        'refondation-stage1-coalition',
        'Lancer une coalition multi-acteurs.',
        'Faire masse.',
        { legitimite: 6, institution: 4, caisse: -4 },
        'La coalition donne un poids politique à ce qui était une marge. Elle dilue aussi le contrôle.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'refondation-stage1-territoires',
        'Essaimer dans plusieurs territoires.',
        'Multiplier les preuves.',
        { confiance: 5, institution: 5, caisse: -6 },
        'Chaque territoire produit sa version. La preuve devient difficile à ignorer.',
        { batisseur: 2, technocrate: 1 }
      ),
      pipelineChoice(
        'refondation-stage1-reconnaissance',
        'Demander une reconnaissance institutionnelle partielle.',
        'Sortir du laboratoire.',
        { institution: 7, legitimite: 4, rapportDeForce: -2 },
        'L’institution répond avec prudence. Elle reconnaît un statut, sans encore reconnaître la doctrine.',
        { pragmatique: 2, technocrate: 1 }
      )
    ]
  };
}

function refondationStage2(): PipelineSceneData {
  return {
    title: 'Une nouvelle doctrine cherche son nom',
    subtitle: 'Refondation ou récupération',
    mood: 'euphorique',
    historicalContext:
      'Les refondations réussies finissent par changer le vocabulaire de leur époque. Elles risquent aussi d’être absorbées par celui qu’elles voulaient remplacer.',
    reflechi:
      'Le mot que tu utilises depuis dix tours commence à sortir d’autres bouches. Le risque a changé : ce n’est plus l’invisibilité, c’est la récupération.',
    compulsif:
      'Un éditorial du grand quotidien reprend ton vocabulaire. Tu ne sais pas si c’est une victoire ou un enterrement.',
    voices: [{ trait: 'tribun', text: 'Une doctrine qui ne se laisse pas voler n’a pas commencé à exister.' }],
    choices: [
      pipelineChoice(
        'refondation-stage2-doctrine',
        'Codifier la doctrine et la défendre publiquement.',
        'Ancrer le mot.',
        { legitimite: 7, institution: 4, caisse: -3 },
        'La doctrine devient un repère. Elle perd un peu de sa fluidité, elle gagne une adresse.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'refondation-stage2-fusion',
        'Fusionner avec un acteur reconnu pour passer à l’échelle.',
        'Survivre par l’institution.',
        { institution: 8, legitimite: 3, confiance: -3 },
        'La fusion sécurise l’héritage matériel. Une partie du sens originel reste à la porte.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'refondation-stage2-laisser',
        'Laisser la doctrine vivre sans pilote unique.',
        'Renoncer à la propriété.',
        { confiance: 6, legitimite: 5, institution: -2 },
        'Le mot s’échappe. Il vit ailleurs, autrement, parfois mieux que dans tes mains.',
        { batisseur: 1, rupture: 1 }
      )
    ]
  };
}

/* ------------------------------- DECLIN ------------------------------- */

function declinStage0(): PipelineSceneData {
  return {
    title: 'Les comptes et la fatigue',
    subtitle: 'Risque de déclin',
    mood: 'grave',
    historicalContext:
      'Les organisations sociales meurent rarement d’un seul échec. Elles s’usent par caisse basse, sections fragiles et mandats illisibles.',
    reflechi:
      'Ton organisation entre dans une zone dangereuse. Il faut choisir ce qu’on sauve.',
    compulsif:
      'Les factures sont petites. C’est leur nombre qui fait peur.',
    voices: [{ trait: 'pragmatique', text: 'Sauver tout, parfois, c’est tout perdre.' }],
    choices: [
      pipelineChoice(
        'declin-vendre',
        'Vendre un actif et sauver la caisse.',
        'Respirer maintenant.',
        { caisse: 5, confiance: -3, institution: -2 },
        'La vente donne de l’air et laisse une trace de recul.'
      ),
      pipelineChoice(
        'declin-fusion',
        'Chercher une fusion ou alliance défensive.',
        'Survivre ensemble.',
        { institution: 4, legitimite: 2, rapportDeForce: -2 },
        'L’alliance sauve des forces mais dilue le nom.'
      ),
      pipelineChoice(
        'declin-cure',
        'Réduire les ambitions pour reconstituer la base.',
        'Repartir du terrain.',
        { confiance: 4, santeSociale: 4, rapportDeForce: -4 },
        'La modestie fait mal. Elle remet quelques visages autour de la table.'
      )
    ]
  };
}

function declinStage1(): PipelineSceneData {
  return {
    title: 'Permanences fermées',
    subtitle: 'Le déclin prend des visages',
    mood: 'grave',
    historicalContext:
      'Quand une organisation rétrécit, elle ne perd pas que des chiffres. Elle perd des permanents, des locaux, des relais — chacun emportant un savoir-faire.',
    reflechi:
      'Plusieurs permanences ne rouvriront pas après l’été. Le territoire change : certaines villes disparaissent simplement de ta carte syndicale.',
    compulsif:
      'Une vieille militante te dit au téléphone qu’elle range les classeurs. Sa voix est calme. Elle ne demande pas pourquoi.',
    voices: [
      { trait: 'pragmatique', text: 'Mieux vaut fermer proprement que mourir partout en silence.' },
      { trait: 'rupture', text: 'Tu es en train d’abandonner une géographie. Personne ne reviendra le faire à ta place.' }
    ],
    choices: [
      pipelineChoice(
        'declin-stage1-priorite',
        'Concentrer les forces sur quelques bastions.',
        'Sauver le cœur.',
        { confiance: 4, institution: 3, rapportDeForce: -3 },
        'Le cœur tient. L’extérieur s’éloigne. C’est un choix qui se voit sur la carte.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'declin-stage1-licencier',
        'Licencier des permanents pour tenir la caisse.',
        'Couper dans l’os.',
        { caisse: 6, confiance: -7, santeSociale: -3 },
        'Les comptes respirent. Les couloirs aussi, pour de mauvaises raisons.',
        { pragmatique: 1, batisseur: -1 }
      ),
      pipelineChoice(
        'declin-stage1-mutualiser',
        'Mutualiser locaux et juristes avec une autre organisation.',
        'Survivre par l’alliance.',
        { institution: 4, caisse: 3, legitimite: -2 },
        'Le local porte deux drapeaux. Les militants apprennent à partager un téléphone et un avocat.',
        { batisseur: 1, pragmatique: 1 }
      )
    ]
  };
}

function declinStage2(): PipelineSceneData {
  return {
    title: 'Disparition ou refondation',
    subtitle: 'La dernière bifurcation',
    mood: 'melancolique',
    historicalContext:
      'Au bout du déclin, deux issues : disparaître en gardant la dignité du nom, ou se refonder en perdant les contours d’origine.',
    reflechi:
      'Il faut nommer ce qui se passe. Ne pas le nommer rendra la fin plus longue, pas plus douce.',
    compulsif:
      'Quelqu’un a sorti la photo du congrès fondateur. Personne ne la regarde longtemps.',
    voices: [{ trait: 'batisseur', text: 'Un nom peut se transmettre. Une mémoire ne se ferme jamais d’un seul coup.' }],
    choices: [
      pipelineChoice(
        'declin-stage2-fusion',
        'Engager une fusion défensive.',
        'Sauver la fonction, perdre le nom.',
        { institution: 6, legitimite: 2, confiance: -4 },
        'La fusion se signe. L’organisation entre dans une autre, plus grande, et y défend ce qu’elle peut.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'declin-stage2-refonder',
        'Tenter une refondation interne radicale.',
        'Tout remettre sur la table.',
        { confiance: 5, rapportDeForce: 4, caisse: -5 },
        'Une partie part. Une autre reste, plus petite, plus claire. Le déclin devient une bifurcation.',
        { rupture: 2, batisseur: 1 }
      ),
      pipelineChoice(
        'declin-stage2-fermer',
        'Préparer une fermeture digne et documentée.',
        'Léguer la mémoire.',
        { legitimite: 6, confiance: 3, institution: -4 },
        'L’organisation s’arrête. Les archives partent dans une bibliothèque. Quelqu’un, quelque part, en fera quelque chose.',
        { batisseur: 1, tribun: 1 }
      )
    ]
  };
}
