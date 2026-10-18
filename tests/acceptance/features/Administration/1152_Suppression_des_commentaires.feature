# language: en
Feature: Suppression des commentaires

  Scenario Outline: Supprimer un commentaire
    Given je suis connecté en tant que "Administrateur"
    And l'utilisateur "<utilisateur>" a publié le commentaire "<commentaire>" sur l’œuvre "<oeuvre>"
    When je supprime le commentaire
    Then le commentaire "<commentaire>" n'est plus visible sur l’œuvre "<oeuvre>"
    And le commentaire "<commentaire>" n'est plus visible sur le profil de l'utilisateur "<utilisateur>"

    Examples:
      | utilisateur | oeuvre                              | commentaire          |
      | Frédégonde  | Les aventures de Momo l'hippopotame | Excellent film !     |
      | Alice       | La potiche trouée                   | Une très bonne pièce |