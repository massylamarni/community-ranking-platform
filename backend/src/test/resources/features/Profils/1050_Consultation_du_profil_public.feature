# language: en

Feature: Consultation du profil public

  Scenario: Consultation du profil public par un autre utilisateur
    Given l'utilisateur "Frédégonde" possède un profil public
    When un autre utilisateur consulte ce profil
    Then le profil de "Frédégonde" s'affiche avec succès