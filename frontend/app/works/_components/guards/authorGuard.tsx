import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TriangleAlert } from "lucide-react";

export default function AuthorGuard() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Vous ne pouvez pas modifier cette œuvre</EmptyTitle>
        <EmptyDescription>
          Vous n&apos;êtes pas l&apos;auteur de cette œuvre ; vous ne pouvez
          donc pas la modifier ni la supprimer.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
