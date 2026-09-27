import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TriangleAlert } from "lucide-react";

export default function WorkNotFoundGuard() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Work not found</EmptyTitle>
        <EmptyDescription>
          This work doesn&apos;t exist or has been removed.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
