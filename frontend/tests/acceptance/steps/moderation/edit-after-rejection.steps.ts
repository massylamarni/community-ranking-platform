// Feature: Modification après refus
import { Given, When, Then } from '../fixtures';

Given("l'utilisateur a proposé l'œuvre {string}", async ({ page }, arg1: string) => {
  // TODO
});

Given("la proposition a été refusée", async ({ page }) => {
  // TODO
});

When("l'utilisateur modifie la description de l'œuvre", async ({ page }) => {
  // TODO
});

When("il remplace la description en {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il soumet à nouveau l'œuvre", async ({ page }) => {
  // TODO
});

Then("la nouvelle proposition est enregistrée", async ({ page }) => {
  // TODO
});

Then("la proposition est envoyée au filtrage automatique", async ({ page }) => {
  // TODO
});
