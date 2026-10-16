"use client";

import { useState, useRef } from "react";
import { FileTextIcon, TableIcon, FileCodeIcon, XIcon } from "lucide-react";
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import Image from "next/image";

type Item = {
  id: string;
  name: string;
  meta: string;
  src?: string;
  icon?: React.ComponentType;
  file?: File;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(file: File) {
  if (file.type === "text/csv") return TableIcon;
  if (file.type.includes("javascript") || file.name.endsWith(".tsx"))
    return FileCodeIcon;
  return FileTextIcon;
}

export function AttachmentUploader({
  onFileSelect,
  initialAttachment,
  type = "file",
  accept = "image/*,.pdf,.csv,.tsx",
}: {
  onFileSelect: (file: File | null) => void;
  initialAttachment?: { name: string; url: string };
  type?: string;
  accept?: string;
}) {
  const [items, setItems] = useState<Item[]>(() =>
    initialAttachment
      ? [
          {
            id: crypto.randomUUID(),
            name: initialAttachment.name,
            meta: "Actuel",
            src: initialAttachment.url,
          },
        ]
      : [],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const newItems: Item[] = Array.from(fileList).map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: crypto.randomUUID(),
        name: file.name,
        meta: `${file.type.split("/")[1]?.toUpperCase() ?? "FILE"} · ${formatBytes(file.size)}`,
        src: isImage ? URL.createObjectURL(file) : undefined,
        icon: isImage ? undefined : iconFor(file),
        file,
      };
    });

    setItems((prev) => {
      const old = prev[0];
      if (old?.src && old.file) URL.revokeObjectURL(old.src);
      return newItems.slice(0, 1);
    });

    const first = newItems[0];
    onFileSelect(first?.file ?? null);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.src && target.file) URL.revokeObjectURL(target.src);
      return prev.filter((i) => i.id !== id);
    });
    onFileSelect(null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type={type}
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded border px-3 py-1.5 text-sm"
      >
        Ajouter une pièce jointe
      </button>

      <AttachmentGroup className="w-full">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Attachment key={item.id} className="w-64">
              {item.src ? (
                <AttachmentMedia variant="image">
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </AttachmentMedia>
              ) : Icon ? (
                <AttachmentMedia>
                  <Icon />
                </AttachmentMedia>
              ) : null}
              <AttachmentContent>
                <AttachmentTitle>{item.name}</AttachmentTitle>
                <AttachmentDescription>{item.meta}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label={`Supprimer ${item.name}`}
                  onClick={() => removeItem(item.id)}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          );
        })}
      </AttachmentGroup>
    </div>
  );
}
