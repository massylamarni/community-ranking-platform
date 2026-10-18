# language: en
Feature: Modification après refus
  Scenario: Modifier une proposition refusée et la soumettre à nouveau
    Given l'utilisateur "Frédégonde" est authentifié
    And l'utilisateur a proposé l'œuvre "Tintin"
    And la proposition a été refusée
    When l'utilisateur modifie la description de l'œuvre
    And il remplace la description en "Les aventures de Tintin"
    And il soumet à nouveau l'œuvre
    Then la nouvelle proposition est enregistrée
    And la proposition est envoyée au filtrage automatique
    And son statut est "En attente de modération"