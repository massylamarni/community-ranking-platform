// Feature: Modification d'un commentaire
import { Given, When, Then } from '../fixtures';

Given("il a publié le commentaire {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il modifie ce commentaire en {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il valide la modification", async ({ page }) => {
  // TODO
});

When("un autre utilisateur authentifié tente de modifier ce commentaire", async ({ page }) => {
  // TODO
});

Then("le commentaire affiché sous l'œuvre est {string}", async ({ page }, arg1: string) => {
  // TODO
});
