# language: en
@oeuvre
Feature: Nouvelle analyse après modification 
  Scenario: Soumettre une œuvre modifiée au filtrage 
    Given une œuvre existante 
    And l'auteur modifie l'œuvre 
    When les modifications sont enregistrées 
    Then l'œuvre modifiée est soumise à nouveau au processus de filtrage