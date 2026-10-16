# language: en
Feature: Affichage des commentaires 
  @wip
  Scenario: Afficher les commentaires associés à une œuvre
    Given une œuvre publiée 
    And des commentaires sont associés à cette œuvre 
    When un utilisateur consulte l'œuvre 
    Then les commentaires associés à l'œuvre sont affichés