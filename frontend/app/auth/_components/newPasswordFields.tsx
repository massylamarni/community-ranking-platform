"use client";

import type { ApiErrorBody } from "@/types/api";
import { PasswordField } from "./passwordField";

export type NewPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

type NewPasswordFieldsProps = {
  values: NewPasswordValues;
  onChange: (patch: Partial<NewPasswordValues>) => void;
  errors?: ApiErrorBody["fields"];
  minLength?: number;
};

export function NewPasswordFields({
  values,
  onChange,
  errors,
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
        error={errors?.newPassword}
        minLength={minLength}
      />
      <PasswordField
        id="confirm-password"
        label="Confirmer le nouveau mot de passe"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={(confirmPassword) => onChange({ confirmPassword })}
        error={errors?.confirmPassword}
      />
    </>
  );
}
