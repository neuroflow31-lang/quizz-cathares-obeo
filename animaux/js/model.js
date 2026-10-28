/* Modèle du quiz « Le monde animal » : normalise et valide quiz-data.js (utilisable dans le navigateur ET dans Node). */
(function (root) {
  var TYPES = {
    qcm:        { kind: 'abc', think: false, label: '' },
    visual:     { kind: 'abc', think: true,  label: 'Question visuelle' },
    riddle:     { kind: 'abc', think: true,  label: 'Mini-énigme' },
    reflection: { kind: 'abc', think: true,  label: 'Question de réflexion' },
    situation:  { kind: 'abc', think: true,  label: 'Situation' },
    challenge:  { kind: 'abc', think: true,  label: 'Mini-défi' },
    tf:         { kind: 'two', think: false, label: 'Vrai ou faux ?', labels: ['VRAI', 'FAUX'] },
    legend:     { kind: 'two', think: false, label: 'Fait ou légende ?', labels: ['FAIT', 'LÉGENDE'] }
  };
  var TYPE_SHORT = { qcm: 'QCM', visual: 'Visuel', riddle: 'Énigme', reflection: 'Réflexion', situation: 'Situation', challenge: 'Mini-défi', tf: 'V/F', legend: 'Légende' };

  function enc(path) { return String(path).split('/').map(function (s) { return encodeURIComponent(s).replace(/'/g, '%27'); }).join('/'); }
  function strip(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim(); }
  function isPlaceholder(s) { return /^\[.*(remplacer|à fournir).*\]/i.test(String(s || '')) || /^\[/.test(String(s || '').trim()); }

  function parseAnswer(raw, spec, errs, id) {
    var a = raw.answer;
    if (spec.kind === 'abc') {
      var i = typeof a === 'number' ? a : 'ABC'.indexOf(String(a).trim().toUpperCase());
      if (!(i >= 0 && i < 3) || (typeof a === 'string' && String(a).trim().length !== 1)) { errs.push(id + ' : answer doit valoir "A", "B" ou "C" (reçu : ' + JSON.stringify(a) + ')'); return 0; }
      return i;
    }
    var k = strip(a === true ? spec.labels[0] : a === false ? spec.labels[1] : a);
    var norm = spec.labels.map(strip);
    var j = norm.indexOf(k);
    if (j < 0) { errs.push(id + ' : answer doit valoir ' + spec.labels.join(' ou ') + ' (reçu : ' + JSON.stringify(a) + ')'); return 0; }
    return j;
  }

  function build(data) {
    var cfg = data.CONFIG, errors = [], warnings = [];
    var chapters = [], questions = [], pos = 0;
    var dir = cfg.imagesDir || 'assets/images/';
    data.CHAPTERS.forEach(function (c, ci) {
      var ch = { no: c.no || ci + 1, idx: ci, title: c.title, hook: c.hook || '', count: c.count, start: pos,
        image: enc(dir + (c.image || ('ch' + (ci + 1) + '.jpg'))), explicitImage: !!c.image };
      chapters.push(ch); pos += c.count;
    });
    var perChapter = chapters.map(function () { return 0; });
    var ids = {};
    data.QUESTIONS.forEach(function (r, n) {
      var id = r.id || ('#' + (n + 1)), spec = TYPES[r.type];
      if (ids[id]) errors.push(id + ' : identifiant en double'); ids[id] = 1;
      if (!spec) { errors.push(id + ' : type inconnu « ' + r.type + ' » (attendu : ' + Object.keys(TYPES).join(', ') + ')'); return; }
      var ci = (r.chapter || 0) - 1;
      if (!chapters[ci]) { errors.push(id + ' : manche invalide'); return; }
      perChapter[ci]++;
      if (!r.question || !String(r.question).trim()) errors.push(id + ' : question vide');
      var answers;
      if (spec.kind === 'abc') {
        answers = (r.choices || []).slice();
        if (answers.length !== 3 || answers.some(function (x) { return !String(x).trim(); })) errors.push(id + ' : 3 choix non vides attendus');
        else if (new Set(answers).size !== 3) errors.push(id + ' : choix en double');
      } else answers = spec.labels.slice();
      var correct = parseAnswer(r, spec, errors, id);
      var ph = isPlaceholder(r.question) || (spec.kind === 'abc' && answers.some(isPlaceholder)) || isPlaceholder(r.explanation);
      if (!ph && !String(r.explanation || '').trim()) warnings.push(id + ' : explication vide');
      var anecdote = String(r.anecdote || '').trim();
      if (anecdote && !isPlaceholder(anecdote)) {
        var sentences = (anecdote.match(/[.!?…](\s|$)/g) || []).length;
        if (sentences > 4) warnings.push(id + ' : anecdote trop longue (' + sentences + ' phrases, 4 maximum)');
      }
      var img = r.image ? dir + r.image : dir + id + '.jpg';
      questions.push({ id: id, n: questions.length, ch: ci, chapterNo: chapters[ci].no, type: r.type, kind: spec.kind,
        typeLabel: spec.label, think: r.think != null ? !!r.think : (spec.think || (spec.kind === 'two' && !!r.image)),
        q: String(r.question || ''), clues: (r.clues || []).slice(), answers: answers, correct: correct,
        explanation: String(r.explanation || ''), anecdote: anecdote, short: r.short ? String(r.short) : '', points: r.points || 1,
        image: enc(img), explicitImage: !!r.image, fit: r.imageFit === 'contain' ? 'contain' : 'cover',
        credit: r.credit || '', source: r.source || '', placeholder: ph });
    });
    chapters.forEach(function (c, i) {
      if (perChapter[i] !== c.count) errors.push('Manche ' + c.no + ' « ' + c.title + ' » : ' + c.count + ' questions attendues, ' + perChapter[i] + ' trouvée(s)');
    });
    // l'ordre des questions doit suivre l'ordre des chapitres
    var last = 0; questions.forEach(function (q) { if (q.ch < last) errors.push(q.id + ' : mal placée (les questions doivent suivre l’ordre des manches)'); last = Math.max(last, q.ch); });
    var abc = questions.filter(function (q) { return q.kind === 'abc' && !q.placeholder; });
    if (abc.length >= 6) {
      var cnt = [0, 0, 0]; abc.forEach(function (q) { cnt[q.correct]++; });
      if (Math.max.apply(null, cnt) / abc.length > 0.5) warnings.push('Bonnes réponses A/B/C mal réparties : A=' + cnt[0] + ' B=' + cnt[1] + ' C=' + cnt[2]);
    }
    return { config: cfg, chapters: chapters, questions: questions, errors: errors, warnings: warnings,
      placeholders: questions.filter(function (q) { return q.placeholder; }).length };
  }
  var api = { build: build, TYPES: TYPES, TYPE_SHORT: TYPE_SHORT, enc: enc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AnimauxModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
