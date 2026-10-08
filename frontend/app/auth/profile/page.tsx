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
import type { ApiErrorBody } from "@/types/api";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import LoadingGuard from "@/components/guards/loadingGuard";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const { profile, refreshProfile, updateProfile } = useAuth();
  const [profileError, setProfileError] = useState<ApiErrorBody | null>(null);
  const [usernameEdit, setUsernameEdit] = useState("");
  const [emailEdit, setEmailEdit] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setProfileError(null);

      const promise = refreshProfile();

      toast.promise(promise, {
        loading: "Récupération du profil...",
        error: (err) => err?.message ?? "Échec de la récupération du profil",
      });

      try {
        const p = await promise;
        setUsernameEdit(p.username);
        setEmailEdit(p.email);
      } catch (err) {
        setProfileError(err as ApiErrorBody);
      }
    }
    loadProfile();
  }, [refreshProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setIsLoading(true);

    const promise = updateProfile({
      username: usernameEdit,
      email: emailEdit,
    });

    toast.promise(promise, {
      loading: "Enregistrement du profil...",
      success: () => "Profil enregistré avec succès",
      error: (err) => err?.message ?? "Échec de l'enregistrement",
    });

    try {
      await promise;
    } catch (err) {
      setProfileError(err as ApiErrorBody);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <LoadingGuard />;

  const fe = profileError?.fields ?? {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Gérez les informations de votre profil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profile ? (
          <form id="profile-form" onSubmit={handleSave}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">
                  Nom d&apos;utilisateur
                </FieldLabel>
                <Input
                  id="username"
                  value={usernameEdit}
                  onChange={(e) => setUsernameEdit(e.target.value)}
                  required
                />
                {fe.username && <FieldError>{fe.username}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={emailEdit}
                  onChange={(e) => setEmailEdit(e.target.value)}
                  required
                />
                {fe.email && <FieldError>{fe.email}</FieldError>}
              </Field>
            </FieldGroup>
          </form>
        ) : (
          "Échec de la récupération du profil"
        )}
      </CardContent>
      <CardFooter>
        <Button type="submit" form="profile-form" disabled={isLoading}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
