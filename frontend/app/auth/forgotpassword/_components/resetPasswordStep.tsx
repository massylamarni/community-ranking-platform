"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  NewPasswordFields,
  type NewPasswordValues,
} from "../../_components/newPasswordFields";

type ResetPasswordStepProps = {
  onComplete: () => void;
};

export function ResetPasswordStep({ onComplete }: ResetPasswordStepProps) {
  const { resetPassword } = useAuth();
  const { run, loading, error } = useApi();
  const [token, setToken] = useState("");
  const [passwords, setPasswords] = useState<NewPasswordValues>({
    newPassword: "",
    confirmPassword: "",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const res = await run(
      resetPassword({ token: token.trim(), ...passwords }),
      {
        loading: "Vérification du code et réinitialisation du mot de passe...",
        success: "Mot de passe réinitialisé avec succès.",
        error: "Échec de la réinitialisation du mot de passe",
      },
    );
    if (res.ok) onComplete();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saisissez votre code de réinitialisation</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="reset-password-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reset-token">
                Code de réinitialisation
              </FieldLabel>
              <Input
                id="reset-token"
                autoComplete="one-time-code"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
              />
              {error?.fields?.token && (
                <FieldError>{error.fields.token}</FieldError>
              )}
            </Field>
            <NewPasswordFields
              values={passwords}
              onChange={(patch) => setPasswords((p) => ({ ...p, ...patch }))}
              error={error}
              minLength={8}
            />
            <FieldError>{error?.message}</FieldError>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="reset-password-form" disabled={loading}>
          Réinitialiser le mot de passe
        </Button>
      </CardFooter>
    </Card>
  );
}
