/* Quiz « Le monde animal » — OBEO Toulouse Guillaumet.
   Moteur dérivé du quiz France (lui-même dérivé du Quiz Cathares). Aucune dépendance, aucun serveur nécessaire (ouverture directe de index.html). */
(function () {
  'use strict';
  var M = window.AnimauxModel.build(window.AnimauxData);
  var CFG = M.config, CH = M.chapters, Q = M.questions, N = Q.length;
  var L = window.QuizLogic;
  var KEY = 'obeo-quiz-animaux-v1';
  var LETTERS = ['A', 'B', 'C'];
  var stage = document.getElementById('stage');
  var testbar = document.getElementById('testbar');

  /* ---------- état ---------- */
  var state = fresh();
  function fresh() {
    return { screen: 'home', mode: 'individual', players: [], nextId: 1, idx: 0, phase: 'choose', selected: null, awarded: {},
      rankMode: 'peek', podiumStep: 0, justRevealed: -1, test: false };
  }
  // pas de sauvegarde en mode test : un rechargement ramène à la partie réelle précédente
  function save() { if (state.test) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.screen && Array.isArray(s.players) && typeof s.idx === 'number' && s.idx >= 0 && s.idx < N && !s.test) state = Object.assign(fresh(), s);
    } catch (e) {}
    if (state.screen === 'testmenu') state.screen = 'home';
    if (state.screen === 'ranking' && state.mode === 'group' && state.rankMode === 'peek') state.screen = 'question';
  }
  function reset() { state = fresh(); save(); }
  var selectHook = null;
  function selectAnswer(i) { if (selectHook) selectHook(i); }
  var prevScreen = 'question';

  /* ---------- helpers DOM ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v; // uniquement du contenu statique (icônes)
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
      else if (k === 'style') el.setAttribute('style', v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      if (Array.isArray(c)) { c.forEach(function (x) { if (x) el.appendChild(x); }); continue; }
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }
  var ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 5l1.7 4.6L18 11l-4.3 1.4L12 17l-1.7-4.6L6 11l4.3-1.4z" fill="#fff"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="#B85A1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z" fill="#F6DEC4"/></svg>',
    trophy: function (c) { return '<svg class="trophy" viewBox="0 0 64 64"><path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="' + c + '"/><path d="M18 12H8c0 10 4 16 12 17M46 12h10c0 10-4 16-12 17" fill="none" stroke="' + c + '" stroke-width="4"/><rect x="28" y="36" width="8" height="12" fill="' + c + '"/><rect x="20" y="48" width="24" height="8" rx="3" fill="' + c + '"/></svg>'; }
  };
  function icon(name, cls) { return h('span', { html: ICON[name], class: cls || '', 'aria-hidden': 'true', style: 'display:inline-flex' }); }
  function leaves(style) {
    return h('div', { class: 'leaves', 'aria-hidden': 'true', style: style, html:
      '<svg viewBox="0 0 220 200" width="100%" height="100%"><path d="M10 190C0 110 50 40 130 30c10 80-30 150-120 160z" fill="#DA8548"/>' +
      '<path d="M70 195C60 140 100 90 170 85c5 60-30 105-100 110z" fill="#247F78" opacity=".92"/><path d="M130 190c-5-40 20-70 70-75 3 40-20 70-70 75z" fill="#DA8548" opacity=".7"/></svg>' });
  }
  function logo(cls) { return h('img', { class: 'logo ' + (cls || ''), src: 'assets/logo/obeo-logo.png', alt: 'OBEO Résidences — Le bien-être à portée de main' }); }

  /* Image avec décor de secours : si le fichier manque, on affiche un panneau décoratif (jamais d'erreur visible).
     L'alt est volontairement générique (aucun nom de lieu / de réponse). */
  function imageBox(src, opts) {
    opts = opts || {};
    var box = h('div', { class: 'photo ' + (opts.cls || '') + (opts.fit === 'contain' ? ' contain' : '') });
    function fallback() {
      box.innerHTML = ''; box.classList.add('fallback'); box.classList.remove('contain');
      box.appendChild(h('img', { class: 'mark', src: 'assets/logo/obeo-clover-mark.png', alt: '' }));
      if (opts.num) box.appendChild(h('div', { class: 'num', text: String(opts.num), 'aria-hidden': 'true' }));
    }
    if (!src) { fallback(); return box; }
    var img = h('img', { src: src, alt: opts.alt || 'Illustration' });
    img.addEventListener('error', fallback);
    box.appendChild(img);
    if (opts.credit) box.appendChild(h('div', { class: 'credit', text: opts.credit }));
    return box;
  }

  /* ---------- échelle de la scène ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var x = (window.innerWidth - 1920 * s) / 2, y = (window.innerHeight - 1080 * s) / 2;
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  function toggleFull() {
    var d = document;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else { var e = d.documentElement; (e.requestFullscreen || e.webkitRequestFullscreen).call(e); }
    } catch (err) {}
  }

  /* ---------- navigation ---------- */
  var lastProgress = 0;
  function show(node) { stage.innerHTML = ''; stage.appendChild(node); save(); drawTestbar(); }
  function go(screen) { state.screen = screen; render(); }
  function render() {
    var fn = { home: home, players: players, intro: intro, question: question, ranking: ranking, final: finalScreen, testmenu: testMenu }[state.screen] || home;
    fn();
    if (state.screen !== 'final') stopConfetti();
  }
  function showErrors() {
    var box = h('div', { class: 'screen', style: 'padding:80px;font-size:30px;overflow:auto' },
      h('h1', { class: 'title-serif', text: 'Contenu du quiz à corriger' }),
      h('p', { text: 'Le fichier animaux/js/quiz-data.js contient des erreurs :' }),
      h('ul', null, M.errors.map(function (e) { return h('li', { text: e }); })));
    stage.appendChild(box);
  }

  /* ---------- helpers de manche (chapitre) ---------- */
  function chapterOf(i) { return CH[Q[i].ch]; }
  function firstPhase(q) { return q.think ? 'look' : 'choose'; }
  function pos(i) { var c = chapterOf(i); return { ch: c, n: i - c.start, last: i === c.start + c.count - 1 }; }
  var BOUNDS = CH.slice(0, -1).map(function (c) { return (c.start + c.count) / N; });
  function bonusTag(q) { return q.points > 1 ? h('div', { class: 'bonus a-zoom', text: '★ QUESTION BONUS — ' + q.points + ' POINTS' }) : null; }
  function kicker(q) { return q.typeLabel ? h('div', { class: 'kicker', text: q.typeLabel }) : null; }
  function indivMode() { return state.mode === 'individual' && state.players.length > 0; }
  // Score toujours affiché sur le maximum possible (somme des points des 36 questions = 42)
  var MAX = Q.reduce(function (a, q) { return a + q.points; }, 0);
  function pts(n) { return n + ' / ' + MAX; }

  /* ---------- accueil ---------- */
  function home() {
    var s = h('div', { class: 'screen home france-home' },
      imageBox(CFG.homeImage ? CFG.imagesDir + CFG.homeImage : CFG.imagesDir + 'home.jpg', { cls: 'a-zoom', alt: 'Illustration de l’accueil' }),
      leaves('left:-30px;bottom:-20px;width:300px;height:270px;opacity:.95'),
      h('div', { class: 'col' },
        h('div', { class: 'a-up d1' }, logo()),
        h('h1', { class: 'title-serif a-up d2' }, h('span', { class: 'q', text: CFG.title }), h('span', { class: 't', text: CFG.subtitle })),
        h('div', { class: 'rule a-up d2' }),
        h('p', { class: 'sub a-up d2', text: CFG.tagline }),
        h('div', { class: 'place a-up d2', text: CFG.venue }),
        h('div', { class: 'a-up d3' }, h('button', { class: 'btn', onclick: function () { go('players'); } }, 'Commencer le quiz', icon('arrow')))),
      h('button', { class: 'testlink', 'aria-label': 'Mode test animateur', title: 'Mode test animateur', onclick: enterTest }, icon('gear')));
    show(s);
  }

  /* ---------- participants ---------- */
  function players() {
    var input = h('input', { type: 'text', placeholder: 'Prénom du participant', maxlength: '24', 'aria-label': 'Prénom du participant', autocomplete: 'off' });
    var list = h('div', { class: 'plist' });
    var count = h('span', { class: 'count' });
    var startBtn = h('button', { class: 'btn', onclick: startIndividual }, 'C’est parti !', icon('arrow'));
    var msg = h('div', { class: 'hint', style: 'color:#B23A30;margin:0;font-size:28px;min-height:36px;font-weight:600' });
    function add() {
      var before = state.players.length;
      state.players = L.addPlayer(state.players, input.value, state.nextId);
      if (state.players.length > before) { state.nextId++; input.value = ''; msg.textContent = ''; }
      else if (!L.cleanName(input.value)) msg.textContent = 'Saisissez un prénom puis cliquez sur « Ajouter ».';
      else msg.textContent = 'Nombre maximum de participants atteint (' + L.MAX_PLAYERS + ').';
      save(); drawList(true); input.focus();
    }
    function drawList(scrollEnd) {
      list.innerHTML = '';
      if (!state.players.length) list.appendChild(h('div', { class: 'empty', text: 'Aucun participant pour l’instant.' }));
      state.players.forEach(function (p, i) {
        var inp = h('input', { type: 'text', value: p.name, maxlength: '24', 'aria-label': 'Modifier le prénom de ' + p.name,
          oninput: function () { state.players = L.renamePlayer(state.players, p.id, inp.value || p.name); if (inp.value.trim()) save(); },
          onblur: function () { if (!inp.value.trim()) inp.value = p.name; },
          onkeydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); input.focus(); } } });
        list.appendChild(h('div', { class: 'pcard' },
          h('div', { class: 'avatar' + (i % 2 ? ' o' : ''), text: (p.name[0] || '?').toUpperCase(), 'aria-hidden': 'true' }),
          inp,
          h('button', { class: 'chip-btn', 'aria-label': 'Retirer ' + p.name, onclick: function () { state.players = L.removePlayer(state.players, p.id); save(); drawList(); } }, icon('x'), 'Retirer')));
      });
      var n = state.players.length;
      count.textContent = n + (n > 1 ? ' participants' : ' participant');
      startBtn.setAttribute('aria-disabled', n ? 'false' : 'true');
      if (scrollEnd) list.scrollTop = list.scrollHeight;
    }
    function startIndividual() {
      if (!state.players.length) { msg.textContent = 'Ajoutez au moins un participant, ou choisissez « Jouer tous ensemble ».'; return; }
      beginGame('individual');
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    var s = h('div', { class: 'screen players' },
      imageBox(CFG.imagesDir + 'players.jpg', { cls: 'a-zoom', alt: 'Illustration' }),
      h('div', { class: 'col' },
        logo(),
        h('h1', { class: 'title-serif a-up', text: 'QUI PARTICIPE AUJOURD’HUI ?' }),
        h('p', { class: 'hint', text: 'Ajoutez les prénoms des participants.' }),
        h('div', { class: 'add-row' }, input, h('button', { class: 'btn orange', onclick: add }, '+ Ajouter un participant')),
        msg, list,
        h('div', { class: 'actions' }, startBtn, h('button', { class: 'btn outline', onclick: function () { beginGame('group'); } }, 'Jouer tous ensemble'), count)));
    show(s);
    drawList();
    setTimeout(function () { input.focus(); }, 50);
  }

  function beginGame(mode) {
    state.mode = mode; state.idx = 0; state.selected = null; state.awarded = {}; state.rankMode = 'peek'; state.podiumStep = 0; state.justRevealed = -1;
    state.phase = firstPhase(Q[0]);
    state.players = L.resetScores(state.players);
    lastProgress = 0;
    go('intro');
  }

  /* ---------- introduction de chapitre ---------- */
  function intro() {
    var c = chapterOf(state.idx);
    var bonus = Q.filter(function (q) { return q.ch === c.idx && q.points > 1; }).length;
    var allBonus = bonus === c.count;
    var meta = c.count + ' questions' + (state.mode === 'individual' ? (allBonus ? '' : ' · +1 point par bonne réponse') : '');
    var s = h('div', { class: 'screen home intro' },
      imageBox(c.image, { cls: 'a-zoom', num: c.no, alt: 'Illustration de la manche' }),
      leaves('left:-30px;bottom:-20px;width:300px;height:270px;opacity:.95'),
      h('div', { class: 'col' },
        h('div', { class: 'a-up d1' }, logo()),
        h('h1', { class: 'title-serif a-up d2' },
          h('span', { class: 'chnum', text: 'MANCHE ' + c.no }),
          h('span', { class: 't', text: c.title })),
        h('div', { class: 'rule a-up d2' }),
        h('p', { class: 'sub a-up d2', text: c.hook }),
        h('div', { class: 'place a-up d3', text: meta }),
        bonus && state.mode === 'individual' ? h('div', { class: 'bonus a-zoom d3', style: 'margin-top:20px', text: allBonus ? '★ CHAQUE BONNE RÉPONSE : 2 POINTS' : '★ LES ' + bonus + ' DERNIÈRES QUESTIONS : 2 POINTS' }) : null,
        h('div', { class: 'a-up d4' }, h('button', { class: 'btn', onclick: startChapter }, 'Commencer', icon('arrow')))));
    show(s);
  }
  function startChapter() { state.phase = firstPhase(Q[state.idx]); state.selected = null; state.awarded = {}; go('question'); }

  /* ---------- en-tête commun ---------- */
  function header(done) {
    var p = pos(state.idx);
    var bar = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(N), 'aria-valuenow': String(Math.round(done * N)) }, h('i', { style: 'width:' + lastProgress * 100 + '%' }));
    BOUNDS.forEach(function (b) { bar.appendChild(h('b', { style: 'left:' + b * 100 + '%' })); });
    var fill = bar.firstChild;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = done * 100 + '%'; }); });
    lastProgress = done;
    var right = [];
    if (state.mode === 'individual') right.push(h('button', { class: 'icon-btn', onclick: openRanking }, icon('list'), 'Classement'));
    right.push(h('button', { class: 'icon-btn', onclick: toggleFull, 'aria-label': 'Plein écran' }, icon('full'), 'Plein écran'));
    right.push(h('button', { class: 'icon-btn', onclick: askQuit, 'aria-label': 'Quitter la partie' }, icon('x'), 'Quitter'));
    return h('div', { class: 'head' }, logo(),
      h('div', { class: 'progwrap' }, h('div', { class: 'ptext', text: 'Question ' + (state.idx + 1) + ' sur ' + N + '  ·  ' + p.ch.title }), bar),
      h('div', { class: 'pill', text: 'Manche ' + p.ch.no + ' · ' + (p.n + 1) + ' / ' + p.ch.count }), right);
  }
  function askQuit() {
    var box = h('div', { class: 'confirm' }, h('div', { class: 'box' },
      h('h2', { text: 'Quitter la partie ?' }),
      h('p', { text: 'Les scores seront effacés et vous reviendrez à l’accueil.' }),
      h('div', { class: 'row' },
        h('button', { class: 'btn outline small', onclick: function () { box.remove(); } }, 'Non, continuer'),
        h('button', { class: 'btn small', onclick: function () { var t = state.test; reset(); if (t) clearTest(); go('home'); } }, 'Oui, quitter'))));
    stage.appendChild(box);
  }
  function openRanking() { prevScreen = state.screen === 'ranking' ? prevScreen : state.screen; state.rankMode = 'peek'; go('ranking'); }

  /* ---------- question ---------- */
  function question() {
    if (M.errors.length) { stage.innerHTML = ''; showErrors(); return; }
    var q = Q[state.idx], phase = state.phase;
    var revealed = phase === 'revealed' || phase === 'award';
    var indiv = indivMode();
    var two = q.kind === 'two';
    var cls = 'screen' + (two ? ' tf' : '') + (q.type === 'visual' ? ' vis' : '') +
      (revealed ? ' rev' + (phase === 'award' ? ' awd' : '') + (indiv ? '' : ' group') + (state.players.length > 10 && indiv ? ' many' : '') : '');
    var s = h('div', { class: cls });
    s.appendChild(header((state.idx + (revealed ? 1 : 0)) / N));
    var hasImg = true; // imageBox gère le décor de secours
    var ch = chapterOf(state.idx);
    var imgOpts = { cls: 'a-zoom', fit: q.fit, credit: q.credit, num: ch.no };

    /* étape « réfléchir » : visuel / énigme / réflexion — on ne montre pas les choix tout de suite */
    if (phase === 'look') {
      var go2 = h('button', { class: 'btn', onclick: function () { state.phase = 'choose'; save(); question(); } }, 'Afficher les choix', icon('arrow'));
      if (q.type === 'visual' || q.explicitImage) {
        s.appendChild(imageBox(q.image, { cls: 'lookphoto', fit: q.fit, credit: q.credit, num: ch.no, alt: 'Illustration de la question' }));
        s.appendChild(h('div', { class: 'lookside' },
          kicker(q), bonusTag(q),
          h('h1', { class: 'qtext a-up', style: 'font-size:58px', text: q.q }),
          q.clues.length ? h('ul', { class: 'clues a-up d1' }, q.clues.map(function (c) { return h('li', { text: c }); })) : null,
          h('p', { class: 'a-up d2', style: 'font-size:32px;margin:0;color:#5F5C56;line-height:1.35', text: 'Prenez le temps d’observer et d’en discuter ensemble.' }),
          h('div', { class: 'a-up d3' }, go2)));
      } else {
        s.appendChild(h('div', { class: 'think' },
          kicker(q), bonusTag(q),
          h('h1', { class: 'qtext a-up', text: q.q }),
          q.clues.length ? h('ul', { class: 'clues a-up d1' }, q.clues.map(function (c) { return h('li', { text: c }); })) : null,
          h('p', { class: 'hint a-up d2', text: 'Prenez le temps d’y réfléchir et d’en discuter ensemble.' }),
          h('div', { class: 'a-up d3' }, go2)));
      }
      show(s); addTestTag(s, q); return;
    }

    function answerNode(a, i) {
      var cl = (two && !revealed ? 'tfbtn ' + (i === 0 ? 'v' : 'f') : 'answer' + (a.length > 52 ? ' long' : ''));
      var tag = null;
      if (revealed) {
        cl += ' locked';
        if (i === q.correct) { cl += ' good'; tag = h('span', { class: 'tag' }, icon('check'), 'Bonne réponse'); }
        else if (i === state.selected) { cl += ' bad'; tag = h('span', { class: 'tag' }, icon('cross'), 'Réponse choisie'); }
      } else if (i === state.selected) cl += ' sel';
      var onclick = revealed ? null : function () { selectAnswer(i); };
      var b;
      if (two && !revealed) {
        b = h('button', { class: cl, 'aria-pressed': i === state.selected ? 'true' : 'false', onclick: onclick },
          h('span', { html: i === 0 ? ICON.check : (q.type === 'legend' ? ICON.spark : ICON.cross), class: 'ic', style: 'display:inline-flex', 'aria-hidden': 'true' }),
          h('span', { class: 'big', text: a }), h('span', { class: 'chosen', text: '✓ Choix sélectionné' }));
      } else {
        var lt = two ? (i === 0 ? '✓' : (q.type === 'legend' ? '✦' : '✕')) : LETTERS[i];
        b = h('button', { class: cl, 'aria-pressed': (!revealed && i === state.selected) ? 'true' : 'false', onclick: onclick },
          h('span', { class: 'lt', text: lt }), h('span', { class: 'tx', text: a }), tag, (!revealed ? h('span', { class: 'dot' }) : null));
      }
      if (revealed) b.setAttribute('tabindex', '-1');
      return b;
    }
    var answers = h('div', { class: (two && !revealed) ? 'tfrow' : 'answers' }, q.answers.map(answerNode));
    var validate = null;
    // la sélection (clic ou survol) ne révèle jamais la bonne réponse : mise à jour sur place, validation obligatoire
    selectHook = revealed ? null : function (i) {
      state.selected = i; save();
      Array.prototype.forEach.call(answers.children, function (b, j) {
        b.classList.toggle('sel', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      validate.setAttribute('aria-disabled', 'false');
    };

    if (!revealed) {
      if (!two) {
        var side = h('div', { class: 'qside' }, imageBox(q.image, imgOpts));
        if (q.type === 'qcm' && indiv) side.appendChild(miniRanking());
        s.appendChild(side);
      }
      validate = h('button', { class: 'btn', 'aria-disabled': state.selected == null ? 'true' : 'false',
        onclick: function () { if (state.selected != null) reveal(); } }, 'Valider', icon('arrow'));
      s.appendChild(h('div', { class: 'qmain' + (two ? ' wide' : '') },
        kicker(q), bonusTag(q),
        h('h1', { class: 'qtext a-up', text: q.q }),
        (q.clues.length && !two) ? h('ul', { class: 'clues' }, q.clues.map(function (c) { return h('li', { text: c }); })) : null,
        answers,
        h('div', { class: 'qactions' }, validate,
          h('button', { class: 'btn outline small', onclick: reveal }, 'Afficher la réponse'))));
    } else {
      var left = h('div', { class: 'left' }, kicker(q), bonusTag(q), h('h1', { class: 'qtext', text: q.q }), answers);
      var right = h('div', { class: 'right' });
      // Trois zones après validation : ✅ Réponse · 💡 Pourquoi ? · 🐾 Le saviez-vous ?
      var goodTxt = two ? q.answers[q.correct] : LETTERS[q.correct] + ' — ' + q.answers[q.correct];
      var thumb = (q.type === 'visual' || q.explicitImage) ? h('img', { class: 'thumb', src: q.image, alt: '', onerror: function () { this.remove(); } }) : null;
      right.appendChild(h('div', { class: 'zone zrep' }, thumb, h('div', null, h('h2', { text: '✅ Réponse' }), h('p', { text: q.short || goodTxt }))));
      if (q.explanation) right.appendChild(h('div', { class: 'zone zwhy' + (q.explanation.length > 190 ? ' long' : '') }, h('h2', { text: '💡 Pourquoi ?' }), h('p', { text: q.explanation })));
      if (q.anecdote) right.appendChild(h('div', { class: 'zone zsav' + (q.anecdote.length > 190 ? ' long' : '') }, h('h2', { text: '🐾 Le saviez-vous ?' }), h('p', { text: q.anecdote })));
      s.appendChild(h('div', { class: 'qmain' }, left, right));
      var lastQ = state.idx === N - 1;
      var nextLabel = lastQ ? (indiv ? 'Voir le classement final' : 'Terminer le quiz') : (pos(state.idx).last ? 'Manche suivante' : 'Question suivante');
      var nextBtn = h('button', { class: 'btn orange', onclick: next }, nextLabel, icon('arrow'));
      if (indiv && phase === 'revealed') {
        s.appendChild(h('div', { class: 'nextbar' }, h('button', { class: 'btn orange', onclick: function () { state.phase = 'award'; save(); question(); } }, 'Attribuer les points', icon('arrow'))));
      } else if (indiv) s.appendChild(awardPanel(nextBtn, q));
      else s.appendChild(h('div', { class: 'nextbar' }, nextBtn));
    }
    show(s); addTestTag(s, q);
  }
  function addTestTag(s, q) {
    if (state.test) s.appendChild(h('div', { class: 'testtag', text: 'TEST · ' + q.id + ' · ' + q.type + ' · ' + q.points + ' pt' + (q.source ? ' · ' + q.source : '') + (q.placeholder ? ' · [à remplacer]' : '') }));
  }

  function miniRanking() {
    var all = L.ranking(state.players), rows = all.slice(0, 5);
    var card = h('div', { class: 'mini a-up d2' }, h('h3', { text: 'Classement actuel' }));
    if (!all.some(function (r) { return r.player.score > 0; })) {
      card.appendChild(h('div', { class: 'r', style: 'height:auto;padding:8px 0;font-weight:500', text: 'Aucun point pour l’instant — ' + all.length + ' participant' + (all.length > 1 ? 's' : '') }));
      return card;
    }
    rows.forEach(function (r) {
      card.appendChild(h('div', { class: 'r' },
        h('span', { class: 'rk r' + r.rank, text: L.rankLabel(r.rank) }), h('span', { class: 'n', text: r.player.name }), h('b', { text: pts(r.player.score) })));
    });
    if (state.players.length > 5) card.appendChild(h('div', { class: 'r', style: 'color:#5F5C56;font-weight:500;font-size:24px', text: '… et ' + (state.players.length - 5) + ' autre(s) — voir le classement' }));
    return card;
  }

  function reveal() { state.phase = 'revealed'; state.awarded = {}; save(); question(); }

  function awardPanel(nextBtn, q) {
    var step = q.points, n = state.players.length;
    var size = n <= 4 ? { cols: n, h: 104, f: 34, sm: true } : n <= 6 ? { cols: 3, h: 104, f: 34, sm: true } : n <= 10 ? { cols: 5, h: 92, f: 30, sm: true }
      : n <= 15 ? { cols: 5, h: 72, f: 28 } : n <= 20 ? { cols: 5, h: 64, f: 25 } : { cols: 6, h: 58, f: 22 };
    var grid = h('div', { class: 'grid', style: 'grid-template-columns:repeat(' + size.cols + ',1fr);--h:' + size.h + 'px;--f:' + size.f + 'px' });
    state.players.forEach(function (p) {
      var nm = h('div', { class: 'nm' }, p.name);
      var sc = size.sm ? h('small', { text: '' }) : null;
      if (sc) nm.appendChild(sc);
      var plus = h('button', { class: 'plus', 'aria-label': 'Ajouter ' + step + ' point' + (step > 1 ? 's' : '') + ' à ' + p.name });
      var minus = h('button', { class: 'minus', 'aria-label': 'Corriger : retirer ' + step + ' point' + (step > 1 ? 's' : '') + ' à ' + p.name, text: '−' + step });
      var chip = h('div', { class: 'pchip' }, nm, minus, plus);
      function paint() {
        var d = state.awarded[p.id] || 0;
        plus.textContent = d > 0 ? '✓ +' + d : d < 0 ? '−' + (-d) : '+' + step;
        chip.classList.toggle('got', d > 0);
        var cur = state.players.filter(function (x) { return x.id === p.id; })[0];
        if (sc) sc.textContent = 'Score : ' + pts(cur.score);
      }
      plus.addEventListener('click', function () { change(p.id, +step); paint(); });
      minus.addEventListener('click', function () { change(p.id, -step); paint(); });
      paint();
      grid.appendChild(chip);
    });
    // −N : outil de correction de l'animateur (annuler une attribution), jamais une pénalité ; jamais sous 0.
    function change(id, d) {
      var cur = state.players.filter(function (x) { return x.id === id; })[0];
      var before = cur.score;
      state.players = L.adjust(state.players, id, d);
      var applied = state.players.filter(function (x) { return x.id === id; })[0].score - before;
      if (!applied) return;
      state.awarded[id] = (state.awarded[id] || 0) + applied;
      save();
    }
    return h('div', { class: 'award' },
      h('div', { class: 'row1' }, h('h2', { text: 'Qui a trouvé la bonne réponse ?' + (step > 1 ? ' (' + step + ' points)' : '') }),
        h('div', { class: 'btns' },
          h('button', { class: 'btn outline small', onclick: function () { state.phase = 'revealed'; save(); question(); } }, 'Revoir l’explication'), nextBtn)), grid);
  }

  function next() {
    var p = pos(state.idx), indiv = indivMode();
    if (state.idx >= N - 1) {
      if (indiv) { state.rankMode = 'finale'; go('ranking'); } else { state.podiumStep = 0; state.justRevealed = -1; go('final'); }
      return;
    }
    state.idx++; state.selected = null; state.awarded = {}; state.phase = firstPhase(Q[state.idx]);
    if (p.last) {
      if (indiv && CFG.rankingAfterChapters.indexOf(p.ch.no) >= 0) { state.rankMode = 'between'; state.rankChapter = p.ch.no; go('ranking'); }
      else go('intro');
    } else go('question');
  }

  /* ---------- classement ---------- */
  function ranking() {
    var mode = state.rankMode || 'peek';
    var rows = L.ranking(state.players);
    var n = rows.length;
    var twoCols = n > 8;
    var rowsPerCol = twoCols ? Math.ceil(n / 2) : Math.max(n, 1);
    var avail = 560;
    var rh = Math.max(46, Math.min(84, Math.floor((avail - (rowsPerCol - 1) * 12) / rowsPerCol)));
    var rf = rh >= 70 ? 34 : rh >= 56 ? 30 : 26;
    var max = Math.max.apply(null, rows.map(function (r) { return r.player.score; }).concat([1]));
    var list = h('div', { class: 'rlist', style: '--rows:' + rowsPerCol + ';--rh:' + rh + 'px;--rf:' + rf + 'px;grid-template-columns:' + (twoCols ? '1fr 1fr' : '1fr') });
    var bars = [], step = mode === 'finale' ? Math.min(0.45, 6 / Math.max(n, 1)) : 0.05;
    rows.forEach(function (r, i) {
      var bar = h('div', { class: 'bar' });
      var delay = mode === 'finale' ? (n - 1 - i) * step : Math.min(i * 0.05, 0.6);
      bars.push([bar, r.player.score / max, delay]);
      list.appendChild(h('div', { class: 'rrow' + (r.rank === 1 && r.player.score > 0 ? ' first' : ''), style: 'animation-delay:' + delay + 's' },
        bar, h('span', { class: 'rk r' + r.rank, text: L.rankLabel(r.rank) }), h('span', { class: 'nm', text: r.player.name }),
        h('span', { class: 'sc', text: pts(r.player.score) })));
    });
    var title = mode === 'finale' ? 'CLASSEMENT FINAL' : 'CLASSEMENT';
    var subtitle = null, btn;
    if (mode === 'between') {
      var cn = state.rankChapter || (Q[Math.max(state.idx - 1, 0)].chapterNo);
      subtitle = (CFG.rankingNotes && CFG.rankingNotes[cn]) || ('Après la manche ' + cn);
      btn = h('button', { class: 'btn', onclick: function () { go('intro'); } }, 'Continuer', icon('arrow'));
    } else if (mode === 'finale') {
      btn = h('button', { class: 'btn orange a-up', style: 'animation-delay:' + ((n * step) + 0.8) + 's', onclick: startPodium }, 'Voir le podium', icon('arrow'));
    } else {
      btn = h('button', { class: 'btn', onclick: function () { go(prevScreen === 'ranking' ? 'question' : prevScreen); } }, 'Retour au quiz', icon('arrow'));
    }
    var withPhoto = !twoCols && mode !== 'finale';
    var s = h('div', { class: 'screen rank' + (withPhoto ? ' withphoto' : '') },
      withPhoto ? imageBox(CFG.imagesDir + 'ranking.jpg', { cls: 'a-zoom', alt: 'Illustration' }) : null,
      h('div', { class: 'head' }, logo()),
      h('div', { class: 'wrap' },
        h('h1', { class: 'title-serif a-up', text: title }),
        subtitle ? h('div', { class: 'rsub', text: subtitle }) : null,
        n ? list : h('p', { class: 'hint', style: 'font-size:34px', text: 'Aucun participant.' }),
        h('div', null, btn)));
    show(s);
    requestAnimationFrame(function () { requestAnimationFrame(function () { bars.forEach(function (b) { b[0].style.transitionDelay = b[2] + 's'; b[0].style.width = Math.max(b[1] * 100, 0) + '%'; }); }); });
  }
  function startPodium() { state.podiumStep = 0; state.justRevealed = -1; go('final'); }

  /* ---------- final : podium révélé 3e → 2e → 1er ---------- */
  function podiumTop() {
    var rows = L.ranking(state.players);
    var scored = rows.filter(function (r) { return r.player.score > 0; });
    return (scored.length ? scored : rows).slice(0, 3);
  }
  function finalScreen() {
    var group = state.mode === 'group' || !state.players.length;
    var rows = L.ranking(state.players);
    var top = group ? [] : podiumTop();
    var total = top.length, step = Math.min(state.podiumStep || 0, total);
    var done = group || step >= total;
    var s = h('div', { class: 'screen final' + (group ? ' group' : '') + (done ? '' : ' revealing') },
      h('div', { class: 'bg', style: 'background: linear-gradient(160deg, #DCEFE8, #F5F1E9 55%, #F6DEC4)' }),
      h('div', { class: 'head' }, logo()),
      h('h1', { class: 'title-serif a-up', text: 'BRAVO À TOUS !' }),
      h('div', { class: 'subt a-up d1', text: CFG.title + ' — ' + CFG.subtitle }));
    if (!group) {
      var pod = h('div', { class: 'podium' + (total === 1 ? ' solo' : '') });
      var colors = { 1: '#DA8548', 2: '#9A9FA2', 3: '#C58A5A' };
      top.forEach(function (r, i) {
        var shown = (total - i) <= step;            // 3e d'abord, puis 2e, puis 1er
        var fresh = state.justRevealed === i;
        pod.appendChild(h('div', { class: 'pod p' + (i + 1) + (shown ? '' : ' hide') + (shown && !fresh ? ' noanim' : '') },
          h('span', { html: ICON.trophy(colors[i + 1]), style: 'display:flex', 'aria-hidden': 'true' }),
          h('div', { class: 'nm', text: r.player.name }), h('div', { class: 'sc', text: pts(r.player.score) }),
          h('div', { class: 'blk', text: shown ? L.rankLabel(r.rank) : String(i + 1) })));
      });
      s.appendChild(pod);
      if (!done) {
        var place = total - step; // 3, 2, 1
        var lab = place === 1 ? 'Révéler la 1re place' : 'Révéler la ' + place + 'e place';
        s.appendChild(h('div', { class: 'podstep' }, h('button', { class: 'btn orange', onclick: revealNextPodium }, lab, icon('arrow'))));
      } else {
        var lst = h('div', { class: 'lst' });
        rows.forEach(function (r) {
          lst.appendChild(h('div', { class: 'r' }, h('span', { class: 'rk r' + r.rank, text: L.rankLabel(r.rank) }), h('span', { class: 'nm', text: r.player.name }), h('b', { text: pts(r.player.score) })));
        });
        s.appendChild(h('div', { class: 'fullrank a-up d3' }, h('h2', { text: 'Classement complet' }), lst));
      }
    }
    if (done) {
      s.appendChild(h('div', { class: 'thanks a-up d3' }, h('p', { text: 'Merci pour votre participation !' }),
        h('div', { class: 'org' }, 'OBEO RESIDENCES', h('small', { text: 'Toulouse Guillaumet' }))));
      s.appendChild(h('div', { class: 'again a-up d4' }, h('button', { class: 'btn', onclick: replay }, 'Rejouer', icon('arrow'))));
    }
    show(s);
    if (done) startConfetti();
  }
  function revealNextPodium() {
    var total = podiumTop().length;
    if ((state.podiumStep || 0) >= total) return;
    state.podiumStep = (state.podiumStep || 0) + 1;
    state.justRevealed = total - state.podiumStep;
    finalScreen();
  }
  function replay() {
    state.players = L.resetScores(state.players);
    state.idx = 0; state.phase = firstPhase(Q[0]); state.selected = null; state.awarded = {}; state.rankMode = 'peek'; state.podiumStep = 0; state.justRevealed = -1;
    lastProgress = 0;
    if (state.test) { go('testmenu'); return; }
    go('players');
  }

  /* ---------- confettis légers (écran final uniquement) ---------- */
  var cv = document.getElementById('confetti'), raf = null, parts = [], t0 = 0;
  function startConfetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopConfetti();
    var dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var cols = ['#247F78', '#DA8548', '#E9DCC3', '#7FB8B1', '#F0C79E'];
    parts = [];
    for (var i = 0; i < 70; i++) parts.push({ x: Math.random() * innerWidth, y: -Math.random() * innerHeight, w: 8 + Math.random() * 8, h: 5 + Math.random() * 6,
      c: cols[i % cols.length], vy: 40 + Math.random() * 50, vx: -12 + Math.random() * 24, ph: Math.random() * 6, a: .75 });
    t0 = performance.now(); var last = t0;
    (function tick(now) {
      var dt = Math.min((now - last) / 1000, .05); last = now;
      var el = (now - t0) / 1000;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(function (p) {
        p.y += p.vy * dt; p.x += (p.vx + Math.sin(el + p.ph) * 14) * dt;
        if (p.y > innerHeight + 20 && el < 9) { p.y = -20; p.x = Math.random() * innerWidth; }
        ctx.globalAlpha = p.a * (el > 9 ? Math.max(0, 1 - (el - 9)) : 1);
        ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.w, p.h);
      });
      if (el < 10) raf = requestAnimationFrame(tick); else stopConfetti();
    })(t0);
  }
  function stopConfetti() {
    if (raf) cancelAnimationFrame(raf); raf = null;
    var c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  }

  /* =====================================================================
     MODE TEST ANIMATEUR (accès discret : roue crantée en bas à gauche de l'accueil, ou touche T sur l'accueil)
     Non sauvegardé : un rechargement de page ramène à la partie réelle.
     ===================================================================== */
  var DEMO = ['Marie', 'Jean', 'Monique', 'Pierre'];
  function enterTest() {
    state.test = true; state.mode = 'individual';
    if (!state.players.length) { DEMO.forEach(function (n) { state.players = L.addPlayer(state.players, n, state.nextId++); }); }
    state.idx = 0; state.phase = firstPhase(Q[0]); state.selected = null; state.awarded = {}; state.rankMode = 'peek'; state.podiumStep = 0; state.justRevealed = -1;
    go('testmenu');
  }
  function clearTest() { testbar.hidden = true; }
  function exitTest() { reset(); clearTest(); go('home'); }
  function toIntro(chIdx) { state.idx = CH[chIdx].start; state.phase = firstPhase(Q[state.idx]); state.selected = null; state.awarded = {}; lastProgress = 0; go('intro'); }
  function toQuestion(i, phase) {
    i = Math.max(0, Math.min(N - 1, i));
    state.idx = i; state.phase = phase || firstPhase(Q[i]); state.selected = null; state.awarded = {}; state.mode = 'individual';
    if (!state.players.length) DEMO.forEach(function (n) { state.players = L.addPlayer(state.players, n, state.nextId++); });
    go('question');
  }
  function randomScores() {
    state.players = state.players.map(function (p) { return Object.assign({}, p, { score: Math.floor(Math.random() * 28) }); });
  }
  function testRanking(mode, ch) { prevScreen = 'testmenu'; state.rankMode = mode; state.rankChapter = ch || CFG.rankingAfterChapters[0]; go('ranking'); }
  function testPodium() {
    if (!state.players.some(function (p) { return p.score > 0; })) randomScores();
    state.mode = 'individual'; state.podiumStep = 0; state.justRevealed = -1; go('final');
  }
  function testStep(d) {
    if (state.screen === 'intro') { if (d > 0) startChapter(); else toIntro(Math.max(0, chapterOf(state.idx).idx - 1)); return; }
    if (state.screen === 'question') { toQuestion(state.idx + d); return; }
    toQuestion(state.idx + (d > 0 ? 0 : 0));
  }
  function drawTestbar() {
    if (!state.test) { testbar.hidden = true; return; }
    buildBar(state.screen === 'testmenu');
  }
  var barMin = false;
  function buildBar(onMenu) {
    testbar.hidden = false; testbar.className = barMin ? 'min' : '';
    testbar.innerHTML = '';
    var b = function (t, fn, id) { var e = h('button', { type: 'button', text: t, onclick: fn }); if (id) e.id = id; return e; };
    testbar.appendChild(h('span', { class: 'tb-label', text: 'TEST' }));
    if (!onMenu) {
      testbar.appendChild(b('◀ Préc.', function () { testStep(-1); }, 'tb-prev'));
      testbar.appendChild(b('Suiv. ▶', function () { testStep(+1); }, 'tb-next'));
      testbar.appendChild(b('Classement', function () { testRanking('peek'); }, 'tb-rank'));
      testbar.appendChild(b('Podium', testPodium, 'tb-podium'));
    }
    testbar.appendChild(b('Menu test', function () { clearTestOverlays(); go('testmenu'); }, 'tb-menu'));
    testbar.appendChild(b('Quitter le test', exitTest, 'tb-exit'));
    var t = b(barMin ? '＋' : '–', function () { barMin = !barMin; buildBar(onMenu); }); t.className = 'tb-toggle'; testbar.appendChild(t);
  }
  function clearTestOverlays() { stopConfetti(); }

  function testMenu() {
    var s = h('div', { class: 'screen testmenu' },
      h('h1', { class: 'title-serif', text: 'Mode test animateur' }),
      h('p', { class: 'note', text: 'Réservé à l’animateur · participants et scores d’essai · rien n’est enregistré · « Quitter le test » ramène à une partie vierge.' }));
    s.appendChild(h('h3', { text: 'Manches (écran d’introduction)' }));
    var chRow = h('div', { class: 'tmrow' });
    CH.forEach(function (c) { chRow.appendChild(h('button', { class: 'tmbtn', onclick: function () { toIntro(c.idx); }, style: 'flex:1;min-width:270px' }, 'M. ' + c.no + ' · ' + c.title, h('small', { text: c.count + ' épreuves' }))); });
    s.appendChild(chRow);
    s.appendChild(h('h3', { text: 'Épreuves (accès direct)' }));
    CH.forEach(function (c) {
      var row = h('div', { class: 'tmchap' }, h('div', { class: 'lab', text: c.no + '. ' + c.title }));
      Q.filter(function (q) { return q.ch === c.idx; }).forEach(function (q) {
        row.appendChild(h('button', { class: 'tmbtn tmq' + (q.points > 1 ? ' bonus' : '') + (q.placeholder ? ' ph' : ''), title: q.id + ' · ' + q.type, onclick: function () { toQuestion(q.n); } },
          (q.n + 1) + (q.points > 1 ? ' ★' : ''), h('small', { text: window.AnimauxModel.TYPE_SHORT[q.type] })));
      });
      s.appendChild(row);
    });
    s.appendChild(h('h3', { text: 'Classements et podium' }));
    s.appendChild(h('div', { class: 'tmrow' },
      h('button', { class: 'btn small', onclick: function () { go('home'); } }, 'Accueil'),
      h('button', { class: 'btn small', onclick: function () { testRanking('between', 2); } }, 'Classement Q12'),
      h('button', { class: 'btn small', onclick: function () { testRanking('between', 4); } }, 'Classement Q24'),
      h('button', { class: 'btn small', onclick: function () { toIntro(CH.length - 1); } }, 'Finale'),
      h('button', { class: 'btn small', onclick: function () { testRanking('finale'); } }, 'Classement final animé'),
      h('button', { class: 'btn orange small', onclick: testPodium }, 'Podium (progressif)'),
      h('button', { class: 'btn outline small', onclick: function () { randomScores(); testMenu(); } }, 'Scores d’essai aléatoires'),
      h('button', { class: 'btn outline small', onclick: exitTest }, 'Quitter le test')));
    show(s);
  }

  /* ---------- clavier ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    var q = state.screen === 'question' ? Q[state.idx] : null;
    var twoChoose = q && q.kind === 'two' && state.phase === 'choose';
    if (k === 'f' && !twoChoose) { toggleFull(); return; } // (Vrai/Faux : F = FAUX → bouton ou F11 pour le plein écran)
    if (state.screen === 'home' && k === 't') { enterTest(); return; }
    if (state.screen === 'intro' && k === 'enter') { startChapter(); return; }
    if (state.screen === 'ranking' && k === 'enter' && state.rankMode !== 'peek') { if (state.rankMode === 'between') go('intro'); else startPodium(); return; }
    if (state.screen === 'final' && k === 'enter') { if (state.mode === 'individual' && (state.podiumStep || 0) < podiumTop().length) revealNextPodium(); return; }
    if (q) {
      if (state.phase === 'look') { if (k === 'enter') { state.phase = 'choose'; save(); question(); } }
      else if (state.phase === 'choose') {
        var map = q.kind === 'two' ? { v: 0, f: 1, '1': 0, '2': 1 } : { a: 0, b: 1, c: 2, '1': 0, '2': 1, '3': 2 };
        if (q.type === 'legend') map = { f: 0, l: 1, '1': 0, '2': 1 };
        var i = map[k];
        if (i != null) selectAnswer(i);
        else if (k === 'enter' && state.selected != null) reveal();
      } else if (k === 'enter' && state.phase === 'revealed' && document.activeElement && document.activeElement.tagName !== 'BUTTON') {
        if (indivMode()) { state.phase = 'award'; save(); question(); } else next();
      }
    }
  });
  document.addEventListener('fullscreenchange', fit);

  /* ---------- démarrage ---------- */
  fit();
  load();
  if (M.errors.length) showErrors(); else render();
  window.__quiz = {
    get state() { return state; }, model: M,
    jump: function (idx, phase) { toQuestion(idx, phase); }
  };
})();
