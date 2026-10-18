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
import { useApi } from "@/hooks";
import { useRouter } from "next/navigation";

export default function Register() {
  const { register, login } = useAuth();
  const { run, loading, error } = useApi();
  const routes = useRouter();

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const res = await run(register(registerForm), {
      loading: "Création de votre compte...",
      success: "Compte créé avec succès",
      error: "Échec de l'inscription",
    });
    if (res.ok) {
      const user = {
        username: registerForm.username,
        password: registerForm.password,
      };
      await login(user);
      routes.replace("/profiles");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardAction>
          <Button
            variant="link"
            nativeButton={false}
            render={<Link href="/auth/login" />}
          >
            Se connecter
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
              <FieldError>{error?.fields?.username}</FieldError>
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
              <FieldError>{error?.fields?.email}</FieldError>
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
              <FieldError>{error?.fields?.password}</FieldError>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="register-form" disabled={loading}>
          Créer le compte
        </Button>
      </CardFooter>
    </Card>
  );
}
