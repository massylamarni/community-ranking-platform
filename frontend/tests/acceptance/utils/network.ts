import type { Page, Response } from "@playwright/test";

export async function clickAndWaitForApi(
  page: Page,
  click: () => Promise<void>,
  path: string,
  method = "POST",
): Promise<Response> {
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith(`/backend-api${path}`) &&
      r.request().method() === method,
  );
  await click();
  return response;
}
