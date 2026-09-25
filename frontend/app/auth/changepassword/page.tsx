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
import { useAuth } from "@/context/AuthContext";
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

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
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
      loading: "Saving...",
      success: () => pwResult,
      error: (err) => err?.message ?? "Failed to change password",
    });

    try {
      await promise;
      setPwResult("Password updated.");
    } catch (err) {
      setPwError(err as ApiErrorBody);
    } finally {
      setIsLoading(false);
    }
  }

  const fe = pwError?.fields ?? {};

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="changepass-form" onSubmit={handleChangePassword}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="oldpassword">Old password</FieldLabel>
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
              <FieldLabel htmlFor="newpassword">New password</FieldLabel>
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
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <Eye /> : <EyeClosed />}
                </Button>
              </ButtonGroup>{" "}
              {fe.newPassword && <FieldError>{fe.newPassword}</FieldError>}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="changepass-form"
          className="w-full"
          disabled={isLoading}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
