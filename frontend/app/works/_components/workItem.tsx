import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { votesRepository } from "@/repositories";
import { VoteForWorkReponse, Work } from "@/types/api";
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { CommentSection } from "../../comments/_components/commentSection";
import WorkNotFoundGuard from "./guards/workNotFoundGuard";
import Link from "next/link";
import { ApiError } from "@/lib/errors";
import { useApi } from "@/hooks";

export type WorkLike = Pick<
  Work,
  "id" | "title" | "imageUrl" | "totalVotes" | "score"
> &
  Partial<Pick<Work, "description" | "author">>;

export function WorkItem<T extends WorkLike = Work>({
  work,
  setWork,
  // setSelectedWork,
  children,
  statusChildren,
  showComments = true,
  // initialError,
}: {
  work: T | null;
  setWork?: (work: Work) => void | undefined;
  setSelectedWork?: (w: T | null) => void;
  children?: ReactNode;
  statusChildren?: ReactNode;
  showComments?: boolean;
  initialError?: ApiError | null;
}) {
  const { user } = useAuth();
  const { run, loading } = useApi();
  const [vote, setVote] = useState<VoteForWorkReponse | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  async function handleVote(vt: 1 | -1) {
    if (!work || !setWork) return;

    const next = vote?.value === vt ? null : vt;
    const result = await run(votesRepository.vote(work.id, { value: next }), {
      error: "Échec de l'enregistrement du vote",
    });

    if (result.ok) {
      setWork(result.data.oeuvre);
      setVote(result.data);
    }
  }
  const disableVote = !setWork || !user || !loading;
  const handleCardClick = undefined; //() => setSelectedWork ? setSelectedWork(work) : null;

  if (!work) return <WorkNotFoundGuard />;
  return (
    <Card className="max-w-3xl gap-0">
      <CardHeader className="pb-(--card-spacing)" onClick={handleCardClick}>
        <CardTitle>{work.title}</CardTitle>
        <CardDescription>{work.description}</CardDescription>
        <CardAction>
          {work.author && (
            <Button
              type="button"
              variant="ghost"
              nativeButton={false}
              className="flex justify-center items-center gap-2 w-fit p-0 hover:bg-transparent"
              render={<Link href={`/profiles/${work.author.id}`} />}
            >
              <Avatar>
                <AvatarFallback>
                  {work.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>{work.author.username}</div>
            </Button>
          )}
        </CardAction>
      </CardHeader>
      {work.imageUrl && (
        <CardContent
          className="flex flex-col gap-3 max-w-none pb-(--card-spacing)"
          onClick={handleCardClick}
        >
          <div className="relative aspect-4/3 overflow-hidden rounded-md border bg-black">
            <Image
              src={work.imageUrl}
              alt={work.title}
              fill
              sizes="(max-width: 768px) 100vw, 512px"
              className="object-contain"
            />
          </div>
        </CardContent>
      )}
      {children && <CardContent>{children}</CardContent>}
      <CardFooter className="flex justify-between">
        <div className="flex gap-3">
          <ButtonGroup>
            <Button
              variant={vote?.value === 1 ? "default" : "outline"}
              onClick={() => handleVote(1)}
              disabled={disableVote}
              aria-label="Upvote"
            >
              <ArrowBigUp />
              {work.totalVotes - (work.totalVotes - work.score) / 2}
            </Button>
            <Button
              variant={vote?.value === -1 ? "default" : "outline"}
              onClick={() => handleVote(-1)}
              disabled={disableVote}
              aria-label="Downvote"
            >
              <ArrowBigDown />
              {(work.totalVotes - work.score) / 2}
            </Button>
          </ButtonGroup>
          {showComments && (
            <Button
              variant={commentsOpen ? "secondary" : "outline"}
              onClick={() => setCommentsOpen((v) => !v)}
              aria-expanded={commentsOpen}
            >
              <MessageSquare />
              Comments
            </Button>
          )}
        </div>
        {statusChildren}
      </CardFooter>
      {showComments && commentsOpen && (
        <CardFooter className="justify-start">
          <CommentSection
            workId={work.id}
            workAuthor={work.author?.username ?? "Unknown"}
            currentUser={user?.username}
            isAdmin={user?.role === "admin"}
          />
        </CardFooter>
      )}
    </Card>
  );
}
