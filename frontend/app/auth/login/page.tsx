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
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ApiErrorBody } from "@/types/api";
import { usePathname, useSearchParams } from "next/navigation";
import { safeRedirectPath, successUrl } from "@/lib/routes";

export default function Login() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "alice",
    password: "Password123!",
  });
  const [authError, setAuthError] = useState<ApiErrorBody | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);

    const promise = login(loginForm);

    toast.promise(promise, {
      loading: "Connexion à votre compte...",
      success: () => "Connexion réussie",
      error: (err) => err?.message ?? "Échec de la connexion",
    });

    try {
      const user = await promise;
      const from = safeRedirectPath(searchParams.get("from"));
      const target = from ?? successUrl(pathname, user?.role ?? "visitor");
      window.location.replace(target);
    } catch (err) {
      setAuthError(err as ApiErrorBody);
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connectez-vous à votre compte</CardTitle>
        <CardAction>
          <Button variant="link">
            <Link href="/auth/register">Créer un compte</Link>
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="login-form" disabled={authBusy}>
          Se connecter
        </Button>
      </CardFooter>
    </Card>
  );
}
