// Génère pendu/JEU_PENDU_OBEO_AUTONOME.html : un SEUL fichier (HTML + CSS + JS + logo en data URI),
// sans aucune dépendance ni requête — à ouvrir par double-clic (file://).   node scripts/build-pendu-autonome.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'pendu');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const uri = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(root, f)).toString('base64');

let app = read('js/app.js');
const swap = (a, b) => { if (!app.includes(a)) throw new Error('motif absent : ' + a); app = app.split(a).join(b); };
swap("src: 'assets/logo/obeo-logo.png'", 'src: window.__OBEO_LOGO');
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Le Grand Pendu OBEO · OBEO Toulouse Guillaumet</title>
<link rel="icon" type="image/png" href="${uri('assets/logo/obeo-clover.png')}">
<style>
${read('css/style.css')}
</style>
</head>
<body>
<div id="viewport"><div id="stage" role="application" aria-label="Le Grand Pendu OBEO"></div></div>
<div id="testbar" hidden></div>
<canvas id="confetti" aria-hidden="true"></canvas>
<noscript>Ce jeu nécessite JavaScript.</noscript>
<script>
/* Version autonome : logo intégré (data URI), aucune requête. */
window.__OBEO_LOGO = ${JSON.stringify(uri('assets/logo/obeo-logo.png'))};
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
const out = path.join(root, 'JEU_PENDU_OBEO_AUTONOME.html');
fs.writeFileSync(out, html);
console.log(`✓ ${path.relative(path.join(root, '..'), out)} — ${(html.length / 1024).toFixed(0)} Ko`);
