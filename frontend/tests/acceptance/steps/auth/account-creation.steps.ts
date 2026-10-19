// Feature: Création d'un compte
import { Given, When, Then } from '../fixtures';

Given("un visiteur est sur la page de création de compte", async ({ page }) => {
  // TODO
});

When("il saisit le pseudo {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il saisit l'adresse e-mail {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il saisit le mot de passe {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il ne saisit pas de pseudo", async ({ page }) => {
  // TODO
});

Then("le compte {string} est créé", async ({ page }, arg1: string) => {
  // TODO
});

Then("un message de confirmation est affiché", async ({ page }) => {
  // TODO
});

Then("l'utilisateur peut se connecter avec ses identifiants", async ({ page }) => {
  // TODO
});

Then("le compte n'est pas créé", async ({ page }) => {
  // TODO
});

Then("un message indique que le pseudo est obligatoire", async ({ page }) => {
  // TODO
});

Then("un message indique que l'adresse e-mail est invalide", async ({ page }) => {
  // TODO
});
