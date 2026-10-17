"use client";

import { useCallback, useState } from "react";
import { profilesRepository } from "@/repositories";
import { ApiError } from "@/lib/errors";
import type { PublicProfile } from "@/types/api";

export function useProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notFound, setNotFound] = useState(false);

  const get = useCallback(async (userId: number) => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await profilesRepository.getPublicProfile(userId);
      setProfile(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.isNotFound) {
        setProfile(null);
        setNotFound(true);
      } else {
        setError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, notFound, get };
}
