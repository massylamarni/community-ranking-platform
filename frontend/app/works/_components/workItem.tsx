import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { votesRepository } from "@/repositories";
import { ApiErrorBody, VoteForWorkPayload, Work } from "@/types/api";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import Image from "next/image";
import { ReactNode, useState } from "react";

export function WorkItem({
  work,
  setWork,
  setSelectedWork,
  children,
}: {
  work: Work | null;
  setWork?: (work: Work) => void | undefined;
  setSelectedWork?: (w: Work | null) => void;
  children?: ReactNode;
}) {
  const [errors, setErrors] = useState<ApiErrorBody | null>(null);

  async function handleVote(vt: VoteForWorkPayload) {
    if (!work || !setWork) return;
    setErrors(null);

    try {
      const updated = await votesRepository.vote(work.id, vt);
      setWork(updated);
    } catch (err) {
      setErrors(err as ApiErrorBody);
    }
  }
  const disableVote = !setWork;

  if (!work) return;
  return (
    <Card className="max-w-3xl">
      <CardHeader
        onClick={() => (setSelectedWork ? setSelectedWork(work) : null)}
      >
        <CardTitle>{work.title}</CardTitle>
        <CardDescription>{work.description}</CardDescription>
      </CardHeader>
      {work.imageUrl && (
        <CardContent
          className="flex flex-col gap-3 max-w-none"
          onClick={() => (setSelectedWork ? setSelectedWork(work) : null)}
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
          {children}
        </CardContent>
      )}
      <CardFooter className="flex justify-between">
        <div className="flex gap-3">
          <ButtonGroup>
            <Button
              variant={work.currentUserVote === 1 ? "default" : "outline"}
              onClick={() => handleVote({ value: 1 })}
              disabled={disableVote}
            >
              <ArrowBigUp />
              {work.totalVotes - (work.totalVotes - work.score) / 2}
            </Button>
            <Button
              variant={work.currentUserVote === -1 ? "default" : "outline"}
              onClick={() => handleVote({ value: -1 })}
              disabled={disableVote}
            >
              <ArrowBigDown />
              {(work.totalVotes - work.score) / 2}
            </Button>
          </ButtonGroup>
        </div>
        <div className="flex justify-center items-center gap-2 w-fit">
          <Avatar>
            <AvatarFallback>
              {work.author.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>{work.author.username}</div>
        </div>
      </CardFooter>
    </Card>
  );
}
