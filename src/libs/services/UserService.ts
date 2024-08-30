import { AuthLevel } from "#constants/index";
import { db } from "#database/connection";
import { users } from "#database/schema";
import { CatchAllError } from "#decorators/index";
import Service from "#structures/Service";
import { createHash } from "#util/index";
import { count, eq, inArray } from "drizzle-orm";

@CatchAllError
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
    data.password = await createHash(data.password);
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

  public async createManyUsers(...datas: typeof users.$inferInsert[]) {
    for (const data of datas) await this.createUser(data);
  }

  public async updateUser(id: string, data: Partial<Omit<typeof users.$inferInsert, "id">>) {
    if (data.password) data.password = await createHash(data.password);
    await db
    .update(users)
    .set(data)
    .where(eq(users.id, id));
  }

  public async updateUserMany(...datas: (Partial<Omit<typeof users.$inferInsert, "id">> & { id: string; })[]) {
    for (const data of datas) await this.updateUser(data.id, data);
  }
}
