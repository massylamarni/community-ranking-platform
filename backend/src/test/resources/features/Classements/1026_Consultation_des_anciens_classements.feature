# language: en

Feature: Consultation des anciens classements

  Scenario: Consultation du classement archivé d'une période antérieure
    Given le classement hebdomadaire de la semaine précédente a été archivé avec le résultat "B", "A", "C"
    When l'utilisateur accède à la section des classements précédents
    And il sélectionne la semaine précédente
    Then le classement affiché est exactement "B", "A", "C"