"use client";

import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useComments } from "@/hooks/use-comments";
import { CommentForm } from "./commentForm";
import { CommentItem, type CommentActions } from "./commentItem";
import { CommentPagination } from "./commentPagination";

export function CommentSection({
  workId,
  workAuthor,
  currentUser,
  isAdmin = false,
}: {
  workId: number;
  workAuthor: string;
  currentUser?: string | null;
  isAdmin?: boolean;
}) {
  const { commentPage, loading, error, list, create, update, remove } =
    useComments();

  useEffect(() => {
    list(workId).catch(() => {});
  }, [workId, list]);

  const viewer = { username: currentUser, isAdmin };

  const actions: CommentActions = {
    reply: async (parentCommentId, payload) => {
      await create(workId, { ...payload, parentCommentId });
    },
    update: async (id, content) => {
      await update(id, { content });
    },
    remove,
  };

  const canCommentTopLevel = !!currentUser && currentUser !== workAuthor;
  const noComments = commentPage?.items.length === 0;

  const totalPages = commentPage
    ? Math.max(1, Math.ceil(commentPage.total / commentPage.pageSize))
    : 1;

  if (!currentUser)
    return (
      <p className="text-sm text-muted-foreground">
        Log in to join the discussion.
      </p>
    );

  return (
    <div className="flex flex-col gap-4 w-full">
      {canCommentTopLevel ? (
        <CommentForm
          onSubmit={async (content, image) => {
            await create(workId, { content, image });
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          You can&apos;t add a top-level comment on your own work, but you can
          reply to others.
        </p>
      )}

      <Separator className="w-full" />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {loading && !commentPage && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}

      {noComments && (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      {commentPage?.items.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          viewer={viewer}
          actions={actions}
        />
      ))}

      {commentPage && (
        <CommentPagination
          page={commentPage.page}
          totalPages={totalPages}
          disabled={loading}
          onPageChange={(p) => list(workId, p, commentPage.pageSize)}
        />
      )}
    </div>
  );
}
