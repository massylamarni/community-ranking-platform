import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Work } from "@/types/api";
import Image from "next/image";

export function WorkItem({
  work,
  setSelectedWork,
}: {
  work: Work;
  setSelectedWork: (w: Work) => void;
}) {
  return (
    <Card
      className="relative w-full max-w-sm"
      onClick={() => setSelectedWork(work)}
    >
      <CardHeader>
        <CardTitle>{work.title}</CardTitle>
        <CardDescription>{work.description}</CardDescription>
      </CardHeader>
      {work.imageUrl && <Image src={work.imageUrl} alt={work.title} />}
      <CardFooter className="flex justify-between">
        <div>
          score {work.score} ({work.totalVotes} votes)
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
