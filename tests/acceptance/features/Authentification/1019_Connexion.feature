# language: en
Feature: Connexion

  Scenario: Se connecter avec des identifiants valides
    Given un compte existe avec le pseudo "bob" et le mot de passe "password123!"
    And l'utilisateur est sur la page de connexion
    When il saisit "bob" comme identifiant
    And il saisit "password123!" comme mot de passe
    And il valide le formulaire
    Then l'utilisateur est authentifié
    And il est redirigé vers son espace utilisateur

  Scenario: Refuser une connexion avec un mot de passe incorrect
    Given un compte existe avec le pseudo "bob" et le mot de passe "password123!"
    When l'utilisateur saisit "bob" comme identifiant
    And il saisit "wrongPassword" comme mot de passe
    And il valide le formulaire
    Then l'utilisateur n'est pas authentifié
    And un message indique que les identifiants sont incorrects