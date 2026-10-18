import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "tests/acceptance/features/**/*.feature",
  steps: "tests/acceptance/steps/**/*.ts",
});

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
