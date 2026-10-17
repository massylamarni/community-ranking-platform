import { Button } from "@/components/ui/button";

export function CommentPagination({
  page,
  totalPages,
  disabled,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
