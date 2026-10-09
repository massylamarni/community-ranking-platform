# language: en
Feature: Notification de blocage ou suppression
  Scenario: Notifier l'utilisateur après le blocage de son compte
    Given un utilisateur possède un compte actif
    When un administrateur bloque son compte
    Then l'utilisateur est informé que son compte a été bloqué

  Scenario: Notifier l'utilisateur après la suppression de son compte
    Given un utilisateur possède un compte actif
    When un administrateur supprime son compte
    Then l'utilisateur est informé que son compte a été supprimé

  Scenario: Notifier l'utilisateur lorsqu'une action affecte son contenu
    Given un utilisateur possède un contenu
    When un administrateur réalise une action affectant ce contenu
    Then l'utilisateur est informé de l'action réalisée