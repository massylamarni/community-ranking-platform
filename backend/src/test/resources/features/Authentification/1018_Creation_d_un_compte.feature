# language: en
Feature: Création d'un compte

  Scenario: Créer un compte avec des informations valides
    Given un visiteur est sur la page de création de compte
    When il saisit le pseudo "alice_cucumber"
    And il saisit l'adresse e-mail "alice_cucumber@example.com"
    And il saisit le mot de passe "MotDePasse123!"
    And il valide le formulaire
    Then le compte "alice_cucumber" est créé
    And un message de confirmation est affiché
    And l'utilisateur peut se connecter avec ses identifiants

  Scenario: Refuser la création d'un compte sans pseudo
    Given un visiteur est sur la page de création de compte
    When il saisit l'adresse e-mail "alice@example.com"
    And il saisit le mot de passe "MotDePasse123!"
    And il valide le formulaire
    Then le compte n'est pas créé
    And un message indique que le pseudo est obligatoire

  Scenario: Refuser la création d'un compte avec une adresse e-mail invalide
    Given un visiteur est sur la page de création de compte
    When il saisit le pseudo "alice_invalid_email"
    And il saisit l'adresse e-mail "alice"
    And il saisit le mot de passe "MotDePasse123!"
    And il valide le formulaire
    Then le compte n'est pas créé
    And un message indique que l'adresse e-mail est invalide