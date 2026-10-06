# Quiz « Les Cathares en Occitanie » — OBEO Toulouse Guillaumet

Application web autonome (HTML/CSS/JS, aucune dépendance, aucun backend, aucune base de données).

## Ouvrir le quiz
- **Le plus simple (sans rien installer)** : double-cliquer sur `index.html` (ou `dist/index.html` après build) → s'ouvre dans Chrome / Edge.
- **Avec Node** : `npm start` puis ouvrir http://localhost:5173/
- **Build + aperçu** : `npm run build` (vérifie les 15 questions et les images, copie dans `dist/`), puis `npm run preview` → http://localhost:4173/
- **Tests** : `npm test`

## Déroulé (≈ 60 min) — 25 épreuves, 4 manches
1. **L'histoire des Cathares** — 8 questions A/B/C (+1 point)
2. **Reconnaissez le lieu** — 5 photos : d'abord la photo seule en grand, puis les réponses (+1 point) → *classement*
3. **Vrai ou faux ?** — 7 affirmations, gros boutons VRAI / FAUX (+1 point) → *classement*
4. **La finale** — 5 questions « bonus » (+2 points), puis classement final animé et podium

Pas de chronomètre : l'animateur valide quand le groupe a fini de discuter.

## Utilisation
- Plein écran : bouton « Plein écran » ou touche **F** (Échap pour quitter ; pendant une question Vrai/Faux, F = « Faux » : utiliser le bouton ou F11).
- Clavier : **A / B / C** (ou 1/2/3), **V / F** en Vrai/Faux, **Entrée** pour valider / continuer.
- Points : « +1 » (ou « +2 » en finale) sous chaque prénom ; « −1 » / « −2 » sert uniquement à **corriger** une erreur d'attribution (jamais une pénalité, jamais sous 0).
- Les participants et les scores sont sauvegardés dans le navigateur : un rechargement de page ne perd rien.
- « Quitter » (en haut à droite) efface la partie et revient à l'accueil.

## Modifier le contenu
- Questions et manches : `js/questions.js` (pour les choix, la bonne réponse est écrite en premier ; `place` fixe sa position A/B/C).
- **Photos** : les chemins sont déclarés dans `PHOTOS` en haut de `js/questions.js` (noms avec accents encodés, ex. `%C3%A9` = é ; l'apostrophe = `%27`). Photos HD actuelles (1920 px de large) dans `assets/photos/`. Les anciens fichiers basse résolution (`montsegur.jpg`, `carcassonne.jpg`, etc.) ne sont plus utilisés et peuvent être supprimés.
- Logo : `assets/logo/obeo-logo.png`.

## Vérifications
- `npm test` : 12 tests (structure 8+5+7+5, barème +1/+2, répartition des bonnes réponses, classement, images présentes).
- `node tests/e2e.cjs` : parcours complet dans un vrai navigateur (nécessite Playwright) — individuel, 20 participants, jeu collectif.
