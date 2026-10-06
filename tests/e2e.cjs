/* Test de bout en bout (navigateur réel). Nécessite Playwright + Chromium :
   node scripts/serve.mjs . 5173 &   puis   node tests/e2e.cjs [chemin-playwright]   */
const assert = require('node:assert/strict');
const pw = require(process.argv[2] || 'playwright');
const URL = process.env.QUIZ_URL || 'http://localhost:5173/';
const NAMES = 'Marie Jean Monique Pierre Jeannine Robert Colette Georges Huguette Lucien Yvonne Marcel Paulette André Simone Henri Odette Raymond Madeleine Jean-Pierre'.split(' ');

async function newPage(browser, vp) {
  const pg = await browser.newPage({ viewport: vp || { width: 1920, height: 1080 } });
  pg.errs = []; pg.bad = [];
  pg.on('pageerror', e => pg.errs.push(e.message));
  pg.on('response', r => { if (r.status() >= 400) pg.bad.push(r.url()); });
  await pg.goto(URL); await pg.evaluate(() => localStorage.clear()); await pg.reload();
  return pg;
}
const st = pg => pg.evaluate(() => JSON.parse(JSON.stringify(window.__quiz.state)));

async function play(pg, { group }) {
  const log = { rounds: 0, between: 0, tfSeen: 0, bonusSeen: 0, lookSeen: 0, pointsGiven: 0 };
  for (let q = 1; q <= 25; q++) {
    if (await pg.locator('text=Commencer la manche').count()) { log.rounds++; await pg.click('text=Commencer la manche'); await pg.waitForTimeout(150); }
    if (await pg.locator('text=Afficher les réponses').count()) { log.lookSeen++; await pg.click('text=Afficher les réponses'); }
    const isTF = await pg.locator('.tfbtn').count();
    if (isTF) log.tfSeen++;
    if (await pg.locator('.bonus').count()) log.bonusSeen++;
    // clic sur une réponse : ne doit PAS révéler la bonne réponse
    await pg.click(isTF ? '.tfbtn >> nth=0' : '.answer >> nth=1');
    assert.equal(await pg.locator('.answer.good, .answer.bad').count(), 0, 'la bonne réponse ne doit pas apparaître avant validation');
    await pg.click('text=Valider la réponse'); await pg.waitForTimeout(120);
    assert.ok(await pg.locator('.answer.good').count() === 1, 'bonne réponse mise en évidence');
    assert.ok(await pg.locator('.savez').count() === 1, 'explication affichée');
    const step = (await st(pg)).idx >= 20 ? 2 : 1;
    if (!group) {
      const plus = pg.locator('.pchip .plus');
      await plus.nth(0).click(); await plus.nth(0).click(); // Marie : 2 clics
      await pg.locator('.pchip .minus').nth(0).click();      // correction : annule 1 clic
      await plus.nth(1).click();                              // Jean : 1 clic
      log.pointsGiven += step * 2;
      const label = await plus.nth(0).innerText();
      assert.match(label, new RegExp('\\+' + step), 'libellé du bouton de points');
    }
    const next = await pg.locator('.award .btn').innerText();
    await pg.click('.award .btn'); await pg.waitForTimeout(150);
    if (q === 8 || q === 13 || q === 20) {
      if (!group && (q === 13 || q === 20)) { // classement intermédiaire après la manche 2 et avant la finale
        assert.ok(await pg.locator('text=CLASSEMENT').count(), 'classement intermédiaire après q' + q);
        log.between++; await pg.click('text=Continuer'); await pg.waitForTimeout(150);
      }
      assert.match(await pg.locator('h1').first().innerText(), /MANCHE/i, 'intro de manche après q' + q);
    }
    if (q === 25) assert.match(next, group ? /Terminer/i : /classement final/i);
  }
  return log;
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => pw.chromium.launch());
  const results = {};

  /* ---- partie individuelle, 4 participants ---- */
  let pg = await newPage(browser);
  // toutes les images se chargent (et résolution réelle)
  const imgs = await pg.evaluate(async () => {
    const out = {};
    for (const [k, p] of Object.entries(window.QuizData.PHOTOS)) {
      out[k] = await new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth + 'x' + i.naturalHeight); i.onerror = () => r('ERREUR'); i.src = p.src; });
    }
    const l = await new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth + 'x' + i.naturalHeight); i.onerror = () => r('ERREUR'); i.src = 'assets/logo/obeo-logo.png'; });
    out.logo = l; return out;
  });
  Object.entries(imgs).forEach(([k, v]) => assert.notEqual(v, 'ERREUR', 'image ' + k));
  results.images = imgs;

  await pg.click('text=Commencer le quiz');
  for (const n of NAMES.slice(0, 4)) { await pg.fill('.add-row input', n); await pg.press('.add-row input', 'Enter'); }
  await pg.click('text=C’est parti'); await pg.waitForTimeout(300);
  assert.match(await pg.locator('h1').first().innerText(), /MANCHE 1/i);
  results.indiv = await play(pg, { group: false });
  assert.equal(results.indiv.rounds, 4); assert.equal(results.indiv.tfSeen, 7); assert.equal(results.indiv.lookSeen, 5);
   assert.equal(results.indiv.bonusSeen, 5, 'badge « QUESTION BONUS — 2 POINTS » sur les 5 questions de finale');
  // classement final animé puis podium
  assert.ok(await pg.locator('text=CLASSEMENT FINAL').count());
  await pg.waitForTimeout(4000);
  const s = await st(pg);
  // Marie : 1 point net sur 20 questions +1 ... (2 clics − 1 correction = 1 × step)
  assert.equal(s.players[0].score, 20 * 1 + 5 * 2, 'Marie : +1 ×20 puis +2 ×5');
  assert.equal(s.players[1].score, 30, 'Jean');
  assert.equal(s.players[2].score, 0);
  await pg.click('text=Voir le podium'); await pg.waitForTimeout(800);
  assert.equal(await pg.locator('.pod').count(), 2, 'podium : seuls les participants avec des points');
  assert.ok(await pg.locator('text=BRAVO À TOUS').count());
  assert.ok(await pg.locator('text=Merci pour votre participation').count());
  // rejouer : scores remis à zéro, prénoms conservés
  await pg.click('text=Rejouer'); await pg.waitForTimeout(300);
  const s2 = await st(pg); assert.equal(s2.players.length, 4); assert.ok(s2.players.every(p => p.score === 0)); assert.equal(s2.idx, 0);
  assert.deepEqual(pg.errs, []); assert.deepEqual(pg.bad, []);

  /* ---- correction −1 / −2 : jamais sous zéro, pas de pénalité ---- */
  await pg.click('text=C’est parti'); await pg.click('text=Commencer la manche');
  await pg.keyboard.press('a'); await pg.keyboard.press('Enter');
  await pg.locator('.pchip .minus').nth(0).click();
  assert.equal((await st(pg)).players[0].score, 0, 'le −1 ne descend jamais sous 0');
  await pg.locator('.pchip .plus').nth(0).click(); await pg.locator('.pchip .minus').nth(0).click();
  assert.equal((await st(pg)).players[0].score, 0);

  /* ---- rechargement : l'état est conservé ---- */
  await pg.keyboard.press('Escape'); await pg.reload(); await pg.waitForTimeout(300);
  assert.equal((await st(pg)).screen, 'question');

  /* ---- 20 participants : rien ne déborde ---- */
  pg = await newPage(browser);
  await pg.click('text=Commencer le quiz');
  for (const n of NAMES) { await pg.fill('.add-row input', n); await pg.press('.add-row input', 'Enter'); }
  await pg.click('text=C’est parti'); await pg.click('text=Commencer la manche');
  for (const idx of [0, 7, 9, 13, 20, 24]) { // inclut visuel + vrai/faux + finale
    await pg.evaluate(i => window.__quiz.jump(i, 'choose'), idx);
    if (await pg.locator('.tfbtn').count()) await pg.click('.tfbtn >> nth=1'); else await pg.click('.answer >> nth=0');
    await pg.click('text=Valider la réponse'); await pg.waitForTimeout(150);
    const m = await pg.evaluate(() => {
      const a = document.querySelector('.award').getBoundingClientRect();
      const stage = document.getElementById('stage').getBoundingClientRect();
      const rights = [...document.querySelectorAll('.rev .left, .rev .right')].map(e => e.getBoundingClientRect().bottom);
      const g = document.querySelector('.grid');
      return { awardTop: a.top, awardBottom: a.bottom, stageBottom: stage.bottom, maxContent: Math.max(...rights), gridScroll: g.scrollHeight > g.clientHeight + 2 };
    });
    assert.ok(m.maxContent <= m.awardTop + 2, `chevauchement à l'index ${idx}: contenu ${m.maxContent} / panneau ${m.awardTop}`);
    assert.ok(m.awardBottom <= m.stageBottom + 1); assert.ok(!m.gridScroll, 'grille des points sans défilement');
  }
  assert.deepEqual(pg.errs, []);

  /* ---- jeu collectif ---- */
  pg = await newPage(browser, { width: 1280, height: 720 });
  await pg.click('text=Commencer le quiz'); await pg.click('text=Jouer tous ensemble'); await pg.waitForTimeout(300);
  results.group = await play(pg, { group: true });
  assert.equal(await pg.locator('text=Classement').count(), 0);
  assert.ok(await pg.locator('text=BRAVO À TOUS').count());
  assert.equal(await pg.locator('.pod').count(), 0, 'pas de podium en jeu collectif');
  assert.deepEqual(pg.errs, []); assert.deepEqual(pg.bad, []);

  console.log(JSON.stringify(results, null, 1));
  console.log('E2E OK');
  await browser.close();
})().catch(e => { console.error('E2E ÉCHEC:', e.message); process.exit(1); });
