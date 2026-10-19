# language: en
Feature: Acceptation d'une œuvre
  
  Scenario Outline: Accepter une œuvre en attente
    
    Given je suis connecté en tant que "Administrateur"
    And l'œuvre <oeuvre> est en attente de modération
    And l'œuvre appartient à la catégorie <categorie>
    When j'accepte l'œuvre <oeuvre>
    Then le statut de l'œuvre <oeuvre> devient "Acceptée"
    And l'œuvre <oeuvre> apparaît dans la liste des œuvres de la catégorie <categorie>
    And l'œuvre peut être consultée par les utilisateurs

    Examples:
      | oeuvre              | categorie      |
      | "La taupe sauteuse" | "Théâtre"      |
      | "Paysage jurassien" | "Photographie" |
      | "Voyage sur Mars"   | "Film"         |