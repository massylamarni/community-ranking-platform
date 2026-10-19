# language: en
Feature: Création d'une œuvre

  Scenario: Un utilisateur authentifié propose une œuvre
    Given l'utilisateur "alice" est authentifié
    And la catégorie "Science-fiction" existe
    And l'utilisateur "alice" est sur la page de proposition d'œuvre
    When l'utilisateur "alice" saisit le titre "Dune"
    And l'utilisateur "alice" saisit la description "Un roman de science-fiction"
    And l'utilisateur "alice" sélectionne la catégorie "Science-fiction"
    And l'utilisateur "alice" valide la création
    Then l'œuvre "Dune" est créée
    And l'œuvre est associée à l'utilisateur "alice"
    And l'œuvre est associée à la catégorie "Science-fiction"

  Scenario: Un visiteur ne peut pas proposer une œuvre
    Given un visiteur n'est pas authentifié
    When il tente de créer une œuvre
    Then l'œuvre n'est pas créée
    And il est invité à se connecter
