// "Build" : vérifie les données puis copie l'application statique dans dist/ (aucune dépendance).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { QUESTIONS, PHOTOS } = require(path.join(root, 'js/questions.js'));
let errors = 0;
const fail = (m) => { console.error('✗ ' + m); errors++; };
if (QUESTIONS.length !== 15) fail('15 questions attendues, trouvé ' + QUESTIONS.length);
QUESTIONS.forEach((q, i) => {
  if (q.answers.length !== 3) fail(`Q${i + 1}: 3 réponses attendues`);
  if (!(q.correct >= 0 && q.correct < 3)) fail(`Q${i + 1}: bonne réponse invalide`);
  if (!PHOTOS[q.photo]) fail(`Q${i + 1}: photo inconnue « ${q.photo} »`);
});
Object.entries(PHOTOS).forEach(([k, p]) => { if (!fs.existsSync(path.join(root, p.src))) fail(`Image manquante : ${p.src} (${k})`); });
if (errors) process.exit(1);
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const f of ['index.html', 'css', 'js', 'assets']) fs.cpSync(path.join(root, f), path.join(dist, f), { recursive: true });
console.log(`✓ Données valides (${QUESTIONS.length} questions) — application copiée dans dist/`);
