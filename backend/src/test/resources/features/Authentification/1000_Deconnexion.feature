# language: en
Feature: Déconnexion

Scenario: Se déconnecter d'un compte authentifié
  Given l'utilisateur "bob" est authentifié
  When il demande à se déconnecter
  Then l'utilisateur n'est plus authentifié
  And une ressource publique reste accessible après la déconnexion

Scenario: Empêcher l'accès aux fonctionnalités authentifiées après déconnexion
  Given l'utilisateur "bob" est authentifié
  When il se déconnecte
  And il tente d'accéder à son espace utilisateur
  Then l'accès lui est refusé
  And il est invité à se connecter