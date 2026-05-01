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
  institution: [
    institutionStage0,
    institutionStage1,
    institutionStage2,
    institutionStage3,
    institutionStage4,
    institutionStage5
  ],
  rupture: [
    ruptureStage0,
    ruptureStage1,
    ruptureStage2,
    ruptureStage3,
    ruptureStage4,
    ruptureStage5
  ],
  capture: [
    captureStage0,
    captureStage1,
    captureStage2,
    captureStage3,
    captureStage4,
    captureStage5
  ],
  refondation: [
    refondationStage0,
    refondationStage1,
    refondationStage2,
    refondationStage3,
    refondationStage4,
    refondationStage5
  ],
  declin: [
    declinStage0,
    declinStage1,
    declinStage2,
    declinStage3,
    declinStage4,
    declinStage5
  ]
};

const STAGE_LABELS: Record<PipelineId, string[]> = {
  institution: [
    'Gestion s’installe',
    'Réforme à écrire',
    'Mémoire institutionnelle',
    'Crise budgétaire',
    'L’État avance ses pions',
    'Héritage en débat'
  ],
  rupture: [
    'Mémoire de la rupture',
    'Mot d’ordre',
    'Répression ou concession',
    'Scission ou institutionnalisation',
    'Transmission générationnelle',
    'Mythe à défendre'
  ],
  capture: [
    'Siège confortable',
    'Murmure de la base',
    'Avant l’élection interne',
    'Au sortir des urnes',
    'L’État se recompose',
    'Récit de la capture'
  ],
  refondation: [
    'Refaire autrement',
    'Coalition mutualiste',
    'Doctrine en débat',
    'Passage à l’échelle',
    'Récupération guettée',
    'Doctrine devenue norme'
  ],
  declin: [
    'Comptes et fatigue',
    'Permanences fermées',
    'Disparition ou refondation',
    'Second souffle',
    'Recommencement',
    'Trace dans l’histoire'
  ]
};

export function pipelineStageLabel(id: PipelineId, stage: number): string | null {
  return STAGE_LABELS[id][stage] ?? null;
}

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

/* --------------------- INSTITUTION — STAGES 3 à 5 --------------------- */

function institutionStage3(): PipelineSceneData {
  return {
    title: 'La crise budgétaire',
    subtitle: 'Le déficit cherche un arbitre',
    mood: 'tendu',
    historicalContext:
      'Toutes les institutions paritaires connaissent un moment de tension financière où la démographie, la conjoncture ou un transfert mal compensé exposent la solidité du compromis fondateur.',
    reflechi:
      'Les comptes plongent. Trois solutions classiques s’affrontent : hausse des cotisations, baisse des prestations, transfert à l’État. Chacune réécrit la promesse initiale.',
    compulsif:
      'Sur la table, un tableur. Sur les murs, des affiches plus anciennes que toi. Les deux ne disent pas la même chose et tu dois choisir lequel honorer.',
    voices: [
      { trait: 'technocrate', text: 'Ne pas trancher, c’est laisser Bercy trancher.' },
      { trait: 'tribun', text: 'Une institution qui ne sait plus défendre sa promesse est déjà morte.' }
    ],
    choices: [
      pipelineChoice(
        'institution-stage3-cotisation',
        'Plaider pour une hausse de cotisations.',
        'Tenir la promesse intacte.',
        { institution: 5, legitimite: 3, rapportDeForce: -2, caisse: 2 },
        'La hausse passe difficilement. Mais le contrat fondateur reste lisible : ce qu’on prend en plus paie ce qu’on garde.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'institution-stage3-couper',
        'Accepter une coupe ciblée des prestations.',
        'Sauver la structure.',
        { institution: 4, caisse: 5, confiance: -7 },
        'La coupe est passée. Ceux qui paient l’addition n’étaient pas ceux qui avaient écrit le compromis fondateur.',
        { pragmatique: 2, technocrate: 1 }
      ),
      pipelineChoice(
        'institution-stage3-etat',
        'Demander un transfert exceptionnel à l’État.',
        'Survivre par dépendance.',
        { institution: 3, caisse: 7, legitimite: -4, rapportDeForce: -3 },
        'Le transfert arrive. La main qui sauve commence aussi à diriger : la cogestion s’incline imperceptiblement.',
        { pragmatique: 2 }
      )
    ]
  };
}

