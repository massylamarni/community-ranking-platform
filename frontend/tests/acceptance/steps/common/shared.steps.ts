// Steps shared by several features
import { Given, When, Then } from '../fixtures';

Given("l'utilisateur {string} est authentifié", async ({ page }, arg1: string) => {
  // TODO
});

Given("je suis connecté en tant que {string}", async ({ page }, arg1: string) => {
  // TODO
});

Given("un utilisateur non administrateur est authentifié", async ({ page }) => {
  // TODO
});

Given("la catégorie {string} existe", async ({ page }, arg1: string) => {
  // TODO
});

Given("il a publié un commentaire {string}", async ({ page }, arg1: string) => {
  // TODO
});

Given("l'utilisateur {string} possède un profil public", async ({ page }, arg1: string) => {
  // TODO
});

Given("l'œuvre {string} est en attente de modération", async ({ page }, arg1: string) => {
  // TODO
});

Given("un utilisateur a soumis une œuvre", async ({ page }) => {
  // TODO
});

Given("l'œuvre est en attente de modération", async ({ page }) => {
  // TODO
});

Given("une œuvre créée par cet utilisateur", async ({ page }) => {
  // TODO
});

Given("une œuvre {string} créée par un autre utilisateur {string}", async ({ page }, arg1: string, arg2: string) => {
  // TODO
});

Given("une œuvre publiée", async ({ page }) => {
  // TODO
});

Given("l'utilisateur a attribué un vote positif à une œuvre", async ({ page }) => {
  // TODO
});

Given("l'utilisateur a attribué un vote négatif à une œuvre", async ({ page }) => {
  // TODO
});

When("il saisit le titre {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il renseigne les autres informations obligatoires", async ({ page }) => {
  // TODO
});

When("il valide la création", async ({ page }) => {
  // TODO
});

When("il valide le formulaire", async ({ page }) => {
  // TODO
});

When("l'utilisateur consulte le classement {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("il valide la publication", async ({ page }) => {
  // TODO
});

When("l'utilisateur {string} consulte ce profil", async ({ page }, arg1: string) => {
  // TODO
});

When("j'accepte l'œuvre {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("je refuse l'œuvre {string}", async ({ page }, arg1: string) => {
  // TODO
});

When("un utilisateur consulte l'œuvre", async ({ page }) => {
  // TODO
});

Then("il est invité à se connecter", async ({ page }) => {
  // TODO
});

Then("la catégorie {string} est créée", async ({ page }, arg1: string) => {
  // TODO
});

Then("un message indique qu'il n'a pas les droits nécessaires", async ({ page }) => {
  // TODO
});

Then("la catégorie {string} n'existe plus", async ({ page }, arg1: string) => {
  // TODO
});

Then("l'œuvre n'est pas créée", async ({ page }) => {
  // TODO
});

Then("l'œuvre est créée", async ({ page }) => {
  // TODO
});

Then("l'œuvre {string} apparaît en position 1 avec un score de 15", async ({ page }, arg1: string) => {
  // TODO
});

Then("l'œuvre {string} apparaît en position 2 avec un score de 9", async ({ page }, arg1: string) => {
  // TODO
});

Then("le vote de {string} est comptabilisé dans ce classement", async ({ page }, arg1: string) => {
  // TODO
});

Then("la modification est refusée", async ({ page }) => {
  // TODO
});

Then("la suppression est refusée", async ({ page }) => {
  // TODO
});

Then("le profil de {string} s'affiche avec succès", async ({ page }, arg1: string) => {
  // TODO
});

Then("son statut est {string}", async ({ page }, arg1: string) => {
  // TODO
});
