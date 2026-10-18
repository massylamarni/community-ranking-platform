// Feature: Gestion du profil utilisateur
import { Given, When, Then } from '../fixtures';

Given("son profil contient le pseudo {string}", async ({ page }, arg1: string) => {
  // TODO
});

Given("son profil contient l'adresse e-mail {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il consulte son profil", async ({ page }) => {
  // TODO
});

When("il modifie son pseudo en {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il valide les modifications", async ({ page }) => {
  // TODO
});

Then("son pseudo {string} est affiché", async ({ page }, arg1: string) => {
  // TODO
});

Then("son adresse e-mail {string} est affichée", async ({ page }, arg1: string) => {
  // TODO
});

Then("son nouveau pseudo est {string}", async ({ page }, arg1: string) => {
  // TODO
});

Then("son nouveau pseudo {string} est affiché dans son profil", async ({ page }, arg1: string) => {
  // TODO
});
