"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { categoriesRepository, worksRepository } from "@/repositories";
import type { Category, Work } from "@/types/api";
import { WorkEdit, WorkFormData } from "../../_components/workEdit";

export default function EditWorkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [work, setWork] = useState<Work | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesRepository.list().then(setCategories);
  }, []);

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

  async function handleSave(data: WorkFormData) {
    if (!work) return;
    setError(null);
    try {
      const updated = await worksRepository.update(work.id, data);
      setWork(updated);
    } catch (err) {
      setError(err);
    }
  }

  async function handleRemove() {
    if (!work) return;
    setError(null);
    try {
      await worksRepository.remove(work.id);
      router.push("/works");
    } catch (err) {
      setError(err);
    }
  }

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
        <WorkEdit
          work={work}
          categories={categories}
          handleSave={handleSave}
          handleRemove={handleRemove}
        />
      ) : null}
    </div>
  );
}
