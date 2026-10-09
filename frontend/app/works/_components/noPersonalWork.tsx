import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Info } from "lucide-react";

export default function NoPersonalWork() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Info />
        </EmptyMedia>
        <EmptyTitle>Rien ici pour le moment</EmptyTitle>
        <EmptyDescription>
          Vous n&apos;avez encore créé aucune œuvre.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
