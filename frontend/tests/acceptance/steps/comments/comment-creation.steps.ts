// Feature: Création d'un commentaire
import { Given, When, Then } from '../fixtures';

Given("un utilisateur authentifié consulte une œuvre qu'il n'a pas déposée", async ({ page }) => {
  // TODO
});

Given("un visiteur non authentifié consulte une œuvre", async ({ page }) => {
  // TODO
});

When("il rédige le commentaire {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il tente de publier le commentaire {string}", async ({ page }, arg1: string) => {
  // TODO
});

Then("le commentaire {string} est enregistré", async ({ page }, arg1: string) => {
  // TODO
});

Then("il est affiché sous l'œuvre concernée avec son auteur", async ({ page }) => {
  // TODO
});

Then("le système l'empêche de publier le commentaire", async ({ page }) => {
  // TODO
});

Then("le commentaire n'est pas enregistré", async ({ page }) => {
  // TODO
});

Then("un message indique qu'il doit être connecté pour commenter", async ({ page }) => {
  // TODO
});
