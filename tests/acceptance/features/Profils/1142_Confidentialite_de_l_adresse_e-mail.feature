# language: en
Feature: Confidentialité de l'adresse e-mail
  Scenario: Ne pas afficher l'adresse e-mail sur le profil public
    Given l'utilisateur "alice" est authentifié
    And l'utilisateur "Frédégonde" possède un profil public
    And l'utilisateur possede l'adresse e-mail "fredegonde@gmail.com"
    When l'utilisateur "alice" consulte ce profil
    Then le profil de "Frédégonde" s'affiche avec succès
    And l'adresse e-mail "fredegonde@gmail.com" n'est pas affichée