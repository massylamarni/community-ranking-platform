# language: en
Feature: Un seul vote actif par utilisateur 
  Scenario: Empêcher un utilisateur d'avoir plusieurs votes actifs sur une même œuvre 
    Given un utilisateur authentifié 
    And une œuvre qui n'appartient pas à l'utilisateur 
    And l'utilisateur possède déjà un vote actif sur cette œuvre 
    When l'utilisateur tente d'attribuer un nouveau vote à cette œuvre 
    Then le système ne crée pas un second vote actif 
    And un seul vote reste actif pour cet utilisateur sur cette œuvre