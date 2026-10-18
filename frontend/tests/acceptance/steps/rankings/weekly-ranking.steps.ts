// Feature: Classement hebdomadaire
import { Given, When, Then } from '../fixtures';

Given("l'œuvre {string} a reçu un vote positif au cours de la semaine en cours", async ({ page }, arg1: string) => {
  // TODO
});

Given("l'œuvre {string} a reçu un vote positif la semaine précédente", async ({ page }, arg1: string) => {
  // TODO
});

Then("le vote de {string} datant de la semaine précédente n'est pas comptabilisé dans ce classement", async ({ page }, arg1: string) => {
  // TODO
});
