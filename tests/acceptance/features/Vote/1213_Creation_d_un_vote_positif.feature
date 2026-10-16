# language: en
Feature: Création d'un vote positif 
  Scenario: Un utilisateur authentifié attribue un vote positif 
    Given un utilisateur authentifié 
    And une œuvre créée par un autre utilisateur 
    When l'utilisateur attribue un vote positif à l'œuvre 
    Then le vote positif est enregistré