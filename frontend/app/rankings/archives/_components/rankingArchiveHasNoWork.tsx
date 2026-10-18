import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { History } from "lucide-react";

export default function RankingArchiveHasNoWork() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <History />
        </EmptyMedia>
        <EmptyTitle>Aucun classement archivé</EmptyTitle>
        <EmptyDescription>
          Aucun résultat archivé n&apos;a été trouvé pour la période et les critères sélectionnés.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
