import EliTest from "tests/utils/EliIntegration";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import AuthRoute from "src/routes/v1/AuthRoute";
import RouteTest from "tests/utils/RouteTest";
import { ISOStringRegex, JWTTokenRegex, UUIDRegex } from "tests/utils/Regex";
import { seed, createRandomUsers, nuke, isEmailExist } from "tests/fixtures/Users.fixtures";
import { compareHash } from "#util/index";
import { createRefreshToken, tokenDetail } from "tests/fixtures/Token.fixtures";
import { TokenTypes } from "#constants/index";

const route = new RouteTest(EliTest, new AuthRoute());

let loginUser: ReturnType<typeof createRandomUsers>;
let registerUser: ReturnType<typeof createRandomUsers>;

describe("Authorization Test", () => {
  beforeAll(async () => loginUser = await seed());
  afterAll(nuke);
  describe("POST v1/auth/login", () => {
    it("should response 200 (OK) and return token for access and refresh", async () => {
      const { bodyResult } = await route.req("loginController", {
        body: {
          email: loginUser.email,
          password: loginUser.password, 
        }
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Success Login");
      expect(bodyResult.data).toEqual({
        user: {
          email: loginUser.email,
          password: expect.any(String),
          username: loginUser.username,
          fullname: loginUser.fullname,
          role: loginUser.role,
          id: loginUser.id,
          emailVerified: loginUser.emailVerified,
        },
        access: {
          token: expect.stringMatching(JWTTokenRegex),
          expiration: expect.stringMatching(ISOStringRegex),
        },
        refresh: {
          token: expect.stringMatching(JWTTokenRegex),
          expiration: expect.stringMatching(ISOStringRegex),
        },
      });
      if (bodyResult.status === 200) {
        const isPasswordSame = await compareHash(loginUser.password, bodyResult.data.user.password);
        expect(isPasswordSame).toBeTrue();
      }
    });
    it("should response 400 (Bad Request) when credentials is invalid", async () => {
      const { bodyResult } = await route.req("loginController", {
        body: {
          email: "invalidEmail",
          password: loginUser.password,
        } as any
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 401 (Unauthorized) when password is wrong", async () => {
      const { bodyResult } = await route.req("loginController", {
        body: {
          email: loginUser.email,
          password: "wrongPassword"
        }
      });
      expect(bodyResult.status).toBe(401);
      expect(bodyResult.message).toBe("Wrong Password");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 400 (Bad Request) when users is not found through the email", async () => {
      const { bodyResult } = await route.req("loginController", {
        body: {
          email: "nonExistentEmail@OhMyMail.com",
          password: loginUser.password, 
        }
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Users Not Found");
      expect(bodyResult.data).toBeNull();
    });
    it("should response 400 (Bad Request) when credentials less than required", async () => {
      const { bodyResult } = await route.req("loginController", {
        body: {
          email: loginUser.email,
        } as any
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
  });
  describe("POST v1/auth/register", () => {
    beforeEach(() => registerUser = createRandomUsers(false));
    it("should response 201 (Created) when credentials are valid", async () => {
      const { bodyResult } = await route.req("registerController", {
        body: {
          email: registerUser.email,
          password: registerUser.password,
          username: registerUser.username,
          fullname: registerUser.fullname,
        }
      });
      expect(bodyResult.status).toBe(201);
      expect(bodyResult.message).toBe("Success Registering User!");
      expect(bodyResult.data).toEqual({});
      expect(await isEmailExist(registerUser.email)).toBeTrue();
    });
    it("should response 200 (OK) when query nextLogin set to 'true' and return token and user data", async () => {
      const { bodyResult } = await route.req("registerController", {
        body: {
          email: registerUser.email,
          password: registerUser.password,
          username: registerUser.username,
          fullname: registerUser.fullname,
        },
        query: {
          nextLogin: true
        }
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Success Login");
      expect(await isEmailExist(registerUser.email)).toBeTrue();
      expect(bodyResult.data).toEqual({
        user: {
          email: registerUser.email,
          password: expect.any(String),
          username: registerUser.username,
          fullname: registerUser.fullname,
          role: registerUser.role,
          id: expect.stringMatching(UUIDRegex),
          emailVerified: registerUser.emailVerified,
        },
        access: {
          token: expect.stringMatching(JWTTokenRegex),
          expiration: expect.stringMatching(ISOStringRegex),
        },
        refresh: {
          token: expect.stringMatching(JWTTokenRegex),
          expiration: expect.stringMatching(ISOStringRegex),
        },
      });
      if (bodyResult.status === 200) {
        const isPasswordSame = await compareHash(registerUser.password, bodyResult.data.user.password);
        expect(isPasswordSame).toBeTrue();
      }
    });
    it("should response 400 (Bad Request) when username is less than 4 character", async () => {
      const { bodyResult } = await route.req("registerController", {
        body: {
          email: registerUser.email,
          password: registerUser.password,
          username: "abc",
          fullname: registerUser.fullname,
        }
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 400 (Bad Request) when fullnam is less than 8 character", async () => {
      const { bodyResult } = await route.req("registerController", {
        body: {
          email: registerUser.email,
          password: registerUser.password,
          fullname: "invalid",
          username: registerUser.username,
        }
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 400 (Bad Request) when email is invalid", async () => {
      const { bodyResult } = await route.req("registerController", {
        body: {
          email: "invalidEmail",
          password: registerUser.password,
          username: registerUser.username,
          fullname: registerUser.fullname,
        }
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 400 (Bad Request) when password is less than 8 characters", async () => {
      const { bodyResult } = await route.req("registerController", {
        body: {
          email: registerUser.email,
          password: "no",
          username: registerUser.username,
          fullname: registerUser.fullname,
        }
      });
      expect(bodyResult.status).toBe(400);
      expect(bodyResult.message).toBe("Validation Error");
      expect(bodyResult.data).toEqual({
        on: "body",
        summary: expect.any(Array),
      });
    });
    it("should response 409 (Conflict) when email is already taken", async () => {
      const { bodyResult } = await route.req("registerController", {
        body: {
          email: loginUser.email,
          password: registerUser.password,
          username: registerUser.username,
          fullname: registerUser.fullname,
        }
      });
      expect(bodyResult.status).toBe(409);
      expect(bodyResult.message).toBe("Email Already Taken");
      expect(bodyResult.data).toBeNull();
    });
  });
  describe("POST /v1/auth/refresh-token", () => {
    it("should response 200 (OK) and return the access token", async () => {
      const { bodyResult } = await route.req("refreshAcessTokenController", {
        body: {
          token: await createRefreshToken(loginUser.id)
        }
      });
      expect(bodyResult.status).toBe(200);
      expect(bodyResult.message).toBe("Sucess generate acess token");
      expect(bodyResult.data).toEqual({
        expiration: expect.stringMatching(ISOStringRegex),
        token: expect.stringMatching(JWTTokenRegex),
      });
      if (bodyResult.message === "Sucess generate acess token") {
        const data = await tokenDetail(bodyResult.data.token);
        expect(data).toBeTruthy();
        expect(data).toEqual({
          sub: loginUser.id,
          iat: expect.any(Number),
          type: TokenTypes.Access
        });
      }
    });
  });
});
