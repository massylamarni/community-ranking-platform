import type { commentsRepository } from "@/repositories";

type Repo = typeof commentsRepository;

export const mockCommentsRepository = {
  list: jest.fn<ReturnType<Repo["list"]>, Parameters<Repo["list"]>>(),
  create: jest.fn<ReturnType<Repo["create"]>, Parameters<Repo["create"]>>(),
  update: jest.fn<ReturnType<Repo["update"]>, Parameters<Repo["update"]>>(),
  remove: jest.fn<ReturnType<Repo["remove"]>, Parameters<Repo["remove"]>>(),
};
