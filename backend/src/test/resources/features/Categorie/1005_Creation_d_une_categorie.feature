# language: en
Feature: Création d'une catégorie

  Scenario: Un administrateur crée une catégorie
    Given un administrateur est authentifié
    When il saisit le nom de catégorie "Science-fiction"
    And il valide la création
    Then la catégorie "Science-fiction" est créée
    And elle apparaît dans la liste des catégories

  Scenario: Un utilisateur non administrateur ne peut pas créer une catégorie
    Given un utilisateur non administrateur est authentifié
    When il tente de créer la catégorie "Science-fiction"
    Then la catégorie n'est pas créée
    And un message indique qu'il n'a pas les droits nécessaires