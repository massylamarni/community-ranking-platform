# language: en

@commentaires
Feature: Commentaire sur une œuvre personnelle

  Scenario: Interdiction de publier un commentaire principal sur sa propre œuvre
    Given un utilisateur authentifié consulte une œuvre qu'il a lui-même déposée
    When il tente de publier un commentaire principal sur cette œuvre
    Then l'action est refusée par le système
    And un message indique qu'il ne peut pas commenter sa propre œuvre

  Scenario: Réponse de l'auteur à un commentaire laissé sur sa propre œuvre
    Given un autre utilisateur a publié un commentaire sur une œuvre appartenant à l'utilisateur authentifié
    When l'auteur de l'œuvre répond à ce commentaire
    Then la réponse est enregistrée
    And elle est affichée sous l'œuvre concernée