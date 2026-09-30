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
        <EmptyTitle>Catégorie introuvable</EmptyTitle>
        <EmptyDescription>
          Cette catégorie n&apos;existe pas ou a été supprimée.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
