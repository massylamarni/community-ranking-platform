"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { Work } from "@/types/api";
import { WorkItem } from "../_components/workItem";
import AuthorWorkGuard from "../_components/guards/authorWorkGuard";

export default function DisplayWork() {
  const { id } = useParams<{ id: string }>();
  const [voted, setVoted] = useState<Work | null>(null);

  return (
    <AuthorWorkGuard id={Number(id)}>
      {(work) => (
        <WorkItem
          work={voted?.id === work.id ? voted : work}
          setWork={setVoted}
        />
      )}
    </AuthorWorkGuard>
  );
}
