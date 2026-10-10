import React from "react";
import type { Work } from "@/types/api";

export const loadingGuardModule = {
  __esModule: true,
  default: () => <div data-testid="loading" />,
};
export const workNotFoundGuardModule = {
  __esModule: true,
  default: () => <div data-testid="not-found" />,
};
export const authorGuardModule = {
  __esModule: true,
  default: () => <div data-testid="not-author" />,
};

export const categoryNotFoundGuardModule = {
  __esModule: true,
  default: () => <div data-testid="not-found" />,
};

export const mockAuthorWorkGuard = jest.fn();

let guardWork: Work;
let guardError: unknown = null;

export function setGuardResult(work: Work, error: unknown = null) {
  guardWork = work;
  guardError = error;
}

export const authorWorkGuardModule = {
  __esModule: true,
  default: ({
    id,
    children,
  }: {
    id: number;
    children: (work: Work, error: unknown) => React.ReactNode;
  }) => {
    mockAuthorWorkGuard(id);
    return <>{children(guardWork, guardError)}</>;
  },
};
