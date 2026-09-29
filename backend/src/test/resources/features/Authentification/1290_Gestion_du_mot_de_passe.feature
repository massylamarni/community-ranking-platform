# language: en
Feature: Gestion des mots de passe
  
  Scenario: Modifier son mot de passe avec succès
    Given l'utilisateur "bob" est authentifié
    When il saisit "oldPassword!" comme ancien mot de passe
    And il saisit "newPassword!" comme nouveau mot de passe
    And il confirme "newPassword!"
    And il valide le formulaire
    Then le mot de passe est modifié
    And il peut se connecter avec "newPassword!"
    
    Scenario: Réinitialiser un mot de passe oublié
    Given un compte existe avec l'adresse e-mail "bob@example.com"
    And l'utilisateur demande à réinitialiser son mot de passe
    When il saisit "bob@example.com"
    And il valide la demande
    Then une procédure de réinitialisation est envoyée à cette adresse e-mail