function institutionStage4(): PipelineSceneData {
  return {
    title: 'L’État avance ses pions',
    subtitle: 'Reprise en main ou cohabitation',
    mood: 'grave',
    historicalContext:
      'Quand l’État finance, l’État oriente. La frontière entre paritarisme et étatisation se rejoue à chaque loi de finances et à chaque lettre de cadrage.',
    reflechi:
      'Une lettre de cadrage circule. Elle borne la négociation avant qu’elle commence. Tu peux la respecter, la contourner, ou la transformer en bras de fer.',
    compulsif:
      'Le cabinet ministériel envoie un texte de trois pages. Tu sais que la quatrième est déjà écrite ailleurs.',
    voices: [
      { trait: 'rupture', text: 'Une lettre de cadrage non contestée devient un précédent.' },
      { trait: 'pragmatique', text: 'Choisir ses combats : tu ne peux pas refuser tout à chaque fois.' }
    ],
    choices: [
      pipelineChoice(
        'institution-stage4-defier',
        'Refuser publiquement la lettre de cadrage.',
        'Réaffirmer le paritarisme.',
        { rapportDeForce: 6, legitimite: 4, institution: -3 },
        'Le refus fait scandale. La presse parle de partenaires sociaux qui retrouvent leur voix.',
        { rupture: 2, tribun: 1 }
      ),
      pipelineChoice(
        'institution-stage4-contourner',
        'Signer dans les bornes mais inscrire des contre-mesures techniques.',
        'Plier sans rompre.',
        { institution: 5, legitimite: 2, caisse: -2 },
        'Le texte respecte la lettre. Les annexes en disent autre chose. Les juristes apprécient.',
        { technocrate: 2, pragmatique: 1 }
      ),
      pipelineChoice(
        'institution-stage4-suivre',
        'Accepter le cadrage pour préserver le dialogue.',
        'Choisir la stabilité.',
        { institution: 4, legitimite: -3, caisse: 3, rapportDeForce: -4 },
        'Le dialogue continue. Sa portée rétrécit. Beaucoup ne s’en aperçoivent qu’à la signature suivante.',
        { pragmatique: 1, batisseur: -1 }
      )
    ]
  };
}

function institutionStage5(): PipelineSceneData {
  return {
    title: 'L’héritage en débat',
    subtitle: 'Ce que l’institution lègue',
    mood: 'melancolique',
    historicalContext:
      'À la fin d’un cycle, une institution sociale est jugée moins sur son texte fondateur que sur ce qu’elle a transmis : règles vivantes, gestionnaires formés, mémoire compréhensible.',
    reflechi:
      'Un colloque se prépare. On y parlera de toi, de la structure, des arbitrages perdus. Tu peux préparer ce moment, ou le laisser raconter par d’autres.',
    compulsif:
      'Une étudiante en sciences politiques t’envoie un mail. Elle écrit une thèse sur ton mandat. Sa première question est très polie. La deuxième est très précise.',
    voices: [{ trait: 'batisseur', text: 'L’héritage que tu reconnais ouvertement, on ne peut plus le réécrire facilement.' }],
    choices: [
      pipelineChoice(
        'institution-stage5-bilan',
        'Publier un bilan honnête, y compris les défaites.',
        'Mettre la mémoire en partage.',
        { legitimite: 6, confiance: 4, institution: 2 },
        'Le bilan est lu. On t’y reproche certaines choses. On t’y reconnaît d’en avoir parlé.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'institution-stage5-archiver',
        'Verser les archives à un centre indépendant.',
        'Léguer la trace.',
        { institution: 3, legitimite: 3, caisse: -3 },
        'Les caisses partent. Quelqu’un, dans dix ans, écrira le récit que tu n’écris pas aujourd’hui.',
        { batisseur: 2 }
      ),
      pipelineChoice(
        'institution-stage5-silence',
        'Laisser l’institution parler pour elle-même.',
        'Refuser le récit personnel.',
        { institution: 4, legitimite: -2 },
        'Le silence n’est pas neutre. Il sera lu — comme tout le reste — par ceux qui restent.',
        { pragmatique: 1 }
      )
    ]
  };
}

