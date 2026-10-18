// Feature: Connexion
import { Given, When, Then } from '../fixtures';

Given("un compte existe avec le pseudo {string} et le mot de passe {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

Given("l'utilisateur est sur la page de connexion", async ({ page }) => {
  // TODO
});

When("il saisit {string} comme pseudo", async ({ page }, arg1: string) => {
  // TODO
});

When("il saisit {string} comme mot de passe", async ({ page }, arg1: string) => {
  // TODO
});

Then("l'utilisateur est authentifié", async ({ page }) => {
  // TODO
});

Then("il est redirigé vers son espace utilisateur", async ({ page }) => {
  // TODO
});

Then("l'utilisateur n'est pas authentifié", async ({ page }) => {
  // TODO
});

Then("un message indique que les identifiants sont incorrects", async ({ page }) => {
  // TODO
});
