// "Build" : vérifie les données puis copie l'application statique dans dist/ (aucune dépendance).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { QUESTIONS, ROUNDS, PHOTOS } = require(path.join(root, 'js/questions.js'));
let errors = 0;
const fail = (m) => { console.error('✗ ' + m); errors++; };
if (QUESTIONS.length !== 25) fail('25 épreuves attendues, trouvé ' + QUESTIONS.length);
const per = ROUNDS.map((_, r) => QUESTIONS.filter(q => q.round === r).length);
if (per.join() !== '8,5,7,5') fail('répartition attendue 8,5,7,5 — trouvé ' + per.join());
QUESTIONS.forEach((q, i) => {
  const n = q.kind === 'tf' ? 2 : 3;
  if (q.answers.length !== n) fail(`Q${i + 1}: ${n} réponses attendues`);
  if (!(q.correct >= 0 && q.correct < n)) fail(`Q${i + 1}: bonne réponse invalide`);
  if (!PHOTOS[q.photo]) fail(`Q${i + 1}: photo inconnue « ${q.photo} »`);
});
Object.entries(PHOTOS).forEach(([k, p]) => { if (!fs.existsSync(path.join(root, decodeURIComponent(p.src)))) fail(`Image manquante : ${p.src} (${k})`); });
if (errors) process.exit(1);
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const f of ['index.html', 'css', 'js', 'assets']) fs.cpSync(path.join(root, f), path.join(dist, f), { recursive: true });
// Quiz « La France » (dossier autonome) : validation de la structure puis copie
const fr = require(path.join(root, 'france/js/model.js')).build(require(path.join(root, 'france/js/quiz-data.js')));
fr.errors.forEach((e) => fail('France : ' + e));
if (fr.questions.length !== 40) fail('France : 40 épreuves attendues');
if (errors) process.exit(1);
fs.cpSync(path.join(root, 'france'), path.join(dist, 'france'), { recursive: true });
console.log(`✓ France : ${fr.questions.length} épreuves, ${fr.chapters.length} chapitres${fr.placeholders ? ' (' + fr.placeholders + ' à remplacer)' : ''} — copié dans dist/france/`);
console.log(`✓ Données valides (${QUESTIONS.length} épreuves, manches ${per.join('+')}) — application copiée dans dist/`);
