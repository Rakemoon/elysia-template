import { faker } from "@faker-js/faker";;
import { db } from "#database/connection";
import { users } from "#database/schema";
import { count, eq } from "drizzle-orm";

const cachedEmail = new Set();

const createEmail = () => {
  const email = faker.internet.email();
  if (cachedEmail.has(email)) return createEmail();
  cachedEmail.add(email);
  return email;
}

export const createRandomUsers = (makeAdmin: boolean): typeof users.$inferSelect => {
  return {
    id: faker.string.uuid(),
    email: createEmail(),
    fullname: faker.person.fullName(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
    role: makeAdmin ? "admin" : "user"
  }
}

export const seed = async (makeAdmin = false) => {
  const user = createRandomUsers(makeAdmin);
  
  await db
  .insert(users)
  .values({ ...user });

  return user;
}

export const isEmailExist = async(email: string) => {
  const [result] = await db
    .select({ count: count()})
    .from(users)
    .where(eq(users.email, email));
  return result.count > 0;
}


export const nuke = async () => db.delete(users);
