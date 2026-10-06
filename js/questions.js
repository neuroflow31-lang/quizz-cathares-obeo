/* Questions du quiz « Les Cathares en Occitanie ».
   - choices[0] est TOUJOURS la bonne réponse dans ce fichier source.
   - L'ordre d'affichage est ensuite fixé par `place` (position A=0, B=1, C=2 de la bonne réponse),
     pour que la bonne réponse ne soit pas toujours « A ».
   - keepOrder:true => on garde l'ordre écrit (utile pour les dates).
   - Pour revenir à « bonne réponse toujours en A » : mettre USE_ORIGINAL_ORDER = true.
   - photo : nom d'une clé de PHOTOS (voir plus bas). */
(function (root) {
  var USE_ORIGINAL_ORDER = false;

  var PHOTOS = {
    montsegur:   { src: 'assets/photos/montsegur.jpg',        label: 'Montségur',           sub: 'Ariège' },
    carcassonne: { src: 'assets/photos/carcassonne.jpg',      label: 'Carcassonne',         sub: 'Aude' },
    beziers:     { src: 'assets/photos/beziers.jpg',          label: 'Béziers',             sub: 'Hérault' },
    villerouge:  { src: 'assets/photos/villerouge.jpg',       label: 'Villerouge-Termenès', sub: 'Aude' },
    paysage:     { src: 'assets/photos/paysage.jpg',          label: 'Paysages d’Occitanie', sub: 'Ariège' },
    hero:        { src: 'assets/photos/carcassonne-hero.jpg', label: 'Cité médiévale',      sub: 'Occitanie' }
  };

  var RAW = [
    { q: 'Dans quelle grande région historique le catharisme s’est-il fortement développé ?',
      choices: ['Le Languedoc', 'La Bretagne', 'La Normandie'], place: 1, photo: 'paysage',
      explanation: 'Le catharisme a particulièrement marqué le Languedoc médiéval, aujourd’hui en grande partie intégré à l’Occitanie.' },
    { q: 'Comment appelle-t-on la croisade lancée contre les hérétiques du Midi au XIIIe siècle ?',
      choices: ['La croisade des Albigeois', 'La croisade de Provence', 'La croisade des Pyrénées'], place: 2, photo: 'carcassonne',
      explanation: 'Elle est aussi appelée croisade contre les Albigeois et commence en 1209.' },
    { q: 'En quelle année débute la croisade contre les Albigeois ?',
      choices: ['1209', '1099', '1321'], keepOrder: true, orig: ['1099', '1209', '1321'], correct: '1209', photo: 'hero',
      explanation: 'La croisade débute en 1209 après l’appel du pape Innocent III.' },
    { q: 'Quelle ville est prise par les croisés en juillet 1209 avant Carcassonne ?',
      choices: ['Béziers', 'Foix', 'Albi'], place: 0, photo: 'beziers',
      explanation: 'Béziers est attaquée en juillet 1209, au tout début de la croisade.' },
    { q: 'Quel chef militaire est étroitement associé aux croisés venus du Nord ?',
      choices: ['Simon de Montfort', 'Gaston Fébus', 'Henri IV'], place: 2, photo: 'carcassonne',
      explanation: 'Simon de Montfort devient l’un des principaux chefs militaires de la croisade dans le Midi.' },
    { q: 'Raymond-Roger Trencavel était notamment vicomte de…',
      choices: ['Carcassonne et Béziers', 'Bordeaux et Bayonne', 'Nîmes et Arles'], place: 1, photo: 'beziers',
      explanation: 'Trencavel contrôlait notamment Carcassonne et Béziers au début de la croisade.' },
    { q: 'Dans quel département actuel se trouve le château de Montségur ?',
      choices: ['Ariège', 'Gers', 'Lot'], place: 0, photo: 'montsegur',
      explanation: 'Montségur se trouve en Ariège, dans les Pyrénées, en région Occitanie.' },
    { q: 'À partir de 1232, Montségur devient un lieu important pour…',
      choices: ['La haute hiérarchie cathare', 'Les rois d’Angleterre', 'Les Templiers de Paris'], place: 2, photo: 'montsegur',
      explanation: 'Le castrum de Montségur accueille à partir de 1232 la haute hiérarchie de l’Église cathare.' },
    { q: 'Quel événement dramatique est associé à Montségur en mars 1244 ?',
      choices: ['Plus de 200 cathares sont conduits au bûcher', 'Le château devient palais royal', 'Une grande foire y est créée'], place: 1, photo: 'montsegur',
      explanation: 'Après la reddition de Montségur, plus de deux cents cathares périssent sur le bûcher le 16 mars 1244.' },
    { q: 'Quel était le nom du principal sacrement reconnu par les cathares ?',
      choices: ['Le consolament', 'Le couronnement', 'La confirmation royale'], place: 0, photo: 'paysage',
      explanation: 'Le consolament était un baptême spirituel par imposition des mains.' },
    { q: 'Comment appelait-on souvent les membres religieux cathares ayant reçu le consolament ?',
      choices: ['Bons hommes et bonnes femmes', 'Mousquetaires', 'Hospitaliers'], place: 2, photo: 'villerouge',
      explanation: 'Les sources et les historiens emploient notamment les expressions « bons hommes » et « bonnes femmes ».' },
    { q: 'Quel organisme religieux est chargé de rechercher et juger les hérésies après la croisade ?',
      choices: ['L’Inquisition', 'Le Parlement de Toulouse', 'La Garde suisse'], place: 1, photo: 'carcassonne',
      explanation: 'L’Inquisition joue ensuite un rôle majeur dans la répression des croyances considérées comme hérétiques.' },
    { q: 'Pourquoi l’expression « châteaux cathares » est-elle à employer avec prudence ?',
      choices: ['Plusieurs forteresses visibles aujourd’hui ont été remaniées ou reconstruites après la croisade', 'Aucun château n’existait au Moyen Âge', 'Tous ces châteaux ont été construits au XVIIIe siècle'], place: 0, photo: 'hero',
      explanation: 'Le terme est pratique, mais de nombreuses forteresses visibles aujourd’hui ont ensuite été transformées par le pouvoir royal.' },
    { q: 'Quel dernier « parfait » cathare connu est brûlé en 1321 à Villerouge-Termenès ?',
      choices: ['Guilhem Bélibaste', 'Simon de Montfort', 'Raymond VI'], place: 2, photo: 'villerouge',
      explanation: 'Guilhem Bélibaste est traditionnellement présenté comme le dernier « parfait » cathare connu du Languedoc.' },
    { q: 'Parmi ces lieux, lequel est directement lié à l’histoire cathare en Occitanie ?',
      choices: ['Montségur', 'Versailles', 'Chambord'], place: 0, photo: 'montsegur',
      explanation: 'Montségur est l’un des lieux les plus emblématiques de la mémoire cathare en Occitanie.' }
  ];

  var LETTERS = ['A', 'B', 'C'];

  function build(r) {
    var answers, correctIndex;
    if (r.keepOrder) {
      answers = r.orig.slice();
      correctIndex = answers.indexOf(r.correct);
    } else if (USE_ORIGINAL_ORDER) {
      answers = r.choices.slice();
      correctIndex = 0;
    } else {
      var wrong = r.choices.slice(1);
      answers = [];
      correctIndex = r.place;
      for (var i = 0; i < 3; i++) answers.push(i === correctIndex ? r.choices[0] : wrong.shift());
    }
    return { q: r.q, answers: answers, correct: correctIndex, explanation: r.explanation, photo: r.photo };
  }

  var QUESTIONS = RAW.map(build);
  var api = { QUESTIONS: QUESTIONS, PHOTOS: PHOTOS, LETTERS: LETTERS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuizData = api;
})(typeof window !== 'undefined' ? window : globalThis);
