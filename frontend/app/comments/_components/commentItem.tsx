"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Reply, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Comment, CreateCommentPayload } from "@/types/api";
import { CommentForm } from "./commentForm";
import { ConfirmDialog } from "@/components/confirmDialog";
import { useApi } from "@/hooks";

export interface CommentViewer {
  username?: string | null;
  isAdmin: boolean;
}

export interface CommentActions {
  reply: (
    parentId: number,
    payload: Omit<CreateCommentPayload, "parentCommentId">,
  ) => Promise<void>;
  update: (
    commentId: number,
    content: string,
    image: File | null,
  ) => Promise<void>;
  remove: (commentId: number) => Promise<void>;
}

const MAX_INDENT_DEPTH = 10;

export function CommentItem({
  comment,
  depth = 0,
  viewer,
  actions,
}: {
  comment: Comment;
  depth?: number;
  viewer: CommentViewer;
  actions: CommentActions;
}) {
  const { run, loading, error } = useApi();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const username = comment.author.username;
  const isAuthor = !!viewer.username && viewer.username === username;
  const canDelete = isAuthor || viewer.isAdmin;

  async function handleDelete() {
    const result = await run(actions.remove(comment.id), {
      loading: "Suppression du commentaire...",
      success: "Commentaire supprimé",
      error: "Échec de la suppression du commentaire",
    });

    if (result.ok) setConfirmingDelete(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <Avatar className="size-8">
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium">{username}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>

          {editing ? (
            <CommentForm
              initialContent={comment.content}
              initialImageUrl={comment.imageUrl}
              submitLabel="Save"
              allowImage={true}
              onCancel={() => setEditing(false)}
              onSubmit={async (content, image) => {
                await actions.update(comment.id, content, image);
                setEditing(false);
              }}
            />
          ) : (
            <p>{comment.content}</p>
          )}

          {comment.imageUrl && !editing && (
            <div className="relative aspect-4/3 w-full max-w-xs overflow-hidden rounded-md bg-black">
              <Image
                src={comment.imageUrl}
                alt="Comment attachment"
                fill
                sizes="320px"
                className="object-contain"
              />
            </div>
          )}

          {!editing && (
            <div className="flex -ml-2">
              {viewer.username && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-muted-foreground"
                  onClick={() => setReplying((v) => !v)}
                >
                  <Reply />
                  Reply
                </Button>
              )}
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-muted-foreground"
                  onClick={() => setEditing(true)}
                  aria-label="Edit comment"
                >
                  <Pencil />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-muted-foreground"
                  onClick={() => setConfirmingDelete(true)}
                  aria-label="Delete comment"
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          )}

          {error && <div>{error.message}</div>}

          {replying && (
            <CommentForm
              placeholder={`Reply to ${username}...`}
              submitLabel="Reply"
              onCancel={() => setReplying(false)}
              onSubmit={async (content, image) => {
                await actions.reply(comment.id, { content, image });
                setReplying(false);
              }}
            />
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div
          className={
            depth < MAX_INDENT_DEPTH
              ? "ml-6 pl-3 flex flex-col gap-4"
              : "flex flex-col gap-4"
          }
        >
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              viewer={viewer}
              actions={actions}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmingDelete}
        onOpenChange={(isOpen) => !loading && setConfirmingDelete(isOpen)}
        title="Supprimer le commentaire ?"
        description={
          <>
            Voulez-vous vraiment supprimer ce commentaire ? Toutes les réponses
            seront également supprimées.
          </>
        }
        onConfirm={handleDelete}
        loading={loading}
        error={error?.message}
      />
    </div>
  );
}
