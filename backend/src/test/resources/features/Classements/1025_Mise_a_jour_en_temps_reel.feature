# language: en

Feature: Mise à jour en temps réel

  Scenario: Actualisation immédiate du score affiché après un nouveau vote
    Given l'utilisateur consulte le classement d'une catégorie où l'œuvre "A" affiche un score de 5
    When un autre utilisateur attribue un vote positif à l'œuvre "A"
    Then le score de "A" affiché passe à 6
    And cette mise à jour s'affiche sans que l'utilisateur ait besoin de recharger la page