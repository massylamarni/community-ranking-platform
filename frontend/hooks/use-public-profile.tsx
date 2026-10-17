"use client";

import { useCallback, useState } from "react";
import { profilesRepository } from "@/repositories";
import type { PublicProfile } from "@/types/api";

export function useProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getPublicProfile = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await profilesRepository.getPublicProfile(userId);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    getPublicProfile,
  };
}
