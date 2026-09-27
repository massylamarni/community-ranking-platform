import { request } from "@/lib/http";
import type { GetActivity, PublicProfile } from "@/types/api";

export const profilesRepository = {
  getPublicProfile(username: string) {
    return request<PublicProfile>(`/users/${username}`);
  },

  getActivity(username: string) {
    return request<GetActivity>(`/users/${username}/activity`);
  },
};
