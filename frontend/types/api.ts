// ---- shared -----------------------------------------------------------

export interface ApiErrorBody {
  status: number;
  error: string;
  fields?: Record<string, string>;
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

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// ---- auth ---------------------------------------------------------------

export type Role = "user" | "admin";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface AuthenticationUserResponse {
  userId: number;
  username: string;
}

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
  confirmPassword: string; // TODO
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string; // TODO
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

// ---- categories -----------------------------------------------------------

export interface Category {
  id: number;
  name: string;
}

export interface CategoryEntityResponse {
  id: number;
  name: string;
  works: Work[];
}

export interface CreateCategoryPayload {
  name: string;
}

// ---- works ------------------------------------------------------------

export type WorkStatus = "created" | "pending" | "approved" | "rejected";

export type WorkResponse = Work;

export interface Work {
  // TODO
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  author: string;
  categories: string[];
  status: WorkStatus;
  reason?: string;
  score: number;
  totalVotes: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateWorkPayload {
  title: string;
  description: string;
  image?: File | null;
  imageUrl?: string | null;
  categoryIds?: string[] | number[];
}

export interface SubmitWorkPayload {
  title?: string | null;
  description?: string | null;
  categoryIds: number[];
}

export interface UpdateWorkPayload {
  title?: string | null;
  description?: string | null;
  categoryIds?: number[] | null;
}

export interface RefuseWorkPayload {
  reason?: string;
}

export type WorkPage = Page<Work>;

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
  id: number;
  content: string;
  imageUrl: string | null;
  author: { username: string };
  username: string;
  parentCommentId: string | null;
  oeuvreId: string;
  replies: Comment[];
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
  parentCommentId?: number | null;
  image?: File | null;
}

export interface UpdateCommentPayload {
  content: string;
  image?: File | null;
}

export type CommentPage = Page<Comment>;

// ---- rankings -----------------------------------------------------------

export type RankingPeriod = "day" | "week" | "month" | "year" | "all";

export interface RankingEntry {
  id: number;
  position: number;
  title: string;
  description: string;
  author: string;
  categories: string[];
  score: number;
  imageUrl?: string | null;
}

export type RankingPage = Page<RankingEntry>;

export interface RankingListQuery {
  categoryId?: number;
  period?: RankingPeriod;
  page?: number;
  pageSize?: number;
}

export interface RankingArchiveListQuery {
  periodType?: RankingPeriod;
  periodStart?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
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

export interface PublicProfileWork {
  oeuvreId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  score: number;
  totalVotes: number;
  createdAt: string;
}

export interface PublicProfileComment {
  commentId: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  oeuvreId: number;
  oeuvreTitle: string;
  parentCommentId: number | null;
}

export interface PublicProfileVotedWork {
  oeuvreId: number;
  title: string;
  imageUrl: string | null;
  score: number;
  totalVotes: number;
  voteValue: 1 | -1;
}

export interface PublicProfile {
  userId: number;
  username: string;
  publishedWorks: PublicProfileWork[];
  comments: PublicProfileComment[];
  votedWorks: PublicProfileVotedWork[];
}

// ---- notifications --------------------------------------------------------

export type NotificationType = "MODERATION" | "SYSTEM";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

// ---- moderation --------------------------------------------------------

export type ModerationAction = "accept" | "refuse";
