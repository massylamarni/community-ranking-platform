"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWorks } from "@/hooks/use-work";
import type { Work, WorkStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingGuard from "@/components/guards/loadingGuard";
import { WorkItem } from "../_components/workItem";

const SECTIONS: { status: WorkStatus; title: string; empty: string }[] = [
  {
    status: "created",
    title: "Created",
    empty: "Your drafts will appear here.",
  },
  {
    status: "rejected",
    title: "Rejected",
    empty: "Rejected works that can be revised will appear here.",
  },
  {
    status: "pending",
    title: "In review",
    empty: "Works awaiting review will appear here.",
  },
  {
    status: "approved",
    title: "Approved",
    empty: "Your approved works will appear here.",
  },
];

function statusLabel(status: WorkStatus) {
  return status === "pending" ? "In review" : status;
}

function WorkSection({
  title,
  empty,
  works,
}: {
  title: string;
  empty: string;
  works: Work[];
}) {
  return (
    <section className="w-full border-t pt-5">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary">{works.length}</Badge>
      </div>
      {works.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex w-full flex-col gap-4">
          {works.map((work) => (
            <div key={work.id} className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate font-medium">{work.title}</h3>
                  <Badge variant="outline">{statusLabel(work.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {work.categories.length
                    ? work.categories.join(", ")
                    : "No categories"}
                </p>
              </div>
              <WorkItem work={work} />
              <div className="flex justify-end">
                <div className="flex justify-end gap-2">
                  {work.status === "created" || work.status === "rejected" ? (
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/works/${work.id}/edit`}>
                          <Pencil />
                          {work.status === "rejected"
                            ? "Edit & publish"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function MyWorksPage() {
  const router = useRouter();
  const { user, userLoading } = useAuth();
  const { works, list, loading, error } = useWorks();
  const [loaded, setLoaded] = useState(false);

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{user.username}</p>
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
      {SECTIONS.map((section) => (
        <WorkSection
          key={section.status}
          title={section.title}
          empty={section.empty}
          works={ownedWorks.filter((work) => work.status === section.status)}
        />
      ))}
    </main>
  );
}
