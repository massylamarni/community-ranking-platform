
# language: en
Feature: Affichage des œuvres par catégorie

  Scenario: Consulter les œuvres d'une catégorie
    Given la catégorie "Science-fiction" existe
    And les œuvres "Dune" et "Fondation" appartiennent à la catégorie "Science-fiction"
    And l'œuvre "Le Seigneur des anneaux" appartient à la catégorie "Fantastique"
    When un utilisateur consulte la catégorie "Science-fiction"
    Then "Dune" est affichée
    And "Fondation" est affichée
    And "Le Seigneur des anneaux" n'est pas affichée

  Scenario: Consulter une catégorie sans œuvre
    Given la catégorie "Horreur" existe
    And aucune œuvre n'est associée à la catégorie "Horreur"
    When un utilisateur consulte la catégorie "Horreur"
    Then aucune œuvre n'est affichée
    And un message indique qu'aucune œuvre n'est disponible
