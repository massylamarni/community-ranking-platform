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
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authRepository } from "@/repositories";
import type { ApiErrorBody, OwnProfile } from "@/types/api";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function Profile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<OwnProfile | null>(null);
  const [profileError, setProfileError] = useState<ApiErrorBody | null>(null);
  const [usernameEdit, setUsernameEdit] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setProfileError(null);

      const promise = authRepository.getOwnProfile();

      toast.promise(promise, {
        loading: "Fetching profile...",
        error: (err) => err?.message ?? "Failed to fetch profile",
      });

      try {
        const p = await promise;
        setProfile(p);
        setUsernameEdit(p.username);
      } catch (err) {
        setProfileError(err as ApiErrorBody);
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setIsLoading(true);

    const promise = authRepository.updateOwnProfile({
      username: usernameEdit,
    });

    toast.promise(promise, {
      loading: "Saving profile...",
      success: () => "Saved successfully",
      error: (err) => err?.message ?? "Save failed",
    });

    try {
      const p = await promise;
      setProfile(p);
    } catch (err) {
      setProfileError(err as ApiErrorBody);
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return "Not logged in.";
  if (loading) return "Loading...";

  const fe = profileError?.fields ?? {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        {profile ? (
          <form id="profile-form" onSubmit={handleSave}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  value={usernameEdit}
                  onChange={(e) => setUsernameEdit(e.target.value)}
                  required
                />
                {fe.username && <FieldError>{fe.username}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" value={profile.email} disabled />
              </Field>
            </FieldGroup>
          </form>
        ) : (
          "Failed to fetch profile"
        )}
      </CardContent>
      <CardFooter>
        <Button type="submit" form="profile-form" disabled={isLoading}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