/* ----------------------- RUPTURE — STAGES 3 à 5 ----------------------- */

function ruptureStage3(): PipelineSceneData {
  return {
    title: 'Scission ou institutionnalisation',
    subtitle: 'L’après-mouvement',
    mood: 'tendu',
    historicalContext:
      'Une grande mobilisation laisse rarement l’organisation intacte : elle se scinde, s’institutionnalise, ou refonde sa centrale autour d’une nouvelle ligne.',
    reflechi:
      'Le mouvement est fini, le débat interne commence. Ceux qui ont tenu la base veulent une organisation qui leur ressemble. Ceux qui ont géré la table veulent stabiliser.',
    compulsif:
      'Deux salles, deux ambiances. Dans l’une, on parle d’héritage. Dans l’autre, on parle de fondation. Tu as ta carte dans les deux.',
    voices: [
      { trait: 'rupture', text: 'On ne ramène pas dans le rang celles qui ont risqué leur peau.' },
      { trait: 'batisseur', text: 'Une scission qui se prépare proprement vaut mieux qu’une fusion qui pourrit.' }
    ],
    choices: [
      pipelineChoice(
        'rupture-stage3-fusion',
        'Sceller un compromis interne pour éviter la scission.',
        'Sauver l’unité.',
        { institution: 5, confiance: 3, rapportDeForce: -2 },
        'L’unité tient, fragile. Les deux camps savent ce qu’ils ont accepté de taire.',
        { pragmatique: 2, batisseur: 1 }
      ),
      pipelineChoice(
        'rupture-stage3-scission',
        'Reconnaître la scission et organiser une séparation digne.',
        'Assumer deux trajectoires.',
        { rapportDeForce: 4, confiance: 2, institution: -5 },
        'La scission se fait dans une salle louée pour l’occasion. Personne ne crie. Tout le monde sait que c’est plus grave qu’un cri.',
        { rupture: 2 }
      ),
      pipelineChoice(
        'rupture-stage3-institutionnaliser',
        'Transformer le mouvement en organisation permanente.',
        'Capitaliser.',
        { institution: 7, legitimite: 4, rapportDeForce: -3 },
        'L’organisation se dote d’un règlement, d’un local, d’un permanent. Le mouvement perd un peu de sa fièvre, gagne un téléphone fixe.',
        { batisseur: 2, technocrate: 1 }
      )
    ]
  };
}

function ruptureStage4(): PipelineSceneData {
  return {
    title: 'Transmettre la rupture',
    subtitle: 'Une génération arrive sans la mémoire',
    mood: 'melancolique',
    historicalContext:
      'Les ruptures fondatrices se transmettent ou se perdent. Une génération qui n’a pas vécu le conflit a besoin de mots, pas seulement d’images.',
    reflechi:
      'Les nouvelles adhésions n’ont pas connu le mouvement de référence. Elles le respectent. Elles ne savent pas ce qu’il leur enseigne.',
    compulsif:
      'Un délégué de 22 ans te demande, l’air poli : « C’était quoi exactement, à l’époque ? » Tu prends une seconde de trop avant de répondre.',
    voices: [{ trait: 'tribun', text: 'Une mémoire qu’on n’explique pas devient un folklore.' }],
    choices: [
      pipelineChoice(
        'rupture-stage4-formation',
        'Lancer un programme de formation interne sur l’histoire du mouvement.',
        'Transmettre par les textes.',
        { confiance: 5, legitimite: 3, caisse: -3 },
        'Les jeunes adhérents lisent. Ils posent des questions auxquelles les anciens n’avaient pas pensé.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'rupture-stage4-rite',
        'Instaurer un rite annuel de mémoire.',
        'Ancrer par la répétition.',
        { confiance: 6, legitimite: 4, institution: 2 },
        'Le rite trouve ses formes. Il devient un rendez-vous où l’on comprend, en y allant, qu’on appartient à quelque chose.',
        { tribun: 2 }
      ),
      pipelineChoice(
        'rupture-stage4-laisser',
        'Laisser la mémoire vivre par bouche à oreille.',
        'Refuser la fixation.',
        { confiance: 2, legitimite: -2 },
        'La mémoire change de forme. Elle s’adapte. Elle se déforme, parfois utile, parfois inutilisable.',
        { rupture: 1 }
      )
    ]
  };
}

