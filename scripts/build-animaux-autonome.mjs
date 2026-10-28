// Génère animaux/QUIZ_ANIMAUX_AUTONOME.html : un SEUL fichier (HTML + CSS + JS + logos + images en data URI),
// sans aucune dépendance ni requête — à ouvrir par double-clic (file://).   node scripts/build-animaux-autonome.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'animaux');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const uri = (f) => 'data:' + (f.endsWith('.png') ? 'image/png' : 'image/jpeg') + ';base64,' + fs.readFileSync(path.join(root, f)).toString('base64');

// images réellement utilisées par le quiz (même résolution de chemins que le moteur)
const m = require(path.join(root, 'js/model.js')).build(require(path.join(root, 'js/quiz-data.js')));
const used = new Set();
m.questions.forEach((q) => used.add(q.image));
m.chapters.forEach((c) => used.add(c.image));
const cfg = m.config;
['home.jpg', 'players.jpg', 'ranking.jpg'].forEach((f) => used.add(cfg.imagesDir + f));
if (cfg.homeImage) used.add(cfg.imagesDir + cfg.homeImage);
const IMG = {};
for (const key of used) { const f = decodeURIComponent(key); if (fs.existsSync(path.join(root, f))) IMG[key] = uri(f); }

const logo = uri('assets/logo/obeo-logo.png'), mark = uri('assets/logo/obeo-clover-mark.png'), fav = uri('assets/logo/obeo-clover.png');
let app = read('js/app.js');
const swap = (a, b) => { if (!app.includes(a)) throw new Error('motif absent : ' + a); app = app.split(a).join(b); };
swap("src: 'assets/logo/obeo-logo.png'", "src: window.__OBEO_LOGO");
swap("src: 'assets/logo/obeo-clover-mark.png'", "src: window.__OBEO_MARK");
swap('function imageBox(src, opts) {', 'function imageBox(src, opts) {\n    src = window.__img(src);');
swap("h('img', { class: 'thumb', src: q.image,", "h('img', { class: 'thumb', src: window.__img(q.image),");

const css = read('css/style.css');
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Le monde animal · OBEO Toulouse Guillaumet</title>
<link rel="icon" type="image/png" href="${fav}">
<style>
${css}
</style>
</head>
<body>
<div id="viewport"><div id="stage" role="application" aria-label="Quiz Le monde animal"></div></div>
<div id="testbar" hidden></div>
<canvas id="confetti" aria-hidden="true"></canvas>
<noscript>Ce quiz nécessite JavaScript.</noscript>
<script>
/* Version autonome : images et logos intégrés (data URI). Image absente => décor OBEO de secours, sans aucune requête. */
window.__OBEO_LOGO = ${JSON.stringify(logo)};
window.__OBEO_MARK = ${JSON.stringify(mark)};
window.__OBEO_IMG = ${JSON.stringify(IMG)};
window.__img = function (src) { return (src && window.__OBEO_IMG[src]) || ''; };
</script>
<script>
${safe(read('js/quiz-data.js'))}
</script>
<script>
${safe(read('js/model.js'))}
</script>
<script>
${safe(read('js/logic.js'))}
</script>
<script>
${safe(app)}
</script>
</body>
</html>
`;
const out = path.join(root, 'QUIZ_ANIMAUX_AUTONOME.html');
fs.writeFileSync(out, html);
console.log(`✓ ${path.relative(path.join(root, '..'), out)} — ${(html.length / 1048576).toFixed(1)} Mo, ${Object.keys(IMG).length} images intégrées`);
