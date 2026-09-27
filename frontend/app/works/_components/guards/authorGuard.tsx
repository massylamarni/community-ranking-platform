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
        <EmptyTitle>You can&apos;t edit this work</EmptyTitle>
        <EmptyDescription>
          You are not the author of this work, so you can&apos;t edit or delete
          it.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
