# language: en
Feature: Modération des œuvres
  Scenario Outline: Accepter une œuvre
    Given l'administrateur est connecté
    And l'œuvre "<oeuvre>" est en attente de modération
    When l'administrateur accepte l'œuvre
    Then l'œuvre est publiée
    And son statut est "Acceptée"

    Examples:
      | oeuvre            |
      | La taupe sauteuse |
      | Vision aveugle    |

  Scenario Outline: Refuser une œuvre
    Given l'administrateur est connecté
    And l'œuvre "<oeuvre>" est en attente de modération
    When l'administrateur refuse l'œuvre
    Then l'œuvre n'est pas publiée
    And son statut est "Refusée"

    Examples:
      | oeuvre           |
      | Œuvre non conforme |
      | Contenu interdit |