// Vérifie expressions/js/quiz-data.js : structure, expressions uniques, images déclarées présentes.   npm run check:expressions
// Version finale (séance avec les résidents) : npm run check:expressions -- --final
//   → échoue tant que les 43 visuels (accueil + 6 manches + 36 questions) ne sont pas tous présents,
//     (une image par question : le décor OBEO de secours ne doit jamais apparaître avec les résidents).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'expressions');
const m = require(path.join(root, 'js/model.js')).build(require(path.join(root, 'js/quiz-data.js')));
const exists = (p) => p && fs.existsSync(path.join(root, decodeURIComponent(p)));
let missing = 0;
console.log(`Quiz « ${m.config.title} » — ${m.questions.length} questions / ${m.chapters.length} manches`);
m.chapters.forEach((c) => {
  const qs = m.questions.filter((q) => q.ch === c.idx);
  const decl = qs.filter((q) => q.image), ok = decl.filter((q) => exists(q.image));
  decl.filter((q) => !exists(q.image)).forEach((q) => { missing++; console.log(`  ⚠  ${q.id} : image déclarée absente (${decodeURIComponent(q.image)}) → décor de secours`); });
  console.log(`  ${c.no}. ${c.title.padEnd(56)} ${qs.length} questions | images : ${ok.length}/${qs.length} (sinon décor OBEO)`);
});
console.log(`  Expressions différentes : ${new Set(m.questions.map((q) => q.expression.toLowerCase())).size} / ${m.questions.length}`);
console.log(`  Total de points possibles par participant : ${m.questions.reduce((s, q) => s + q.points, 0)}`);
if (m.placeholders) console.log(`\n⚠  ${m.placeholders} question(s) contiennent encore du texte provisoire.`);
m.warnings.forEach((w) => console.log('⚠  ' + w));
if (m.errors.length) { m.errors.forEach((e) => console.error('✗ ' + e)); process.exit(1); }
// visuels attendus pour la version finale : 1 accueil + 6 manches + 36 questions = 43
const todo = [];
if (!exists(m.config.homeImage && m.config.imagesDir + m.config.homeImage)) todo.push('Accueil');
m.chapters.forEach((c) => { if (!exists(c.image)) todo.push('Manche ' + c.no); });
m.questions.forEach((q) => {
  if (!exists(q.image)) todo.push(`Q${q.n + 1} (${q.expression})`);
  if (q.revealImage && !exists(q.revealImage)) todo.push(`Q${q.n + 1} (${q.expression}) — vignette de réponse absente`);
});
console.log(`  Visuels prêts pour la version finale : ${43 - todo.length} / 43`);
if (todo.length) console.log('  À fournir :\n    - ' + todo.join('\n    - '));
console.log(`\n✓ Structure et contenu valides${missing ? ' (' + missing + ' image(s) manquante(s))' : ''}.`);
if (process.argv.includes('--final') && todo.length) { console.error(`✗ VERSION FINALE NON PRÊTE : ${todo.length} visuel(s) manquant(s) — le décor OBEO de secours ne doit pas être utilisé avec les résidents.`); process.exit(1); }
if (process.argv.includes('--final')) console.log('✓ VERSION FINALE PRÊTE : 43 / 43 visuels, aucun décor de secours.');