function ruptureStage5(): PipelineSceneData {
  return {
    title: 'La rupture mythifiée',
    subtitle: 'Le récit s’est figé',
    mood: 'grave',
    historicalContext:
      'Quand un mouvement entre dans le mythe, il devient mobilisable par tous, y compris par ceux qu’il combattait. Le moment de la mythification est un moment de bataille de récit.',
    reflechi:
      'Ton mouvement de référence est cité par des gens qui n’en partagent pas la ligne. Tu peux corriger publiquement, ou laisser le mythe vivre sans toi.',
    compulsif:
      'Un éditorial te cite. Tu lis trois fois la phrase. Elle veut dire l’inverse de ce que tu pensais avoir fait.',
    voices: [{ trait: 'tribun', text: 'Un mythe sans gardien devient une enseigne disponible.' }],
    choices: [
      pipelineChoice(
        'rupture-stage5-corriger',
        'Réécrire publiquement le sens du mouvement.',
        'Reprendre le récit.',
        { legitimite: 6, confiance: 4, rapportDeForce: 2 },
        'Le récit se redresse. Tu fais des ennemis qu’on n’attendait pas. Tu les fais consciemment.',
        { tribun: 2, batisseur: 1 }
      ),
      pipelineChoice(
        'rupture-stage5-defendre',
        'Défendre le récit dans les médias et les écoles.',
        'Investir le terrain culturel.',
        { legitimite: 5, institution: 3, caisse: -4 },
        'La défense passe par des manuels, des podcasts, des intervenants. Lente, coûteuse, durable.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'rupture-stage5-laisser',
        'Laisser le mythe vivre sa vie publique.',
        'Renoncer au contrôle.',
        { confiance: 2, legitimite: -3 },
        'Le mythe court. Il sert à des gens divers. Tu n’es plus son auteur — peut-être ne l’as-tu jamais été seul.',
        { pragmatique: 1 }
      )
    ]
  };
}

/* ----------------------- CAPTURE — STAGES 3 à 5 ----------------------- */

function captureStage3(): PipelineSceneData {
  return {
    title: 'Au sortir des urnes',
    subtitle: 'Le mandat reprend ou bascule',
    mood: 'tendu',
    historicalContext:
      'Quand une organisation a été soupçonnée de capture, l’élection interne suivante n’est plus seulement une affaire de personne : c’est un test de confiance institutionnelle.',
    reflechi:
      'Les résultats sont serrés. Ton équipe a pris la décision politique avant la décision arithmétique. Reste à choisir comment on l’assume.',
    compulsif:
      'L’écran affiche un score. Personne ne sourit. Personne ne crie non plus. Tu sais que la prochaine phrase prononcée comptera longtemps.',
    voices: [
      { trait: 'rupture', text: 'Si tu es passée d’un cheveu, tu n’as pas un mandat, tu as un sursis.' },
      { trait: 'pragmatique', text: 'Une victoire courte vaut mieux qu’une défaite. Mais elle vaut moins qu’un débat clos.' }
    ],
    choices: [
      pipelineChoice(
        'capture-stage3-rebatir',
        'Lancer une vraie démarche de réécriture interne.',
        'Reprendre les fils.',
        { confiance: 7, legitimite: 4, caisse: -4 },
        'La démarche prend du temps. Elle redonne du sens à des sigles que plus personne n’expliquait.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'capture-stage3-coalition',
        'Former une coalition interne avec l’opposition la moins dure.',
        'Diviser pour stabiliser.',
        { institution: 4, confiance: 2, rapportDeForce: -2 },
        'La coalition fonctionne. Une part de la base la trouve cynique. Une autre la trouve adulte.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'capture-stage3-democratie',
        'Démocratiser radicalement les règles internes.',
        'Refonder par les statuts.',
        { confiance: 8, legitimite: 5, institution: -3 },
        'Les statuts changent. Les permanents apprennent à vivre avec moins de pouvoir. La base apprend à voter sur ce qu’elle ignorait pouvoir trancher.',
        { batisseur: 2, rupture: 1 }
      )
    ]
  };
}

