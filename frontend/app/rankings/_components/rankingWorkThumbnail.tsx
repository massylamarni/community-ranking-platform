"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { cn } from "cn";

export interface RankingWorkThumbnailProps {
  imageUrl?: string | null;
  title: string;
  workId?: number;
  className?: string;
}

export default function RankingWorkThumbnail({
  imageUrl,
  title,
  workId,
  className,
}: RankingWorkThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !hasError;

  const content = showImage ? (
    <div
      className={cn(
        "relative h-10 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40",
        className,
      )}
    >
      <Image
        src={imageUrl!}
        alt={title}
        fill
        sizes="56px"
        unoptimized
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  ) : (
    <div
      role="img"
      aria-label={`Aperçu indisponible pour ${title}`}
      className={cn(
        "flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/40 text-muted-foreground/50",
        className,
      )}
    >
      <ImageIcon className="size-4" aria-hidden="true" />
    </div>
  );

  if (workId) {
    return (
      <Link
        href={`/works/${workId}`}
        aria-hidden="true"
        tabIndex={-1}
        className="shrink-0 transition-opacity hover:opacity-80 focus:outline-none"
      >
        {content}
      </Link>
    );
  }

  return content;
}
