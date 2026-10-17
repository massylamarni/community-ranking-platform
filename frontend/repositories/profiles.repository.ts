import { request } from "@/lib/http";
import type { GetActivity, PublicProfile } from "@/types/api";

export const profilesRepository = {
  getPublicProfile(userId: number) {
    return request<PublicProfile>(`/users/${userId}/public_profile`);
  },

  getActivity(username: string) {
    return request<GetActivity>(`/users/${username}/activity`);
  },
};
