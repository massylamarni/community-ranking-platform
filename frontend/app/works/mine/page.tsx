"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  SearchIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWorks } from "@/hooks/use-work";
import type { WorkStatus } from "@/types/api";
import LoadingGuard from "@/components/guards/loadingGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoPersonalWork from "../_components/noPersonalWork";
import FilterHasNoWork from "../_components/filterHasNoWork";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "cn";
import { Label } from "@/components/ui/label";

type Work = ReturnType<typeof useWorks>["works"][number];
type StatusFilter = "all" | WorkStatus;
type CellMeta = { className?: string };

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

const PAGE_SIZE = 10;

const FILTERS: { status: StatusFilter; label: string }[] = [
  { status: "all", label: "Toutes" },
  { status: "created", label: "Créées" },
  { status: "rejected", label: "Refusées" },
  { status: "pending", label: "En examen" },
  { status: "approved", label: "Approuvées" },
];

function statusLabel(status: WorkStatus) {
  if (status === "pending") return "En examen";
  if (status === "created") return "Créée";
  if (status === "rejected") return "Refusée";
  return "Approuvée";
}

const columns: ColumnDef<typeof features, Work>[] = [
  {
    accessorKey: "title",
    header: "Œuvre",
    meta: { className: "whitespace-normal" } as CellMeta,
    cell: ({ row }) => {
      const work = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="truncate font-medium">{work.title}</span>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {work.description}
          </p>
          {work.status === "rejected" && (
            <p className="text-sm text-destructive">
              Motif du refus indisponible.
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    meta: { className: "w-32" } as CellMeta,
    filterFn: (row, columnId, value) => row.getValue(columnId) === value,
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "rejected" ? "destructive" : "outline"}
      >
        {statusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    id: "categories",
    header: "Catégories",
    accessorFn: (work) => work.categories.join(" "),
    meta: { className: "w-32 hidden md:table-cell" } as CellMeta,
    cell: ({ row }) =>
      row.original.categories.length ? (
        <ScrollArea>
          {row.original.categories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </ScrollArea>
      ) : (
        <Badge variant="ghost">Aucune</Badge>
      ),
  },
  {
    accessorKey: "totalVotes",
    header: "Votes",
    meta: {
      className: "w-20 hidden text-center tabular-nums sm:table-cell",
    } as CellMeta,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { className: "w-32 text-right" } as CellMeta,
    cell: ({ row }) => {
      const work = row.original;
      const isEditable =
        work.status === "created" || work.status === "rejected";

      return isEditable ? (
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href={`/works/${work.id}/edit`}>
              <Pencil />
              {work.status === "rejected" ? "Modifier" : "Continuer"}
            </Link>
          }
        />
      ) : (
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={
            <Link href={`/works/${work.id}`}>
              <ArrowUpRight />
              Voir
            </Link>
          }
        />
      );
    },
  },
];

export default function MyWorks() {
  const router = useRouter();
  const { user, userLoading } = useAuth();
  const { works, list, loading: workLoading, error } = useWorks();
  const [isLoading, setIsLoading] = useState(true);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/auth/login?from=/works/mine");
      return;
    }
    list()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [list, router, user, userLoading]);

  const ownedWorks = useMemo(
    () => works.filter((work) => work.author.username === user?.username),
    [works, user?.username],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: ownedWorks.length };
    for (const work of ownedWorks) {
      result[work.status] = (result[work.status] ?? 0) + 1;
    }
    return result;
  }, [ownedWorks]);

  const table = useTable({
    features,
    data: ownedWorks,
    columns,
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value: string) => {
      const work = row.original;
      return [work.title, work.description, ...work.categories]
        .join(" ")
        .toLowerCase()
        .includes(value.trim().toLowerCase());
    },
    initialState: { pagination: { pageIndex: 0, pageSize: PAGE_SIZE } },
  });

  if (userLoading || (user && (workLoading || isLoading)))
    return <LoadingGuard />;
  if (!user) return null;

  const statusColumn = table.getColumn("status");
  const statusFilter =
    (statusColumn?.getFilterValue() as StatusFilter) ?? "all";

  const rows = table.getRowModel().rows;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.state.pagination;
  const pageCount = Math.max(1, table.getPageCount());
  const firstResult = totalFiltered === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const lastResult = Math.min((pageIndex + 1) * PAGE_SIZE, totalFiltered);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Mes œuvres</CardTitle>
        <CardAction>
          <Button nativeButton={false} render={<Link href="/works/new" />}>
            Créer une œuvre
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="min-w-0 max-w-none flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error.message}
          </p>
        )}

        <div className="flex min-w-0 flex-col gap-4">
          <InputGroup className="w-full max-w-md">
            <InputGroupAddon>
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Rechercher un titre, une description ou une catégorie"
              aria-label="Rechercher dans vos œuvres"
              value={globalFilter}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
            />
          </InputGroup>

          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              statusColumn?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <TabsList className="w-full justify-start overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
              {FILTERS.map((filter) => (
                <TabsTrigger key={filter.status} value={filter.status}>
                  {filter.label}
                  <Badge variant="secondary">
                    {counts[filter.status] ?? 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="border rounded-md">
          {rows.length === 0 ? (
            ownedWorks.length === 0 ? (
              <NoPersonalWork />
            ) : (
              <FilterHasNoWork />
            )
          ) : (
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
          )}
        </div>

        {totalFiltered > PAGE_SIZE && (
          <div className="flex justify-between">
            <Label className="pl-1">
              Affichage de {firstResult} à {lastResult} sur {totalFiltered}
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
