import { authHandlers } from "./auth.handlers";
import { categoriesHandlers } from "./categories.handlers";
import { worksHandlers } from "./works.handlers";
import { votesHandlers } from "./votes.handlers";
import { commentsHandlers } from "./comments.handlers";
import { moderationHandlers } from "./moderation.handlers";
import { rankingsHandlers } from "./rankings.handlers";
import { profilesHandlers } from "./profiles.handlers";
import { notificationsHandlers } from "./notifications.handlers";

export const handlers = [
  ...authHandlers,
  ...categoriesHandlers,
  ...worksHandlers,
  ...votesHandlers,
  ...commentsHandlers,
  ...moderationHandlers,
  ...rankingsHandlers,
  ...profilesHandlers,
  ...notificationsHandlers,
];
