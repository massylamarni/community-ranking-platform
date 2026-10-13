# language: en
Feature: Création d'un vote négatif 
  Scenario: Un utilisateur authentifié attribue un vote négatif 
    Given un utilisateur authentifié 
    And une œuvre créée par un autre utilisateur 
    When l'utilisateur attribue un vote négatif à l'œuvre 
    Then le vote négatif est enregistré