/* Règles de « Les jeux de votre enfance » (sans DOM : navigateur ET Node pour les tests).
   Une seule équipe : bonne réponse = 5 points, mauvaise réponse = 0 point. */
(function (root) {
  var MATCH_MAX = 5;
  function fresh() { return { choice: null, status: 'playing', score: 0 }; }
  // valide la réponse choisie par le groupe ; un défi joué ne change plus (aucun double comptage)
  function answer(m, choice, correct) {
    if (m.status !== 'playing' || !(choice >= 0 && choice <= 2)) return false;
    m.choice = choice; m.status = 'done'; m.score = choice === correct ? MATCH_MAX : 0;
    return true;
  }
  function appreciation(s) {
    if (s <= 30) return 'Les souvenirs se réveillent !';
    if (s <= 50) return 'Belle mémoire collective !';
    if (s <= 70) return 'Vous n’avez pas oublié vos récréations !';
    if (s <= 90) return 'Experts des jeux d’autrefois !';
    return 'Mémoire exceptionnelle !';
  }
  var api = { MATCH_MAX: MATCH_MAX, fresh: fresh, answer: answer, appreciation: appreciation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EnfanceEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
