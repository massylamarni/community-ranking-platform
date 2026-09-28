"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { categoriesRepository } from "@/repositories";
import type { Category, Work } from "@/types/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingGuard from "@/components/guards/loadingGuard";
import { WorkList } from "../works/_components/workList";
import { WorkItem } from "../works/_components/workItem";
import FilterBar from "./_components/filterBar";
import { HeaderPortal } from "@/components/header-portal";

export default function WorksByCategory() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedWork = works.find((w) => w.id === selectedId) ?? null;

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
    <>
      <HeaderPortal>
        <FilterBar
          categories={categories}
          categoryId={categoryId}
          setCategoryId={(id) => {
            setSelectedId(null);
            setCategoryId(id);
          }}
        />
      </HeaderPortal>
      <WorkList
        works={works}
        setWorks={setWorks}
        setSelectedWork={(w) => setSelectedId(w?.id ?? null)}
        username={user?.username}
      />
      <Dialog
        open={!!selectedWork}
        onOpenChange={(open) => !open && setSelectedId(null)}
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
    </>
  );
}
