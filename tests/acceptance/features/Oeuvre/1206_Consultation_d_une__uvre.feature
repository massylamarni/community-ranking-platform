# language: en
Feature: Consultation d'une œuvre 
  Scenario: Un visiteur consulte une œuvre publiée 
    Given une œuvre publiée 
    When un visiteur consulte l'œuvre 
    Then les informations de l'œuvre sont affichées