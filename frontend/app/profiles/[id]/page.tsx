"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingGuard from "@/components/guards/loadingGuard";
import { useProfile } from "@/hooks/use-public-profile";
import type {
  ApiErrorBody,
  PublicProfileVotedWork,
  PublicProfileWork,
  Work,
} from "@/types/api";
import { WorkItem } from "@/app/works/_components/workItem";
import ProfileNotFoundGuard from "../_components/guards/profileNotFoundGuard";
import { ProfileEmpty } from "../_components/profileEmpty";
import { ProfileCommentItem } from "../_components/profileCommentItem";

const fromPublishedWork = (
  w: PublicProfileWork,
  author: { id: number; username: string },
) => ({
  id: w.oeuvreId,
  title: w.title,
  description: w.description ?? undefined,
  imageUrl: w.imageUrl,
  score: w.score,
  totalVotes: w.totalVotes,
  author,
});

const fromVotedWork = (w: PublicProfileVotedWork) => ({
  id: w.oeuvreId,
  title: w.title,
  imageUrl: w.imageUrl,
  score: w.score,
  totalVotes: w.totalVotes,
});

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const validId = Number.isInteger(userId) && userId >= 1;

  const { profile, error, getPublicProfile } = useProfile();
  const [notFoundId, setNotFoundId] = useState<number | null>(null);

  // Vote results patched on top of the loaded profile.
  // `source` ties them to the profile they were made against,
  // so a fresh fetch invalidates them without an effect.
  const [overrides, setOverrides] = useState<{
    source: typeof profile;
    byId: Record<number, Pick<Work, "score" | "totalVotes">>;
  }>({ source: null, byId: {} });

  useEffect(() => {
    if (!validId) return;
    getPublicProfile(userId).catch((err) => {
      const status = (err as ApiErrorBody | undefined)?.status;
      if (status === 404 || status === 400) setNotFoundId(userId);
    });
  }, [userId, validId, getPublicProfile]);

  if (!validId || notFoundId === userId) return <ProfileNotFoundGuard />;

  const current = profile?.userId === userId ? profile : null;

  if (!current) {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Impossible de charger ce profil. Veuillez réessayer plus tard.
          </AlertDescription>
        </Alert>
      );
    }
    return <LoadingGuard />;
  }

  const byId = overrides.source === profile ? overrides.byId : {};
  const withVotes = <T extends { oeuvreId: number }>(w: T): T => ({
    ...w,
    ...byId[w.oeuvreId],
  });

  const publishedWorks = current.publishedWorks.map(withVotes);
  const votedWorks = current.votedWorks.map(withVotes);
  const favorites = votedWorks.filter((w) => w.voteValue === 1);

  const openWork = (w: { id: number } | null) => {
    if (w) router.push(`/works/${w.id}`);
  };

  const handleSetWork = (updated: Work) => {
    setOverrides((prev) => ({
      source: profile,
      byId: {
        ...(prev.source === profile ? prev.byId : {}),
        [updated.id]: { score: updated.score, totalVotes: updated.totalVotes },
      },
    }));
  };

  return (
    <Card className="min-w-0 max-w-3xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">
              {current.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{current.username}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="min-w-0 max-w-none flex flex-col gap-4">
        <Tabs defaultValue="works">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="works">
              Œuvres
              <Badge variant="secondary">{publishedWorks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="comments">
              Commentaires
              <Badge variant="secondary">{current.comments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="favorites">
              Favoris
              <Badge variant="secondary">{favorites.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="works" className="flex flex-col gap-4">
            {publishedWorks.length === 0 ? (
              <ProfileEmpty text="Aucune œuvre publiée pour le moment." />
            ) : (
              publishedWorks.map((w) => (
                <WorkItem
                  key={w.oeuvreId}
                  work={fromPublishedWork(w, {
                    id: current.userId,
                    username: current.username,
                  })}
                  setWork={handleSetWork}
                  setSelectedWork={openWork}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="flex flex-col gap-4">
            {current.comments.length === 0 ? (
              <ProfileEmpty text="Aucun commentaire pour le moment." />
            ) : (
              current.comments.map((c) => (
                <ProfileCommentItem key={c.commentId} comment={c} />
              ))
            )}
          </TabsContent>

          <TabsContent value="favorites" className="flex flex-col gap-4">
            {favorites.length === 0 ? (
              <ProfileEmpty text="Aucun favori pour le moment." />
            ) : (
              favorites.map((w) => (
                <WorkItem
                  key={w.oeuvreId}
                  work={fromVotedWork(w)}
                  setWork={handleSetWork}
                  setSelectedWork={openWork}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
