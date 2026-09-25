"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authRepository } from "@/repositories";
import type { OwnProfile } from "@/types/api";

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [profileError, setProfileError] = useState<unknown>(null);
  const [usernameEdit, setUsernameEdit] = useState("");

  async function loadProfile() {
    setProfileError(null);
    try {
      const p = await authRepository.getOwnProfile();
      setProfile(p);
      setUsernameEdit(p.username);
    } catch (err) {
      setProfileError(err);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    try {
      const p = await authRepository.updateOwnProfile({
        username: usernameEdit,
      });
      setProfile(p);
    } catch (err) {
      setProfileError(err);
    }
  }

  return (
    <div>
      <h2>Session</h2>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <div>{user.id}</div>
          <div>{user.role}</div>
          <div>{user.username}</div>
          <button onClick={() => logout()}>Log out</button>
        </div>
      ) : (
        <p>Not logged in.</p>
      )}

      <h2>My profile</h2>
      <button onClick={loadProfile}>Load my profile</button>
      <pre>{JSON.stringify(profileError, null, 2)}</pre>
      <div>{profile?.id}</div>
      <div>{profile?.role}</div>
      <div>{profile?.username}</div>
      <div>{profile?.email}</div>
      {profile ? (
        <form onSubmit={saveProfile}>
          <label>
            Username
            <input
              value={usernameEdit}
              onChange={(e) => setUsernameEdit(e.target.value)}
            />
          </label>
          <button type="submit">Save</button>
        </form>
      ) : null}
    </div>
  );
}
