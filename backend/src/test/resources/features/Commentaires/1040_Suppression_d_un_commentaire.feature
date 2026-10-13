# language: en

Feature: Suppression d'un commentaire

  Scenario: L'auteur supprime son propre commentaire
    Given un utilisateur authentifié a publié un commentaire
    When il supprime ce commentaire
    Then le commentaire n'est plus affiché sous l'œuvre

  Scenario: Un administrateur supprime un commentaire
    Given un administrateur est authentifié
    And un commentaire est publié sous une œuvre
    When un administrateur supprime ce commentaire
    Then le commentaire n'est plus affiché sous l'œuvre

  Scenario: Un utilisateur tiers ne peut pas supprimer le commentaire d'un autre
    Given un utilisateur authentifié a publié un commentaire
    When un autre utilisateur authentifié, ni auteur ni administrateur, tente de supprimer ce commentaire
    #Then la suppression est refusée
    #And un message indique qu'il n'a pas les droits nécessaires