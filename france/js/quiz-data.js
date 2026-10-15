/* ====================================================================================
   QUIZ « LA FRANCE : histoire, patrimoine et grandes énigmes » — CONTENU À REMPLIR
   C'est LE fichier où coller les 40 questions (le moteur n'a pas besoin d'être modifié).
   Guide complet : france/CONTENU.md   —   Vérification : npm run check:france
   Actuellement : 40 emplacements « [… à remplacer] » (structure et formats déjà prévus).
   ==================================================================================== */
(function (root) {
  var CONFIG = {
    title: 'LA FRANCE',
    subtitle: 'Histoire, patrimoine et grandes énigmes',
    tagline: 'Six histoires vraies entre mystères, légendes et patrimoine',
    venue: 'OBEO Toulouse Guillaumet',
    /* classements intermédiaires : après ces chapitres (n° de chapitre) */
    rankingAfterChapters: [3, 5],
    rankingNotes: { 3: 'Après Rennes-le-Château', 5: 'Avant le dernier chapitre' },
    /* dossier des images (relatif à france/index.html) */
    imagesDir: 'assets/images/',
    /* image de l'accueil (sinon assets/images/home.jpg, sinon décor de secours) */
    homeImage: ''
  };

  /* 6 chapitres : titre, phrase d'accroche (modifiable), nombre d'épreuves, image de fond facultative
     (sinon assets/images/ch1.jpg … ch6.jpg est essayée automatiquement). */
  var CHAPTERS = [
    { no: 1, title: 'Le masque de fer', hook: 'Entre histoire et légende : que sait-on vraiment ?', count: 6, image: '' },
    { no: 2, title: 'La Bête du Gévaudan', hook: 'Une affaire qui fascine encore : faits et rumeurs.', count: 7, image: '' },
    { no: 3, title: 'Rennes-le-Château', hook: 'Un village, une énigme : où s’arrête la légende ?', count: 7, image: '' },
    { no: 4, title: 'Les secrets de Versailles', hook: 'Au cœur d’un lieu d’exception : faits, usages et anecdotes.', count: 7, image: '' },
    { no: 5, title: 'Jeanne d’Arc', hook: 'Une destinée hors du commun : retrouvons les faits.', count: 7, image: '' },
    { no: 6, title: 'Les catacombes de Paris', hook: 'Sous nos pieds, un monde à découvrir.', count: 6, image: '' }
  ];

  /* 40 épreuves, dans l'ordre du jeu.
     type : 'qcm' | 'visual' | 'tf' | 'legend' | 'riddle' | 'reflection'
       qcm / visual / riddle / reflection : choices: [3 textes] + answer: 'A' | 'B' | 'C'
       tf      : pas de choices, answer: 'VRAI' | 'FAUX'
       legend  : pas de choices, answer: 'FAIT' | 'LÉGENDE'
     riddle : clues: ['indice 1', 'indice 2'] facultatif (affichés sous l'énigme)
     points : 1 (défaut) ou 2 (épreuves bonus — ici les 3 dernières des Catacombes)
     anecdote : carte « LE SAVIEZ-VOUS ? » (2 à 4 phrases) — laisser '' s'il n'y en a pas
     image : nom du fichier dans assets/images/ (facultatif : sinon assets/images/<id>.jpg est essayé)
     imageFit : 'cover' (défaut) ou 'contain' ; credit : légende discrète ; source : note interne (non affichée) */
  var QUESTIONS = [
    { id: 'c1q1', chapter: 1, type: 'qcm', question: '[Question n°1 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c1q2', chapter: 1, type: 'visual', question: '[Question visuelle n°2 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c1q3', chapter: 1, type: 'tf', question: '[Affirmation n°3 — à remplacer]', answer: 'VRAI', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c1q4', chapter: 1, type: 'legend', question: '[Affirmation (fait ou légende) n°4 — à remplacer]', answer: 'LÉGENDE', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c1q5', chapter: 1, type: 'qcm', question: '[Question n°5 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c1q6', chapter: 1, type: 'reflection', question: '[Question de réflexion n°6 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c2q1', chapter: 2, type: 'qcm', question: '[Question n°7 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c2q2', chapter: 2, type: 'tf', question: '[Affirmation n°8 — à remplacer]', answer: 'FAUX', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c2q3', chapter: 2, type: 'visual', question: '[Question visuelle n°9 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c2q4', chapter: 2, type: 'legend', question: '[Affirmation (fait ou légende) n°10 — à remplacer]', answer: 'LÉGENDE', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c2q5', chapter: 2, type: 'riddle', question: '[Mini-énigme n°11 — à remplacer]', clues: ['[Indice 1 — à remplacer]', '[Indice 2 — à remplacer]'], choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c2q6', chapter: 2, type: 'qcm', question: '[Question n°12 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c2q7', chapter: 2, type: 'reflection', question: '[Question de réflexion n°13 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c3q1', chapter: 3, type: 'visual', question: '[Question visuelle n°14 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c3q2', chapter: 3, type: 'qcm', question: '[Question n°15 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c3q3', chapter: 3, type: 'legend', question: '[Affirmation (fait ou légende) n°16 — à remplacer]', answer: 'LÉGENDE', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c3q4', chapter: 3, type: 'tf', question: '[Affirmation n°17 — à remplacer]', answer: 'VRAI', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c3q5', chapter: 3, type: 'riddle', question: '[Mini-énigme n°18 — à remplacer]', clues: ['[Indice 1 — à remplacer]', '[Indice 2 — à remplacer]'], choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c3q6', chapter: 3, type: 'qcm', question: '[Question n°19 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c3q7', chapter: 3, type: 'reflection', question: '[Question de réflexion n°20 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c4q1', chapter: 4, type: 'qcm', question: '[Question n°21 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c4q2', chapter: 4, type: 'visual', question: '[Question visuelle n°22 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c4q3', chapter: 4, type: 'tf', question: '[Affirmation n°23 — à remplacer]', answer: 'VRAI', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c4q4', chapter: 4, type: 'qcm', question: '[Question n°24 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c4q5', chapter: 4, type: 'legend', question: '[Affirmation (fait ou légende) n°25 — à remplacer]', answer: 'FAIT', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c4q6', chapter: 4, type: 'riddle', question: '[Mini-énigme n°26 — à remplacer]', clues: ['[Indice 1 — à remplacer]', '[Indice 2 — à remplacer]'], choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c4q7', chapter: 4, type: 'reflection', question: '[Question de réflexion n°27 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c5q1', chapter: 5, type: 'qcm', question: '[Question n°28 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c5q2', chapter: 5, type: 'tf', question: '[Affirmation n°29 — à remplacer]', answer: 'VRAI', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c5q3', chapter: 5, type: 'visual', question: '[Question visuelle n°30 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c5q4', chapter: 5, type: 'legend', question: '[Affirmation (fait ou légende) n°31 — à remplacer]', answer: 'FAIT', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c5q5', chapter: 5, type: 'qcm', question: '[Question n°32 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c5q6', chapter: 5, type: 'riddle', question: '[Mini-énigme n°33 — à remplacer]', clues: ['[Indice 1 — à remplacer]', '[Indice 2 — à remplacer]'], choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c5q7', chapter: 5, type: 'reflection', question: '[Question de réflexion n°34 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c6q1', chapter: 6, type: 'visual', question: '[Question visuelle n°35 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'B', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c6q2', chapter: 6, type: 'qcm', question: '[Question n°36 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c6q3', chapter: 6, type: 'tf', question: '[Affirmation n°37 — à remplacer]', answer: 'VRAI', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 1, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c6q4', chapter: 6, type: 'legend', question: '[Affirmation (fait ou légende) n°38 — à remplacer]', answer: 'LÉGENDE', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 2, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c6q5', chapter: 6, type: 'riddle', question: '[Mini-énigme n°39 — à remplacer]', clues: ['[Indice 1 — à remplacer]', '[Indice 2 — à remplacer]'], choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'A', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '[Anecdote « Le saviez-vous ? » — 2 à 4 phrases — à remplacer]', points: 2, image: '', imageFit: '', credit: '', source: '' },
    { id: 'c6q6', chapter: 6, type: 'reflection', question: '[Question de réflexion n°40 — à remplacer]', choices: ['[Choix A — à remplacer]', '[Choix B — à remplacer]', '[Choix C — à remplacer]'], answer: 'C', explanation: '[Explication — 1 à 3 phrases — à remplacer]', anecdote: '', points: 2, image: '', imageFit: '', credit: '', source: '' }
  ];

  var api = { CONFIG: CONFIG, CHAPTERS: CHAPTERS, QUESTIONS: QUESTIONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FranceData = api;
})(typeof window !== 'undefined' ? window : globalThis);
