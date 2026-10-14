"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "cn";
import { rankingsRepository } from "@/repositories/rankings.repository";
import type { RankingEntry, RankingPage } from "@/types/api";
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

export default function RankingsPage() {
  const [ranking, setRanking] = useState<RankingPage | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { pageIndex } = pagination;

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line
    setLoading(true);
    setError(null);

    rankingsRepository
      .listGlobal(pageIndex + 1, PAGE_SIZE)
      .then((data) => {
        if (!cancelled) setRanking(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Impossible de charger le classement global. Veuillez vérifier votre connexion ou réessayer.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageIndex, reloadKey]);

  const table = useTable({
    features,
    data: ranking?.items ?? [],
    columns,
    manualPagination: true,
    rowCount: ranking?.total ?? 0,
    state: { pagination },
    onPaginationChange: setPagination,
  });

  if (loading && !ranking) return <LoadingGuard />;

  if (error) {
    return (
      <Alert variant="destructive" className="w-full max-w-4xl">
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
    );
  }

  if (!ranking || ranking.total === 0) return <RankingHasNoWork />;

  const rows = table.getRowModel().rows;
  const pageCount = Math.max(1, table.getPageCount());
  const firstResult = pageIndex * PAGE_SIZE + 1;
  const lastResult = Math.min((pageIndex + 1) * PAGE_SIZE, ranking.total);

  return (
    <Card className="min-w-0 w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Classement global
        </CardTitle>
        <CardDescription>
          Découvrez les meilleures œuvres publiées toutes catégories confondues,
          triées par score.
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 max-w-none flex flex-col gap-4">
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
                        (header.column.columnDef.meta as CellMeta | undefined)
                          ?.className
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
                        (cell.column.columnDef.meta as CellMeta | undefined)
                          ?.className
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
          <div className="flex justify-between">
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
      </CardContent>
    </Card>
  );
}
