# language: en
Feature: Suppression du vote 
  Scenario: Retirer son vote 
    Given l'utilisateur "Frédégonde" est authentifié
    And l'utilisateur possède un vote actif sur une œuvre 
    When l'utilisateur retire son vote 
    Then le vote de l'utilisateur est supprimé