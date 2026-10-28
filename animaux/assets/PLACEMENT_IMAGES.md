# OBEO — Quiz « Le monde animal » — Placement des images

Ce dossier est prêt à être intégré par Claude Code dans le nouveau quiz `animaux/`.

## Score à afficher

- Questions Q1 à Q30 : **1 point** chacune = 30 points maximum.
- Questions Q31 à Q36 : **2 points** chacune = 12 points maximum.
- **SCORE MAXIMUM : 42 POINTS.**
- Afficher pendant le jeu : `Score : X / 42`.
- Afficher au classement et au podium : `X / 42`.
- Corrections manuelles : `+1 / -1` en manches 1 à 5 ; `+2 / -2` en finale.

## Emplacement conseillé

| Écran / question | Fichier | Utilisation |
|---|---|---|
| Accueil | `hero-animaux.jpg` | Écran d'accueil avant saisie des participants |
| Intro manche 1 | `manche1.jpg` | Avant Q1 — Tout ce que vous croyiez savoir est faux |
| Q1 | `m1q1-cameleon.jpg` | Caméléon — changement de couleur |
| Q3 | `m1q3-dauphin.jpg` | Dauphin — mammifère ou poisson |
| Q5 | `m1q5-loup.jpg` | Loup — organisation de la meute |
| Q6 | `m1q6-girafe.jpg` | Girafe — 7 vertèbres cervicales |
| Intro manche 2 | `manche2.jpg` | Avant Q7 — Un monde invisible pour nous |
| Q9 | `m2q9-cameleon-yeux.jpg` | Caméléon — yeux pouvant regarder dans des directions différentes |
| Q11 | `m2q11-elephant.jpg` | Éléphant — infrasons |
| Intro manche 3 | `manche3.jpg` | Avant Q13 — Plus intelligents qu’on ne le pensait |
| Q13 | `m3q13-poulpe.jpg` | Poulpe — résolution de problèmes |
| Q16 | `m3q16-panda-roux.jpg` | Panda roux — pseudo-pouce |
| Intro manche 4 | `manche4.jpg` | Avant Q19 — Familles et sociétés extraordinaires |
| Q19 | `m4q19-manchots.jpg` | Manchot empereur — le mâle garde l’œuf |
| Q20 | `m4q20-suricates.jpg` | Suricates — apprentissage progressif |
| Q22 | `m4q22-suricate-sentinelle.jpg` | Suricate — sentinelle |
| Intro manche 5 | `manche5.jpg` | Avant Q25 — Les animaux médecins |
| Q25 | `m5q25-chimpanze.jpg` | Chimpanzé — plantes bioactives / automédication |
| Q26 | `m5q26-fourmis.jpg` | Fourmis charpentières — soins et amputation |
| Q27 | `m5q27-axolotl.jpg` | Axolotl — régénération |
| Q28 | `m5q28-abeilles.jpg` | Abeilles — propolis et protection de la ruche |
| Intro manche 6 | `manche6.jpg` | Avant Q31 — Grande expédition finale |
| Q31 | `m6q31-poulpe.jpg` | Finale — poulpe, 3 cœurs |
| Q33 | `m6q33-suricates.jpg` | Finale — professeur du désert |
| Q34 | `m6q34-elephants.jpg` | Finale — appels individualisés des éléphants |
| Q35 | `m6q35-axolotl.jpg` | Finale — axolotl / néoténie |

## Règles d'intégration

1. Copier les fichiers dans `animaux/assets/images/`.
2. Ne pas afficher le nom du fichier dans l'interface.
3. Une image de question doit apparaître avec la question AVANT validation, sans révéler la bonne réponse.
4. Les écrans `manche1.jpg` à `manche6.jpg` sont des écrans d'introduction de manche.
5. `hero-animaux.jpg` est uniquement destiné à l'accueil.
6. Les images de Q31/Q33/Q34/Q35 sont volontairement des réutilisations des animaux déjà vus : la finale vérifie ce qui a été appris.
7. En cas d'image manquante, conserver le fallback OBEO et ne jamais bloquer le quiz.
8. Les images sont des illustrations générées pour cette animation. Ne pas les présenter comme des photographies documentaires attestant à elles seules les faits scientifiques.


## Version légère
Toutes les images ont été converties en JPEG optimisé, adaptées à un affichage TV, pour réduire fortement la taille des pièces jointes.
