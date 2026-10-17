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
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "cn";
import { categoriesRepository } from "@/repositories/categories.repository";
import { rankingsRepository } from "@/repositories/rankings.repository";
import type {
  Category,
  RankingEntry,
  RankingPage,
  RankingPeriod,
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
import RankingFilterBar from "./_components/rankingFilterBar";
import RankingHasNoWork from "./_components/rankingHasNoWork";

type CellMeta = { className?: string };

const features = tableFeatures({ rowPaginationFeature });

const PAGE_SIZE = 10;

const columns: ColumnDef<typeof features, RankingEntry>[] = [
  {
    accessorKey: "position",
    header: "Position",
    meta: { className: "w-24 text-center" } as CellMeta,
    cell: ({ row }) => (
      <Badge variant="secondary">#{row.original.position}</Badge>
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
    accessorFn: (entry) => entry.categories.join(" "),
    meta: { className: "w-70 hidden md:table-cell" } as CellMeta,
    cell: ({ row }) =>
      row.original.categories.length ? (
        <ScrollArea>
          {row.original.categories.map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
        </ScrollArea>
      ) : (
        <Badge variant="ghost">Général</Badge>
      ),
  },
  {
    accessorKey: "score",
    header: "Score",
    meta: { className: "w-24 text-center tabular-nums" } as CellMeta,
  },
];

function normalizePeriod(param: string | null): RankingPeriod {
  if (!param) return "all";
  const p = param.trim().toLowerCase();
  if (p === "semaine" || p === "week") return "week";
  if (p === "mois" || p === "month") return "month";
  if (p === "jour" || p === "day") return "day";
  return "all";
}

function RankingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const urlCategory =
    searchParams.get("category") ?? searchParams.get("categoryId") ?? "all";
  const urlPeriod = normalizePeriod(searchParams.get("period"));

  // Form selections
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedPeriod, setSelectedPeriod] =
    useState<RankingPeriod>(urlPeriod);

  // Load available categories once on mount
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

  // Adjust state when URL query parameters change (React recommended pattern for state derived from props/URL)
  const [prevParams, setPrevParams] = useState({ urlCategory, urlPeriod });
  if (
    prevParams.urlCategory !== urlCategory ||
    prevParams.urlPeriod !== urlPeriod
  ) {
    setPrevParams({ urlCategory, urlPeriod });
    setSelectedCategory(urlCategory);
    setSelectedPeriod(urlPeriod);
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
    );
  }

  // Fetch ranking data
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    rankingsRepository
      .list({
        categoryId: resolvedCategoryId,
        period: urlPeriod !== "all" ? urlPeriod : undefined,
        page: pageIndex + 1,
        pageSize: PAGE_SIZE,
      })
      .then((data) => {
        if (!cancelled) setRanking(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Impossible de charger le classement. Veuillez vérifier votre connexion ou réessayer.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedCategoryId, urlPeriod, pageIndex, reloadKey]);

  function handleFilterSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    if (selectedPeriod && selectedPeriod !== "all") {
      params.set("period", selectedPeriod);
    }

    const qs = params.toString();
    router.push(qs ? `/rankings?${qs}` : "/rankings");
  }

  function handleReset() {
    setSelectedCategory("all");
    setSelectedPeriod("all");
    router.push("/rankings");
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
    ? `Classement : ${activeCategoryObj.name}`
    : "Classement global";

  const periodDescriptions: Record<string, string> = {
    day: "du jour (votes d'aujourd'hui uniquement)",
    week: "de la semaine (votes des 7 derniers jours uniquement)",
    month: "du mois en cours (votes du mois uniquement)",
  };
  const periodDesc = periodDescriptions[urlPeriod];
  const cardDescription = periodDesc
    ? `Découvrez les meilleures œuvres ${periodDesc}, triées par score.`
    : "Découvrez les meilleures œuvres publiées toutes catégories confondues, triées par score.";

  const rows = table.getRowModel().rows;
  const pageCount = Math.max(1, table.getPageCount());
  const firstResult = ranking ? pageIndex * PAGE_SIZE + 1 : 0;
  const lastResult = ranking
    ? Math.min((pageIndex + 1) * PAGE_SIZE, ranking.total)
    : 0;

  return (
    <Card className="min-w-0 w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 max-w-none flex flex-col gap-6">
        <RankingFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          selectedPeriod={selectedPeriod}
          onCategoryChange={setSelectedCategory}
          onPeriodChange={setSelectedPeriod}
          onSubmit={handleFilterSubmit}
          onReset={handleReset}
          loading={loading}
        />

        {loading && !ranking ? (
          <LoadingGuard />
        ) : error ? (
          <Alert variant="destructive" className="w-full">
            <AlertCircle />
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                <RefreshCw />
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        ) : !ranking || ranking.total === 0 ? (
          <RankingHasNoWork />
        ) : (
          <>
            <div
              className={cn("border rounded-md", loading && "opacity-60")}
              aria-busy={loading}
            >
              <Table className="table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={
                            (
                              header.column.columnDef.meta as
                                | CellMeta
                                | undefined
                            )?.className
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getAllCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            (
                              cell.column.columnDef.meta as
                                | CellMeta
                                | undefined
                            )?.className
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {ranking.total > PAGE_SIZE && (
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

export default function RankingsPage() {
  return (
    <Suspense fallback={<LoadingGuard />}>
      <RankingsContent />
    </Suspense>
  );
}
