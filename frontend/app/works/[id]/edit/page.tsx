// app/works/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ApiErrorBody, Work } from "@/types/api";
import { useWorks } from "@/hooks/use-work";
import { useCategory } from "@/contexts/categoryContext";
import AuthorWorkGuard from "../../_components/guards/authorWorkGuard";
import { WorkEdit, type WorkFormData } from "../../_components/workEdit";

export default function EditWork() {
  const { id } = useParams<{ id: string }>();
  return (
    <AuthorWorkGuard id={Number(id)}>
      {(work, fetchError) => (
        <EditWorkForm work={work} initialErrors={fetchError} />
      )}
    </AuthorWorkGuard>
  );
}

function EditWorkForm({
  work,
  initialErrors,
}: {
  work: Work;
  initialErrors: ApiErrorBody | null;
}) {
  const router = useRouter();
  const { submit, update, uploadImage, remove } = useWorks();
  const { categories, list } = useCategory();
  const [errors, setErrors] = useState<ApiErrorBody | null>(initialErrors);

  useEffect(() => {
    list();
  }, [list]);

  async function handleSave(data: WorkFormData) {
    setErrors(null);
    try {
      const updated = await update(work.id, {
        title: data.title,
        description: data.description,
      });
      return data.image ? await uploadImage(work.id, data.image) : updated;
    } catch (err) {
      setErrors(err as ApiErrorBody);
      return undefined;
    }
  }

  async function handlePublish(categoryIds: number[]) {
    setErrors(null);
    try {
      await submit(work.id, { categoryIds });
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

  async function handleRemove() {
    setErrors(null);
    try {
      await remove(work.id);
      router.push("/works");
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

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
