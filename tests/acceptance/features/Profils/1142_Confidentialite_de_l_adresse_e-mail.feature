# language: en
Feature: Confidentialité de l'adresse e-mail
  Scenario: Ne pas afficher l'adresse e-mail sur le profil public
    Given un utilisateur possède une adresse e-mail
    When un autre utilisateur consulte son profil public
    Then l'adresse e-mail de l'utilisateur n'est pas affichée