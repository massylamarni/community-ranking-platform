# language: en

Feature: Consultation du profil public

  Scenario: Consultation du profil public par un autre utilisateur
    Given l'utilisateur "alice" est authentifié
    And l'utilisateur "Frédégonde" possède un profil public
    When l'utilisateur "alice" consulte ce profil
    Then le profil de "Frédégonde" s'affiche avec succès