// Feature: Gestion des mots de passe
import { Given, When, Then } from '../fixtures';

Given("il est sur la page de modification de mot de passe", async ({ page }) => {
  // TODO
});

Given("un compte existe avec l'adresse e-mail {string}", async ({ page }, arg1: string) => {
  // TODO
});

Given("il est sur la page de demande de réinitialisation du mot de passe", async ({ page }) => {
  // TODO
});

Given("l'utilisateur {string} a reçu un lien de réinitialisation valide", async ({ page }, arg1: string) => {
  // TODO
});

When("il saisit {string} comme ancien mot de passe", async ({ page }, arg1: string) => {
  // TODO
});

When("il saisit {string} comme nouveau mot de passe", async ({ page }, arg1: string) => {
  // TODO
});

When("il confirme {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il saisit {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il valide la demande de réinitialisation de son mot de passe", async ({ page }) => {
  // TODO
});

When("il ouvre le lien de réinitialisation", async ({ page }) => {
  // TODO
});

Then("le mot de passe est modifié", async ({ page }) => {
  // TODO
});

Then("il peut se connecter avec {string}", async ({ page }, arg1: string) => {
  // TODO
});

Then("un message de réinitialisation est envoyé à l'adresse {string}", async ({ page }, arg1: string) => {
  // TODO
});
