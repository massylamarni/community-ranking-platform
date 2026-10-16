# language: en

Feature: Création d'un commentaire
  Scenario: Publier un commentaire sur une œuvre qu'il n'a pas déposée
    Given un utilisateur authentifié consulte une œuvre qu'il n'a pas déposée
    When il rédige le commentaire "Superbe travail"
    And il valide la publication
    Then le commentaire "Superbe travail" est enregistré
    And il est affiché sous l'œuvre concernée avec son auteur

  Scenario: Refuser la publication d'un commentaire par un visiteur non authentifié
    Given un visiteur non authentifié consulte une œuvre
    When il tente de publier le commentaire "Superbe travail"
    Then le système l'empêche de publier le commentaire
    And le commentaire n'est pas enregistré
    And un message indique qu'il doit être connecté pour commenter