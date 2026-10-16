import { BellOff } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NoNotification() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BellOff />
        </EmptyMedia>
        <EmptyTitle>Aucune notification</EmptyTitle>
        <EmptyDescription>
          Vous serez informé ici des événements qui vous concernent.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}