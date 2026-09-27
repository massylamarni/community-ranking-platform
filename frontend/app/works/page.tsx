"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { categoriesRepository } from "@/repositories";
import type { Category, Work } from "@/types/api";
import FilterBar from "./_components/filterBar";
import { WorkList } from "./_components/workList";
import { WorkItem } from "./_components/workItem";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingGuard from "@/components/guards/loadingGuard";

export default function WorksDemoPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [works, setWorks] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

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
      .catch(setError)
      .finally(() => {
        setLoading(false);
      });
  }, [categoryId]);

  function handleSetWork(work: Work) {
    setWorks((prev) => prev.map((w) => (w.id === work.id ? work : w)));
  }

  const isAuthor =
    !!user && !!selectedWork && user.username === selectedWork.author.username;

  if (loading) return <LoadingGuard />;
  return (
    <div>
      <FilterBar
        categories={categories}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
      />
      <WorkList
        works={works}
        setWorks={setWorks}
        setSelectedWork={setSelectedWork}
        username={user?.username}
      />
      {error ? <p role="alert">{String(error)}</p> : null}{" "}
      <Dialog
        open={!!selectedWork}
        onOpenChange={(open) => !open && setSelectedWork(null)}
      >
        <DialogContent className="p-0 sm:max-w-lg">
          <WorkItem
            work={selectedWork}
            setWork={isAuthor ? undefined : handleSetWork}
          >
            {isAuthor && <div>Manage this work</div>}
          </WorkItem>
        </DialogContent>
      </Dialog>
    </div>
  );
}
