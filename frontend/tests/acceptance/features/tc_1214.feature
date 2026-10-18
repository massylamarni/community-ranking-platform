# language: en
Feature: Création d'un vote négatif 
  Scenario: Un utilisateur authentifié attribue un vote négatif 
    Given l'utilisateur "bob" est authentifié
    And une œuvre "Tintin" créée par un autre utilisateur "alice" 
    When l'utilisateur attribue un vote négatif à l'œuvre 
    Then le vote négatif est enregistré