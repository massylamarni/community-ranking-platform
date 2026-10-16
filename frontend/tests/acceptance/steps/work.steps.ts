import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures";
import { directLogin, directRegister, newAccount } from "./../utils/auth";
import { directCreateCategory, newCategory } from "./../utils/category";
import {
  directCreateWork,
  newWork,
  directSubmitWork,
  workCard,
} from "./../utils/works";
import {
  acceptWork,
  getApprovedWorksByTitle,
  refuseWork,
} from "./../utils/moderation";
import { WorkResponse } from "@/types/api";

When("l'administrateur crée une nouvelle œuvre", async ({}) => {
  // TODO: implement
});

When("l'administrateur supprime l'œuvre", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est créée", async ({}) => {
  // TODO: implement
});

Given("une œuvre existe", async ({}) => {
  // TODO: implement
});

Then("l'œuvre est supprimée", async ({}) => {
  // TODO: implement
});

Given(
  "l'œuvre {string} est en attente de modération",
  async ({ page, request, ctx }, title: string) => {
    const category = await directCreateCategory(request, newCategory());
    const author = newAccount();
    await directRegister(request, author);
    await directLogin(request, author);

    const work = await directCreateWork(request, {
      title,
      description: newWork().description,
    });
    const submittedWork = await directSubmitWork(request, work.id, {
      categoryIds: [Number(category.id)],
    });

    ctx.work = submittedWork;
    await expect(page).toHaveURL(/\/moderation$/);
    await page.reload();
    await expect(workCard(page, title)).toBeVisible();
  },
);

When("l'administrateur accepte l'œuvre", async ({ page, ctx }) => {
  const work = ctx.work as WorkResponse;
  ctx.workStatus = await acceptWork(page, work.id, work.title);
});

When("l'administrateur refuse l'œuvre", async ({ page, ctx }) => {
  const work = ctx.work as WorkResponse;

  ctx.workStatus = await refuseWork(page, work.id, work.title);
});

Then("l'œuvre est publiée", async ({ request, ctx }) => {
  const work = ctx.work as WorkResponse;
  expect(ctx.workStatus).toBe("approved");
  const works = await getApprovedWorksByTitle(request, work.title as string);
  expect(works.some((w) => w.title === work.title)).toBeTruthy();
});

Then("l'œuvre n'est pas publiée", async ({ request, ctx }) => {
  const work = ctx.work as WorkResponse;
  expect(ctx.workStatus).toBe("rejected");
  const works = await getApprovedWorksByTitle(request, work.title as string);
  expect(works.some((w) => w.title === work.title)).toBeFalsy();
});

Then("son statut est {string}", async ({ ctx }, expectedStatus: string) => {
  const statusByLabel: Record<string, string> = {
    Acceptée: "approved",
    Refusée: "rejected",
  };
  expect(ctx.workStatus).toBe(statusByLabel[expectedStatus]);
});
