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
import { useApi } from "@/hooks";

const PAGE_SIZE = 20;

export default function ModerationPage() {
  const { user, userLoading } = useAuth();
  const { run, loading, error } = useApi();
  const admin = isAdmin(user);

  const { pending, pendingWorks, accept, refuse } = useModeration();
  const works = pending?.items ?? [];

  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [refusingId, setRefusingId] = useState<number | null>(null);

  const load = useCallback(
    () =>
      run(pendingWorks(1, PAGE_SIZE), {
        error: "Échec du chargement des œuvres en attente",
      }),
    [run, pendingWorks],
  );

  useEffect(() => {
    if (userLoading || !admin) return;
    load();
  }, [userLoading, admin, load]);

  async function handleAccept(work: Work) {
    setAcceptingId(work.id);
    await run(accept(work.id), {
      loading: "Acceptation de l'œuvre...",
      success: "Œuvre accepté",
      error: "Échec de l'acceptation de l'œuvre",
    });
    setAcceptingId(null);
  }

  async function handleRefuse(work: Work, reason: string) {
    setRefusingId(work.id);
    await run(refuse(work.id, { reason: reason.trim() || undefined }), {
      loading: "Refus de l'œuvre...",
      success: "Œuvre refusé",
      error: "Échec du refus de l'œuvre",
    });
    setRefusingId(null);
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
              initialError={error}
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
