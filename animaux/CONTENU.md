# Quiz « Le monde animal » — guide de contenu

Ouvrir : **`animaux/index.html`** (double-clic). Les quiz Cathares (`index.html`) et France (`france/index.html`) sont indépendants.

- **Contenu** : `animaux/js/quiz-data.js` — 6 manches × 6 questions, dans l'ordre du jeu. Vérifier avec `npm run check:animaux`.
- **Q1 à Q24** : contenu fourni. **Q25 à Q36** (manches 5 et 6) : emplacements `[… à remplacer]` (contenu non reçu), ainsi que les introductions des manches 5 et 6.
- **Points** : manches 1 à 5 = 1 point ; manche 6 = 2 points (`points: 2`). Classements intermédiaires après les manches 2 et 4, puis classement final animé et podium 3e → 2e → 1er.

## Format d'une question
```js
{ id: 'm5q25', chapter: 5, type: 'qcm',
  question: 'Texte de la question ?',
  choices: ['Choix A', 'Choix B', 'Choix C'], answer: 'B',   // tf : pas de choices, answer: 'VRAI' | 'FAUX'
  explanation: '💡 Pourquoi ? — 2 à 4 phrases',
  anecdote: '🐾 Le saviez-vous ? — anecdote (ou \'\')',
  short: '',            // facultatif : texte de « ✅ Réponse » (sinon « B — Choix B »)
  points: 1, image: 'm5q25-exemple.png', imageFit: '', credit: '', source: '' }
```
Types : `qcm`, `tf` (vrai/faux), `riddle` (mini-énigme), `situation`, `reflection` (réflexion), `challenge` (mini-défi), `visual` (image / observation), `legend` (fait ou légende).
Les types `riddle`, `situation`, `reflection`, `challenge`, `visual` — et un vrai/faux avec image — affichent d'abord la question seule (« Afficher les choix »).

## Images
Dossier `animaux/assets/images/`, noms exacts indiqués dans `quiz-data.js` (`m1q1-cameleon.png`, `m1q3-dauphin.png`, `m1q5-loup.png`, `m1q6-girafe.png`, `m2q9-cameleon-yeux.png`, `m2q11-elephant.png`, `m3q13-poulpe.png`, `m3q16-panda-roux.png`, `m4q19-manchots.png`, `m4q20-suricates.png`, `m4q22-suricate-sentinelle.png`).
Facultatif : `home.jpg` (accueil), `ch1.jpg` … `ch6.jpg` (introductions de manche). Sans fichier : décor OBEO de secours.

## Mode test
Roue crantée discrète en bas à gauche de l'accueil (ou touche T) : accès direct à une manche ou à une question, classement, podium, scores d'essai.
