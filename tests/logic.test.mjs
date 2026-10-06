import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const L = require('../js/logic.js');
const { QUESTIONS, ROUNDS, PHOTOS } = require('../js/questions.js');
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

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
test('points +1 / +2 et correction, jamais négatifs', () => {
  let p = L.addPlayer([], 'Marie', 1);
  p = L.adjust(p, 1, 1); p = L.adjust(p, 1, 2); assert.equal(p[0].score, 3);
  p = L.adjust(p, 1, -2); assert.equal(p[0].score, 1);
  p = L.adjust(p, 1, -2); assert.equal(p[0].score, 0);
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
  const p = L.adjust(L.addPlayer([], 'A', 1), 1, 3);
  assert.equal(L.resetScores(p)[0].score, 0);
});

test('structure : 4 manches, 8 + 5 + 7 + 5 = 25 épreuves', () => {
  assert.equal(ROUNDS.length, 4);
  const count = r => QUESTIONS.filter(q => q.round === r).length;
  assert.deepEqual([0, 1, 2, 3].map(count), [8, 5, 7, 5]);
  assert.equal(QUESTIONS.length, 25);
  assert.deepEqual(QUESTIONS.map(q => q.round), [...Array(8).fill(0), ...Array(5).fill(1), ...Array(7).fill(2), ...Array(5).fill(3)]);
});
test('barème : +1 en manches 1-3, +2 en finale', () => {
  QUESTIONS.forEach((q, i) => assert.equal(q.points, q.round === 3 ? 2 : 1, 'Q' + (i + 1)));
  const max = QUESTIONS.reduce((s, q) => s + q.points, 0);
  assert.equal(max, 20 + 10);
});
test('types de questions par manche', () => {
  QUESTIONS.forEach(q => {
    if (q.round === 1) assert.equal(q.kind, 'visual');
    else if (q.round === 2) assert.equal(q.kind, 'tf');
    else assert.equal(q.kind, 'abc');
  });
});
test('chaque question est cohérente (réponses distinctes, bonne réponse valide, texte non vide)', () => {
  QUESTIONS.forEach((q, i) => {
    const n = q.kind === 'tf' ? 2 : 3;
    assert.equal(q.answers.length, n, 'Q' + (i + 1));
    assert.equal(new Set(q.answers).size, n);
    assert.ok(q.correct >= 0 && q.correct < n);
    assert.ok(q.q.length > 10 && q.explanation.length > 20);
    assert.ok(PHOTOS[q.photo], 'photo inconnue Q' + (i + 1));
  });
});
test('bonnes réponses A/B/C réellement réparties (pas toujours A)', () => {
  const abc = QUESTIONS.filter(q => q.kind !== 'tf');
  const counts = [0, 0, 0]; abc.forEach(q => counts[q.correct]++);
  assert.ok(counts.every(c => c >= 4), 'répartition A/B/C : ' + counts);
  let run = 1, maxRun = 1;
  abc.forEach((q, i) => { if (i && q.correct === abc[i - 1].correct) { run++; maxRun = Math.max(maxRun, run); } else run = 1; });
  assert.ok(maxRun <= 2, 'plus de 2 bonnes réponses identiques de suite');
  const tf = QUESTIONS.filter(q => q.kind === 'tf'); const vrai = tf.filter(q => q.correct === 0).length;
  assert.ok(vrai >= 3 && vrai <= 4, 'mélange VRAI/FAUX : ' + vrai + ' vrai');
});
test('bonnes réponses attendues (contenu source)', () => {
  const exp = ['Le Languedoc', 'La croisade des Albigeois', '1209', 'Béziers', 'Simon de Montfort', 'Plus de 200 cathares sont conduits au bûcher', 'Le consolament', 'L’Inquisition',
    'Montségur', 'La Cité de Carcassonne', 'Béziers', 'Villerouge-Termenès', 'Les Pyrénées'];
  exp.forEach((e, i) => assert.equal(QUESTIONS[i].answers[QUESTIONS[i].correct], e, 'Q' + (i + 1)));
  const tf = [true, false, true, true, false, false, true];
  tf.forEach((t, i) => assert.equal(QUESTIONS[13 + i].correct, t ? 0 : 1, 'VF' + (i + 1)));
  const fin = ['Le traité de Meaux-Paris', 'Les croyants', 'Un piton rocheux', 'Louis VIII', 'Albi'];
  fin.forEach((e, i) => assert.equal(QUESTIONS[20 + i].answers[QUESTIONS[20 + i].correct], e));
});
test('toutes les images existent et sont de vrais JPG', () => {
  Object.entries(PHOTOS).forEach(([k, p]) => {
    const f = path.join(root, decodeURIComponent(p.src));
    assert.ok(fs.existsSync(f), 'image manquante ' + p.src);
    const b = fs.readFileSync(f); assert.equal(b[0], 0xff); assert.equal(b[1], 0xd8);
  });
  assert.ok(fs.existsSync(path.join(root, 'assets/logo/obeo-logo.png')));
});
