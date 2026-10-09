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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ApiErrorBody } from "@/types/api";

export default function Register() {
  const { register } = useAuth();
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState<ApiErrorBody | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);

    const promise = register(registerForm);

    toast.promise(promise, {
      loading: "Création de votre compte...",
      success: () => "Compte créé avec succès",
      error: (err) => err?.message ?? "Échec de l'inscription",
    });

    try {
      await promise;
    } catch (err) {
      setAuthError(err as ApiErrorBody);
    } finally {
      setAuthBusy(false);
    }
  }

  const fe = authError?.fields ?? {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardAction>
          <Button variant="link">
            <Link href="/auth/login">Se connecter</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="register-form" onSubmit={handleRegister}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Nom d&apos;utilisateur</FieldLabel>
              <Input
                id="username"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, username: e.target.value }))
                }
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_]+"
                required
              />
              {fe.username && <FieldError>{fe.username}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
              {fe.email && <FieldError>{fe.email}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <ButtonGroup className="w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((f) => ({ ...f, password: e.target.value }))
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
              {fe.password && <FieldError>{fe.password}</FieldError>}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="register-form" disabled={authBusy}>
          Créer le compte
        </Button>
      </CardFooter>
    </Card>
  );
}
