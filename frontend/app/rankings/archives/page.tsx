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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RankingArchiveFilterBar, {
  type RankingArchiveSortOption,
} from "./_components/rankingArchiveFilterBar";
import RankingArchiveHasNoWork from "./_components/rankingArchiveHasNoWork";

type CellMeta = { className?: string };

interface TableMeta {
  closureDate?: string;
}

const features = tableFeatures({ rowPaginationFeature });

const PAGE_SIZE = 10;

function computeClosureDate(dateStr?: string | null): string {
  if (!dateStr || dateStr === "latest") return "-";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const end = new Date(Date.UTC(year, month - 1, day + 6));
    const endD = String(end.getUTCDate()).padStart(2, "0");
    const endM = String(end.getUTCMonth() + 1).padStart(2, "0");
    const endY = end.getUTCFullYear();
    return `${endD}/${endM}/${endY}`;
  } catch {
    return dateStr;
  }
}

function normalizeSort(param: string | null): RankingArchiveSortOption {
  if (!param) return "date_desc";
  const p = param.trim().toLowerCase();
  if (p === "date_asc") return "date_asc";
  if (p === "score_desc") return "score_desc";
  if (p === "score_asc") return "score_asc";
  return "date_desc";
}

const columns: ColumnDef<typeof features, RankingEntry>[] = [
  {
    accessorKey: "position",
    header: "Position",
    meta: { className: "w-20 text-center" } as CellMeta,
    cell: ({ row }) => (
      <Badge variant="secondary">#{row.original.position ?? row.index + 1}</Badge>
    ),
  },
  {
    accessorKey: "title",
    header: "Œuvre",
    meta: { className: "whitespace-normal" } as CellMeta,
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <Item className="p-0" size="sm">
          <ItemContent>
            <ItemTitle>
              <Button
                variant="link"
                className="h-auto p-0"
                nativeButton={false}
                render={<Link href={`/works/${entry.id}`}>{entry.title}</Link>}
              />
            </ItemTitle>
            <ItemDescription>par {entry.author}</ItemDescription>
          </ItemContent>
        </Item>
      );
    },
  },
  {
    id: "categories",
    header: "Catégories",
    accessorFn: (entry) => entry.categories?.join(" ") ?? "",
    meta: { className: "w-48 hidden md:table-cell" } as CellMeta,
    cell: ({ row }) =>
      row.original.categories?.length ? (
        <ScrollArea>
          {row.original.categories.map((category) => (
            <Badge key={category} variant="outline" className="mr-1">
              {category}
            </Badge>
          ))}
        </ScrollArea>
      ) : (
        <Badge variant="ghost">Général</Badge>
      ),
  },
  {
    id: "closureDate",
    header: "Date de fin",
    meta: { className: "w-32 text-center tabular-nums" } as CellMeta,
    cell: ({ table }) => {
      const meta = table.options.meta as TableMeta | undefined;
      return (
        <span className="text-muted-foreground font-medium text-xs sm:text-sm">
          {meta?.closureDate ?? "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "score",
    header: "Score final",
    meta: { className: "w-24 text-center tabular-nums" } as CellMeta,
  },
];

function RankingArchivesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const urlCategory =
    searchParams.get("category") ?? searchParams.get("categoryId") ?? "all";
  const urlPeriodStart = searchParams.get("periodStart") ?? "latest";
  const urlSort = normalizeSort(searchParams.get("sortBy"));

  // Form selections
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedPeriodStart, setSelectedPeriodStart] =
    useState<string>(urlPeriodStart);
  const [selectedSort, setSelectedSort] =
    useState<RankingArchiveSortOption>(urlSort);

  // Available archived periods
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  useEffect(() => {
    rankingsRepository
      .listArchivedPeriods("week")
      .then((periods) => {
        setAvailablePeriods(periods ?? []);
      })
      .catch(() => setAvailablePeriods([]));
  }, []);

  // Sorted periods list based on sort selection
  const sortedPeriods = useMemo(() => {
    const copy = [...availablePeriods];
    if (urlSort === "date_asc") {
      return copy.sort((a, b) => a.localeCompare(b));
    }
    return copy.sort((a, b) => b.localeCompare(a));
  }, [availablePeriods, urlSort]);

  // Active period start date
  const effectivePeriodStart = useMemo(() => {
    if (urlPeriodStart && urlPeriodStart !== "latest") {
      return urlPeriodStart;
    }
    return sortedPeriods.length > 0 ? sortedPeriods[0] : undefined;
  }, [urlPeriodStart, sortedPeriods]);

  const displayedClosureDate = useMemo(() => {
    return computeClosureDate(effectivePeriodStart);
  }, [effectivePeriodStart]);

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
  const [prevParams, setPrevParams] = useState({
    urlCategory,
    urlPeriodStart,
    urlSort,
  });

  if (
    prevParams.urlCategory !== urlCategory ||
    prevParams.urlPeriodStart !== urlPeriodStart ||
    prevParams.urlSort !== urlSort
  ) {
    setPrevParams({ urlCategory, urlPeriodStart, urlSort });
    setSelectedCategory(urlCategory);
    setSelectedPeriodStart(urlPeriodStart);
    setSelectedSort(urlSort);
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
    );
  }

  // Fetch archived rankings
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    rankingsRepository
      .listArchives({
        periodType: "week",
        periodStart: effectivePeriodStart,
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
  }, [effectivePeriodStart, resolvedCategoryId, pageIndex, reloadKey]);

  // Client-side sorting for current page if requested
  const displayItems = useMemo(() => {
    if (!ranking?.items) return [];
    const items = [...ranking.items];
    if (urlSort === "score_asc") {
      return items.sort((a, b) => a.score - b.score);
    }
    if (urlSort === "score_desc") {
      return items.sort((a, b) => b.score - a.score);
    }
    return items;
  }, [ranking?.items, urlSort]);

  function handleFilterSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (selectedSort && selectedSort !== "date_desc") {
      params.set("sortBy", selectedSort);
    }

    if (selectedPeriodStart && selectedPeriodStart !== "latest") {
      params.set("periodStart", selectedPeriodStart);
    }

    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    const qs = params.toString();
    router.push(qs ? `/rankings/archives?${qs}` : "/rankings/archives");
  }

  function handleReset() {
    setSelectedSort("date_desc");
    setSelectedPeriodStart("latest");
    setSelectedCategory("all");
    router.push("/rankings/archives");
  }

  const table = useTable({
    features,
    data: displayItems,
    columns,
    manualPagination: true,
    rowCount: ranking?.total ?? 0,
    state: { pagination },
    onPaginationChange: setPagination,
    meta: {
      closureDate: displayedClosureDate,
    } as TableMeta,
  });

  const activeCategoryObj = categories.find((c) => c.id === resolvedCategoryId);
  const cardTitle = activeCategoryObj
    ? `Anciens classements : ${activeCategoryObj.name}`
    : "Anciens classements";

  const sortDescriptions: Record<RankingArchiveSortOption, string> = {
    date_desc: "triés par date de clôture décroissante (plus récents d'abord)",
    date_asc: "triés par date de clôture croissante (plus anciens d'abord)",
    score_desc: "triés par score décroissant (meilleurs scores d'abord)",
    score_asc: "triés par score croissant",
  };
  const sortDesc = sortDescriptions[urlSort];
  const cardDescription = `Consultez les résultats finaux des votes et classements clôturés, ${sortDesc}.`;

  const rows = table.getRowModel().rows;
  const pageCount = Math.max(1, table.getPageCount());
  const firstResult = ranking ? pageIndex * PAGE_SIZE + 1 : 0;
  const lastResult = ranking
    ? Math.min((pageIndex + 1) * PAGE_SIZE, ranking.total)
    : 0;

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="size-5 text-muted-foreground" />
          <CardTitle className="text-xl font-bold">{cardTitle}</CardTitle>
        </div>
        <CardDescription>{cardDescription}</CardDescription>

        <div className="pt-2">
          <RankingArchiveFilterBar
            categories={categories}
            availablePeriods={sortedPeriods}
            selectedPeriodStart={selectedPeriodStart}
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
            onPeriodStartChange={setSelectedPeriodStart}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSelectedSort}
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
        ) : displayItems.length === 0 && !error ? (
          <RankingArchiveHasNoWork />
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const meta = header.column.columnDef.meta as CellMeta;
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(meta?.className)}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
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
                      const meta = cell.column.columnDef.meta as CellMeta;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(meta?.className)}
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

            {ranking && ranking.total > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Label className="text-xs text-muted-foreground order-2 sm:order-1">
                  Affichage de {firstResult} à {lastResult} sur {ranking.total}{" "}
                  œuvres archivées
                </Label>
                <Pagination className="order-1 sm:order-2 justify-end mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (table.getCanPreviousPage()) {
                            table.previousPage();
                          }
                        }}
                        aria-disabled={!table.getCanPreviousPage()}
                        className={cn(
                          !table.getCanPreviousPage() &&
                            "pointer-events-none opacity-50",
                        )}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-xs text-muted-foreground px-2">
                        Page {pageIndex + 1} sur {pageCount}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (table.getCanNextPage()) {
                            table.nextPage();
                          }
                        }}
                        aria-disabled={!table.getCanNextPage()}
                        className={cn(
                          !table.getCanNextPage() &&
                            "pointer-events-none opacity-50",
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RankingArchivesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground text-sm">
          Chargement des anciens classements...
        </div>
      }
    >
      <RankingArchivesContent />
    </Suspense>
  );
}
