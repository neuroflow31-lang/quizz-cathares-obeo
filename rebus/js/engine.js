/* Règles du « Grand Jeu des Rébus OBEO » (sans DOM : navigateur ET Node pour les tests). */
(function (root) {
  var POINTS = [5, 3, 1];   // points possibles selon le nombre d'indices utilisés (0, 1, 2)
  var MATCH_MAX = 5;
  function fresh() { return { hints: 0, status: 'playing', score: 0 }; }
  function potential(m) { return POINTS[Math.min(m.hints, 2)]; }
  function useHint(m) { if (m.status !== 'playing' || m.hints >= 2) return false; m.hints++; return true; }
  // trouvé : le score potentiel actuel ; révélé : 0. Un rébus terminé ne change plus (aucun double comptage).
  function found(m) { if (m.status !== 'playing') return false; m.status = 'found'; m.score = potential(m); return true; }
  function reveal(m) { if (m.status !== 'playing') return false; m.status = 'revealed'; m.score = 0; return true; }
  function appreciation(s) {
    if (s <= 30) return 'Les rébus vous ont donné du fil à retordre !';
    if (s <= 50) return 'Belle performance !';
    if (s <= 70) return 'Très belle équipe !';
    if (s <= 90) return 'Experts des rébus !';
    return 'IMBATTABLES !';
  }
  var api = { POINTS: POINTS, MATCH_MAX: MATCH_MAX, fresh: fresh, potential: potential, useHint: useHint, found: found, reveal: reveal, appreciation: appreciation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RebusEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
