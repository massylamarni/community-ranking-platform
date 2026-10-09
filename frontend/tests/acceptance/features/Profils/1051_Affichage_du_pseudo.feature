# language: en

Feature: Affichage du pseudo

  Scenario: Affichage du pseudo de l'utilisateur sur son profil
    Given l'utilisateur "Frédégonde" possède un profil public
    When ce profil est consulté
    Then le pseudo "Frédégonde" est affiché sur la page