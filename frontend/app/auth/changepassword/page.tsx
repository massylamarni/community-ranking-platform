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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ButtonGroup } from "@/components/ui/button-group";
import { Eye, EyeClosed } from "lucide-react";

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [pwResult, setPwResult] = useState<string | null>(null);
  const [pwError, setPwError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwResult(null);
    setIsLoading(true);
    try {
      await changePassword(pwForm);
      setPwResult("Password updated.");
    } catch (err) {
      setPwError(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangePassword}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="oldpassword">Old password</Label>
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newpassword">New password</Label>
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
              </ButtonGroup>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          Save
        </Button>
        {pwResult ? <p>{pwResult}</p> : null}
        <pre>{JSON.stringify(pwError, null, 2)}</pre>
      </CardFooter>
    </Card>
  );
}
