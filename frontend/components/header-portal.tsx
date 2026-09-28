"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

export function HeaderPortal({ children }: { children: React.ReactNode }) {
  const el = useSyncExternalStore(
    subscribe,
    () => document.getElementById("header-slot"),
    () => null,
  );

  return el ? createPortal(children, el) : null;
}
