# language: en
Feature: Refus d'une œuvre
  Scenario Outline: Refuser une œuvre en attente
    Given l'œuvre "<oeuvre>" est en attente de modération
    And l'administrateur est connecté
    When l'administrateur refuse l'œuvre
    Then le statut de "<oeuvre>" devient "Refusée"
    And "<oeuvre>" n'apparaît pas dans les œuvres publiques
    And l'auteur de "<oeuvre>" est informé du refus

    Examples:
      | oeuvre            |
      | Contenu interdit  |
      | Œuvre non conforme |
      | Proposition test  |