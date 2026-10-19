# language: en
Feature: Refus d'une œuvre
  Scenario Outline: Refuser une œuvre en attente
    Given je suis connecté en tant que "Administrateur"
    And l'œuvre <oeuvre> est en attente de modération
    When je refuse l'œuvre <oeuvre>
    Then le statut de <oeuvre> devient "Refusée"
    And l'œuvre <oeuvre> n'apparaît pas dans les œuvres publiques
    And l'auteur de <oeuvre> est informé du refus

    Examples:
      | oeuvre               |
      | "Contenu interdit"   |
      | "Œuvre non conforme" |
      | "Proposition test"   |