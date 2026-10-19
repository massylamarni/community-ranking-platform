# language: en
Feature: Gestion du profil utilisateur

  Scenario: Consulter son profil
    Given l'utilisateur "alice" est authentifié
    And son profil contient le pseudo "alice"
    And son profil contient l'adresse e-mail "alice@example.com"
    When il consulte son profil
    Then son pseudo "alice" est affiché
    And son adresse e-mail "alice@example.com" est affichée

  Scenario: Modifier son pseudo
    Given l'utilisateur "alice" est authentifié
    And son profil contient le pseudo "alice"
    When il modifie son pseudo en "alice123"
    And il valide les modifications
    Then son nouveau pseudo est "alice123"
    And son nouveau pseudo "alice123" est affiché dans son profil