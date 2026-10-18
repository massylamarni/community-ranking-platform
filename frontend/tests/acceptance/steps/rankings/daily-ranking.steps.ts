// Feature: Classement quotidien
import { Given, When, Then } from '../fixtures';

Given("l'œuvre {string} a reçu un vote positif aujourd'hui", async ({ page }, arg1: string) => {
  // TODO
});

Given("l'œuvre {string} a reçu un vote positif hier, hors de la période du jour en cours", async ({ page }, arg1: string) => {
  // TODO
});

Then("le vote d'aujourd'hui sur {string} est comptabilisé dans ce classement", async ({ page }, arg1: string) => {
  // TODO
});

Then("le vote d'hier sur {string} n'est pas comptabilisé dans ce classement", async ({ page }, arg1: string) => {
  // TODO
});
