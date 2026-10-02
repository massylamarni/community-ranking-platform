import { OwnProfile } from "@/types/api";
import { expect, Page } from "@playwright/test";

/* Direct insertions */

export async function waitForProfileUpdate(page: Page): Promise<OwnProfile> {
  const response = await page.waitForResponse(
    (r) =>
      r.request().method() === "PATCH" &&
      r.url().endsWith("/backend-api/profile"),
  );
  expect(response.status()).toBe(200);
  return (await response.json()) as OwnProfile;
}

export async function getProfile(page: Page): Promise<OwnProfile> {
  const response = await page.request.get("/backend-api/profile");
  expect(response.status()).toBe(200);
  return (await response.json()) as OwnProfile;
}
