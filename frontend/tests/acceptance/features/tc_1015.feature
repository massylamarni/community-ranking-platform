# language: en
Feature: Titre d'une œuvre

  Scenario: Créer une œuvre avec un titre
    Given l'utilisateur "alice" est authentifié
    When il saisit le titre "Dune"
    And il renseigne les autres informations obligatoires
    And il valide la création
    Then l'œuvre est créée avec le titre "Dune"

  Scenario: Refuser une œuvre sans titre
    Given l'utilisateur "alice" est authentifié
    When il ne saisit aucun titre
    And il renseigne les autres informations obligatoires
    And il valide la création
    Then l'œuvre n'est pas créée
    And un message indique que le titre est obligatoire