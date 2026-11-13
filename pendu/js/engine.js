/* Moteur du « Grand Pendu OBEO » : règles pures, sans DOM (utilisable dans le navigateur ET dans Node pour les tests). */
(function (root) {
  var MAX_ERRORS = 7;
  var POINTS = [5, 3, 1];          // points possibles selon le nombre d'indices utilisés (0, 1, 2)
  var MATCH_MAX = 5;

  // É È Ê Ë → E, À Â Ä → A, Î Ï → I, Ô Ö → O, Ù Û Ü → U, Ç → C (le mot affiché garde ses accents)
  function norm(ch) { return String(ch).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); }
  function isLetter(ch) { return /^[A-Z]$/.test(norm(ch)); }
  // lettres A–Z (sans doublon) à trouver dans le mot
  function needed(word) {
    var set = {};
    Array.from(word).forEach(function (c) { if (isLetter(c)) set[norm(c)] = 1; });
    return Object.keys(set);
  }
  function fresh() { return { played: [], errors: 0, hints: 0, status: 'playing', score: 0 }; }
  function potential(m) { return POINTS[Math.min(m.hints, 2)]; }
  function revealed(word, m, ch) { return !isLetter(ch) || m.played.indexOf(norm(ch)) >= 0; }

  // Joue une lettre : renvoie { result: 'hit' | 'miss' | 'already' | 'over', count } ; une lettre ne compte jamais deux fois.
  function play(word, m, letter) {
    var L = norm(letter);
    if (m.status !== 'playing' || !/^[A-Z]$/.test(L)) return { result: 'over', count: 0 };
    if (m.played.indexOf(L) >= 0) return { result: 'already', count: 0 };
    m.played.push(L);
    var count = Array.from(word).filter(function (c) { return isLetter(c) && norm(c) === L; }).length;
    if (count) {
      if (needed(word).every(function (x) { return m.played.indexOf(x) >= 0; })) finish(m, true);
      return { result: 'hit', count: count };
    }
    m.errors++;
    if (m.errors >= MAX_ERRORS) finish(m, false);
    return { result: 'miss', count: 0 };
  }
  function useHint(m) {
    if (m.status !== 'playing' || m.hints >= 2) return false;
    m.hints++; return true;
  }
  function finish(m, won) { m.status = won ? 'won' : 'lost'; m.score = won ? potential(m) : 0; }

  function appreciation(score) {
    if (score <= 30) return 'On s’échauffe !';
    if (score <= 50) return 'Belle équipe !';
    if (score <= 70) return 'Excellents détectives !';
    if (score <= 90) return 'Maîtres du pendu !';
    return 'Équipe imbattable !';
  }

  var api = { MAX_ERRORS: MAX_ERRORS, POINTS: POINTS, MATCH_MAX: MATCH_MAX, norm: norm, isLetter: isLetter, needed: needed, fresh: fresh,
    potential: potential, revealed: revealed, play: play, useHint: useHint, finish: finish, appreciation: appreciation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PenduEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
