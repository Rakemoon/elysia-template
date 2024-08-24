import type { Static, TSchema } from "elysia";

export type ParseType<T> = {
  [k in keyof T]: T[k] extends TSchema ? Static<T[k]> : never;
}
