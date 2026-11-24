// Génère enfance/JEUX_ENFANCE_OBEO_AUTONOME.html : un SEUL fichier (HTML + CSS + JS + logos + images q01…q20 présentes, en data URI),
// sans aucune dépendance ni requête — à ouvrir par double-clic (file://).   node scripts/build-enfance-autonome.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'enfance');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const uri = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(root, f)).toString('base64');

let app = read('js/app.js');
const swap = (a, b) => { if (!app.includes(a)) throw new Error('motif absent : ' + a); app = app.split(a).join(b); };
swap("src: 'assets/logo/obeo-logo.png'", 'src: window.__OBEO_LOGO');
swap("src: 'assets/logo/obeo-clover-mark.png'", 'src: window.__OBEO_MARK');
// images des défis : intégrées si présentes ; sinon aucune requête, le décor OBEO provisoire reste affiché
swap("function imgPath(i) { return CFG.imagesDir + 'q' + (i < 9 ? '0' : '') + (i + 1) + '.jpg'; }",
  "function imgPath(i) { return window.__OBEO_IMG['q' + (i < 9 ? '0' : '') + (i + 1)] || ''; }");
const IMG = {};
for (let n = 1; n <= 20; n++) {
  const k = 'q' + String(n).padStart(2, '0'), f = path.join(root, 'assets/images', k + '.jpg');
  if (fs.existsSync(f)) IMG[k] = 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
}
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Les jeux de votre enfance · OBEO Toulouse Guillaumet</title>
<link rel="icon" type="image/png" href="${uri('assets/logo/obeo-clover.png')}">
<style>
${read('css/style.css')}
</style>
</head>
<body>
<div id="viewport"><div id="stage" role="application" aria-label="Les jeux de votre enfance"></div></div>
<div id="testbar" hidden></div>
<canvas id="confetti" aria-hidden="true"></canvas>
<noscript>Ce jeu nécessite JavaScript.</noscript>
<script>
/* Version autonome : logo intégré (data URI), aucune requête. */
window.__OBEO_LOGO = ${JSON.stringify(uri('assets/logo/obeo-logo.png'))};
window.__OBEO_MARK = ${JSON.stringify(uri('assets/logo/obeo-clover-mark.png'))};
window.__OBEO_IMG = ${JSON.stringify(IMG)};
</script>
<script>
${safe(read('js/data.js'))}
</script>
<script>
${safe(read('js/engine.js'))}
</script>
<script>
${safe(app)}
</script>
</body>
</html>
`;
const out = path.join(root, 'JEUX_ENFANCE_OBEO_AUTONOME.html');
fs.writeFileSync(out, html);
console.log(`✓ ${path.relative(path.join(root, '..'), out)} — ${(html.length / 1024).toFixed(0)} Ko, ${Object.keys(IMG).length} / 20 images intégrées`);
