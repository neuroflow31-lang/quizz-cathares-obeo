import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const data = require('../france/js/quiz-data.js');
const Model = require('../france/js/model.js');
const L = require('../france/js/logic.js');
const m = Model.build(data);

test('France : 40 épreuves, 6 chapitres (6/7/7/7/7/6), aucune erreur de structure', () => {
  assert.deepEqual(m.errors, []);
  assert.equal(m.questions.length, 40);
  assert.deepEqual(m.chapters.map(c => c.count), [6, 7, 7, 7, 7, 6]);
  assert.deepEqual(m.chapters.map(c => c.title), ['Le masque de fer', 'La Bête du Gévaudan', 'Rennes-le-Château', 'Les secrets de Versailles', 'Jeanne d’Arc', 'Les catacombes de Paris']);
  assert.equal(data.CONFIG.title, 'LA FRANCE');
  assert.equal(data.CONFIG.tagline, 'Six histoires vraies entre mystères, légendes et patrimoine');
});
test('France : les 6 formats sont présents et alternés (jamais 3 fois le même de suite)', () => {
  const types = new Set(m.questions.map(q => q.type));
  assert.deepEqual([...types].sort(), ['legend', 'qcm', 'reflection', 'riddle', 'tf', 'visual']);
  m.questions.forEach((q, i) => { if (i > 1) assert.ok(!(q.type === m.questions[i - 1].type && q.type === m.questions[i - 2].type), 'trois fois ' + q.type + ' de suite en ' + q.id); });
});
test('France : points — 1 point, sauf les 3 dernières épreuves des Catacombes à 2 points', () => {
  m.questions.forEach((q, i) => assert.equal(q.points, i >= 37 ? 2 : 1, q.id));
});
test('France : classements intermédiaires après Rennes-le-Château et avant le dernier chapitre', () => {
  assert.deepEqual(data.CONFIG.rankingAfterChapters, [3, 5]);
});
test('France : réponses cohérentes (index valide, choix distincts)', () => {
  m.questions.forEach(q => { assert.ok(q.correct >= 0 && q.correct < q.answers.length); assert.equal(new Set(q.answers).size, q.answers.length); });
});
test('France : le validateur détecte les erreurs de contenu', () => {
  const bad = JSON.parse(JSON.stringify({ CONFIG: data.CONFIG, CHAPTERS: data.CHAPTERS, QUESTIONS: data.QUESTIONS }));
  bad.QUESTIONS[0].answer = 'D'; bad.QUESTIONS[1].type = 'nimporte'; bad.QUESTIONS.pop();
  const r = Model.build(bad);
  assert.ok(r.errors.some(e => /answer/.test(e))); assert.ok(r.errors.some(e => /type inconnu/.test(e))); assert.ok(r.errors.some(e => /épreuves attendues/.test(e)));
});
test('France : le validateur accepte du vrai contenu (QCM, VRAI/FAUX, FAIT/LÉGENDE) et signale une anecdote trop longue', () => {
  const d = { CONFIG: { imagesDir: 'assets/images/' }, CHAPTERS: [{ no: 1, title: 'T', hook: 'h', count: 3 }],
    QUESTIONS: [
      { id: 'a', chapter: 1, type: 'qcm', question: 'Quelle ville ?', choices: ['X', 'Y', 'Z'], answer: 'B', explanation: 'Parce que.', anecdote: 'Une. Deux. Trois. Quatre. Cinq.' },
      { id: 'b', chapter: 1, type: 'tf', question: 'Vrai ?', answer: 'FAUX', explanation: 'Non.' },
      { id: 'c', chapter: 1, type: 'legend', question: 'Fait ?', answer: 'LEGENDE', explanation: 'Légende.', image: 'x y/é.jpg' }] };
  const r = Model.build(d);
  assert.deepEqual(r.errors, []); assert.equal(r.placeholders, 0);
  assert.deepEqual(r.questions.map(q => q.correct), [1, 1, 1]);
  assert.ok(r.warnings.some(w => /anecdote trop longue/.test(w)));
  assert.equal(r.questions[2].image, 'assets/images/x%20y/%C3%A9.jpg');
});
test('France : dossier autonome (aucune dépendance vers le Quiz Cathares)', () => {
  const html = fs.readFileSync(path.join(root, 'france/index.html'), 'utf8');
  assert.ok(!/\.\.\//.test(html));
  ['css/style.css', 'js/app.js', 'js/model.js', 'js/quiz-data.js', 'js/logic.js', 'assets/logo/obeo-logo.png', 'assets/logo/obeo-clover-mark.png', 'assets/logo/obeo-clover.png'].forEach(f => assert.ok(fs.existsSync(path.join(root, 'france', f)), f));
  const app = fs.readFileSync(path.join(root, 'france/js/app.js'), 'utf8');
  assert.ok(!/\.\.\//.test(app));
});
test('France : le moteur de score est identique à celui du Quiz Cathares', () => {
  const a = fs.readFileSync(path.join(root, 'js/logic.js'), 'utf8'), b = fs.readFileSync(path.join(root, 'france/js/logic.js'), 'utf8');
  assert.equal(a, b);
  const p = L.adjust(L.addPlayer([], 'A', 1), 1, 2); assert.equal(p[0].score, 2);
});
