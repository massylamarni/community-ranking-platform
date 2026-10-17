import type { PublicProfileComment } from "@/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ProfileComments({
  comments,
}: {
  comments: PublicProfileComment[];
}) {
  if (comments.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Aucun commentaire</EmptyTitle>
          <EmptyDescription>
            Ce profil n&apos;a pas encore publié de commentaire.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {comments.map((comment) => (
        <Card key={comment.commentId}>
          <CardHeader>
            <CardTitle className="text-sm">{comment.oeuvreTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{comment.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
