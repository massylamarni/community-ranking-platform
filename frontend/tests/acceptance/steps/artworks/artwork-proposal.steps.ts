// Feature: Proposition d'une œuvre
import { Given, When, Then } from '../fixtures';

Given("un utilisateur non authentifié", async ({ page }) => {
  // TODO
});

When("l'utilisateur propose une œuvre {string} dans cette catégorie {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

When("l'utilisateur tente de proposer une œuvre", async ({ page }) => {
  // TODO
});

Then("la proposition de l'œuvre {string} est enregistrée", async ({ page }, arg1: string) => {
  // TODO
});

Then("l'œuvre {string} est associée à la catégorie {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

Then("la proposition de l'œuvre est refusée", async ({ page }) => {
  // TODO
});
