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
  assert.equal(m.questions.map(q => 'ABC'[q.correct]).join(''), 'BABCBBAABAABBCABCACAABBBABAAACABCACB');
  assert.equal(m.questions[0].answers[m.questions[0].correct], 'Rester la bouche ouverte à regarder longtemps');
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
  ['m1q6', 'm4q19', 'm4q23'].forEach(id => {
    const q = m.questions.find(x => x.id === id);
    assert.match(q.blocks.map(b => b.text).join(' '), /incertaine|discutée/, id);
  });
});
test('Expressions : 10 images du pack placées, une image pour chacune des 36 questions (aucun décor de secours)', () => {
  assert.equal(data.CONFIG.homeImage, 'hero-expressions.jpg');
  assert.deepEqual(m.chapters.map(c => c.image), [1, 2, 3, 4, 5, 6].map(n => 'assets/images/manche' + n + '.jpg'));
  m.questions.forEach(q => assert.ok(q.image && fs.existsSync(path.join(root, 'expressions', decodeURIComponent(q.image))), 'image ' + q.id));
  const f = q => decodeURIComponent(q).replace('assets/images/', '');
  assert.deepEqual(m.questions.filter(q => q.revealImage).map(q => 'Q' + (q.n + 1) + '=' + f(q.revealImage)), ['Q2=q02-marmot.jpg', 'Q3=q03-fauconnerie.jpg', 'Q7=q07-maille.jpg', 'Q21=q21-chou-blanc.jpg', 'Q24=q24-carte-blanche.jpg']);
  assert.deepEqual([10, 12, 20, 27, 29, 32].map(n => f(m.questions[n - 1].image)), ['q10-lune-de-miel.jpg', 'q12-tasse-de-the.jpg', 'q20-cest-la-vie.jpg', 'q27-faux-pas.jpg', 'q29-tete-a-tete.jpg', 'q32-feu-vert.jpg']);
  assert.ok(!/q21|q24/.test(f(m.questions[20].image) + f(m.questions[23].image)), 'Q21/Q24 : images-réponses seulement après validation');
  // images qui donneraient un indice : jamais affichées avec la question concernée
  assert.equal(f(m.questions[1].image), 'hero-expressions.jpg', 'Q2 : pas le sablier de manche1, pas l’homme qui attend');
  assert.equal(f(m.questions[6].image), 'manche2.jpg', 'Q7 : pas la dispute');
  assert.ok(!/manche6|q03/.test(f(m.questions[33].image)), 'Q34 : pas de faucon');
  assert.ok(!/manche6/.test(f(m.questions[35].image)), 'Q36 : pas de forteresse canonnée');
  const files = ['hero-expressions.jpg', 'q02-marmot.jpg', 'q03-fauconnerie.jpg', 'q07-maille.jpg'].concat([1, 2, 3, 4, 5, 6].map(n => 'manche' + n + '.jpg'));
  files.forEach(f => { const b = fs.readFileSync(path.join(root, 'expressions/assets/images', f)); assert.ok(b[0] === 0xff && b[1] === 0xd8, f); });
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
  assert.match(q8.blocks.find(b => b.key === 'origine').text, /^Une tradition médiévale documentée associe l’expression aux jongleurs/);
  assert.match(q8.blocks.find(b => b.key === 'savez').text, /^Le Dictionnaire de l’Académie française a longtemps défini/);
  assert.equal(q34.answers[q34.correct], 'La fauconnerie');
});
test('Expressions V2 : questions d’histoire des mots et expressions qui voyagent', () => {
  const q = n => m.questions[n - 1], txt = n => q(n).blocks.map(b => b.text).join(' ');
  assert.deepEqual(m.questions.filter(x => x.blocks.some(b => b.key === 'voyage')).map(x => x.n + 1), [10, 12, 20, 24, 27, 29]);
  assert.deepEqual([10, 12, 20, 24, 27, 29].map(n => q(n).expression), ['Lune de miel', 'Ce n’est pas ma tasse de thé', 'C’est la vie', 'Carte blanche', 'Faux pas', 'Tête-à-tête']);
  assert.match(q(1).q, /que signifiait autrefois le verbe « bayer »/);
  assert.match(q(5).q, /ancien verbe/); assert.match(q(7).q, /qu’était une « maille »/); assert.match(q(9).q, /qu’était à l’origine le « chapitre »/);
  assert.match(q(21).q, /Dans quel jeu ancien/); assert.match(q(28).q, /le mot « bombance » évoquait/);
  assert.match(txt(32), /feu vert.*green light/); assert.match(txt(29), /raison d’être/);
  assert.equal(q(24).kicker, 'Une expression qui voyage', 'Q24 : l’étiquette ne donne pas la réponse');
  [13, 14, 16, 17, 18, 22, 25, 26, 30, 31, 33, 34, 35, 36].forEach(n => assert.ok(q(n).q.length > 10, 'conservée Q' + n));
  assert.match(q(35).q, /laquelle enlève le plus d’arbres/);
  // jamais une question de simple définition pour les expressions très connues remplacées
  [1, 2, 5, 6, 7, 8, 9, 19, 21, 23, 28].forEach(n => assert.ok(!/^(Que signifie|Aujourd’hui|Quel est le sens)/.test(q(n).q), 'Q' + n));
});
