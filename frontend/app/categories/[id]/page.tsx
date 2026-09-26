"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { categoriesRepository } from "@/repositories";
import { ApiError } from "@/lib/errors";
import type { Category, Work } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const PAGE_SIZE = 20;

export default function CategoryWorksPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [works, setWorks] = useState<Work[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [worksLoading, setWorksLoading] = useState(true);
  const [worksError, setWorksError] = useState<string | null>(null);

  // Resolve the category name from the public list (no single-category
  // fetch endpoint exists, so we find it among all categories).
  useEffect(() => {
    let cancelled = false;
    setCategoryLoading(true);
    setCategoryError(null);
    categoriesRepository
      .list()
      .then((all) => {
        if (cancelled) return;
        const found = all.find((c) => c.id === categoryId) ?? null;
        setCategory(found);
        if (!found) setCategoryError("Catégorie introuvable.");
      })
      .catch((err) => {
        if (cancelled) return;
        setCategoryError(
          err instanceof ApiError
            ? err.message
            : "Impossible de charger la catégorie.",
        );
      })
      .finally(() => {
        if (!cancelled) setCategoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const loadWorks = useCallback(async () => {
    setWorksLoading(true);
    setWorksError(null);
    try {
      const result = await categoriesRepository.worksOf(
        categoryId,
        page,
        PAGE_SIZE,
      );
      setWorks(result.items);
      setTotal(result.total);
    } catch (err) {
      setWorksError(
        err instanceof ApiError
          ? err.message
          : "Impossible de charger les œuvres de cette catégorie.",
      );
    } finally {
      setWorksLoading(false);
    }
  }, [categoryId, page]);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Link
        href="/categories"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Toutes les catégories
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            {categoryLoading
              ? "Chargement..."
              : (category?.name ?? "Catégorie")}
          </CardTitle>
          <CardDescription>Œuvres publiées dans cette catégorie.</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryError && (
            <p className="text-sm text-destructive">{categoryError}</p>
          )}

          {worksLoading && (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          )}

          {!worksLoading && worksError && (
            <p className="text-sm text-destructive">{worksError}</p>
          )}

          {!worksLoading && !worksError && works.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune œuvre disponible dans cette catégorie.
            </p>
          )}

          {!worksLoading && !worksError && works.length > 0 && (
            <ul className="flex flex-col gap-3">
              {works.map((work) => (
                <li key={work.id} className="rounded-md border p-3">
                  <p className="font-medium">{work.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {work.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Par {work.author.username} · Score {work.score} (
                    {work.totalVotes} votes)
                  </p>
                </li>
              ))}
            </ul>
          )}

          {!worksLoading && !worksError && total > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}