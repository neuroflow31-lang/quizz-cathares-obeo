/* ====================================================================================
   « LES JEUX DE VOTRE ENFANCE » — CONTENU (le seul fichier à modifier pour le contenu)
   4 manches × 5 défis · 3 propositions A/B/C · bonne réponse = 5 points
   Images : assets/images/q01.jpg … q20.jpg (16:9). Absente → décor OBEO provisoire.
   situation : texte affiché avant la question (facultatif) · relance : « Et vous ? » après la révélation (facultatif)
   dominoes : petite chaîne de dominos dessinée sous la question (facultatif)
   ==================================================================================== */
(function (root) {
  var CONFIG = {
    title: 'LES JEUX DE VOTRE ENFANCE',
    subtitle: '20 défis de cour d’école et de jeux de table',
    tagline: '4 manches · 100 points possibles · 1 seule équipe',
    venue: 'OBEO Toulouse Guillaumet',
    imagesDir: 'assets/images/',
    thanks: 'Merci pour tous vos souvenirs.'
  };

  var MANCHES = [
    { no: 1, title: 'Les vrais souvenirs de cour d’école' },
    { no: 2, title: 'Les règles qu’on oublie' },
    { no: 3, title: 'Autour de la table' },
    { no: 4, title: 'Les experts des jeux d’autrefois', finale: true }
  ];

  var DEFIS = [
    // ---------------- MANCHE 1 — LES VRAIS SOUVENIRS DE COUR D’ÉCOLE ----------------
    { manche: 1, title: 'Les osselets : le Père',
      question: 'Dans une partie classique d’osselets, à quoi servait généralement celui que l’on appelait « le Père » ?',
      choices: ['À compter les points', 'À être lancé en l’air pendant qu’on ramassait les autres', 'À désigner le premier joueur'], answer: 'B',
      explain: 'Le joueur lançait le Père en l’air, ramassait un ou plusieurs osselets posés au sol puis devait rattraper le Père avant sa chute.',
      relance: 'Et vous, appeliez-vous aussi cet osselet « le Père » ?' },
    { manche: 1, title: 'Les osselets : la retournette',
      question: 'Lors de la figure appelée « la retournette », où essayait-on de récupérer les osselets ?',
      choices: ['Sur le dos de la main', 'Dans le creux du coude', 'Entre deux doigts'], answer: 'A',
      explain: 'On lançait les osselets puis on essayait d’en recevoir plusieurs sur le dos de la main avant de poursuivre la figure.' },
    { manche: 1, title: 'Les billes',
      question: 'Quel mot pouvait désigner une bille nettement plus grosse qu’une bille ordinaire ?',
      choices: ['Calot', 'Ficelle', 'Bourdon'], answer: 'A',
      explain: '« Calot » était l’un des noms employés pour de grosses billes. Les appellations variaient beaucoup d’une région et d’une cour d’école à l’autre.',
      relance: 'Et chez vous : calot, boulard ou un autre nom ?' },
    { manche: 1, title: 'La marelle',
      question: 'Que devait-on généralement faire de la case dans laquelle était tombé le palet ?',
      choices: ['Y rester sur les deux pieds', 'La franchir sans poser le pied dedans', 'Recommencer immédiatement depuis le début'], answer: 'B',
      explain: 'Le palet indiquait une case qu’il fallait éviter pendant la progression.',
      relance: 'Votre palet était une pierre, un morceau de tuile ou autre chose ?' },
    { manche: 1, title: 'La corde à sauter',
      question: 'Dans une version collective classique avec une grande corde, combien de personnes la faisaient tourner pendant qu’une autre sautait ?',
      choices: ['Une', 'Deux', 'Trois'], answer: 'B',
      explain: 'Une personne se plaçait généralement à chaque extrémité pendant qu’un autre joueur sautait.',
      relance: 'Vous chantiez une comptine en sautant ?' },
    // ---------------- MANCHE 2 — LES RÈGLES QU’ON OUBLIE ----------------
    { manche: 2, title: 'Les quatre coins',
      situation: 'Quatre joueurs occupent chacun un coin. Un cinquième joueur reste au milieu.',
      question: 'Lorsque deux joueurs échangent leur coin, que doit essayer de faire celui du milieu ?',
      choices: ['Toucher les deux joueurs', 'Prendre l’un des coins devenu momentanément libre', 'Sortir du terrain'], answer: 'B',
      explain: 'Le joueur du milieu profite des changements de place pour essayer de s’emparer d’un coin.' },
    { manche: 2, title: 'La chandelle / le jeu du mouchoir',
      question: 'Lorsqu’un joueur découvrait le mouchoir déposé derrière lui, que devait-il généralement faire ?',
      choices: ['Poursuivre celui qui l’avait déposé', 'Le cacher derrière un autre joueur', 'Quitter immédiatement la ronde'], answer: 'A',
      explain: 'Il se levait et tentait de rattraper le joueur ayant déposé le mouchoir.',
      relance: 'Vous l’appeliez « chandelle », « jeu du mouchoir » ou autrement ?' },
    { manche: 2, title: 'Chat perché',
      question: 'Dans le principe classique du chat perché, qu’est-ce qui permettait d’être momentanément protégé du chat ?',
      choices: ['Croiser les bras', 'Être installé sur un endroit surélevé', 'Toucher le mur de la cour'], answer: 'B',
      explain: 'Il fallait réussir à se « percher » avant que le chat ne vous touche.',
      relance: 'Sur quoi aviez-vous le droit de vous percher ?' },
    { manche: 2, title: 'Colin-maillard',
      question: 'Dans certaines variantes de colin-maillard, après avoir attrapé quelqu’un, que devait encore réussir à faire le joueur aux yeux bandés ?',
      choices: ['Reconnaître la personne attrapée', 'Retirer immédiatement son bandeau', 'Lui faire faire le tour du cercle'], answer: 'A',
      explain: 'Certaines règles demandaient de reconnaître la personne capturée avant de gagner réellement.' },
    { manche: 2, title: 'Saute-mouton',
      question: 'Pourquoi le joueur servant de « mouton » se penchait-il fortement vers l’avant ?',
      choices: ['Pour ne pas voir les autres arriver', 'Pour permettre aux autres joueurs de prendre appui et de le franchir', 'Pour récupérer un objet au sol'], answer: 'B',
      explain: 'Le joueur constituait un obstacle que les autres franchissaient en prenant appui avec les mains.' },
    // ---------------- MANCHE 3 — AUTOUR DE LA TABLE ----------------
    { manche: 3, title: 'Le jeu de l’oie : le puits',
      question: 'Dans le jeu de l’oie traditionnel à 63 cases, quel obstacle se trouve classiquement à la case 31 ?',
      choices: ['Le puits', 'La prison', 'La mort'], answer: 'A',
      explain: 'Dans le plateau traditionnel : le puits à la case 31, le labyrinthe à la 42, la prison à la 52 et la mort à la 58.' },
    { manche: 3, title: 'Le jeu de l’oie : la plus lointaine',
      question: 'Parmi ces trois cases célèbres, laquelle se trouve la plus loin dans le parcours traditionnel ?',
      choices: ['Le puits', 'La prison', 'La mort'], answer: 'C',
      explain: 'La mort se situe traditionnellement à la case 58.' },
    { manche: 3, title: 'Le jeu de l’oie : le plateau',
      question: 'Combien de cases comporte traditionnellement un jeu de l’oie classique ?',
      choices: ['52', '63', '75'], answer: 'B',
      explain: 'Le parcours traditionnel comporte 63 cases disposées en spirale.' },
    { manche: 3, title: 'Les dominos',
      dominoes: [[6, 2], [2, 4], [4, null]],
      question: 'Laquelle de ces pièces peut continuer correctement la chaîne ?',
      choices: ['3 | 5', '4 | 1', '6 | 6'], answer: 'B',
      explain: 'Une extrémité portant 4 doit rejoindre le 4 actuellement libre.' },
    { manche: 3, title: 'Les sept familles',
      question: 'Quelle formulation correspond à la manière traditionnelle de demander une carte ?',
      choices: ['« Donne-moi le père. »', '« Dans la famille Martin, je demande le père. »', '« Je voudrais une carte de famille. »'], answer: 'B',
      explain: 'Il fallait normalement préciser la famille et le membre recherché.',
      relance: 'Vous souvenez-vous des familles présentes dans votre jeu ?' },
    // ---------------- MANCHE 4 — GRANDE FINALE : LES EXPERTS DES JEUX D’AUTREFOIS ----------------
    { manche: 4, title: 'Osselets : « faire les deux »',
      question: 'Quand on devait « faire les deux », combien d’osselets fallait-il ramasser ensemble pendant que le Père était en l’air ?',
      choices: ['Un', 'Deux', 'Quatre'], answer: 'B',
      explain: 'On ramassait deux osselets ensemble, puis les deux restants lors d’un autre lancer.' },
    { manche: 4, title: 'Osselets : bosse et creux',
      question: 'Pourquoi certaines anciennes règles parlaient-elles de « bosse » et de « creux » ?',
      choices: ['À cause des différentes faces naturelles de l’osselet', 'À cause des trous présents dans le terrain', 'À cause d’un système de points'], answer: 'A',
      explain: 'La forme naturelle de l’osselet présente différentes faces, notamment une face creuse et une face bombée.' },
    { manche: 4, title: 'Un jeu plus ancien qu’on ne le croit',
      question: 'Lequel de ces jeux est déjà représenté dans des collections françaises du XIXe siècle ?',
      choices: ['La balle au mur', 'Twister', 'Puissance 4'], answer: 'A',
      explain: 'Les jeux de balle contre un mur apparaissent dans des représentations de jeux d’enfants bien antérieures au XXe siècle.' },
    { manche: 4, title: 'Les jeux de récréation',
      question: 'Quel groupe correspond réellement à des jeux très présents dans les cours d’école d’autrefois ?',
      choices: ['Marelle, cerceau, corde, billes et osselets', 'Monopoly, Cluedo, Uno, Risk et Scrabble', 'Flipper, bowling, golf, baby-foot et tennis'], answer: 'A',
      explain: 'Ces jeux nécessitaient souvent très peu de matériel et étaient particulièrement adaptés aux cours et aux rues.' },
    { manche: 4, title: 'Finale : avec presque rien',
      question: 'Lequel de ces jeux pouvait se préparer avec simplement un tracé au sol et un petit objet plat ?',
      choices: ['La marelle', 'Le bilboquet', 'Le diabolo'], answer: 'A',
      explain: 'Une craie, un morceau de tuile ou un galet pouvaient suffire à créer une partie.',
      relance: 'Quel jeu fabriquiez-vous vous-mêmes quand vous étiez enfants ?' }
  ];

  var api = { CONFIG: CONFIG, MANCHES: MANCHES, DEFIS: DEFIS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EnfanceData = api;
})(typeof window !== 'undefined' ? window : globalThis);
