import Image from "next/image";
import Link from "next/link";
import { Reply } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicProfileComment } from "@/types/api";

export function ProfileCommentItem({
  comment,
}: {
  comment: PublicProfileComment;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Link href={`/works/${comment.oeuvreId}`} className="hover:underline">
            {comment.oeuvreTitle}
          </Link>

          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </CardTitle>
        <CardAction>
          {comment.parentCommentId !== null && (
            <Badge variant="secondary">
              <Reply />
              Réponse
            </Badge>
          )}
        </CardAction>
        <CardDescription className="flex flex-col gap-2 text-accent-foreground">
          <p className="whitespace-pre-wrap wrap-break-word">
            {comment.content}
          </p>
          {comment.imageUrl && (
            <div className="relative aspect-4/3 w-full max-w-xs overflow-hidden rounded-md bg-black">
              <Image
                src={comment.imageUrl}
                alt="Pièce jointe du commentaire"
                fill
                sizes="320px"
                className="object-contain"
              />
            </div>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
