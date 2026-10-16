# language: en
@oeuvre
Feature: Proposition d'une œuvre 
  Scenario: Proposer une œuvre dans une catégorie 
    Given un utilisateur authentifié 
    And une catégorie existante 
    When l'utilisateur propose une œuvre dans cette catégorie 
    Then la proposition de l'œuvre est enregistrée 
    And l'œuvre est associée à la catégorie sélectionnée 

  Scenario: Un utilisateur non authentifié tente de proposer une œuvre 
    Given un utilisateur non authentifié 
    When l'utilisateur tente de proposer une œuvre 
    Then la proposition de l'œuvre est refusée