function captureStage4(): PipelineSceneData {
  return {
    title: 'L’État se recompose',
    subtitle: 'Le partenaire d’hier change de visage',
    mood: 'tendu',
    historicalContext:
      'Une organisation suspectée de capture est aussi prisonnière de la stabilité de son partenaire étatique. Un changement de gouvernement révèle la nature exacte du lien.',
    reflechi:
      'Le gouvernement change. Tes anciens interlocuteurs ne sont plus là. Tu peux faire valoir tes acquis, ou être traitée comme un héritage encombrant.',
    compulsif:
      'Un cabinet ministériel ne te répond plus. Les nouveaux noms ne sont pas des inconnus, mais ils ne te connaissent pas.',
    voices: [{ trait: 'pragmatique', text: 'Une institution qui dépend d’une équipe ministérielle est déjà fragile.' }],
    choices: [
      pipelineChoice(
        'capture-stage4-redefinir',
        'Réaffirmer publiquement l’indépendance de l’organisation.',
        'Couper l’ombre du partenariat ancien.',
        { rapportDeForce: 5, legitimite: 4, institution: -2 },
        'Le geste fait remonter d’anciennes critiques internes. Il rend aussi possible un dialogue sur de nouvelles bases.',
        { rupture: 2, tribun: 1 }
      ),
      pipelineChoice(
        'capture-stage4-passerelle',
        'Reconstruire patiemment des passerelles avec la nouvelle équipe.',
        'Préserver l’accès.',
        { institution: 4, caisse: 2, confiance: -3 },
        'L’accès tient. Le contenu de la conversation, lui, est plus pauvre qu’avant.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'capture-stage4-territoires',
        'Déplacer le centre de gravité vers les sections territoriales.',
        'Diversifier les ancrages.',
        { confiance: 6, legitimite: 3, institution: 2 },
        'Le national perd un peu d’éclat. Le terrain gagne en consistance — c’est cela qui rendra la suite respirable.',
        { batisseur: 2 }
      )
    ]
  };
}

function captureStage5(): PipelineSceneData {
  return {
    title: 'Le récit de la capture',
    subtitle: 'Ce que l’histoire retiendra',
    mood: 'melancolique',
    historicalContext:
      'Les capturés rentrent rarement dans l’histoire avec leurs propres mots. Mais s’ils ne les écrivent pas, d’autres le feront.',
    reflechi:
      'Il faut nommer ce qui s’est passé. Pas en accusation, pas en justification — en lecture.',
    compulsif:
      'Tu écris un texte. Trois fois. Chaque version dit moins de choses, plus précisément. La quatrième sera publique.',
    voices: [{ trait: 'tribun', text: 'Une lecture honnête vaut une absolution. Une absolution n’a jamais réparé personne.' }],
    choices: [
      pipelineChoice(
        'capture-stage5-lecture',
        'Publier une lecture critique du mandat.',
        'Mettre les pendules à l’heure.',
        { legitimite: 6, confiance: 4, institution: -2 },
        'La lecture circule. Elle ne ramène personne, mais elle évite que d’autres rejouent la même séquence en croyant innover.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'capture-stage5-justifier',
        'Défendre le bilan tel qu’il a été.',
        'Refuser la repentance.',
        { legitimite: 3, confiance: -3, institution: 2 },
        'La défense tient en interne. Elle convainc moins ceux qui n’étaient pas dans la pièce.',
        { pragmatique: 1 }
      ),
      pipelineChoice(
        'capture-stage5-passer',
        'Passer le relais sans se prononcer.',
        'Laisser à d’autres l’écriture.',
        { legitimite: -2, confiance: 1 },
        'Le relais est passé. L’écriture aussi. Elle se fera, avec ou sans toi.',
        { pragmatique: 1 }
      )
    ]
  };
}

