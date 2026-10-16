# language: en

Feature: Identification de l'auteur

  Scenario: Affichage du pseudo de l'auteur sur son commentaire
    Given l'utilisateur "Frédégonde" est authentifié
    And il a publié un commentaire "Superbe travail"
    When l'œuvre est consultée
    Then le commentaire affiché indique "Frédégonde" comme auteur