import type {
  Category,
  CategoryEntityResponse,
  CategoryWorkEntity,
  Comment,
  CurrentUser,
  Notification,
  NotificationType,
  RankingPeriod,
  Role,
  Work,
  WorkResponse,
  WorkStatus,
} from "@/types/api";

// ---- internal storage shapes -----------------------------------------

interface DbUser {
  id: string;
  username: string;
  email: string;
  password: string; // plaintext on purpose
  role: Role;
}

interface DbVote {
  userId: string;
  value: 1 | -1;
  createdAt: string;
}

interface DbWork {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  authorId: string;
  categoryIds: number[];
  status: WorkStatus;
  votes: DbVote[];
  createdAt: string;
}

interface DbComment {
  id: string;
  workId: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  parentCommentId: string | null;
  createdAt: string;
}

interface DbNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

interface DbRankingSnapshot {
  period: "week" | "month";
  periodStart: string;
  workIdsInOrder: string[];
}

let nextId = 1000;
function generateId(prefix: string) {
  nextId += 1;
  return `${prefix}_${nextId}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ---- seed data ----------------------------------------------------------

const users: DbUser[] = [
  {
    id: "u1",
    username: "admin",
    email: "admin@works.test",
    password: "admin1234",
    role: "admin",
  },
  {
    id: "u2",
    username: "alice",
    email: "alice@works.test",
    password: "alice1234",
    role: "user",
  },
  {
    id: "u3",
    username: "bob",
    email: "bob@works.test",
    password: "bob1234",
    role: "user",
  },
];

const categories: Category[] = [
  { id: 1, name: "Photography" },
  { id: 2, name: "Literature" },
  { id: 3, name: "Music" },
];

const works: DbWork[] = [
  {
    id: "w1",
    title: "Sunset over the harbour",
    description: "A long-exposure shot taken from the old pier.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
    authorId: "u2",
    categoryIds: [1],
    status: "approved",
    votes: [
      { userId: "u1", value: 1, createdAt: daysAgo(0) },
      { userId: "u3", value: 1, createdAt: daysAgo(1) },
    ],
    createdAt: daysAgo(10),
  },
  {
    id: "w11",
    title: "Sunset over the sun",
    description: "A long-exposure shot taken from the old pier.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
    authorId: "u2",
    categoryIds: [1],
    status: "approved",
    votes: [
      { userId: "u1", value: 1, createdAt: daysAgo(0) },
      { userId: "u3", value: 1, createdAt: daysAgo(1) },
    ],
    createdAt: daysAgo(10),
  },
  {
    id: "w12",
    title: "Sunset over the moon",
    description: "A long-exposure shot taken from the old pier.",
    imageUrl: null,
    authorId: "u2",
    categoryIds: [1],
    status: "approved",
    votes: [
      { userId: "u1", value: 1, createdAt: daysAgo(0) },
      { userId: "u3", value: 1, createdAt: daysAgo(1) },
    ],
    createdAt: daysAgo(10),
  },
  {
    id: "w2",
    title: "Short stories about rain",
    description: "Five short stories written over one wet November.",
    imageUrl: null,
    authorId: "u3",
    categoryIds: [2],
    status: "approved",
    votes: [
      { userId: "u2", value: 1, createdAt: daysAgo(40) },
      { userId: "u1", value: -1, createdAt: daysAgo(2) },
    ],
    createdAt: daysAgo(45),
  },
  {
    id: "w3",
    title: "Untitled bedroom demo",
    description: "A four-track demo recorded on a phone.",
    imageUrl: null,
    authorId: "u2",
    categoryIds: [3],
    status: "pending",
    votes: [],
    createdAt: daysAgo(1),
  },
  {
    id: "w4",
    title: "Rejected sketch",
    description: "This one did not pass moderation, for demo purposes.",
    imageUrl: null,
    authorId: "u3",
    categoryIds: [1],
    status: "rejected",
    votes: [],
    createdAt: daysAgo(3),
  },
];

const comments: DbComment[] = [
  {
    id: "cm1",
    workId: "w1",
    authorId: "u3",
    content: "Love the colours here.",
    imageUrl: null,
    parentCommentId: null,
    createdAt: daysAgo(9),
  },
  {
    id: "cm2",
    workId: "w1",
    authorId: "u2",
    content: "Thank you! Shot at f/11, 30s exposure.",
    imageUrl: null,
    parentCommentId: "cm1",
    createdAt: daysAgo(8),
  },
];

const notifications: DbNotification[] = [
  {
    id: "n1",
    userId: "u2",
    type: "work_accepted",
    message: `Your work "Sunset over the harbour" was accepted.`,
    read: false,
    createdAt: daysAgo(10),
  },
];

const rankingSnapshots: DbRankingSnapshot[] = [
  {
    period: "week",
    periodStart: daysAgo(7).slice(0, 10),
    workIdsInOrder: ["w2", "w1"],
  },
];

// sessions: mock session token -> user id
function loadSessions(): Map<string, string> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = window.localStorage.getItem("__mock_sessions__");
    return raw ? new Map(JSON.parse(raw)) : new Map();
  } catch {
    return new Map();
  }
}
const sessions = loadSessions();

// ---- helpers reused by handlers ------------------------------------------

export function findUserById(id: string): DbUser | undefined {
  return users.find((u) => u.id === id);
}

export function findUserByUsername(username: string): DbUser | undefined {
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

function persistSessions() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    "__mock_sessions__",
    JSON.stringify([...sessions.entries()]),
  );
}

export function createSession(userId: string): string {
  const token = generateId("session");
  sessions.set(token, userId);
  persistSessions();
  return token;
}

export function destroySession(token: string | null) {
  if (token) {
    sessions.delete(token);
    persistSessions();
  }
}
export function userFromSessionToken(token: string | null): DbUser | undefined {
  if (!token) return undefined;
  const userId = sessions.get(token);
  return userId ? findUserById(userId) : undefined;
}

export function toCurrentUser(user: DbUser): CurrentUser {
  return {
    id: numericUserId(user),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

export function numericUserId(user: DbUser): number {
  return Number(user.id.replace(/\D/g, "")) || 1;
}

function numericWorkId(id: string): number {
  return Number(id.replace(/\D/g, "")) || 1;
}

export function registerUser(input: {
  username: string;
  email: string;
  password: string;
}): DbUser {
  const user: DbUser = {
    id: generateId("user"),
    username: input.username,
    email: input.email,
    password: input.password,
    role: "user",
  };
  users.push(user);
  return user;
}

export function usernameOrEmailTaken(
  username: string,
  email: string,
  excludeUserId?: string,
): boolean {
  return users.some(
    (u) =>
      (u.id !== excludeUserId &&
        u.username.toLowerCase() === username.toLowerCase()) ||
      (u.id !== excludeUserId && u.email.toLowerCase() === email.toLowerCase()),
  );
}

function scoreOf(work: DbWork): number {
  return work.votes.reduce((total, v) => total + v.value, 0);
}

function periodStartDate(period: RankingPeriod): Date | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const start = new Date(now);
    const dayOfWeek = (start.getDay() + 6) % 7; // Monday = 0
    start.setDate(start.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  // month
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function scoreInPeriod(work: DbWork, period: RankingPeriod): number {
  const start = periodStartDate(period);
  const votesInWindow = start
    ? work.votes.filter((v) => new Date(v.createdAt) >= start)
    : work.votes;
  return votesInWindow.reduce((total, v) => total + v.value, 0);
}

export function findWorkByApiId(
  id?: string | number | readonly string[],
): DbWork | undefined {
  const numericId = Number(Array.isArray(id) ? id[0] : id);
  if (!Number.isInteger(numericId)) return undefined;
  return works.find((work) => numericWorkId(work.id) === numericId);
}

export function serializeWork(work: DbWork, viewer: DbUser | undefined): Work {
  const author = findUserById(work.authorId);
  const myVote = viewer
    ? (work.votes.find((v) => v.userId === viewer.id)?.value ?? null)
    : null;
  return {
    id: numericWorkId(work.id),
    title: work.title,
    description: work.description,
    imageUrl: work.imageUrl,
    author: { username: author?.username ?? "unknown" },
    categories: categories
      .filter((category) => work.categoryIds.includes(category.id))
      .map((category) => category.name),
    status: work.status,
    score: scoreOf(work),
    totalVotes: work.votes.length,
    currentUserVote: myVote,
  };
}

export function serializeWorkResponse(work: DbWork): WorkResponse {
  const author = findUserById(work.authorId);
  return {
    id: numericWorkId(work.id),
    title: work.title,
    description: work.description,
    status: work.status,
    author: author?.username ?? "unknown",
    imageUrl: work.imageUrl,
    categories: categories
      .filter((category) => work.categoryIds.includes(category.id))
      .map((category) => category.name),
    totalVotes: work.votes.length,
  };
}

function serializeCategoryEntity(category: Category): CategoryEntityResponse {
  return {
    categoryId: category.id,
    name: category.name,
    oeuvreCategories: works
      .filter((work) => work.categoryIds.includes(category.id))
      .map((work) => ({ oeuvreId: numericWorkId(work.id) })),
  };
}

function serializeCategoryWorkEntity(work: DbWork): CategoryWorkEntity {
  const author = findUserById(work.authorId);
  return {
    oeuvreId: numericWorkId(work.id),
    title: work.title,
    description: work.description,
    imageUrl: work.imageUrl,
    author: { username: author?.username ?? "unknown" },
    status: work.status,
    createdAt: work.createdAt,
    updatedAt: null,
    oeuvreCategories: categories
      .filter((category) => work.categoryIds.includes(category.id))
      .map((category) => ({
        category: { categoryId: category.id, name: category.name },
      })),
    comments: comments
      .filter((comment) => comment.workId === work.id)
      .map((comment) => ({ commentId: comment.id })),
    votes: work.votes.map((vote) => ({ value: vote.value })),
    rankings: [],
  };
}

function serializeCommentRecursive(
  comment: DbComment,
  viewer: DbUser | undefined,
): Comment {
  const author = findUserById(comment.authorId);
  const replies = comments
    .filter((c) => c.parentCommentId === comment.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((c) => serializeCommentRecursive(c, viewer));
  return {
    id: comment.id,
    content: comment.content,
    imageUrl: comment.imageUrl,
    author: { username: author?.username ?? "unknown" },
    parentCommentId: comment.parentCommentId,
    replies,
    createdAt: comment.createdAt,
  };
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
  };
}

export const db = {
  users,
  categories,
  works,
  comments,
  notifications,
  rankingSnapshots,

  isWorkVisibleTo(work: DbWork, viewer: DbUser | undefined): boolean {
    if (work.status === "approved") return true;
    return !!viewer && (viewer.id === work.authorId || viewer.role === "admin");
  },

  publicWorksOfCategory(categoryId: number): DbWork[] {
    return works.filter(
      (w) => w.status === "approved" && w.categoryIds.includes(categoryId),
    );
  },

  topLevelCommentsOf(workId: string): DbComment[] {
    return comments
      .filter((c) => c.workId === workId && c.parentCommentId === null)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  serializeWork,
  serializeWorkResponse,
  serializeCategoryEntity,
  serializeCategoryWorkEntity,
  findWorkByApiId,
  serializeComment: serializeCommentRecursive,
  scoreOf,
  scoreInPeriod,

  notify(userId: string, type: NotificationType, message: string) {
    notifications.push({
      id: generateId("notif"),
      userId,
      type,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
  },

  generateId,
  generateNumericId(prefix: string) {
    return Number(generateId(prefix).replace(/\D/g, "")) || 1;
  },
};

export type { DbUser, DbWork, DbComment, DbNotification };
