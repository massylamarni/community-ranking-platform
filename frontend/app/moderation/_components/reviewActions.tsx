import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Work } from "@/types/api";
import { useState } from "react";

type ReviewActionsProps = {
  work: Work;
  accepting: boolean;
  refusing: boolean;
  onAccept: (work: Work) => void;
  onRefuse: (work: Work, reason: string) => void;
};

export default function ReviewActions({
  work,
  accepting,
  refusing,
  onAccept,
  onRefuse,
}: ReviewActionsProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div className="flex gap-2">
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          setReason("");
        }}
      >
        <PopoverTrigger render={<Button variant="outline">Refuser</Button>} />
        <PopoverContent className="w-64" align="end">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`reason-${work.id}`}>Motif (optionnel)</Label>
            <Input
              id={`reason-${work.id}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
            <Button
              variant="destructive"
              disabled={refusing}
              onClick={() => onRefuse(work, reason)}
            >
              {refusing ? "..." : "Confirmer le refus"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button disabled={accepting} onClick={() => onAccept(work)}>
        {accepting ? "..." : "Accepter"}
      </Button>
    </div>
  );
}
