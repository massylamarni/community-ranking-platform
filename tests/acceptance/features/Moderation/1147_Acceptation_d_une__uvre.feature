# language: en
Feature: Acceptation d'une œuvre
  Scenario Outline: Accepter une œuvre en attente
    Given l'œuvre "<oeuvre>" est en attente de modération
    And l'œuvre appartient à la catégorie "<categorie>"
    And l'administrateur est connecté
    When l'administrateur accepte l'œuvre
    Then le statut de "<oeuvre>" devient "Acceptée"
    And "<oeuvre>" apparaît dans la liste des œuvres de la catégorie "<categorie>"
    And l'œuvre peut être consultée par les utilisateurs

    Examples:
      | oeuvre            | categorie    |
      | La taupe sauteuse | Théâtre      |
      | Paysage jurassien | Photographie |
      | Voyage sur Mars   | Film         |