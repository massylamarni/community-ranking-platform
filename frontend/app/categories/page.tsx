"use client";

import { useEffect, useState } from "react";
import { isAdmin, useAuth } from "@/hooks/use-auth";
import type { Work } from "@/types/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingGuard from "@/components/guards/loadingGuard";
import { WorkList } from "../works/_components/workList";
import { WorkItem } from "../works/_components/workItem";
import FilterBar from "./_components/filterBar";
import { HeaderPortal } from "@/components/header-portal";
import { useCategory } from "@/contexts/categoryContext";
import CategoryNotFoundGuard from "./_components/guards/categoryNotFoundGuard";
import NoCategory from "./_components/noCategory";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WorksByCategory() {
  const { user } = useAuth();
  const { categories, list, worksOf } = useCategory();
  const [categoryId, setCategoryId] = useState<string>("");
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedWork = works.find((w) => w.id === selectedId) ?? null;

  useEffect(() => {
    let isCurrent = true;

    list()
      .then((cats) => {
        if (!isCurrent) return;
        if (cats?.[0]) setCategoryId(String(cats[0].id));
        else setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [list]);

  useEffect(() => {
    if (!categoryId) return;
    let isCurrent = true;
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    worksOf(Number(categoryId))
      .then((page) => {
        if (isCurrent) setWorks(page.items);
      })
      .catch((err) => {
        if (isCurrent) setError(err);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [categoryId, worksOf]);

  function handleSetWork(work: Work) {
    setWorks((prev) => prev.map((w) => (w.id === work.id ? work : w)));
  }

  const isAuthor =
    !!user && !!selectedWork && user.username === selectedWork.author.username;

  if (loading) return <LoadingGuard />;

  return (
    <>
      <HeaderPortal>
        <div className="flex w-full justify-between">
          {categories.length !== 0 ? (
            <FilterBar
              categories={categories}
              categoryId={categoryId}
              setCategoryId={(id) => {
                setSelectedId(null);
                setCategoryId(id);
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
      {categoryId ? (
        <>
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
      ) : (
        <NoCategory />
      )}
    </>
  );
}
