"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentUploader } from "@/components/attachmentUploader";

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
  const [content, setContent] = useState(initialContent);
  const [image, setImage] = useState<File | null>(null);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit() {
    if (!content.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(content, image);
      setContent("");
      setImage(null);
      setUploaderKey((k) => k + 1);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
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
        disabled={submitting}
      />
      {/* error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )*/}
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
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
