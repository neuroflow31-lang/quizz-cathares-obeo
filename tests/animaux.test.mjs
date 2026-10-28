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

test('Animaux : 26 images du pack présentes, vraies JPEG, toutes associées (accueil, 6 manches, 19 questions)', () => {
  const files = [data.CONFIG.imagesDir + data.CONFIG.homeImage].concat(m.chapters.map(c => decodeURIComponent(c.image)), m.questions.filter(q => q.explicitImage).map(q => decodeURIComponent(q.image)));
  assert.equal(files.length, 26);
  assert.equal(new Set(files).size, 26);
  files.forEach(f => { const b = fs.readFileSync(path.join(root, 'animaux', f)); assert.ok(b[0] === 0xff && b[1] === 0xd8, 'JPEG ' + f); });
  assert.deepEqual(m.chapters.map(c => decodeURIComponent(c.image).replace('assets/images/', '')), ['manche1.jpg', 'manche2.jpg', 'manche3.jpg', 'manche4.jpg', 'manche5.jpg', 'manche6.jpg']);
  assert.equal(data.CONFIG.homeImage, 'hero-animaux.jpg');
});
test('Animaux : score maximal 42 (Q1-Q30 à 1 point, Q31-Q36 à 2 points), affiché « X / 42 »', () => {
  m.questions.forEach((q, i) => assert.equal(q.points, i >= 30 ? 2 : 1));
  assert.equal(m.questions.reduce((a, q) => a + q.points, 0), 42);
  assert.ok(/function pts\(n\) \{ return n \+ ' \/ ' \+ MAX; \}/.test(fs.readFileSync(path.join(root, 'animaux/js/app.js'), 'utf8')));
});
