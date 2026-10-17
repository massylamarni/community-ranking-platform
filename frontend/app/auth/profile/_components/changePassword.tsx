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
import { FieldGroup } from "@/components/ui/field";
import { PasswordField } from "../../_components/passwordField";
import {
  NewPasswordFields,
  type NewPasswordValues,
} from "../../_components/newPasswordFields";

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const { run, loading, fieldErrors } = useApi();
  const [oldPassword, setOldPassword] = useState("");
  const [passwords, setPasswords] = useState<NewPasswordValues>({
    newPassword: "",
    confirmPassword: "",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await run(changePassword({ oldPassword, ...passwords }), {
      loading: "Enregistrement...",
      success: "Mot de passe mis à jour.",
      error: "Échec de la modification du mot de passe",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier le mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="changepass-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <PasswordField
              id="old-password"
              label="Ancien mot de passe"
              autoComplete="current-password"
              value={oldPassword}
              onChange={setOldPassword}
              error={fieldErrors?.oldPassword}
            />
            <NewPasswordFields
              values={passwords}
              onChange={(patch) => setPasswords((p) => ({ ...p, ...patch }))}
              errors={fieldErrors}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="changepass-form" disabled={loading}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
