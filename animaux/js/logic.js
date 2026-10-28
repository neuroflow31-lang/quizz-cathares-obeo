/* Logique pure (scores, classement) — testée par tests/logic.test.mjs */
(function (root) {
  var MAX_PLAYERS = 24;

  function cleanName(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, 24); }

  function addPlayer(players, name, id) {
    var n = cleanName(name);
    if (!n || players.length >= MAX_PLAYERS) return players;
    return players.concat([{ id: id, name: n, score: 0, last: 0 }]);
  }
  function renamePlayer(players, id, name) {
    return players.map(function (p) { return p.id === id ? Object.assign({}, p, { name: cleanName(name) || p.name }) : p; });
  }
  function removePlayer(players, id) { return players.filter(function (p) { return p.id !== id; }); }
  function adjust(players, id, delta) {
    return players.map(function (p) { return p.id === id ? Object.assign({}, p, { score: Math.max(0, p.score + delta) }) : p; });
  }
  function resetScores(players) { return players.map(function (p) { return Object.assign({}, p, { score: 0 }); }); }

  /* Classement : tri par score décroissant (ordre d'inscription conservé en cas d'égalité),
     rang « compétition » : 1, 2, 2, 4 — une égalité reste une égalité. */
  function ranking(players) {
    var sorted = players.map(function (p, i) { return { p: p, i: i }; })
      .sort(function (a, b) { return b.p.score - a.p.score || a.i - b.i; })
      .map(function (x) { return x.p; });
    var out = [];
    sorted.forEach(function (p, i) {
      var rank = (i > 0 && p.score === sorted[i - 1].score) ? out[i - 1].rank : i + 1;
      out.push({ player: p, rank: rank });
    });
    return out;
  }
  function rankLabel(r) { return r === 1 ? '1er' : r + 'e'; }

  var api = { MAX_PLAYERS: MAX_PLAYERS, cleanName: cleanName, addPlayer: addPlayer, renamePlayer: renamePlayer,
    removePlayer: removePlayer, adjust: adjust, resetScores: resetScores, ranking: ranking, rankLabel: rankLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuizLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
