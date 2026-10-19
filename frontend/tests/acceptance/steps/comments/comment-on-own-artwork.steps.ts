// Feature: Commentaire sur une œuvre personnelle
import { Given, When, Then } from '../fixtures';

Given("il consulte une œuvre qu'il a lui-même déposée", async ({ page }) => {
  // TODO
});

Given("un autre utilisateur a publié un commentaire sur une œuvre appartenant à l'utilisateur authentifié", async ({ page }) => {
  // TODO
});

When("il tente de publier un commentaire principal sur cette œuvre", async ({ page }) => {
  // TODO
});

When("l'auteur de l'œuvre répond à ce commentaire", async ({ page }) => {
  // TODO
});

Then("l'action est refusée par le système", async ({ page }) => {
  // TODO
});

Then("un message indique qu'il ne peut pas commenter sa propre œuvre", async ({ page }) => {
  // TODO
});

Then("la réponse est enregistrée", async ({ page }) => {
  // TODO
});

Then("elle est affichée sous l'œuvre concernée", async ({ page }) => {
  // TODO
});
