import { randomUUID } from "node:crypto";

export function logError(scope, error) {
  const id = randomUUID().slice(0, 8);
  console.error(JSON.stringify({
    id,
    scope,
    message: error?.message,
    stack: process.env.NODE_ENV === "production" ? undefined : error?.stack,
    at: new Date().toISOString(),
  }));
  return id;
}
