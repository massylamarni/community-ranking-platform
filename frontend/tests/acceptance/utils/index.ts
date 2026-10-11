import { randomUUID } from "crypto";

export function getSuffix() {
  return randomUUID().slice(0, 8);
}
