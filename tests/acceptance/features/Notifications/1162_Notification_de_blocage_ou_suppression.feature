# language: en
Feature: Notification lorsqu'une action affecte son contenu
  Scenario: Notifier l'utilisateur lorsqu'une action affecte son contenu
    Given un utilisateur possède un contenu
    When un administrateur réalise une action affectant ce contenu
    Then l'utilisateur est informé de l'action réalisée