/* Test de bout en bout du quiz « Le monde animal » (navigateur réel).
   node scripts/serve.mjs . 5173 &   puis   node tests/e2e-animaux.cjs [chemin-playwright]
   QUIZ_URL=file:///.../animaux/index.html pour tester l'ouverture directe. */
const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path');
const pw = require(process.argv[2] || 'playwright');
const URL = process.env.QUIZ_URL || 'http://localhost:5173/animaux/index.html';
const imgDir = process.env.QUIZ_IMG_DIR || path.join(__dirname, '..', 'animaux', 'assets', 'images');
const TINY_JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
const D = require('../animaux/js/quiz-data.js'), Mdl = require('../animaux/js/model.js');
const M = Mdl.build(D); const Q = M.questions;
const ends = []; M.chapters.forEach(c => ends.push(c.start + c.count - 1));

async function newPage(browser, vp) {
  const pg = await browser.newPage({ viewport: vp || { width: 1920, height: 1080 } });
  pg.errs = []; pg.bad = [];
  pg.on('pageerror', e => pg.errs.push(e.message));
  pg.on('response', r => { if (r.status() >= 400 && !/assets\/images\//.test(r.url())) pg.bad.push(r.url()); });
  await pg.goto(URL); await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(200);
  return pg;
}
const st = pg => pg.evaluate(() => JSON.parse(JSON.stringify(window.__quiz.state)));
const vis = (pg, sel) => pg.locator(sel).count().then(n => n > 0);
const NAMES = ['Marie', 'Jean', 'Monique', 'Pierre'];
async function addPlayers(pg, names) {
  await pg.click('text=Commencer le quiz');
  for (const n of names) { await pg.fill('.add-row input', n); await pg.press('.add-row input', 'Enter'); }
}

async function playAll(pg, group) {
  const seen = { types: {}, intros: 0, between: 0, anecdotes: 0, bonus: 0, looks: 0 };
  const expect = [0, 0, 0, 0];
  for (let n = 0; n < Q.length; n++) {
    const q = Q[n];
    if (await vis(pg, '.intro')) { seen.intros++; assert.match(await pg.locator('.chnum').innerText(), new RegExp('MANCHE ' + q.chapterNo)); await pg.click('.intro .btn'); await pg.waitForTimeout(100); }
    assert.equal((await st(pg)).idx, n);
    // étape « réfléchir » : les choix ne sont pas affichés tant qu'on ne le demande pas
    if (q.think) {
      seen.looks++;
      assert.equal(await pg.locator('.answer, .tfbtn').count(), 0, 'les choix sont masqués pendant la réflexion (' + q.id + ')');
      await pg.click('text=Afficher les choix');
    }
    seen.types[q.type] = (seen.types[q.type] || 0) + 1;
    if (q.points > 1) { seen.bonus++; assert.ok(await vis(pg, '.bonus'), 'badge bonus ' + q.id); }
    // Valider sans sélection : rien ne se passe
    await pg.click('text=Valider', { force: true }); assert.equal(await pg.locator('.answer.good').count(), 0);
    const sel = q.kind === 'two' ? '.tfbtn' : '.answer';
    // survol : ne révèle rien
    await pg.hover(sel + ' >> nth=0'); assert.equal(await pg.locator('.answer.good, .answer.bad').count(), 0, 'survol');
    await pg.click(sel + ' >> nth=1');
    assert.equal(await pg.locator('.answer.good, .answer.bad').count(), 0, 'sélection sans validation ne révèle rien');
    await pg.click('text=Valider'); await pg.waitForTimeout(80);
    assert.equal(await pg.locator('.answer.good').count(), 1, 'bonne réponse révélée après validation');
    assert.ok(await vis(pg, '.zrep') && await vis(pg, '.zwhy'), 'zones Réponse + Pourquoi visibles');
    if (q.anecdote) { seen.anecdotes++; assert.ok(await pg.locator('.zsav').count() === 1, 'zone Le saviez-vous'); assert.match(await pg.locator('.zsav h2').innerText(), /saviez-vous/i); }
    else assert.equal(await pg.locator('.zsav').count(), 0);
    assert.match(await pg.locator('.zrep p').innerText(), new RegExp((q.short || q.answers[q.correct]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 20)));
    if (!group) {
      assert.equal(await pg.locator('.award').count(), 0, 'les points ne sont proposés qu’après le bouton « Attribuer les points »');
      await pg.click('text=Attribuer les points'); await pg.waitForTimeout(80);
      const plus = pg.locator('.pchip .plus');
      assert.match(await plus.nth(0).innerText(), new RegExp('\\+' + q.points));
      await plus.nth(0).click(); await plus.nth(0).click(); await pg.locator('.pchip .minus').nth(0).click(); // correction
      expect[0] += q.points;
      if (n % 2 === 0) { await plus.nth(1).click(); expect[1] += q.points; }
      if (n % 5 === 0) { await plus.nth(2).click(); expect[2] += q.points; }
      await pg.click('.award .btn >> text=/suivant|classement|Chapitre/i');
    } else await pg.click('.nextbar .btn');
    await pg.waitForTimeout(100);
    if (!group && n < Q.length - 1 && M.config.rankingAfterChapters.some(c => ends[c - 1] === n)) {
      seen.between++;
      assert.ok(await vis(pg, '.rank'), 'classement intermédiaire après q' + (n + 1));
      assert.ok((await pg.locator('.rsub').innerText()).length > 3);
      await pg.click('text=Continuer'); await pg.waitForTimeout(100);
    }
  }
  return { seen, expect };
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => pw.chromium.launch());
  const report = {};
  try {
    /* ---- 1) parcours individuel, 4 participants ---- */
    let pg = await newPage(browser);
    assert.match(await pg.locator('h1').innerText(), /LE MONDE ANIMAL/i);
    assert.ok(await pg.locator('text=Incroyables capacités, intelligence, entraide et secrets de la nature').count());
    // décor de secours : pas d'image cassée
    await pg.waitForTimeout(300);
    assert.equal(await pg.locator('.photo.fallback').count(), 1, 'accueil : décor OBEO (hero flou retiré)');
    await addPlayers(pg, NAMES);
    await pg.click('text=C’est parti');
    const { seen, expect } = await playAll(pg, false);
    report.indiv = seen;
    assert.equal(seen.intros, 6); assert.equal(seen.between, 2); assert.equal(seen.bonus, 6);
    assert.deepEqual(Object.keys(seen.types).sort(), ['challenge', 'deduction', 'qcm', 'reflection', 'riddle', 'situation', 'synthesis', 'tf', 'visual']);
    // classement final animé puis podium progressif 3e → 2e → 1er
    assert.ok(await pg.locator('text=EXPÉDITION TERMINÉE !').count());
    assert.ok(await pg.locator('.rrow >> text=42 / 42').count(), 'classement final : 42 / 42');
    await pg.waitForTimeout(3500);
    const s = await st(pg);
    assert.deepEqual(s.players.slice(0, 3).map(p => p.score), expect.slice(0, 3), 'scores +1 / +2 / correction');
    assert.equal(s.players[3].score, 0);
    assert.equal(expect[0], 30 + 12, 'Marie : 30 questions à 1 point + 6 à 2 points');
    await pg.click('text=Voir le podium'); await pg.waitForTimeout(300);
    assert.equal(await pg.locator('.pod:not(.hide)').count(), 0, 'podium vide au départ');
    assert.ok(await pg.locator('text=Révéler la 3e place').count());
    await pg.click('text=Révéler la 3e place'); await pg.waitForTimeout(150);
    assert.equal(await pg.locator('.pod:not(.hide)').count(), 1);
    assert.equal(await pg.locator('.pod.p3:not(.hide)').count(), 1, '3e révélé en premier');
    await pg.click('text=Révéler la 2e place'); await pg.waitForTimeout(150);
    assert.equal(await pg.locator('.pod:not(.hide)').count(), 2);
    assert.equal(await pg.locator('.pod.p1:not(.hide)').count(), 0, '1er pas encore révélé');
    await pg.click('text=Révéler la 1re place'); await pg.waitForTimeout(300);
    assert.equal(await pg.locator('.pod:not(.hide)').count(), 3);
    assert.equal(await pg.locator('.pod.p1 .nm').innerText(), 'Marie — 42 / 42', 'podium : Nom — X / 42');
    assert.ok(await pg.locator('.fullrank >> text=42 / 42').count(), 'classement complet : 42 / 42');
    assert.ok(await pg.locator('text=Merci pour votre participation').count() && await pg.locator('text=Classement complet').count());
    await pg.click('text=Rejouer'); await pg.waitForTimeout(200);
    const s2 = await st(pg); assert.equal(s2.players.length, 4); assert.ok(s2.players.every(p => p.score === 0));
    assert.deepEqual(pg.errs, []); assert.deepEqual(pg.bad, []);

    /* ---- 2) correction −1 : jamais sous zéro ---- */
    await pg.click('text=C’est parti'); await pg.click('.intro .btn'); await pg.click('.answer >> nth=0'); await pg.click('text=Valider');
    await pg.click('text=Attribuer les points'); await pg.locator('.pchip .minus').nth(0).click();
    assert.equal((await st(pg)).players[0].score, 0);
    await pg.click('text=Revoir l’explication'); assert.ok(await vis(pg, '.zwhy')); await pg.click('text=Attribuer les points');
    // rechargement : état conservé
    await pg.reload(); await pg.waitForTimeout(200); assert.equal((await st(pg)).screen, 'question');
    await pg.close();

    /* ---- 3) mode collectif ---- */
    pg = await newPage(browser, { width: 1280, height: 720 });
    await pg.click('text=Commencer le quiz'); await pg.click('text=Jouer tous ensemble'); await pg.waitForTimeout(200);
    const g = await playAll(pg, true);
    assert.equal(g.seen.between, 0, 'pas de classement en mode collectif');
    assert.ok(await pg.locator('text=BRAVO À TOUS').count()); assert.equal(await pg.locator('.pod').count(), 0);
    assert.equal(await pg.locator('text=Classement').count(), 0);
    assert.deepEqual(pg.errs, []); await pg.close();

    /* ---- 4) 20 participants : aucun chevauchement en phase d'attribution ---- */
    pg = await newPage(browser);
    const many = 'Marie Jean Monique Pierre Jeannine Robert Colette Georges Huguette Lucien Yvonne Marcel Paulette André Simone Henri Odette Raymond Madeleine Jean-Pierre'.split(' ');
    await addPlayers(pg, many); await pg.click('text=C’est parti'); await pg.click('.intro .btn');
    for (const idx of [0, 1, 5, 19, 33, 35]) {
      await pg.evaluate(i => window.__quiz.jump(i), idx);
      if (await vis(pg, 'text=Afficher les choix')) await pg.click('text=Afficher les choix');
      await pg.click((Q[idx].kind === 'two' ? '.tfbtn' : '.answer') + ' >> nth=0'); await pg.click('text=Valider');
      await pg.click('text=Attribuer les points'); await pg.waitForTimeout(150);
      const m = await pg.evaluate(() => { const a = document.querySelector('.award').getBoundingClientRect(), l = document.querySelector('.rev .left').getBoundingClientRect(), g = document.querySelector('.grid');
        return { top: a.top, left: l.bottom, bottom: a.bottom, scroll: g.scrollHeight > g.clientHeight + 2 }; });
      assert.ok(m.left <= m.top + 2, `chevauchement q${idx + 1}: ${m.left} > ${m.top}`); assert.ok(m.bottom <= 1081); assert.ok(!m.scroll);
    }
    await pg.close();

    /* ---- 5) images réelles (intros de manche, questions) + décor de secours si absente ---- */
    pg = await newPage(browser);
    await addPlayers(pg, NAMES); await pg.click('text=C’est parti');
    const loaded = sel => pg.waitForFunction(s => { const i = document.querySelector(s); return i && i.complete && i.naturalWidth > 0; }, sel, { timeout: 5000 }).then(() => true).catch(() => false);
    assert.equal(await pg.locator('.intro .photo.fallback').count(), 1, 'intro manche 1 : décor OBEO');
    const fs2 = require('node:fs');
    for (const q of Q) {
      await pg.evaluate(i => window.__quiz.jump(i), q.n); await pg.waitForTimeout(250);
      const sel = q.think ? '.lookphoto' : '.qside .photo';
      if (!(await pg.locator(sel).count())) continue; // vrai/faux sans image : pas d'emplacement
      const file = path.join(imgDir, decodeURIComponent(q.image).replace(/^assets\/images\//, ''));
      const exists = fs2.existsSync(file);
      if (exists) assert.ok(await loaded(sel + ' img'), 'image chargée : ' + q.id);
      else assert.equal(await pg.locator(sel + '.fallback').count(), 1, 'décor de secours : ' + q.id);
      if (exists) { const alt = await pg.locator(sel + ' img').getAttribute('alt'); assert.ok(/^Illustration/.test(alt), 'alt générique ' + q.id); }
    }
    for (const n of [24, 25, 26, 27]) { await pg.evaluate(i => window.__quiz.jump(i, 'choose'), n); await pg.waitForTimeout(250); assert.ok(await loaded('.qside .photo img'), 'Q' + (n + 1) + ' : chimpanzé / fourmis / axolotl / abeilles'); }
    await pg.evaluate(() => window.__quiz.jump(28, 'choose')); await pg.waitForTimeout(250);
    assert.equal(await pg.locator('.qside .photo.fallback').count(), 1, 'Q29 sans image : décor OBEO');
    await pg.close();

    /* ---- 6) MODE TEST ANIMATEUR ---- */
    pg = await newPage(browser);
    const before = await pg.evaluate(() => localStorage.getItem('obeo-quiz-animaux-v1'));
    assert.ok(await vis(pg, '.testlink'), 'accès discret au mode test');
    assert.ok(await pg.locator('.testlink').evaluate(e => parseFloat(getComputedStyle(e).opacity)) < 0.5, 'bouton discret');
    await pg.click('.testlink'); await pg.waitForTimeout(200);
    assert.ok(await pg.locator('text=Mode test animateur').count()); assert.ok(await vis(pg, '#testbar'));
    assert.equal((await st(pg)).players.length, 4, 'participants de test');
    assert.equal(await pg.locator('.tmq').count(), 36, '36 boutons d’accès direct');
    assert.equal(await pg.locator('.tmq.bonus').count(), 6);
    // chapitre 4 → intro
    await pg.click('.tmbtn >> text=M. 4'); await pg.waitForTimeout(150);
    assert.match(await pg.locator('.chnum').innerText(), /MANCHE 4/); assert.equal((await st(pg)).idx, M.chapters[3].start);
    await pg.click('.intro .btn'); assert.equal((await st(pg)).screen, 'question');
    // question suivante / précédente
    const i0 = (await st(pg)).idx; await pg.click('#tb-next'); assert.equal((await st(pg)).idx, i0 + 1); await pg.click('#tb-prev'); assert.equal((await st(pg)).idx, i0);
    assert.ok(await pg.locator('.testtag').count(), 'étiquette de test (id, type, points)');
    // accès direct à une question bonus (n° 34)
    await pg.click('#tb-menu'); await pg.click('.tmq >> nth=33'); await pg.waitForTimeout(120);
    assert.equal((await st(pg)).idx, 33); assert.ok(await vis(pg, '.bonus'));
    // classement
    await pg.click('#tb-rank'); await pg.waitForTimeout(150); assert.ok(await vis(pg, '.rank'));
    await pg.click('text=Retour au quiz'); await pg.waitForTimeout(150);
    assert.equal((await st(pg)).screen, 'testmenu', 'retour au menu de test');
    // podium direct (scores d'essai générés automatiquement)
    await pg.click('text=Podium (progressif)'); await pg.waitForTimeout(200); assert.ok(await vis(pg, '.podium'));
    await pg.click('#tb-next', { trial: true }).catch(() => {});
    await pg.click('#tb-menu'); await pg.click('text=Classement Q12'); await pg.waitForTimeout(150); assert.match(await pg.locator('.rsub').innerText(), /question 12/i);
    await pg.click('#tb-menu'); await pg.click('text=Classement Q24'); await pg.waitForTimeout(150); assert.match(await pg.locator('.rsub').innerText(), /question 24/i);
    await pg.click('#tb-menu'); await pg.click('.tmrow .btn >> text=Finale'); await pg.waitForTimeout(150); assert.match(await pg.locator('.chnum').innerText(), /MANCHE 6/);
    await pg.click('#tb-menu'); await pg.click('.tmrow .btn >> text=Accueil'); await pg.waitForTimeout(150); assert.equal((await st(pg)).screen, 'home');
    await pg.click('#tb-menu');
    // rien n'a été sauvegardé en mode test
    assert.equal(await pg.evaluate(() => localStorage.getItem('obeo-quiz-animaux-v1')), before, 'mode test non sauvegardé');
    await pg.click('#tb-exit'); await pg.waitForTimeout(150);
    const s3 = await st(pg); assert.equal(s3.screen, 'home'); assert.equal(s3.players.length, 0); assert.equal(s3.test, false);
    assert.ok(await pg.locator('#testbar').evaluate(e => e.hidden));
    assert.deepEqual(pg.errs, []); await pg.close();

    console.log(JSON.stringify(report));
    console.log('E2E ANIMAUX OK');
  } finally { await browser.close(); }
})().catch(e => { console.error('E2E ANIMAUX ÉCHEC:', e.message); process.exit(1); });
