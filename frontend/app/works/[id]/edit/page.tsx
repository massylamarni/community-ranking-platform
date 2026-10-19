"use client";

import { useParams } from "next/navigation";
import type { Work } from "@/types/api";
import { useCategory } from "@/contexts/categoryContext";
import AuthorWorkGuard from "../../_components/guards/authorWorkGuard";
import { WorkEdit } from "../../_components/workEdit";
import { ApiError } from "@/lib/errors";

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
}: {
  work: Work;
  initialErrors: ApiError | null;
}) {
  const { categories } = useCategory();

  return <WorkEdit type="edit" work={work} categories={categories} />;
}
