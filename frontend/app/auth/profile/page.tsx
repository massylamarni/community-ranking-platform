"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authRepository } from "@/repositories";
import type { OwnProfile } from "@/types/api";

export default function Profile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [profileError, setProfileError] = useState<unknown>(null);
  const [usernameEdit, setUsernameEdit] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setIsLoading(true);
    try {
      const p = await authRepository.updateOwnProfile({
        username: usernameEdit,
      });
      setProfile(p);
    } catch (err) {
      setProfileError(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return "Not logged in.";
  if (loading) return "Loading...";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        {profile ? (
          <form onSubmit={handleSave}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={usernameEdit}
                  onChange={(e) => setUsernameEdit(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>
            </div>
          </form>
        ) : (
          "Failed to fetch profile"
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          Save
        </Button>
        <pre>{JSON.stringify(profileError, null, 2)}</pre>
      </CardFooter>
    </Card>
  );
}
