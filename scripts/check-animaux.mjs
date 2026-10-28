// Vérifie animaux/js/quiz-data.js : structure, contenu restant à remplacer, images présentes.   npm run check:animaux
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'animaux');
const data = require(path.join(root, 'js/quiz-data.js'));
const model = require(path.join(root, 'js/model.js'));
const m = model.build(data);
const exists = (p) => fs.existsSync(path.join(root, decodeURIComponent(p)));
console.log(`Quiz « ${m.config.title} » — ${m.questions.length} questions / ${m.chapters.length} manches`);
m.chapters.forEach((c) => {
  const qs = m.questions.filter((q) => q.ch === c.idx);
  const ph = qs.filter((q) => q.placeholder).length;
  const imgs = qs.filter((q) => exists(q.image)).length;
  const anec = qs.filter((q) => q.anecdote && !/^\[/.test(q.anecdote)).length;
  console.log(`  ${c.no}. ${c.title.padEnd(26)} ${String(qs.length).padStart(2)} questions | à remplacer: ${String(ph).padStart(2)} | anecdotes: ${anec} | images: ${imgs}/${qs.length} | image manche: ${exists(c.image) ? 'oui' : 'non'}`);
});
console.log(`  Accueil : ${exists(m.config.imagesDir + (m.config.homeImage || 'home.jpg')) ? 'image présente' : 'décor de secours (assets/images/home.jpg absent)'}`);
const pts = m.questions.reduce((s, q) => s + q.points, 0);
console.log(`  Total de points possibles par participant : ${pts}`);
if (m.placeholders) console.log(`\n⚠  ${m.placeholders} question(s) contiennent encore du texte « [… à remplacer] ».`);
m.warnings.forEach((w) => console.log('⚠  ' + w));
if (m.errors.length) { m.errors.forEach((e) => console.error('✗ ' + e)); process.exit(1); }
console.log(m.placeholders ? '\n✓ Structure valide (contenu à compléter).' : '\n✓ Structure et contenu valides.');
