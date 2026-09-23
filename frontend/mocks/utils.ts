import { HttpResponse } from "msw";
import { MOCK_SESSION_HEADER } from "@/lib/config";
import { userFromSessionToken, type DbUser } from "./db";
import type { ApiErrorBody } from "@/types/api";

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
