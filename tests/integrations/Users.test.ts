import { describe, beforeAll, beforeEach, afterAll, it, expect } from "bun:test";
import UsersRoute from "src/routes/v1/UsersRoute";
import { createAccessToken } from "tests/fixtures/Token.fixtures";
import { createRandomUsers, nuke, seed } from "tests/fixtures/Users.fixtures";
import EliTest from "tests/utils/EliIntegration";
import { emailRegex, UUIDRegex } from "tests/utils/Regex";
import RouteTest from "tests/utils/RouteTest";

const route = new RouteTest(EliTest, new UsersRoute());

let adminUser: ReturnType<typeof createRandomUsers>;
let adminAccessToken: string;

describe("Users Crud Test", () => {
  beforeAll(async () => {
    adminUser = await seed(true);
    adminAccessToken = await createAccessToken(adminUser.id);
  });
  afterAll(nuke);

  describe("GET /v1/users", () => {
    it("should response 200 (Ok) and successfully retrive user data", async () => {
      const { bodyResult } = await route.req("controllerGetUsers", {
        authorization: `Bearer ${adminAccessToken}`,
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Users Retrieved");
      if (bodyResult.message === "Users Retrieved") for (const item of bodyResult.data) expect(item).toEqual({
        email: expect.stringMatching(emailRegex),
        id: expect.stringMatching(UUIDRegex),
        password: expect.any(String),
        username: expect.any(String),
        role: expect.stringMatching(/admin|user/),
        fullname: expect.any(String)
      });
    });
    it("should response 200 (Ok) when id query provided and return just single user data", async () => {
      const additionalUser = await seed();
      const { bodyResult } = await route.req("controllerGetUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        query: { id: additionalUser.id },
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Single Users Retrieved")
      expect(bodyResult.data).toEqual({
        id: additionalUser.id,
        email: additionalUser.email,
        password: expect.any(String),
        username: additionalUser.username,
        role: additionalUser.role,
        fullname: additionalUser.fullname
      });
    });
    it("should response 404 (Not Found) when id query provided with nonexistent user id", async () => {
      const nonExistentUser = createRandomUsers(false);
      const { bodyResult } = await route.req("controllerGetUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        query: { id: nonExistentUser.id },
      });
      expect(bodyResult.status).toBe(404);
      expect(bodyResult.message).toBe("User Not Found");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 401 (Unauthorize) when bearer token inst admin token", async () => {
      const nonAdminUser = await seed(false);
      const nonAdminAccessToken = await createAccessToken(nonAdminUser.id);
      const { bodyResult } = await route.req("controllerGetUsers", {
        authorization: `Bearer ${nonAdminAccessToken}`,
      });
      expect(bodyResult.status).toBe(401);
      expect(bodyResult.message).toBe("Unauthorized Please Login!");
      expect(bodyResult.data).toBeNull();
    });
  })
  describe("POST /v1/users", () => {
    let newUser: ReturnType<typeof createRandomUsers>;
    beforeEach(() => newUser = createRandomUsers(false));
    it("should response 201 (Created) and successfully create user", async () => {
      const { bodyResult } = await route.req("controllerCreateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            username: newUser.username,
            fullname: newUser.fullname,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
          }
        ]
      });
      expect(bodyResult.status).toBe(201);
      expect(bodyResult.message).toBe("Users Creation Success");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 400 (Bad Request) when field is provided with invalid value", async () => {
      const { bodyResult } = await route.req("controllerCreateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            username: newUser.username,
            fullname: newUser.fullname,
            email: "invalidEmail",
            password: newUser.password,
            role: "invalidRole" as "user",
          }
        ]
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 400 (Bad Request) when required field is missing", async () => {
      const { bodyResult } = await route.req("controllerCreateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            username: newUser.username,
            fullname: newUser.fullname,
            email: newUser.email,
          } as any
        ]
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 401 (Unauthorize) when bearer token inst admin token", async () => {
      const nonAdminUser = await seed(false);
      const nonAdminAccessToken = await createAccessToken(nonAdminUser.id);
      const { bodyResult } = await route.req("controllerCreateUsers", {
        authorization: `Bearer ${nonAdminAccessToken}`,
        body: [
          {
            username: newUser.username,
            fullname: newUser.fullname,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
          }
        ]
      });
      expect(bodyResult.status).toBe(401);
      expect(bodyResult.message).toBe("Unauthorized Please Login!");
      expect(bodyResult.data).toBeNull();
    });
  })
  describe("PATCH /v1/users", () => {
    let newUser: ReturnType<typeof createRandomUsers>;
    let newUserIdentity: ReturnType<typeof createRandomUsers>;
    beforeAll(async () => newUser = await seed(false));
    beforeEach(() => newUserIdentity = createRandomUsers(false));
    it("should response 200 (Ok) and successfully update user", async () => {
      const { bodyResult } = await route.req("controllerUpdateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            id: newUser.id,
            password: newUserIdentity.password,
            fullname: newUserIdentity.fullname,
            username: newUserIdentity.username,
            email: newUserIdentity.email,
            role: newUserIdentity.role,
          }
        ]
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Update User Success");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 200 (Ok) if users just updated the password", async () => {
      const { bodyResult } = await route.req("controllerUpdateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            id: newUser.id,
            password: newUserIdentity.password,
          }
        ]
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Update User Success");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 200 (Ok) if users just updated the username", async () => {
      const { bodyResult } = await route.req("controllerUpdateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            id: newUser.id,
            username: newUserIdentity.username,
          }
        ]
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Update User Success");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 200 (Ok) if users just updated the fullname", async () => {
      const { bodyResult } = await route.req("controllerUpdateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            id: newUser.id,
            fullname: newUserIdentity.fullname,
          }
        ]
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Update User Success");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 200 (Ok) if users just updated the email", async () => {
      const { bodyResult } = await route.req("controllerUpdateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            id: newUser.id,
            email: newUserIdentity.email,
          }
        ]
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Update User Success");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 400 (Bad Request) when field id isnt provided", async () => {
      const { bodyResult } = await route.req("controllerUpdateUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [
          {
            password: newUserIdentity.password,
            fullname: newUserIdentity.fullname,
            username: newUserIdentity.username,
            email: newUserIdentity.email,
            role: newUserIdentity.role,
          } as any
        ]
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 401 (Unauthorize) when bearer token inst admin token", async () => {
      const nonAdminUser = await seed(false);
      const nonAdminAccessToken = await createAccessToken(nonAdminUser.id);
      const { bodyResult } = await route.req("controllerUpdateUsers", {
        authorization: `Bearer ${nonAdminAccessToken}`,
        body: [
          {
            id: newUser.id,
            password: newUserIdentity.password,
            fullname: newUserIdentity.fullname,
            username: newUserIdentity.username,
            email: newUserIdentity.email,
            role: newUserIdentity.role,
          }
        ]
      });
      expect(bodyResult.status).toBe(401);
      expect(bodyResult.message).toBe("Unauthorized Please Login!");
      expect(bodyResult.data).toBeNull();
    });
  })
  describe("DELETE /v1/users", () => {
    it("should response 200 (Ok) and successfully delete user", async () => {
      const newUser = await seed();
      const { bodyResult } = await route.req("controllerDeleteUsers", {
        authorization: `Bearer ${adminAccessToken}`,
        body: [newUser.id]
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Success Deleting Users");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 401 (Unauthorize) when bearer token inst admin token", async () => {
      const nonAdminUser = await seed(false);
      const nonAdminAccessToken = await createAccessToken(nonAdminUser.id);
      const newUser = await seed();
      const { bodyResult } = await route.req("controllerDeleteUsers", {
        authorization: `Bearer ${nonAdminAccessToken}`,
        body: [newUser.id]
      });
      expect(bodyResult.status).toBe(401);
      expect(bodyResult.message).toBe("Unauthorized Please Login!");
      expect(bodyResult.data).toBeNull();
    });
  })
});
