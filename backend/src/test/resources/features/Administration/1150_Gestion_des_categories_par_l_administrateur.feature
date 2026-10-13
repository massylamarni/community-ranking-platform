# language: en
Feature: Gestion des catégories par l'administrateur
  Scenario Outline: Créer une catégorie
    Given l'administrateur est connecté
    And la catégorie "<categorie>" n'existe pas
    When l'administrateur crée la catégorie "<categorie>"
    Then la catégorie "<categorie>" est créée
    And elle peut être utilisée pour déposer une œuvre
    Examples:
      | categorie    |
      | Photographie |
      | Théâtre      |
      | Musique      |

  Scenario Outline: Supprimer une catégorie
    Given l'administrateur est connecté
    And la catégorie "<categorie>" existe
    When l'administrateur supprime la catégorie
    Then la catégorie "<categorie>" n'existe plus
    And elle ne peut plus être sélectionnée pour une nouvelle œuvre
    Examples:
      | categorie    |
      | Photographie |
      | Théâtre      |
      | Musique      |