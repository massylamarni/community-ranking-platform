// Feature: Affichage des œuvres par catégorie
import { Given, When, Then } from '../fixtures';

Given("les œuvres {string} et {string} appartiennent à la catégorie {string}", async ({ page }, arg1: string, arg2: string, arg3: string) => {
  // TODO
});

Given("l'œuvre {string} appartient à la catégorie {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

Given("aucune œuvre n'est associée à la catégorie {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("un utilisateur consulte la catégorie {string}", async ({ page }, arg1: string) => {
  // TODO
});

Then("{string} est affichée", async ({ page }, arg1: string) => {
  // TODO
});

Then("{string} n'est pas affichée", async ({ page }, arg1: string) => {
  // TODO
});

Then("aucune œuvre n'est affichée", async ({ page }) => {
  // TODO
});

Then("un message indique qu'aucune œuvre n'est disponible", async ({ page }) => {
  // TODO
});
