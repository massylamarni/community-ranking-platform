# language: en
Feature: Suppression du vote 
  Scenario: Retirer son vote 
    Given un utilisateur authentifié 
    And l'utilisateur possède un vote actif sur une œuvre 
    When l'utilisateur retire son vote 
    Then le vote de l'utilisateur est supprimé