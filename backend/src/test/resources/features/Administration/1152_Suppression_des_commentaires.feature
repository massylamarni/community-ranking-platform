# language: en
Feature: Suppression des commentaires
  Scenario Outline: Supprimer un commentaire
    Given l'administrateur est connecté
    And "<utilisateur>" a publié le commentaire "<commentaire>" sur "<oeuvre>"
    When l'administrateur supprime le commentaire
    Then le commentaire n'est plus visible sur "<oeuvre>"
    And le commentaire n'est plus visible sur le profil de "<utilisateur>"

    Examples:
      | utilisateur | oeuvre                              | commentaire                 |
      | Frédégonde  | Les aventures de Momo l'hippopotame | Excellent film !           |
      | Alice       | La potiche trouée                  | Une très bonne pièce       |