"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<ApiErrorBody | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const promise = forgotPassword({ email });
    toast.promise(promise, {
      loading: "Demande de réinitialisation du mot de passe...",
      success:
        "Si cette adresse est enregistrée, un e-mail de réinitialisation sera envoyé.",
      error: (err) => err?.message ?? "Échec de la demande de réinitialisation",
    });
    try {
      await promise;
      setCodeSent(true);
    } catch (err) {
      setError(err as ApiErrorBody);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const promise = resetPassword({
      token: token.trim(),
      newPassword,
      confirmPassword,
    });
    toast.promise(promise, {
      loading: "Vérification du code et réinitialisation du mot de passe...",
      success: "Mot de passe réinitialisé avec succès.",
      error: (err) =>
        err?.message ?? "Échec de la réinitialisation du mot de passe",
    });
    try {
      await promise;
      setResetComplete(true);
    } catch (err) {
      setError(err as ApiErrorBody);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {resetComplete
            ? "Réinitialisation du mot de passe"
            : codeSent
              ? "Saisissez votre code de réinitialisation"
              : "Mot de passe oublié ?"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resetComplete ? (
          <p role="status">Your password has been updated.</p>
        ) : codeSent ? (
          <form id="reset-password-form" onSubmit={handleReset}>
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
              <Field>
                <FieldLabel htmlFor="new-password">
                  Nouveau mot de passe
                </FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                {error?.fields?.confirmPassword && (
                  <FieldError>{error.fields.confirmPassword}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </form>
        ) : (
          <form id="forgot-password-form" onSubmit={handleRequest}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                {error?.fields?.email && (
                  <FieldError>{error.fields.email}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
      <CardFooter>
        {resetComplete ? (
          <Button nativeButton={false} render={<Link href="/auth/login" />}>
            Retour à la connexion
          </Button>
        ) : codeSent ? (
          <Button type="submit" form="reset-password-form" disabled={loading}>
            Réinitialiser le mot de passe
          </Button>
        ) : (
          <Button type="submit" form="forgot-password-form" disabled={loading}>
            Envoyer le code
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
