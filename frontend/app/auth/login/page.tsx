"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ButtonGroup } from "@/components/ui/button-group";
import { Eye, EyeClosed } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { usePathname } from "next/navigation";
import { safeRedirectPath, successUrl } from "@/lib/routes";
import { useApi } from "@/hooks";

export default function Login() {
  const pathname = usePathname();
  const { login } = useAuth();
  const { run, loading, error } = useApi();

  const [loginForm, setLoginForm] = useState({
    username: "alice",
    password: "Password123!",
  });
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await run(login(loginForm), {
      loading: "Connexion à votre compte...",
      success: "Connexion réussie",
      error: "Échec de la connexion",
    });
    if (res.ok) {
      const user = res.data;
      const from = safeRedirectPath(
        new URLSearchParams(window.location.search).get("from"),
      );
      const target = from ?? successUrl(pathname, user?.role ?? "visitor");
      window.location.replace(target);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connectez-vous à votre compte</CardTitle>
        <CardAction>
          <Button
            variant="link"
            nativeButton={false}
            render={<Link href="/auth/register" />}
          >
            Créer un compte
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={handleLogin}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Nom d&apos;utilisateur</FieldLabel>
              <Input
                id="username"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Link
                  href="/auth/forgotpassword"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <ButtonGroup className="w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </Button>
              </ButtonGroup>
            </Field>
            <FieldError>{error?.message}</FieldError>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="login-form"
          aria-label="auth-login"
          disabled={loading}
        >
          Se connecter
        </Button>
      </CardFooter>
    </Card>
  );
}
