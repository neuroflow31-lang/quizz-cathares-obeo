import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const E = require('../pendu/js/engine.js');
const D = require('../pendu/js/data.js');

test('Pendu : 20 matchs, 4 manches de 5, contenu complet, 100 points', () => {
  assert.equal(D.MATCHS.length, 20);
  assert.deepEqual([1, 2, 3, 4].map(n => D.MATCHS.filter(m => m.manche === n).length), [5, 5, 5, 5]);
  assert.equal(D.MATCHS.length * E.MATCH_MAX, 100);
  assert.deepEqual(D.MATCHS.map(m => m.word), ['PARCHEMIN', 'BROCANTE', 'MARABOUT', 'CARTOUCHE', 'CABRIOLET', 'PANACHÉ', 'BELVÉDÈRE', 'ESCARBILLE', 'MÉRIDIENNE', 'MARQUISE',
    'ESCAMPETTE', 'SALAMALECS', 'ARTABAN', 'SELLETTE', 'MARMOT', 'PALIMPSESTE', 'PHYLACTÈRE', 'PÉRIPÉTIE', 'MÉLANCOLIE', 'ÉPHÉMÈRE']);
  D.MATCHS.forEach((m, i) => {
    assert.ok(m.context && !m.category && m.hint1 && m.hint2 && m.anecdote, 'match ' + (i + 1));
    [m.hint1, m.hint2].forEach(h => assert.ok(!E.norm(h).includes(E.norm(m.word)), 'indice sans le mot : match ' + (i + 1)));
  });
  assert.equal(D.CONFIG.title, 'LE GRAND PENDU OBEO');
  assert.equal(D.MATCHS.filter(m => m.context && m.context.length < 80).length, 20, '20 phrases de contexte courtes');
  assert.equal(D.MATCHS[0].context, 'On le rencontre souvent là où le temps a laissé des traces.');
  assert.equal(D.MATCHS[19].context, 'Son principal défaut est de ne jamais rester longtemps.');
  D.MATCHS.forEach(m => assert.ok(!E.norm(m.context).includes(E.norm(m.word)) && m.context !== m.hint1, 'contexte sans le mot : ' + m.word));
});
test('Pendu : accents normalisés (É È Ê Ë→E, À Â Ä→A, Î Ï→I, Ô Ö→O, Ù Û Ü→U, Ç→C)', () => {
  assert.equal('ÉÈÊËÀÂÄÎÏÔÖÙÛÜÇ'.split('').map(E.norm).join(''), 'EEEEAAAIIOOUUUC');
  const m = E.fresh(), r = E.play('ÉPHÉMÈRE', m, 'E');
  assert.deepEqual(r, { result: 'hit', count: 4 }, 'E révèle É, É, È et E');
  assert.ok(Array.from('ÉPHÉMÈRE').filter(c => E.norm(c) === 'E').every(c => E.revealed('ÉPHÉMÈRE', m, c)));
});
test('Pendu : une lettre ne compte jamais deux fois ; toutes les occurrences apparaissent', () => {
  const m = E.fresh();
  assert.equal(E.play('SELLETTE', m, 'Z').result, 'miss'); assert.equal(m.errors, 1);
  assert.equal(E.play('SELLETTE', m, 'z').result, 'already'); assert.equal(m.errors, 1, 'pas de 2e erreur');
  assert.deepEqual(E.play('SELLETTE', m, 'L'), { result: 'hit', count: 2 });
  assert.equal(E.play('SELLETTE', m, 'L').result, 'already');
});
test('Pendu : barème 5 / 3 / 1 / 0 et 7 erreurs maximum', () => {
  const win = (hints) => { const m = E.fresh(); for (let k = 0; k < hints; k++) assert.ok(E.useHint(m)); E.needed('MARMOT').forEach(L => E.play('MARMOT', m, L)); return m; };
  assert.deepEqual([0, 1, 2].map(hn => { const m = win(hn); return [m.status, m.score]; }), [['won', 5], ['won', 3], ['won', 1]]);
  const m = E.fresh(); assert.equal(E.potential(m), 5); E.useHint(m); assert.equal(E.potential(m), 3); E.useHint(m); assert.equal(E.potential(m), 1);
  assert.equal(E.useHint(m), false, 'pas de 3e indice');
  const l = E.fresh(); 'CDFGHJK'.split('').forEach((L, k) => { E.play('ARTABAN', l, L); assert.equal(l.status, k < 6 ? 'playing' : 'lost'); });
  assert.equal(l.errors, 7); assert.equal(l.score, 0);
  assert.equal(E.play('ARTABAN', l, 'A').result, 'over', 'match terminé : plus de lettre');
});
test('Pendu : appréciations finales', () => {
  assert.deepEqual([0, 30, 31, 50, 51, 70, 71, 90, 91, 100].map(E.appreciation), ['On s’échauffe !', 'On s’échauffe !', 'Belle équipe !', 'Belle équipe !', 'Excellents détectives !',
    'Excellents détectives !', 'Maîtres du pendu !', 'Maîtres du pendu !', 'Équipe imbattable !', 'Équipe imbattable !']);
});
test('Pendu : dossier autonome et version en un seul fichier', () => {
  const app = fs.readFileSync(path.join(root, 'pendu/js/app.js'), 'utf8');
  assert.ok(!/\.\.\//.test(app) && /obeo-pendu-v1/.test(app));
  const one = fs.readFileSync(path.join(root, 'pendu/JEU_PENDU_OBEO_AUTONOME.html'), 'utf8');
  assert.ok(!/src="(js|css|assets)\//.test(one) && !/href="(css|assets)\//.test(one) && !/https?:\/\//.test(one.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')), 'aucune ressource externe');
});
