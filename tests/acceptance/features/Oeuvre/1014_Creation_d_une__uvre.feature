# language: en
Feature: Création d'une œuvre

  Scenario: Un utilisateur authentifié propose une œuvre
    Given l'utilisateur "alice" est authentifié
    And la catégorie "Science-fiction" existe
    When elle saisit le titre "Dune"
    And elle saisit la description "Un roman de science-fiction"
    And elle sélectionne la catégorie "Science-fiction"
    And elle valide la création
    Then l'œuvre "Dune" est créée
    And l'œuvre est associée à l'utilisateur "alice"

  Scenario: Un visiteur ne peut pas proposer une œuvre
    Given un visiteur n'est pas authentifié
    When il tente de créer une œuvre
    Then l'œuvre n'est pas créée
    And il est invité à se connecter