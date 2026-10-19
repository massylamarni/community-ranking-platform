# language: en
Feature: Suppression d'une catégorie

  Scenario: Un administrateur supprime une catégorie vide
    Given je suis connecté en tant que "Administrateur"
    And la catégorie "Science-fiction" existe
    And aucune œuvre n'est associée à cette catégorie
    When l'administrateur supprime la catégorie "Science-fiction"
    And il confirme la suppression
    Then la catégorie "Science-fiction" n'existe plus
    And elle n'apparaît plus dans la liste des catégories

  Scenario: Un utilisateur non administrateur ne peut pas supprimer une catégorie
    Given un utilisateur non administrateur est authentifié
    And la catégorie "Science-fiction" existe
    When il tente de supprimer la catégorie
    Then la catégorie n'est pas supprimée
    And un message indique qu'il n'a pas les droits nécessaires