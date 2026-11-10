// Banque de dossiers : "Juste une perf ?"
// Chaque dossier est fictif. Contenu à relire par l'EOH et le référent antibiotiques avant usage institutionnel.

const SOURCES = {
  sf2h: {
    label: "SF2H 2019, Prévention des infections liées aux cathéters périphériques vasculaires et sous-cutanés (R13, R14, R17)",
    url: "https://www.sf2h.net/k-stock/data/uploads/2019/05/HY_XXVII_SF2H_CATHETERS-2019.pdf"
  },
  has: {
    label: "HAS, Pose et entretien des cathéters veineux périphériques (critères de qualité)",
    url: "https://www.has-sante.fr/jcms/c_1525658/fr/pose-et-entretien-des-catheters-veineux-peripheriques"
  },
  ivos: {
    label: "UKHSA, critères nationaux de relais IV vers oral (IVOS) chez l'adulte",
    url: "https://www.gov.uk/government/publications/antimicrobial-intravenous-to-oral-switch-criteria-for-early-switch/national-antimicrobial-intravenous-to-oral-switch-ivos-criteria-for-early-switch"
  },
  spares: {
    label: "RePIA / SPARES, fiche pratique Voie injectable ou per os des anti-infectieux (2025)",
    url: "https://www.chu-caen.fr/wp-content/uploads/2026/05/ATB-voie-inj-ou-per-os-2025_07_04.pdf"
  },
  biodispo: {
    label: "ARS Occitanie, Antibiothérapie injectable : relais per os et biodisponibilité",
    url: "https://www.occitanie.ars.sante.fr/system/files/2019-09/Antibioth%C3%A9rapie%20injectable.pdf"
  },
  pilly: {
    label: "Pilly étudiant (SPILF), Prescription et surveillance des anti-infectieux",
    url: "https://www.infectiologie.com/UserFiles/File/pilly-etudiant/ecn-2020-177-web.pdf"
  },
  ansm: {
    label: "ANSM, Mise au point sur le bon usage des aminosides injectables",
    url: "https://ansm.sante.fr/uploads/2021/02/04/map-aminosides.pdf"
  },
  oviva: {
    label: "Li et al., essai OVIVA, N Engl J Med 2019",
    url: "https://pubmed.ncbi.nlm.nih.gov/30699315/"
  },
  poet: {
    label: "Iversen et al., essai POET, N Engl J Med 2019",
    url: "https://pubmed.ncbi.nlm.nih.gov/30152252/"
  }
};

// Grille de relais (inspirée des critères IVOS et de la fiche SPARES).
// Pour chaque critère, le joueur répond Oui ou Non.
const CRITERES = [
  { id: "apyrexie", label: "Température entre 36 et 38 °C depuis 24 h, hémodynamique stable" },
  { id: "amelioration", label: "Signes cliniques et marqueurs (score d'alerte, CRP, leucocytes) en amélioration" },
  { id: "digestif", label: "Voie digestive utilisable : déglutition sûre, pas de vomissement depuis 24 h, pas de malabsorption" },
  { id: "molecule", label: "Une molécule orale adaptée existe (spectre, biodisponibilité, interactions, allergies)" },
  { id: "special", label: "Situation à considération particulière (bactériémie, endocardite, méningite, infection ostéo-articulaire, abcès non drainé…)" }
];

const VOIES = {
  po: "Relais per os",
  iv: "Poursuivre IV",
  sc: "Voie sous-cutanée",
  stop: "Arrêter"
};

const KT_OPTIONS = {
  maintenir: "Maintenir le cathéter",
  retirer: "Retirer le cathéter",
  reposer: "Retirer et reposer sur un autre site",
  dispositif: "Discuter un dispositif adapté (midline, PICC, sous-cutané)"
};

