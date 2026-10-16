# language: en

@commentaires
Feature: Modification d'un commentaire

  Scenario: L'auteur modifie son propre commentaire
    Given un utilisateur authentifié a publié le commentaire "Superbe travail"
    When il modifie ce commentaire en "Superbe travail, bravo !"
    And il valide la modification
    Then le commentaire affiché sous l'œuvre est "Superbe travail, bravo !"

  Scenario: Un autre utilisateur ne peut pas modifier ce commentaire
    Given un utilisateur authentifié a publié un commentaire
    When un autre utilisateur authentifié tente de modifier ce commentaire
    Then la modification est refusée
    And un message indique qu'il n'a pas les droits nécessaires