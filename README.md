# Juste une perf ?

Serious game de formation : réévaluer chaque jour la pertinence des cathéters veineux et repérer les possibilités de relais per os.

## Principe
Visite du matin en médecine polyvalente. Pour chaque dossier fictif :
1. Grille de relais de l'antibiotique (5 critères inspirés des critères IVOS UKHSA et de la fiche RePIA/SPARES).
2. Décision ligne par ligne : relais per os, poursuite IV, voie sous-cutanée ou arrêt, et choix de la molécule orale.
3. Décision sur le cathéter : maintenir, retirer, reposer, dispositif adapté.

14 dossiers (Essentiel, Avancé, Expert). Trois modes : visite complète, express (6 au hasard), essentiels.
Indicateurs de fin : score, jours-cathéter évités (estimation), relais pertinents, erreurs à risque.

## Références
SF2H 2019 cathéters périphériques ; HAS critères qualité CVP ; UKHSA IVOS ; RePIA/SPARES voie injectable ou per os ; ANSM aminosides ; OVIVA (NEJM 2019) ; POET (NEJM 2019) ; Pilly SPILF.

## Statut
Prototype. Relecture EOH et référent antibiotiques requise avant usage institutionnel.
Suivi d'audience : appels `plausible()` prêts (événements « Partie lancée », « Dossier validé », « Partie terminée »), script non inclus.

Application statique (HTML, CSS, JS), sans backend ni stockage.

## Publication

- Jeu en ligne : https://jetpod.github.io/juste-une-perf/
- Article de présentation (iframe) : https://nutricellscience.blog/2026/11/10/juste-une-perf-serious-game-catheters-relais-per-os/
