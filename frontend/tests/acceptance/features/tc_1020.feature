
# language: en

Feature: Classement global

  Background:
    Given les œuvres publiées suivantes existent dans des catégories différentes :
      | Œuvre | Catégorie    | Score |
      | A     | Musique      | 9     |
      | B     | Photographie | 15    |
      | C     | Théâtre      | 3     |

  Scenario Outline: Affichage du classement global toutes catégories confondues, trié par score
    When l'utilisateur consulte le classement global
    Then l'œuvre "<Œuvre>" apparaît en position <Position> avec un score de <Score>

    Examples:
      | Œuvre | Position | Score |
      | B     | 1        | 15    |
      | A     | 2        | 9     |
      | C     | 3        | 3     |
