import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../js/logic.js');
const { QUESTIONS } = require('../js/questions.js');

test('ajout / renommage / suppression', () => {
  let p = [];
  p = L.addPlayer(p, '  Marie  ', 1); p = L.addPlayer(p, 'Jean', 2); p = L.addPlayer(p, '   ', 3);
  assert.deepEqual(p.map(x => x.name), ['Marie', 'Jean']);
  p = L.renamePlayer(p, 2, 'Jean-Paul'); assert.equal(p[1].name, 'Jean-Paul');
  p = L.removePlayer(p, 1); assert.equal(p.length, 1);
});
test('limite de participants', () => {
  let p = [];
  for (let i = 0; i < 40; i++) p = L.addPlayer(p, 'P' + i, i);
  assert.equal(p.length, L.MAX_PLAYERS);
});
test('points +1 / -1, jamais négatifs', () => {
  let p = L.addPlayer([], 'Marie', 1);
  p = L.adjust(p, 1, 1); p = L.adjust(p, 1, 1); assert.equal(p[0].score, 2);
  p = L.adjust(p, 1, -1); p = L.adjust(p, 1, -1); p = L.adjust(p, 1, -1); assert.equal(p[0].score, 0);
});
test('classement avec égalités (1, 2, 2, 4)', () => {
  let p = [];
  ['Marie', 'Jean', 'Monique', 'Pierre'].forEach((n, i) => { p = L.addPlayer(p, n, i + 1); });
  [[1, 5], [2, 4], [3, 4], [4, 2]].forEach(([id, n]) => { for (let i = 0; i < n; i++) p = L.adjust(p, id, 1); });
  const r = L.ranking(p);
  assert.deepEqual(r.map(x => [x.player.name, x.rank]), [['Marie', 1], ['Jean', 2], ['Monique', 2], ['Pierre', 4]]);
  assert.equal(L.rankLabel(1), '1er'); assert.equal(L.rankLabel(2), '2e');
});
test('réinitialisation des scores', () => {
  let p = L.adjust(L.addPlayer([], 'A', 1), 1, 3);
  assert.equal(L.resetScores(p)[0].score, 0);
});
test('15 questions, 3 réponses, bonne réponse cohérente avec le contenu source', () => {
  assert.equal(QUESTIONS.length, 15);
  const expected = ['Le Languedoc', 'La croisade des Albigeois', '1209', 'Béziers', 'Simon de Montfort', 'Carcassonne et Béziers', 'Ariège',
    'La haute hiérarchie cathare', 'Plus de 200 cathares sont conduits au bûcher', 'Le consolament', 'Bons hommes et bonnes femmes', 'L’Inquisition',
    'Plusieurs forteresses visibles aujourd’hui ont été remaniées ou reconstruites après la croisade', 'Guilhem Bélibaste', 'Montségur'];
  QUESTIONS.forEach((q, i) => { assert.equal(q.answers.length, 3); assert.equal(q.answers[q.correct], expected[i], 'Q' + (i + 1)); assert.equal(new Set(q.answers).size, 3); });
  const counts = [0, 0, 0]; QUESTIONS.forEach(q => counts[q.correct]++);
  assert.ok(Math.max(...counts) <= 6, 'bonnes réponses réparties : ' + counts);
});
