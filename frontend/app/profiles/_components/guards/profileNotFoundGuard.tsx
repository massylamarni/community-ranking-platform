import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { UserX } from "lucide-react";

export default function ProfileNotFoundGuard() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserX />
        </EmptyMedia>
        <EmptyTitle>Profil introuvable</EmptyTitle>
        <EmptyDescription>
          Cet utilisateur n&apos;existe pas ou son profil n&apos;est plus
          disponible.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
