/* « Le Grand Pendu OBEO » — jeu collectif : une seule équipe, 20 mots, 4 manches, 100 points.
   Aucune dépendance, aucun serveur nécessaire (ouverture directe de index.html). Règles : js/engine.js · Contenu : js/data.js */
(function () {
  'use strict';
  var E = window.PenduEngine, D = window.PenduData;
  var CFG = D.CONFIG, MANCHES = D.MANCHES, MATCHS = D.MATCHS, N = MATCHS.length;
  var KEY = 'obeo-pendu-v1';
  var ROWS = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ'];
  var stage = document.getElementById('stage');
  var testbar = document.getElementById('testbar');

  /* ---------- état ---------- */
  function fresh() {
    return { screen: 'home', idx: 0, matches: MATCHS.map(function () { return E.fresh(); }), adjust: 0, trans: 1, sound: true, test: false };
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
  // score général : matchs terminés (jusqu'au match « upto » inclus si précisé) + correction manuelle éventuelle
  function general(upto) {
    var lim = upto == null ? N - 1 : upto;
    var sum = state.matches.reduce(function (a, m, i) { return a + (i <= lim && m.status !== 'playing' ? m.score : 0); }, 0) + (state.adjust || 0);
    return Math.max(0, Math.min((lim + 1) * E.MATCH_MAX, sum));
  }
  function generalText() { var d = finished().length * E.MATCH_MAX; return d ? general() + ' / ' + d : general() + ' point' + (general() > 1 ? 's' : ''); }
  function mancheOf(i) { return MATCHS[i].manche; }
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

  /* ---------- personnage : 7 étapes, une par erreur (jamais morbide : à la 7e, la pluie tombe sur la promenade) ---------- */
  var STEPS = [
    '<path d="M20 372 Q200 318 380 372 L380 400 L20 400 Z" fill="#9CCB8A"/><path d="M60 360 q8-20 16 0 M300 350 q8-20 16 0" stroke="#5E9E52" stroke-width="5" fill="none" stroke-linecap="round"/>',
    '<path d="M150 330 Q148 230 200 222 Q252 230 250 330 Z" fill="#247F78"/><path d="M178 240 L200 270 L222 240" fill="none" stroke="#DCEFE8" stroke-width="6" stroke-linejoin="round"/>',
    '<circle cx="200" cy="180" r="46" fill="#F6DEC4"/><circle cx="184" cy="174" r="5" fill="#292927"/><circle cx="216" cy="174" r="5" fill="#292927"/><path d="M183 194 Q200 208 217 194" stroke="#B85A1B" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="172" cy="190" r="7" fill="#F0B79A" opacity=".7"/><circle cx="228" cy="190" r="7" fill="#F0B79A" opacity=".7"/>',
    '<path d="M154 250 Q118 270 112 300" stroke="#247F78" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M246 250 Q284 262 296 228" stroke="#247F78" stroke-width="18" fill="none" stroke-linecap="round"/><circle cx="112" cy="304" r="11" fill="#F6DEC4"/><circle cx="297" cy="222" r="11" fill="#F6DEC4"/>',
    '<path d="M180 328 L172 366" stroke="#5F5C56" stroke-width="18" stroke-linecap="round"/><path d="M220 328 L230 366" stroke="#5F5C56" stroke-width="18" stroke-linecap="round"/><ellipse cx="166" cy="370" rx="20" ry="9" fill="#292927"/><ellipse cx="238" cy="370" rx="20" ry="9" fill="#292927"/>',
    '<path d="M150 146 L250 146 L240 138 L160 138 Z" fill="#B85A1B"/><path d="M168 138 Q166 100 200 98 Q234 100 232 138 Z" fill="#DA8548"/><rect x="167" y="124" width="66" height="9" fill="#B85A1B"/>',
    '<g class="rain"><path d="M118 92 a34 34 0 0 1 58-28 a42 42 0 0 1 78 10 a30 30 0 0 1 22 56 H130 a32 32 0 0 1-12-38z" fill="#A7B3B5"/>' +
      '<path d="M150 140 l-8 18 M190 140 l-8 18 M230 140 l-8 18 M262 140 l-8 18" stroke="#6E9FB8" stroke-width="6" stroke-linecap="round"/></g>'
  ];
  function drawing(errors, fresh) {
    var svg = '<svg viewBox="0 0 400 400" role="img" aria-label="Erreurs : ' + errors + ' sur ' + E.MAX_ERRORS + '">' +
      '<circle cx="330" cy="70" r="34" fill="#F6C89A" opacity="' + (errors >= E.MAX_ERRORS ? 0 : .9) + '"/>';
    STEPS.forEach(function (s, i) {
      if (i < errors) svg += '<g class="st' + (fresh && i === errors - 1 ? ' pop' : '') + '" style="transform-origin:200px 250px">' + s + '</g>';
    });
    if (!errors) svg += '<text x="200" y="230" text-anchor="middle" font-size="26" font-weight="700" fill="#5F5C56" font-family="Segoe UI, Arial, sans-serif">Aucune erreur pour l’instant</text>';
    return svg + '</svg>';
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
  var animate = true;     // fondu d'entrée seulement au changement d'écran (pas à chaque lettre)
  function show(node) { if (!animate) node.style.animation = 'none'; stage.innerHTML = ''; stage.appendChild(node); animate = true; save(); drawTestbar(); }
  function go(screen) { state.screen = screen; render(); }
  function render() {
    stopConfetti();
    ({ home: home, trans: trans, match: match, final: finalScreen, testmenu: testMenu }[state.screen] || home)();
  }
  function header() {
    var m = MATCHS[state.idx];
    return h('div', { class: 'head' }, logo(),
      h('div', { class: 'where', text: 'MANCHE ' + m.manche + ' — MATCH ' + (state.idx + 1) }),
      h('div', { class: 'grow' }),
      h('div', { class: 'pill green gscore', text: 'Score général : ' + generalText() }),
      h('button', { class: 'icon-btn', onclick: function () { state.sound = !state.sound; save(); animate = false; render(); }, 'aria-label': state.sound ? 'Couper le son' : 'Activer le son' }, icon(state.sound ? 'sound' : 'mute'), state.sound ? 'Son' : 'Muet'),
      h('button', { class: 'icon-btn', onclick: toggleFull, 'aria-label': 'Plein écran' }, icon('full'), 'Plein écran'),
      h('button', { class: 'icon-btn', onclick: function () { go('home'); }, 'aria-label': 'Retour à l’accueil (la partie est conservée)' }, icon('home'), 'Accueil'));
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
        h('div', { class: 'resume' }, 'Une partie est en cours : ', h('b', { text: 'match ' + (resume.idx + 1) + ' sur ' + N }), ' · score général ', h('b', { text: Math.max(0, pts) + ' / ' + done.length * E.MATCH_MAX })),
        h('button', { class: 'btn', onclick: resumeGame }, 'Reprendre la partie en cours', icon('arrow')),
        h('button', { class: 'btn outline small', onclick: askNew }, 'Nouvelle partie'));
    } else actions = h('div', { class: 'actions a-up d3' }, h('button', { class: 'btn', onclick: newGame }, 'Commencer la partie', icon('arrow')));
    var board = h('div', { class: 'board' });
    'PENDU'.split('').forEach(function (c, i) { board.appendChild(h('span', { class: i % 2 ? 'h' : '', text: c })); });
    var s = h('div', { class: 'screen home' },
      h('div', { class: 'art a-zoom' }, board, h('div', { class: 'mini', html: drawing(6) })),
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
      h('h2', { text: 'Commencer une nouvelle partie ?' }),
      h('p', { text: 'La partie en cours et son score seront effacés.' }),
      h('div', { class: 'row' },
        h('button', { class: 'btn outline small', onclick: function () { box.remove(); } }, 'Non, garder'),
        h('button', { class: 'btn small', onclick: newGame }, 'Oui, nouvelle partie'))));
    stage.appendChild(box);
  }

  /* ---------- transitions entre manches ---------- */
  function trans() {
    var no = state.trans, M = MANCHES[no - 1], prev = no - 1;
    var s = h('div', { class: 'screen trans' + (M.finale ? ' finale' : '') }, M.finale ? h('div', { class: 'rays' }) : leaves('right:-20px;bottom:-20px;width:300px;height:270px;opacity:.9'));
    var c = h('div', { class: 'center' });
    if (prev) {
      c.appendChild(h('div', { class: 'done a-up', text: 'Fin de la manche ' + prev }));
      c.appendChild(h('div', { class: 'gscore pop', html: (M.finale ? 'Score actuel : ' : 'Score général : ') + '<b>' + general(lastOf(prev)) + '</b> / ' + prev * 5 * E.MATCH_MAX }));
    }
    c.appendChild(h('div', { class: 'next a-up d2', text: M.finale ? 'GRANDE FINALE' : 'MANCHE ' + no }));
    c.appendChild(h('h1', { class: 'title-serif a-up d2', text: M.finale ? '5 derniers mots' : M.title }));
    if (!prev) c.appendChild(h('div', { class: 'done a-up d3', text: '5 mots à retrouver · 5 points par mot' }));
    c.appendChild(h('div', { class: 'a-up d3' }, h('button', { class: 'btn' + (M.finale ? ' orange' : ''), onclick: function () { state.idx = firstOf(no); go('match'); } },
      M.finale ? 'Lancer la grande finale' : 'Commencer la manche ' + no, icon('arrow'))));
    s.appendChild(c);
    show(s);
    if (prev) startConfetti(M.finale ? 90 : 40);
  }

  /* ---------- match ---------- */
  var lastHit = null, lastErrors = -1, flashPot = false;
  function match() {
    var i = state.idx, w = MATCHS[i], m = state.matches[i];
    var over = m.status !== 'playing';
    var s = h('div', { class: 'screen match' });
    s.appendChild(header());
    // dessin + erreurs
    var dots = h('div', { class: 'dots' });
    for (var k = 0; k < E.MAX_ERRORS; k++) dots.appendChild(h('i', { class: k < m.errors ? 'on' : '' }));
    s.appendChild(h('div', { class: 'drawcard' }, h('div', { html: drawing(m.errors, lastErrors >= 0 && m.errors > lastErrors) }),
      h('div', { class: 'errs' }, h('span', { class: 'errtxt', text: 'Erreurs : ' + m.errors + ' / ' + E.MAX_ERRORS }), dots)));
    lastErrors = m.errors;
    // mot, indices, points possibles
    var chars = Array.from(w.word);
    var word = h('div', { class: 'word' + (chars.length > 10 ? ' long' : ''), 'aria-label': 'Mot à trouver' });
    chars.forEach(function (c) {
      var shown = E.revealed(w.word, m, c);
      var cl = shown ? (lastHit && E.norm(c) === lastHit ? 'new' : '') : (over ? 'miss' : 'hide');
      word.appendChild(h('span', { class: cl, text: shown || over ? c : '' }));
    });
    lastHit = null;
    var pot = h('div', { class: 'potential' + (flashPot ? ' flash' : ''), html: 'Points possibles : <b>' + E.potential(m) + '</b>' });
    flashPot = false;
    var h1 = h('button', { class: 'hintbtn' + (m.hints >= 1 ? ' used' : ''), disabled: m.hints >= 1 || over ? 'disabled' : null, onclick: function () { hint(); } }, 'INDICE 1');
    var h2 = h('button', { class: 'hintbtn' + (m.hints >= 2 ? ' used' : ''), disabled: m.hints !== 1 || over ? 'disabled' : null, onclick: function () { hint(); } }, 'INDICE 2');
    var hints = h('div', { class: 'hints' });
    if (m.hints >= 1) hints.appendChild(h('div', { class: 'hint h1' }, h('b', { text: 'Indice 1 :' }), w.hint1));
    if (m.hints >= 2) hints.appendChild(h('div', { class: 'hint h2' }, h('b', { text: 'Indice 2 :' }), w.hint2));
    if (!m.hints) hints.appendChild(h('div', { class: 'hint empty', text: 'Indice 1 : le mot vaut alors 3 points · Indice 2 : 1 point.' }));
    s.appendChild(h('div', { class: 'right' },
      h('div', { class: 'ctx' }, h('small', { text: 'Petit indice de contexte' }), h('span', { text: w.context })),
      word, h('div', { class: 'hintrow' }, h1, h2, pot), hints));
    // clavier A–Z (une lettre jouée devient indisponible)
    var kb = h('div', { class: 'keyboard' });
    ROWS.forEach(function (r) {
      var row = h('div', { class: 'row' });
      r.split('').forEach(function (L) {
        var played = m.played.indexOf(L) >= 0, inWord = E.needed(w.word).indexOf(L) >= 0;
        row.appendChild(h('button', { class: 'key' + (played ? (inWord ? ' hit' : ' miss') : ''), 'data-l': L, disabled: played || over ? 'disabled' : null,
          'aria-label': 'Lettre ' + L + (played ? ' (déjà jouée)' : ''), onclick: function () { letter(L); } }, L));
      });
      kb.appendChild(row);
    });
    kb.appendChild(h('div', { class: 'help', text: 'Les accents sont trouvés automatiquement : E révèle aussi É, È, Ê…' }));
    s.appendChild(kb);
    if (over) s.appendChild(resultPanel(i, w, m));
    show(s);
    addTestTag(s, i);
  }
  function letter(L) {
    var w = MATCHS[state.idx], m = state.matches[state.idx];
    var r = E.play(w.word, m, L);
    if (r.result === 'already' || r.result === 'over') return;
    if (r.result === 'hit') { lastHit = E.norm(L); tone([660, 880], 0.12); } else tone([240], 0.22);
    if (m.status === 'won') { tone([523, 659, 784, 1046], 0.16); }
    animate = false; match();
    if (m.status === 'won') startConfetti(60);
  }
  function hint() {
    var m = state.matches[state.idx];
    if (!E.useHint(m)) return;
    flashPot = true; tone([520], 0.12);
    animate = false; match();
  }
  function resultPanel(i, w, m) {
    var won = m.status === 'won', lastInManche = i === lastOf(w.manche), last = i === N - 1;
    var label = last ? 'Voir le score final' : lastInManche ? 'Fin de la manche ' + w.manche : 'Match suivant';
    var savez = h('div', { class: 'savez' }, h('h3', { text: '✨ Le saviez-vous ?' }), h('p', { text: w.anecdote }));
    var box = h('div', { class: 'result ' + (won ? 'won' : 'lost'), role: 'dialog', 'aria-label': won ? 'Mot trouvé' : 'Mot non trouvé' },
      h('h2', { class: 'pop', text: won ? 'BRAVO !' : 'Dommage !' }),
      h('div', { class: 'full', text: w.word }),
      h('div', { class: 'scores' },
        h('div', { class: 'ms', text: 'Score du match : ' + m.score + ' / ' + E.MATCH_MAX }),
        h('div', { class: 'g', text: 'Score général : ' + generalText() })),
      savez,
      h('button', { class: 'btn orange nextbtn', onclick: next }, label, icon('arrow')));
    setTimeout(function () { savez.classList.add('show'); }, 1200);
    return h('div', null, h('div', { class: 'veil' }), box);
  }
  function next() {
    var i = state.idx, w = MATCHS[i];
    if (i >= N - 1) { go('final'); return; }
    if (i === lastOf(w.manche)) { state.trans = w.manche + 1; state.idx = i + 1; go('trans'); return; }
    state.idx = i + 1; go('match');
  }
  function addTestTag(s, i) {
    if (state.test) s.appendChild(h('div', { class: 'testtag', style: 'position:absolute;left:24px;bottom:6px;font-size:16px;color:#8C8982', text: 'TEST · match ' + (i + 1) + ' · ' + MATCHS[i].word }));
  }

  /* ---------- écran final ---------- */
  function finalScreen() {
    var score = general();
    var recap = h('div', { class: 'recap a-up d3' });
    MATCHS.forEach(function (w, i) {
      var m = state.matches[i];
      recap.appendChild(h('div', { class: m.score ? '' : 'z', title: w.word }, h('b', { text: (m.status === 'playing' ? '–' : m.score) + ' / 5' }), w.word));
    });
    var s = h('div', { class: 'screen final' },
      h('div', { class: 'head' }, logo()),
      h('div', { class: 'center' },
        h('div', { class: 'lab a-up', text: 'SCORE FINAL' }),
        h('div', { class: 'big pop', html: score + '<small> / ' + N * E.MATCH_MAX + '</small>' }),
        h('div', { class: 'appr a-up d2', text: E.appreciation(score) }),
        recap,
        h('div', { class: 'thanks a-up d3', text: 'Merci à toute l’équipe pour cette belle partie !' }),
        h('div', { class: 'a-up d4' }, h('button', { class: 'btn', onclick: function () { if (state.test) { go('testmenu'); return; } newGame(); } }, 'Nouvelle partie', icon('arrow')))),
      leaves('left:-30px;bottom:-20px;width:300px;height:270px;opacity:.9'), leaves('right:-30px;bottom:-20px;width:300px;height:270px;opacity:.9;transform:scaleX(-1)'));
    show(s);
    tone([523, 659, 784, 1046, 1318], 0.18);
    startConfetti(120);
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
  var peek = false;
  function enterTest() { var snd = state.sound; state = fresh(); state.sound = snd; state.test = true; go('testmenu'); }
  function exitTest() { peek = false; testbar.hidden = true; var s = readSave(); state = s || fresh(); if (state.screen !== 'home') state.screen = 'home'; go('home'); }
  function toMatch(i) { i = Math.max(0, Math.min(N - 1, i)); state.idx = i; state.matches[i] = E.fresh(); lastErrors = -1; go('match'); }
  function toTrans(no) { state.trans = no; state.idx = firstOf(no); go('trans'); }
  function simWin() { var w = MATCHS[state.idx], m = state.matches[state.idx]; if (m.status !== 'playing') return; E.needed(w.word).forEach(function (L) { E.play(w.word, m, L); }); animate = false; match(); }
  function simLose() { var m = state.matches[state.idx]; if (m.status !== 'playing') return; m.errors = E.MAX_ERRORS; E.finish(m, false); animate = false; match(); }
  function simHint(n) { var m = state.matches[state.idx]; while (m.hints < n && E.useHint(m)) flashPot = true; animate = false; match(); }
  function randomScores(upto) {
    for (var i = 0; i < upto; i++) { var m = E.fresh(); m.status = Math.random() < .8 ? 'won' : 'lost'; m.hints = Math.floor(Math.random() * 3); m.score = m.status === 'won' ? E.potential(m) : 0; state.matches[i] = m; }
  }
  function drawTestbar() {
    if (!state.test) { testbar.hidden = true; return; }
    testbar.hidden = false; testbar.innerHTML = '';
    var b = function (t, fn, id) { var e = h('button', { type: 'button', text: t, onclick: fn }); if (id) e.id = id; return e; };
    testbar.appendChild(h('span', { class: 'tb-label', text: 'TEST' }));
    if (state.screen === 'match') {
      testbar.appendChild(b('◀ Préc.', function () { toMatch(state.idx - 1); }, 'tb-prev'));
      testbar.appendChild(b('Suiv. ▶', function () { toMatch(state.idx + 1); }, 'tb-next'));
      testbar.appendChild(b('Indice 1', function () { simHint(1); }, 'tb-h1'));
      testbar.appendChild(b('Indice 2', function () { simHint(2); }, 'tb-h2'));
      testbar.appendChild(b('Victoire', simWin, 'tb-win'));
      testbar.appendChild(b('Échec', simLose, 'tb-lose'));
      testbar.appendChild(b(peek ? 'Masquer le mot' : 'Révéler le mot', function () { peek = !peek; drawTestbar(); }, 'tb-peek'));
      if (peek) testbar.appendChild(h('span', { class: 'peek', id: 'tb-word', text: MATCHS[state.idx].word }));
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
      MATCHS.forEach(function (w, i) { if (w.manche === M.no) row.appendChild(h('button', { class: 'tmbtn tmm', onclick: function () { toMatch(i); } }, 'Match ' + (i + 1), h('small', { text: w.word }))); });
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
      h('button', { class: 'btn small outline', onclick: function () { randomScores(N); state.adjust = 0; testMenu(); } }, 'Scores d’essai aléatoires'),
      h('button', { class: 'btn small outline', onclick: function () { state.matches = fresh().matches; state.adjust = 0; testMenu(); } }, 'Remettre à zéro'),
      h('button', { class: 'btn small outline', onclick: exitTest }, 'Quitter le test')));
    show(s);
  }

  /* ---------- clavier physique ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (state.screen === 'home' && e.key.toLowerCase() === 't' && !inProgress(readSave())) { enterTest(); return; }
    if (state.screen === 'match') {
      var m = state.matches[state.idx];
      if (m.status === 'playing' && /^[a-zA-Z]$/.test(e.key)) { letter(e.key.toUpperCase()); return; }
      if (m.status !== 'playing' && e.key === 'Enter' && (!document.activeElement || document.activeElement.tagName !== 'BUTTON')) next();
    }
  });

  /* ---------- démarrage : toujours l'accueil, avec reprise proposée si une partie est en cours ---------- */
  fit();
  var s0 = readSave();
  if (s0) { state.sound = s0.sound !== false; }
  render();
  window.__pendu = { get state() { return state; }, engine: E, data: D, general: general };
})();
