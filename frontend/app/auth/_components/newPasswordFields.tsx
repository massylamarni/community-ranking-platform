"use client";

import { ApiError } from "@/lib/errors";
import { PasswordField } from "./passwordField";

export type NewPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

type NewPasswordFieldsProps = {
  values: NewPasswordValues;
  onChange: (patch: Partial<NewPasswordValues>) => void;
  error: ApiError | null;
  minLength?: number;
};

export function NewPasswordFields({
  values,
  onChange,
  error,
  minLength,
}: NewPasswordFieldsProps) {
  return (
    <>
      <PasswordField
        id="new-password"
        label="Nouveau mot de passe"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={(newPassword) => onChange({ newPassword })}
        error={error?.fields?.newPassword}
        minLength={minLength}
      />
      <PasswordField
        id="confirm-password"
        label="Confirmer le nouveau mot de passe"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(confirmPassword) => onChange({ confirmPassword })}
        error={error?.fields?.confirmPassword}
      />
    </>
  );
}
