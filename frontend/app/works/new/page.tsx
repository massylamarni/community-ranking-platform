"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { categoriesRepository, worksRepository } from "@/repositories";
import type { Category } from "@/types/api";
import { WorkEdit, WorkFormData } from "../_components/workEdit";

export default function EditWorkPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    categoriesRepository.list().then(setCategories);
  }, []);

  async function handleCreate(data: WorkFormData) {
    setError(null);
    try {
      await worksRepository.submit(data);
      router.push(`/works`);
    } catch (err) {
      setError(err);
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
          handleSave={handleCreate}
        />
      )}
      {error ? <p role="alert">{String(error)}</p> : null}
    </div>
  );
}
