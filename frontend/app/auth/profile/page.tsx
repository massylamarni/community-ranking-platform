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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import LoadingGuard from "@/components/guards/loadingGuard";
import { useAuth } from "@/hooks/use-auth";
import ChangePassword from "./_components/changePassword";
import VerticalList from "@/components/vertical-list";
import { useApi } from "@/hooks";

export default function Profile() {
  const { profile, refreshProfile, updateProfile } = useAuth();
  const { run, loading, error } = useApi();

  const [usernameEdit, setUsernameEdit] = useState("");
  const [emailEdit, setEmailEdit] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const res = await run(refreshProfile(), {
        error: "Échec de la récupération du profil",
      });
      if (res.ok) {
        const profile = res.data;
        setUsernameEdit(profile.username);
        setEmailEdit(profile.email);
      }
    }
    loadProfile();
  }, [refreshProfile, run]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    await run(
      updateProfile({
        username: usernameEdit,
        email: emailEdit,
      }),
      {
        loading: "Enregistrement du profil...",
        success: "Profil enregistré avec succès",
        error: "Échec de l'enregistrement",
      },
    );
  }

  if (loading) return <LoadingGuard />;

  return (
    <VerticalList>
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
                  <FieldError>{error?.fields?.username}</FieldError>
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
                  <FieldError>{error?.fields?.email}</FieldError>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            "Échec de la récupération du profil"
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" form="profile-form" disabled={loading}>
            Enregistrer
          </Button>
        </CardFooter>
      </Card>
      <ChangePassword />
    </VerticalList>
  );
}