/* --------------------- REFONDATION — STAGES 3 à 5 --------------------- */

function refondationStage3(): PipelineSceneData {
  return {
    title: 'Passer à l’échelle',
    subtitle: 'Du laboratoire au seuil critique',
    mood: 'euphorique',
    historicalContext:
      'Une refondation ne devient irréversible qu’à partir d’un seuil : assez de bénéficiaires, de ressources, de relais pour qu’on ne puisse plus la replier.',
    reflechi:
      'Les expérimentations marchent. Le passage à l’échelle exige des arbitrages que la phase laboratoire ne demandait pas : standardisation, contrôle, financement.',
    compulsif:
      'Un tableur affiche un chiffre rond. Tu te demandes lequel des principes initiaux il a fallu arrondir pour qu’il tombe juste.',
    voices: [
      { trait: 'batisseur', text: 'Sans seuil, une expérimentation reste un témoignage.' },
      { trait: 'rupture', text: 'Standardiser, c’est aussi appauvrir.' }
    ],
    choices: [
      pipelineChoice(
        'refondation-stage3-standardiser',
        'Standardiser le modèle pour le démultiplier.',
        'Industrialiser la doctrine.',
        { institution: 6, legitimite: 4, confiance: -3 },
        'Le modèle se répand. Il perd quelques nuances, gagne des bénéficiaires.',
        { batisseur: 1, technocrate: 2 }
      ),
      pipelineChoice(
        'refondation-stage3-licencier',
        'Sélectionner quelques expérimentations exemplaires.',
        'Profondeur plutôt qu’étendue.',
        { confiance: 5, legitimite: 4, institution: 2 },
        'On choisit quelques sites. On y met les moyens. Ailleurs, on laisse l’élan retomber.',
        { batisseur: 2 }
      ),
      pipelineChoice(
        'refondation-stage3-financement',
        'Négocier un financement public structurel.',
        'Solidifier les comptes.',
        { caisse: 6, institution: 5, rapportDeForce: -3 },
        'Le financement arrive. Il vient avec un cahier des charges. Tu sais lequel.',
        { pragmatique: 2 }
      )
    ]
  };
}

function refondationStage4(): PipelineSceneData {
  return {
    title: 'L’ancien régime contre-attaque',
    subtitle: 'Récupération ou marginalisation',
    mood: 'tendu',
    historicalContext:
      'Toute refondation qui réussit attire la récupération : les acteurs établis veulent intégrer la nouveauté, en garder le vocabulaire et en perdre la radicalité.',
    reflechi:
      'Les anciens reprennent ton mot. Ils en proposent une version compatible avec leurs intérêts. Tu peux les laisser faire, t’y opposer frontalement, ou imposer un test.',
    compulsif:
      'Un grand acteur classique sort un texte qui a l’air d’être le tien. À deux mots près, qui changent tout.',
    voices: [{ trait: 'rupture', text: 'On te volera ton mot. La question est si on te volera aussi tes critères.' }],
    choices: [
      pipelineChoice(
        'refondation-stage4-test',
        'Imposer un test de fidélité au modèle.',
        'Verrouiller la doctrine.',
        { legitimite: 6, institution: 4, confiance: 3, caisse: -3 },
        'Le test fait grogner. Il rend visible la distance entre la doctrine et ses usages.',
        { batisseur: 2, technocrate: 1 }
      ),
      pipelineChoice(
        'refondation-stage4-allier',
        'S’allier aux récupérateurs pour peser plus fort.',
        'Croiser les ressources.',
        { institution: 5, legitimite: 3, confiance: -4 },
        'L’alliance est utile. Elle déplace les responsabilités. Personne ne saura plus très bien à qui demander des comptes.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'refondation-stage4-rupture',
        'Rompre publiquement avec les acteurs établis.',
        'Tenir la pureté.',
        { rapportDeForce: 5, confiance: 4, institution: -3 },
        'La rupture est nette. Elle relance des militants qui s’ennuyaient. Elle ferme aussi des portes utiles.',
        { rupture: 2, tribun: 1 }
      )
    ]
  };
}

