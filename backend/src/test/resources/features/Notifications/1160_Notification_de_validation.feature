# language: en
Feature: Notification de validation
  Scenario: Notifier l'utilisateur après acceptation de son œuvre
    Given un utilisateur a soumis une œuvre
    And l'œuvre est en attente de modération
    When un administrateur accepte l'œuvre
    Then l'utilisateur est informé que son œuvre a été acceptée