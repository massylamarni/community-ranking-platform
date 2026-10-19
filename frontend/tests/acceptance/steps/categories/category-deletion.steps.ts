// Feature: Suppression d'une catégorie
import { Given, When, Then } from '../fixtures';

Given("aucune œuvre n'est associée à cette catégorie", async ({ page }) => {
  // TODO
});

When("l'administrateur supprime la catégorie {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il confirme la suppression", async ({ page }) => {
  // TODO
});

When("il tente de supprimer la catégorie", async ({ page }) => {
  // TODO
});

Then("elle n'apparaît plus dans la liste des catégories", async ({ page }) => {
  // TODO
});

Then("la catégorie n'est pas supprimée", async ({ page }) => {
  // TODO
});
