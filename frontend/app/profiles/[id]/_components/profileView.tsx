"use client";

import { useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import LoadingGuard from "@/components/guards/loadingGuard";
import ProfileNotFoundGuard from "./guards/profileNotFoundGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfileActivityTabs from "./profileActivityTabs";

export default function ProfileView({ userId }: { userId: number }) {
  const { user } = useAuth();
  const { profile, loading, error, notFound, get } = useProfile();

  useEffect(() => {
    if (Number.isInteger(userId) && userId > 0) {
      void get(userId).catch(() => undefined);
    }
  }, [get, userId]);

  if (loading) return <LoadingGuard />;
  if (notFound || !Number.isInteger(userId) || userId <= 0) {
    return <ProfileNotFoundGuard />;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Impossible de récupérer le profil."}
        </AlertDescription>
      </Alert>
    );
  }
  if (!profile) return null;

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle>{profile.username}</CardTitle>
        {user?.id === profile.userId && (
          <CardDescription>Adresse e-mail : {user.email}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="max-w-none">
        <ProfileActivityTabs profile={profile} />
      </CardContent>
    </Card>
  );
}
