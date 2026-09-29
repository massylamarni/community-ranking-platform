import { ReactNode } from "react";

export function WorksContainer({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col w-full h-full justify-start items-center gap-4">
      {children}
    </div>
  );
}
