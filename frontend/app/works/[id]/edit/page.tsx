"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { ApiErrorBody } from "@/types/api";
import { WorkEdit, WorkFormData } from "../../_components/workEdit";
import LoadingGuard from "@/components/guards/loadingGuard";
import WorkNotFoundGuard from "../../_components/guards/workNotFoundGuard";
import AuthorGuard from "../../_components/guards/authorGuard";
import { useWorks } from "@/hooks/use-work";
import { useCategories } from "@/hooks/use-category";

export default function EditWork() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { work, get, submit, update, uploadImage, remove } = useWorks();
  const { categories, list } = useCategories();
  const [errors, setErrors] = useState<ApiErrorBody | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    list();
  }, [list]);

  useEffect(() => {
    let isCurrent = true;

    get(Number(id))
      .then(() => {
        if (!isCurrent) return;
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
  }, [id, get]);

  async function handleSave(data: WorkFormData) {
    if (!work) return;
    setErrors(null);
    try {
      const updated = await update(work.id, {
        title: data.title,
        description: data.description,
      });
      return data.image ? uploadImage(work.id, data.image) : updated;
    } catch (err) {
      setErrors(err as ApiErrorBody);
      return undefined;
    }
  }

  async function handlePublish(categoryIds: number[]) {
    if (!work) return;
    setErrors(null);
    try {
      await submit(work.id, { categoryIds });
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

  async function handleRemove() {
    if (!work) return;
    setErrors(null);
    try {
      await remove(work.id);
      router.push("/works");
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }
  const isAuthor = !!user && !!work && user.username === work.author.username;
  if (loading) return <LoadingGuard />;
  if (!work) return <WorkNotFoundGuard />;
  if (!isAuthor) return <AuthorGuard />;
  return (
    <WorkEdit
      work={work}
      categories={categories}
      errors={errors}
      handleSave={handleSave}
      handlePublish={handlePublish}
      handleRemove={handleRemove}
    />
  );
}
