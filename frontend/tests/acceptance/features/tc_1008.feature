# language: en
Feature: Association d'une œuvre à une catégorie

  Scenario: Associer une œuvre à une catégorie lors de sa publication
    Given l'utilisateur "alice" est authentifié
    And la catégorie "Science-fiction" existe
    When il crée l'œuvre "Dune"
    And il renseigne "Science-fiction" comme catégorie
    And il publie l'œuvre
    Then l'œuvre "Dune" a le statut "En attente de modération"
    And l'œuvre "Dune" appartient à la catégorie "Science-fiction"

  Scenario: Empêcher la publication d'une œuvre sans catégorie
    Given l'utilisateur "alice" est authentifié
    When il crée l'œuvre "Dune"
    And il ne sélectionne aucune catégorie
    And il tente de publier l'œuvre
    Then l'œuvre n'est pas publiée
    And un message indique qu'une catégorie est obligatoire