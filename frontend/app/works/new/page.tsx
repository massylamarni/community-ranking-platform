"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody } from "@/types/api";
import { WorkEdit, WorkFormData } from "../_components/workEdit";
import { useWorks } from "@/hooks/use-work";

export default function NewWork() {
  const router = useRouter();

  const { create } = useWorks();
  const [errors, setErrors] = useState<ApiErrorBody | null>(null);

  async function handleCreate(data: WorkFormData) {
    setErrors(null);
    try {
      const work = await create(data);
      router.push(`/works/${work.id}/edit`);
      return work;
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

  return (
    <WorkEdit
      work={null}
      categories={[]}
      errors={errors}
      handleSave={handleCreate}
    />
  );
}
