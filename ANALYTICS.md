# Juste une perf ? · Configuration Plausible

Le jeu utilise le script Plausible déjà associé au site `jetpod.github.io`, comme les autres serious games JETPOD. Son chargement est limité au chemin `/juste-une-perf/`, ce qui inclut l'affichage dans l'iframe de l'article WordPress, mais exclut les prévisualisations et les tests locaux.

## Créer les objectifs

Dans Plausible, ouvrir le site **jetpod.github.io**, puis **Settings → Goals → Add goal → Custom event**. Créer les 33 objectifs suivants avec les noms exacts (accents, espaces et zéros initiaux compris) :

```text
JUP Visite complète lancée
JUP Visite express lancée
JUP Visite essentiels lancée
JUP Dossier 01 validé
JUP Dossier 02 validé
JUP Dossier 03 validé
JUP Dossier 04 validé
JUP Dossier 05 validé
JUP Dossier 06 validé
JUP Dossier 07 validé
JUP Dossier 08 validé
JUP Dossier 09 validé
JUP Dossier 10 validé
JUP Dossier 11 validé
JUP Dossier 12 validé
JUP Dossier 13 validé
JUP Dossier 14 validé
JUP Dossier 01 erreur à risque
JUP Dossier 02 erreur à risque
JUP Dossier 03 erreur à risque
JUP Dossier 04 erreur à risque
JUP Dossier 05 erreur à risque
JUP Dossier 06 erreur à risque
JUP Dossier 07 erreur à risque
JUP Dossier 08 erreur à risque
JUP Dossier 09 erreur à risque
JUP Dossier 10 erreur à risque
JUP Dossier 11 erreur à risque
JUP Dossier 12 erreur à risque
JUP Dossier 13 erreur à risque
JUP Dossier 14 erreur à risque
JUP Visite terminée sans erreur à risque
JUP Visite terminée avec erreur à risque
```

Un événement personnalisé n'apparaît dans le tableau de bord qu'une fois l'objectif correspondant créé, et le suivi n'est pas rétroactif ([documentation Plausible](https://plausible.io/docs/custom-event-goals)). Le préfixe `JUP` distingue ces objectifs de ceux des autres jeux du même site. Pour les pages vues, filtrer sur la page `/juste-une-perf/`.

## Correspondance des dossiers

Le numéro suit l'ordre de la visite complète, quel que soit le mode joué.

| Numéro | Dossier |
|---|---|
| 01 | Le garde-veine |
| 02 | La pyélonéphrite qui va mieux |
| 03 | Pas encore |
| 04 | Le cordon rouge |
| 05 | Le staphylocoque doré |
| 06 | Il veut rentrer chez lui |
| 07 | Trois vomissements |
| 08 | L'infection urinaire masculine |
| 09 | Ce n'est pas qu'une affaire d'antibiotiques |
| 10 | L'os n'interdit pas le per os |
| 11 | Le PICC de l'endocardite |
| 12 | Le piège de la vancomycine |
| 13 | Quatrième cathéter en trois jours |
| 14 | La gentamicine oubliée |

## Ce qui est compté

- **JUP Visite … lancée** : clic sur un mode de visite. Un « Rejouer » compte une nouvelle visite.
- **JUP Dossier NN validé** : validation du dossier (une fois par tentative).
- **JUP Dossier NN erreur à risque** : au moins une décision classée à risque dans ce dossier (relais ou retrait dangereux, maintien IV d'un traitement à arrêter, etc.).
- **JUP Visite terminée sans / avec erreur à risque** : affichage du bilan, une fois par visite.

Lecture utile : le rapport « erreur à risque / validé » par dossier repère les situations les plus mal maîtrisées ; le rapport « terminée / lancée » mesure l'abandon en cours de visite.

## Protection des données

Aucun nom, aucune réponse, aucun score, aucune propriété personnalisée ni identifiant d'apprenant n'est transmis. L'URL est envoyée sans paramètres ni fragment et le référent est supprimé. Le suivi automatique des liens sortants, des téléchargements et des formulaires est désactivé. Une liste fermée (`analytics.js`) bloque tout autre nom d'événement. Plausible fonctionne sans cookie ([politique de données](https://plausible.io/data-policy)). Ces compteurs ne sont pas un décompte de personnes ni une validation de formation.

## Tester

`node test-analytics.cjs` vérifie les 33 noms autorisés, le blocage des autres noms et le nettoyage des données. Il n'envoie aucune requête.
