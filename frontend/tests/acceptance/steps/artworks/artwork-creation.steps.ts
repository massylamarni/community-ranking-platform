// Feature: Création d'une œuvre
import { Given, When, Then } from '../fixtures';

Given("l'utilisateur {string} est sur la page de proposition d'œuvre", async ({ page }, arg1: string) => {
  // TODO
});

Given("un visiteur n'est pas authentifié", async ({ page }) => {
  // TODO
});

When("l'utilisateur {string} saisit le titre {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

When("l'utilisateur {string} saisit la description {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

When("l'utilisateur {string} sélectionne la catégorie {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

When("l'utilisateur {string} valide la création", async ({ page }, arg1: string) => {
  // TODO
});

When("il tente de créer une œuvre", async ({ page }) => {
  // TODO
});

Then("l'œuvre {string} est créée", async ({ page }, arg1: string) => {
  // TODO
});

Then("l'œuvre est associée à l'utilisateur {string}", async ({ page }, arg1: string) => {
  // TODO
});

Then("l'œuvre est associée à la catégorie {string}", async ({ page }, arg1: string) => {
  // TODO
});
