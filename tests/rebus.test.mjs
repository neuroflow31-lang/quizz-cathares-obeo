import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const E = require('../rebus/js/engine.js');
const D = require('../rebus/js/data.js');
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

test('Rébus : 20 rébus, 4 manches de 5, 100 points, contenu complet', () => {
  assert.equal(D.REBUS.length, 20);
  assert.deepEqual([1, 2, 3, 4].map(n => D.REBUS.filter(r => r.manche === n).length), [5, 5, 5, 5]);
  assert.equal(D.REBUS.length * E.MATCH_MAX, 100);
  D.REBUS.forEach((r, i) => assert.ok(r.answer && r.visual && r.hint1 && r.hint2 && r.explain, 'rébus ' + (i + 1)));
  assert.equal(D.REBUS[0].answer, 'ÊTRE DANS LA LUNE'); assert.equal(D.REBUS[19].answer, 'QUAND LES POULES AURONT DES DENTS');
});
test('Rébus : aucun visuel n’écrit sa réponse', () => {
  D.REBUS.forEach((r, i) => {
    const txt = norm(r.visual.replace(/<[^>]*>/g, ' '));
    const words = norm(r.answer).split(/[^A-Z]+/).filter(w => w.length >= 4 && !['TOUR', 'DANS', 'AVOIR', 'METTRE', 'PRENDRE'].includes(w));
    words.forEach(w => assert.ok(!txt.includes(w), 'rébus ' + (i + 1) + ' écrit « ' + w + ' »'));
  });
});
test('Rébus : barème 5 / 3 / 1, révélation 0, aucun double comptage', () => {
  const pts = h => { const m = E.fresh(); for (let k = 0; k < h; k++) E.useHint(m); E.found(m); return m.score; };
  assert.deepEqual([0, 1, 2].map(pts), [5, 3, 1]);
  const m = E.fresh(); E.useHint(m); E.useHint(m); assert.equal(E.useHint(m), false);
  const r = E.fresh(); E.useHint(r); assert.ok(E.reveal(r)); assert.equal(r.score, 0);
  assert.equal(E.found(r), false); assert.equal(E.reveal(r), false); assert.equal(r.score, 0);
  const f = E.fresh(); E.found(f); assert.equal(E.reveal(f), false); assert.equal(f.score, 5); assert.equal(E.useHint(f), false);
});
test('Rébus : appréciations finales', () => {
  assert.deepEqual([0, 30, 31, 50, 51, 70, 71, 90, 91, 100].map(E.appreciation), ['Les rébus vous ont donné du fil à retordre !', 'Les rébus vous ont donné du fil à retordre !',
    'Belle performance !', 'Belle performance !', 'Très belle équipe !', 'Très belle équipe !', 'Experts des rébus !', 'Experts des rébus !', 'IMBATTABLES !', 'IMBATTABLES !']);
});
test('Rébus : version autonome sans ressource externe', () => {
  const one = fs.readFileSync(path.join(root, 'rebus/JEU_REBUS_OBEO_AUTONOME.html'), 'utf8');
  assert.ok(!/src="(js|css|assets)\//.test(one) && !/href="(css|assets)\//.test(one) && !/https?:\/\//.test(one.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')));
  assert.ok(/obeo-rebus-v1/.test(one));
});
