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
console.log(`✓ Données valides (${QUESTIONS.length} épreuves, manches ${per.join('+')}) — application copiée dans dist/`);
