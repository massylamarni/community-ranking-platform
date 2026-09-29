import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Work } from "@/types/api";

export function ModerationWorkCard({
  work,
  onSelect,
  onAccept,
  onRefuse,
  accepting,
  refusing,
}: {
  work: Work;
  onSelect: (work: Work) => void;
  onAccept: (work: Work) => void | Promise<void>;
  onRefuse: (work: Work, reason: string) => void | Promise<void>;
  accepting: boolean;
  refusing: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <Card className="relative w-full max-w-lg">
      <CardHeader onClick={() => onSelect(work)}>
        <CardTitle>{work.title}</CardTitle>
        <CardDescription>{work.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {work.author.username}
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={accepting} onClick={() => onAccept(work)}>
            {accepting ? "..." : "Accepter"}
          </Button>
          <Popover
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              setReason("");
            }}
          >
            <PopoverTrigger
              render={
                <Button size="sm" variant="destructive">
                  Refuser
                </Button>
              }
            />
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
                  size="sm"
                  variant="destructive"
                  disabled={refusing}
                  onClick={() => onRefuse(work, reason)}
                >
                  {refusing ? "..." : "Confirmer le refus"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardFooter>
    </Card>
  );
}