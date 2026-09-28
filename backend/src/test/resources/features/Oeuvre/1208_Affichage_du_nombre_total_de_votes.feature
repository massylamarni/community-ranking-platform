# language: en
Feature: Affichage du nombre total de votes 
  Scenario: Afficher le nombre total de votes d'une œuvre 
    Given une œuvre publiée 
    And l'œuvre possède des votes 
    When un utilisateur consulte l'œuvre 
    Then le nombre total de votes de l'œuvre est affiché