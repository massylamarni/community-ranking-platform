# language: en
Feature: Gestion des œuvres par l'administrateur
  Scenario: Créer une œuvre
    Given un administrateur est connecté
    When l'administrateur crée une nouvelle œuvre
    Then l'œuvre est créée

  Scenario: Supprimer une œuvre
    Given un administrateur est connecté
    And une œuvre existe
    When l'administrateur supprime l'œuvre
    Then l'œuvre est supprimée