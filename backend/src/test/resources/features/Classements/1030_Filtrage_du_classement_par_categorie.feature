# language: en

Feature: Filtrage du classement par catégorie

  Scenario: Filtrage interactif du classement global sur une catégorie choisie
    Given l'utilisateur consulte le classement global comportant des œuvres de plusieurs catégories
    When il sélectionne le filtre "Catégorie : Musique"
    And il valide le filtre
    Then seules les œuvres de la catégorie "Musique" restent affichées
    And elles restent triées par score