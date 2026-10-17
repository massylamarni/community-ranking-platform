"use client";

import { useMemo, useState } from "react";
import type {
  PublicProfile,
  PublicProfileVotedWork,
  PublicProfileWork,
  Work,
} from "@/types/api";
import { WorkList } from "@/app/works/_components/workList";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProfileComments from "./profileComments";
import ProfilePagination from "./profilePagination";

const PAGE_SIZE = 6;

function toWork(
  work: PublicProfileWork | PublicProfileVotedWork,
  username: string,
): Work {
  return {
    id: work.oeuvreId,
    title: work.title,
    description: "description" in work ? work.description ?? "" : "",
    imageUrl: work.imageUrl,
    author: username,
    categories: [],
    status: "approved",
    score: work.score,
    totalVotes: 0,
    createdAt: "createdAt" in work ? work.createdAt : undefined,
  };
}

function pageItems<T>(items: T[], page: number) {
  return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

export default function ProfileActivityTabs({
  profile,
}: {
  profile: PublicProfile;
}) {
  const [worksPage, setWorksPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);

  const works = useMemo(
    () =>
      pageItems(profile.publishedWorks, worksPage).map((work) =>
        toWork(work, profile.username),
      ),
    [profile, worksPage],
  );
  const comments = useMemo(
    () => pageItems(profile.comments, commentsPage),
    [profile.comments, commentsPage],
  );
  const favorites = useMemo(
    () =>
      pageItems(profile.votedWorks, favoritesPage).map((work) =>
        toWork(work, profile.username),
      ),
    [profile, favoritesPage],
  );

  return (
    <Tabs defaultValue="works">
      <TabsList>
        <TabsTrigger value="works">
          Œuvres ({profile.publishedWorks.length})
        </TabsTrigger>
        <TabsTrigger value="comments">
          Commentaires ({profile.comments.length})
        </TabsTrigger>
        <TabsTrigger value="favorites">
          Favoris ({profile.votedWorks.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="works">
        <WorkList
          works={works}
          setWorks={() => undefined}
          setSelectedWork={() => undefined}
          username={profile.username}
        />
        <ProfilePagination
          page={worksPage}
          total={profile.publishedWorks.length}
          pageSize={PAGE_SIZE}
          onPageChange={setWorksPage}
        />
      </TabsContent>

      <TabsContent value="comments">
        <ProfileComments comments={comments} />
        <ProfilePagination
          page={commentsPage}
          total={profile.comments.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCommentsPage}
        />
      </TabsContent>

      <TabsContent value="favorites">
        <WorkList
          works={favorites}
          setWorks={() => undefined}
          setSelectedWork={() => undefined}
          username={profile.username}
        />
        <ProfilePagination
          page={favoritesPage}
          total={profile.votedWorks.length}
          pageSize={PAGE_SIZE}
          onPageChange={setFavoritesPage}
        />
      </TabsContent>
    </Tabs>
  );
}
