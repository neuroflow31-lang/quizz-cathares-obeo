/* Quiz Les Cathares en Occitanie — OBEO Toulouse Guillaumet. Aucune dépendance, aucun serveur nécessaire. */
(function () {
  'use strict';
  var Q = window.QuizData.QUESTIONS, PHOTOS = window.QuizData.PHOTOS, LETTERS = window.QuizData.LETTERS;
  var L = window.QuizLogic;
  var KEY = 'obeo-quiz-cathares-v1';
  var stage = document.getElementById('stage');

  /* ---------- état ---------- */
  var state = fresh();
  function fresh() {
    return { screen: 'home', mode: 'individual', players: [], nextId: 1, idx: 0, phase: 'choose', selected: null, awarded: {} };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.screen && Array.isArray(s.players) && typeof s.idx === 'number' && s.idx >= 0 && s.idx < Q.length) state = Object.assign(fresh(), s);
    } catch (e) {}
    if (state.screen === 'ranking' && state.mode === 'group') state.screen = 'question';
  }
  function reset() { state = fresh(); save(); }
  var selectHook = null;
  function selectAnswer(i) { if (selectHook) selectHook(i); }
  var prevScreen = 'question'; // écran à retrouver depuis le classement

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
      if (Array.isArray(c)) { c.forEach(function (x) { el.appendChild(x); }); continue; }
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }
  var ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="#B85A1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z" fill="#F6DEC4"/></svg>',
    trophy: function (c) { return '<svg class="trophy" viewBox="0 0 64 64"><path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="' + c + '"/><path d="M18 12H8c0 10 4 16 12 17M46 12h10c0 10-4 16-12 17" fill="none" stroke="' + c + '" stroke-width="4"/><rect x="28" y="36" width="8" height="12" fill="' + c + '"/><rect x="20" y="48" width="24" height="8" rx="3" fill="' + c + '"/></svg>'; }
  };
  function icon(name, cls) { var s = h('span', { html: ICON[name], class: cls || '', 'aria-hidden': 'true', style: 'display:inline-flex' }); return s; }
  function leaves(style) {
    return h('div', { class: 'leaves', 'aria-hidden': 'true', style: style, html:
      '<svg viewBox="0 0 220 200" width="100%" height="100%"><path d="M10 190C0 110 50 40 130 30c10 80-30 150-120 160z" fill="#DA8548"/>' +
      '<path d="M70 195C60 140 100 90 170 85c5 60-30 105-100 110z" fill="#247F78" opacity=".92"/><path d="M130 190c-5-40 20-70 70-75 3 40-20 70-70 75z" fill="#DA8548" opacity=".7"/></svg>' });
  }
  function logo(cls) { return h('img', { class: 'logo ' + (cls || ''), src: 'assets/logo/obeo-logo.png', alt: 'OBEO Résidences — Le bien-être à portée de main' }); }
  function photoBox(key, cls, withCap) {
    var p = PHOTOS[key] || PHOTOS.paysage;
    var box = h('div', { class: 'photo ' + (cls || '') }, h('img', { src: p.src, alt: p.label + ' (' + p.sub + ')' }));
    if (withCap && key !== 'hero') box.appendChild(h('div', { class: 'cap' }, p.label, h('small', { text: p.sub })));
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
  function show(node) {
    stage.innerHTML = '';
    stage.appendChild(node);
    save();
  }
  function go(screen) { state.screen = screen; render(); }
  function render() {
    var fn = { home: home, players: players, question: question, ranking: ranking, final: finalScreen }[state.screen] || home;
    fn();
    if (state.screen !== 'final') stopConfetti();
  }

  /* ---------- accueil ---------- */
  function home() {
    var s = h('div', { class: 'screen home' },
      photoBox('hero', 'a-zoom'),
      leaves('left:-30px;bottom:-20px;width:300px;height:270px;opacity:.95'),
      h('div', { class: 'col' },
        h('div', { class: 'a-up d1' }, logo()),
        h('h1', { class: 'title-serif a-up d2' }, h('span', { class: 'q', text: 'QUIZ' }), h('span', { class: 't', text: 'LES CATHARES' }), h('span', { class: 't', text: 'EN OCCITANIE' })),
        h('div', { class: 'rule a-up d2' }),
        h('p', { class: 'sub a-up d2', text: 'Une histoire au cœur de notre région' }),
        h('div', { class: 'place a-up d2', text: 'OBEO Toulouse Guillaumet' }),
        h('div', { class: 'a-up d3' }, h('button', { class: 'btn', onclick: function () { go('players'); } }, 'Commencer le quiz', icon('arrow')))
      ));
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
      photoBox('paysage', 'a-zoom', true),
      h('div', { class: 'col' },
        logo(),
        h('h1', { class: 'title-serif a-up', text: 'QUI PARTICIPE AUJOURD’HUI ?' }),
        h('p', { class: 'hint', text: 'Ajoutez les prénoms des participants.' }),
        h('div', { class: 'add-row' }, input, h('button', { class: 'btn orange', onclick: add }, '+ Ajouter un participant')),
        msg,
        list,
        h('div', { class: 'actions' }, startBtn, h('button', { class: 'btn outline', onclick: function () { beginGame('group'); } }, 'Jouer tous ensemble'), count)));
    show(s);
    drawList();
    // pas d'autofocus automatique forcé sur écran tactile ; utile à la souris/clavier
    setTimeout(function () { input.focus(); }, 50);
  }

  function beginGame(mode) {
    state.mode = mode; state.idx = 0; state.phase = 'choose'; state.selected = null; state.awarded = {};
    state.players = L.resetScores(state.players);
    lastProgress = 0;
    go('question');
  }

  /* ---------- en-tête commun ---------- */
  function header(opts) {
    var done = opts.progress;
    var bar = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(Q.length), 'aria-valuenow': String(Math.round(done * Q.length)) }, h('i', { style: 'width:' + lastProgress * 100 + '%' }));
    var fill = bar.firstChild;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = done * 100 + '%'; }); });
    lastProgress = done;
    var right = [];
    if (opts.ranking && state.mode === 'individual') right.push(h('button', { class: 'icon-btn', onclick: openRanking }, icon('list'), 'Voir le classement'));
    right.push(h('button', { class: 'icon-btn', onclick: toggleFull, 'aria-label': 'Plein écran' }, icon('full'), 'Plein écran'));
    right.push(h('button', { class: 'icon-btn', onclick: askQuit, 'aria-label': 'Quitter la partie' }, icon('x'), 'Quitter'));
    return h('div', { class: 'head' }, logo(), bar,
      opts.pill ? h('div', { class: 'pill', text: opts.pill }) : null, right);
  }
  function askQuit() {
    var box = h('div', { class: 'confirm' }, h('div', { class: 'box' },
      h('h2', { text: 'Quitter la partie ?' }),
      h('p', { text: 'Les scores seront effacés et vous reviendrez à l’accueil.' }),
      h('div', { class: 'row' },
        h('button', { class: 'btn outline small', onclick: function () { box.remove(); } }, 'Non, continuer'),
        h('button', { class: 'btn small', onclick: function () { reset(); go('home'); } }, 'Oui, quitter'))));
    stage.appendChild(box);
  }
  function openRanking() { prevScreen = state.screen === 'ranking' ? prevScreen : state.screen; go('ranking'); }

  /* ---------- question ---------- */
  function question() {
    var q = Q[state.idx];
    var revealed = state.phase === 'revealed';
    var mode = state.mode;
    var s = h('div', { class: 'screen' + (revealed ? ' rev' + (mode === 'group' || !state.players.length ? ' group' : '') + (state.players.length > 10 && mode === 'individual' ? ' many' : '') : '') });
    s.appendChild(header({ progress: (state.idx + (revealed ? 1 : 0)) / Q.length, pill: 'Question ' + (state.idx + 1) + ' / ' + Q.length, ranking: true }));

    function answerNode(a, i) {
      var cls = 'answer' + (a.length > 52 ? ' long' : '');
      var tag = null;
      if (revealed) {
        cls += ' locked';
        if (i === q.correct) { cls += ' good'; tag = h('span', { class: 'tag' }, icon('check'), 'Bonne réponse'); }
        else if (i === state.selected) { cls += ' bad'; tag = h('span', { class: 'tag' }, icon('cross'), 'Réponse choisie'); }
      } else if (i === state.selected) cls += ' sel';
      var b = h('button', { class: cls, 'aria-pressed': (!revealed && i === state.selected) ? 'true' : 'false',
        onclick: revealed ? null : function () { selectAnswer(i); } },
        h('span', { class: 'lt', text: LETTERS[i] }), h('span', { class: 'tx', text: a }), tag, (!revealed ? h('span', { class: 'dot' }) : null));
      if (revealed) b.setAttribute('tabindex', '-1');
      return b;
    }
    var answers = h('div', { class: 'answers' }, q.answers.map(answerNode));
    var validate = null;
    // la sélection est mise à jour sur place (pas de nouvelle animation d'écran)
    selectHook = revealed ? null : function (i) {
      state.selected = i; save();
      Array.prototype.forEach.call(answers.children, function (b, j) {
        b.classList.toggle('sel', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      validate.setAttribute('aria-disabled', 'false');
    };

    if (!revealed) {
      var side = h('div', { class: 'qside' }, photoBox(q.photo, 'a-zoom', true));
      if (mode === 'individual' && state.players.length) side.appendChild(miniRanking());
      s.appendChild(side);
      validate = h('button', { class: 'btn', 'aria-disabled': state.selected == null ? 'true' : 'false',
        onclick: function () { if (state.selected != null) reveal(); } }, 'Valider la réponse', icon('arrow'));
      s.appendChild(h('div', { class: 'qmain' },
        h('h1', { class: 'qtext a-up', text: q.q }), answers,
        h('div', { class: 'qactions' }, validate,
          h('button', { class: 'btn outline small', onclick: reveal }, 'Afficher la réponse'))));
    } else {
      var left = h('div', { class: 'left' }, h('h1', { class: 'qtext', text: q.q }), answers);
      var right = h('div', { class: 'right' }, photoBox(q.photo, 'a-zoom', true),
        h('div', { class: 'savez' }, h('h2', null, icon('bulb'), 'Le saviez-vous ?'), h('p', { text: q.explanation })));
      s.appendChild(h('div', { class: 'qmain' }, left, right));
      var last = state.idx === Q.length - 1;
      var nextBtn = h('button', { class: 'btn orange', onclick: next }, last ? 'Voir le résultat' : 'Question suivante', icon('arrow'));
      if (mode === 'individual' && state.players.length) s.appendChild(awardPanel(nextBtn));
      else s.appendChild(h('div', { class: 'award', style: 'background:none;align-items:flex-end;padding:0 0 4px' }, nextBtn));
    }
    show(s);
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
        h('span', { class: 'rk r' + r.rank, text: L.rankLabel(r.rank) }), h('span', { class: 'n', text: r.player.name }), h('b', { text: r.player.score + ' pt' + (r.player.score > 1 ? 's' : '') })));
    });
    if (state.players.length > 5) card.appendChild(h('div', { class: 'r', style: 'color:#5F5C56;font-weight:500;font-size:24px', text: '… et ' + (state.players.length - 5) + ' autre(s) — voir le classement' }));
    return card;
  }

  function reveal() { state.phase = 'revealed'; state.awarded = {}; save(); question(); }

  function awardPanel(nextBtn) {
    var n = state.players.length;
    var size = n <= 6 ? { cols: 3, h: 104, f: 34, sm: true } : n <= 10 ? { cols: 5, h: 92, f: 30, sm: true }
      : n <= 15 ? { cols: 5, h: 76, f: 28 } : n <= 20 ? { cols: 5, h: 70, f: 26 } : { cols: 6, h: 64, f: 24 };
    var grid = h('div', { class: 'grid', style: 'grid-template-columns:repeat(' + size.cols + ',1fr);--h:' + size.h + 'px;--f:' + size.f + 'px' });
    var nodes = {};
    state.players.forEach(function (p) {
      var nm = h('div', { class: 'nm' }, p.name);
      var sc = size.sm ? h('small', { text: p.score + ' pt' + (p.score > 1 ? 's' : '') }) : null;
      if (sc) nm.appendChild(sc);
      var plus = h('button', { 'aria-label': 'Ajouter 1 point à ' + p.name }), minus = h('button', { class: 'minus', 'aria-label': 'Retirer 1 point à ' + p.name, text: '−1' });
      plus.className = 'plus';
      var chip = h('div', { class: 'pchip' }, nm, minus, plus);
      function paint() {
        var d = state.awarded[p.id] || 0;
        plus.textContent = d > 0 ? '✓ +' + d : d < 0 ? '+1 (' + d + ')' : '+1';
        chip.classList.toggle('got', d > 0);
        var cur = state.players.filter(function (x) { return x.id === p.id; })[0];
        if (sc) sc.textContent = cur.score + ' pt' + (cur.score > 1 ? 's' : '');
      }
      plus.addEventListener('click', function () { change(p.id, +1); paint(); });
      minus.addEventListener('click', function () { change(p.id, -1); paint(); });
      nodes[p.id] = paint;
      paint();
      grid.appendChild(chip);
    });
    function change(id, d) {
      var cur = state.players.filter(function (x) { return x.id === id; })[0];
      if (d < 0 && cur.score === 0) return; // pas de score négatif
      state.players = L.adjust(state.players, id, d);
      state.awarded[id] = (state.awarded[id] || 0) + d;
      save();
    }
    return h('div', { class: 'award' },
      h('div', { class: 'row1' }, h('h2', { text: 'Qui a trouvé la bonne réponse ?' }), nextBtn), grid);
  }

  function next() {
    if (state.idx >= Q.length - 1) { state.screen = 'final'; state.phase = 'choose'; render(); return; }
    state.idx++; state.phase = 'choose'; state.selected = null; state.awarded = {};
    render();
  }

  /* ---------- classement ---------- */
  function ranking() {
    var rows = L.ranking(state.players);
    var n = rows.length;
    var twoCols = n > 8;
    var rowsPerCol = twoCols ? Math.ceil(n / 2) : Math.max(n, 1);
    var avail = 560; // hauteur de liste approximative
    var rh = Math.max(46, Math.min(84, Math.floor((avail - (rowsPerCol - 1) * 12) / rowsPerCol)));
    var rf = rh >= 70 ? 34 : rh >= 56 ? 30 : 26;
    var max = Math.max.apply(null, rows.map(function (r) { return r.player.score; }).concat([1]));
    var list = h('div', { class: 'rlist', style: '--rows:' + rowsPerCol + ';--rh:' + rh + 'px;--rf:' + rf + 'px;grid-template-columns:' + (twoCols ? '1fr 1fr' : '1fr') });
    var bars = [];
    rows.forEach(function (r, i) {
      var bar = h('div', { class: 'bar' });
      bars.push([bar, r.player.score / max]);
      list.appendChild(h('div', { class: 'rrow' + (r.rank === 1 && r.player.score > 0 ? ' first' : ''), style: 'animation-delay:' + Math.min(i * 0.05, 0.6) + 's' },
        bar, h('span', { class: 'rk r' + r.rank, text: L.rankLabel(r.rank) }), h('span', { class: 'nm', text: r.player.name }),
        h('span', { class: 'sc', text: r.player.score + ' pt' + (r.player.score > 1 ? 's' : '') })));
    });
    var s = h('div', { class: 'screen rank' + (twoCols ? '' : ' withphoto') },
      twoCols ? null : photoBox('montsegur', 'a-zoom', true),
      h('div', { class: 'head' }, logo()),
      h('div', { class: 'wrap' },
        h('h1', { class: 'title-serif a-up', text: 'CLASSEMENT' }),
        n ? list : h('p', { class: 'hint', style: 'font-size:34px', text: 'Aucun participant.' }),
        h('div', null, h('button', { class: 'btn', onclick: function () { go(prevScreen === 'ranking' ? 'question' : prevScreen); } }, 'Retour au quiz', icon('arrow')))));
    show(s);
    requestAnimationFrame(function () { requestAnimationFrame(function () { bars.forEach(function (b) { b[0].style.width = Math.max(b[1] * 100, 0) + '%'; }); }); });
  }

  /* ---------- final ---------- */
  function finalScreen() {
    var group = state.mode === 'group' || !state.players.length;
    var rows = L.ranking(state.players);
    var s = h('div', { class: 'screen final' + (group ? ' group' : '') },
      h('div', { class: 'bg', style: 'background-image:url(' + PHOTOS.paysage.src + ')' }),
      h('div', { class: 'head' }, logo()),
      h('h1', { class: 'title-serif a-up', text: 'BRAVO À TOUS !' }),
      h('div', { class: 'subt a-up d1', text: 'Quiz — Les Cathares en Occitanie' }));
    if (!group) {
      var top = rows.slice(0, 3);
      var pod = h('div', { class: 'podium' + (top.length === 1 ? ' solo' : '') });
      var colors = { 1: '#DA8548', 2: '#9A9FA2', 3: '#C58A5A' };
      top.forEach(function (r, i) {
        var cls = 'p' + (i + 1);
        pod.appendChild(h('div', { class: 'pod ' + cls },
          h('span', { html: ICON.trophy(colors[i + 1]), style: 'display:flex', 'aria-hidden': 'true' }),
          h('div', { class: 'nm', text: r.player.name }), h('div', { class: 'sc', text: r.player.score + ' pt' + (r.player.score > 1 ? 's' : '') }),
          h('div', { class: 'blk', text: L.rankLabel(r.rank) })));
      });
      s.appendChild(pod);
      var lst = h('div', { class: 'lst' });
      rows.forEach(function (r) {
        lst.appendChild(h('div', { class: 'r' }, h('span', { class: 'rk r' + r.rank, text: L.rankLabel(r.rank) }), h('span', { class: 'nm', text: r.player.name }), h('b', { text: r.player.score + ' pt' + (r.player.score > 1 ? 's' : '') })));
      });
      s.appendChild(h('div', { class: 'fullrank a-up d3' }, h('h2', { text: 'Classement complet' }), lst));
    }
    s.appendChild(h('div', { class: 'thanks a-up d3' }, h('p', { text: 'Merci pour votre participation !' }),
      h('div', { class: 'org' }, 'OBEO RESIDENCES', h('small', { text: 'Toulouse Guillaumet' }))));
    s.appendChild(h('div', { class: 'again a-up d4' }, h('button', { class: 'btn', onclick: replay }, 'Rejouer', icon('arrow'))));
    show(s);
    startConfetti();
  }
  function replay() {
    state.players = L.resetScores(state.players);
    state.idx = 0; state.phase = 'choose'; state.selected = null; state.awarded = {};
    lastProgress = 0;
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

  /* ---------- clavier ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 'f') { toggleFull(); return; }
    if (state.screen === 'question') {
      if (state.phase === 'choose') {
        var i = { a: 0, b: 1, c: 2, '1': 0, '2': 1, '3': 2 }[k];
        if (i != null) selectAnswer(i);
        else if (k === 'enter' && state.selected != null) reveal();
      } else if (k === 'enter' && document.activeElement && document.activeElement.tagName !== 'BUTTON') next();
    }
  });
  document.addEventListener('fullscreenchange', fit);

  /* ---------- démarrage ---------- */
  fit();
  load();
  render();
  window.__quiz = { get state() { return state; } }; // utile pour les tests
})();
