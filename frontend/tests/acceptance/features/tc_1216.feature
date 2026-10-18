# language: en
Feature: Modification du vote 
  Scenario: Modifier un vote positif en vote négatif 
    Given l'utilisateur "Frédégonde" est authentifié 
    And l'utilisateur a attribué un vote positif à une œuvre 
    When l'utilisateur modifie son vote en vote négatif 
    Then le vote de l'utilisateur devient négatif 
    
  Scenario: Modifier un vote négatif en vote positif 
    Given l'utilisateur "Frédégonde" est authentifié 
    And l'utilisateur a attribué un vote négatif à une œuvre 
    When l'utilisateur modifie son vote en vote positif 
    Then le vote de l'utilisateur devient positif