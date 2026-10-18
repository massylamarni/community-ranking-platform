"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWorks } from "@/hooks/use-work";
import type { ApiErrorBody, Work } from "@/types/api";
import LoadingGuard from "@/components/guards/loadingGuard";
import WorkNotFoundGuard from "./workNotFoundGuard";
import AuthorGuard from "./authorGuard";

export default function AuthorWorkGuard({
  id,
  children,
}: {
  id: number;
  children: (work: Work, fetchError: ApiErrorBody | null) => ReactNode;
}) {
  const { user } = useAuth();
  const { work, get } = useWorks();
  const [error, setError] = useState<ApiErrorBody | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    get(id)
      .then(() => isCurrent && setError(null))
      .catch((err) => isCurrent && setError(err))
      .finally(() => isCurrent && setLoading(false));

    return () => {
      isCurrent = false;
    };
  }, [id, get]);

  const isAuthor = !!user && !!work && user.username === work.author.username;
  if (loading) return <LoadingGuard />;
  if (!work) return <WorkNotFoundGuard />;
  if (!isAuthor) return <AuthorGuard />;
  return <>{children(work, error)}</>;
}
