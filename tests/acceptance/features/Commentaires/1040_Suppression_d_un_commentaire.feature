# language: en

Feature: Suppression d'un commentaire

  Scenario: L'auteur supprime son propre commentaire
    Given l'utilisateur "alice" est authentifié 
    And il a publié un commentaire "Superbe travail"
    When il supprime ce commentaire 
    Then le commentaire n'est plus affiché sous l'œuvre

  Scenario: Un administrateur supprime un commentaire
    Given je suis connecté en tant que "Administrateur"
    And un commentaire est publié sous une œuvre
    When je supprime ce commentaire
    Then le commentaire n'est plus affiché sous l'œuvre

  Scenario: Un utilisateur tiers ne peut pas supprimer le commentaire d'un autre
    Given l'utilisateur "alice" est authentifié
    And il a publié un commentaire "Superbe travail"
    When un autre utilisateur authentifié, ni auteur ni administrateur, tente de supprimer ce commentaire
    Then la suppression est refusée
    And un message indique qu'il n'a pas les droits nécessaires