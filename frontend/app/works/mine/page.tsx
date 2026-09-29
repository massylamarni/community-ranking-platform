"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWorks } from "@/hooks/use-work";
import type { WorkStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import LoadingGuard from "@/components/guards/loadingGuard";

const PAGE_SIZE = 10;
const FILTERS: { status: "all" | WorkStatus; label: string }[] = [
  { status: "all", label: "All" },
  { status: "created", label: "Created" },
  { status: "rejected", label: "Rejected" },
  { status: "pending", label: "In review" },
  { status: "approved", label: "Approved" },
];

function statusLabel(status: WorkStatus) {
  if (status === "pending") return "In review";
  return status[0].toUpperCase() + status.slice(1);
}

export default function MyWorks() {
  const router = useRouter();
  const { user, userLoading } = useAuth();
  const { works, list, loading, error } = useWorks();
  const [loaded, setLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | WorkStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/auth/login?from=/works/mine");
      return;
    }
    list()
      .then(() => setLoaded(true))
      .catch(() => setLoaded(true));
  }, [list, router, user, userLoading]);

  if (userLoading || (user && (loading || !loaded))) return <LoadingGuard />;
  if (!user) return null;

  const ownedWorks = works.filter(
    (work) => work.author.username === user.username,
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredWorks = ownedWorks.filter((work) => {
    const matchesStatus =
      statusFilter === "all" || work.status === statusFilter;
    const searchableText = [work.title, work.description, ...work.categories]
      .join(" ")
      .toLowerCase();
    return matchesStatus && searchableText.includes(normalizedSearch);
  });
  const pageCount = Math.max(1, Math.ceil(filteredWorks.length / PAGE_SIZE));
  const visibleWorks = filteredWorks.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const firstResult =
    filteredWorks.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(page * PAGE_SIZE, filteredWorks.length);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My works</h1>
        </div>
        <Button nativeButton={false} render={<Link href="/works/new" />}>
          Create work
        </Button>
      </header>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
      <div className="flex flex-col gap-4 border-y py-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search your works"
            placeholder="Search title, description, or category"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label="Filter works by status"
        >
          {FILTERS.map((filter) => {
            const count =
              filter.status === "all"
                ? ownedWorks.length
                : ownedWorks.filter((work) => work.status === filter.status)
                    .length;
            return (
              <Button
                key={filter.status}
                type="button"
                size="sm"
                variant={statusFilter === filter.status ? "default" : "outline"}
                aria-pressed={statusFilter === filter.status}
                onClick={() => {
                  setStatusFilter(filter.status);
                  setPage(1);
                }}
              >
                {filter.label}
                <Badge variant="secondary">{count}</Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <section aria-label="Your works">
        {visibleWorks.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {ownedWorks.length === 0
              ? "You haven't created any works yet."
              : "No works match these filters."}
          </p>
        ) : (
          <ul className="divide-y">
            {visibleWorks.map((work) => (
              <li
                key={work.id}
                className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-medium">{work.title}</h2>
                    <Badge
                      variant={
                        work.status === "rejected" ? "destructive" : "outline"
                      }
                    >
                      {statusLabel(work.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {work.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {work.categories.length
                      ? work.categories.join(" · ")
                      : "No categories"}
                    {` · ${work.totalVotes} votes`}
                  </p>
                  {work.status === "rejected" && (
                    <p className="mt-2 border-l-2 border-destructive/50 pl-2 text-sm text-muted-foreground">
                      Rejection reason unavailable.
                    </p>
                  )}
                </div>
                {work.status === "created" || work.status === "rejected" ? (
                  <Button
                    nativeButton={false}
                    render={
                      <Link href={`/works/${work.id}/edit`}>
                        <Pencil />
                        {work.status === "rejected"
                          ? "Revise work"
                          : "Continue draft"}
                      </Link>
                    }
                  />
                ) : (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={
                      <Link href={`/works/${work.id}`}>
                        <ArrowUpRight />
                        View work
                      </Link>
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {filteredWorks.length > PAGE_SIZE && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {firstResult}–{lastResult} of {filteredWorks.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-20 text-center text-sm">
              Page {page} of {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
            >
              <ChevronRight />
            </Button>
          </div>
        </footer>
      )}
    </main>
  );
}
