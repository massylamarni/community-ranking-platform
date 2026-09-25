"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ButtonGroup } from "@/components/ui/button-group";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ApiErrorBody } from "@/types/api";

export default function Login() {
  const { login } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "alice",
    password: "alice1234",
  });
  const [authError, setAuthError] = useState<ApiErrorBody | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);

    const promise = login(loginForm);

    toast.promise(promise, {
      loading: "Logging to your account...",
      success: () => "Login success",
      error: (err) => err?.message ?? "Login failed",
    });

    try {
      await promise;
    } catch (err) {
      setAuthError(err as ApiErrorBody);
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardAction>
          <Button variant="link">
            <Link href="/auth/register">Register</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={handleLogin}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <ButtonGroup className="w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </Button>
              </ButtonGroup>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="login-form"
          className="w-full"
          disabled={authBusy}
        >
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}
