import {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginUserPayload,
  RegisterUserPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from "@/types/api";
import { delay, http, HttpResponse } from "msw";
import {
  currentUserFrom,
  errorResponse,
  unauthorized,
  withSessionHeader,
} from "../utils";
import {
  createSession,
  destroySession,
  findUserByUsername,
  registerUser,
  toCurrentUser,
  usernameOrEmailTaken,
} from "../db";
import { MOCK_SESSION_HEADER } from "@/lib/config";

export const authHandlers = [
  // POST /auth/register (AUTH-001)
  http.post("*/auth/register", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as RegisterUserPayload;
    const fields: Record<string, string> = {};
    if (!body.username || body.username.trim().length < 2) {
      fields.username = "Le nom d'utilisateur est requis.";
    }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      fields.email = "L'adresse e-mail est invalide.";
    }
    if (!body.password || body.password.length < 8) {
      fields.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (Object.keys(fields).length > 0) {
      return errorResponse(400, "Échec de la validation", fields);
    }
    if (usernameOrEmailTaken(body.username, body.email)) {
      return errorResponse(
        409,
        "Nom d'utilisateur ou adresse e-mail déjà utilisé",
      );
    }
    const user = registerUser(body);
    const token = createSession(user.id);
    const response = HttpResponse.json(
      {
        userId: Number(user.id.replace(/\D/g, "")) || 1,
        username: user.username,
      },
      { status: 201 },
    );
    return withSessionHeader(response, token);
  }),

  // POST /auth/login (AUTH-002)
  http.post("*/auth/login", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as LoginUserPayload;
    const user = findUserByUsername(body.username);
    if (!user || user.password !== body.password) {
      return errorResponse(401, "Nom d'utilisateur ou mot de passe incorrect.");
    }
    const token = createSession(user.id);
    const response = HttpResponse.json({
      userId: Number(user.id.replace(/\D/g, "")) || 1,
      username: user.username,
    });
    return withSessionHeader(response, token);
  }),

  // POST /auth/logout (AUTH-004)
  http.post("*/auth/logout", async ({ request }) => {
    await delay(80);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    destroySession(request.headers.get(MOCK_SESSION_HEADER));
    const response = HttpResponse.json({}, { status: 200 });
    return withSessionHeader(response, null);
  }),

  // GET /auth/me
  http.get("*/auth/me", async ({ request }) => {
    await delay(50);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    return HttpResponse.json(toCurrentUser(user));
  }),

  // POST /auth/password/change (AUTH-005)
  http.post("*/auth/password/change", async ({ request }) => {
    await delay(150);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as ChangePasswordPayload;
    if (body.oldPassword !== user.password) {
      return errorResponse(400, "Échec de la validation", {
        oldPassword: "Mot de passe actuel incorrect.",
      });
    }
    if (!body.newPassword || body.newPassword.length < 8) {
      return errorResponse(400, "Échec de la validation", {
        newPassword: "8 caractères minimum.",
      });
    }
    user.password = body.newPassword;
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /auth/password/forgot (AUTH-005)
  http.post("*/auth/password/forgot", async ({ request }) => {
    await delay(150);
    void ((await request.json()) as ForgotPasswordPayload);
    // Always 202, whether or not the address exists (no account enumeration).
    return new HttpResponse(null, { status: 202 });
  }),

  // POST /auth/password/reset (AUTH-005)
  http.post("*/auth/password/reset", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as ResetPasswordPayload;
    if (!body.token) {
      return errorResponse(422, "Échec de la validation", {
        token: "Jeton manquant ou expiré.",
      });
    }
    if (!body.newPassword || body.newPassword.length < 8) {
      return errorResponse(422, "Échec de la validation", {
        newPassword: "8 caractères minimum.",
      });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /profile (AUTH-007)
  http.get("*/profile", async ({ request }) => {
    await delay(80);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    return HttpResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    });
  }),

  // PATCH /profile (AUTH-007)
  http.patch("*/profile", async ({ request }) => {
    await delay(150);
    const user = currentUserFrom(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as UpdateProfilePayload;
    if (body.username !== undefined) {
      if (body.username.trim().length < 2) {
        return errorResponse(422, "Échec de la validation", {
          username: "2 caractères minimum.",
        });
      }
      user.username = body.username;
    }
    return HttpResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    });
  }),
];
