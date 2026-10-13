import { Work } from "@/types/api";

export const createWork = (
  id: number = 99,
  username: string = "alice",
  o: Partial<Work> = {},
): Work => ({
  id,
  title: "Component test work",
  description: "A rendered work item",
  imageUrl: null,
  author: username,
  categories: ["Default", "Movie"],
  status: "approved",
  totalVotes: 3,
  ...o,
});

export function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}
