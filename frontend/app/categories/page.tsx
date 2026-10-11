"use client";

import { useEffect, useState } from "react";
import LoadingGuard from "@/components/guards/loadingGuard";
import { useCategory } from "@/contexts/categoryContext";
import NoCategory from "./_components/noCategory";
import CategoryView from "./_components/categoryView";

export default function CategoryPage() {
  const { list } = useCategory();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    list()
      .then((cats) => {
        if (isCurrent && cats?.[0]) setCategoryId(cats[0].id);
      })
      .catch(() => {})
      .finally(() => isCurrent && setLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [list]);

  if (loading) return <LoadingGuard />;
  if (categoryId === null) return <NoCategory />;
  return (
    <CategoryView
      categoryId={categoryId}
      onCategoryChange={(id) => setCategoryId(Number(id))}
    />
  );
}
