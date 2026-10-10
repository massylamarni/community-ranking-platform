"use client";

import { useParams } from "next/navigation";
import { WorkItem } from "../_components/workItem";
import AuthorWorkGuard from "../_components/guards/authorWorkGuard";

export default function DisplayWork() {
  const { id } = useParams<{ id: string }>();
  return (
    <AuthorWorkGuard id={Number(id)}>
      {(work) => <WorkItem work={work} />}
    </AuthorWorkGuard>
  );
}
