"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ApiErrorBody } from "@/types/api";
import { useAuth } from "@/hooks/use-auth";

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [pwForm, setPwForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwResult, setPwResult] = useState<string | null>(null);
  const [pwError, setPwError] = useState<ApiErrorBody | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwResult(null);
    setIsLoading(true);

    const promise = changePassword(pwForm);

    toast.promise(promise, {
      loading: "Enregistrement...",
      success: () => pwResult,
      error: (err) =>
        err?.message ?? "Échec de la modification du mot de passe",
    });

    try {
      await promise;
      setPwResult("Mot de passe mis à jour.");
    } catch (err) {
      setPwError(err as ApiErrorBody);
    } finally {
      setIsLoading(false);
    }
  }

  const fe = pwError?.fields ?? {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier le mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="changepass-form" onSubmit={handleChangePassword}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="oldpassword">Ancien mot de passe</FieldLabel>
              <ButtonGroup className="w-full">
                <Input
                  id="oldpassword"
                  type={showOldPassword ? "text" : "password"}
                  value={pwForm.oldPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, oldPassword: e.target.value }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                >
                  {showOldPassword ? <Eye /> : <EyeClosed />}
                </Button>
              </ButtonGroup>
              {fe.oldPassword && <FieldError>{fe.oldPassword}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="newpassword">
                Nouveau mot de passe
              </FieldLabel>
              <ButtonGroup className="w-full">
                <Input
                  id="newpassword"
                  type={showNewPassword ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <Eye /> : <EyeClosed />}
                </Button>
              </ButtonGroup>{" "}
              {fe.newPassword && <FieldError>{fe.newPassword}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmpassword">
                Confirmer le nouveau mot de passe
              </FieldLabel>
              <Input
                id="confirmpassword"
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                minLength={1}
                required
              />
              {fe.confirmPassword && (
                <FieldError>{fe.confirmPassword}</FieldError>
              )}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="changepass-form" disabled={isLoading}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
