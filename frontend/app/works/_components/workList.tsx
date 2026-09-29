import { Dispatch, SetStateAction } from "react";
import { Work } from "@/types/api";
import { WorkItem } from "./workItem";
import CategoryHasNoWork from "./categoryHasNoWork";

export function WorkList({
  works,
  setWorks,
  setSelectedWork,
  username,
}: {
  works: Work[];
  setWorks: Dispatch<SetStateAction<Work[]>>;
  setSelectedWork: (w: Work | null) => void;
  username: string | undefined;
}) {
  function handleSetWork(work: Work) {
    if (!setWorks) return;
    setWorks((prev) => prev.map((w) => (w.id === work.id ? work : w)));
  }

  return works.length === 0 ? (
    <CategoryHasNoWork />
  ) : (
    <div className="flex flex-col w-full h-full justify-start items-center gap-4">
      {works.map((w) => (
        <WorkItem
          key={w.id}
          work={w}
          setWork={w.author.username === username ? undefined : handleSetWork}
          setSelectedWork={setSelectedWork}
        />
      ))}
    </div>
  );
}
