import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export function ProfileEmpty({ text }: { text: string }) {
  return (
    <Empty className="w-full border">
      <EmptyHeader>
        <EmptyTitle className="text-base font-normal text-muted-foreground">
          {text}
        </EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
