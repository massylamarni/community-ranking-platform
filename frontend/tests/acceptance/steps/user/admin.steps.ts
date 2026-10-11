import { createBdd } from "playwright-bdd";
import { ADMIN_ACCOUNT, login } from "../../utils/auth";

const { Given, When, Then } = createBdd();

/* Auth */

Given("l'administrateur est connecté", async ({ page }) => {
  await login(page, ADMIN_ACCOUNT);
});
