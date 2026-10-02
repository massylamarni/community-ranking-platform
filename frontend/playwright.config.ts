import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "tests/acceptance/features/**/*.feature",
  steps: "tests/acceptance/steps/**/*.ts",
});

/*
const testDir = defineBddConfig({
  features: [
    "tests/acceptance/features/Authentification/1000_Deconnexion.feature",
    "tests/acceptance/features/Authentification/1018_Creation_d_un_compte.feature",
    "tests/acceptance/features/Authentification/1019_Connexion.feature",
    "tests/acceptance/features/Oeuvre/1014_Creation_d_une__uvre.feature",
    "tests/acceptance/features/Administration/1153_Moderation_des__uvres.feature",
    "tests/acceptance/features/Categorie/1005_Creation_d_une_categorie.feature",
    "tests/acceptance/features/Categorie/1006_Suppression_d_une_categorie.feature",
    "tests/acceptance/features/Authentification/1004_Gestion_du_profil_utilisateur.feature",
    "tests/acceptance/features/Authentification/1290_Gestion_du_mot_de_passe.feature",
    "tests/acceptance/features/Categorie/1007_Consultation_des_categories.feature",
    "tests/acceptance/features/Oeuvre/1205_Suppression_d_une__uvre.feature",
    "tests/acceptance/features/Oeuvre/1203_Modification_d_une__uvre.feature",
  ],
  steps: [
    "tests/acceptance/steps/fixtures.ts",
    "tests/acceptance/steps/Authentification/1000_Deconnexion.steps.ts",
    "tests/acceptance/steps/Authentification/1018_Creation_d_un_compte.steps.ts",
    "tests/acceptance/steps/Authentification/1019_Connexion.steps.ts",
    "tests/acceptance/steps/Oeuvre/1014_Creation_d_une__uvre.steps.ts",
    "tests/acceptance/steps/Administration/1153_Moderation_des__uvres.steps.ts",
    "tests/acceptance/steps/Categorie/1005_Creation_d_une_categorie.steps.ts",
    "tests/acceptance/steps/Categorie/1006_Suppression_d_une_categorie.steps.ts",
    "tests/acceptance/steps/Authentification/1004_Gestion_du_profil_utilisateur.steps.ts",
    "tests/acceptance/steps/Authentification/1290_Gestion_du_mot_de_passe.steps.ts",
    "tests/acceptance/steps/Categorie/1007_Consultation_des_categories.steps.ts",
    "tests/acceptance/steps/Oeuvre/1205_Suppression_d_une__uvre.steps.ts",
    "tests/acceptance/steps/Oeuvre/1203_Modification_d_une__uvre.steps.ts",
  ],
});
*/

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:8181";

export default defineConfig({
  testDir,
  outputDir: "./playwright-artifacts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["junit", { outputFile: "results/junit.xml" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: `${baseURL}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BACKEND_URL: apiURL,
      INTERNAL_API_URL: apiURL,
      NEXT_PUBLIC_API_BASE_URL: "/backend-api",
      NEXT_PUBLIC_API_MOCKING: "disabled",
    },
  },
});
