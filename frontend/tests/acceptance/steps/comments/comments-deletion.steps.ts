// Feature: Suppression des commentaires
import { Given, When, Then } from '../fixtures';
import { expect } from '@playwright/test';

const deletedOnWork = new WeakMap<import('@playwright/test').Page, { author: string; text: string; work: string }>();

async function visitWorkComments(page: import('@playwright/test').Page, title: string) {
  await page.goto('/rankings');
  await page.getByRole('link', { name: title, exact: true }).first().click();
  const toggle = page.getByRole('button', { name: /Comments/ });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

Given("l'utilisateur {string} a publié le commentaire {string} sur l’œuvre {string}", async ({ page }, arg1: string, arg2: string, arg3: string) => {
  await visitWorkComments(page, arg3);
  await expect(page.getByText(arg2, { exact: true })).toBeVisible();
  deletedOnWork.set(page, { author: arg1, text: arg2, work: arg3 });
});

When("je supprime le commentaire", async ({ page }) => {
  const comment = deletedOnWork.get(page);
  expect(comment).toBeDefined();
  const item = page.getByText(comment!.text, { exact: true }).locator('xpath=../../..');
  await item.getByRole('button', { name: 'delete-comment' }).click();
  await page.getByRole('button', { name: 'Confirmer' }).click();
});

Then("le commentaire {string} n'est plus visible sur l’œuvre {string}", async ({ page }, arg1: string, arg2: string) => {
  await visitWorkComments(page, arg2);
  await expect(page.getByText(arg1, { exact: true })).toHaveCount(0);
});

Then("le commentaire {string} n'est plus visible sur le profil de l'utilisateur {string}", async ({ page }, arg1: string, arg2: string) => {
  await page.goto('/rankings');
  const author = page.getByRole('link', { name: arg2, exact: true }).first();
  await expect(author).toBeVisible();
  await author.click();
  await page.getByRole('tab', { name: /Commentaires/ }).click();
  await expect(page.getByText(arg1, { exact: true })).toHaveCount(0);
});
