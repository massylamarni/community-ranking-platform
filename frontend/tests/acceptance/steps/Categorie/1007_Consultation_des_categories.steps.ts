import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("la catégorie {string} existe", async ({}, str: string) => {
  // TODO: implement
});

Given(
  "les œuvres {string} et {string} appartiennent à cette catégorie",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

Given(
  "l'œuvre {string} appartient à la catégorie {string}",
  async ({}, str1: string, str2: string) => {
    // TODO: implement
  },
);

When(
  "un utilisateur consulte la catégorie {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("{string} est affichée", async ({}, str: string) => {
  // TODO: implement
});

Then("{string} n'est pas affichée", async ({}, str: string) => {
  // TODO: implement
});

Given(
  "aucune œuvre n'est associée à la catégorie {string}",
  async ({}, str: string) => {
    // TODO: implement
  },
);

Then("aucune œuvre n'est affichée", async ({}) => {
  // TODO: implement
});

Then("un message indique qu{string}est disponible", async ({}, str: string) => {
  // TODO: implement
});
