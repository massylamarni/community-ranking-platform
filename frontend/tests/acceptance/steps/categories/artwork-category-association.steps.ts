// Feature: Association d'une œuvre à une catégorie
import { Given, When, Then } from '../fixtures';

When("il crée l'œuvre {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il renseigne {string} comme catégorie", async ({ page }, arg1: string) => {
  // TODO
});

When("il publie l'œuvre", async ({ page }) => {
  // TODO
});

When("il ne sélectionne aucune catégorie", async ({ page }) => {
  // TODO
});

When("il tente de publier l'œuvre", async ({ page }) => {
  // TODO
});

Then("l'œuvre {string} a le statut {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

Then("l'œuvre {string} appartient à la catégorie {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

Then("l'œuvre n'est pas publiée", async ({ page }) => {
  // TODO
});

Then("un message indique qu'une catégorie est obligatoire", async ({ page }) => {
  // TODO
});
