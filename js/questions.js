/* Contenu du quiz « Les Cathares en Occitanie » — 4 manches, 25 épreuves.
   Écriture : pour les questions à 3 choix (abc / visual), `choices[0]` est TOUJOURS la bonne réponse ;
   `place` (0=A, 1=B, 2=C) fixe sa position à l'écran afin de répartir les bonnes réponses.
   keepOrder:true => on garde l'ordre écrit (dates). Pour VRAI/FAUX : `truth: true|false`.
   photo : clé de PHOTOS (fichiers dans assets/photos/). */
(function (root) {
  var PHOTOS = {
    montsegur:   { src: 'assets/photos/Ch%C3%A2teau_de_Monts%C3%A9gur_depuis_le_village.jpg',        label: 'Montségur',            sub: 'Ariège' },
    carcassonne: { src: 'assets/photos/Carcassonne.France_Cit%C3%A9M%C3%A9di%C3%A9vale.jpg',      label: 'Carcassonne',          sub: 'Aude' },
    beziers:     { src: 'assets/photos/River_l%27Orb,_Beziers.jpg',          label: 'Béziers',              sub: 'Hérault' },
    villerouge:  { src: 'assets/photos/Villerouge-Termen%C3%A8s_ch%C3%A2teau.jpg',       label: 'Villerouge-Termenès',  sub: 'Aude' },
    paysage:     { src: 'assets/photos/Ariege_-_Pyr%C3%A9n%C3%A9es_-_from_Mont_Fourcat_-_4.jpg',          label: 'Paysages d’Occitanie', sub: 'Ariège' },
    hero:        { src: 'assets/photos/Carcassonne,_France,_view_of_the_walls_of_the_medieval_city.JPG', label: 'Cité médiévale',       sub: 'Occitanie' }
  };

  var ROUNDS = [
    { name: 'L’histoire des Cathares', kind: 'abc', points: 1, photo: 'hero',
      blurb: 'Retraçons ensemble l’histoire des Cathares et de la croisade.' },
    { name: 'Reconnaissez le lieu', kind: 'visual', points: 1, photo: 'paysage',
      blurb: 'Des photographies de lieux emblématiques du Pays cathare. Prenez le temps d’observer !' },
    { name: 'Vrai ou faux ?', kind: 'tf', points: 1, photo: 'carcassonne',
      blurb: 'Des affirmations : à vous de dire si elles sont vraies ou fausses.' },
    { name: 'La finale', kind: 'abc', points: 2, photo: 'montsegur', bonus: true,
      blurb: 'Des questions un peu plus difficiles, pour faire évoluer le classement jusqu’au bout !' }
  ];

  var RAW = [
    /* ---------- MANCHE 1 — L'histoire des Cathares (8) ---------- */
    { round: 0, q: 'Dans quelle grande région historique le catharisme s’est-il fortement développé ?',
      choices: ['Le Languedoc', 'La Bretagne', 'La Normandie'], place: 1, photo: 'paysage',
      explanation: 'Le catharisme a particulièrement marqué le Languedoc médiéval, aujourd’hui en grande partie intégré à l’Occitanie.' },
    { round: 0, q: 'Comment appelle-t-on la croisade lancée contre les hérétiques du Midi au XIIIe siècle ?',
      choices: ['La croisade des Albigeois', 'La croisade de Provence', 'La croisade des Pyrénées'], place: 2, photo: 'carcassonne',
      explanation: 'Elle est aussi appelée croisade contre les Albigeois et commence en 1209.' },
    { round: 0, q: 'En quelle année débute la croisade contre les Albigeois ?',
      keepOrder: true, orig: ['1099', '1209', '1321'], correct: '1209', photo: 'hero',
      explanation: 'La croisade débute en 1209 après l’appel du pape Innocent III.' },
    { round: 0, q: 'Quelle ville est prise par les croisés en juillet 1209 avant Carcassonne ?',
      choices: ['Béziers', 'Foix', 'Albi'], place: 0, photo: 'beziers',
      explanation: 'Béziers est attaquée en juillet 1209, au tout début de la croisade.' },
    { round: 0, q: 'Quel chef militaire est étroitement associé aux croisés venus du Nord ?',
      choices: ['Simon de Montfort', 'Gaston Fébus', 'Henri IV'], place: 2, photo: 'carcassonne',
      explanation: 'Simon de Montfort devient l’un des principaux chefs militaires de la croisade dans le Midi.' },
    { round: 0, q: 'Quel événement dramatique est associé à Montségur en mars 1244 ?',
      choices: ['Plus de 200 cathares sont conduits au bûcher', 'Le château devient palais royal', 'Une grande foire y est créée'], place: 0, photo: 'montsegur',
      explanation: 'Après la reddition de Montségur, plus de deux cents cathares périssent sur le bûcher le 16 mars 1244.' },
    { round: 0, q: 'Quel était le nom du principal sacrement reconnu par les cathares ?',
      choices: ['Le consolament', 'Le couronnement', 'La confirmation royale'], place: 2, photo: 'paysage',
      explanation: 'Le consolament était un baptême spirituel par imposition des mains.' },
    { round: 0, q: 'Quel organisme religieux est chargé de rechercher et juger les hérésies après la croisade ?',
      choices: ['L’Inquisition', 'Le Parlement de Toulouse', 'La Garde suisse'], place: 1, photo: 'villerouge',
      explanation: 'L’Inquisition joue ensuite un rôle majeur dans la répression des croyances considérées comme hérétiques.' },

    /* ---------- MANCHE 2 — Reconnaissez le lieu (5) ---------- */
    { round: 1, kind: 'visual', lookTitle: 'Reconnaissez-vous ce lieu ?', q: 'Reconnaissez-vous ce lieu ?',
      choices: ['Montségur', 'Le château de Chenonceau', 'Le Mont-Saint-Michel'], place: 1, photo: 'montsegur',
      title: 'C’est Montségur (Ariège)',
      explanation: 'Perché sur un « pog » à plus de 1 200 mètres d’altitude, Montségur résiste près de dix mois au siège de 1243-1244. Le château visible aujourd’hui a été reconstruit après la chute de la forteresse cathare.' },
    { round: 1, kind: 'visual', lookTitle: 'Reconnaissez-vous ce lieu ?', q: 'Reconnaissez-vous ce lieu ?',
      choices: ['La Cité de Carcassonne', 'Le Palais des papes d’Avignon', 'Le château de Chambord'], place: 0, photo: 'carcassonne',
      title: 'C’est la Cité de Carcassonne (Aude)',
      explanation: 'Près de 3 km de remparts et plus de 50 tours : l’une des plus grandes cités fortifiées d’Europe. Elle se rend en août 1209 ; son allure actuelle doit beaucoup à Viollet-le-Duc. Elle est inscrite à l’UNESCO depuis 1997.' },
    { round: 1, kind: 'visual', lookTitle: 'Reconnaissez-vous cette ville ?', q: 'Reconnaissez-vous cette ville ?',
      choices: ['Béziers', 'Strasbourg', 'Annecy'], place: 2, photo: 'beziers',
      title: 'C’est Béziers (Hérault)',
      explanation: 'La ville domine l’Orb, non loin du Canal du Midi. Le 22 juillet 1209, la croisade y commet son premier grand massacre. La phrase « Tuez-les tous, Dieu reconnaîtra les siens » est attribuée au légat du pape, mais les historiens doutent qu’elle ait été prononcée.' },
    { round: 1, kind: 'visual', lookTitle: 'Reconnaissez-vous ce lieu ?', q: 'Reconnaissez-vous ce lieu ?',
      choices: ['Villerouge-Termenès', 'Le château de Vincennes', 'Le château de Pierrefonds'], place: 1, photo: 'villerouge',
      title: 'C’est Villerouge-Termenès (Aude)',
      explanation: 'Ce château des Corbières appartenait aux archevêques de Narbonne. C’est ici que Guilhem Bélibaste, le dernier « parfait » cathare connu, est brûlé en 1321. Le château propose aujourd’hui des visites autour de cette histoire.' },
    { round: 1, kind: 'visual', lookTitle: 'Reconnaissez-vous ce paysage ?', q: 'Ce paysage sauvage est celui de l’Ariège cathare. De quelle chaîne de montagnes fait-il partie ?',
      choices: ['Les Pyrénées', 'Les Vosges', 'Le Jura'], place: 0, photo: 'paysage',
      title: 'Ce sont les Pyrénées',
      explanation: 'Les « citadelles du vertige » (Peyrepertuse, Quéribus…) se dressent dans les Corbières, au pied des Pyrénées. Perchées sur des crêtes, elles gardaient la frontière avec le royaume d’Aragon.' },

    /* ---------- MANCHE 3 — Vrai ou faux ? (7) ---------- */
    { round: 2, kind: 'tf', q: 'La Cité de Carcassonne a été largement restaurée au XIXe siècle par Viollet-le-Duc.', truth: true, photo: 'carcassonne',
      explanation: 'La restauration commence vers 1853. Ses toits d’ardoise pointus, très « nordiques », font encore débat parmi les historiens.' },
    { round: 2, kind: 'tf', q: 'Le château de Montségur se trouve dans l’Aude.', truth: false, photo: 'montsegur',
      explanation: 'Il se trouve en Ariège. L’Aude abrite plutôt Carcassonne, Peyrepertuse ou Quéribus.' },
    { round: 2, kind: 'tf', q: 'La croisade contre les Albigeois a été lancée à l’appel du pape Innocent III.', truth: true, photo: 'hero',
      explanation: 'Son légat Pierre de Castelnau est assassiné en 1208 ; le pape appelle alors à la croisade, qui commence en 1209 et dure une vingtaine d’années.' },
    { round: 2, kind: 'tf', q: 'L’Inquisition a été mise en place au XIIIe siècle pour lutter contre l’hérésie.', truth: true, photo: 'villerouge',
      explanation: 'Elle est confiée en grande partie aux dominicains à partir des années 1230. Les interrogatoires de l’évêque Jacques Fournier, à Pamiers, nous racontent la vie quotidienne des villageois.' },
    { round: 2, kind: 'tf', q: 'Les cathares baptisaient les nouveau-nés avec de l’eau, comme l’Église catholique.', truth: false, photo: 'paysage',
      explanation: 'Ils refusaient le baptême d’eau. Leur rite, le consolament, se recevait à l’âge adulte ou souvent sur le lit de mort, par imposition des mains.' },
    { round: 2, kind: 'tf', q: 'Tous les « châteaux cathares » ont été construits par les cathares.', truth: false, photo: 'beziers',
      explanation: 'Ces forteresses appartenaient à des seigneurs locaux. Beaucoup ont été remaniées ensuite par le roi de France pour surveiller la frontière avec l’Aragon.' },
    { round: 2, kind: 'tf', q: 'Guilhem Bélibaste, dernier « parfait » cathare connu, a été brûlé vif en 1321.', truth: true, photo: 'villerouge',
      explanation: 'Réfugié en Catalogne, il est livré par un traître, Arnaud Sicre, puis brûlé à Villerouge-Termenès en 1321.' },

    /* ---------- MANCHE 4 — La finale (5, bonus 2 points) ---------- */
    { round: 3, q: 'Quel traité met fin à la croisade des Albigeois en 1229 ?',
      choices: ['Le traité de Meaux-Paris', 'Le traité de Verdun', 'Le traité de Troyes'], place: 2, photo: 'hero',
      explanation: 'Signé par Raymond VII de Toulouse, il reconnaît l’autorité du roi de France sur une grande partie du Languedoc. À la mort de sa fille Jeanne et de son gendre Alphonse de Poitiers, en 1271, le comté de Toulouse revient à la Couronne.' },
    { round: 3, q: 'Comment appelait-on les simples fidèles cathares, qui n’avaient pas encore reçu le consolament ?',
      choices: ['Les croyants', 'Les chevaliers', 'Les pèlerins'], place: 0, photo: 'villerouge',
      explanation: 'Les « croyants » vivaient dans le monde (artisans, paysans, nobles…) et recevaient souvent le consolament à la fin de leur vie. Les « parfaits », ou « bons hommes », menaient une vie très austère.' },
    { round: 3, q: 'Montségur est bâti sur un « pog ». Que signifie ce mot occitan ?',
      choices: ['Un piton rocheux', 'Un pont fortifié', 'Une source'], place: 1, photo: 'montsegur',
      explanation: 'Un « pog » (ou « puech ») est une hauteur isolée. Le nom Montségur signifie « mont sûr » : bien trouvé pour une forteresse perchée à plus de 1 200 mètres.' },
    { round: 3, q: 'Quel roi de France conduit lui-même la croisade dans le Midi en 1226, puis meurt sur le chemin du retour ?',
      choices: ['Louis VIII', 'Saint Louis', 'Philippe Auguste'], place: 0, photo: 'carcassonne',
      explanation: 'Louis VIII prend Avignon en 1226, puis meurt en novembre à Montpensier, en Auvergne. Son fils, le futur Saint Louis, n’a que 12 ans : sa mère Blanche de Castille gouverne et poursuit la politique royale dans le Midi.' },
    { round: 3, q: 'Quelle ville du Tarn a donné son nom aux « Albigeois » ?',
      choices: ['Albi', 'Castres', 'Gaillac'], place: 2, photo: 'beziers',
      explanation: 'À l’origine, « Albigeois » désigne les habitants de la région d’Albi, où les idées cathares étaient très présentes. La cathédrale Sainte-Cécile, forteresse de brique commencée en 1282, est inscrite à l’UNESCO depuis 2010.' }
  ];

  var LETTERS = ['A', 'B', 'C'];

  function build(r) {
    var kind = r.kind || 'abc', pts = ROUNDS[r.round].points;
    var o = { round: r.round, kind: kind, q: r.q, explanation: r.explanation, photo: r.photo, points: pts,
      title: r.title || null, lookTitle: r.lookTitle || null };
    if (kind === 'tf') {
      o.answers = ['VRAI', 'FAUX'];
      o.correct = r.truth ? 0 : 1;
      return o;
    }
    if (r.keepOrder) { o.answers = r.orig.slice(); o.correct = o.answers.indexOf(r.correct); return o; }
    var wrong = r.choices.slice(1);
    o.answers = []; o.correct = r.place;
    for (var i = 0; i < 3; i++) o.answers.push(i === r.place ? r.choices[0] : wrong.shift());
    return o;
  }

  var QUESTIONS = RAW.map(build);
  var api = { QUESTIONS: QUESTIONS, ROUNDS: ROUNDS, PHOTOS: PHOTOS, LETTERS: LETTERS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuizData = api;
})(typeof window !== 'undefined' ? window : globalThis);
