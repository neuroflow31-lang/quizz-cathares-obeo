/* Test de bout en bout du « Grand Pendu OBEO » (navigateur réel, ouverture directe file:// par défaut).
   node tests/e2e-pendu.cjs [chemin-playwright]     PENDU_URL=… pour tester une autre adresse (ex. la version autonome). */
const assert = require('node:assert/strict');
const path = require('node:path');
const pw = require(process.argv[2] || 'playwright');
const URL = process.env.PENDU_URL || 'file://' + path.join(__dirname, '..', 'pendu', 'index.html');
const E = require('../pendu/js/engine.js'), D = require('../pendu/js/data.js');
const W = D.MATCHS;

async function newPage(browser, vp) {
  const pg = await browser.newPage({ viewport: vp || { width: 1920, height: 1080 } });
  pg.errs = []; pg.reqs = [];
  pg.on('pageerror', e => pg.errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error') pg.errs.push(m.text()); });
  pg.on('request', r => { if (!/^(file|data|blob):/.test(r.url()) && !/localhost/.test(r.url())) pg.reqs.push(r.url()); });
  await pg.goto(URL); await pg.evaluate(() => localStorage.clear()); await pg.reload(); await pg.waitForTimeout(200);
  return pg;
}
const st = pg => pg.evaluate(() => JSON.parse(JSON.stringify(window.__pendu.state)));
const txt = (pg, sel) => pg.locator(sel).first().innerText();
const wrong = word => 'ZYXWVKJQFGHDB'.split('').filter(L => E.needed(word).indexOf(L) < 0);
// aucun élément visible ne sort de la scène 1920×1080 ; le clavier est entièrement visible
async function noOverflow(pg, label) {
  const bad = await pg.evaluate(() => {
    const st = document.getElementById('stage').getBoundingClientRect(), sc = st.width / 1920, out = [];
    document.querySelectorAll('#stage .key, #stage .word span, #stage .hint, #stage .result, #stage .potential, #stage .hintbtn, #stage .ctx, #stage .btn, #stage .head > *, #stage .drawcard, #stage .recap div')
      .forEach(e => { const r = e.getBoundingClientRect(); if (!r.width) return;
        if (r.left < st.left - 1 || r.right > st.right + 1 || r.top < st.top - 1 || r.bottom > st.bottom + 1) out.push(e.className + ' ' + (e.textContent || '').slice(0, 20)); });
    const kb = document.querySelector('.keyboard'), h = document.querySelector('.right');
    if (kb && h && h.getBoundingClientRect().bottom > kb.getBoundingClientRect().top + 1) out.push('chevauchement indices / clavier');
    const lastHint = [...document.querySelectorAll('.hints .hint')].pop();
    if (kb && lastHint && lastHint.getBoundingClientRect().bottom > kb.getBoundingClientRect().top - 4) out.push('indice sur le clavier');
    return out;
  });
  assert.deepEqual(bad, [], 'débordement ' + label);
}

(async () => {
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => pw.chromium.launch());
  try {
    /* ---- 1) partie complète : 20 matchs, barème 5/3/1/0, transitions, final ---- */
    let pg = await newPage(browser);
    assert.match(await txt(pg, 'h1'), /LE GRAND PENDU OBEO/);
    assert.ok(await pg.locator('text=20 mots à retrouver ensemble').count() && await pg.locator('text=4 manches · 100 points possibles · 1 seule équipe').count());
    await pg.click('text=Commencer la partie'); await pg.waitForTimeout(150);
    assert.match(await txt(pg, '.trans .next'), /MANCHE 1/);
    const plan = i => i === 19 ? 0 : [5, 3, 1, 0][i % 4]; // 0 = échec ; le dernier mot échoué
    let total = 0, done = 0;
    for (let i = 0; i < 20; i++) {
      if (await pg.locator('.trans').count()) {
        const no = W[i].manche;
        if (no > 1) assert.match(await txt(pg, '.trans .gscore'), new RegExp((no === 4 ? 'Score actuel' : 'Score général') + ' : ' + total + ' / ' + (no - 1) * 25));
        assert.match(await txt(pg, '.trans .next'), no === 4 ? /GRANDE FINALE/ : new RegExp('MANCHE ' + no));
        if (no === 4) assert.ok(await pg.locator('text=5 derniers mots').count());
        await pg.click('.trans .btn'); await pg.waitForTimeout(100);
      }
      const w = W[i].word;
      assert.equal(await txt(pg, '.head .where'), 'MANCHE ' + W[i].manche + ' — MATCH ' + (i + 1));
      assert.equal(await txt(pg, '.ctx small'), 'PETIT INDICE DE CONTEXTE');
      assert.equal(await txt(pg, '.ctx span'), W[i].context);
      assert.equal(await pg.locator('.cat').count() + await pg.locator('text=/Catégorie/i').count(), 0, 'plus d’ancienne catégorie');
      if (await pg.evaluate(() => { const c = document.querySelector('.ctx span'), r = document.querySelector('.right'); return c.scrollWidth > c.clientWidth + 1 || c.getBoundingClientRect().right > r.getBoundingClientRect().right + 1 || c.getBoundingClientRect().height > 100; })) throw new Error('phrase de contexte débordante : match ' + (i + 1));
      assert.equal(await pg.locator('.word span').count(), Array.from(w).length);
      assert.equal(await pg.locator('.word span.hide').count(), Array.from(w).length, 'mot masqué au départ');
      assert.equal(await pg.locator('.key').count(), 26);
      assert.match(await txt(pg, '.potential'), /Points possibles : 5/);
      assert.match(await txt(pg, '.errtxt'), /Erreurs : 0 \/ 7/);
      if (i === 0 || i === 16) await noOverflow(pg, 'match ' + (i + 1));
      const p = plan(i);
      // indices selon le barème visé
      if (p === 3 || p === 1) { await pg.click('text=INDICE 1'); assert.match(await txt(pg, '.potential'), /Points possibles : 3/); assert.match(await txt(pg, '.hint.h1'), new RegExp(W[i].hint1.slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); }
      if (p === 1) { await pg.click('text=INDICE 2'); assert.match(await txt(pg, '.potential'), /Points possibles : 1/); assert.ok(await pg.locator('.hint.h2').count()); }
      if (i === 0) { // indice 2 indisponible avant l'indice 1
        assert.ok(await pg.locator('.hintbtn >> nth=1').isDisabled());
      }
      // une mauvaise lettre : désactivée, erreur +1, jamais comptée deux fois
      const bad = wrong(w);
      await pg.click('.key[data-l=' + bad[0] + ']');
      assert.match(await txt(pg, '.errtxt'), /Erreurs : 1 \/ 7/);
      assert.ok(await pg.locator('.key[data-l=' + bad[0] + ']').isDisabled(), 'lettre jouée indisponible');
      await pg.keyboard.press(bad[0].toLowerCase()); // même lettre au clavier physique
      assert.match(await txt(pg, '.errtxt'), /Erreurs : 1 \/ 7/, 'pas de double comptage');
      if (p === 0) {
        for (let k = 1; k < 7; k++) { await pg.click('.key[data-l=' + bad[k] + ']'); }
        assert.ok(await pg.locator('text=Dommage !').count(), 'échec à 7 erreurs');
        assert.equal(await pg.locator('.word span.miss').count(), Array.from(w).filter(c => E.isLetter(c)).length, 'mot révélé');
      } else {
        for (const L of E.needed(w)) {
          const before = await pg.locator('.word span:not(.hide)').count();
          await pg.click('.key[data-l=' + L + ']');
          if (await pg.locator('.result').count()) break;
          const occ = Array.from(w).filter(c => E.norm(c) === L).length;
          assert.equal(await pg.locator('.word span:not(.hide)').count(), before + occ, 'toutes les occurrences de ' + L + ' (' + w + ')');
        }
        assert.ok(await pg.locator('text=BRAVO !').count(), 'victoire ' + w);
      }
      total += p; done++;
      assert.equal(await txt(pg, '.result .full'), w, 'mot complet avec accents');
      assert.equal(await txt(pg, '.result .ms'), 'Score du match : ' + p + ' / 5');
      assert.equal(await txt(pg, '.result .g'), 'Score général : ' + total + ' / ' + done * 5);
      await pg.waitForTimeout(1300);
      assert.ok(await pg.locator('.savez.show').count(), 'Le saviez-vous ? affiché');
      assert.equal(await txt(pg, '.savez p'), W[i].anecdote);
      if (i === 6) { // reprise après rechargement en plein match suivant
        await pg.click('.nextbtn'); await pg.click('.key[data-l=' + wrong(W[7].word)[0] + ']');
        await pg.reload(); await pg.waitForTimeout(300);
        assert.ok(await pg.locator('text=Reprendre la partie en cours').count(), 'reprise proposée');
        assert.ok(await pg.locator('text=Nouvelle partie').count());
        await pg.click('text=Reprendre la partie en cours'); await pg.waitForTimeout(150);
        const s = await st(pg); assert.equal(s.idx, 7); assert.equal(s.matches[7].errors, 1); assert.equal(s.matches[7].played.length, 1);
        assert.match(await txt(pg, '.errtxt'), /Erreurs : 1 \/ 7/);
        assert.equal(await txt(pg, '.gscore'), 'Score général : ' + total + ' / ' + done * 5, 'score général conservé');
        // on termine le match 8 normalement (le plan démarre déjà avec une erreur jouée)
        for (const L of E.needed(W[7].word)) { await pg.click('.key[data-l=' + L + ']'); if (await pg.locator('.result').count()) break; }
        i = 7; total += 5; done++;
        assert.equal(await txt(pg, '.result .g'), 'Score général : ' + total + ' / ' + done * 5);
        // les plans des matchs suivants restent indexés sur i
      }
      await pg.click('.nextbtn'); await pg.waitForTimeout(120);
    }
    assert.ok(await pg.locator('.final').count(), 'écran final');
    assert.equal(await txt(pg, '.final .lab'), 'SCORE FINAL');
    assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), total + ' / 100');
    assert.equal(await txt(pg, '.final .appr'), E.appreciation(total));
    assert.equal(await pg.locator('.recap div').count(), 20);
    await noOverflow(pg, 'final');
    assert.deepEqual(pg.errs, []); assert.deepEqual(pg.reqs, []);
    // partie terminée : plus de reprise proposée ; nouvelle partie
    await pg.reload(); await pg.waitForTimeout(200);
    assert.equal(await pg.locator('text=Reprendre la partie en cours').count(), 0);
    await pg.close();

    /* ---- 2) accents : ÉPHÉMÈRE, PHYLACTÈRE, PÉRIPÉTIE (E révèle É/È) ---- */
    pg = await newPage(browser);
    await pg.click('.testlink'); await pg.waitForTimeout(100);
    for (const [n, word] of [[19, 'ÉPHÉMÈRE'], [16, 'PHYLACTÈRE'], [17, 'PÉRIPÉTIE'], [5, 'PANACHÉ']]) {
      await pg.click('#tb-menu'); await pg.click('.tmm >> nth=' + n); await pg.click('.key[data-l=E]');
      const shown = await pg.locator('.word span:not(.hide)').allInnerTexts();
      assert.deepEqual(shown, Array.from(word).filter(c => E.norm(c) === 'E'), 'accents ' + word);
      assert.match(await txt(pg, '.errtxt'), /Erreurs : 0 \/ 7/);
    }
    await pg.close();

    /* ---- 3) mode TEST ---- */
    pg = await newPage(browser);
    await pg.click('text=Commencer la partie'); await pg.click('.trans .btn'); await pg.click('.key[data-l=P]'); // partie réelle en cours
    const real = await pg.evaluate(() => localStorage.getItem('obeo-pendu-v1'));
    await pg.click('text=Accueil'); await pg.waitForTimeout(100);
    await pg.click('.testlink'); await pg.waitForTimeout(100);
    assert.ok(await pg.locator('text=Mode test animateur').count());
    assert.equal(await pg.locator('.tmm').count(), 20);
    await pg.click('.tmm >> nth=12'); assert.equal((await st(pg)).idx, 12);
    await pg.click('#tb-h1'); assert.match(await txt(pg, '.potential'), /Points possibles : 3/);
    await pg.click('#tb-h2'); assert.match(await txt(pg, '.potential'), /Points possibles : 1/);
    await pg.click('#tb-peek'); assert.equal(await txt(pg, '#tb-word'), 'ARTABAN');
    await pg.click('#tb-win'); assert.ok(await pg.locator('text=BRAVO !').count()); assert.equal(await txt(pg, '.result .ms'), 'Score du match : 1 / 5');
    await pg.click('#tb-next'); await pg.click('#tb-lose'); assert.ok(await pg.locator('text=Dommage !').count()); assert.equal(await txt(pg, '.result .ms'), 'Score du match : 0 / 5');
    await pg.click('#tb-prev'); assert.equal((await st(pg)).idx, 12);
    await pg.click('#tb-menu'); await pg.fill('.tmrow input', '42'); await pg.click('#tm-setscore');
    await pg.click('text=Après manche 2'); assert.match(await txt(pg, '.trans .gscore'), /Score général : 42 \/ 50/);
    await pg.click('#tb-menu'); await pg.click('text=Après manche 1'); assert.match(await txt(pg, '.trans .next'), /MANCHE 2/);
    await pg.click('#tb-menu'); await pg.click('.tmrow .btn >> text=Grande finale'); assert.match(await txt(pg, '.trans .gscore'), /Score actuel : 42 \/ 75/);
    await noOverflow(pg, 'grande finale');
    await pg.click('#tb-menu'); await pg.click('text=Écran final'); assert.equal((await txt(pg, '.final .big')).replace(/\s+/g, ' '), '42 / 100'); assert.equal(await txt(pg, '.final .appr'), 'Belle équipe !');
    assert.equal(await pg.evaluate(() => localStorage.getItem('obeo-pendu-v1')), real, 'mode test : partie réelle intacte');
    await pg.click('#tb-exit'); await pg.waitForTimeout(150);
    assert.ok(await pg.locator('#testbar').evaluate(e => e.hidden));
    assert.ok(await pg.locator('text=Reprendre la partie en cours').count(), 'partie réelle toujours proposée');
    // nouvelle partie (avec confirmation)
    await pg.click('text=Nouvelle partie'); await pg.click('text=Oui, nouvelle partie'); await pg.waitForTimeout(100);
    const s = await st(pg); assert.equal(s.idx, 0); assert.ok(s.matches.every(m => m.played.length === 0)); assert.equal(s.screen, 'trans');
    assert.deepEqual(pg.errs, []); await pg.close();

    /* ---- 4) affichage : 16:9 (720p), 4:3, portrait — tout reste dans la scène ---- */
    for (const vp of [{ width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 800, height: 1100 }]) {
      pg = await newPage(browser, vp);
      await pg.click('text=Commencer la partie'); await pg.click('.trans .btn'); await pg.click('text=INDICE 1'); await pg.click('text=INDICE 2');
      await noOverflow(pg, vp.width + 'x' + vp.height);
      await pg.close();
    }
    console.log('E2E PENDU OK');
  } finally { await browser.close(); }
})().catch(e => { console.error('E2E PENDU ÉCHEC:', e.message); process.exit(1); });
