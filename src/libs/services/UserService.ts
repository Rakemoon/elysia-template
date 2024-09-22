import { count, eq, inArray } from "drizzle-orm";
import { AuthLevel } from "#constants/index";
import { db } from "#database/connection";
import { users } from "#database/schema";
import { CatchAllError } from "#decorators/index";
import Service from "#structures/Service";
import { createHash } from "#util/index";

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
        return db
            .insert(users)
            .values({
                ...data,
                password: await createHash(data.password)
            });
    }

    public async getUserLevel(userId: string) {
        const [result] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
        switch (result.role) {
            case "admin": return AuthLevel.Admin;
            default: return AuthLevel.User;
        }
    }

    public async getAllUser() {
        const results = await db.select().from(users);
        return results;
    }

    public async deleteUsers(ids?: string[]) {
        if (!ids) return db.delete(users);
        return db
            .delete(users)
            .where(inArray(users.id, ids));
    }

    public async createManyUsers(...datas: typeof users.$inferInsert[]) {
        for await (const data of datas) await this.createUser(data);
    }

    public async updateUser(id: string, data: Partial<Omit<typeof users.$inferInsert, "id">>) {
        if (data.password !== undefined) {
            const hashed = await createHash(data.password);
            Reflect.set(data, "password", hashed);
        }
        await db
            .update(users)
            .set(data)
            .where(eq(users.id, id));
    }

    public async updateUserMany(...datas: (Partial<Omit<typeof users.$inferInsert, "id">> & { id: string; })[]) {
        for await (const data of datas) await this.updateUser(data.id, data);
    }
}
