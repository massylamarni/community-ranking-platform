"use client";

import { useParams } from "next/navigation";
import ProfileView from "./_components/profileView";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  return <ProfileView userId={Number(id)} />;
}
