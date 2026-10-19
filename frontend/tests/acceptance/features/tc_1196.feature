# language: en
Feature: Proposition d'une œuvre 
  Scenario: Proposer une œuvre dans une catégorie 
    Given l'utilisateur "bob" est authentifié
    And la catégorie "Science-fiction" existe
    When l'utilisateur propose une œuvre "Dune" dans cette catégorie "Science-fiction"
    Then la proposition de l'œuvre "Dune" est enregistrée 
    And l'œuvre "Dune" est associée à la catégorie "Science-fiction" 

  Scenario: Un utilisateur non authentifié tente de proposer une œuvre 
    Given un utilisateur non authentifié 
    When l'utilisateur tente de proposer une œuvre 
    Then la proposition de l'œuvre est refusée