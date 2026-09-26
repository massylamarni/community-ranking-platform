"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { categoriesRepository } from "@/repositories";
import { ApiError } from "@/lib/errors";
import type { Category, Work } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div>
        <Link
          href="/categories"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Toutes les catégories
        </Link>
      </div>

      {/* Page header — dashboard-panel style */}
      <div className="flex flex-col gap-1">
        {categoryLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight">
            {category?.name ?? "Catégorie"}
          </h1>
        )}
        <p className="text-sm text-muted-foreground">
          Œuvres publiées dans cette catégorie.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Œuvres</CardTitle>
          <CardDescription>
            {worksLoading ? "Chargement..." : `${total} œuvre${total > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryError && (
            <p className="mb-3 text-sm text-destructive">{categoryError}</p>
          )}

          {worksLoading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{work.title}</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {work.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{work.author.username}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {work.score}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {work.totalVotes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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