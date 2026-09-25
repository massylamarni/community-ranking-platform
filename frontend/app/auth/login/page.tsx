"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "alice",
    password: "alice1234",
  });
  const [authError, setAuthError] = useState<unknown>(null);
  const [authBusy, setAuthBusy] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      await login(loginForm);
    } catch (err) {
      setAuthError(err);
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <div>
      <h2>Log in</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username
          <input
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm((f) => ({ ...f, username: e.target.value }))
            }
          />
        </label>
        <br />
        <label>
          Password
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </label>
        <br />
        <button type="submit" disabled={authBusy}>
          Log in
        </button>
      </form>
      <pre>{JSON.stringify(authError, null, 2)}</pre>
    </div>
  );
}
