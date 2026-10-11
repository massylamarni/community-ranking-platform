import { APIRequestContext, expect, Page } from "@playwright/test";
import { clickAndWaitForApi } from "./network";
import { apiURL } from "./env";
import { getSuffix } from ".";
import {
  CreateWorkPayload,
  SubmitWorkPayload,
  WorkResponse,
} from "@/types/api";

export function newWork() {
  const suffix = getSuffix();
  return {
    title: `title_${suffix}`,
    description: `description_${suffix}`,
  };
}

export function workCard(page: import("@playwright/test").Page, title: string) {
  return page.locator('[data-slot="card"]').filter({ hasText: title });
}

/* Normal flow */

export async function createDraft(page: Page, work: CreateWorkPayload) {
  await page.goto("/works/new");
  await page.locator("#work_title").fill(work.title);
  await page.locator("#work_description").fill(work.description);
  const res = await clickAndWaitForApi(
    page,
    () => page.getByRole("button", { name: "Créer le brouillon" }).click(),
    "/works",
  );
  expect(res.status()).toBe(201);
  await expect(page).toHaveURL(/\/works\/\d+\/edit$/);
}

/* Direct inserts */

export async function directCreateWork(
  request: APIRequestContext,
  work: CreateWorkPayload,
): Promise<WorkResponse> {
  const response = await request.post(`${apiURL}/works`, {
    data: work,
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as WorkResponse;
}

export async function directSubmitWork(
  request: APIRequestContext,
  workId: number,
  finalWork: SubmitWorkPayload,
): Promise<WorkResponse> {
  const response = await request.post(`${apiURL}/works/${workId}/submit`, {
    data: { finalWork },
  });
  expect(response.status()).toBe(200);
  const submittedWork = (await response.json()) as WorkResponse;
  expect(submittedWork.status).toBe("pending");
  return submittedWork;
}
