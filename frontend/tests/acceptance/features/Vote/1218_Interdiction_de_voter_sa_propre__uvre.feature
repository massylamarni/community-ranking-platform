# language: en
Feature: Interdiction de voter sa propre œuvre 
  Scenario: L'auteur tente de voter pour sa propre œuvre 
    Given un utilisateur authentifié 
    And une œuvre créée par cet utilisateur 
    When l'utilisateur tente d'attribuer un vote positif à son œuvre 
    Then le vote est refusé 
  Scenario: L'auteur tente d'attribuer un vote négatif à sa propre œuvre 
    Given un utilisateur authentifié 
    And une œuvre créée par cet utilisateur 
    When l'utilisateur tente d'attribuer un vote négatif à son œuvre 
    Then le vote est refusé