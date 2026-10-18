// Feature: Filtrage du classement par catégorie
import { Given, When, Then } from '../fixtures';

Given("l'utilisateur consulte le classement global comportant des œuvres de plusieurs catégories", async ({ page }) => {
  // TODO
});

When("il sélectionne le filtre {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il valide le filtre", async ({ page }) => {
  // TODO
});

Then("seules les œuvres de la catégorie {string} restent affichées", async ({ page }, arg1: string) => {
  // TODO
});

Then("elles restent triées par score", async ({ page }) => {
  // TODO
});
