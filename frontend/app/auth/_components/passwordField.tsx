"use client";

import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: "current-password" | "new-password";
  minLength?: number;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  minLength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <ButtonGroup className="w-full">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={minLength}
          required
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? <Eye /> : <EyeClosed />}
        </Button>
      </ButtonGroup>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
