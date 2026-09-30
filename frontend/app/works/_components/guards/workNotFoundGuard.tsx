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
        <EmptyTitle>Œuvre introuvable</EmptyTitle>
        <EmptyDescription>
          Cette œuvre n&apos;existe pas ou a été supprimée.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
