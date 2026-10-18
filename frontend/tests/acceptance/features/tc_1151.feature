# language: en
Feature: Gestion des œuvres par l'administrateur
  
  Scenario: Créer une œuvre avec des informations valides
    Given je suis connecté en tant que "Administrateur"
    And les informations de l'œuvre sont valides
    When je crée une nouvelle œuvre
    Then l'œuvre est créée

  Scenario: Supprimer une œuvre
    Given je suis connecté en tant que "Administrateur"
    And une œuvre existe
    When je supprime l'œuvre
    Then l'œuvre est supprimée