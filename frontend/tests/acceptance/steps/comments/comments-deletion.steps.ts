// Feature: Suppression des commentaires
import { Given, When, Then } from '../fixtures';

Given("l'utilisateur {string} a publié le commentaire {string} sur l’œuvre {string}", async ({ page }, arg1: string, arg2: string, arg3: string) => {
  // TODO
});

When("je supprime le commentaire", async ({ page }) => {
  // TODO
});

Then("le commentaire {string} n'est plus visible sur l’œuvre {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

Then("le commentaire {string} n'est plus visible sur le profil de l'utilisateur {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});
