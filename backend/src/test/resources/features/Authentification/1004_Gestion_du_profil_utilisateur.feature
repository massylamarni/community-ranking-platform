# language: en
Feature: Gestion du profil utilisateur

  Scenario: Consulter son profil
    Given l'utilisateur "alice" est authentifié
    And son profil contient le pseudo "alice"
    And son profil contient l'adresse e-mail "alice@example.com"
    When elle consulte son profil
    Then son pseudo "alice" est affiché

  Scenario: Modifier une information autorisée de son profil
    Given l'utilisateur "alice" est authentifié
    When elle modifie une information autorisée de son profil
    And elle valide les modifications
    Then la nouvelle information est enregistrée
    And la nouvelle information est affichée dans son profil