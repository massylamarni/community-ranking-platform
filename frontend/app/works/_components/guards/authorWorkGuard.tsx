"use client";

import { useCallback, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWorks } from "@/hooks/use-work";
import { useQuery } from "@/hooks/use-query";
import type { Work } from "@/types/api";
import type { ApiError } from "@/lib/errors";
import LoadingGuard from "@/components/guards/loadingGuard";
import WorkNotFoundGuard from "./workNotFoundGuard";
import AuthorGuard from "./authorGuard";

export default function AuthorWorkGuard({
  id,
  children,
}: {
  id: number;
  children: (work: Work, fetchError: ApiError | null) => ReactNode;
}) {
  const { user } = useAuth();
  const { work, get } = useWorks();
  const { loading, error } = useQuery(useCallback(() => get(id), [get, id]));

  if (loading) return <LoadingGuard />;
  if (!work || work.id !== id) return <WorkNotFoundGuard />;

  const isAuthor = !!user && user.username === work.author.username;
  if (!isAuthor) return <AuthorGuard />;
  return <>{children(work, error ?? null)}</>;
}
