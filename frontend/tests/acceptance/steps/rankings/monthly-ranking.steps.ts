// Feature: Classement mensuel
import { Given, When, Then } from '../fixtures';

Given("l'œuvre {string} a reçu un vote positif au cours du mois en cours", async ({ page }, arg1: string) => {
  // TODO
});

Given("l'œuvre {string} a reçu un vote positif le mois précédent", async ({ page }, arg1: string) => {
  // TODO
});

Then("le vote de {string} datant du mois précédent n'est pas comptabilisé dans ce classement", async ({ page }, arg1: string) => {
  // TODO
});
