# language: en
Feature: Notification de refus
  Scenario: Notifier l'utilisateur après refus de son œuvre
    Given un utilisateur a soumis une œuvre
    And l'œuvre est en attente de modération
    When un administrateur refuse l'œuvre
    Then l'utilisateur est informé que son œuvre a été refusée