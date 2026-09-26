// ---- shared -----------------------------------------------------------

export interface ApiErrorBody {
  status: number;
  error: string;
  fields?: Record<string, string>;
}

export type Role = "user" | "admin";

export interface CurrentUser {
  id: string;
  username: string;
  role: Role;
}

export interface AuthenticationUser {
  userId: number;
  username: string;
}

// ---- auth ---------------------------------------------------------------

export interface RegisterUserPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserPayload {
  username: string;
  password: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface OwnProfile {
  id: string;
  username: string;
  role: Role;
  email: string;
}

export interface UpdateProfilePayload {
  username?: string;
}

export interface PublicProfile {
  username: string;
}

// ---- categories -----------------------------------------------------------

export interface Category {
  id: string;
  name: string;
}

export interface CreateCategoryPayload {
  name: string;
}

// ---- works ------------------------------------------------------------

export type WorkStatus = "pending" | "accepted" | "refused";

export interface Work {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  author: { username: string };
  categories: Category[];
  status: WorkStatus;
  score: number;
  totalVotes: number;
  currentUserVote: 1 | -1 | null;
}

export interface SubmitWorkPayload {
  title: string;
  description: string;
  categoryIds: string[];
  image?: File | null;
}

export interface UpdateWorkPayload {
  title?: string;
  description?: string;
  categoryIds?: string[];
  image?: File | null;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type WorkPage = Page<Work>;

export interface RefuseWorkPayload {
  reason?: string;
}

// ---- votes ------------------------------------------------------------

export interface VoteForWorkPayload {
  value: 1 | -1 | null;
}

// ---- comments -----------------------------------------------------------

export interface Comment {
  id: string;
  content: string;
  imageUrl: string | null;
  author: { username: string };
  parentCommentId: string | null;
  replies: Comment[];
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
  parentCommentId?: string | null;
  image?: File | null;
}

export interface UpdateCommentPayload {
  content: string;
}

export type CommentPage = Page<Comment>;

// ---- rankings -----------------------------------------------------------

export type RankingPeriod = "day" | "week" | "month" | "all";

export interface RankingEntry {
  rank: number;
  work: Work;
}

export interface GetRankings {
  period: string;
  categoryId: string | null;
  entries: RankingEntry[];
}

export interface RankingSnapshot {
  period: string;
  periodStart: string;
  entries: RankingEntry[];
}

// ---- profiles -----------------------------------------------------------

export interface GetActivity {
  works: Work[];
  comments: Comment[];
  favorites: Work[];
}

// ---- notifications --------------------------------------------------------

export type NotificationType =
  | "work_accepted"
  | "work_refused"
  | "admin_action";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}
