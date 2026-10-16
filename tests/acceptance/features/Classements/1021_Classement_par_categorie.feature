# language: en

Feature: Classement par catégorie

  Background:
    Given les œuvres publiées suivantes existent :
      | Œuvre | Catégorie    | Score |
      | A     | Photographie | 9     |
      | B     | Photographie | 15    |
      | C     | Théâtre      | 20    |

  Scenario Outline: Affichage d'un classement limité à une catégorie et trié par score
    When l'utilisateur consulte le classement de la catégorie "Photographie"
    Then l'œuvre "<Œuvre>" apparaît en position <Position> avec un score de <Score>

    Examples:
      | Œuvre | Position | Score |
      | B     | 1        | 15    |
      | A     | 2        | 9     |

  Scenario: Exclusion des œuvres d'une autre catégorie
    When l'utilisateur consulte le classement de la catégorie "Photographie"
    Then l'œuvre "C" n'apparaît pas dans ce classement