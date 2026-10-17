"use client";

import { useCallback, useRef, useState } from "react";
import { commentsRepository } from "@/repositories";
import type {
  Comment,
  CommentPage,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "@/types/api";

type ListArgs = { workId: number; page: number; pageSize: number };

export function useComments() {
  const [commentPage, setCommentPage] = useState<CommentPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Remembers the last list request so mutations can refresh the same page.
  const lastListRef = useRef<ListArgs | null>(null);

  const list = useCallback(async (workId: number, page = 1, pageSize = 20) => {
    lastListRef.current = { workId, page, pageSize };
    setLoading(true);
    setError(null);
    try {
      const data = await commentsRepository.list(workId, page, pageSize);
      setCommentPage(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const last = lastListRef.current;
    if (!last) return null;
    return list(last.workId, last.page, last.pageSize);
  }, [list]);

  const create = useCallback(
    async (workId: number, payload: CreateCommentPayload) => {
      const created: Comment = await commentsRepository.create(workId, payload);
      // Replies are nested and the server paginates, so refetch rather than
      // patching the tree locally.
      if (lastListRef.current?.workId === workId) await refresh();
      return created;
    },
    [refresh],
  );

  const update = useCallback(
    async (commentId: number, payload: UpdateCommentPayload) => {
      const updated: Comment = await commentsRepository.update(
        commentId,
        payload,
      );
      await refresh();
      return updated;
    },
    [refresh],
  );

  const remove = useCallback(
    async (commentId: number) => {
      await commentsRepository.remove(commentId);
      await refresh();
    },
    [refresh],
  );

  return {
    commentPage,
    loading,
    error,
    list,
    refresh,
    create,
    update,
    remove,
  };
}
