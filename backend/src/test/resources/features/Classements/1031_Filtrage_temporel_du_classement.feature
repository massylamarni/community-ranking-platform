# language: en

Feature: Filtrage temporel du classement

  Scenario: Changement interactif de la période affichée
    Given l'utilisateur consulte le classement avec la période "semaine" sélectionnée
    When il sélectionne la période "mois"
    And il valide ce choix
    Then le classement affiché est recalculé pour refléter uniquement les votes du mois en cours