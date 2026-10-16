# language: en

Feature: Affichage des commentaires

  Scenario: Affichage de l'ensemble des commentaires associés à une œuvre
    Given l'œuvre "La taupe sauteuse" a reçu 3 commentaires publiés
    When cette œuvre est consultée
    Then les 3 commentaires sont affichés sous l'œuvre