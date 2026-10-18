// Feature: Modération des commentaires
import { Given, When, Then } from '../fixtures';

Given("un commentaire publié ne respecte pas les règles définies par le site", async ({ page }) => {
  // TODO
});

When("je consulte ce commentaire", async ({ page }) => {
  // TODO
});

When("je le supprime dans le cadre de la modération", async ({ page }) => {
  // TODO
});

When("l'utilisateur tente de le supprimer au titre de la modération", async ({ page }) => {
  // TODO
});

Then("le commentaire n'est plus affiché sous l'œuvre concernée", async ({ page }) => {
  // TODO
});