function refondationStage5(): PipelineSceneData {
  return {
    title: 'Quand la doctrine devient norme',
    subtitle: 'Le mot d’hier passe dans le décret',
    mood: 'calme',
    historicalContext:
      'Une refondation aboutie est une doctrine que les juristes finissent par citer. Elle perd alors sa nouveauté, elle gagne une force de droit.',
    reflechi:
      'Un projet de loi reprend la doctrine. Tu n’en es plus l’auteur principal — tu en deviens un témoin parmi d’autres. Comment garder la fidélité au geste fondateur ?',
    compulsif:
      'Le rapport parlementaire cite ton premier manifeste. La citation est correcte. Elle est entourée d’autres choses qui ne te ressemblent pas.',
    voices: [{ trait: 'batisseur', text: 'Une doctrine devenue droit n’a plus à se défendre. Elle a à se rappeler.' }],
    choices: [
      pipelineChoice(
        'refondation-stage5-veille',
        'Organiser une veille permanente de fidélité doctrinale.',
        'Garder le sens.',
        { institution: 5, legitimite: 4, caisse: -3 },
        'La veille devient une institution mineure mais durable : un comité, une publication, une voix.',
        { batisseur: 2 }
      ),
      pipelineChoice(
        'refondation-stage5-passage',
        'Passer la main à une nouvelle génération.',
        'Refuser la propriété.',
        { confiance: 5, legitimite: 4, institution: -2 },
        'La nouvelle génération reformule. Tu reconnais ce que tu voulais dire. Tu reconnais aussi ce que tu n’avais pas vu.',
        { batisseur: 1, tribun: 1 }
      ),
      pipelineChoice(
        'refondation-stage5-relancer',
        'Relancer un nouveau cycle de refondation.',
        'Refuser la stabilisation.',
        { rapportDeForce: 4, confiance: 3, institution: -3, caisse: -4 },
        'La nouvelle expérimentation commence. Certains te suivent. D’autres préfèrent rester dans la doctrine devenue confortable.',
        { rupture: 2, batisseur: 1 }
      )
    ]
  };
}

/* ------------------------ DÉCLIN — STAGES 3 à 5 ----------------------- */

function declinStage3(): PipelineSceneData {
  return {
    title: 'Le second souffle',
    subtitle: 'Refonder ou prolonger',
    mood: 'tendu',
    historicalContext:
      'Après une fusion ou une refonte interne, une organisation traverse une phase critique : les anciens nostalgiques et les nouveaux pragmatiques se cherchent.',
    reflechi:
      'L’organisation a survécu, mais sa nature a changé. Tu dois maintenant choisir entre raviver la vieille identité ou l’assumer comme transformée.',
    compulsif:
      'Le sigle est différent. Les murs ont gardé d’anciennes affiches. Les nouveaux militants sourient en passant devant.',
    voices: [{ trait: 'pragmatique', text: 'Vouloir tout reconstituer après la fusion, c’est préparer une seconde fusion.' }],
    choices: [
      pipelineChoice(
        'declin-stage3-raviver',
        'Faire revivre les rites et symboles d’origine.',
        'Garder le fil.',
        { confiance: 5, legitimite: 3, institution: -2 },
        'Les rites reprennent. Certains nouveaux les regardent avec patience, d’autres avec gêne.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'declin-stage3-assumer',
        'Assumer la transformation comme nouvelle identité.',
        'Tourner la page.',
        { institution: 5, legitimite: 4, confiance: -3 },
        'La transformation est nommée. Les départs qu’elle provoque sont silencieux. Les arrivées qu’elle rend possibles aussi.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'declin-stage3-mediation',
        'Organiser un congrès de réconciliation interne.',
        'Trouver une langue commune.',
        { confiance: 6, legitimite: 4, caisse: -4 },
        'Le congrès produit moins une motion qu’une atmosphère. Elle suffit, parfois, à tenir quelques années de plus.',
        { batisseur: 2, tribun: 1 }
      )
    ]
  };
}

