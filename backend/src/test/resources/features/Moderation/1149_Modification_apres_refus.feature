# language: en
Feature: Modification après refus
  Scenario Outline: Modifier une proposition refusée et la soumettre à nouveau
    Given l'utilisateur a proposé l'œuvre "<oeuvre>"
    And la proposition a été refusée
    When utilisateur modifie la description de l'œuvre
    And il remplace la description par "<nouvelle_description>"
    And il soumet à nouveau l'œuvre
    Then la nouvelle proposition est enregistrée
    And la proposition est envoyée au filtrage automatique
    And son statut est "En attente de modération"