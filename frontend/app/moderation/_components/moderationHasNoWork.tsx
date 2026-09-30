import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Info } from "lucide-react";

export default function ModerationHasNoWork() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Info />
        </EmptyMedia>
        <EmptyTitle>Rien ici pour le moment</EmptyTitle>
        <EmptyDescription>
          Aucune œuvre n&apos;a encore été soumise pour examen.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
