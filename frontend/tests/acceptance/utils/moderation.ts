import { APIRequestContext, Page, expect } from "@playwright/test";
import { workCard } from "./works";
import { apiURL } from "./env";
import { ModerationAction, WorkResponse, WorkStatus } from "@/types/api";

export async function acceptWork(
  page: Page,
  workId: number,
  title: string,
): Promise<WorkStatus> {
  await workCard(page, title).getByRole("button", { name: "Accepter" }).click();
  const response = await waitForModerationResponse(page, workId, "accept");
  expect(response.status()).toBe(200);
  return ((await response.json()) as WorkResponse).status;
}

export async function refuseWork(
  page: Page,
  workId: number,
  title: string,
  reason = "Acceptance test refusal",
): Promise<WorkStatus> {
  await workCard(page, title).getByRole("button", { name: "Refuser" }).click();
  await page.getByLabel("Motif (optionnel)").fill(reason);
  await page.getByRole("button", { name: "Confirmer le refus" }).click();
  const response = await waitForModerationResponse(page, workId, "refuse");
  expect(response.status()).toBe(200);
  return ((await response.json()) as WorkResponse).status;
}

/* Direct inserts */

export function waitForModerationResponse(
  page: Page,
  workId: number,
  action: ModerationAction,
) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes(`/moderation/works/${workId}/${action}`),
  );
}

export async function getApprovedWorksByTitle(
  request: APIRequestContext,
  title: string,
): Promise<WorkResponse[]> {
  const response = await request.get(
    `${apiURL}/works?status=approved&title=${encodeURIComponent(title)}`,
  );
  expect(response.status()).toBe(200);
  return (await response.json()) as WorkResponse[];
}
