# language: en
Feature: Modération des œuvres

  Scenario Outline: Accepter une œuvre
    Given je suis connecté en tant que "Administrateur"
    And l'œuvre <oeuvre> est en attente de modération
    When j'accepte l'œuvre <oeuvre>
    Then l'œuvre <oeuvre> est publiée
    And son statut est "Acceptée"

    Examples:
      | oeuvre              |
      | "La taupe sauteuse" |
      | "Vision aveugle"    |

  Scenario Outline: Refuser une œuvre
    Given je suis connecté en tant que "Administrateur"
    And l'œuvre <oeuvre> est en attente de modération
    When je refuse l'œuvre <oeuvre>
    Then l'œuvre <oeuvre> n'est pas publiée
    And son statut est "Refusée"

    Examples:
      | oeuvre               |
      | "Œuvre non conforme" |
      | "Contenu interdit"   |