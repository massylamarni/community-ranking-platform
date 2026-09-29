"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, isAdmin } from "@/hooks/use-auth";
import type { Work } from "@/types/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingGuard from "@/components/guards/loadingGuard";
import { WorkItem } from "../works/_components/workItem";
import { useModeration } from "@/hooks/use-moderation";
import ModerationHasNoWork from "./_components/moderationHasNoWork";

import { WorksContainer } from "../works/_components/worksContainer";
import ReviewActions from "./_components/reviewActions";

const PAGE_SIZE = 20;

export default function ModerationPage() {
  const { user, userLoading } = useAuth();
  const admin = isAdmin(user);

  const { pending, pendingWorks, accept, refuse } = useModeration();
  const works = pending?.items ?? [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [refusingId, setRefusingId] = useState<number | null>(null);

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
    if (userLoading || !admin) return;
    // eslint-disable-next-line
    load();
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
  if (works.length === 0) return <ModerationHasNoWork />;
  return (
    <>
      <WorksContainer>
        {works.map((work) => {
          return (
            <WorkItem
              key={work.id}
              work={work}
              setSelectedWork={setSelectedWork}
              statusChildren={
                <ReviewActions
                  work={work}
                  accepting={acceptingId === work.id}
                  refusing={refusingId === work.id}
                  onAccept={handleAccept}
                  onRefuse={handleRefuse}
                />
              }
            />
          );
        })}
      </WorksContainer>

      <Dialog
        open={!!selectedWork}
        onOpenChange={(open) => !open && setSelectedWork(null)}
      >
        <DialogContent className="p-0 sm:max-w-lg">
          <WorkItem work={selectedWork} />
        </DialogContent>
      </Dialog>
    </>
  );
}
