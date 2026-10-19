# language: en
Feature: Gestion des mots de passe

  Scenario: Modifier son mot de passe avec succès
    Given l'utilisateur "bob" est authentifié
    And il est sur la page de modification de mot de passe
    When il saisit "oldPassword!" comme ancien mot de passe
    And il saisit "newPassword!" comme nouveau mot de passe
    And il confirme "newPassword!"
    And il valide le formulaire
    Then le mot de passe est modifié
    And il peut se connecter avec "newPassword!"

  Scenario: Demander la réinitialisation d'un mot de passe oublié
    Given un compte existe avec l'adresse e-mail "bob@example.com"
    And il est sur la page de demande de réinitialisation du mot de passe
    When il saisit "bob@example.com"
    And il valide la demande de réinitialisation de son mot de passe
    Then un message de réinitialisation est envoyé à l'adresse "bob@example.com"
    
  Scenario: Réinitialiser son mot de passe avec le lien reçu
    Given l'utilisateur "bob" a reçu un lien de réinitialisation valide
    When il ouvre le lien de réinitialisation
    And il saisit "newPassword!" comme nouveau mot de passe
    And il confirme "newPassword!"
    And il valide le formulaire
    Then le mot de passe est modifié
    And il peut se connecter avec "newPassword!"