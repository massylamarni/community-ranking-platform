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
  numericUserId,
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
    const username = body.username?.trim() ?? "";
    if (
      username.length < 3 ||
      username.length > 50 ||
      !/^[a-zA-Z0-9_]+$/.test(username)
    ) {
      fields.username = "Utilisez 3 à 50 lettres, chiffres ou tirets bas.";
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
    if (usernameOrEmailTaken(username, body.email)) {
      return errorResponse(
        409,
        "Nom d'utilisateur ou adresse e-mail déjà utilisé",
      );
    }
    const user = registerUser({ ...body, username });
    const token = createSession(user.id);
    const response = HttpResponse.json(
      {
        userId: numericUserId(user),
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
      userId: numericUserId(user),
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
    if (body.confirmPassword !== body.newPassword) {
      return errorResponse(400, "Échec de la validation", {
        confirmPassword: "Les mots de passe ne correspondent pas.",
      });
    }
    user.password = body.newPassword;
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /auth/password/forgot (AUTH-005)
  http.post("*/auth/password/forgot", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as ForgotPasswordPayload;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email ?? "")) {
      return errorResponse(422, "Échec de la validation", {
        email: "L'adresse e-mail est invalide.",
      });
    }
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
    if (body.confirmPassword !== body.newPassword) {
      return errorResponse(422, "Échec de la validation", {
        confirmPassword: "Les mots de passe ne correspondent pas.",
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
      id: numericUserId(user),
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
    const fields: Record<string, string> = {};
    if (body.username != null) {
      const username = body.username.trim();
      if (username.length < 2 || username.length > 30) {
        fields.username =
          "Le nom d'utilisateur doit contenir de 2 à 30 caractères.";
      } else if (
        usernameOrEmailTaken(username, "", user.id) &&
        username.toLowerCase() !== user.username.toLowerCase()
      ) {
        return errorResponse(409, "Nom d'utilisateur déjà utilisé");
      } else {
        user.username = username;
      }
    }
    if (body.email != null) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        fields.email = "L'adresse e-mail est invalide.";
      } else if (
        usernameOrEmailTaken("", body.email, user.id) &&
        body.email.toLowerCase() !== user.email.toLowerCase()
      ) {
        return errorResponse(409, "Adresse e-mail déjà utilisée");
      } else {
        user.email = body.email;
      }
    }
    if (Object.keys(fields).length > 0) {
      return errorResponse(422, "Échec de la validation", fields);
    }
    return HttpResponse.json({
      id: numericUserId(user),
      username: user.username,
      role: user.role,
      email: user.email,
    });
  }),
];
