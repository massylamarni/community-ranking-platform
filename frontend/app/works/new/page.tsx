"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { categoriesRepository, worksRepository } from "@/repositories";
import type { ApiErrorBody, Category } from "@/types/api";
import { WorkEdit, WorkFormData } from "../_components/workEdit";

export default function EditWorkPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<ApiErrorBody | null>(null);

  useEffect(() => {
    categoriesRepository.list().then(setCategories);
  }, []);

  async function handleCreate(data: WorkFormData) {
    setErrors(null);
    try {
      await worksRepository.submit(data);
      router.push(`/works`);
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }

  return (
    <div>
      {!user ? (
        <p>Log in first, a visitor cannot submit a work.</p>
      ) : (
        <WorkEdit
          work={null}
          categories={categories}
          errors={errors}
          handleSave={handleCreate}
        />
      )}
    </div>
  );
}
