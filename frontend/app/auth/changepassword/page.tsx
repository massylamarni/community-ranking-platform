"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [pwResult, setPwResult] = useState<string | null>(null);
  const [pwError, setPwError] = useState<unknown>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwResult(null);
    try {
      await changePassword(pwForm);
      setPwResult("Password updated.");
    } catch (err) {
      setPwError(err);
    }
  }

  return (
    <div>
      <h2>Change password</h2>
      <form onSubmit={handleChangePassword}>
        <label>
          Old password
          <input
            type="password"
            value={pwForm.oldPassword}
            onChange={(e) =>
              setPwForm((f) => ({ ...f, oldPassword: e.target.value }))
            }
          />
        </label>
        <br />
        <label>
          New password
          <input
            type="password"
            value={pwForm.newPassword}
            onChange={(e) =>
              setPwForm((f) => ({ ...f, newPassword: e.target.value }))
            }
          />
        </label>
        <br />
        <button type="submit">Change password</button>
      </form>
      {pwResult ? <p>{pwResult}</p> : null}
      <pre>{JSON.stringify(pwError, null, 2)}</pre>
    </div>
  );
}
