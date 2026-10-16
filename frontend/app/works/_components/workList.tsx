import { Dispatch, SetStateAction } from "react";
import { Work } from "@/types/api";
import { WorkItem } from "./workItem";
import CategoryHasNoWork from "./categoryHasNoWork";
import { WorksContainer } from "./worksContainer";

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

  if (works.length === 0) return <CategoryHasNoWork />;

  return (
    <WorksContainer>
      {works.map((w) => (
        <WorkItem
          key={w.id}
          work={w}
          setWork={w.author === username ? undefined : handleSetWork}
          setSelectedWork={setSelectedWork}
        />
      ))}
    </WorksContainer>
  );
}
