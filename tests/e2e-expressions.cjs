/* Test de bout en bout du quiz « Expressions françaises » (navigateur réel).
   node tests/e2e-expressions.cjs [chemin-playwright]      (ouverture directe file:// par défaut)
   QUIZ_URL=http://localhost:5173/expressions/index.html pour tester via un serveur. */
const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path'); const os = require('node:os');
const pw = require(process.argv[2] || 'playwright');
const DIR = path.join(__dirname, '..', 'expressions');
const URL = process.env.QUIZ_URL || 'file://' + path.join(DIR, 'index.html');
const KEY = 'obeo-quiz-expressions-v1';
const D = require('../expressions/js/quiz-data.js'), Mdl = require('../expressions/js/model.js');
const M = Mdl.build(D); const Q = M.questions;
const ends = M.chapters.map(c => c.start + c.count - 1);

async function newPage(browser, vp, url) {
  const pg = await browser.newPage({ viewport: vp || { width: 1920, height: 1080 } });
  pg.errs = []; pg.reqs = [];
  pg.on('pageerror', e => pg.errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error') pg.errs.push(m.text()); });
  pg.on('requestfailed', r => pg.errs.push('requête échouée : ' + r.url()));
  pg.on('request', r => { if (!/^(file|data):/.test(r.url()) && !/localhost/.test(r.url())) pg.reqs.push(r.url()); });
  await pg.goto(url || URL); await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(200);
  return pg;
}
const st = pg => pg.evaluate(() => JSON.parse(JSON.stringify(window.__quiz.state)));
const vis = (pg, sel) => pg.locator(sel).count().then(n => n > 0);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NAMES = ['Marie', 'Jean', 'Monique', 'Pierre'];
async function addPlayers(pg, names) {
  await pg.click('text=Commencer le quiz');
  for (const n of names) { await pg.fill('.add-row input', n); await pg.press('.add-row input', 'Enter'); }
}

async function playAll(pg, group) {
  const seen = { intros: 0, between: 0, bonus: 0, blocks: {} };
  const expect = [0, 0, 0, 0];
  for (let n = 0; n < Q.length; n++) {
    const q = Q[n];
    if (await vis(pg, '.intro')) {
      seen.intros++; assert.match(await pg.locator('.chnum').innerText(), new RegExp('MANCHE ' + q.chapterNo));
      assert.ok(await pg.waitForFunction(() => { const i = document.querySelector('.intro .photo img'); return i && i.complete && i.naturalWidth > 1000; }, null, { timeout: 5000 }).then(() => true).catch(() => false), 'image manche ' + q.chapterNo);
      if (q.chapterNo === 6 && !group) assert.ok(await pg.locator('text=FINALE — CHAQUE BONNE RÉPONSE VAUT 2 POINTS').count(), 'annonce finale');
      await pg.click('.intro .btn'); await pg.waitForTimeout(100);
    }
    assert.equal((await st(pg)).idx, n);
    assert.equal(await pg.locator('.kicker').innerText(), q.expression);
    if (q.points > 1) { seen.bonus++; assert.ok(await vis(pg, '.bonus'), 'badge 2 points ' + q.id); }
    // aucune réponse ni explication visible avant validation
    assert.equal(await pg.locator('.answer.good, .answer.bad, .zone').count(), 0, 'rien de révélé ' + q.id);
    await pg.click('text=Valider', { force: true }); assert.equal(await pg.locator('.answer.good').count(), 0, 'Valider sans choix');
    await pg.hover('.answer >> nth=0'); await pg.click('.answer >> nth=1');
    assert.equal(await pg.locator('.answer.good, .answer.bad, .zone').count(), 0, 'sélection sans validation ne révèle rien');
    await pg.click('text=Valider'); await pg.waitForTimeout(80);
    assert.equal(await pg.locator('.answer.good').count(), 1, 'bonne réponse révélée');
    assert.equal(await pg.locator('.answer.good .tx').innerText(), q.answers[q.correct]);
    assert.match(await pg.locator('.zrep p').innerText(), new RegExp('^' + esc(q.short)));
    const titles = await pg.locator('.qmain .zone h2').allInnerTexts();
    assert.deepEqual(titles, ['✅ Réponse'].concat(q.blocks.map(b => b.title)), 'blocs ' + q.id);
    q.blocks.forEach(b => { seen.blocks[b.key] = (seen.blocks[b.key] || 0) + 1; });
    if (!group) {
      assert.equal(await pg.locator('.award').count(), 0);
      await pg.click('text=Attribuer les points'); await pg.waitForTimeout(80);
      const plus = pg.locator('.pchip .plus'), minus = pg.locator('.pchip .minus');
      assert.equal(await plus.nth(0).innerText(), '+' + q.points);
      assert.equal(await minus.nth(0).innerText(), '−' + q.points);
      const s0 = (await st(pg)).players[0].score;
      await plus.nth(0).click(); assert.equal((await st(pg)).players[0].score, s0 + q.points, '+' + q.points);
      await plus.nth(0).click(); await minus.nth(0).click(); assert.equal((await st(pg)).players[0].score, s0 + q.points, '−' + q.points + ' (correction)');
      assert.match(await pg.locator('.pchip small').nth(0).innerText(), new RegExp('Score : ' + (s0 + q.points) + ' / 42'));
      expect[0] += q.points;
      if (n % 2 === 0) { await plus.nth(1).click(); expect[1] += q.points; }
      if (n % 5 === 0) { await plus.nth(2).click(); expect[2] += q.points; }
      await pg.click('.award .btn >> text=/suivant|classement|Manche/i');
    } else await pg.click('.nextbar .btn');
    await pg.waitForTimeout(100);
    if (!group && n < Q.length - 1 && M.config.rankingAfterChapters.some(c => ends[c - 1] === n)) {
      seen.between++;
      assert.ok(await vis(pg, '.rank'), 'classement après Q' + (n + 1));
      assert.match(await pg.locator('.rsub').innerText(), new RegExp('question ' + (n + 1)));
      assert.ok(await pg.locator('.rrow >> text=/ \\/ 42$/').count());
      await pg.click('text=Continuer'); await pg.waitForTimeout(100);
    }
  }
  return { seen, expect };
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => pw.chromium.launch());
  const report = {};
  try {
    /* ---- 1) mode individuel, 4 participants, 36 questions ---- */
    let pg = await newPage(browser);
    assert.match(await pg.locator('h1').innerText(), /EXPRESSIONS FRANÇAISES/);
    await pg.waitForTimeout(300);
    const loaded = (p, sel) => p.waitForFunction(s => { const i = document.querySelector(s); return i && i.complete && i.naturalWidth > 1000; }, sel, { timeout: 5000 }).then(() => true).catch(() => false);
    assert.ok(await loaded(pg, '.home .photo img'), 'accueil : hero-expressions.jpg');
    await addPlayers(pg, NAMES);
    await pg.click('text=C’est parti');
    const { seen, expect } = await playAll(pg, false);
    report.indiv = seen;
    assert.equal(seen.intros, 6); assert.equal(seen.between, 2); assert.equal(seen.bonus, 6);
    assert.ok(await pg.locator('text=VOYAGE TERMINÉ AU CŒUR DES EXPRESSIONS FRANÇAISES !').count(), 'titre final');
    assert.ok(await pg.locator('text=Classement complet').count());
    await pg.waitForTimeout(3500);
    assert.deepEqual(await pg.locator('.rrow .nm').allInnerTexts(), ['Marie — 42 / 42', 'Jean — ' + expect[1] + ' / 42', 'Monique — ' + expect[2] + ' / 42', 'Pierre — 0 / 42']);
    const s = await st(pg);
    assert.deepEqual(s.players.map(p => p.score), expect);
    assert.equal(expect[0], 42, 'score maximal 42');
    await pg.click('text=Voir le podium'); await pg.waitForTimeout(300);
    assert.equal(await pg.locator('.pod:not(.hide)').count(), 0, 'podium vide au départ');
    await pg.click('text=Révéler la 3e place'); await pg.waitForTimeout(150);
    assert.equal(await pg.locator('.pod.p3:not(.hide)').count(), 1); assert.equal(await pg.locator('.pod:not(.hide)').count(), 1);
    await pg.click('text=Révéler la 2e place'); await pg.waitForTimeout(150);
    assert.equal(await pg.locator('.pod.p2:not(.hide)').count(), 1); assert.equal(await pg.locator('.pod.p1:not(.hide)').count(), 0);
    await pg.click('text=Révéler la 1re place'); await pg.waitForTimeout(300);
    assert.equal(await pg.locator('.pod:not(.hide)').count(), 3);
    assert.equal(await pg.locator('.pod.p1 .nm').innerText(), 'Marie — 42 / 42');
    assert.equal(await pg.locator('.pod.p2 .nm').innerText(), 'Jean — ' + expect[1] + ' / 42');
    assert.equal(await pg.locator('.pod.p3 .nm').innerText(), 'Monique — ' + expect[2] + ' / 42');
    assert.ok(await pg.locator('.fullrank >> text=Marie — 42 / 42').count());
    // correction : jamais sous zéro ; reprise après rechargement
    await pg.click('text=Rejouer'); await pg.click('text=C’est parti'); await pg.click('.intro .btn');
    await pg.click('.answer >> nth=0'); await pg.click('text=Valider'); await pg.click('text=Attribuer les points');
    await pg.locator('.pchip .minus').nth(0).click(); assert.equal((await st(pg)).players[0].score, 0);
    await pg.reload(); await pg.waitForTimeout(200); assert.equal((await st(pg)).screen, 'question');
    assert.deepEqual(pg.errs, []); assert.deepEqual(pg.reqs, []); await pg.close();

    /* ---- 2) mode collectif ---- */
    pg = await newPage(browser, { width: 1280, height: 720 });
    await pg.click('text=Commencer le quiz'); await pg.click('text=Jouer tous ensemble'); await pg.waitForTimeout(200);
    const g = await playAll(pg, true);
    report.group = g.seen;
    assert.equal(g.seen.between, 0);
    assert.ok(await pg.locator('text=VOYAGE TERMINÉ AU CŒUR DES EXPRESSIONS FRANÇAISES !').count());
    assert.equal(await pg.locator('.pod').count(), 0);
    assert.deepEqual(pg.errs, []); await pg.close();

    /* ---- 3) 20 participants : attribution sans chevauchement ---- */
    pg = await newPage(browser);
    const many = 'Marie Jean Monique Pierre Jeannine Robert Colette Georges Huguette Lucien Yvonne Marcel Paulette André Simone Henri Odette Raymond Madeleine Jean-Pierre'.split(' ');
    await addPlayers(pg, many); await pg.click('text=C’est parti'); await pg.click('.intro .btn');
    for (const idx of [0, 7, 19, 26, 30, 35]) {
      await pg.evaluate(i => window.__quiz.jump(i), idx);
      await pg.click('.answer >> nth=0'); await pg.click('text=Valider'); await pg.click('text=Attribuer les points'); await pg.waitForTimeout(150);
      const m = await pg.evaluate(() => { const a = document.querySelector('.award').getBoundingClientRect(), l = document.querySelector('.rev .left').getBoundingClientRect(), g = document.querySelector('.grid');
        return { top: a.top, left: l.bottom, bottom: a.bottom, scroll: g.scrollHeight > g.clientHeight + 2 }; });
      assert.ok(m.left <= m.top + 2, `chevauchement Q${idx + 1}`); assert.ok(m.bottom <= 1081); assert.ok(!m.scroll);
    }
    await pg.close();

    /* ---- 4) MODE TEST ---- */
    pg = await newPage(browser);
    const before = await pg.evaluate(k => localStorage.getItem(k), KEY);
    await pg.click('.testlink'); await pg.waitForTimeout(200);
    assert.ok(await pg.locator('text=Mode test animateur').count()); assert.ok(await vis(pg, '#testbar'));
    assert.equal(await pg.locator('.tmq').count(), 36); assert.equal(await pg.locator('.tmq.bonus').count(), 6);
    for (let c = 0; c < 6; c++) {
      await pg.click('.tmbtn >> text=M. ' + (c + 1)); await pg.waitForTimeout(100);
      assert.match(await pg.locator('.chnum').innerText(), new RegExp('MANCHE ' + (c + 1))); await pg.click('#tb-menu');
    }
    for (let i = 0; i < 36; i++) {
      await pg.click('.tmq >> nth=' + i); await pg.waitForTimeout(60);
      assert.equal((await st(pg)).idx, i); assert.match(await pg.locator('.testtag').innerText(), new RegExp(Q[i].id + ' .* ' + Q[i].points + ' pt'));
      await pg.click('#tb-menu');
    }
    await pg.click('.tmq >> nth=10'); await pg.click('#tb-next'); assert.equal((await st(pg)).idx, 11); await pg.click('#tb-prev'); assert.equal((await st(pg)).idx, 10);
    await pg.click('#tb-menu'); await pg.click('text=Classement Q12'); await pg.waitForTimeout(150); assert.match(await pg.locator('.rsub').innerText(), /question 12/i);
    await pg.click('#tb-menu'); await pg.click('text=Classement Q24'); await pg.waitForTimeout(150); assert.match(await pg.locator('.rsub').innerText(), /question 24/i);
    await pg.click('#tb-menu'); await pg.click('.tmrow .btn >> text=Finale'); await pg.waitForTimeout(150); assert.match(await pg.locator('.chnum').innerText(), /MANCHE 6/);
    await pg.click('#tb-menu'); await pg.click('text=Classement final animé'); await pg.waitForTimeout(150);
    assert.ok(await pg.locator('text=VOYAGE TERMINÉ AU CŒUR DES EXPRESSIONS FRANÇAISES !').count());
    await pg.click('#tb-menu'); await pg.click('text=Podium (progressif)'); await pg.waitForTimeout(200);
    for (let k = 0; k < 3; k++) await pg.click('.podstep .btn');
    assert.equal(await pg.locator('.pod:not(.hide)').count(), 3); assert.match(await pg.locator('.pod.p1 .nm').innerText(), / — \d+ \/ 42$/);
    await pg.click('#tb-menu'); await pg.click('.tmrow .btn >> text=Accueil'); await pg.waitForTimeout(150); assert.equal((await st(pg)).screen, 'home');
    assert.equal(await pg.evaluate(k => localStorage.getItem(k), KEY), before, 'mode test non sauvegardé');
    await pg.click('#tb-menu'); await pg.click('#tb-exit'); await pg.waitForTimeout(150);
    const s3 = await st(pg); assert.equal(s3.screen, 'home'); assert.equal(s3.players.length, 0); assert.equal(s3.test, false);
    assert.deepEqual(pg.errs, []); await pg.close();

    /* ---- 5) images : décor de secours partout (aucune image fournie), image locale chargée si fournie ---- */
    pg = await newPage(browser);
    await addPlayers(pg, NAMES); await pg.click('text=C’est parti');
    const ld = sel => pg.waitForFunction(s => { const i = document.querySelector(s); return i && i.complete && i.naturalWidth > 1000; }, sel, { timeout: 5000 }).then(() => true).catch(() => false);
    for (const q of Q) {
      await pg.evaluate(i => window.__quiz.jump(i), q.n);
      assert.ok(await ld('.qside .photo img'), 'image ' + q.id);
      assert.equal(await pg.locator('.photo.fallback').count(), 0, 'aucun décor de secours ' + q.id);
      if (q.revealImage) {
        if (q.revealImage !== q.image) assert.equal(await pg.locator('img[src*="' + q.revealImage.split('/').pop() + '"]').count(), 0, 'vignette cachée avant validation ' + q.id);
        await pg.click('.answer >> nth=0'); await pg.click('text=Valider');
        assert.ok(await ld('.zrep .thumb'), 'image affichée après validation ' + q.id);
      }
    }
    assert.deepEqual(pg.errs, []); await pg.close();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'expr-img-'));
    fs.cpSync(DIR, tmp, { recursive: true });
    const jpg = fs.readdirSync(path.join(DIR, '..', 'animaux', 'assets', 'images')).find(f => f.endsWith('.jpg'));
    fs.copyFileSync(path.join(DIR, '..', 'animaux', 'assets', 'images', jpg), path.join(tmp, 'assets', 'images', 'essai q1.jpg'));
    const dataF = path.join(tmp, 'js', 'quiz-data.js');
    fs.writeFileSync(dataF, fs.readFileSync(dataF, 'utf8').replace("points: 1,\n      image: \"manche1.jpg\" }", "points: 1,\n      image: 'essai q1.jpg' }").replace(/(\/\/ Q4 —[\s\S]*?image: )"manche1.jpg"/, "$1'absente.jpg'"));
    pg = await newPage(browser, null, 'file://' + path.join(tmp, 'index.html'));
    pg.errs.length = 0;
    await addPlayers(pg, NAMES); await pg.click('text=C’est parti'); await pg.click('.intro .btn');
    assert.ok(await pg.waitForFunction(() => { const i = document.querySelector('.qside .photo img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 5000 }).then(() => true).catch(() => false), 'image locale chargée');
    await pg.evaluate(() => window.__quiz.jump(3)); await pg.waitForTimeout(300);
    assert.equal(await pg.locator('.qside .photo.fallback').count(), 1, 'image absente => décor de secours');
    await pg.close(); fs.rmSync(tmp, { recursive: true, force: true });

    console.log(JSON.stringify(report));
    console.log('E2E EXPRESSIONS OK');
  } finally { await browser.close(); }
})().catch(e => { console.error('E2E EXPRESSIONS ÉCHEC:', e.message); process.exit(1); });
