/* « Les jeux de votre enfance » — jeu collectif OBEO : une seule équipe, 20 défis, 4 manches, 100 points.
   L'animateur sélectionne la réponse proposée par le groupe puis la valide : bonne réponse = 5 points.
   Aucune dépendance, aucun serveur nécessaire (ouverture directe de index.html). Règles : js/engine.js · Contenu : js/data.js */
(function () {
  'use strict';
  var E = window.EnfanceEngine, D = window.EnfanceData;
  var CFG = D.CONFIG, MANCHES = D.MANCHES, DEFIS = D.DEFIS, N = DEFIS.length;
  var KEY = 'obeo-enfance-v1';
  var stage = document.getElementById('stage');
  var testbar = document.getElementById('testbar');

  /* ---------- état ---------- */
  function fresh() {
    return { screen: 'home', idx: 0, matches: DEFIS.map(function () { return E.fresh(); }), adjust: 0, trans: 1, sound: true, test: false };
  }
  var state = fresh();
  var saved = null;   // partie réelle sauvegardée (proposée à la reprise)
  // pas de sauvegarde en mode test (la partie réelle reste intacte), ni sur l'accueil (la partie en cours y est proposée à la reprise)
  function save() { if (state.test || state.screen === 'home' || state.screen === 'testmenu') return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function readSave() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && Array.isArray(s.matches) && s.matches.length === N && typeof s.idx === 'number' && s.idx >= 0 && s.idx < N && !s.test) return s;
    } catch (e) {}
    return null;
  }
  function inProgress(s) { return !!s && s.screen !== 'home' && s.screen !== 'final' && s.screen !== 'testmenu'; }

  /* ---------- scores ---------- */
  function finished() { return state.matches.filter(function (m) { return m.status !== 'playing'; }); }
  // score général : défis joués (jusqu'au défi « upto » inclus si précisé) + correction manuelle éventuelle (mode test)
  function general(upto) {
    var lim = upto == null ? N - 1 : upto;
    var sum = state.matches.reduce(function (a, m, i) { return a + (i <= lim && m.status !== 'playing' ? m.score : 0); }, 0) + (state.adjust || 0);
    return Math.max(0, Math.min((lim + 1) * E.MATCH_MAX, sum));
  }
  function generalText() { return general() + ' / ' + finished().length * E.MATCH_MAX; }
  function mancheOf(i) { return DEFIS[i].manche; }
  function firstOf(no) { for (var i = 0; i < N; i++) if (mancheOf(i) === no) return i; return 0; }
  function lastOf(no) { var l = 0; for (var i = 0; i < N; i++) if (mancheOf(i) === no) l = i; return l; }

  /* ---------- helpers DOM ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      [].concat(c).forEach(function (x) { if (x != null && x !== false) el.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    }
    return el;
  }
  var ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4zM17 9l4 6M21 9l-4 6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  };
  function icon(n) { return h('span', { html: ICON[n], 'aria-hidden': 'true', style: 'display:inline-flex' }); }
  function logo() { return h('img', { class: 'logo', src: 'assets/logo/obeo-logo.png', alt: 'OBEO Résidences — Le bien-être à portée de main' }); }
  function leaves(style) {
    return h('div', { class: 'leaves', 'aria-hidden': 'true', style: style, html:
      '<svg viewBox="0 0 220 200" width="100%" height="100%"><path d="M10 190C0 110 50 40 130 30c10 80-30 150-120 160z" fill="#DA8548"/>' +
      '<path d="M70 195C60 140 100 90 170 85c5 60-30 105-100 110z" fill="#247F78" opacity=".92"/><path d="M130 190c-5-40 20-70 70-75 3 40-20 70-70 75z" fill="#DA8548" opacity=".7"/></svg>' });
  }

  /* ---------- son discret (Web Audio, aucun fichier) ---------- */
  var actx = null;
  function tone(freqs, dur) {
    if (!state.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * dur * 0.8;
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.05);
      });
    } catch (e) {}
  }

  /* ---------- échelle de la scène ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var x = (window.innerWidth - 1920 * s) / 2, y = (window.innerHeight - 1080 * s) / 2;
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  document.addEventListener('fullscreenchange', fit);
  function toggleFull() {
    var d = document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else { var e = d.documentElement; (e.requestFullscreen || e.webkitRequestFullscreen).call(e); }
    } catch (err) {}
  }


  /* ---------- navigation ---------- */
  var animate = true;     // fondu d'entrée seulement au changement d'écran
  function show(node) { if (!animate) node.style.animation = 'none'; stage.innerHTML = ''; stage.appendChild(node); animate = true; save(); drawTestbar(); }
  function go(screen) { state.screen = screen; render(); }
  function render() {
    stopConfetti();
    ({ home: home, trans: trans, match: match, final: finalScreen, testmenu: testMenu }[state.screen] || home)();
  }
  function header() {
    var d = DEFIS[state.idx];
    return h('div', { class: 'head' }, logo(),
      h('div', { class: 'where', text: 'MANCHE ' + d.manche + ' — DÉFI ' + (state.idx + 1) }),
      h('div', { class: 'grow' }),
      h('div', { class: 'pill green gscore', text: 'Score général : ' + generalText() }),
      h('button', { class: 'icon-btn', onclick: function () { state.sound = !state.sound; save(); animate = false; render(); }, 'aria-label': state.sound ? 'Couper le son' : 'Activer le son' }, icon(state.sound ? 'sound' : 'mute'), state.sound ? 'Son' : 'Muet'),
      h('button', { class: 'icon-btn', onclick: toggleFull, 'aria-label': 'Plein écran' }, icon('full'), 'Plein écran'),
      h('button', { class: 'icon-btn', onclick: function () { go('home'); }, 'aria-label': 'Retour à l’accueil (la partie est conservée)' }, icon('home'), 'Accueil'));
  }

  /* ---------- image 16:9 du défi : assets/images/qNN.jpg, décor OBEO provisoire si absente ---------- */
  function imgPath(i) { return CFG.imagesDir + 'q' + (i < 9 ? '0' : '') + (i + 1) + '.jpg'; }
  function imageBox(i) {
    var box = h('div', { class: 'photo fallback' },
      h('img', { class: 'mark', src: 'assets/logo/obeo-clover-mark.png', alt: '' }),
      h('div', { class: 'num', text: String(i + 1), 'aria-hidden': 'true' }));
    var src = imgPath(i);
    if (src) {
      var img = h('img', { class: 'pic', src: src, alt: 'Illustration du défi ' + (i + 1) });
      img.addEventListener('load', function () { box.classList.remove('fallback'); });
      img.addEventListener('error', function () { img.remove(); });
      box.appendChild(img);
    }
    return box;
  }

  /* ---------- accueil ---------- */
  function home() {
    saved = state.test ? null : readSave();
    var resume = inProgress(saved) ? saved : null;
    var actions;
    if (resume) {
      var done = resume.matches.filter(function (m) { return m.status !== 'playing'; });
      var pts = done.reduce(function (a, m) { return a + m.score; }, 0) + (resume.adjust || 0);
      actions = h('div', { class: 'actions a-up d3' },
        h('div', { class: 'resume' }, 'Une partie est en cours : ', h('b', { text: 'défi ' + (resume.idx + 1) + ' sur ' + N }), ' · score général ', h('b', { text: Math.max(0, pts) + ' / ' + done.length * E.MATCH_MAX })),
        h('button', { class: 'btn', onclick: resumeGame }, 'Reprendre la partie', icon('arrow')),
        h('button', { class: 'btn outline small', onclick: askNew }, 'Nouvelle partie'));
    } else actions = h('div', { class: 'actions a-up d3' }, h('button', { class: 'btn', onclick: newGame }, 'Commencer la partie', icon('arrow')));
    // marelle tracée à la craie (décor de l'accueil)
    var hop = h('div', { class: 'hop' });
    [['1', 330, 600], ['2', 330, 480], ['3', 270, 360], ['4', 390, 360], ['5', 330, 240], ['6', 270, 120], ['7', 390, 120]].forEach(function (c) {
      hop.appendChild(h('span', { style: 'left:' + c[1] + 'px;top:' + c[2] + 'px', text: c[0] }));
    });
    hop.appendChild(h('i', { class: 'ciel', text: 'CIEL' }));
    hop.appendChild(h('b', { class: 'palet' }));
    var s = h('div', { class: 'screen home' },
      h('div', { class: 'art a-zoom' }, hop),
      leaves('left:-30px;bottom:-20px;width:300px;height:270px;opacity:.95'),
      h('div', { class: 'col' },
        h('div', { class: 'a-up d1' }, logo()),
        h('h1', { class: 'title-serif a-up d2', text: CFG.title }),
        h('div', { class: 'rule a-up d2' }),
        h('p', { class: 'sub a-up d2', text: CFG.subtitle }),
        h('p', { class: 'tag a-up d2', text: CFG.tagline }),
        h('div', { class: 'place a-up d2', text: CFG.venue }),
        actions),
      h('button', { class: 'testlink', 'aria-label': 'Mode test animateur', title: 'Mode test animateur', onclick: enterTest }, icon('gear')));
    show(s);
  }
  function newGame() { var snd = state.sound; state = fresh(); state.sound = snd; state.trans = 1; go('trans'); }
  function resumeGame() { state = saved; saved = null; render(); }
  function askNew() {
    var box = h('div', { class: 'confirm' }, h('div', { class: 'box' },
      h('h2', { text: 'Commencer une nouvelle partie ?' }), h('p', { text: 'La partie en cours et son score seront effacés.' }),
      h('div', { class: 'row' },
        h('button', { class: 'btn outline small', onclick: function () { box.remove(); } }, 'Non, garder'),
        h('button', { class: 'btn small orange', onclick: newGame }, 'Oui, nouvelle partie'))));
    stage.appendChild(box);
  }

  /* ---------- transitions entre manches ---------- */
  function trans() {
    var no = state.trans, M = MANCHES[no - 1], prev = no - 1;
    var s = h('div', { class: 'screen trans' + (M.finale ? ' finale' : '') }, M.finale ? h('div', { class: 'rays' }) : leaves('right:-20px;bottom:-20px;width:300px;height:270px;opacity:.9'));
    var c = h('div', { class: 'center' });
    if (prev) {
      c.appendChild(h('div', { class: 'done a-up', text: 'FIN DE LA MANCHE ' + prev }));
      c.appendChild(h('div', { class: 'gscore pop', html: (prev === 1 ? 'SCORE : ' : 'SCORE GÉNÉRAL : ') + '<b>' + general(lastOf(prev)) + '</b> / ' + prev * 5 * E.MATCH_MAX }));
    }
    c.appendChild(h('div', { class: 'next a-up d2', text: M.finale ? 'GRANDE FINALE' : 'MANCHE ' + no }));
    c.appendChild(h('h1', { class: 'title-serif a-up d2', text: M.title }));
    if (!prev) c.appendChild(h('div', { class: 'done a-up d3', text: '5 défis · 5 points par bonne réponse' }));
    c.appendChild(h('div', { class: 'a-up d3' }, h('button', { class: 'btn' + (M.finale ? ' orange' : ''), onclick: function () { state.idx = firstOf(no); go('match'); } },
      prev ? 'Continuer' : 'Commencer', icon('arrow'))));
    s.appendChild(c);
    show(s);
    if (prev) startConfetti(M.finale ? 110 : 40);
  }

  /* ---------- défi ---------- */
  var LETTERS = ['A', 'B', 'C'];
  var selected = null;     // proposition retenue par le groupe (avant validation)
  function correctOf(i) { return LETTERS.indexOf(DEFIS[i].answer); }
  function match() {
    var i = state.idx, d = DEFIS[i], m = state.matches[i], done = m.status !== 'playing', ok = correctOf(i);
    var s = h('div', { class: 'screen match qcm' + (done ? ' rev' : '') });
    s.appendChild(header());
    // colonne gauche : image 16:9 puis, après validation, la révélation
    var left = h('div', { class: 'leftcol' }, imageBox(i));
    if (!done) left.appendChild(h('p', { class: 'talk', text: 'Prenez le temps d’en discuter ensemble, puis choisissez la réponse du groupe.' }));
    else {
      left.appendChild(h('div', { class: 'verdict pop ' + (m.score ? 'good' : 'bad'), text: m.score ? 'Bonne réponse ! +5 points' : 'Ce n’était pas la bonne réponse · 0 point' }));
      left.appendChild(h('div', { class: 'zone zexp' }, h('h2', { text: '💡 Explication' }), h('p', { text: d.explain })));
      if (d.relance) left.appendChild(h('div', { class: 'zone zrel' }, h('h2', { text: '🗣️ Et vous ?' }), h('p', { text: d.relance })));
      var last = i === N - 1, lastInManche = i === lastOf(d.manche);
      left.appendChild(h('div', { class: 'nextrow' },
        h('div', { class: 'gnow', text: 'Score général : ' + generalText() }),
        h('button', { class: 'btn orange nextbtn', onclick: next }, last ? 'Voir le score final' : lastInManche ? 'Fin de la manche ' + d.manche : 'Défi suivant', icon('arrow'))));
    }
    s.appendChild(left);
    // colonne droite : question et propositions
    var right = h('div', { class: 'rightcol' }, h('div', { class: 'kicker', text: d.title }));
    if (d.situation) right.appendChild(h('div', { class: 'situation' }, h('b', { text: 'Situation : ' }), d.situation));
    right.appendChild(h('h1', { class: 'qtext', text: d.question }));
    if (d.dominoes) {
      var chain = h('div', { class: 'dominoes', 'aria-label': 'Chaîne de dominos' });
      d.dominoes.forEach(function (p, k) {
        if (k) chain.appendChild(h('span', { class: 'arr', text: '→' }));
        chain.appendChild(h('div', { class: 'domino' }, h('span', { text: String(p[0]) }), h('span', { class: p[1] == null ? 'q' : '', text: p[1] == null ? '?' : String(p[1]) })));
      });
      right.appendChild(chain);
    }
    var answers = h('div', { class: 'answers' });
    var validate = h('button', { class: 'btn validate', 'aria-disabled': selected == null ? 'true' : 'false', onclick: function () { if (selected != null) validateChoice(selected); } }, 'Valider la réponse du groupe', icon('arrow'));
    d.choices.forEach(function (c, k) {
      var cl = 'answer' + (c.length > 46 ? ' long' : ''), tag = null;
      if (done) {
        cl += ' locked';
        if (k === ok) { cl += ' good'; tag = h('span', { class: 'tag', text: '✓ Bonne réponse' }); }
        else if (k === m.choice) { cl += ' bad'; tag = h('span', { class: 'tag', text: '✗ Réponse du groupe' }); }
      } else if (k === selected) cl += ' sel';
      var b = h('button', { class: cl, 'data-k': LETTERS[k], disabled: done ? 'disabled' : null, 'aria-pressed': !done && k === selected ? 'true' : 'false',
        onclick: done ? null : function () { selected = k; Array.prototype.forEach.call(answers.children, function (x, j) { x.classList.toggle('sel', j === k); x.setAttribute('aria-pressed', j === k ? 'true' : 'false'); }); validate.setAttribute('aria-disabled', 'false'); } },
        h('span', { class: 'lt', text: LETTERS[k] }), h('span', { class: 'tx', text: c }), tag);
      answers.appendChild(b);
    });
    right.appendChild(answers);
    if (!done) right.appendChild(h('div', { class: 'qactions' }, validate));
    s.appendChild(right);
    show(s);
    if (state.test) s.appendChild(h('div', { class: 'testtag', text: 'TEST · défi ' + (i + 1) + ' · bonne réponse ' + d.answer }));
  }
  function validateChoice(k) {
    var m = state.matches[state.idx];
    if (!E.answer(m, k, correctOf(state.idx))) return;
    selected = null;
    if (m.score) tone([523, 659, 784], 0.16); else tone([330, 262], 0.2);
    animate = false; match();
    if (m.score) startConfetti(state.idx === N - 1 ? 200 : 50);
  }
  function next() {
    var i = state.idx, d = DEFIS[i];
    selected = null;
    if (i >= N - 1) { go('final'); return; }
    if (i === lastOf(d.manche)) { state.trans = d.manche + 1; state.idx = i + 1; go('trans'); return; }
    state.idx = i + 1; go('match');
  }

  /* ---------- écran final ---------- */
  function finalScreen() {
    var score = general();
    var recap = h('div', { class: 'recap a-up d3' });
    DEFIS.forEach(function (d, i) {
      var m = state.matches[i];
      recap.appendChild(h('div', { class: m.score ? '' : 'z', title: d.title }, h('b', { text: (m.status === 'playing' ? '–' : m.score) + ' / 5' }), 'Défi ' + (i + 1)));
    });
    var s = h('div', { class: 'screen final festive' },
      h('div', { class: 'rays' }),
      h('div', { class: 'head' }, logo()),
      h('div', { class: 'center' },
        h('div', { class: 'ftitle a-up', text: CFG.title }),
        h('div', { class: 'lab a-up d1', text: 'SCORE FINAL' }),
        h('div', { class: 'big pop', html: score + '<small> / ' + N * E.MATCH_MAX + '</small>' }),
        h('div', { class: 'appr a-up d2', text: E.appreciation(score) }),
        recap,
        h('div', { class: 'thanks a-up d3', text: CFG.thanks }),
        h('div', { class: 'a-up d4' }, h('button', { class: 'btn', onclick: function () { if (state.test) { go('testmenu'); return; } newGame(); } }, 'Nouvelle partie', icon('arrow')))),
      leaves('left:-30px;bottom:-20px;width:300px;height:270px;opacity:.9'), leaves('right:-30px;bottom:-20px;width:300px;height:270px;opacity:.9;transform:scaleX(-1)'));
    show(s);
    tone([523, 659, 784, 1046, 1318], 0.18);
    startConfetti(200);
  }

  /* ---------- confettis légers ---------- */
  var cv = document.getElementById('confetti'), raf = null;
  function startConfetti(count) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopConfetti();
    var dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var cols = ['#247F78', '#DA8548', '#E9DCC3', '#7FB8B1', '#F0C79E'], parts = [];
    for (var i = 0; i < count; i++) parts.push({ x: Math.random() * innerWidth, y: -Math.random() * innerHeight * 0.6, w: 8 + Math.random() * 8, h: 5 + Math.random() * 6,
      c: cols[i % cols.length], vy: 60 + Math.random() * 60, vx: -14 + Math.random() * 28, ph: Math.random() * 6 });
    var t0 = performance.now(), last = t0;
    (function tick(now) {
      var dt = Math.min((now - last) / 1000, .05), el = (now - t0) / 1000; last = now;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(function (p) {
        p.y += p.vy * dt; p.x += (p.vx + Math.sin(el * 2 + p.ph) * 16) * dt;
        ctx.globalAlpha = .8 * (el > 5 ? Math.max(0, 1 - (el - 5)) : 1); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.w, p.h);
      });
      if (el < 6) raf = requestAnimationFrame(tick); else stopConfetti();
    })(t0);
  }
  function stopConfetti() {
    if (raf) cancelAnimationFrame(raf); raf = null;
    var c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  }


  /* =====================================================================
     MODE TEST ANIMATEUR (roue crantée discrète en bas à gauche de l'accueil, ou touche T sur l'accueil)
     Partie d'essai séparée : la partie réelle sauvegardée n'est jamais modifiée.
     ===================================================================== */
  function enterTest() { var snd = state.sound; state = fresh(); state.sound = snd; state.test = true; go('testmenu'); }
  function exitTest() { testbar.hidden = true; var s = readSave(); state = s || fresh(); state.screen = 'home'; go('home'); }
  function toMatch(i) { i = Math.max(0, Math.min(N - 1, i)); state.idx = i; state.matches[i] = E.fresh(); selected = null; go('match'); }
  function toTrans(no) { state.trans = no; state.idx = firstOf(no); go('trans'); }
  function randomScores() {
    for (var i = 0; i < N; i++) { var m = E.fresh(); E.answer(m, Math.random() < .7 ? correctOf(i) : (correctOf(i) + 1) % 3, correctOf(i)); state.matches[i] = m; }
  }
  function drawTestbar() {
    if (!state.test) { testbar.hidden = true; return; }
    testbar.hidden = false; testbar.innerHTML = '';
    var b = function (t, fn, id) { var e = h('button', { type: 'button', text: t, onclick: fn }); if (id) e.id = id; return e; };
    testbar.appendChild(h('span', { class: 'tb-label', text: 'TEST' }));
    if (state.screen === 'match') {
      testbar.appendChild(b('◀ Préc.', function () { toMatch(state.idx - 1); }, 'tb-prev'));
      testbar.appendChild(b('Suiv. ▶', function () { toMatch(state.idx + 1); }, 'tb-next'));
      LETTERS.forEach(function (L, k) { testbar.appendChild(b('Choisir ' + L, function () { validateChoice(k); }, 'tb-' + L)); });
      testbar.appendChild(b('Bonne réponse', function () { validateChoice(correctOf(state.idx)); }, 'tb-good'));
      testbar.appendChild(b('Mauvaise réponse', function () { validateChoice((correctOf(state.idx) + 1) % 3); }, 'tb-bad'));
    }
    testbar.appendChild(b('Menu test', function () { go('testmenu'); }, 'tb-menu'));
    testbar.appendChild(b('Quitter le test', exitTest, 'tb-exit'));
  }
  function testMenu() {
    var s = h('div', { class: 'screen testmenu' },
      h('h1', { class: 'title-serif', text: 'Mode test animateur' }),
      h('p', { class: 'note', text: 'Partie d’essai séparée · rien n’est enregistré · la partie réelle en cours reste intacte · « Quitter le test » ramène à l’accueil.' }));
    MANCHES.forEach(function (M) {
      s.appendChild(h('h3', { text: 'Manche ' + M.no + ' — ' + M.title }));
      var row = h('div', { class: 'tmrow' });
      DEFIS.forEach(function (d, i) { if (d.manche === M.no) row.appendChild(h('button', { class: 'tmbtn tmm', onclick: function () { toMatch(i); } }, 'Défi ' + (i + 1), h('small', { text: d.title }))); });
      s.appendChild(row);
    });
    s.appendChild(h('h3', { text: 'Transitions et fin de partie' }));
    s.appendChild(h('div', { class: 'tmrow' },
      h('button', { class: 'btn small', onclick: function () { toTrans(1); } }, 'Début manche 1'),
      h('button', { class: 'btn small', onclick: function () { toTrans(2); } }, 'Après manche 1'),
      h('button', { class: 'btn small', onclick: function () { toTrans(3); } }, 'Après manche 2'),
      h('button', { class: 'btn small orange', onclick: function () { toTrans(4); } }, 'Grande finale'),
      h('button', { class: 'btn small orange', onclick: function () { go('final'); } }, 'Écran final')));
    var inp = h('input', { type: 'number', min: '0', max: '100', value: String(general()), 'aria-label': 'Score général' });
    s.appendChild(h('h3', { text: 'Score général (correction manuelle)' }));
    s.appendChild(h('div', { class: 'tmrow' }, inp,
      h('button', { class: 'btn small outline', id: 'tm-setscore', onclick: function () {
        var v = Math.max(0, Math.min(100, parseInt(inp.value, 10) || 0)); state.adjust = 0; state.adjust = v - general(); testMenu();
      } }, 'Fixer le score'),
      h('button', { class: 'btn small outline', onclick: function () { randomScores(); state.adjust = 0; testMenu(); } }, 'Scores d’essai aléatoires'),
      h('button', { class: 'btn small outline', onclick: function () { state.matches = fresh().matches; state.adjust = 0; testMenu(); } }, 'Remettre à zéro'),
      h('button', { class: 'btn small outline', onclick: exitTest }, 'Quitter le test')));
    show(s);
  }

  /* ---------- clavier ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (state.screen === 'home' && e.key.toLowerCase() === 't' && !inProgress(readSave())) { enterTest(); return; }
    if (state.screen !== 'match') return;
    var m = state.matches[state.idx], k = 'abc'.indexOf(e.key.toLowerCase());
    if (m.status === 'playing' && k >= 0 && e.key.length === 1) { var btn = stage.querySelectorAll('.answer')[k]; if (btn) btn.click(); return; }
    if (e.key === 'Enter' && (!document.activeElement || document.activeElement.tagName !== 'BUTTON')) { if (m.status === 'playing') { if (selected != null) validateChoice(selected); } else next(); }
  });

  /* ---------- démarrage : toujours l'accueil, avec reprise proposée si une partie est en cours ---------- */
  fit();
  var s0 = readSave();
  if (s0) state.sound = s0.sound !== false;
  render();
  window.__enfance = { get state() { return state; }, engine: E, data: D, general: general };
})();