const CASES = [
  {
    id: "garde-veine",
    titre: "Le garde-veine",
    chambre: "12",
    niveau: "Essentiel",
    patient: "Mme L., 84 ans",
    motif: "Chute de sa hauteur, bilan étiologique. Pas d'infection.",
    jour: "J3",
    constantes: { T: "36,8", FC: "76", PAS: "134", FR: "16", SpO2: "97 %" },
    bio: "Ionogramme normal, pas de syndrome inflammatoire.",
    digestif: "Mange seule, boit environ 1,5 L/j.",
    microbio: "Aucun prélèvement en cours.",
    kt: { type: "CVP 20 G", site: "Pli du coude droit", pose: "J0, aux urgences", etat: "Obturé, point de ponction propre. Aucune injection depuis la pose." },
    ivos: null,
    lignes: [
      {
        label: "Aucune perfusion prescrite, cathéter laissé « au cas où »",
        options: ["iv", "stop"],
        correct: ["stop"],
        risk: [],
        feedback: "Un cathéter « au cas où » n'est pas une indication. Sans traitement IV, ce cathéter dormant n'apporte que du risque."
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: [],
      risk: [],
      joursEvites: 3,
      feedback: "Retrait immédiat. Tout cathéter périphérique doit être retiré dès qu'il n'est plus indiqué, avec une réévaluation au minimum quotidienne (SF2H 2019, R13, grade A-2)."
    },
    message: "Pas de cathéter, pas d'infection liée au cathéter. Un cathéter dormant se repère, se trace et se retire.",
    sources: ["sf2h", "has"]
  },
  {
    id: "pna-mieux",
    titre: "La pyélonéphrite qui va mieux",
    chambre: "7",
    niveau: "Essentiel",
    patient: "Mme M., 71 ans",
    motif: "Pyélonéphrite aiguë simple à E. coli.",
    jour: "J3",
    constantes: { T: "37,1 (apyrétique depuis 48 h)", FC: "82", PAS: "128", FR: "16", SpO2: "98 %" },
    bio: "CRP 180 puis 62 mg/L. Leucocytes normalisés.",
    digestif: "Mange normalement, aucun vomissement, boit bien.",
    microbio: "ECBU : E. coli sensible à l'amoxicilline, au cotrimoxazole et aux fluoroquinolones.",
    kt: { type: "CVP 20 G", site: "Avant-bras gauche", pose: "J1", etat: "Point de ponction propre, pansement occlusif." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: true, special: false },
    lignes: [
      {
        label: "Ceftriaxone 1 g/24 h IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        risk: ["stop"],
        feedback: "Tous les critères sont réunis : relais oral guidé par l'antibiogramme, en visant le spectre le plus étroit.",
        molecule: {
          question: "Quelle molécule de relais privilégier ?",
          options: ["Amoxicilline per os", "Céfixime per os", "Lévofloxacine per os"],
          correct: 0,
          feedback: "La souche est sensible à l'amoxicilline : c'est le relais de spectre le plus étroit. Les fluoroquinolones restent une alternative si besoin, mais exercent une pression de sélection plus forte."
        }
      },
      {
        label: "Paracétamol 1 g x 4/j IV",
        options: ["po", "iv", "stop"],
        correct: ["po", "stop"],
        risk: [],
        feedback: "Le paracétamol a une excellente biodisponibilité orale. La voie IV n'apporte rien chez une patiente qui avale."
      },
      {
        label: "NaCl 0,9 % 1 L/24 h",
        options: ["iv", "stop"],
        correct: ["stop"],
        risk: [],
        feedback: "Elle boit 1,5 L/j : l'hydratation IV n'a plus d'indication."
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: [],
      risk: [],
      joursEvites: 4,
      feedback: "Plus aucune ligne IV : le cathéter n'a plus d'indication et doit être retiré le jour même."
    },
    message: "Le relais per os n'est pas une fin en soi : c'est souvent la clé qui permet de retirer le cathéter.",
    sources: ["ivos", "spares", "sf2h"]
  },
  {
    id: "pac-pas-encore",
    titre: "Pas encore",
    chambre: "3",
    niveau: "Essentiel",
    patient: "M. R., 67 ans",
    motif: "Pneumonie aiguë communautaire, sans critère de gravité initial.",
    jour: "J2",
    constantes: { T: "38,4 cette nuit", FC: "98", PAS: "118", FR: "22", SpO2: "93 % sous 2 L/min" },
    bio: "CRP 210 puis 190 mg/L. Score d'alerte stable (6 puis 5).",
    digestif: "Mange peu, pas de vomissement, avale sans difficulté.",
    microbio: "Antigénuries négatives, hémocultures stériles à 48 h.",
    kt: { type: "CVP 20 G", site: "Avant-bras droit", pose: "J0", etat: "Point de ponction propre." },
    ivos: { apyrexie: false, amelioration: false, digestif: true, molecule: true, special: false },
    lignes: [
      {
        label: "Amoxicilline-acide clavulanique 1 g x 3/j IV",
        options: ["po", "iv", "stop"],
        correct: ["iv"],
        risk: ["stop"],
        feedback: "Fièvre il y a moins de 24 h et amélioration encore incertaine : les critères de relais ne sont pas réunis. On poursuit l'IV et on réévalue dans 24 h, en le traçant."
      },
      {
        label: "Paracétamol 1 g si fièvre, IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        risk: [],
        feedback: "Même si l'antibiotique reste IV, les autres traitements peuvent passer per os chez un patient qui avale."
      }
    ],
    ktDecision: {
      correct: ["maintenir"],
      acceptable: [],
      risk: [],
      joursEvites: 0,
      feedback: "Le cathéter reste justifié aujourd'hui. Sa pertinence sera réévaluée demain, avec la même grille."
    },
    message: "Dire « pas encore » est une vraie décision, à condition de la tracer et de reprendre la grille chaque jour.",
    sources: ["ivos", "pilly", "sf2h"]
  },
  {
    id: "cordon-rouge",
    titre: "Le cordon rouge",
    chambre: "9",
    niveau: "Essentiel",
    patient: "M. G., 58 ans",
    motif: "Érysipèle de jambe droite.",
    jour: "J3",
    constantes: { T: "37,0 (apyrétique depuis 36 h)", FC: "80", PAS: "136", FR: "15", SpO2: "98 %" },
    bio: "CRP en baisse.",
    digestif: "Mange normalement.",
    microbio: "Pas de prélèvement contributif.",
    kt: { type: "CVP 18 G", site: "Avant-bras gauche", pose: "J1", etat: "Érythème de 2 cm, induration, douleur, cordon veineux palpable." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: true, special: false },
    lignes: [
      {
        label: "Amoxicilline 2 g x 3/j IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        risk: ["stop"],
        feedback: "Évolution favorable, voie digestive fonctionnelle : relais par amoxicilline per os. Dans l'érysipèle, la voie orale est d'ailleurs souvent possible d'emblée."
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: [],
      risk: ["maintenir"],
      joursEvites: 3,
      feedback: "Signes locaux de veinite : retrait sans délai (SF2H 2019, R14). Comme plus aucun traitement IV n'est nécessaire, on ne repose pas de cathéter. Tracer la complication."
    },
    message: "Devant une complication locale, se demander d'abord si un nouveau cathéter est vraiment nécessaire.",
    sources: ["sf2h", "spares"]
  },
  {
    id: "sams",
    titre: "Le staphylocoque doré",
    chambre: "15",
    niveau: "Avancé",
    patient: "Mme P., 62 ans",
    motif: "Bactériémie à S. aureus sensible à la méticilline, porte d'entrée sur un CVP (retiré à J1).",
    jour: "J3",
    constantes: { T: "37,2 (apyrétique depuis 24 h)", FC: "84", PAS: "122", FR: "17", SpO2: "97 %" },
    bio: "CRP en baisse.",
    digestif: "Mange bien.",
    microbio: "Hémocultures de contrôle prélevées à J3, en cours. Échocardiographie programmée.",
    kt: { type: "CVP 20 G", site: "Avant-bras droit", pose: "J1 (nouveau site)", etat: "Point de ponction propre." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: true, special: true },
    lignes: [
      {
        label: "Céfazoline IV",
        options: ["po", "iv", "stop"],
        correct: ["iv"],
        risk: ["po", "stop"],
        feedback: "Bactériémie à S. aureus : pas de relais oral à J3. Un relais n'est discutable qu'à partir du 7e jour, si la bactériémie est non compliquée, et uniquement sur avis du référent en antibiothérapie (fiche SPARES)."
      }
    ],
    ktDecision: {
      correct: ["maintenir", "dispositif"],
      acceptable: [],
      risk: ["retirer"],
      joursEvites: 0,
      feedback: "Le cathéter est indispensable. Anticiper la durée de traitement IV et discuter avec l'équipe un dispositif adapté est pertinent, en plus de la surveillance quotidienne du site."
    },
    message: "Tous les critères cliniques peuvent être verts : une situation particulière suffit à bloquer le relais précoce.",
    sources: ["spares", "ivos", "sf2h"]
  },
  {
    id: "meningite",
    titre: "Il veut rentrer chez lui",
    chambre: "4",
    niveau: "Avancé",
    patient: "M. L., 45 ans",
    motif: "Méningite à pneumocoque.",
    jour: "J5",
    constantes: { T: "36,9", FC: "72", PAS: "128", FR: "14", SpO2: "99 %" },
    bio: "CRP normalisée.",
    digestif: "Mange normalement. Demande un traitement en comprimés pour sortir.",
    microbio: "Pneumocoque sensible.",
    kt: { type: "CVP 20 G", site: "Avant-bras gauche", pose: "J3 (changement sur signes locaux)", etat: "Point de ponction propre." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: false, special: true },
    lignes: [
      {
        label: "Ceftriaxone à dose méningée IV",
        options: ["po", "iv", "stop"],
        correct: ["iv"],
        risk: ["po", "stop"],
        feedback: "Méningite à pneumocoque, méningocoque ou Listeria : jamais de traitement oral (fiche SPARES). Les concentrations nécessaires dans le LCR ne sont pas atteignables per os."
      }
    ],
    ktDecision: {
      correct: ["maintenir"],
      acceptable: ["dispositif"],
      risk: ["retirer"],
      joursEvites: 0,
      feedback: "Le cathéter reste indispensable jusqu'à la fin du traitement IV, avec surveillance quotidienne du site."
    },
    message: "Un patient qui va bien n'est pas forcément un patient éligible au relais : le site de l'infection compte.",
    sources: ["spares", "pilly"]
  },
  {
    id: "vomissements",
    titre: "Trois vomissements",
    chambre: "11",
    niveau: "Essentiel",
    patient: "Mme R., 39 ans",
    motif: "Pyélonéphrite aiguë simple.",
    jour: "J2",
    constantes: { T: "37,6 (apyrétique depuis 24 h)", FC: "92", PAS: "112", FR: "16", SpO2: "98 %" },
    bio: "CRP en baisse.",
    digestif: "Trois vomissements dans les dernières 24 h, ne garde pas les liquides.",
    microbio: "ECBU en cours d'identification.",
    kt: { type: "CVP 20 G", site: "Avant-bras droit", pose: "J0", etat: "Point de ponction propre." },
    ivos: { apyrexie: true, amelioration: true, digestif: false, molecule: true, special: false },
    lignes: [
      {
        label: "Ceftriaxone 1 g/24 h IV",
        options: ["po", "iv", "stop"],
        correct: ["iv"],
        risk: ["po"],
        feedback: "Vomissements dans les dernières 24 h : l'absorption orale n'est pas garantie. Poursuite IV, réévaluation demain."
      },
      {
        label: "Glucosé-salé 1,5 L/24 h",
        options: ["iv", "stop"],
        correct: ["iv"],
        risk: ["stop"],
        feedback: "Elle ne garde pas les liquides : l'hydratation IV reste indiquée aujourd'hui."
      }
    ],
    ktDecision: {
      correct: ["maintenir"],
      acceptable: [],
      risk: [],
      joursEvites: 0,
      feedback: "Indication actuelle claire. La réévaluation de demain portera d'abord sur la tolérance digestive."
    },
    message: "Le critère digestif est souvent celui qui bascule en 24 h : la réévaluation doit être quotidienne.",
    sources: ["ivos", "spares"]
  },
  {
    id: "iu-homme",
    titre: "L'infection urinaire masculine",
    chambre: "6",
    niveau: "Essentiel",
    patient: "M. F., 69 ans",
    motif: "Infection urinaire fébrile masculine.",
    jour: "J3",
    constantes: { T: "36,9 (apyrétique depuis 48 h)", FC: "78", PAS: "138", FR: "15", SpO2: "97 %" },
    bio: "CRP en nette baisse. Hémocultures négatives.",
    digestif: "Mange normalement.",
    microbio: "ECBU : E. coli résistant à l'amoxicilline, sensible à l'ofloxacine et au cotrimoxazole.",
    kt: { type: "CVP 20 G", site: "Dos de la main gauche", pose: "J1", etat: "Point de ponction propre." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: true, special: false },
    lignes: [
      {
        label: "Céfotaxime 1 g x 3/j IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        risk: ["stop"],
        feedback: "Critères réunis : relais oral selon l'antibiogramme.",
        molecule: {
          question: "Quelle molécule de relais choisir ?",
          options: ["Céfixime per os", "Ofloxacine ou cotrimoxazole per os", "Amoxicilline per os"],
          correct: 1,
          feedback: "Fluoroquinolones et cotrimoxazole ont une biodisponibilité élevée et une bonne diffusion prostatique. L'amoxicilline est exclue (souche résistante) et le céfixime diffuse mal dans la prostate."
        }
      },
      {
        label: "Ésoméprazole 40 mg/j IV « protection gastrique »",
        options: ["po", "iv", "stop"],
        correct: ["stop", "po"],
        risk: [],
        feedback: "Avant de changer de voie, vérifier l'indication : sans indication documentée, on arrête. S'il y en a une, la voie orale suffit."
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: [],
      risk: [],
      joursEvites: 5,
      feedback: "Plus de ligne IV : retrait du cathéter."
    },
    message: "Le relais per os est aussi l'occasion de réviser toute l'ordonnance IV, pas seulement l'antibiotique.",
    sources: ["spares", "biodispo", "sf2h"]
  },
  {
    id: "icc",
    titre: "Ce n'est pas qu'une affaire d'antibiotiques",
    chambre: "2",
    niveau: "Essentiel",
    patient: "Mme B., 76 ans",
    motif: "Insuffisance cardiaque décompensée. Pas d'infection.",
    jour: "J4",
    constantes: { T: "36,6", FC: "74", PAS: "124", FR: "16", SpO2: "96 % en air ambiant" },
    bio: "Kaliémie 3,6 mmol/L, créatinine stable. Poids sec atteint.",
    digestif: "Mange normalement.",
    microbio: "Aucun prélèvement.",
    kt: { type: "CVP 22 G", site: "Avant-bras droit", pose: "J0", etat: "Point de ponction propre." },
    ivos: null,
    lignes: [
      {
        label: "Furosémide 40 mg x 2/j IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        risk: ["stop"],
        feedback: "La congestion est levée : passage au diurétique oral d'entretien."
      },
      {
        label: "KCl 2 g dans la perfusion",
        options: ["po", "iv", "stop"],
        correct: ["po", "stop"],
        risk: [],
        feedback: "Supplémentation orale si besoin, selon la kaliémie et le diurétique oral."
      },
      {
        label: "Paracétamol 1 g x 3/j IV",
        options: ["po", "iv", "stop"],
        correct: ["po", "stop"],
        risk: [],
        feedback: "Aucune raison de maintenir la voie IV."
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: [],
      risk: [],
      joursEvites: 4,
      feedback: "Toutes les lignes passent per os ou s'arrêtent : retrait du cathéter."
    },
    message: "La pertinence du cathéter se juge sur l'ensemble des traitements IV, antibiotiques ou non.",
    sources: ["sf2h", "has"]
  },
  {
    id: "spondylodiscite",
    titre: "L'os n'interdit pas le per os",
    chambre: "14",
    niveau: "Avancé",
    patient: "M. C., 63 ans",
    motif: "Spondylodiscite L3-L4 à S. aureus sensible à la méticilline, documentée par ponction-biopsie.",
    jour: "J6",
    constantes: { T: "36,8", FC: "76", PAS: "130", FR: "15", SpO2: "98 %" },
    bio: "CRP en baisse régulière.",
    digestif: "Mange normalement.",
    microbio: "Hémocultures négatives. Échocardiographie sans argument pour une endocardite. Souche sensible à la lévofloxacine et à la rifampicine.",
    kt: { type: "CVP 20 G", site: "Avant-bras gauche", pose: "J4 (2e cathéter)", etat: "Point de ponction propre." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: true, special: true },
    lignes: [
      {
        label: "Céfazoline IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        acceptable: ["iv"],
        risk: ["stop"],
        feedback: "Infection ostéo-articulaire = considération particulière, pas interdiction. Sans bactériémie ni endocardite, la fiche SPARES permet de discuter le relais dès J1, sur avis du référent. L'essai OVIVA a montré la non-infériorité de l'oral dans les six premières semaines.",
        molecule: {
          question: "Quel schéma oral discuter avec le référent ?",
          options: ["Amoxicilline per os seule", "Lévofloxacine + rifampicine per os", "Vancomycine per os"],
          correct: 1,
          feedback: "Association à bonne biodisponibilité et bonne diffusion osseuse, sur souche sensible. Vérifier les interactions de la rifampicine. La vancomycine orale n'est pas absorbée."
        }
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: ["maintenir"],
      risk: [],
      joursEvites: 30,
      feedback: "Une fois le relais validé, le cathéter peut être retiré. Rester en IV ici, c'est potentiellement des semaines de cathéters successifs : dans OVIVA, les complications liées à la voie veineuse étaient de 9,4 % sous IV contre 1,0 % sous oral."
    },
    message: "Les situations particulières imposent un avis spécialisé, pas une voie IV par réflexe.",
    sources: ["spares", "oviva", "ivos"]
  },
  {
    id: "endocardite",
    titre: "Le PICC de l'endocardite",
    chambre: "16",
    niveau: "Expert",
    patient: "Mme H., 70 ans",
    motif: "Endocardite mitrale sur valve native à streptocoque oral sensible à l'amoxicilline.",
    jour: "J12",
    constantes: { T: "36,7", FC: "70", PAS: "126", FR: "14", SpO2: "98 %" },
    bio: "CRP en baisse, hémocultures de contrôle négatives.",
    digestif: "Mange normalement.",
    microbio: "Échographie transœsophagienne à J10 : pas d'abcès, pas de critère chirurgical.",
    kt: { type: "PICC", site: "Bras droit", pose: "J3", etat: "Point d'émergence propre, reflux correct." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: true, special: true },
    lignes: [
      {
        label: "Amoxicilline 2 g x 6/j IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        acceptable: ["iv"],
        risk: ["stop"],
        feedback: "Patiente stable, ETO récente sans critère chirurgical, au moins 10 jours d'IV : un relais oral partiel peut être discuté avec le référent endocardite (essai POET, fiche SPARES à partir de J10). Poursuivre l'IV reste défendable."
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: ["maintenir"],
      risk: [],
      joursEvites: 20,
      feedback: "Si le relais est validé, le PICC n'a plus d'indication : il doit être retiré, pas gardé « pour la suite »."
    },
    message: "Même un dispositif central posé pour un traitement long se réévalue chaque jour.",
    sources: ["poet", "spares", "sf2h"]
  },
  {
    id: "vanco",
    titre: "Le piège de la vancomycine",
    chambre: "8",
    niveau: "Avancé",
    patient: "M. Le., 52 ans",
    motif: "Dermohypodermite avec abcès de cuisse à SARM, abcès drainé à J1.",
    jour: "J4",
    constantes: { T: "37,0 (apyrétique depuis 48 h)", FC: "78", PAS: "132", FR: "15", SpO2: "98 %" },
    bio: "CRP en baisse.",
    digestif: "Mange normalement.",
    microbio: "SARM sensible au cotrimoxazole, à la doxycycline, à la clindamycine et au linézolide.",
    kt: { type: "CVP 20 G", site: "Avant-bras droit", pose: "J2", etat: "Point de ponction propre." },
    ivos: { apyrexie: true, amelioration: true, digestif: true, molecule: true, special: false },
    lignes: [
      {
        label: "Vancomycine IV",
        options: ["po", "iv", "stop"],
        correct: ["po"],
        risk: ["stop"],
        feedback: "Abcès drainé, évolution favorable : relais oral possible, avec une autre molécule que la vancomycine.",
        molecule: {
          question: "Quelle molécule de relais ?",
          options: ["Vancomycine per os", "Cotrimoxazole per os", "Amoxicilline-acide clavulanique per os"],
          correct: 1,
          feedback: "La vancomycine n'est pas absorbée par voie orale : elle ne traite que les infections intestinales à C. difficile. L'amoxicilline-acide clavulanique est inactive sur le SARM. Le cotrimoxazole a une biodisponibilité d'environ 90 % et la souche est sensible."
        }
      }
    ],
    ktDecision: {
      correct: ["retirer"],
      acceptable: [],
      risk: [],
      joursEvites: 5,
      feedback: "Après le relais, plus de ligne IV : retrait."
    },
    message: "Relais per os ne veut pas dire « même molécule en comprimé » : la biodisponibilité décide.",
    sources: ["biodispo", "pilly", "ivos"]
  },
  {
    id: "palliatif",
    titre: "Quatrième cathéter en trois jours",
    chambre: "1",
    niveau: "Avancé",
    patient: "Mme Mo., 91 ans",
    motif: "Soins palliatifs, déshydratation modérée, ne boit plus suffisamment.",
    jour: "J3",
    constantes: { T: "36,9", FC: "88", PAS: "108", FR: "18", SpO2: "95 %" },
    bio: "Pas de bilan prévu, selon le projet de soins.",
    digestif: "Déglutition difficile, boit très peu.",
    microbio: "Aucun prélèvement.",
    kt: { type: "CVP 22 G", site: "Dos de la main", pose: "Ce matin (4e pose en 3 jours)", etat: "Capital veineux épuisé, extravasations répétées." },
    ivos: null,
    lignes: [
      {
        label: "NaCl 0,9 % 500 à 1 000 mL/24 h",
        options: ["iv", "sc", "stop"],
        correct: ["sc"],
        acceptable: ["stop"],
        risk: [],
        feedback: "L'hypodermoclyse permet une hydratation modérée sans abord veineux. L'arrêt peut se discuter selon le projet de soins, avec la patiente et ses proches."
      },
      {
        label: "Morphine IV continue",
        options: ["iv", "sc", "po"],
        correct: ["sc"],
        acceptable: [],
        risk: [],
        feedback: "La voie sous-cutanée est adaptée et confortable ; la voie orale n'est pas fiable ici (déglutition difficile)."
      }
    ],
    ktDecision: {
      correct: ["dispositif"],
      acceptable: ["retirer"],
      risk: ["reposer"],
      joursEvites: 3,
      feedback: "Plutôt qu'un 5e cathéter veineux, un cathéter sous-cutané (couvert par les recommandations SF2H 2019) répond aux besoins et au projet de soins."
    },
    message: "Quand la voie veineuse devient une contrainte, d'autres voies existent : sous-cutanée, orale, ou aucune.",
    sources: ["sf2h"]
  },
  {
    id: "aminoside",
    titre: "La gentamicine oubliée",
    chambre: "10",
    niveau: "Avancé",
    patient: "M. Gi., 74 ans",
    motif: "Sepsis à point de départ urinaire.",
    jour: "J3",
    constantes: { T: "38,1 hier à 22 h", FC: "94", PAS: "116", FR: "19", SpO2: "96 %" },
    bio: "CRP en baisse, créatinine stable. Lactates normalisés.",
    digestif: "Mange un peu, pas de vomissement.",
    microbio: "E. coli sensible au céfotaxime et à la gentamicine. Antibiogramme rendu hier.",
    kt: { type: "CVP 20 G", site: "Avant-bras gauche", pose: "J0", etat: "Point de ponction propre." },
    ivos: { apyrexie: false, amelioration: true, digestif: true, molecule: true, special: true },
    lignes: [
      {
        label: "Céfotaxime 2 g x 3/j IV",
        options: ["po", "iv", "stop"],
        correct: ["iv"],
        risk: ["stop"],
        feedback: "Fièvre il y a moins de 24 h dans un tableau de sepsis : on poursuit l'IV et on réévalue demain."
      },
      {
        label: "Gentamicine 1 injection/j IV, 3e dose",
        options: ["po", "iv", "stop"],
        correct: ["stop"],
        risk: ["po"],
        feedback: "Antibiogramme rendu, évolution favorable : l'aminoside s'arrête, le plus souvent après 48 à 72 h et au maximum 5 jours (ANSM). Les aminosides n'ont pas de forme orale absorbée, le « relais per os » n'a pas de sens ici."
      }
    ],
    ktDecision: {
      correct: ["maintenir"],
      acceptable: [],
      risk: ["retirer"],
      joursEvites: 0,
      feedback: "La bêtalactamine IV reste nécessaire aujourd'hui : cathéter justifié, réévalué demain."
    },
    message: "Réévaluer, c'est aussi arrêter : chaque molécule IV a sa propre date de fin.",
    sources: ["ansm", "pilly", "ivos"]
  }
];
