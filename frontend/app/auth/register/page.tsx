"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState<unknown>(null);
  const [authBusy, setAuthBusy] = useState(false);

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
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label>
          Username
          <input
            value={registerForm.username}
            onChange={(e) =>
              setRegisterForm((f) => ({ ...f, username: e.target.value }))
            }
          />
        </label>
        <br />
        <label>
          Email
          <input
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        </label>
        <br />
        <label>
          Password
          <input
            type="password"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm((f) => ({ ...f, password: e.target.value }))
            }
          />
        </label>
        <br />
        <button type="submit" disabled={authBusy}>
          Create account
        </button>
      </form>
      <pre>{JSON.stringify(authError, null, 2)}</pre>
    </div>
  );
}
