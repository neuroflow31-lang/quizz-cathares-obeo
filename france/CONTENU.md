# Quiz « La France : histoire, patrimoine et grandes énigmes » — guide de contenu

Le quiz s'ouvre avec **`france/index.html`** (double-clic) — le Quiz Cathares (`index.html` à la racine) reste intact.

## Où mettre le contenu
- **Questions, chapitres, accroches** : `france/js/quiz-data.js` (un seul fichier, 40 emplacements `[… à remplacer]` déjà prêts, dans l'ordre du jeu).
- **Images** : dossier `france/assets/images/` (voir plus bas).
- Après chaque modification : `npm run check:france` (ou ouvrir la page : une erreur de format s'affiche en clair à l'écran).

## Format d'une épreuve
```js
{ id: 'c2q3', chapter: 2, type: 'qcm',
   question: 'Texte de la question ?',
   choices: ['Choix A', 'Choix B', 'Choix C'],   // 3 choix (qcm, visual, riddle, reflection)
   answer: 'B',                                  // 'A' | 'B' | 'C'
   explanation: 'Explication affichée après la validation (1 à 3 phrases).',
   anecdote: 'Texte de la carte « LE SAVIEZ-VOUS ? » (2 à 4 phrases) — ou \'\' s\'il n\'y en a pas.',
   points: 1,                                    // 2 pour une épreuve bonus
   image: '', imageFit: '', credit: '', source: '' }
```
| type | affichage | `choices` | `answer` |
|---|---|---|---|
| `qcm` | question + 3 choix A/B/C | 3 textes | `'A'`/`'B'`/`'C'` |
| `visual` | photo seule en grand → « Afficher les choix » → A/B/C | 3 textes | `'A'`/`'B'`/`'C'` |
| `riddle` (mini-énigme) | énigme (+ `clues: ['indice 1', …]`) → « Afficher les choix » | 3 textes | `'A'`/`'B'`/`'C'` |
| `reflection` | question de réflexion → « Afficher les choix » | 3 textes | `'A'`/`'B'`/`'C'` |
| `tf` | deux gros boutons VRAI / FAUX | *(aucun)* | `'VRAI'` / `'FAUX'` |
| `legend` | deux gros boutons FAIT / LÉGENDE | *(aucun)* | `'FAIT'` / `'LÉGENDE'` |

- Garder l'ordre des épreuves (chapitre 1 d'abord…) et le nombre par chapitre : 6 · 7 · 7 · 7 · 7 · 6 (le contrôle l'exige).
- Répartir les bonnes réponses entre A, B et C (le contrôle avertit si une lettre dépasse 50 %).
- `points: 2` : pré-réglé sur les 3 dernières épreuves du chapitre 6 (`c6q4`, `c6q5`, `c6q6`) ; modifiable.
- `anecdote` : la carte n'apparaît que si le champ est rempli. `explanation` apparaît toujours.
- Jamais le nom de la réponse dans le nom d'un fichier image ni dans la légende (`credit`) avant la validation : l'image de la question est aussi montrée avant la réponse.
- `source` : note interne (jamais affichée, visible seulement dans le mode test).

## Chapitres
`CHAPTERS` (même fichier) : `title`, `hook` (phrase d'accroche de l'écran d'introduction — **textes provisoires neutres, à remplacer**), `count`, `image` (facultatif).
Classements intermédiaires : `CONFIG.rankingAfterChapters = [3, 5]` (après Rennes-le-Château et avant le dernier chapitre) et leurs libellés `rankingNotes`.

## Images
Placer les fichiers dans `france/assets/images/`. **Aucune configuration nécessaire** : si le fichier porte le nom attendu, il est utilisé automatiquement ; sinon un décor OBEO de secours s'affiche (jamais d'image cassée).

| Fichier | Usage |
|---|---|
| `home.jpg` | accueil (grand format paysage conseillé) |
| `ch1.jpg` … `ch6.jpg` | écran d'introduction de chaque chapitre |
| `players.jpg`, `ranking.jpg` | décor des écrans participants / classement (facultatif) |
| `<id>.jpg` | image d'une épreuve (tableau ci-dessous) |

Autre nom de fichier : renseigner `image: 'mon-fichier.jpg'` dans l'épreuve (accents et espaces acceptés). `imageFit: 'contain'` pour ne pas rogner une image (sinon `cover`). `credit: '© Auteur / Source'` affiche un crédit discret en bas de l'image.
Format conseillé : JPG, 1920 px de large minimum (1920×1440 idéal), 4:3 ou 3:2, moins de 1,5 Mo.

| Fichier | Chapitre | Type |
|---|---|---|
| `c1q1.jpg` | 1 | qcm |
| `c1q2.jpg` | 1 | visual |
| `c1q3.jpg` | 1 | tf |
| `c1q4.jpg` | 1 | legend |
| `c1q5.jpg` | 1 | qcm |
| `c1q6.jpg` | 1 | reflection |
| `c2q1.jpg` | 2 | qcm |
| `c2q2.jpg` | 2 | tf |
| `c2q3.jpg` | 2 | visual |
| `c2q4.jpg` | 2 | legend |
| `c2q5.jpg` | 2 | riddle |
| `c2q6.jpg` | 2 | qcm |
| `c2q7.jpg` | 2 | reflection |
| `c3q1.jpg` | 3 | visual |
| `c3q2.jpg` | 3 | qcm |
| `c3q3.jpg` | 3 | legend |
| `c3q4.jpg` | 3 | tf |
| `c3q5.jpg` | 3 | riddle |
| `c3q6.jpg` | 3 | qcm |
| `c3q7.jpg` | 3 | reflection |
| `c4q1.jpg` | 4 | qcm |
| `c4q2.jpg` | 4 | visual |
| `c4q3.jpg` | 4 | tf |
| `c4q4.jpg` | 4 | qcm |
| `c4q5.jpg` | 4 | legend |
| `c4q6.jpg` | 4 | riddle |
| `c4q7.jpg` | 4 | reflection |
| `c5q1.jpg` | 5 | qcm |
| `c5q2.jpg` | 5 | tf |
| `c5q3.jpg` | 5 | visual |
| `c5q4.jpg` | 5 | legend |
| `c5q5.jpg` | 5 | qcm |
| `c5q6.jpg` | 5 | riddle |
| `c5q7.jpg` | 5 | reflection |
| `c6q1.jpg` | 6 | visual |
| `c6q2.jpg` | 6 | qcm |
| `c6q3.jpg` | 6 | tf |
| `c6q4.jpg` | 6 | legend |
| `c6q5.jpg` | 6 | riddle |
| `c6q6.jpg` | 6 | reflection |

Les images des types `visual` sont indispensables ; pour les autres types elles sont facultatives (affichées dans le panneau latéral).

## Mode test animateur
Accueil → petite **roue crantée** discrète en bas à gauche (ou touche **T** sur l'accueil).
- accès direct à un chapitre (écran d'intro) ou à l'une des 40 épreuves ;
- barre « TEST » en haut de l'écran : ◀ Préc. · Suiv. ▶ · Classement · Podium · Menu test · Quitter le test (bouton « – » pour la réduire) ;
- boutons du menu : classement intermédiaire, classement final animé, podium progressif, scores d'essai aléatoires ;
- participants de test : Marie, Jean, Monique, Pierre ; rien n'est enregistré ; « Quitter le test » ramène à une partie vierge (un rechargement de page aussi).

## Prompt à donner à ChatGPT (exemple)
> Voici le format JavaScript d'une épreuve : *(coller le bloc ci-dessus)*. Rédige l'épreuve n° X du chapitre « … » de type … à partir du texte source suivant : … N'invente aucune information absente du texte. Public : seniors autonomes, niveau intermédiaire à difficile, distracteurs plausibles, explication de 1 à 3 phrases, anecdote de 2 à 4 phrases.
