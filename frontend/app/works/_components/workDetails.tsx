import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Work } from "@/types/api";
import Image from "next/image";

export function WorkDetails({
  work,
  isAuthor,
}: {
  work: Work | null;
  isAuthor: boolean;
}) {
  if (!work) return;
  return (
    <Card className="relative w-full max-w-sm">
      <CardHeader>
        <CardTitle>{work.title}</CardTitle>
        <CardDescription>{work.description}</CardDescription>
      </CardHeader>
      {work.imageUrl && <Image src={work.imageUrl} alt={work.title} />}
      {isAuthor && <CardContent>Manage this work</CardContent>}
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
