# language: en

Feature: Calcul du score d'une œuvre

  Scenario Outline: Calculer le score à partir des votes positifs et négatifs
    Given une œuvre possède <votes_positifs> votes positifs
    And l'œuvre possède <votes_negatifs> votes négatifs
    When le score de l'œuvre est calculé
    Then le score de l'œuvre est égal à <score>

    Examples:
      | votes_positifs | votes_negatifs | score |
      | 0              | 0              | 0     |
      | 1              | 0              | 1     |
      | 10             | 4              | 6     |
      | 4              | 10             | -6    |
      | 3              | 7              | -4    |
      | 50             | 20             | 30    |
      | 100            | 100            | 0     |

