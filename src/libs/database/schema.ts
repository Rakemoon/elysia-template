import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const roles = pgEnum("roles", [
  "admin",
  "user",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 20 }).notNull(),
  fullname: varchar("fullname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roles("role").default("user").notNull(),
});

export const token = pgTable("refresh_token", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("id").references(() => users.id).notNull(),
  value: varchar("token", { length: 255 }).notNull(),
});

