import { request } from "@/lib/http";
import type { PublicProfile } from "@/types/api";

export const profilesRepository = {
  getPublicProfile(userId: number) {
    return request<PublicProfile>(`/users/${userId}/public_profile`);
  },
};
