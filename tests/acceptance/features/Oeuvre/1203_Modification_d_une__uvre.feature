# language: en
Feature: Modification d'une œuvre 
  Scenario: Modifier une œuvre dont on est l'auteur 
    Given l'utilisateur "Frédégonde" est authentifié 
    And une œuvre créée par cet utilisateur 
    When l'utilisateur modifie l'œuvre 
    Then les modifications sont enregistrées 
    
  Scenario: Un utilisateur tente de modifier une œuvre dont il n'est pas l'auteur 
    Given l'utilisateur "Frédégonde" est authentifié 
    And une œuvre créée par un autre utilisateur 
    When l'utilisateur tente de modifier l'œuvre 
    Then la modification est refusée