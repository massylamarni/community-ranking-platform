"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { categoriesRepository, worksRepository } from "@/repositories";
import type { ApiErrorBody, Category, Work } from "@/types/api";
import { WorkEdit, WorkFormData } from "../../_components/workEdit";

export default function EditWorkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [work, setWork] = useState<Work | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<ApiErrorBody | null>(null);
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
        setErrors(null);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setErrors(err);
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
    setErrors(null);
    try {
      const updated = await worksRepository.update(work.id, data);
      setWork(updated);
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

  async function handleRemove() {
    if (!work) return;
    setErrors(null);
    try {
      await worksRepository.remove(work.id);
      router.push("/works");
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

  const isAuthor = !!user && !!work && user.username === work.author.username;

  return (
    <div>
      {loading ? <p>Loading...</p> : null}

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
          errors={errors}
          handleSave={handleSave}
          handleRemove={handleRemove}
        />
      ) : null}
    </div>
  );
}
