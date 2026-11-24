/* Test de bout en bout de « Les jeux de votre enfance » (ouverture directe file:// par défaut).
   node tests/e2e-enfance.cjs [chemin-playwright]     ENFANCE_URL=… pour tester une autre adresse (ex. la version autonome). */
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const pw = require(process.argv[2] || 'playwright');
const DIR = path.join(__dirname, '..', 'enfance');
const URL = process.env.ENFANCE_URL || 'file://' + path.join(DIR, 'index.html');
const E = require('../enfance/js/engine.js'), D = require('../enfance/js/data.js');
const Q = D.DEFIS, KEY = 'obeo-enfance-v1', L = ['A', 'B', 'C'];
const ok = i => L.indexOf(Q[i].answer);

async function newPage(browser, vp, url) {
  const pg = await browser.newPage({ viewport: vp || { width: 1920, height: 1080 } });
  pg.errs = []; pg.reqs = [];
  pg.on('pageerror', e => pg.errs.push(e.message));
  // une image qNN.jpg absente produit un « Failed to load resource » : attendu tant que le pack d'images n'est pas livré
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) pg.errs.push(m.text()); });
  pg.on('request', r => { if (!/^(file|data|blob):/.test(r.url()) && !/localhost/.test(r.url())) pg.reqs.push(r.url()); });
  await pg.goto(url || URL); await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(200);
  return pg;
}
const st = pg => pg.evaluate(() => JSON.parse(JSON.stringify(window.__enfance.state)));
const txt = (pg, sel) => pg.locator(sel).first().innerText();
async function noOverflow(pg, label) {
  const bad = await pg.evaluate(() => {
    const S = document.getElementById('stage').getBoundingClientRect(), out = [];
    document.querySelectorAll('#stage .photo, #stage .answer, #stage .qtext, #stage .zone, #stage .verdict, #stage .nextrow, #stage .btn, #stage .head > *, #stage .dominoes, #stage .situation, #stage .recap div').forEach(e => {
      const r = e.getBoundingClientRect(); if (!r.width) return;
      if (r.left < S.left - 1 || r.right > S.right + 1 || r.top < S.top - 1 || r.bottom > S.bottom + 1) out.push(e.className + ' ' + (e.textContent || '').slice(0, 15));
    });
    for (const col of document.querySelectorAll('.leftcol, .rightcol')) { const C = col.getBoundingClientRect(); [...col.children].forEach(e => { const r = e.getBoundingClientRect(); if (r.bottom > C.bottom + 1 || r.right > C.right + 1) out.push('hors colonne : ' + e.className); }); }
    return out;
  });
  assert.deepEqual(bad, [], 'débordement ' + label);
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => pw.chromium.launch());
  try {
    /* ---- 1) partie complète : +5 / +0, transitions /25 /50 /75, final /100 ---- */
    let pg = await newPage(browser);
    assert.match(await txt(pg, 'h1'), /LES JEUX DE VOTRE ENFANCE/);
    await pg.click('text=Commencer la partie'); assert.match(await txt(pg, '.trans .next'), /MANCHE 1/);
    let total = 0;
    for (let i = 0; i < 20; i++) {
      if (await pg.locator('.trans').count()) {
        const no = Q[i].manche;
        if (no > 1) {
          assert.equal(await txt(pg, '.trans .done'), 'FIN DE LA MANCHE ' + (no - 1));
          assert.match(await txt(pg, '.trans .gscore'), new RegExp('SCORE' + (no > 2 ? ' GÉNÉRAL' : '') + ' : ' + total + ' / ' + (no - 1) * 25));
          if (no === 4) { assert.match(await txt(pg, '.trans .next'), /GRANDE FINALE/); assert.equal(await txt(pg, '.trans h1'), 'Les experts des jeux d’autrefois'); }
          await pg.click('text=Continuer');
        } else await pg.click('.trans .btn');
      }
      assert.equal(await txt(pg, '.head .where'), 'MANCHE ' + Q[i].manche + ' — DÉFI ' + (i + 1));
      assert.equal(await txt(pg, '.gscore'), 'Score général : ' + total + ' / ' + i * 5);
      assert.equal(await pg.locator('.answer').count(), 3);
      assert.equal(await txt(pg, '.qtext'), Q[i].question);
      // aucun spoiler avant validation
      const body = await pg.locator('#stage').innerText();
      assert.ok(!body.includes(Q[i].explain) && !/Bonne réponse/.test(body) && await pg.locator('.answer.good, .answer.bad, .zone').count() === 0, 'spoiler défi ' + (i + 1));
      assert.equal(await pg.locator('.validate').getAttribute('aria-disabled'), 'true', 'validation impossible sans choix');
      // image : affichée avant la question, sauf si elle montrerait la réponse (décor OBEO jusqu'à la validation)
      const shownImg = () => pg.waitForFunction(() => { const x = document.querySelector('.photo .pic'); return x && x.complete && x.naturalWidth > 0; }, null, { timeout: 4000 }).then(() => true).catch(() => false);
      if (Q[i].imageAfter) assert.equal(await pg.locator('.photo .pic').count(), 0, 'image-réponse cachée avant validation : défi ' + (i + 1));
      else assert.ok(await shownImg(), 'image du défi ' + (i + 1));
      if (i < 3 || i === 13 || i === 19) await noOverflow(pg, 'défi ' + (i + 1));
      const good = i % 3 !== 2; // un défi sur trois raté volontairement
      const pick = good ? ok(i) : (ok(i) + 1) % 3;
      await pg.click('.answer >> nth=' + ((pick + 1) % 3)); await pg.click('.answer >> nth=' + pick); // changement d'avis avant validation
      assert.equal(await pg.locator('.answer.sel').count(), 1);
      assert.equal(await pg.locator('.zone').count(), 0, 'sélection sans révélation');
      await pg.click('.validate');
      total += good ? 5 : 0;
      assert.equal(await txt(pg, '.verdict'), good ? 'Bonne réponse ! +5 points' : 'Ce n’était pas la bonne réponse · 0 point');
      assert.equal(await pg.locator('.answer.good').count(), 1); assert.equal(await txt(pg, '.answer.good .tx'), Q[i].choices[ok(i)]);
      assert.equal(await pg.locator('.answer.bad').count(), good ? 0 : 1);
      assert.equal(await txt(pg, '.zexp p'), Q[i].explain);
      assert.ok(await shownImg(), 'image affichée à la révélation : défi ' + (i + 1));
      assert.equal(await pg.locator('.zrel').count(), Q[i].relance ? 1 : 0, 'relance défi ' + (i + 1));
      if (Q[i].relance) assert.equal(await txt(pg, '.zrel p'), Q[i].relance);
      assert.equal(await txt(pg, '.nextrow .gnow'), 'Score général : ' + total + ' / ' + (i + 1) * 5);
      // aucun double comptage
      await pg.keyboard.press('a'); assert.equal((await st(pg)).matches[i].score, good ? 5 : 0);
      if (i < 3 || i === 13 || i === 19) await noOverflow(pg, 'révélation ' + (i + 1));
      if (i === 8) { // rechargement : reprise
        await pg.reload(); await pg.waitForTimeout(200);
        assert.ok(await pg.locator('text=Reprendre la partie').count() && await pg.locator('text=Nouvelle partie').count());
        await pg.click('text=Reprendre la partie');
        assert.equal(await txt(pg, '.nextrow .gnow'), 'Score général : ' + total + ' / 45');
        const s = await st(pg); assert.equal(s.idx, 8); assert.equal(s.matches.filter(m => m.status === 'done').length, 9);
      }
      await pg.click('.nextbtn'); await pg.waitForTimeout(60);
    }
    assert.equal(await txt(pg, '.final .ftitle'), 'LES JEUX DE VOTRE ENFANCE');
    assert.equal(await txt(pg, '.final .lab'), 'SCORE FINAL');
    assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), total + ' / 100');
    assert.equal(await txt(pg, '.final .appr'), E.appreciation(total));
    assert.equal(await txt(pg, '.final .thanks'), 'Merci pour tous vos souvenirs.');
    await noOverflow(pg, 'final');
    assert.deepEqual(pg.errs, []); assert.deepEqual(pg.reqs, []);
    await pg.reload(); await pg.waitForTimeout(150); assert.equal(await pg.locator('text=Reprendre la partie').count(), 0);
    await pg.close();

    /* ---- 2) score maximum 100 (clavier A/B/C + Entrée) ---- */
    pg = await newPage(browser);
    await pg.click('text=Commencer la partie');
    for (let i = 0; i < 20; i++) {
      if (await pg.locator('.trans').count()) await pg.click('.trans .btn');
      await pg.keyboard.press(Q[i].answer.toLowerCase()); await pg.keyboard.press('Enter'); await pg.click('.nextbtn');
    }
    assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), '100 / 100'); assert.equal(await txt(pg, '.final .appr'), 'Mémoire exceptionnelle !');
    await pg.close();

    /* ---- 3) mode TEST (partie réelle intacte) ---- */
    pg = await newPage(browser);
    await pg.click('text=Commencer la partie'); await pg.click('.trans .btn'); await pg.click('.answer >> nth=0'); await pg.click('.validate');
    const real = await pg.evaluate(k => localStorage.getItem(k), KEY);
    await pg.click('text=Accueil'); await pg.click('.testlink');
    assert.equal(await pg.locator('.tmm').count(), 20);
    await pg.click('.tmm >> nth=11'); assert.equal((await st(pg)).idx, 11);
    await pg.click('#tb-C'); assert.equal(await txt(pg, '.verdict'), 'Bonne réponse ! +5 points', 'choix forcé C (défi 12)');
    await pg.click('#tb-next'); await pg.click('#tb-bad'); assert.match(await txt(pg, '.verdict'), /0 point/);
    await pg.click('#tb-next'); await pg.click('#tb-good'); assert.equal(await txt(pg, '.nextrow .gnow'), 'Score général : 10 / 15');
    await pg.click('#tb-good'); assert.equal(await txt(pg, '.nextrow .gnow'), 'Score général : 10 / 15', 'aucun double comptage');
    await pg.click('#tb-menu'); await pg.fill('.tmrow input', '40'); await pg.click('#tm-setscore');
    await pg.click('text=Après manche 1'); assert.match(await txt(pg, '.trans .gscore'), /SCORE : 25 \/ 25/);
    await pg.click('#tb-menu'); await pg.click('text=Après manche 2'); assert.match(await txt(pg, '.trans .gscore'), /\/ 50/);
    await pg.click('#tb-menu'); await pg.click('.tmrow .btn >> text=Grande finale'); assert.match(await txt(pg, '.trans .gscore'), /SCORE GÉNÉRAL : 40 \/ 75/);
    await pg.click('#tb-menu'); await pg.click('text=Écran final'); assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), '40 / 100'); assert.equal(await txt(pg, '.final .appr'), 'Belle mémoire collective !');
    assert.equal(await pg.evaluate(k => localStorage.getItem(k), KEY), real, 'partie réelle intacte');
    await pg.click('#tb-exit'); assert.ok(await pg.locator('text=Reprendre la partie').count());
    await pg.click('text=Nouvelle partie'); await pg.click('text=Oui, nouvelle partie');
    assert.ok((await st(pg)).matches.every(m => m.status === 'playing'));
    assert.deepEqual(pg.errs, []); await pg.close();

    /* ---- 4) affichage des 20 défis (avant et après révélation) en 16:9 et 4:3 ---- */
    for (const vp of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
      pg = await newPage(browser, vp); await pg.click('.testlink');
      for (let i = 0; i < 20; i++) { await pg.click('#tb-menu').catch(() => {}); await pg.click('.tmm >> nth=' + i); await noOverflow(pg, 'défi ' + (i + 1)); await pg.click('#tb-bad'); await pg.waitForTimeout(80); await noOverflow(pg, 'révélation ' + (i + 1) + ' ' + vp.width); }
      await pg.close();
    }

    /* ---- 5) images : décor OBEO provisoire si une image qNN.jpg manque (filet de sécurité) ---- */
    if (!process.env.ENFANCE_URL) {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'enfance-img-'));
      fs.cpSync(DIR, tmp, { recursive: true }); fs.rmSync(path.join(tmp, 'assets', 'images', 'q03.jpg'));
      pg = await newPage(browser, null, 'file://' + path.join(tmp, 'index.html')); await pg.click('.testlink'); await pg.click('.tmm >> nth=2'); await pg.waitForTimeout(500);
      assert.equal(await pg.locator('.photo.fallback').count(), 1, 'q03.jpg absente → décor OBEO');
      await pg.close(); fs.rmSync(tmp, { recursive: true, force: true });
    }
    console.log('E2E ENFANCE OK');
  } finally { await browser.close(); }
})().catch(e => { console.error('E2E ENFANCE ÉCHEC:', e.message); process.exit(1); });
