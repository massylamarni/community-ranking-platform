# language: en
Feature: Description d'une œuvre

  Scenario: Créer une œuvre avec une description
    Given l'utilisateur "alice" est authentifié
    When elle saisit le titre "Dune"
    And elle saisit la description "Un roman de science-fiction"
    And elle renseigne les autres informations obligatoires
    And elle valide la création
    Then l'œuvre est créée
    And sa description est "Un roman de science-fiction"

  Scenario: Refuser une œuvre sans description
    Given l'utilisateur "alice" est authentifié
    When elle saisit le titre "Dune"
    And elle ne saisit aucune description
    And elle renseigne les autres informations obligatoires
    And elle valide la création
    Then l'œuvre n'est pas créée
    And un message indique que la description est obligatoire