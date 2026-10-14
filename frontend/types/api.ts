// ---- shared -----------------------------------------------------------

export interface ApiErrorBody {
  status: number;
  error: string;
  fields?: Record<string, string>;
}

export type Role = "user" | "admin";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
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
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OwnProfile {
  id: number;
  username: string;
  role: Role;
  email: string;
}

export interface UpdateProfilePayload {
  username?: string | null;
  email?: string | null;
}

export interface PublicProfile {
  username: string;
}

// ---- categories -----------------------------------------------------------

export interface Category {
  id: number;
  name: string;
}

export interface CategoryEntityResponse {
  categoryId: number;
  name: string;
  oeuvreCategories?: Array<Record<string, unknown>>;
  [property: string]: unknown;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface CategoryWorkEntity {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  author?: string | { username?: string; [property: string]: unknown };
  status: WorkStatus;
  createdAt?: string;
  updatedAt?: string | null;
  oeuvreCategories?: Array<Record<string, unknown>>;
  comments?: Array<Record<string, unknown>>;
  votes?: Array<Record<string, unknown>>;
  rankings?: Array<Record<string, unknown>>;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
  pageable?: Record<string, unknown>;
  sort?: Record<string, unknown>;
}

// ---- works ------------------------------------------------------------

export type WorkStatus = "created" | "pending" | "approved" | "rejected";

export interface WorkResponse {
  id: number;
  title: string;
  description: string;
  status: WorkStatus;
  author: string;
  imageUrl: string | null;
  categories: string[];
  totalVotes: number;
}

export interface Work {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  author: string;
  categories: string[];
  status: WorkStatus;
  score?: number;
  totalVotes: number;
}

export interface CreateWorkPayload {
  title: string;
  description: string;
  image?: File | null;
  imageUrl?: string | null;
}

export interface SubmitWorkPayload {
  categoryIds: number[];
}

export interface UpdateWorkPayload {
  title?: string | null;
  description?: string | null;
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

export interface VoteForWorkReponse {
  id: string;
  userId: string;
  value: 1 | -1;
  createdAt: string;
  oeuvre: Work;
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

// ---- moderation --------------------------------------------------------

export type ModerationAction = "accept" | "refuse";
