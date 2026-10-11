"use client";

import { useParams, useRouter } from "next/navigation";
import CategoryView from "../_components/categoryView";

export default function WorksByCategory() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  return (
    <CategoryView
      categoryId={Number(id)}
      onCategoryChange={(newId) => router.push(`/categories/${newId}`)}
    />
  );
}
