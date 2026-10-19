# language: en
Feature: Suppression d'une œuvre 
  Scenario: L'auteur supprime sa propre œuvre 
    Given l'utilisateur "bob" est authentifié
    And une œuvre "Dune" créée par cet utilisateur 
    When l'utilisateur supprime l'œuvre "Dune"
    Then l'œuvre "Dune" est supprimée 
    
  Scenario: L'administrateur supprime une œuvre 
    Given je suis connecté en tant que "Administrateur"
    And une œuvre "Dune" existe
    When je supprime l'œuvre "Dune"
    Then l'œuvre "Dune" est supprimée 
    
  Scenario: Un utilisateur tente de supprimer l'œuvre d'un autre utilisateur 
    Given l'utilisateur "bob" est authentifié 
    And une œuvre "Tintin" créée par un autre utilisateur "alice" 
    When l'utilisateur tente de supprimer l'œuvre "Tintin"
    Then la suppression est refusée