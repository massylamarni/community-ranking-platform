# language: en

Feature: Ajout d'une image

  Scenario: Publication d'un commentaire avec une image associée
    Given l'utilisateur "Frédégonde" est authentifié
    And il rédige un commentaire valide
    When il associe une image à ce commentaire
    And il valide la publication
    Then le commentaire est publié avec l'image associée