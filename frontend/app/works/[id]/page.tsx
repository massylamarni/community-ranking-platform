"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { WorkItem } from "../_components/workItem";
import LoadingGuard from "@/components/guards/loadingGuard";
import WorkNotFoundGuard from "../_components/guards/workNotFoundGuard";
import AuthorGuard from "../_components/guards/authorGuard";
import { useWorks } from "@/hooks/use-work";

export default function DisplayWork() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { work, get } = useWorks();
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    get(Number(id))
      .then(() => {
        if (!isCurrent) return;
        setError(null);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err);
      })
      .finally(() => {
        if (!isCurrent) return;
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id, get]);

  const isAuthor = !!user && !!work && user.username === work.author.username;
  if (loading) return <LoadingGuard />;
  if (!work) return <WorkNotFoundGuard />;
  if (!isAuthor) return <AuthorGuard />;
  return <WorkItem work={work} />;
}
