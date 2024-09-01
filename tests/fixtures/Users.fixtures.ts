import { faker } from "@faker-js/faker";;
import { db } from "#database/connection";
import { users } from "#database/schema";
import { count, eq } from "drizzle-orm";
import { createHash } from "#util/index";

const cachedEmail = new Set();

const createEmail = (firstName: string, lastName: string) => {
  const email = faker.internet.email({ firstName, lastName });
  if (cachedEmail.has(email)) return createEmail(firstName, lastName);
  cachedEmail.add(email);
  return email;
}

export const createRandomUsers = (makeAdmin: boolean): typeof users.$inferSelect => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    id: faker.string.uuid(),
    email: createEmail(firstName, lastName),
    fullname: faker.person.fullName({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }).slice(0, 20),
    password: faker.internet.password(),
    role: makeAdmin ? "admin" : "user",
    emailVerified: false,
  }
}

export const seed = async (makeAdmin = false) => {
  const user = createRandomUsers(makeAdmin);
  
  await db
  .insert(users)
  .values({
    ...user,
    password: await createHash(user.password)
  });

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
