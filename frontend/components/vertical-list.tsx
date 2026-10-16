import { ReactNode } from "react";

export default function VerticalList({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex justify-center items-center flex-col gap-4">
      {children}
    </div>
  );
}
