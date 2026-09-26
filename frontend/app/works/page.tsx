"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { categoriesRepository } from "@/repositories";
import type { Category, Work } from "@/types/api";
import FilterBar from "./_components/filterBar";
import { WorkList } from "./_components/workList";
import { WorkDetails } from "./_components/workDetails";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function WorksDemoPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    categoriesRepository.list().then((cats) => {
      setCategories(cats);
      if (cats[0]) setCategoryId(cats[0].id);
    });
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    categoriesRepository
      .worksOf(categoryId)
      .then((page) => setWorks(page.items))
      .catch(setError);
  }, [categoryId]);

  const isAuthor =
    !!user && !!selectedWork && user.username === selectedWork.author.username;

  if (!user) return "Log in first to submit a work or manage your own.";

  return (
    <div>
      <FilterBar
        categories={categories}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
      />
      <WorkList works={works} setSelectedWork={setSelectedWork} />
      {error ? <p role="alert">{String(error)}</p> : null}{" "}
      <Dialog
        open={!!selectedWork}
        onOpenChange={(open) => !open && setSelectedWork(null)}
      >
        <DialogContent className="p-0">
          <WorkDetails work={selectedWork} isAuthor={isAuthor} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
