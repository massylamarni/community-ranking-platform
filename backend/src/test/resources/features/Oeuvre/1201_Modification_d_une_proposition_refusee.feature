# language: en
Feature: Modification d'une proposition refusée 
  Scenario: Modifier une proposition refusée 
    Given un utilisateur authentifié 
    And une proposition de cet utilisateur qui a été refusée 
    When l'utilisateur modifie la proposition 
    Then la proposition est modifiée 
  Scenario: Soumettre à nouveau une proposition refusée après modification 
    Given un utilisateur authentifié 
    And une proposition de cet utilisateur qui a été refusée 
    When l'utilisateur modifie la proposition 
    And l'utilisateur soumet à nouveau la proposition 
    Then la proposition est soumise à nouveau