"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingGuard from "@/components/guards/loadingGuard";
import { useAuth } from "@/hooks/use-auth";

export default function MyProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.replace(`/profiles/${user.id}`);
  }, [user, router]);

  return <LoadingGuard />;
}
