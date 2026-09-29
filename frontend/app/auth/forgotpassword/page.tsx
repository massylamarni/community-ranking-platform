"use client";

import { useState } from "react";
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
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<ApiErrorBody | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const promise = forgotPassword({ email });
    toast.promise(promise, {
      loading: "Requesting password reset...",
      success: "If the address is registered, a reset email will be sent.",
      error: (err) => err?.message ?? "Password reset request failed",
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
        <CardTitle>Forgot your password?</CardTitle>
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
          Send reset link
        </Button>
      </CardFooter>
    </Card>
  );
}
