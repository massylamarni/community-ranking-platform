"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody } from "@/types/api";
import { WorkEdit, WorkFormData } from "../_components/workEdit";
import { useCategories } from "@/hooks/use-category";
import { useWorks } from "@/hooks/use-work";

export default function NewWork() {
  const router = useRouter();

  const { categories, list } = useCategories();
  const { submit } = useWorks();
  const [errors, setErrors] = useState<ApiErrorBody | null>(null);

  useEffect(() => {
    list();
  }, [list]);

  async function handleCreate(data: WorkFormData) {
    setErrors(null);
    try {
      await submit(data);
      // router.push(`/works`);
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

  return (
    <WorkEdit
      work={null}
      categories={categories}
      errors={errors}
      handleSave={handleCreate}
    />
  );
}
