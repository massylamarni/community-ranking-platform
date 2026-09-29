"use client";

import { useEffect, useState } from "react";
import { isAdmin, useAuth } from "@/hooks/use-auth";
import type { Work } from "@/types/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingGuard from "@/components/guards/loadingGuard";
import { HeaderPortal } from "@/components/header-portal";
import FilterBar from "../_components/filterBar";
import { WorkList } from "@/app/works/_components/workList";
import { WorkItem } from "@/app/works/_components/workItem";
import { useParams, useRouter } from "next/navigation";
import CategoryNotFoundGuard from "../_components/guards/categoryNotFoundGuard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCategory } from "@/contexts/categoryContext";

export default function WorksByCategory() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const router = useRouter();

  const { user } = useAuth();
  const { categories, getById, worksOf } = useCategory();
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedWork = works.find((w) => w.id === selectedId) ?? null;

  useEffect(() => {
    let isCurrent = true;
    // eslint-disable-next-line
    setLoading(true);
    setError(null);
    setNotFound(false);

    if (!categoryId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    getById(categoryId)
      .then(
        () =>
          worksOf(categoryId).then((page) => isCurrent && setWorks(page.items)),
        () => isCurrent && setNotFound(true),
      )
      .catch((err) => {
        if (isCurrent) setError(err);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [categoryId, getById, worksOf]);

  function handleSetWork(work: Work) {
    setWorks((prev) => prev.map((w) => (w.id === work.id ? work : w)));
  }

  const isAuthor =
    !!user && !!selectedWork && user.username === selectedWork.author.username;

  if (loading) return <LoadingGuard />;
  if (notFound) return <CategoryNotFoundGuard />;
  return (
    <>
      <HeaderPortal>
        <div className="flex w-full justify-between">
          {categories.length !== 0 ? (
            <FilterBar
              categories={categories}
              categoryId={id}
              setCategoryId={(newId) => {
                setSelectedId(null);
                router.push(`/categories/${newId}`);
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
