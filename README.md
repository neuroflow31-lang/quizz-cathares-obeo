# Quiz « Les Cathares en Occitanie » — OBEO Toulouse Guillaumet

Application web autonome (HTML/CSS/JS, aucune dépendance, aucun backend, aucune base de données).

## Ouvrir le quiz
- **Le plus simple (sans rien installer)** : double-cliquer sur `index.html` (ou `dist/index.html` après build) → s'ouvre dans Chrome / Edge.
- **Avec Node** : `npm start` puis ouvrir http://localhost:5173/
- **Build + aperçu** : `npm run build` (vérifie les 15 questions et les images, copie dans `dist/`), puis `npm run preview` → http://localhost:4173/
- **Tests** : `npm test`

## Utilisation
- Plein écran : bouton « Plein écran » ou touche **F** (Échap pour quitter).
- Clavier : **A / B / C** (ou 1/2/3) pour choisir, **Entrée** pour valider.
- Les participants et les scores sont sauvegardés dans le navigateur : un rechargement de page ne perd rien.
- « Quitter » (en haut à droite) efface la partie et revient à l'accueil.

## Modifier le contenu
- Questions : `js/questions.js` (la bonne réponse est toujours écrite en premier ; `place` fixe sa position A/B/C à l'écran).
- Photos : remplacer les fichiers de `assets/photos/` en gardant les mêmes noms (montsegur, carcassonne, beziers, villerouge, paysage, carcassonne-hero). Format conseillé : JPG paysage ~1600×1200.
- Logo : `assets/logo/obeo-logo.png`.
