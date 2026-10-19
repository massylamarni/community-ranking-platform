"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import { useApi } from "@/hooks";

type RequestResetStepProps = {
  onSent: () => void;
};

export function RequestResetStep({ onSent }: RequestResetStepProps) {
  const { forgotPassword } = useAuth();
  const { run, loading, error } = useApi();

  const [email, setEmail] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const res = await run(forgotPassword({ email }), {
      loading: "Demande de réinitialisation du mot de passe...",
      success:
        "Si cette adresse est enregistrée, un e-mail de réinitialisation sera envoyé.",
      error: "Échec de la demande de réinitialisation",
    });
    if (res.ok) onSent();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié ?</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="forgot-password-form" onSubmit={handleSubmit}>
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
      </CardContent>
      <CardFooter>
        <Button type="submit" form="forgot-password-form" disabled={loading}>
          Envoyer le code
        </Button>
      </CardFooter>
    </Card>
  );
}
