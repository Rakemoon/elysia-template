import { AuthLevel } from "#constants/index";
import { db } from "#database/connection";
import { users } from "#database/schema";
import Service from "#structures/Service";
import { count, eq, inArray } from "drizzle-orm";

export default class UserService extends Service {
  public async getPlainUser(userId: string) {
    const [result] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
    return result as typeof result | undefined;
  }

  public async getUserByEmail(email: string) {
    const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
    return result as typeof result | undefined;
  }

  public async isEmailExist(email: string) {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.email, email));
    return result.count > 0;
  }

  public async createUser(data: typeof users.$inferInsert) {
    return await db
      .insert(users)
      .values(data);
  }

  public async getUserLevel(userId: string) {
    const [result] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
    switch (result?.role) {
      case "admin": return AuthLevel.Admin;
      case "user": return AuthLevel.User;
      default: return undefined;
    }
  }

  public async getAllUser() {
    const results = await db.select().from(users);
    return results;
  }
  
  public async deleteUsers(ids?: string[]) {
    if (!ids) return await db.delete(users);
    return await db
      .delete(users)
      .where(inArray(users.id, ids));
  }
}
