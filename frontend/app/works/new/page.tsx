"use client";

import { WorkEdit } from "../_components/workEdit";
import { useCategory } from "@/contexts/categoryContext";

export default function NewWork() {
  const { categories } = useCategory();

  return <WorkEdit type="create" work={null} categories={categories} />;
}
