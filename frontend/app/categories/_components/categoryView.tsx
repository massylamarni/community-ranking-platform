"use client";

import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { isAdmin, useAuth } from "@/hooks/use-auth";
import type { Work } from "@/types/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingGuard from "@/components/guards/loadingGuard";
import { HeaderPortal } from "@/components/header-portal";
import FilterBar from "../_components/filterBar";
import { WorkList } from "@/app/works/_components/workList";
import { WorkItem } from "@/app/works/_components/workItem";
import CategoryNotFoundGuard from "../_components/guards/categoryNotFoundGuard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCategory } from "@/contexts/categoryContext";
import { useQuery } from "@/hooks/use-query";

export default function CategoryView({
  categoryId,
  onCategoryChange,
}: {
  categoryId: number;
  onCategoryChange: (id: string) => void;
}) {
  const { user } = useAuth();
  const { categories, getById, worksOf } = useCategory();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, error, loading, setData } = useQuery(
    useCallback(async (): Promise<Work[] | null> => {
      if (!categoryId) return null;
      try {
        await getById(categoryId);
      } catch {
        return null; // category not found
      }
      return (await worksOf(categoryId)).items;
    }, [categoryId, getById, worksOf]),
  );

  const works = data ?? [];
  const selectedWork = works.find((w) => w.id === selectedId) ?? null;

  const setWorks: Dispatch<SetStateAction<Work[]>> = useCallback(
    (action) =>
      setData((prev) =>
        prev ? (typeof action === "function" ? action(prev) : action) : prev,
      ),
    [setData],
  );

  function handleSetWork(work: Work) {
    setWorks((prev) => prev.map((w) => (w.id === work.id ? work : w)));
  }

  const isAuthor =
    !!user && !!selectedWork && user.username === selectedWork.author.username;

  if (loading) return <LoadingGuard />;
  if (data === null) return <CategoryNotFoundGuard />;
  if (error) return <div>{error.message}</div>;
  return (
    <>
      <HeaderPortal>
        <div className="flex w-full justify-between">
          {categories.length !== 0 ? (
            <FilterBar
              categories={categories}
              categoryId={String(categoryId)}
              setCategoryId={(newId) => {
                setSelectedId(null);
                onCategoryChange(newId);
              }}
            />
          ) : (
            <div></div>
          )}
          {isAdmin(user) && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/categories/edit" />}
            >
              Edit
            </Button>
          )}
        </div>
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
