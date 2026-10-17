"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { AlertCircle, History, RefreshCw } from "lucide-react";
import { cn } from "cn";
import { categoriesRepository } from "@/repositories/categories.repository";
import { rankingsRepository } from "@/repositories/rankings.repository";
import type {
  Category,
  RankingEntry,
  RankingPage,
} from "@/types/api";
import LoadingGuard from "@/components/guards/loadingGuard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RankingArchiveFilterBar from "./_components/rankingArchiveFilterBar";
import RankingArchiveHasNoWork from "./_components/rankingArchiveHasNoWork";

type CellMeta = { className?: string };

const features = tableFeatures({ rowPaginationFeature });

const PAGE_SIZE = 10;

function computeClosureDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return null;
    const end = new Date(Date.UTC(year, month - 1, day + 6));
    const endD = String(end.getUTCDate()).padStart(2, "0");
    const endM = String(end.getUTCMonth() + 1).padStart(2, "0");
    const endY = end.getUTCFullYear();
    return `${endD}/${endM}/${endY}`;
  } catch {
    return null;
  }
}

const columns: ColumnDef<typeof features, RankingEntry>[] = [
  {
    accessorKey: "position",
    header: "Position",
    meta: { className: "w-24 text-left px-6" } as CellMeta,
    cell: ({ row }) => (
      <Badge variant="secondary">#{row.original.position}</Badge>
    ),
  },
  {
    accessorKey: "title",
    header: "Œuvre",
    meta: { className: "text-left px-4 whitespace-normal" } as CellMeta,
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div>
          <Button
            variant="link"
            className="h-auto p-0 font-medium text-foreground hover:underline text-sm justify-start"
            nativeButton={false}
            render={<Link href={`/works/${entry.id}`}>{entry.title}</Link>}
          />
          {entry.author && (
            <div className="text-xs text-muted-foreground mt-0.5">
              par {entry.author}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "categories",
    header: "Catégories",
    accessorFn: (entry) => entry.categories?.join(" ") ?? "",
    meta: { className: "text-left px-4 whitespace-normal" } as CellMeta,
    cell: ({ row }) => {
      const categories = row.original.categories ?? [];
      return (
        <div className="flex flex-wrap gap-1.5 py-1">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Général</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "score",
    header: "Score final",
    meta: { className: "w-28 text-right px-6 tabular-nums font-bold" } as CellMeta,
    cell: ({ row }) => (
      <span className="font-bold text-foreground">{row.original.score}</span>
    ),
  },
];

function RankingArchivesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const urlCategory =
    searchParams.get("category") ?? searchParams.get("categoryId") ?? "all";

  // Form selection
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);

  // Available archived periods to extract the most recently closed period
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  useEffect(() => {
    rankingsRepository
      .listArchivedPeriods("week")
      .then((periods) => {
        if (periods && periods.length > 0) {
          setLatestPeriodStart(periods[0]);
        }
      })
      .catch(() => {
        setLatestPeriodStart(null);
      });
  }, []);

  const closureDate = useMemo(() => {
    return computeClosureDate(latestPeriodStart);
  }, [latestPeriodStart]);

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    categoriesRepository
      .list()
      .then((data) => setCategories(data ?? []))
      .catch(() => setCategories([]));
  }, []);

  // Resolve numeric categoryId
  const resolvedCategoryId = useMemo(() => {
    if (!urlCategory || urlCategory === "all") return undefined;
    const parsed = Number(urlCategory);
    if (!isNaN(parsed) && parsed > 0) return parsed;
    const found = categories.find(
      (c) => c.name.toLowerCase() === urlCategory.toLowerCase(),
    );
    return found ? found.id : undefined;
  }, [urlCategory, categories]);

  // Table & pagination state
  const [ranking, setRanking] = useState<RankingPage | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { pageIndex } = pagination;

  // Keep state synced with URL changes
  const [prevCategory, setPrevCategory] = useState(urlCategory);
  if (prevCategory !== urlCategory) {
    setPrevCategory(urlCategory);
    setSelectedCategory(urlCategory);
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
    );
  }

  // Fetch archived rankings (always by date from recently ended)
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    rankingsRepository
      .listArchives({
        periodType: "week",
        categoryId: resolvedCategoryId,
        page: pageIndex + 1,
        pageSize: PAGE_SIZE,
      })
      .then((data) => {
        if (!cancelled) setRanking(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Impossible de charger les anciens classements. Veuillez vérifier votre connexion ou réessayer.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedCategoryId, pageIndex, reloadKey]);

  function handleFilterSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    const qs = params.toString();
    router.push(qs ? `/rankings/archives?${qs}` : "/rankings/archives");
  }

  function handleReset() {
    setSelectedCategory("all");
    router.push("/rankings/archives");
  }

  const table = useTable({
    features,
    data: ranking?.items ?? [],
    columns,
    manualPagination: true,
    rowCount: ranking?.total ?? 0,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  const activeCategoryObj = categories.find((c) => c.id === resolvedCategoryId);
  const cardTitle = activeCategoryObj
    ? `Anciens classements : ${activeCategoryObj.name}`
    : "Anciens classements";

  const rows = table.getRowModel().rows;
  const pageCount = Math.max(1, table.getPageCount());
  const firstResult = ranking ? pageIndex * PAGE_SIZE + 1 : 0;
  const lastResult = ranking
    ? Math.min((pageIndex + 1) * PAGE_SIZE, ranking.total)
    : 0;

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            <CardTitle className="text-xl font-bold">{cardTitle}</CardTitle>
          </div>
          {closureDate && (
            <Badge
              variant="outline"
              className="font-normal text-xs text-muted-foreground"
            >
              Date de fin : {closureDate}
            </Badge>
          )}
        </div>
        <CardDescription>
          Consultez les résultats finaux des classements hebdomadaires clôturés
          {closureDate ? ` (date de fin : ${closureDate})` : ""}.
        </CardDescription>

        <div className="pt-2">
          <RankingArchiveFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onSubmit={handleFilterSubmit}
            onReset={handleReset}
            loading={loading}
          />
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-2">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReloadKey((k) => k + 1)}
                className="gap-1 shrink-0"
              >
                <RefreshCw className="size-3" />
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <LoadingGuard />
        ) : ranking?.items.length === 0 ? (
          <RankingArchiveHasNoWork />
        ) : (
          <>
            <div
              className={cn("border rounded-md", loading && "opacity-60")}
              aria-busy={loading}
            >
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const meta = header.column.columnDef.meta as CellMeta | undefined;
                        return (
                          <TableHead
                            key={header.id}
                            className={cn("h-10 font-medium", meta?.className)}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getAllCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as CellMeta | undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn("py-3 align-middle", meta?.className)}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {ranking && ranking.total > PAGE_SIZE && (
              <div className="flex justify-between items-center">
                <Label className="pl-1">
                  Affichage de {firstResult} à {lastResult} sur {ranking.total}
                </Label>

                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        text="Précédent"
                        aria-disabled={!table.getCanPreviousPage()}
                        className={cn(
                          !table.getCanPreviousPage() &&
                            "pointer-events-none opacity-50",
                        )}
                        onClick={(event) => {
                          event.preventDefault();
                          table.previousPage();
                        }}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <Label>
                        Page {pageIndex + 1} sur {pageCount}
                      </Label>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        text="Suivant"
                        aria-disabled={!table.getCanNextPage()}
                        className={cn(
                          !table.getCanNextPage() &&
                            "pointer-events-none opacity-50",
                        )}
                        onClick={(event) => {
                          event.preventDefault();
                          table.nextPage();
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function RankingArchivesPage() {
  return (
    <Suspense fallback={<LoadingGuard />}>
      <RankingArchivesContent />
    </Suspense>
  );
}
