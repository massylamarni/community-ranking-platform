import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NotificationError({
  error,
  title,
}: {
  error: unknown;
  title?: string;
}) {
  return (
    <Alert variant="destructive">
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        {error instanceof Error ? error.message : String(error)}
      </AlertDescription>
    </Alert>
  );
}