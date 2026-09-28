"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, isAdmin } from "@/hooks/use-auth";
import type { Work } from "@/types/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingGuard from "@/components/guards/loadingGuard";
import { WorkItem } from "../works/_components/workItem";
import { ModerationWorkCard } from "./_components/moderationWorkCard";
import { useModeration } from "@/hooks/use-moderation";

const PAGE_SIZE = 20;

export default function ModerationPage() {
  const { user, userLoading } = useAuth();
  const admin = isAdmin(user);

  const { pending, pendingWorks, accept, refuse } = useModeration();
  const works = pending?.items ?? [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [refusingId, setRefusingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await pendingWorks(1, PAGE_SIZE);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pendingWorks]);

  useEffect(() => {
    if (!userLoading && admin) {
      // eslint-disable-next-line
      load();
    }
  }, [userLoading, admin, load]);

  async function handleAccept(work: Work) {
    setAcceptingId(work.id);
    setError(null);
    try {
      await accept(work.id);
    } catch (err) {
      setError(err);
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleRefuse(work: Work, reason: string) {
    setRefusingId(work.id);
    setError(null);
    try {
      await refuse(work.id, {
        reason: reason.trim() || undefined,
      });
    } catch (err) {
      setError(err);
    } finally {
      setRefusingId(null);
    }
  }

  if (loading) return <LoadingGuard />;

  return (
    <div>
      {error ? <p role="alert">{String(error)}</p> : null}

      {works.length === 0 ? (
        <Card className="relative w-full max-w-sm">
          <CardHeader className="flex justify-center items-center">
            <CardTitle>Aucune œuvre en attente de modération.</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {works.map((work) => (
            <ModerationWorkCard
              key={work.id}
              work={work}
              onSelect={setSelectedWork}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
              accepting={acceptingId === work.id}
              refusing={refusingId === work.id}
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedWork}
        onOpenChange={(open) => !open && setSelectedWork(null)}
      >
        <DialogContent className="p-0 sm:max-w-lg">
          <WorkItem work={selectedWork} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
