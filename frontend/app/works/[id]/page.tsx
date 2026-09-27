"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { worksRepository } from "@/repositories";
import type { Work } from "@/types/api";
import { WorkItem } from "../_components/workItem";
import LoadingGuard from "@/components/guards/loadingGuard";
import WorkNotFoundGuard from "../_components/guards/workNotFoundGuard";
import AuthorGuard from "../_components/guards/authorGuard";

export default function DisplayWork() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    worksRepository
      .get(id)
      .then((w) => {
        if (!isCurrent) return;
        setWork(w);
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
  }, [id]);

  const isAuthor = !!user && !!work && user.username === work.author.username;
  if (loading) return <LoadingGuard />;
  if (!work) return <WorkNotFoundGuard />;
  if (!isAuthor) return <AuthorGuard />;
  return (
    <div>
      <WorkItem work={work} />
      {error ? <p role="alert">{String(error)}</p> : null}
    </div>
  );
}
