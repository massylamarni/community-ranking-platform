import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TriangleAlert } from "lucide-react";

export default function ProfileNotFoundGuard() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Profil introuvable</EmptyTitle>
        <EmptyDescription>
          Ce profil n&apos;existe pas ou n&apos;est plus disponible.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
