import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const data = require('../expressions/js/quiz-data.js');
const m = require('../expressions/js/model.js').build(data);
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

test('Expressions : 6 manches × 6 questions, aucune erreur ni avertissement', () => {
  assert.deepEqual(m.errors, []);
  assert.deepEqual(m.warnings, []);
  assert.equal(m.questions.length, 36);
  assert.deepEqual(m.chapters.map(c => c.count), [6, 6, 6, 6, 6, 6]);
  assert.deepEqual(m.chapters.map(c => c.title), ['Les mots étranges de nos expressions', 'Mais qu’est-ce que ça veut dire ?', 'Quand l’histoire se cache dans les mots',
    'Vraie histoire ou belle légende ?', 'Ces expressions que l’on entendait davantage autrefois', 'La grande énigme des expressions']);
});
test('Expressions : aucun placeholder ni consigne de rédaction affichée', () => {
  assert.equal(m.placeholders, 0);
  const src = fs.readFileSync(path.join(root, 'expressions/js/quiz-data.js'), 'utf8');
  assert.ok(!/remplacer|à fournir|TODO|\[\s*[A-Z]/.test(src));
  m.questions.forEach(q => {
    const all = [q.q, q.short].concat(q.answers, q.blocks.map(b => b.text)).join(' ');
    assert.ok(!/Ne (jamais )?présenter|Ne pas (les )?présenter/.test(all), 'consigne affichée : ' + q.id);
    assert.ok(q.q.length > 10 && q.short.length > 2 && q.blocks.length >= 1, q.id);
  });
});
test('Expressions : 36 expressions différentes, la finale n’en réutilise aucune', () => {
  const ex = m.questions.map(q => norm(q.expression));
  assert.equal(new Set(ex).size, 36);
  const early = m.questions.slice(0, 30).map(q => norm([q.expression, q.q, q.short].concat(q.answers, q.blocks.map(b => b.text)).join(' '))).join(' | ');
  m.questions.slice(30).forEach(q => assert.ok(!early.includes(norm(q.expression).replace(/ ou coupe claire$/, '')), 'finale déjà vue : ' + q.expression));
  assert.ok(!/coupe (sombre|claire)|charybde|scylla|breche|pourpoint|petit feu|haut vol/.test(early), 'aucune expression de la finale avant Q31');
});
test('Expressions : bonnes réponses du contenu fourni', () => {
  assert.equal(m.questions.map(q => 'ABC'[q.correct]).join(''), 'CABCABCABCABBCABCABACBCAABCBBCABCACB');
  assert.equal(m.questions[0].answers[m.questions[0].correct], 'Rester à regarder en l’air en perdant son temps');
  assert.equal(m.questions[35].answers[m.questions[35].correct], 'Une muraille');
});
test('Expressions : barème 30 × 1 point + 6 × 2 points = 42 ; classements après Q12 et Q24', () => {
  m.questions.forEach((q, i) => assert.equal(q.points, i >= 30 ? 2 : 1, q.id));
  assert.equal(m.questions.reduce((a, q) => a + q.points, 0), 42);
  assert.deepEqual(data.CONFIG.rankingAfterChapters, [2, 4]);
  assert.equal(m.chapters[1].start + m.chapters[1].count, 12); assert.equal(m.chapters[3].start + m.chapters[3].count, 24);
  assert.equal(data.CONFIG.finaleTitle, 'VOYAGE TERMINÉ AU CŒUR DES EXPRESSIONS FRANÇAISES !');
});
test('Expressions : origines incertaines signalées comme telles', () => {
  ['m1q6', 'm2q10', 'm4q19', 'm4q20', 'm4q21', 'm4q23', 'm5q27', 'm5q29'].forEach(id => {
    const q = m.questions.find(x => x.id === id);
    assert.match(q.blocks.map(b => b.text).join(' '), /incertaine|discutée/, id);
  });
});
test('Expressions : images locales facultatives (vide = décor OBEO, sans requête)', () => {
  m.questions.forEach(q => assert.equal(q.image, '', q.id));
  m.chapters.forEach(c => assert.equal(c.image, ''));
  assert.ok(fs.existsSync(path.join(root, 'expressions/assets/images')));
});
test('Expressions : dossier autonome, autres quiz intacts', () => {
  const app = fs.readFileSync(path.join(root, 'expressions/js/app.js'), 'utf8');
  assert.ok(!/\.\.\//.test(fs.readFileSync(path.join(root, 'expressions/index.html'), 'utf8')) && !/\.\.\//.test(app));
  assert.equal(fs.readFileSync(path.join(root, 'expressions/js/logic.js'), 'utf8'), fs.readFileSync(path.join(root, 'js/logic.js'), 'utf8'));
  assert.ok(/obeo-quiz-expressions-v1/.test(app));
  assert.ok(/function pts\(n\) \{ return n \+ ' \/ ' \+ MAX; \}/.test(app));
});
test('Expressions : corrections éditoriales (intro manche 3, Q8, Q3 sans spoiler de Q34)', () => {
  assert.match(m.chapters[2].hook, /^Certaines expressions sont de véritables petits morceaux d’histoire\./);
  m.chapters.forEach(c => assert.ok(c.hook.length > 60, 'intro manche ' + c.no));
  const q3 = m.questions[2], q8 = m.questions[7], q34 = m.questions[33];
  const t3 = norm([q3.q, q3.short].concat(q3.answers, q3.blocks.map(b => b.text)).join(' '));
  assert.ok(!/haut vol|faucon /.test(t3), 'Q3 ne cite pas « de haut vol »');
  assert.equal(q3.blocks.find(b => b.key === 'savez').text, 'La fauconnerie a laissé dans la langue française plusieurs mots et expressions que nous utilisons encore sans toujours connaître leur origine.');
  assert.match(q8.blocks.find(b => b.key === 'origine').text, /^Une tradition ancienne relie cette expression aux jongleurs/);
  assert.match(q8.blocks.find(b => b.key === 'savez').text, /^Le Dictionnaire de l’Académie française a longtemps défini/);
  assert.equal(q34.answers[q34.correct], 'La fauconnerie');
});
