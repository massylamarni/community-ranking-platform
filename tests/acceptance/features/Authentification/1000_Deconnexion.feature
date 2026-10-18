# language: en
Feature: Déconnexion

Scenario: Se déconnecter d'un compte authentifié
  Given l'utilisateur "bob" est authentifié
  When il se déconnecte
  Then l'utilisateur "bob" n'est plus authentifié
  And il est redirigé vers une page accessible aux visiteurs

Scenario: Empêcher l'accès aux fonctionnalités authentifiées après déconnexion
  Given l'utilisateur "bob" est authentifié
  When il se déconnecte
  And il tente d'accéder à son espace utilisateur
  Then l'accès lui est refusé
  And il est invité à se connecter