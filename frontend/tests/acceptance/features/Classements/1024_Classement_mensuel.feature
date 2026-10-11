# language: en

Feature: Classement mensuel

  Scenario: Le classement du mois ne comptabilise que les votes reçus au cours du mois en cours
    Given l'œuvre "A" a reçu un vote positif au cours du mois en cours
    And l'œuvre "B" a reçu un vote positif le mois précédent
    When l'utilisateur consulte le classement "mois"
    Then le vote de "A" est comptabilisé dans ce classement
    And le vote de "B" datant du mois précédent n'est pas comptabilisé dans ce classement