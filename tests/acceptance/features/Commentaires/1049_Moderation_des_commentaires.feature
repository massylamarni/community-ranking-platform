# language: en

Feature: Modération des commentaires

  Scenario: Suppression d'un commentaire non conforme par l'administrateur
    Given je suis connecté en tant que "Administrateur"
    And un commentaire publié ne respecte pas les règles définies par le site
    When je consulte ce commentaire
    And je le supprime dans le cadre de la modération
    Then le commentaire n'est plus affiché sous l'œuvre concernée

  Scenario: Un utilisateur non administrateur ne peut pas modérer un commentaire
    Given un commentaire publié ne respecte pas les règles définies par le site
    And  un utilisateur non administrateur est authentifié
    When  l'utilisateur tente de le supprimer au titre de la modération
    Then la suppression est refusée
    And un message indique qu'il n'a pas les droits nécessaires