# language: en
Feature: Affichage du vote de l'utilisateur

  Scenario: Indiquer le vote positif actuellement sélectionné
    Given l'utilisateur "Frédégonde" est authentifié
    And l'utilisateur a attribué un vote positif à une œuvre
    When l'utilisateur consulte l'œuvre
    Then l'interface indique que le vote positif est actuellement sélectionné

  Scenario: Indiquer le vote négatif actuellement sélectionné
    Given l'utilisateur "Frédégonde" est authentifié
    And l'utilisateur a attribué un vote négatif à une œuvre
    When l'utilisateur consulte l'œuvre
    Then l'interface indique que le vote négatif est actuellement sélectionné

  Scenario: Ne pas sélectionner de vote lorsque l'utilisateur n'a pas voté
    Given l'utilisateur "Frédégonde" est authentifié
    And l'utilisateur n'a pas voté pour une œuvre
    When l'utilisateur consulte l'œuvre
    Then aucun vote n'est indiqué comme actuellement sélectionné