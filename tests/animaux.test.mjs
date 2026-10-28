import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const data = require('../animaux/js/quiz-data.js');
const m = require('../animaux/js/model.js').build(data);

test('Animaux : 6 manches de 6 questions, aucune erreur de structure', () => {
  assert.deepEqual(m.errors, []);
  assert.equal(m.questions.length, 36);
  assert.deepEqual(m.chapters.map(c => c.count), [6, 6, 6, 6, 6, 6]);
  assert.deepEqual(m.chapters.map(c => c.title), ['Tout ce que vous croyiez savoir est faux !', 'Un monde invisible pour nous', 'Plus intelligents qu’on ne le pensait',
    'Familles et sociétés extraordinaires', 'Les animaux médecins', 'La grande expédition finale']);
  assert.equal(data.CONFIG.title, 'LE MONDE ANIMAL');
  assert.equal(data.CONFIG.subtitle, 'Incroyables capacités, intelligence, entraide et secrets de la nature');
});
test('Animaux : barème — +1 en manches 1 à 5, +2 en manche 6 ; classements après les manches 2 et 4', () => {
  m.questions.forEach(q => assert.equal(q.points, q.chapterNo === 6 ? 2 : 1, q.id));
  assert.deepEqual(data.CONFIG.rankingAfterChapters, [2, 4]);
});
test('Animaux : Q1 à Q24 — réponses du contenu fourni, sans texte provisoire', () => {
  const exp = ['Pour communiquer et réagir à son environnement', 'FAUX', 'Un mammifère', 'FAUX', 'Une famille', '7',
    'Grâce à l’écholocation', 'À la chaleur qu’elle émet', 'VRAI', 'Le champ magnétique terrestre', 'Des infrasons', 'Il y trouve potentiellement énormément d’informations',
    'Résoudre certains problèmes pour accéder à la nourriture', 'Une pierre', 'VRAI', 'Un « faux pouce » formé à partir d’un os du poignet', 'Non', 'Oui, plusieurs espèces en sont capables',
    'Le mâle', 'Ils leur donnent progressivement des proies de plus en plus difficiles', 'VRAI', 'Il surveille les dangers', 'Oui', 'Non, l’apprentissage social joue aussi un rôle'];
  assert.deepEqual(m.questions.slice(0, 24).map(q => q.answers[q.correct]), exp);
  m.questions.slice(0, 24).forEach(q => { assert.ok(!q.placeholder, q.id); assert.ok(q.explanation.length > 20 && q.anecdote.length > 20, q.id); });
  const cnt = [0, 0, 0]; m.questions.slice(0, 24).filter(q => q.kind === 'abc').forEach(q => cnt[q.correct]++);
  assert.deepEqual(cnt, [6, 6, 7], 'bonnes réponses A/B/C réparties');
});
test('Animaux : types et images du contenu fourni', () => {
  assert.deepEqual(m.questions.slice(0, 24).map(q => q.type).join(' '),
    'qcm tf qcm tf qcm riddle situation qcm tf qcm riddle reflection qcm situation tf qcm reflection challenge qcm situation tf visual reflection qcm');
  const imgs = m.questions.filter(q => q.explicitImage).map(q => 'Q' + (q.n + 1) + '=' + decodeURIComponent(q.image).replace('assets/images/', ''));
  assert.deepEqual(imgs, ['Q1=m1q1-cameleon.jpg', 'Q3=m1q3-dauphin.jpg', 'Q5=m1q5-loup.jpg', 'Q6=m1q6-girafe.jpg', 'Q9=m2q9-cameleon-yeux.jpg', 'Q11=m2q11-elephant.jpg',
    'Q13=m3q13-poulpe.jpg', 'Q16=m3q16-panda-roux.jpg', 'Q19=m4q19-manchots.jpg', 'Q20=m4q20-suricates.jpg', 'Q22=m4q22-suricate-sentinelle.jpg',
    'Q25=m5q25-chimpanze.jpg', 'Q26=m5q26-fourmis.jpg', 'Q27=m5q27-axolotl.jpg', 'Q28=m5q28-abeilles.jpg',
    'Q31=m6q31-poulpe.jpg', 'Q33=m6q33-suricates.jpg', 'Q34=m6q34-elephants.jpg', 'Q35=m6q35-axolotl.jpg']);
  assert.ok(m.questions[8].think, 'Q9 vrai/faux avec image : image montrée avant les boutons');
});
test('Animaux : dossier autonome, quiz Cathares et France intacts', () => {
  const html = fs.readFileSync(path.join(root, 'animaux/index.html'), 'utf8');
  assert.ok(!/\.\.\//.test(html) && !/\.\.\//.test(fs.readFileSync(path.join(root, 'animaux/js/app.js'), 'utf8')));
  assert.equal(fs.readFileSync(path.join(root, 'animaux/js/logic.js'), 'utf8'), fs.readFileSync(path.join(root, 'js/logic.js'), 'utf8'));
  assert.ok(/obeo-quiz-animaux-v1/.test(fs.readFileSync(path.join(root, 'animaux/js/app.js'), 'utf8')), 'sauvegarde séparée des autres quiz');
});

test('Animaux : 19 images de questions nettes, accueil et intros de manche en décor OBEO (visuels flous retirés)', () => {
  const files = m.questions.filter(q => q.explicitImage).map(q => decodeURIComponent(q.image));
  assert.equal(files.length, 19);
  files.forEach(f => { const b = fs.readFileSync(path.join(root, 'animaux', f)); assert.ok(b[0] === 0xff && b[1] === 0xd8, 'JPEG ' + f); });
  assert.equal(data.CONFIG.homeImage, '');
  data.CHAPTERS.forEach(c => assert.equal(c.image, ''));
  ['home.jpg', 'ch1.jpg', 'ch2.jpg', 'ch3.jpg', 'ch4.jpg', 'ch5.jpg', 'ch6.jpg'].forEach(f => assert.ok(!fs.existsSync(path.join(root, 'animaux/assets/images', f)), 'pas de ' + f + ' => décor de secours'));
});
test('Animaux : score maximal 42 (Q1-Q30 à 1 point, Q31-Q36 à 2 points), affiché « X / 42 »', () => {
  m.questions.forEach((q, i) => assert.equal(q.points, i >= 30 ? 2 : 1));
  assert.equal(m.questions.reduce((a, q) => a + q.points, 0), 42);
  assert.ok(/function pts\(n\) \{ return n \+ ' \/ ' \+ MAX; \}/.test(fs.readFileSync(path.join(root, 'animaux/js/app.js'), 'utf8')));
});

test('Animaux : 36 / 36 questions complètes, aucun texte provisoire, introductions des 6 manches', () => {
  assert.equal(m.placeholders, 0);
  assert.deepEqual(m.warnings, []);
  const src = fs.readFileSync(path.join(root, 'animaux/js/quiz-data.js'), 'utf8');
  assert.ok(!/remplacer/.test(src), 'aucun « à remplacer »');
  m.questions.forEach(q => assert.ok(q.q && q.explanation.length > 20 && q.anecdote.length > 20, q.id));
  m.chapters.forEach(c => assert.ok(c.hook.length > 60 && !/^\[/.test(c.hook), 'intro manche ' + c.no));
  assert.match(m.chapters[4].hook, /^Se soigner paraît être une invention humaine\. Pourtant, certains animaux choisissent des plantes/);
  assert.match(m.chapters[5].hook, /^Vous êtes maintenant devenus les naturalistes de l’expédition OBEO/);
});
test('Animaux : Q25 à Q36 — réponses, types, points et images du contenu fourni', () => {
  const qs = m.questions.slice(24);
  assert.deepEqual(qs.map(q => q.answers[q.correct]), ['Certaines possèdent des propriétés médicinales', 'Amputer la partie blessée', 'Notamment un membre complet', 'La propolis', 'Non', 'FAUX',
    'Le poulpe', 'La fourmi charpentière', 'Le suricate', 'Les éléphants pourraient utiliser des appels individualisés comparables à des noms', 'L’axolotl',
    'Certains chimpanzés recherchent des plantes bioactives lorsqu’ils sont malades ou blessés']);
  assert.deepEqual(qs.map(q => 'ABC'[q.correct] || ''), ['B', 'A', 'B', 'A', 'B', 'B', 'B', 'B', 'A', 'A', 'A', 'B']);
  assert.deepEqual(qs.map(q => q.type).join(' '), 'situation qcm qcm qcm deduction tf riddle deduction riddle deduction riddle synthesis');
  assert.deepEqual(qs.map(q => q.points), [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2]);
  assert.deepEqual(m.questions[30].clues, ['Je possède trois cœurs.', 'Mon sang utilise une molécule contenant du cuivre.', 'Je peux résoudre certains problèmes.']);
  qs.forEach(q => assert.ok(q.short.length > 2, 'texte ✅ Réponse ' + q.id));
});
test('Animaux : anecdotes Q1, Q2, Q5 corrigées (plus de réponse anticipée de Q9, Q7, Q21)', () => {
  assert.match(m.questions[0].anecdote, /^Chez certaines espèces, la langue du caméléon/);
  assert.match(m.questions[1].anecdote, /^Toutes les chauves-souris ne mangent pas des insectes/);
  assert.match(m.questions[4].anecdote, /^Le hurlement permet notamment aux loups/);
  assert.ok(!/yeux/.test(m.questions[0].anecdote) && !/écholocation/i.test(m.questions[1].anecdote) && !/famil/i.test(m.questions[4].anecdote));
});
