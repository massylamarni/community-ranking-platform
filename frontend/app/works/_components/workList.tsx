import { Dispatch, SetStateAction, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Work } from "@/types/api";
import { WorkItem } from "./workItem";

export function WorkList({
  works,
  setSelectedWork,
}: {
  works: Work[];
  setSelectedWork: Dispatch<SetStateAction<Work | null>>;
}) {
  useEffect(() => {
    setSelectedWork(null);
  }, [works, setSelectedWork]);

  return works.length === 0 ? (
    <Card className="relative w-full max-w-sm">
      <CardHeader className="flex justify-center items-center">
        <CardTitle>No work is available in this category yet.</CardTitle>
      </CardHeader>
    </Card>
  ) : (
    <div>
      {works.map((w) => (
        <WorkItem key={w.id} work={w} setSelectedWork={setSelectedWork} />
      ))}
    </div>
  );
}
