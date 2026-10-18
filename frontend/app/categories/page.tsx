"use client";

import { useState } from "react";
import LoadingGuard from "@/components/guards/loadingGuard";
import { useCategory } from "@/contexts/categoryContext";
import { useQuery } from "@/hooks/use-query";
import NoCategory from "./_components/noCategory";
import CategoryView from "./_components/categoryView";

export default function CategoryPage() {
  const { list } = useCategory();
  const { data: categories, loading } = useQuery(list);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (loading) return <LoadingGuard />;

  const categoryId = selectedId ?? categories?.[0]?.id ?? null;
  if (categoryId === null) return <NoCategory />;

  return (
    <CategoryView
      categoryId={categoryId}
      onCategoryChange={(id) => setSelectedId(Number(id))}
    />
  );
}
