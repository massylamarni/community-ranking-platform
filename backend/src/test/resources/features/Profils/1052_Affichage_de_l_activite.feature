# language: en

Feature: Affichage de l'activité

  Scenario: Affichage des œuvres publiées, des commentaires et des favoris de l'utilisateur
    Given l'utilisateur "Frédégonde" a publié 2 œuvres, 1 commentaire, et voté positivement pour 3 œuvres
    When son profil public est consulté
    Then ses 2 œuvres publiées sont affichées sur son profil
    And son commentaire est affiché sur son profil
    And les 3 œuvres qu'elle a votées positivement sont affichées comme favoris sur son profil