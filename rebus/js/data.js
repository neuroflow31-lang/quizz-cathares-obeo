/* ====================================================================================
   « LE GRAND JEU DES RÉBUS OBEO » — CONTENU
   4 manches × 5 rébus · visuel (emojis, formes, SVG locaux) · 2 indices · réponse + explication
   Le visuel est une petite scène de 1600 × 560 : chaque élément est placé avec x, y (coin haut-gauche) et une taille.
   ==================================================================================== */
(function (root) {
  // élément emoji / texte positionné
  function e(ch, x, y, size, extra) {
    return '<span class="el" style="left:' + x + 'px;top:' + y + 'px;font-size:' + size + 'px;' + (extra || '') + '">' + ch + '</span>';
  }
  function box(x, y, w, hgt, extra, inner) {
    return '<div class="el" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + hgt + 'px;' + (extra || '') + '">' + (inner || '') + '</div>';
  }
  function svg(x, y, w, hgt, body, extra) {
    return '<svg class="el" style="left:' + x + 'px;top:' + y + 'px;' + (extra || '') + '" width="' + w + '" height="' + hgt + '" viewBox="0 0 ' + w + ' ' + hgt + '">' + body + '</svg>';
  }
  var ARROW = function (x, y) { return e('➜', x, y, 150, 'color:#B85A1B'); };

  var CONFIG = {
    title: 'LE GRAND JEU DES RÉBUS OBEO',
    finalTitle: 'LE GRAND JEU DES RÉBUS',
    subtitle: '20 rébus à déchiffrer ensemble',
    tagline: '4 manches · 100 points possibles · 1 seule équipe',
    venue: 'OBEO Toulouse Guillaumet'
  };

  var MANCHES = [
    { no: 1, title: 'Mise en route' },
    { no: 2, title: 'Expressions à décoder' },
    { no: 3, title: 'Plus corsée' },
    { no: 4, title: 'Grande finale', finale: true }
  ];

  var REBUS = [
    // ---------------- MANCHE 1 — MISE EN ROUTE ----------------
    { manche: 1, answer: 'ÊTRE DANS LA LUNE',
      visual: box(560, 30, 500, 500, 'border-radius:50%;background:#F2C94C;box-shadow:0 0 60px rgba(242,201,76,.55)') +
              box(700, 0, 470, 470, 'border-radius:50%;background:#fff') +
              e('🤔', 760, 150, 200),
      hint1: 'On dit cela d’une personne distraite.',
      hint2: 'Son esprit semble être très loin d’ici.',
      explain: 'Le personnage rêveur est installé dans le croissant de lune : il « est dans la lune », c’est-à-dire distrait, l’esprit ailleurs.' },
    { manche: 1, answer: 'AVOIR LA TÊTE DANS LES NUAGES',
      visual: e('🙂', 620, 170, 330) + e('☁️', 470, 40, 260, 'z-index:2') + e('☁️', 700, 0, 280, 'z-index:2') + e('☁️', 900, 60, 240, 'z-index:2'),
      hint1: 'Il ne s’agit pas vraiment de météo.',
      hint2: 'On parle d’une personne rêveuse ou distraite.',
      explain: 'Le haut de la tête disparaît dans les nuages : on « a la tête dans les nuages » quand on rêvasse, loin des réalités.' },
    { manche: 1, answer: 'TOURNER AUTOUR DU POT',
      visual: e('🍯', 680, 170, 230) +
              '<div class="el orbit" style="left:500px;top:-10px;width:600px;height:580px">' +
                ['0', '90', '180', '270'].map(function (a) { return '<span style="transform:rotate(' + a + 'deg) translateY(-250px) rotate(-' + a + 'deg)">TOUR</span>'; }).join('') +
                ['45', '135', '225', '315'].map(function (a) { return '<i style="transform:rotate(' + a + 'deg) translateY(-255px) rotate(90deg)">↻</i>'; }).join('') +
              '</div>',
      hint1: 'On évite d’aller directement au sujet.',
      hint2: 'Il y a quelque chose au centre autour duquel on tourne.',
      explain: 'Le mot TOUR tourne autour du pot : « tourner autour du pot », c’est ne pas oser aller droit au but.' },
    { manche: 1, answer: 'VOIR LA VIE EN ROSE',
      visual: e('👁️', 180, 130, 260) + ARROW(520, 180) +
              box(760, 60, 640, 440, 'border-radius:40px;background:#FFF;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.12)',
                '<span style="position:absolute;left:40px;top:40px;font-size:150px">☀️</span><span style="position:absolute;left:250px;top:150px;font-size:170px">🏡</span>' +
                '<span style="position:absolute;left:450px;top:120px;font-size:170px">🌳</span><span style="position:absolute;left:60px;top:250px;font-size:130px">🌷</span>' +
                '<span style="position:absolute;inset:0;background:rgba(255,92,170,.38)"></span>'),
      hint1: 'C’est une manière très optimiste de regarder les choses.',
      hint2: 'Édith Piaf pourrait vous aider.',
      explain: 'L’œil regarde la vie (soleil, maison, arbre…) à travers un filtre rose : « voir la vie en rose », c’est être optimiste — comme dans la chanson d’Édith Piaf.' },
    { manche: 1, answer: 'AVOIR LE CŒUR SUR LA MAIN',
      visual: e('✋', 610, 90, 400) + e('❤️', 720, 250, 150, 'z-index:2'),
      hint1: 'Cette expression parle de générosité.',
      hint2: 'Deux parties du corps sont représentées.',
      explain: 'Le cœur est posé sur la main ouverte : « avoir le cœur sur la main », c’est être très généreux.' },
    // ---------------- MANCHE 2 — EXPRESSIONS À DÉCODER ----------------
    { manche: 2, answer: 'METTRE LES PIEDS DANS LE PLAT',
      visual: box(420, 150, 760, 380, 'border-radius:50%;background:#fff;border:22px solid #E4DDCF;box-shadow:0 18px 40px rgba(0,0,0,.15)') +
              box(530, 220, 540, 240, 'border-radius:50%;background:#F7F3EC') +
              e('🦶', 580, 130, 220, 'z-index:2;transform:rotate(-10deg)') + e('🦶', 820, 130, 220, 'z-index:2;transform:scaleX(-1) rotate(-10deg)'),
      hint1: 'C’est parfois ce qu’on fait en parlant sans précaution.',
      hint2: 'Une partie du corps se trouve dans un objet de table.',
      explain: 'Deux pieds au milieu d’un plat : « mettre les pieds dans le plat », c’est aborder maladroitement un sujet délicat.' },
    { manche: 2, answer: 'COUPER LES CHEVEUX EN QUATRE',
      visual: svg(160, 230, 1000, 140,
                [0, 1, 2, 3].map(function (k) { return '<path d="M' + (k * 250 + 10) + ' 70 q30 -50 60 0 t60 0 t60 0" stroke="#7A4B2A" stroke-width="22" fill="none" stroke-linecap="round"/>'; }).join('')) +
              e('✂️', 330, 60, 170, 'transform:rotate(90deg)') + e('✂️', 580, 60, 170, 'transform:rotate(90deg)') + e('✂️', 830, 60, 170, 'transform:rotate(90deg)') +
              ARROW(1150, 200) + e('4', 1360, 80, 360, 'font-weight:800;color:#1B625C;font-family:Segoe UI,Arial,sans-serif'),
      hint1: 'Cela signifie compliquer excessivement une discussion.',
      hint2: 'Regardez ce que les ciseaux essaient de faire.',
      explain: 'Les ciseaux coupent la mèche de cheveux en 4 morceaux : « couper les cheveux en quatre », c’est compliquer les choses à l’excès.' },
    { manche: 2, answer: 'DONNER SA LANGUE AU CHAT',
      visual: e('😛', 240, 140, 280) + e('🎁', 600, 330, 120) + ARROW(640, 170) + e('🐱', 960, 110, 330),
      hint1: 'On l’utilise lorsqu’on renonce à trouver une réponse.',
      hint2: 'Un animal reçoit quelque chose.',
      explain: 'La langue est offerte au chat : « donner sa langue au chat », c’est renoncer à trouver la réponse.' },
    { manche: 2, answer: 'AVOIR UN CHAT DANS LA GORGE',
      visual: e('😮', 660, 0, 280) + box(735, 270, 130, 290, 'background:#F6DEC4;border-radius:0 0 30px 30px;box-shadow:inset 0 0 0 6px #E8C3A2') +
              e('🐱', 745, 340, 110, 'z-index:2'),
      hint1: 'Cette expression concerne la voix.',
      hint2: 'L’animal n’est évidemment pas réellement là.',
      explain: 'Un petit chat est logé dans la gorge : « avoir un chat dans la gorge », c’est avoir la voix enrouée.' },
    { manche: 2, answer: 'METTRE DE L’EAU DANS SON VIN',
      visual: svg(420, 20, 300, 260, '<g transform="rotate(35 150 130)"><path d="M90 40 h120 l-20 30 q50 40 40 120 q-10 50 -90 50 q-80 0 -90 -50 q-10 -80 40 -120 z" fill="#EAF6FB" stroke="#7FB3C9" stroke-width="8"/><path d="M60 170 q90 30 180 0 q-5 45 -90 48 q-85 -3 -90 -48z" fill="#6EC1E4"/></g>') +
              box(720, 230, 18, 170, 'background:#6EC1E4;border-radius:9px') + e('💧', 690, 380, 60) +
              e('🍷', 640, 260, 300),
      hint1: 'Cela signifie devenir plus modéré.',
      hint2: 'Deux boissons sont mélangées.',
      explain: 'La carafe verse de l’eau dans le verre de vin : « mettre de l’eau dans son vin », c’est se montrer plus modéré, plus conciliant.' },
    // ---------------- MANCHE 3 — PLUS CORSÉE ----------------
    { manche: 3, answer: 'CHERCHER MIDI À QUATORZE HEURES',
      visual: e('🕛', 160, 120, 320) + e('🔍', 560, 180, 220, 'transform:rotate(-15deg)') +
              e('14 H', 1160, 200, 150, 'font-weight:800;color:#B1AA9E;font-family:Segoe UI,Arial,sans-serif;letter-spacing:.05em'),
      hint1: 'On complique inutilement quelque chose de simple.',
      hint2: 'Deux heures différentes sont importantes.',
      explain: 'On cherche (loupe) midi (12 h) à 14 h : « chercher midi à quatorze heures », c’est compliquer ce qui est simple.' },
    { manche: 3, answer: 'PRENDRE SES JAMBES À SON COU',
      visual: e('😬', 650, 0, 300) + box(745, 290, 110, 160, 'background:#F6DEC4;border-radius:12px') +
              e('🦵', 520, 230, 220, 'transform:rotate(-70deg);z-index:2') + e('🦵', 840, 230, 220, 'transform:scaleX(-1) rotate(-70deg);z-index:2') +
              e('💨', 1080, 330, 150),
      hint1: 'Cela signifie partir très rapidement.',
      hint2: 'Deux parties du corps sont à remettre dans le bon ordre.',
      explain: 'Les jambes sont remontées autour du cou : « prendre ses jambes à son cou », c’est s’enfuir à toute vitesse.' },
    { manche: 3, answer: 'SE CREUSER LA TÊTE',
      visual: e('🙂', 560, 160, 360) + e('⛏️', 860, 0, 210, 'transform:rotate(-20deg)') +
              box(860, 230, 26, 26, 'border-radius:50%;background:#8B6A4E') + box(940, 200, 18, 18, 'border-radius:50%;background:#8B6A4E') + box(1000, 260, 22, 22, 'border-radius:50%;background:#8B6A4E'),
      hint1: 'On le fait lorsqu’on réfléchit très fort.',
      hint2: 'L’image représente littéralement le verbe de l’expression.',
      explain: 'La pioche creuse dans la tête : « se creuser la tête », c’est réfléchir intensément.' },
    { manche: 3, answer: 'TOMBER DANS LES POMMES',
      visual: e('🚶', 600, 0, 330, 'transform:rotate(80deg)') + e('⬇️', 1000, 60, 130) +
              e('🍎', 420, 380, 140) + e('🍏', 600, 400, 130) + e('🍎', 780, 390, 140) + e('🍎', 960, 400, 130) + e('🍏', 1130, 380, 140),
      hint1: 'L’expression décrit une perte de connaissance.',
      hint2: 'Le fruit représenté est essentiel.',
      explain: 'Le personnage tombe au milieu des pommes : « tomber dans les pommes », c’est s’évanouir.' },
    { manche: 3, answer: 'METTRE LA MAIN À LA PÂTE',
      visual: e('👇', 680, 0, 260) + box(480, 270, 640, 270, 'border-radius:50% 50% 44% 44%;background:radial-gradient(circle at 40% 30%,#FFF6E4,#EFD8AE);box-shadow:0 14px 30px rgba(0,0,0,.14);z-index:2') +
              box(560, 300, 120, 30, 'border-radius:50%;background:rgba(255,255,255,.6);z-index:3'),
      hint1: 'Cela signifie participer activement.',
      hint2: 'On pourrait croire que nous sommes dans une cuisine.',
      explain: 'La main s’enfonce dans la boule de pâte : « mettre la main à la pâte », c’est participer soi-même au travail.' },
    // ---------------- MANCHE 4 — GRANDE FINALE (présentation plus sobre) ----------------
    { manche: 4, answer: 'PRENDRE LE TAUREAU PAR LES CORNES',
      visual: svg(500, 40, 600, 500,
                '<path d="M170 170 Q60 150 40 40 Q120 110 210 130Z" fill="#EFE6D2" stroke="#BFAF8E" stroke-width="6"/><path d="M430 170 Q540 150 560 40 Q480 110 390 130Z" fill="#EFE6D2" stroke="#BFAF8E" stroke-width="6"/>' +
                '<ellipse cx="300" cy="260" rx="160" ry="190" fill="#7A4B2A"/><ellipse cx="300" cy="380" rx="105" ry="75" fill="#C9906A"/>' +
                '<circle cx="250" cy="390" r="14" fill="#5A3520"/><circle cx="350" cy="390" r="14" fill="#5A3520"/><circle cx="235" cy="230" r="16" fill="#fff"/><circle cx="365" cy="230" r="16" fill="#fff"/>' +
                '<circle cx="235" cy="232" r="8" fill="#292927"/><circle cx="365" cy="232" r="8" fill="#292927"/>') +
              e('✊', 500, 40, 130, 'z-index:2') + e('✊', 970, 40, 130, 'z-index:2;transform:scaleX(-1)'),
      hint1: 'Il faut affronter le problème directement.',
      hint2: 'Un animal puissant est représenté.',
      explain: 'Les mains saisissent les cornes du taureau : « prendre le taureau par les cornes », c’est affronter une difficulté de face.' },
    { manche: 4, answer: 'JETER L’ÉPONGE',
      visual: box(120, 120, 1360, 6, 'background:#D9CFBE') + box(120, 200, 1360, 6, 'background:#D9CFBE') + e('🥊', 140, 260, 110, 'opacity:.8') +
              e('🧽', 760, 60, 170, 'transform:rotate(-25deg)') + box(700, 120, 80, 8, 'background:#E4DDCF;border-radius:4px') + box(660, 150, 60, 8, 'background:#E4DDCF;border-radius:4px') +
              e('⤵️', 940, 200, 140) + box(120, 520, 1360, 10, 'background:#B9AE9C;border-radius:5px'),
      hint1: 'Cela signifie abandonner.',
      hint2: 'L’expression vient du monde de la boxe.',
      explain: 'L’éponge est lancée sur le ring : à la boxe, on « jette l’éponge » pour abandonner le combat.' },
    { manche: 4, answer: 'ÊTRE AU BOUT DU ROULEAU',
      visual: box(80, 240, 150, 150, 'border-radius:50%;background:radial-gradient(circle,#E9DCC3 0 25%,#FFF8EA 26%);box-shadow:0 8px 20px rgba(0,0,0,.15)') +
              box(155, 300, 1290, 90, 'background:repeating-linear-gradient(90deg,#FFF8EA 0 80px,#F3E9D6 80px 82px);box-shadow:0 8px 20px rgba(0,0,0,.10)') +
              e('🚶', 1390, 240, 64),
      hint1: 'On n’a presque plus de ressources.',
      hint2: 'Regardez la position du personnage par rapport à l’objet.',
      explain: 'Le petit personnage se tient tout au bout du rouleau déroulé : « être au bout du rouleau », c’est être épuisé, à bout de ressources.' },
    { manche: 4, answer: 'METTRE LA CHARRUE AVANT LES BŒUFS',
      visual: e('⬅️', 120, 20, 110) +
              svg(150, 180, 420, 300, '<path d="M40 210 L330 150" stroke="#7A4B2A" stroke-width="18" stroke-linecap="round"/><path d="M300 156 L380 40 M330 150 L410 70" stroke="#7A4B2A" stroke-width="14" stroke-linecap="round"/>' +
                '<path d="M60 205 L20 270 L120 250 Z" fill="#8C8982"/><circle cx="200" cy="230" r="40" fill="none" stroke="#5F5C56" stroke-width="12"/>') +
              e('🐂', 700, 170, 260) + e('🐂', 1080, 170, 260),
      hint1: 'Les choses ne sont pas dans le bon ordre.',
      hint2: 'Traditionnellement, les animaux devraient être devant.',
      explain: 'La charrue avance devant, les bœufs derrière : « mettre la charrue avant les bœufs », c’est faire les choses dans le mauvais ordre.' },
    { manche: 4, answer: 'QUAND LES POULES AURONT DES DENTS',
      visual: svg(520, 10, 560, 540,
                '<path d="M250 40 q20 -40 45 0 q20 -40 45 0 q20 -30 35 10 l-110 20z" fill="#D9453B"/>' +
                '<ellipse cx="300" cy="330" rx="210" ry="190" fill="#FFFDF8" stroke="#E4DDCF" stroke-width="8"/><circle cx="300" cy="170" r="120" fill="#FFFDF8" stroke="#E4DDCF" stroke-width="8"/>' +
                '<circle cx="255" cy="150" r="14" fill="#292927"/><path d="M330 175 L455 200 L330 250 Z" fill="#F2A33A"/>' +
                '<path d="M345 205 L440 205 L345 232 Z" fill="#fff"/><path d="M355 205 l10 14 l10 -14 l10 14 l10 -14 l10 14 l10 -14" stroke="#B9AE9C" stroke-width="3" fill="none"/>' +
                '<path d="M250 230 q-15 40 10 60" stroke="#D9453B" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M180 520 v-40 M300 520 v-40" stroke="#F2A33A" stroke-width="14" stroke-linecap="round"/>'),
      hint1: 'Cela désigne quelque chose qui n’arrivera probablement jamais.',
      hint2: 'Observez ce que possède l’animal alors qu’il ne devrait pas l’avoir.',
      explain: 'La poule sourit… avec des dents ! Les poules n’en ont pas : « quand les poules auront des dents », c’est-à-dire jamais.' }
  ];

  var api = { CONFIG: CONFIG, MANCHES: MANCHES, REBUS: REBUS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RebusData = api;
})(typeof window !== 'undefined' ? window : globalThis);
