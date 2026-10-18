# language: en

Feature: Affichage du pseudo

  Scenario: Affichage du pseudo de l'utilisateur sur son profil
    Given l'utilisateur "alice" est authentifié
    And l'utilisateur "Frédégonde" possède un profil public
    When l'utilisateur "alice" consulte ce profil
    Then le profil de "Frédégonde" s'affiche avec succès
    And le pseudo "Frédégonde" est affiché