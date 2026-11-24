import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const E = require('../enfance/js/engine.js');
const D = require('../enfance/js/data.js');

test('Enfance : 20 défis, 4 manches de 5, 3 propositions, une seule bonne réponse', () => {
  assert.equal(D.DEFIS.length, 20);
  assert.deepEqual([1, 2, 3, 4].map(n => D.DEFIS.filter(d => d.manche === n).length), [5, 5, 5, 5]);
  assert.equal(D.DEFIS.length * E.MATCH_MAX, 100);
  D.DEFIS.forEach((d, i) => {
    assert.equal(d.choices.length, 3, 'défi ' + (i + 1));
    assert.equal(new Set(d.choices).size, 3, 'propositions distinctes ' + (i + 1));
    assert.ok(['A', 'B', 'C'].includes(d.answer) && d.question && d.explain && d.title, 'défi ' + (i + 1));
  });
  assert.equal(D.DEFIS.map(d => d.answer).join(''), 'BAABBBABABACBBBBAAAA', 'bonnes réponses du contenu fourni');
  assert.equal(D.DEFIS.filter(d => d.relance).length, 8, 'relances souvenirs');
  assert.deepEqual(D.DEFIS[13].dominoes, [[6, 2], [2, 4], [4, null]]);
});
test('Enfance : bonne réponse = 5, mauvaise = 0, un défi joué ne change plus', () => {
  const m = E.fresh(); assert.ok(E.answer(m, 1, 1)); assert.equal(m.score, 5);
  assert.equal(E.answer(m, 0, 1), false); assert.equal(m.score, 5);
  const w = E.fresh(); E.answer(w, 2, 1); assert.equal(w.score, 0); assert.equal(E.answer(w, 1, 1), false); assert.equal(w.score, 0);
  assert.equal(E.answer(E.fresh(), 3, 1), false);
});
test('Enfance : appréciations finales', () => {
  assert.deepEqual([0, 30, 31, 50, 51, 70, 71, 90, 91, 100].map(E.appreciation), ['Les souvenirs se réveillent !', 'Les souvenirs se réveillent !', 'Belle mémoire collective !',
    'Belle mémoire collective !', 'Vous n’avez pas oublié vos récréations !', 'Vous n’avez pas oublié vos récréations !', 'Experts des jeux d’autrefois !',
    'Experts des jeux d’autrefois !', 'Mémoire exceptionnelle !', 'Mémoire exceptionnelle !']);
});
test('Enfance : 20 images q01…q20 ; celles qui montrent la réponse seulement après validation ; autonome sans ressource externe', () => {
  for (let n = 1; n <= 20; n++) { const b = fs.readFileSync(path.join(root, 'enfance/assets/images', 'q' + String(n).padStart(2, '0') + '.jpg')); assert.ok(b[0] === 0xff && b[1] === 0xd8, 'JPEG q' + n); }
  assert.deepEqual(D.DEFIS.map((d, i) => d.imageAfter ? i + 1 : 0).filter(Boolean), [2, 5, 8, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20]);
  const app = fs.readFileSync(path.join(root, 'enfance/js/app.js'), 'utf8');
  assert.ok(/'q' \+ \(i < 9 \? '0' : ''\) \+ \(i \+ 1\) \+ '\.jpg'/.test(app) && /obeo-enfance-v1/.test(app));
  const one = fs.readFileSync(path.join(root, 'enfance/JEUX_ENFANCE_OBEO_AUTONOME.html'), 'utf8');
  assert.equal((one.match(/"q\d\d":"data:image\/jpeg;base64,/g) || []).length, 20, '20 images intégrées');
  assert.ok(!/src="(js|css|assets)\//.test(one) && !/href="(css|assets)\//.test(one) && !/https?:\/\//.test(one.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')));
});
