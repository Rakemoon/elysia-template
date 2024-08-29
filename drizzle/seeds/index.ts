import { db } from "#database/connection";
import { users } from "#database/schema";
import { count, eq } from "drizzle-orm";

const [result] = await db
  .select({count: count()})
  .from(users)
  .where(eq(users.email, "admin@example.com"));

if (!result.count) await db
  .insert(users)
  .values([
    {
      username: "admin",
      fullname: "Admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    }
  ]);
