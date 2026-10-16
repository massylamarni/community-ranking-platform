# language: en
Feature: Image d'une œuvre

  Scenario: Créer une œuvre avec une image
    Given l'utilisateur "bob" est authentifié
    And les informations obligatoires de l'œuvre sont renseignées
    When il associe l'image "dune.jpg" à l'œuvre
    And il valide la création
    Then l'œuvre est créée
    And l'image "dune.jpg" est associée à l'œuvre

  Scenario: Créer une œuvre sans image
    Given l'utilisateur "bob" est authentifié
    And les informations obligatoires de l'œuvre sont renseignées
    When il ne sélectionne aucune image
    And il valide la création
    Then l'œuvre est créée
    And aucune image n'est associée à l'œuvre