import { db } from "#database/connection";
import { users } from "#database/schema";
import { createHash } from "#util/index";
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
      password: await createHash("password123"),
      role: "admin",
    }
  ]);
