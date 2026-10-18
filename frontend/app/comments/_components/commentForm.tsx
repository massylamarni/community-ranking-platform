"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentUploader } from "@/components/attachmentUploader";
import { useApi } from "@/hooks";

export function CommentForm({
  initialContent = "",
  initialImageUrl,
  placeholder = "Write a comment...",
  submitLabel = "Post",
  allowImage = true,
  onSubmit,
  onCancel,
}: {
  initialContent?: string;
  initialImageUrl?: string | null;
  placeholder?: string;
  submitLabel?: string;
  allowImage?: boolean;
  onSubmit: (content: string, image: File | null) => Promise<void>;
  onCancel?: () => void;
}) {
  const { run, loading, error } = useApi();

  const [content, setContent] = useState(initialContent);
  const [image, setImage] = useState<File | null>(null);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!content.trim()) {
      setValidationError("Comment cannot be empty.");
      return;
    }
    setValidationError(null);

    const result = await run(onSubmit(content, image), {
      loading: "Posting comment...",
      success: "Comment posted",
      error: "Failed to post comment",
    });

    if (result.ok) {
      setContent("");
      setImage(null);
      setUploaderKey((k) => k + 1);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        className="bg-background"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={loading}
      />
      {validationError && <div>{validationError}</div>}
      {error && <div>{error.message}</div>}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {allowImage && (
            <AttachmentUploader
              key={uploaderKey}
              accept="image/*"
              initialAttachment={
                initialImageUrl
                  ? {
                      name: "Current image",
                      url: initialImageUrl,
                    }
                  : undefined
              }
              allowRemoveInitial={false}
              onFileSelect={setImage}
            />
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
