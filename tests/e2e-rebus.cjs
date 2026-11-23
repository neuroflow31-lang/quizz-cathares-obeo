/* Test de bout en bout du « Grand Jeu des Rébus OBEO » (ouverture directe file:// par défaut).
   node tests/e2e-rebus.cjs [chemin-playwright]     REBUS_URL=… pour tester une autre adresse (ex. la version autonome). */
const assert = require('node:assert/strict');
const path = require('node:path');
const pw = require(process.argv[2] || 'playwright');
const URL = process.env.REBUS_URL || 'file://' + path.join(__dirname, '..', 'rebus', 'index.html');
const E = require('../rebus/js/engine.js'), D = require('../rebus/js/data.js');
const R = D.REBUS, KEY = 'obeo-rebus-v1';

async function newPage(browser, vp) {
  const pg = await browser.newPage({ viewport: vp || { width: 1920, height: 1080 } });
  pg.errs = []; pg.reqs = [];
  pg.on('pageerror', e => pg.errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error') pg.errs.push(m.text()); });
  pg.on('request', r => { if (!/^(file|data|blob):/.test(r.url()) && !/localhost/.test(r.url())) pg.reqs.push(r.url()); });
  await pg.goto(URL); await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(200);
  return pg;
}
const st = pg => pg.evaluate(() => JSON.parse(JSON.stringify(window.__rebus.state)));
const txt = (pg, sel) => pg.locator(sel).first().innerText();
async function noOverflow(pg, label) {
  const bad = await pg.evaluate(() => {
    const S = document.getElementById('stage').getBoundingClientRect(), out = [];
    document.querySelectorAll('#stage .rcard, #stage .scene .el, #stage .hint, #stage .controls > *, #stage .result, #stage .head > *, #stage .btn, #stage .recap div').forEach(e => {
      const r = e.getBoundingClientRect(); if (!r.width) return;
      if (r.left < S.left - 1 || r.right > S.right + 1 || r.top < S.top - 1 || r.bottom > S.bottom + 1) out.push(e.className + ' ' + (e.textContent || '').slice(0, 15));
    });
    const card = document.querySelector('.rcard'), hints = [...document.querySelectorAll('.hint')].pop(), ctl = document.querySelector('.controls');
    if (card) { const C = card.getBoundingClientRect(); document.querySelectorAll('.scene .el:not(.orbit)').forEach(e => { const r = e.getBoundingClientRect(); if (r.right > C.right + 2 || r.left < C.left - 2 || r.bottom > C.bottom + 2) out.push('visuel hors cadre'); }); }
    if (hints && ctl && hints.getBoundingClientRect().bottom > ctl.getBoundingClientRect().top) out.push('indices sur les boutons');
    return out;
  });
  assert.deepEqual(bad, [], 'débordement ' + label);
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => pw.chromium.launch());
  try {
    /* ---- 1) partie complète : barème 5/3/1/0, transitions /25 /50 /75, final /100 ---- */
    let pg = await newPage(browser);
    assert.match(await txt(pg, 'h1'), /LE GRAND JEU DES RÉBUS OBEO/);
    await pg.click('text=Commencer la partie'); assert.match(await txt(pg, '.trans .next'), /MANCHE 1/);
    const plan = i => [5, 3, 1, 0][i % 4];
    let total = 0;
    for (let i = 0; i < 20; i++) {
      if (await pg.locator('.trans').count()) {
        const no = R[i].manche;
        if (no > 1) { assert.equal(await txt(pg, '.trans .done'), 'FIN DE LA MANCHE ' + (no - 1)); assert.match(await txt(pg, '.trans .gscore'), new RegExp('Score : ' + total + ' / ' + (no - 1) * 25)); }
        await pg.click('.trans .btn');
      }
      assert.equal(await txt(pg, '.head .where'), 'MANCHE ' + R[i].manche + ' — RÉBUS ' + (i + 1));
      assert.equal(await txt(pg, '.gscore'), 'Score général : ' + total + ' / ' + i * 5);
      // aucune réponse affichée avant validation
      const body = await pg.locator('#stage').innerText();
      assert.ok(!body.includes(R[i].answer) && !body.includes(R[i].explain), 'réponse cachée rébus ' + (i + 1));
      assert.equal(await pg.locator('.result').count(), 0);
      assert.match(await txt(pg, '.potential'), /Points possibles : 5/);
      assert.ok(await pg.locator('.hintbtn >> nth=1').isDisabled(), 'indice 2 après indice 1');
      if (i === 0 || i === 3 || i === 17) await noOverflow(pg, 'rébus ' + (i + 1));
      const p = plan(i);
      if (p <= 3 && p > 0) { await pg.click('text=INDICE 1'); assert.match(await txt(pg, '.potential'), /Points possibles : 3/); assert.equal(await txt(pg, '.hint.h1'), 'Indice 1 :' + R[i].hint1); }
      if (p === 1) { await pg.click('text=INDICE 2'); assert.match(await txt(pg, '.potential'), /Points possibles : 1/); assert.ok(await pg.locator('.hint.h2').count()); await noOverflow(pg, 'indices rébus ' + (i + 1)); }
      if (p === 0) { await pg.click('.revealbtn'); await pg.click('text=Annuler'); assert.equal(await pg.locator('.result').count(), 0); await pg.click('.revealbtn'); await pg.click('#confirm-reveal'); assert.equal(await txt(pg, '.result h2'), 'La réponse était…'); }
      else { await pg.click('.foundbtn'); assert.equal(await txt(pg, '.result h2'), 'BRAVO !'); }
      total += p;
      assert.equal(await txt(pg, '.result .full'), R[i].answer);
      assert.equal(await txt(pg, '.result .explain'), R[i].explain);
      assert.equal(await txt(pg, '.result .ms'), 'Score du rébus : ' + p + ' / 5');
      assert.equal(await txt(pg, '.result .g'), 'Score général : ' + total + ' / ' + (i + 1) * 5);
      assert.ok(await pg.locator('.foundbtn').isDisabled() && await pg.locator('.revealbtn').isDisabled() && await pg.locator('.hintbtn:not([disabled])').count() === 0, 'rébus verrouillé');
      if (i === 9) { // rechargement : reprise proposée, état conservé
        await pg.reload(); await pg.waitForTimeout(200);
        assert.ok(await pg.locator('text=Reprendre la partie').count() && await pg.locator('text=Nouvelle partie').count());
        await pg.click('text=Reprendre la partie');
        assert.equal(await txt(pg, '.result .g'), 'Score général : ' + total + ' / 50');
        const s = await st(pg); assert.equal(s.idx, 9); assert.equal(s.matches.filter(m => m.status !== 'playing').length, 10);
      }
      await pg.click('.nextbtn'); await pg.waitForTimeout(80);
    }
    assert.ok(await pg.locator('.final').count());
    assert.equal(await txt(pg, '.final .ftitle'), 'LE GRAND JEU DES RÉBUS');
    assert.equal(await txt(pg, '.final .lab'), 'SCORE FINAL');
    assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), total + ' / 100');
    assert.equal(await txt(pg, '.final .appr'), E.appreciation(total));
    await noOverflow(pg, 'final');
    assert.deepEqual(pg.errs, []); assert.deepEqual(pg.reqs, []);
    await pg.reload(); await pg.waitForTimeout(150); assert.equal(await pg.locator('text=Reprendre la partie').count(), 0, 'partie terminée');
    await pg.close();

    /* ---- 2) score maximum 100 ---- */
    pg = await newPage(browser);
    await pg.click('text=Commencer la partie');
    for (let i = 0; i < 20; i++) { if (await pg.locator('.trans').count()) await pg.click('.trans .btn'); await pg.click('.foundbtn'); await pg.click('.foundbtn', { force: true }); await pg.click('.nextbtn'); }
    assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), '100 / 100'); assert.equal(await txt(pg, '.final .appr'), 'IMBATTABLES !');
    await pg.close();

    /* ---- 3) mode TEST (partie réelle intacte) ---- */
    pg = await newPage(browser);
    await pg.click('text=Commencer la partie'); await pg.click('.trans .btn'); await pg.click('text=INDICE 1');
    const real = await pg.evaluate(k => localStorage.getItem(k), KEY);
    await pg.click('text=Accueil'); await pg.click('.testlink');
    assert.equal(await pg.locator('.tmm').count(), 20);
    await pg.click('.tmm >> nth=15'); assert.equal((await st(pg)).idx, 15);
    await pg.click('#tb-h1'); assert.match(await txt(pg, '.potential'), /3/); await pg.click('#tb-h2'); assert.match(await txt(pg, '.potential'), /1/);
    await pg.click('#tb-found'); assert.equal(await txt(pg, '.result .ms'), 'Score du rébus : 1 / 5');
    await pg.click('#tb-next'); await pg.click('#tb-reveal'); assert.equal(await txt(pg, '.result .ms'), 'Score du rébus : 0 / 5');
    await pg.click('#tb-reveal'); await pg.click('#tb-found'); assert.equal(await txt(pg, '.result .g'), 'Score général : 1 / 10', 'aucun double comptage');
    await pg.click('#tb-menu'); await pg.fill('.tmrow input', '60'); await pg.click('#tm-setscore');
    await pg.click('text=Après manche 1'); assert.match(await txt(pg, '.trans .gscore'), /Score : 25 \/ 25/);
    await pg.click('#tb-menu'); await pg.click('text=Après manche 2'); assert.match(await txt(pg, '.trans .gscore'), /\/ 50/);
    await pg.click('#tb-menu'); await pg.click('.tmrow .btn >> text=Grande finale'); assert.match(await txt(pg, '.trans .gscore'), /Score : 59 \/ 75/); // 60 moins le point du rébus 16 (manche 4, pas encore jouée à ce stade)
    await pg.click('#tb-menu'); await pg.click('text=Écran final'); assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), '60 / 100'); assert.equal(await txt(pg, '.final .appr'), 'Très belle équipe !');
    assert.equal(await pg.evaluate(k => localStorage.getItem(k), KEY), real, 'partie réelle intacte');
    await pg.click('#tb-exit'); assert.ok(await pg.locator('text=Reprendre la partie').count());
    await pg.click('text=Nouvelle partie'); await pg.click('text=Oui, nouvelle partie');
    const s = await st(pg); assert.equal(s.screen, 'trans'); assert.ok(s.matches.every(m => m.status === 'playing' && m.hints === 0));
    assert.deepEqual(pg.errs, []); await pg.close();

    /* ---- 4) 20 visuels dans le cadre (1920×1080 et 1280×720) ---- */
    for (const vp of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
      pg = await newPage(browser, vp); await pg.click('.testlink');
      for (let i = 0; i < 20; i++) { await pg.click('#tb-menu').catch(() => {}); await pg.click('.tmm >> nth=' + i); await pg.click('#tb-h2'); await noOverflow(pg, 'rébus ' + (i + 1) + ' ' + vp.width); }
      await pg.close();
    }
    console.log('E2E REBUS OK');
  } finally { await browser.close(); }
})().catch(e => { console.error('E2E REBUS ÉCHEC:', e.message); process.exit(1); });
