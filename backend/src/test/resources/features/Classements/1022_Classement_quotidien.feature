# language: en

Feature: Classement quotidien

  Scenario: Le classement du jour ne comptabilise que les votes reçus aujourd'hui
    Given l'œuvre "A" a reçu un vote positif aujourd'hui
    And l'œuvre "B" a reçu un vote positif hier, hors de la période du jour en cours
    When l'utilisateur consulte le classement "jour"
    Then le vote d'aujourd'hui sur "A" est comptabilisé dans ce classement
    And le vote d'hier sur "B" n'est pas comptabilisé dans ce classement