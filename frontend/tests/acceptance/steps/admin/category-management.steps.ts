// Feature: Gestion des catégories par l'administrateur
import { Given, When, Then } from '../fixtures';

Given("la catégorie {string} n'existe pas", async ({ page }, arg1: string) => {
  // TODO
});

When("je crée la catégorie {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("je supprime la catégorie {string}", async ({ page }, arg1: string) => {
  // TODO
});

Then("elle peut être utilisée pour déposer une œuvre", async ({ page }) => {
  // TODO
});

Then("elle ne peut plus être sélectionnée pour une nouvelle œuvre", async ({ page }) => {
  // TODO
});
