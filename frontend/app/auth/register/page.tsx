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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ButtonGroup } from "@/components/ui/button-group";
import { Eye, EyeClosed } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState<unknown>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      await register(registerForm);
    } catch (err) {
      setAuthError(err);
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create a new account</CardTitle>
        <CardAction>
          <Button variant="link">
            <Link href="/auth/login">Login</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <ButtonGroup className="w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" disabled={authBusy}>
          Create account
        </Button>
        <pre>{JSON.stringify(authError, null, 2)}</pre>
      </CardFooter>
    </Card>
  );
}
