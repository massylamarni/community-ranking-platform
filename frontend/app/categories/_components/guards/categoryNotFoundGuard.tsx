import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TriangleAlert } from "lucide-react";

export default function CategoryNotFoundGuard() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Category not found</EmptyTitle>
        <EmptyDescription>
          This category doesn&apos;t exist or has been removed.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
