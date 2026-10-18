# language: en
Feature: Description d'une œuvre

  Scenario: Créer une œuvre avec une description
    Given l'utilisateur "alice" est authentifié
    When il saisit le titre "Dune"
    And il saisit la description "Un roman de science-fiction"
    And il renseigne les autres informations obligatoires
    And il valide la création
    Then l'œuvre est créée
    And sa description est "Un roman de science-fiction"

  Scenario: Refuser une œuvre sans description
    Given l'utilisateur "alice" est authentifié
    When il saisit le titre "Dune"
    And il ne saisit aucune description
    And il renseigne les autres informations obligatoires
    And il valide la création
    Then l'œuvre n'est pas créée
    And un message indique que la description est obligatoire