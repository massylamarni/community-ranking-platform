# language: en
Feature: Création d'un vote positif 
  Scenario: Un utilisateur authentifié attribue un vote positif 
    Given l'utilisateur "bob" est authentifié 
    And une œuvre "Tintin" créée par un autre utilisateur "alice"
    When l'utilisateur attribue un vote positif à l'œuvre 
    Then le vote positif est enregistré