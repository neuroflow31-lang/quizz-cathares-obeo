/* ====================================================================================
   « LE GRAND PENDU OBEO » — CONTENU (le seul fichier à modifier pour changer les mots)
   4 manches × 5 matchs · un mot par match · une phrase de contexte (affichée dès le début) · 2 indices · une anecdote
   Le mot s'écrit avec ses accents : le clavier A–Z les retrouve automatiquement (E révèle É, È, Ê…).
   ==================================================================================== */
(function (root) {
  var CONFIG = {
    title: 'LE GRAND PENDU OBEO',
    subtitle: '20 mots à retrouver ensemble',
    tagline: '4 manches · 100 points possibles · 1 seule équipe',
    venue: 'OBEO Toulouse Guillaumet'
  };

  var MANCHES = [
    { no: 1, title: 'Mots familiers mais piégeux' },
    { no: 2, title: 'Culture française' },
    { no: 3, title: 'Expressions et mots anciens' },
    { no: 4, title: 'Grande finale', finale: true }
  ];

  var MATCHS = [
    // MANCHE 1 — MOTS FAMILIERS MAIS PIÉGEUX
    { manche: 1, word: 'PARCHEMIN', context: 'On le rencontre souvent là où le temps a laissé des traces.',
      hint1: 'On écrivait dessus.',
      hint2: 'Avant la généralisation du papier, il était fabriqué à partir de peau préparée.',
      anecdote: 'Le parchemin a été largement utilisé pour les manuscrits et documents avant que le papier ne s’impose en Europe.' },
    { manche: 1, word: 'BROCANTE', context: 'Certains y cherchent ce que d’autres ont oublié.',
      hint1: 'On y trouve des objets qui ont déjà eu une première vie.',
      hint2: 'On peut y chiner meubles, vaisselle et objets anciens.',
      anecdote: '« Chiner » signifie rechercher et acheter des objets dans les brocantes, marchés aux puces ou ventes d’occasion.' },
    { manche: 1, word: 'MARABOUT', context: 'Un même mot peut ici vous emmener dans plusieurs directions.',
      hint1: 'Ce mot peut désigner plusieurs choses très différentes.',
      hint2: 'Il peut notamment désigner un oiseau.',
      anecdote: '« Marabout » possède plusieurs sens selon le contexte : religieux, personnage réputé pour certains pouvoirs, ou encore grand échassier africain.' },
    { manche: 1, word: 'CARTOUCHE', context: 'Son contenu dépend beaucoup de l’objet qui l’utilise.',
      hint1: 'Ce mot peut contenir quelque chose.',
      hint2: 'On le rencontre aussi bien avec certaines imprimantes qu’avec des armes.',
      anecdote: 'Le mot « cartouche » possède plusieurs sens techniques selon le contenu et l’objet qui l’utilise.' },
    { manche: 1, word: 'CABRIOLET', context: 'Ce mot a changé de décor au fil des époques.',
      hint1: 'Ce mot a désigné différents objets au fil du temps.',
      hint2: 'Aujourd’hui, on pense surtout à une automobile découvrable.',
      anecdote: 'Avant l’automobile, « cabriolet » désignait notamment une petite voiture hippomobile légère.' },
    // MANCHE 2 — CULTURE FRANÇAISE
    { manche: 2, word: 'PANACHÉ', context: 'Il évoque souvent l’idée de mélange ou de variété.',
      hint1: 'Il désigne quelque chose composé d’éléments différents.',
      hint2: 'Le mot est aussi utilisé pour certaines boissons mélangées.',
      anecdote: '« Panaché » vient de l’idée de mélange ou de variété, comme un plumage de plusieurs couleurs.' },
    { manche: 2, word: 'BELVÉDÈRE', context: 'On le cherche généralement pour ce qu’il permet d’observer.',
      hint1: 'On y monte souvent pour regarder autour de soi.',
      hint2: 'C’est un lieu aménagé pour profiter d’une belle vue.',
      anecdote: 'Le mot vient de l’italien et signifie littéralement « belle vue ».' },
    { manche: 2, word: 'ESCARBILLE', context: 'Ce mot sent un peu la fumée et les machines d’autrefois.',
      hint1: 'On en voyait davantage à l’époque des locomotives à vapeur.',
      hint2: 'C’est un petit fragment de charbon ou de matière brûlée.',
      anecdote: 'Les escarbilles pouvaient être projetées par les locomotives à vapeur et salir les voyageurs ou les abords des voies.' },
    { manche: 2, word: 'MÉRIDIENNE', context: 'Elle invite davantage à ralentir qu’à travailler.',
      hint1: 'On peut s’y reposer.',
      hint2: 'C’est un siège allongé permettant notamment de faire une sieste.',
      anecdote: 'La méridienne est un meuble intermédiaire entre le canapé et le lit de repos.' },
    { manche: 2, word: 'MARQUISE', context: 'On peut la rencontrer sans jamais entrer dans une maison.',
      hint1: 'Elle peut se trouver au-dessus d’une entrée.',
      hint2: 'C’est un petit auvent souvent vitré qui protège de la pluie.',
      anecdote: 'On trouve encore de nombreuses marquises au-dessus des entrées d’immeubles, hôtels et anciennes gares.' },
    // MANCHE 3 — EXPRESSIONS ET MOTS ANCIENS
    { manche: 3, word: 'ESCAMPETTE', context: 'Elle apparaît souvent lorsqu’il est temps de ne pas rester.',
      hint1: 'On la prend lorsqu’on veut partir rapidement.',
      hint2: 'Elle apparaît dans l’expression « prendre la poudre d’… ».',
      anecdote: '« Escamper » était un ancien verbe signifiant s’enfuir.' },
    { manche: 3, word: 'SALAMALECS', context: 'Ce mot parle beaucoup de manières, parfois un peu trop.',
      hint1: 'Ce sont des politesses parfois jugées excessives.',
      hint2: 'On dit : « faire des… »',
      anecdote: 'Le mot est lié à une formule de salutation d’origine arabe.' },
    { manche: 3, word: 'ARTABAN', context: 'Un personnage a laissé son nom dans notre façon de parler.',
      hint1: 'Son nom apparaît encore dans une expression française.',
      hint2: 'On dit : « fier comme… »',
      anecdote: 'Artaban est un personnage littéraire dont le nom est devenu synonyme d’une très grande fierté.' },
    { manche: 3, word: 'SELLETTE', context: 'Ce petit objet a connu des moments assez inconfortables.',
      hint1: 'On peut aujourd’hui être « sur » cet objet sans réellement s’asseoir dessus.',
      hint2: 'Il s’agissait autrefois d’un petit siège associé aux interrogatoires judiciaires.',
      anecdote: '« Être sur la sellette » signifie aujourd’hui être fortement interrogé, critiqué ou sous pression.' },
    { manche: 3, word: 'MARMOT', context: 'Ce mot ancien ne désignait pas toujours ce que l’on imagine aujourd’hui.',
      hint1: 'Le mot apparaît dans une ancienne expression.',
      hint2: 'On disait autrefois « croquer le… ».',
      anecdote: 'Le mot a eu plusieurs sens au cours de l’histoire et a notamment servi à désigner certaines figures grotesques.' },
    // MANCHE 4 — GRANDE FINALE
    { manche: 4, word: 'PALIMPSESTE', context: 'Ici, ce qui a disparu n’est pas forcément perdu.',
      hint1: 'Il cache parfois un texte plus ancien sous un autre.',
      hint2: 'C’est un manuscrit dont le support a été réutilisé après effacement d’un premier texte.',
      anecdote: 'Les techniques modernes permettent parfois de retrouver les écritures anciennes effacées sur certains palimpsestes.' },
    { manche: 4, word: 'PHYLACTÈRE', context: 'Ce mot compliqué cache quelque chose de très familier.',
      hint1: 'Dans la bande dessinée, il contient souvent des paroles.',
      hint2: 'C’est le nom savant d’une bulle de dialogue.',
      anecdote: 'Le mot existait bien avant la bande dessinée et a eu plusieurs usages historiques.' },
    { manche: 4, word: 'PÉRIPÉTIE', context: 'Sans elle, certaines histoires seraient beaucoup plus calmes.',
      hint1: 'Elle change le cours d’une histoire.',
      hint2: 'C’est un événement inattendu ou un rebondissement.',
      anecdote: 'Le mot est particulièrement utilisé pour désigner les événements qui font avancer ou bouleversent un récit.' },
    { manche: 4, word: 'MÉLANCOLIE', context: 'Elle se situe quelque part entre souvenir, tristesse et rêverie.',
      hint1: 'Elle désigne une humeur particulière.',
      hint2: 'C’est une tristesse douce, profonde ou rêveuse.',
      anecdote: 'La mélancolie est un thème très ancien de la littérature, de la peinture et de la musique.' },
    { manche: 4, word: 'ÉPHÉMÈRE', context: 'Son principal défaut est de ne jamais rester longtemps.',
      hint1: 'Il décrit quelque chose qui ne dure pas.',
      hint2: 'C’est le contraire de durable ou permanent.',
      anecdote: 'Le mot vient d’une idée de très courte durée et désigne ce qui ne dure qu’un temps limité.' }
  ];

  var api = { CONFIG: CONFIG, MANCHES: MANCHES, MATCHS: MATCHS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PenduData = api;
})(typeof window !== 'undefined' ? window : globalThis);
