# language: en

Feature: Classement hebdomadaire

  Scenario: Le classement de la semaine ne comptabilise que les votes reçus au cours de la semaine en cours
    Given l'œuvre "A" a reçu un vote positif au cours de la semaine en cours
    And l'œuvre "B" a reçu un vote positif la semaine précédente
    When l'utilisateur consulte le classement "semaine"
    Then le vote de "A" est comptabilisé dans ce classement
    And le vote de "B" datant de la semaine précédente n'est pas comptabilisé dans ce classement