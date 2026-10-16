# language: en
Feature: Association d'une œuvre à une catégorie

  Scenario: Associer une œuvre à une catégorie lors de sa publication
    Given l'utilisateur "alice" est authentifié
    And la catégorie "Science-fiction" existe
    When elle crée l'œuvre "Dune"
    And elle renseigne "Science-fiction" comme catégorie
    And elle publie l'œuvre
    Then l'œuvre "Dune" est publiée
    And l'œuvre "Dune" appartient à la catégorie "Science-fiction"

  Scenario: Empêcher la publication d'une œuvre sans catégorie
    Given l'utilisateur "alice" est authentifié
    When elle crée l'œuvre "Dune"
    And elle ne sélectionne aucune catégorie
    And elle tente de publier l'œuvre
    Then l'œuvre n'est pas publiée
    And un message indique qu'une catégorie est obligatoire