function declinStage4(): PipelineSceneData {
  return {
    title: 'L’épreuve du recommencement',
    subtitle: 'Une crise, plus tard',
    mood: 'grave',
    historicalContext:
      'Les organisations qui ont survécu à un déclin majeur ne sont jamais à l’abri d’une seconde crise — souvent plus rapide, parce que les réflexes acquis pèsent moins.',
    reflechi:
      'Une nouvelle crise arrive. Tu la reconnais. Tu sais que ce qui a sauvé la première fois ne suffira pas la seconde.',
    compulsif:
      'Une réunion d’urgence à 22h. Tu retrouves les visages d’il y a dix ans. Ils ont vieilli. Toi aussi.',
    voices: [{ trait: 'rupture', text: 'On ne refait pas deux fois la même fusion. Elle ne sauve qu’une fois.' }],
    choices: [
      pipelineChoice(
        'declin-stage4-radical',
        'Engager une mue radicale (statuts, doctrine, périmètre).',
        'Tout remettre à plat.',
        { rapportDeForce: 5, confiance: 4, institution: -4 },
        'La mue choque. Elle ouvre aussi la possibilité d’un récit neuf, ce qui manquait depuis quelques années.',
        { rupture: 2, batisseur: 1 }
      ),
      pipelineChoice(
        'declin-stage4-gestion',
        'Gérer la crise par mesures techniques sans toucher à l’identité.',
        'Sauver le cadre.',
        { caisse: 4, institution: 3, confiance: -3 },
        'Les mesures techniques tiennent. Elles n’expliquent rien sur ce qui se passe vraiment.',
        { technocrate: 2, pragmatique: 1 }
      ),
      pipelineChoice(
        'declin-stage4-rendre',
        'Restituer ouvertement aux adhérents le pouvoir de décision finale.',
        'Faire confiance à la base.',
        { confiance: 7, legitimite: 4, institution: -2 },
        'La base décide. Sa décision n’est pas celle que tu attendais. Elle est plus radicale que prévu.',
        { batisseur: 2, tribun: 1 }
      )
    ]
  };
}

function declinStage5(): PipelineSceneData {
  return {
    title: 'Trace dans l’histoire',
    subtitle: 'Le nom passe ou s’éteint',
    mood: 'melancolique',
    historicalContext:
      'À la toute fin du cycle, une organisation laisse soit un nom transmis, soit une absence remarquée. Les deux comptent dans la mémoire ouvrière comme dans la mémoire patronale.',
    reflechi:
      'Tu as l’occasion d’organiser ta propre transmission, ou de laisser l’histoire faire son travail seule.',
    compulsif:
      'Quelqu’un te demande où sont les archives. Tu réalises que tu n’as jamais répondu à cette question depuis dix ans.',
    voices: [{ trait: 'batisseur', text: 'Une organisation peut disparaître sans s’éteindre, si elle a su nommer ce qu’elle laisse.' }],
    choices: [
      pipelineChoice(
        'declin-stage5-fondation',
        'Créer une fondation/association mémoire.',
        'Donner un corps à l’héritage.',
        { legitimite: 6, institution: 3, caisse: -5 },
        'La fondation tient le récit. Elle finance des thèses, des livres, parfois une formation. Le nom continue.',
        { batisseur: 2, tribun: 1 }
      ),
      pipelineChoice(
        'declin-stage5-fusion',
        'Confier l’héritage à une organisation alliée.',
        'Léguer plutôt que perdre.',
        { institution: 5, legitimite: 3, confiance: -2 },
        'L’héritage entre dans une autre maison. On y respecte les rites. Pendant combien de temps, c’est un autre débat.',
        { pragmatique: 2 }
      ),
      pipelineChoice(
        'declin-stage5-archives',
        'Verser les archives à une bibliothèque publique.',
        'Rendre la mémoire au commun.',
        { legitimite: 5, confiance: 3, institution: -2 },
        'Les cartons partent. Quelqu’un, dans vingt ans, en tirera quelque chose. Ou pas. C’est la nature même d’une archive.',
        { batisseur: 1 }
      )
    ]
  };
}
