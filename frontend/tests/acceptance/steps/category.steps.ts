import { expect } from "@playwright/test";

import { createCategoryButton, deleteCategoryButton } from "../utils/category";

import { Given, Then, When } from "./fixtures";
import { CategoryEntityResponse } from "@/types/api";
import { apiURL } from "../utils/env";

Given("la catégorie {string} n'existe pas", async ({}, str: string) => {
  // TODO: implement
});

When("l'administrateur crée la catégorie {string}", async ({}, str: string) => {
  // TODO: implement
});

Then(
  "la catégorie {string} est créée",
  async ({ request, ctx }, value: string) => {
    // TODO: implement
  },
);

Then("elle peut être utilisée pour déposer une œuvre", async ({}) => {
  // TODO: implement
});

Given("la catégorie {string} existe", async ({}, str: string) => {
  // TODO: implement
});

Then(
  "elle ne peut plus être sélectionnée pour une nouvelle œuvre",
  async ({}) => {
    // TODO: implement
  },
);

When(
  "il tente de créer la catégorie {string}",
  async ({ ctx, page }, value: string) => {
    // TODO: implement
  },
);

Then("la catégorie n'est pas créée", async ({ request, ctx }) => {
  // TODO: implement
});

Then("un message indique qu'il n'a pas les droits nécessaires", async ({}) => {
  // TODO: implement
});

When(
  "il saisit le nom de catégorie {string}",
  async ({ page, ctx }, value: string) => {
    // TODO: implement
  },
);

When("il valide la création", async ({ page, ctx }) => {
  // TODO: implement
});

Then("elle apparaît dans la liste des catégories", async ({ page, ctx }) => {
  // TODO: implement
});

Given(
  "aucune œuvre n'est associée à cette catégorie",
  async ({ request, ctx }) => {
    // TODO: implement
  },
);

When(
  "l'administrateur supprime la catégorie {string}",
  async ({ page, ctx }, value: string) => {
    // TODO: implement
  },
);

When("il confirme la suppression", async ({ page, ctx }) => {
  // TODO: implement
});

Then(
  "la catégorie {string} n'existe plus",
  async ({ request, ctx }, value: string) => {
    // TODO: implement
  },
);

Then(
  "elle n'apparaît plus dans la liste des catégories",
  async ({ page, ctx }) => {
    // TODO: implement
  },
);

When("il tente de supprimer la catégorie", async ({ page, ctx }) => {
  // TODO: implement
});

Then("la catégorie n'est pas supprimée", async ({ request, ctx }) => {
  // TODO: implement
});
