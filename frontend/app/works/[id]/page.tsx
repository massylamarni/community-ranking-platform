"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { worksRepository } from "@/repositories";
import type { Work } from "@/types/api";
import { WorkDetails } from "../_components/workDetails";

export default function EditWorkPage() {
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

  return (
    <div>
      {loading ? <p>Loading...</p> : null}
      {error ? <p role="alert">{String(error)}</p> : null}

      {!loading && !work ? <p>This work could not be found.</p> : null}

      {work && !isAuthor ? (
        <p>
          You are not the author of this work, so you can&apos;t edit or delete
          it.
        </p>
      ) : null}
      {work && isAuthor ? (
        <WorkDetails work={work} isAuthor={isAuthor} />
      ) : null}
    </div>
  );
}
