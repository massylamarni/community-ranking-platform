"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { ApiErrorBody } from "@/types/api";
import { toast } from "sonner";
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<ApiErrorBody | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const promise = resetPassword({
      token: searchParams.get("token") ?? "",
      newPassword,
      confirmPassword,
    });
    toast.promise(promise, {
      loading: "Réinitialisation du mot de passe...",
      success: "Mot de passe réinitialisé avec succès.",
      error: (err) =>
        err?.message ?? "Échec de la réinitialisation du mot de passe",
    });
    try {
      await promise;
    } catch (err) {
      setError(err as ApiErrorBody);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Définir un nouveau mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="reset-password-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-password">
                Nouveau mot de passe
              </FieldLabel>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
              />
              {error?.fields?.newPassword && (
                <FieldError>{error.fields.newPassword}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmer le nouveau mot de passe
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              {error?.fields?.confirmPassword && (
                <FieldError>{error.fields.confirmPassword}</FieldError>
              )}
              {error?.fields?.token && (
                <FieldError>{error.fields.token}</FieldError>
              )}
            </Field>
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

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent>Chargement...</CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
