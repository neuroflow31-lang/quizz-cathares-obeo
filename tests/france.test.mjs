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
test('France : les 6 formats sont présents, dans l’ordre exact du contenu définitif (CONTENT-1)', () => {
  const types = new Set(m.questions.map(q => q.type));
  assert.deepEqual([...types].sort(), ['legend', 'qcm', 'reflection', 'riddle', 'tf', 'visual']);
  const order = 'qcm visual tf qcm legend riddle | qcm qcm tf legend visual reflection qcm | qcm qcm reflection visual tf legend legend | qcm tf reflection visual qcm tf riddle | qcm qcm qcm tf legend reflection visual | qcm qcm tf qcm visual qcm'
    .replace(/\|/g, ' ').split(/\s+/);
  assert.deepEqual(m.questions.map(q => q.type), order);
});
test('France : contenu définitif — aucun texte provisoire, explication et anecdote sur chaque épreuve', () => {
  assert.equal(m.placeholders, 0);
  assert.deepEqual(m.warnings, []);
  m.questions.forEach(q => { assert.ok(q.explanation.length > 20, q.id); assert.ok(q.anecdote.length > 20, q.id); assert.ok(!/remplacer/.test(q.q + q.explanation + q.anecdote + q.answers.join()), q.id); });
  m.chapters.forEach(c => assert.ok(c.hook.length > 40 && !/remplacer/.test(c.hook), 'accroche ch' + c.no));
});
test('France : bonnes réponses — 40 réponses du contenu définitif, A/B/C répartis', () => {
  const exp = ['Louis XIV', 'La Bastille', 'FAUX', 'Eustache Dauger', 'LÉGENDE', 'Le secret entourant l’identité et le motif de l’emprisonnement',
    '1764-1767', 'Louis XV', 'VRAI', 'LÉGENDE', 'La Bête du Gévaudan', 'Les attaques se répètent pendant plusieurs années', 'Un ou plusieurs grands canidés',
    'L’Aude', 'Prêtre', 'Il finance des constructions importantes malgré les revenus modestes attendus d’un curé rural', 'La Tour Magdala', 'FAUX', 'FAIT', 'LÉGENDE',
    '8h30', 'VRAI', 'Parce que la proximité avec le roi traduit le rang et le privilège', 'La chambre du Roi', '22h', 'VRAI', 'Un ensemble de règles permettant aussi d’organiser et contrôler la Cour',
    'Rouen', '19 ans', 'Charles VII', 'VRAI', 'FAIT', 'Ses procès ont produit énormément de témoignages et d’interrogatoires', 'Le sacre de Charles VII à Reims',
    'À cause de graves problèmes de salubrité dans les cimetières', 'Les Saints-Innocents', 'VRAI', 'En hommage aux catacombes de Rome', '20 mètres', 'Nadar'];
  assert.deepEqual(m.questions.map(q => q.answers[q.correct]), exp);
  const cnt = [0, 0, 0]; m.questions.filter(q => q.kind === 'abc').forEach(q => cnt[q.correct]++);
  assert.deepEqual(cnt, [9, 9, 10]);
});
test('France : images attendues renseignées pour les épreuves « IMAGE OUI »', () => {
  const withImg = m.questions.filter(q => q.explicitImage).map(q => q.n + 1);
  assert.deepEqual(withImg, [2, 5, 8, 11, 14, 15, 17, 19, 22, 24, 28, 30, 34, 36, 39, 40]);
  m.questions.filter(q => q.type === 'visual').forEach(q => assert.ok(q.explicitImage, 'visuel sans image : ' + q.id));
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
