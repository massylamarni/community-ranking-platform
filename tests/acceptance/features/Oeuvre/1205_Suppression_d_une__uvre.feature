# language: en
Feature: Suppression d'une œuvre 
  Scenario: L'auteur supprime sa propre œuvre 
    Given un utilisateur authentifié 
    And une œuvre créée par cet utilisateur 
    When l'utilisateur supprime l'œuvre 
    Then l'œuvre est supprimée 
  Scenario: L'administrateur supprime une œuvre 
    Given un administrateur authentifié 
    And une œuvre existante 
    When l'administrateur supprime l'œuvre 
    Then l'œuvre est supprimée 
  Scenario: Un utilisateur tente de supprimer l'œuvre d'un autre utilisateur 
    Given un utilisateur authentifié 
    And une œuvre créée par un autre utilisateur 
    When l'utilisateur tente de supprimer l'œuvre 
    Then la suppression est refusée