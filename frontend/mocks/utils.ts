import { HttpResponse } from "msw";
import { MOCK_SESSION_HEADER } from "@/lib/config";
import { userFromSessionToken, type DbUser } from "./db";
import type { ApiErrorBody, RankingPeriod } from "@/types/api";

export function currentUserFrom(request: Request): DbUser | undefined {
  const token = request.headers.get(MOCK_SESSION_HEADER);
  return userFromSessionToken(token);
}

export function errorResponse(
  status: number,
  error: string,
  fields?: Record<string, string>,
) {
  const body: ApiErrorBody = { status, error, fields };
  return HttpResponse.json(body, { status });
}

export const unauthorized = () =>
  errorResponse(401, "Vous devez être connecté.");
export const forbidden = (message = "Droits insuffisants.") =>
  errorResponse(403, message);
export const notFound = (message = "Ressource introuvable.") =>
  errorResponse(404, message);

export function withSessionHeader(
  response: Response,
  token: string | null,
): Response {
  response.headers.set(MOCK_SESSION_HEADER, token ?? "");
  return response;
}

export function imageUrlFromForm(form: FormData): string | null {
  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    return URL.createObjectURL(image);
  }
  return null;
}

export function requireAdmin(request: Request) {
  const user = currentUserFrom(request);
  if (!user || user.role !== "admin") return null;
  return user;
}

export function isValidPeriod(value: string | null): value is RankingPeriod {
  return (
    value === "day" || value === "week" || value === "month" || value === "all"
  );
}
